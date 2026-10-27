#!/usr/bin/env python3
"""Set up this repository as a playable development instance.

Steps:
  1. Download external mods from external-mods.json into the gitignored
     .pakku/overrides/mods/ cache (hash-verified, stale entries removed).
  2. Copy the external mods into mods/.
  3. Run Pakku's normal `pakku fetch` to install platform mods, sync tracked
     overrides/configs, and remove files that are no longer in the pack.
  4. Re-check/copy the external mods into mods/.

The result is a normal Prism instance that can be launched directly, while
the Git repo remains the source of truth.
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from common import (
    EXTERNAL_MODS_CACHE,
    REPO_ROOT,
    find_java,
    hash_file,
    load_external_mods,
    pakku_java_command,
    run,
    sync_external_mods,
)


def install_external_to_game(mods: list[dict]) -> int:
    if not mods:
        return 0
    installed = 0
    for mod in mods:
        filename = Path(mod["filename"]).name
        src = EXTERNAL_MODS_CACHE / filename
        dst = REPO_ROOT / "mods" / filename
        if not src.is_file():
            raise FileNotFoundError(f"External mod not found in cache: {src}")
        dst.parent.mkdir(parents=True, exist_ok=True)

        hash_format = mod.get("hash-format", "sha1")
        expected = str(mod["hash"]).lower()
        if dst.is_file() and hash_file(dst, hash_format).lower() == expected:
            continue
        shutil.copyfile(src, dst)
        print(f"Installed external mod into game: {dst}")
        installed += 1
    return installed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--java", default=None,
                        help="Java executable (default: JAVA/JAVA_HOME/PATH)")
    parser.add_argument("--skip-fetch", action="store_true",
                        help="Only sync external mods; do not run pakku fetch")
    args = parser.parse_args()

    external = load_external_mods()
    print(f"External mods declared: {len(external)}")

    # Download/verify into Pakku's manual-override cache. This also removes
    # cached jars that are no longer listed in external-mods.json.
    synced = sync_external_mods()

    # Copy them into the game folder before fetch. Pakku treats them as manual
    # overrides, so fetch will not delete them.
    install_external_to_game(synced)

    if not args.skip_fetch:
        java = args.java or find_java()
        print(f"Using Java: {java}")
        code = run(pakku_java_command(java, "-y", "fetch", "-r", "3"), REPO_ROOT)
        if code != 0:
            print(f"pakku fetch exited with {code}.", file=sys.stderr)
            return code

        # Pakku normally syncs manual overrides itself. Do a final check in
        # case a previous partial fetch left one out of mods/.
        install_external_to_game(synced)

    print()
    print("Development instance is ready.")
    print(f"  Repo:    {REPO_ROOT}")
    print(f"  Mods:    {REPO_ROOT / 'mods'}")
    print(f"  Cache:   {EXTERNAL_MODS_CACHE}")
    print("Launch the instance from Prism. No jars are tracked by Git.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
