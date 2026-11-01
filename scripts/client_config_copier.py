#!/usr/bin/env python3
"""Copy modified client config from the instance root into configureddefaults.

PrismLauncher layers `configureddefaults/` over a fresh instance, so that
folder must mirror any locally changed client config. This script walks the
defaults folder and compares each file with the same relative path in the
instance root:

    configureddefaults/config/ftbchunks-client.snbt
    config/ftbchunks-client.snbt

Files that exist in both places but differ are backed up under
`scripts/client_config_copier_backup/<timestamp>/` and then replaced with the
root version. Every replaced file, and every default that has no root
counterpart, is printed to the terminal and appended to
`scripts/client_config_copier_backup/copier.log`.

Usage (from the repository root, `.minecraft`):

    python scripts/client_config_copier.py
    python scripts/client_config_copier.py --dry-run
"""

from __future__ import annotations

import argparse
import hashlib
import shutil
import sys
from datetime import datetime
from pathlib import Path

from common import REPO_ROOT

DEFAULTS_ROOT = REPO_ROOT / "configureddefaults"
BACKUP_ROOT = Path(__file__).resolve().parent / "client_config_copier_backup"
LOG_FILENAME = "copier.log"


def display(path: Path) -> str:
    """Prefer a path relative to the current directory in log output."""
    try:
        return path.relative_to(Path.cwd()).as_posix()
    except ValueError:
        return str(path)


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def files_differ(a: Path, b: Path) -> bool:
    if a.stat().st_size != b.stat().st_size:
        return True
    return file_hash(a) != file_hash(b)


def iter_files(root: Path) -> list[Path]:
    return sorted(path for path in root.rglob("*") if path.is_file())


def backup_file(source: Path, relative: Path, backup_root: Path) -> Path:
    dest = backup_root / relative
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, dest)
    return dest


def replace_file(source: Path, dest: Path) -> None:
    # Copy next to the target, then rename, so an interrupted run cannot leave
    # a half-written default behind.
    tmp = dest.with_name(dest.name + ".tmp")
    shutil.copy2(source, tmp)
    tmp.replace(dest)


def append_log(log_path: Path, stamp: str, lines: list[str]) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("a", encoding="utf-8") as f:
        f.write(f"== {stamp} ==\n")
        for line in lines:
            f.write(line + "\n")
        f.write("\n")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=REPO_ROOT,
        help="instance root to copy from (default: %(default)s)",
    )
    parser.add_argument(
        "--defaults",
        type=Path,
        default=DEFAULTS_ROOT,
        help="folder to scan and update (default: %(default)s)",
    )
    parser.add_argument(
        "--backup",
        type=Path,
        default=BACKUP_ROOT,
        help="folder for replaced files and the log (default: %(default)s)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="list the files that would be copied without changing anything",
    )
    args = parser.parse_args(argv)

    root = args.root.resolve()
    defaults = args.defaults.resolve()
    backup_root = args.backup.resolve()

    if not defaults.is_dir():
        print(f"error: defaults folder not found: {defaults}", file=sys.stderr)
        return 1
    if not root.is_dir():
        print(f"error: instance root not found: {root}", file=sys.stderr)
        return 1

    stamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    run_backup = backup_root / stamp
    log_lines: list[str] = []
    copied = 0
    unchanged = 0
    missing = 0
    errors = 0

    for default_path in iter_files(defaults):
        relative = default_path.relative_to(defaults)
        root_path = root / relative
        label = relative.as_posix()

        if not root_path.is_file():
            missing += 1
            line = f"missing in root: {label}"
            print(line)
            log_lines.append(line)
            continue
        if not files_differ(root_path, default_path):
            unchanged += 1
            continue

        if args.dry_run:
            print(f"[dry-run] would copy {label}")
            copied += 1
            continue

        try:
            backup_path = backup_file(default_path, relative, run_backup)
            replace_file(root_path, default_path)
        except OSError as exc:
            print(f"error: could not replace {label}: {exc}", file=sys.stderr)
            errors += 1
            continue

        copied += 1
        line = f"copied {label}"
        backup_line = f"  backup: {display(backup_path)}"
        print(line)
        print(backup_line)
        log_lines.extend((line, backup_line))

    verb = "would copy" if args.dry_run else "copied"
    summary = (
        f"{verb} {copied} file(s); {unchanged} unchanged; "
        f"{missing} missing in root; {errors} error(s)."
    )
    print(summary)

    if log_lines and not args.dry_run:
        log_lines.append(summary)
        append_log(backup_root / LOG_FILENAME, stamp, log_lines)
        if copied:
            print(f"backups: {display(run_backup)}")
        print(f"log: {display(backup_root / LOG_FILENAME)}")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
