#!/usr/bin/env python3
"""Export the server pack with Pakku and copy it into modpackbuilds/server/.

Uses Pakku's normal `pakku export` command. The serverpack profile writes a
zip containing the server-side mod jars, server overrides, and manual
overrides. Only the serverpack output is copied to the build directory.
"""

from __future__ import annotations

import argparse
import shutil
import sys
import zipfile
from pathlib import Path

from common import (
    BUILD_ROOT,
    OUTPUT_ROOT,
    PAKKU_JAR,
    REPO_ROOT,
    find_java,
    output_name,
    pakku_java_command,
    run,
    sync_external_mods,
)


def newest_server_zip() -> Path | None:
    folder = BUILD_ROOT / "serverpack"
    if not folder.is_dir():
        return None
    zips = sorted(folder.glob("*.zip"), key=lambda p: p.stat().st_mtime, reverse=True)
    return zips[0] if zips else None


def inspect_server_zip(path: Path) -> tuple[int, list[str]]:
    with zipfile.ZipFile(path) as zf:
        names = zf.namelist()
    mods = [n for n in names if n.startswith("mods/") and n.lower().endswith(".jar")]
    return len(mods), mods


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--java", default=None, help="Java executable (default: JAVA/JAVA_HOME/PATH)")
    parser.add_argument("--output", default=None, type=Path,
                        help="Output zip path (default: modpackbuilds/server/<pack>.zip)")
    parser.add_argument("--clean-build", action="store_true",
                        help="Remove Pakku's build/curseforge, build/modrinth, "
                             "and build/serverpack after copying the server zip")
    args = parser.parse_args()

    if not PAKKU_JAR.is_file():
        print(f"Missing {PAKKU_JAR}", file=sys.stderr)
        return 2
    if not (REPO_ROOT / "pakku-lock.json").is_file():
        print(f"Missing {REPO_ROOT / 'pakku-lock.json'}", file=sys.stderr)
        return 2

    java = args.java or find_java()
    print(f"Using Java: {java}")

    # The server pack needs real jars. Download external mods into Pakku's
    # gitignored override cache; stale jars are removed so external-mods.json
    # is the source of truth.
    external = sync_external_mods()
    print(f"External mods: {len(external)}")

    # Pakku export writes build/{curseforge,modrinth,serverpack}/...
    # The other profiles are harmless; this script only consumes serverpack.
    code = run(pakku_java_command(java, "-y", "export"), REPO_ROOT)
    server_zip = newest_server_zip()

    if server_zip is None:
        print("Pakku did not create a serverpack zip.", file=sys.stderr)
        if code != 0:
            print(f"pakku export exited with {code}.", file=sys.stderr)
        return code or 1

    if code != 0:
        print(f"Warning: pakku export exited with {code}, but a serverpack zip exists.",
              file=sys.stderr)

    output = args.output
    if output is None:
        output = OUTPUT_ROOT / "server" / output_name()
    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(server_zip, output)

    mod_count, mod_names = inspect_server_zip(output)
    print()
    print(f"Server zip: {output}")
    print(f"Source:     {server_zip}")
    print(f"Server mod jars: {mod_count}")
    if mod_count == 0:
        print("Warning: the server zip does not contain any mods/*.jar files.",
              file=sys.stderr)
    for name in mod_names[:8]:
        print(f"  {name}")
    if len(mod_names) > 8:
        print(f"  ... and {len(mod_names) - 8} more")

    override = [n for n in mod_names if "thaumaturge" in n.lower()]
    if override:
        print(f"Manual override included: {override[0]}")
    else:
        print("Warning: thaumaturge override jar was not found in the server zip.",
              file=sys.stderr)

    if args.clean_build:
        for folder in ("curseforge", "modrinth", "serverpack"):
            shutil.rmtree(BUILD_ROOT / folder, ignore_errors=True)
        print("Removed Pakku build/ profile outputs.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
