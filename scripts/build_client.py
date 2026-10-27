#!/usr/bin/env python3
"""Build a Prism-importable client instance zip that runs packwiz-installer.

Default (hosted) output:
  modpackbuilds/client/Angelpack-DEV.zip
  modpackbuilds/client/pack/            # upload this folder to your pack host

The hosted instance zip contains only:
  instance.cfg
  mmc-pack.json
  .minecraft/packwiz-installer-bootstrap.jar
  .minecraft/packwiz-installer.jar

The pre-launch command is:
  "$INST_JAVA" -jar packwiz-installer-bootstrap.jar <pack-url>

This matches the Hexxytest setup: the bootstrap opens its GUI, updates the
installer if needed, and installs from the hosted pack.toml. No local
packwiz-pack folder is shipped.

Use --local-pack for an offline/self-contained test build (the old behavior).
"""

from __future__ import annotations

import argparse
import shutil
import sys
import zipfile
from pathlib import Path

from common import (
    BOOTSTRAP_JAR,
    BUILD_ROOT,
    DEFAULT_PACK_URL,
    INSTALLER_JAR,
    OUTPUT_ROOT,
    PRISM_MMC_PACK,
    REPO_ROOT,
    output_name,
    pack_info,
)
from pakku_to_packwiz import build_pack


def ini_quote(value: str) -> str:
    # Prism's instance.cfg stores quoted commands with escaped quotes.
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def write_instance_cfg(path: Path, display_name: str, prelaunch: str) -> None:
    lines = [
        "[General]",
        f"name={display_name}",
        "ConfigVersion=1.3",
        "InstanceType=OneSix",
        "JoinServerOnLaunch=false",
        "LogPrePostOutput=true",
        "OverrideCommands=true",
        "OverrideConsole=false",
        "OverrideEnv=false",
        "OverrideGameTime=false",
        "OverrideJavaArgs=false",
        "OverrideJavaLocation=false",
        "OverrideLegacySettings=false",
        "OverrideMemory=true",
        "OverrideMiscellaneous=false",
        "OverrideNativeWorkarounds=false",
        "OverridePerformance=false",
        "OverrideWindow=false",
        f"PreLaunchCommand={ini_quote(prelaunch)}",
        "PostExitCommand=",
        "UseAccountForInstance=false",
        "WrapperCommand=",
        "MaxMemAlloc=6144",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")


def copy_tree(src: Path, dst: Path) -> None:
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def make_zip(staging: Path, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        output.unlink()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(staging.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(staging).as_posix())


def validate_zip(path: Path, local_pack: bool) -> None:
    required = {
        "instance.cfg",
        "mmc-pack.json",
        ".minecraft/packwiz-installer.jar",
    }
    if local_pack:
        required.add(".minecraft/packwiz-pack/pack.toml")
        required.add(".minecraft/packwiz-pack/index.toml")
    else:
        required.add(".minecraft/packwiz-installer-bootstrap.jar")
    with zipfile.ZipFile(path) as zf:
        names = set(zf.namelist())
        missing = required - names
        if missing:
            raise RuntimeError(f"Client zip is missing: {', '.join(sorted(missing))}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default=None, type=Path,
                        help="Output zip path (default: modpackbuilds/client/<pack>.zip)")
    parser.add_argument("--installer", default=INSTALLER_JAR, type=Path,
                        help="packwiz-installer.jar to bundle")
    parser.add_argument("--bootstrap", default=BOOTSTRAP_JAR, type=Path,
                        help="packwiz-installer-bootstrap.jar to bundle")
    parser.add_argument("--pack-url", default=DEFAULT_PACK_URL,
                        help="Hosted pack.toml URL used by the bootstrap "
                             "(default: %(default)s)")
    parser.add_argument("--local-pack", action="store_true",
                        help="Bundle the pack in the instance and run the "
                             "installer directly (offline test mode)")
    parser.add_argument("--smoke-projects", type=int, default=None,
                        help="Only include the first N projects (for a quick build)")
    parser.add_argument("--smoke-overrides", type=int, default=None,
                        help="Only include the N smallest manual overrides")
    parser.add_argument("--display-name", default=None,
                        help="Prism display name (default: '<pack> <version>')")
    args = parser.parse_args()

    installer = args.installer.resolve()
    bootstrap = args.bootstrap.resolve()
    if not installer.is_file():
        print(f"Missing installer jar: {installer}", file=sys.stderr)
        print("Place packwiz-installer.jar in .minecraft/scripts/vendor/.",
              file=sys.stderr)
        return 2
    if not args.local_pack and not bootstrap.is_file():
        print(f"Missing bootstrap jar: {bootstrap}", file=sys.stderr)
        print("Place packwiz-installer-bootstrap.jar in "
              ".minecraft/scripts/vendor/.", file=sys.stderr)
        return 2
    if not PRISM_MMC_PACK.is_file():
        print(f"Missing Prism loader file: {PRISM_MMC_PACK}", file=sys.stderr)
        print("Copy your mmc-pack.json into .pakku/prism-overrides/ first.",
              file=sys.stderr)
        return 2

    name, version = pack_info()
    display_name = args.display_name or f"{name} {version}".strip()
    pack_url = args.pack_url

    work = BUILD_ROOT / "client"
    pack_dir = work / "pack"
    staging = work / "instance"
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True, exist_ok=True)

    summary = build_pack(
        REPO_ROOT,
        pack_dir,
        embed_overrides=True,
        include_server_overrides=False,
        smoke_projects=args.smoke_projects,
        smoke_overrides=args.smoke_overrides,
        pack_name=name,
        pack_version=version,
        # Match Pakku's export_server_side_projects_to_client behavior: every
        # project except export:false is installed on the client, even if
        # Pakku marked it side=SERVER.
        force_client_all=True,
        # External jars are not copied into the pack. They are generated from
        # external-mods.json as packwiz URL downloads.
        external_mods_path=REPO_ROOT / "external-mods.json",
        skip_manual_categories={"mods"},
    )

    # Always keep a copy of the pack source outside the instance zip so it can
    # be uploaded to a static host (raw GitHub, GitHub Pages, object storage).
    hosted_copy = OUTPUT_ROOT / "client" / "pack"
    copy_tree(pack_dir, hosted_copy)

    print(f"Pack source: {hosted_copy}")
    print(f"Projects: {len(summary['projects'])}")
    print(f"Embedded overrides: {len(summary['manual_overrides'])}")
    print(f"External URL mods: {summary['external_mod_count']}")
    print(f"Index entries: {summary['index_entries']}")
    print(f"Pack size: {summary['pack_bytes'] / 1024 / 1024:.1f} MiB")

    (staging / ".minecraft").mkdir(parents=True, exist_ok=True)
    if args.local_pack:
        prelaunch = (
            '"$INST_JAVA" -cp packwiz-installer.jar '
            "link.infra.packwiz.installer.Main -g -s client "
            "packwiz-pack/pack.toml"
        )
    else:
        # No -g: let the bootstrap open its GUI, like Hexxytest.
        prelaunch = (
            '"$INST_JAVA" -jar packwiz-installer-bootstrap.jar '
            + pack_url
        )

    write_instance_cfg(staging / "instance.cfg", display_name, prelaunch)
    shutil.copyfile(PRISM_MMC_PACK, staging / "mmc-pack.json")
    shutil.copyfile(installer, staging / ".minecraft" / "packwiz-installer.jar")

    if args.local_pack:
        copy_tree(pack_dir, staging / ".minecraft" / "packwiz-pack")
    else:
        shutil.copyfile(
            bootstrap, staging / ".minecraft" / "packwiz-installer-bootstrap.jar"
        )

    output = args.output
    if output is None:
        output = OUTPUT_ROOT / "client" / output_name()
    output = output.resolve()
    make_zip(staging, output)
    validate_zip(output, local_pack=args.local_pack)

    with zipfile.ZipFile(output) as zf:
        names = zf.namelist()
    print()
    print(f"Client zip: {output}")
    print(f"Zip entries: {len(names)}")
    print(f"Zip size: {output.stat().st_size / 1024 / 1024:.1f} MiB")
    print(f"Pre-launch: {prelaunch}")
    if args.local_pack:
        print("Local-pack mode: the first launch installs from "
              ".minecraft/packwiz-pack/.")
    else:
        print(f"Hosted mode: the bootstrap downloads {pack_url}")
        print("Upload the pack source folder above to that URL before "
              "distributing the zip.")
        if pack_url == DEFAULT_PACK_URL:
            print("Using the default URL; publish the pack to the 'packwiz' "
                  "branch or rebuild with --pack-url.")
    print("Import the zip into Prism, then launch the instance.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
