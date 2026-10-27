#!/usr/bin/env python3
"""Publish the generated packwiz pack to a separate Git branch.

The pack is auto-generated, so it is ignored by the dev branch. This script
builds it into modpackbuilds/client/pack/, optionally copies it to the
ignored local packwiz/ folder, and publishes it to:

  branch: packwiz-pack
  URL:    https://raw.githubusercontent.com/Deepacat/angels-smp-modpack/packwiz-pack/pack.toml

The published branch is a fresh one-commit branch, so it contains no dev
history and no large jar history.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import stat
import subprocess
import sys
from pathlib import Path

from common import (
    BUILD_ROOT,
    OUTPUT_ROOT,
    PACK_BRANCH,
    PACK_REMOTE,
    REPO_ROOT,
    pack_url,
)


def run(cmd: list[str], cwd: Path, *, check: bool = True) -> subprocess.CompletedProcess:
    print("+ " + " ".join(cmd))
    return subprocess.run(cmd, cwd=cwd, check=check)


def _make_writable_and_delete(func, target, _exc):
    try:
        os.chmod(target, stat.S_IWRITE)
        func(target)
    except Exception:
        # Try one more time after clearing read-only on the parent.
        os.chmod(Path(target).parent, stat.S_IWRITE | stat.S_IREAD | stat.S_IEXEC)
        func(target)


def force_rmtree(path: Path) -> None:
    if not path.exists():
        return
    if sys.version_info >= (3, 12):
        shutil.rmtree(path, onexc=_make_writable_and_delete)
    else:
        shutil.rmtree(path, onerror=_make_writable_and_delete)


def copy_tree(src: Path, dst: Path) -> None:
    if dst.exists():
        force_rmtree(dst)
    shutil.copytree(src, dst)


def verify_committed_hashes(repo: Path) -> None:
    """Verify the committed blobs match index.toml, not just the worktree."""
    text = (repo / "index.toml").read_text(encoding="utf-8")
    entries: list[tuple[str, str]] = []
    current_file = None
    for line in text.splitlines():
        match_file = re.match(r'^file\s*=\s*(".*")$', line.strip())
        if match_file:
            current_file = json.loads(match_file.group(1))
            continue
        match_hash = re.match(r'^hash\s*=\s*(".*")$', line.strip())
        if match_hash and current_file:
            entries.append((current_file, json.loads(match_hash.group(1))))
            current_file = None

    bad: list[str] = []
    for rel, expected in entries:
        data = subprocess.check_output(
            ["git", "show", f"HEAD:{rel}"], cwd=repo
        )
        actual = hashlib.sha256(data).hexdigest()
        if actual != expected:
            bad.append(rel)
    if bad:
        raise RuntimeError(
            "Committed pack hashes do not match index.toml for "
            f"{len(bad)} file(s), e.g. {bad[:5]}. "
            "Check Git line-ending conversion (core.autocrlf)."
        )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--no-build", action="store_true",
                        help="Use the existing generated pack")
    parser.add_argument("--push", action="store_true",
                        help="Create a fresh pack branch and push it to origin")
    parser.add_argument("--branch", default=PACK_BRANCH,
                        help="Generated pack branch (default: %(default)s)")
    parser.add_argument("--remote", default=PACK_REMOTE,
                        help="Git remote to publish to (default: %(default)s)")
    args = parser.parse_args()
    branch = args.branch
    url = pack_url(branch)
    remote = args.remote

    if not args.no_build:
        code = subprocess.run(
            [sys.executable, "scripts/build_client.py"],
            cwd=REPO_ROOT,
        ).returncode
        if code != 0:
            return code

    src = OUTPUT_ROOT / "client" / "pack"
    if not (src / "pack.toml").is_file():
        print(f"Missing generated pack: {src / 'pack.toml'}", file=sys.stderr)
        print("Run python scripts/build_client.py first.", file=sys.stderr)
        return 2

    # Keep an ignored local copy for packwiz serve / inspection.
    local_copy = REPO_ROOT / "packwiz"
    copy_tree(src, local_copy)
    print(f"Local pack copy: {local_copy}")
    print(f"Client URL: {url}")

    if not args.push:
        print()
        print("Not pushed. To publish the generated pack branch:")
        print("  python scripts/upload_packwiz_branch.py --no-build --push")
        return 0

    print(f"Publishing to {remote} branch {branch}")

    publish_repo = BUILD_ROOT / "publish-pack-repo"
    force_rmtree(publish_repo)
    copy_tree(src, publish_repo)
    # Initialize after copying so we do not delete the new .git directory.
    run(["git", "init", "-b", branch], cwd=publish_repo)
    # The pack index hashes the files as generated on disk. Do not let Git
    # convert CRLF/LF on commit, or every metadata/config hash will mismatch.
    run(["git", "config", "core.autocrlf", "false"], cwd=publish_repo)
    run(["git", "config", "core.safecrlf", "false"], cwd=publish_repo)
    run(["git", "add", "-A"], cwd=publish_repo)
    run([
        "git", "-c", "user.name=Angelpack Build",
        "-c", "user.email=build@localhost",
        "commit", "-m", "Publish packwiz pack",
    ], cwd=publish_repo)
    verify_committed_hashes(publish_repo)
    run(["git", "remote", "add", "origin", remote], cwd=publish_repo)
    run([
        "git", "push", "--force", "origin",
        f"HEAD:refs/heads/{branch}",
    ], cwd=publish_repo)

    print()
    print(f"Published branch: {branch}")
    print(f"Pack URL: {url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
