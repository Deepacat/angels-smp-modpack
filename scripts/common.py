#!/usr/bin/env python3
"""Shared helpers for the distribution build scripts."""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
INSTANCE_ROOT = REPO_ROOT.parent
BUILD_ROOT = REPO_ROOT / "build"
OUTPUT_ROOT = REPO_ROOT / "modpackbuilds"
PAKKU_JAR = REPO_ROOT / "pakku.jar"
INSTALLER_JAR = REPO_ROOT / "scripts" / "vendor" / "packwiz-installer.jar"
BOOTSTRAP_JAR = REPO_ROOT / "scripts" / "vendor" / "packwiz-installer-bootstrap.jar"
PRISM_MMC_PACK = REPO_ROOT / ".pakku" / "prism-overrides" / "mmc-pack.json"
EXTERNAL_MODS_FILE = REPO_ROOT / "external-mods.json"
EXTERNAL_MODS_CACHE = REPO_ROOT / ".pakku" / "overrides" / "mods"

# The pack itself is generated, so it is not committed to the dev branch.
# upload_packwiz_branch.py publishes it to this separate, permanent generated branch.
PACK_REPO = "Deepacat/angels-smp-modpack"
PACK_REMOTE = f"https://github.com/{PACK_REPO}.git"
PACK_BRANCH = "packwiz-pack"


def pack_url(branch: str = PACK_BRANCH) -> str:
    return (
        f"https://raw.githubusercontent.com/{PACK_REPO}/"
        f"{branch}/pack.toml"
    )


DEFAULT_PACK_URL = pack_url()


def load_external_mods() -> list[dict]:
    if not EXTERNAL_MODS_FILE.is_file():
        return []
    data = read_json(EXTERNAL_MODS_FILE)
    mods = data.get("mods", [])
    for mod in mods:
        if not mod.get("filename") or not mod.get("url") or not mod.get("hash"):
            raise ValueError(
                "Every external-mods.json entry needs filename, url, and hash"
            )
    return mods


def hash_file(path: Path, hash_format: str) -> str:
    digest = hashlib.new(hash_format)
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sync_external_mods() -> list[dict]:
    """Download external-mods.json jars into Pakku's override cache.

    The server export needs real jars in .pakku/overrides/mods. The cache is
    gitignored; stale jars are removed so the file is the source of truth.
    """
    # A missing file means "no external mods configured"; do not clear the
    # cache in that case. An existing file with an empty list is intentional
    # and should remove stale cached jars.
    if not EXTERNAL_MODS_FILE.is_file():
        return []

    mods = load_external_mods()
    EXTERNAL_MODS_CACHE.mkdir(parents=True, exist_ok=True)
    wanted: set[str] = set()
    for mod in mods:
        filename = Path(mod["filename"]).name
        wanted.add(filename)
        dest = EXTERNAL_MODS_CACHE / filename
        hash_format = mod.get("hash-format", "sha1")
        expected = str(mod["hash"]).lower()

        if dest.is_file() and hash_file(dest, hash_format).lower() == expected:
            print(f"External mod cached: {filename}")
            continue

        print(f"Downloading external mod: {mod['url']}")
        tmp = dest.with_suffix(dest.suffix + ".part")
        request = urllib.request.Request(
            mod["url"], headers={"User-Agent": "Angelpack build script"}
        )
        with urllib.request.urlopen(request) as response, tmp.open("wb") as f:
            shutil.copyfileobj(response, f)
        actual = hash_file(tmp, hash_format).lower()
        if actual != expected:
            tmp.unlink(missing_ok=True)
            raise RuntimeError(
                f"Hash mismatch for {filename}: expected {expected}, got {actual}"
            )
        os.replace(tmp, dest)
        print(f"External mod downloaded: {dest}")

    for path in EXTERNAL_MODS_CACHE.iterdir():
        if (
            path.is_file()
            and path.suffix.lower() in {".jar", ".zip"}
            and path.name not in wanted
        ):
            path.unlink()
            print(f"Removed stale external mod: {path.name}")

    return mods


def read_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def pack_info() -> tuple[str, str]:
    config = read_json(REPO_ROOT / "pakku.json")
    name = str(config.get("name") or "Angelpack")
    version = str(config.get("version") or "DEV")
    return name, version


def safe_filename(value: str) -> str:
    result = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-")
    return result or "pack"


def output_name() -> str:
    name, version = pack_info()
    return f"{safe_filename(name)}-{safe_filename(version)}.zip"


def find_java() -> str:
    java_home = os.environ.get("JAVA_HOME")
    for candidate in (
        os.environ.get("JAVA"),
        str(Path(java_home) / "bin" / "java") if java_home else None,
        str(Path(java_home) / "bin" / "java.exe") if java_home else None,
        shutil.which("java"),
        shutil.which("java.exe"),
    ):
        if candidate:
            path = Path(candidate)
            if path.is_file():
                return str(path)
    raise RuntimeError("Java not found. Set JAVA or JAVA_HOME, or add java to PATH.")


def java_major(java: str) -> int:
    proc = subprocess.run(
        [java, "-version"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        errors="replace",
    )
    match = re.search(r'version "(\d+)(?:\.(\d+))?', proc.stdout)
    if not match:
        return 0
    major = int(match.group(1))
    if major == 1 and match.group(2):
        return int(match.group(2))
    return major


def pakku_java_command(java: str, *args: str) -> list[str]:
    cmd = [java]
    # --enable-native-access was added long after Java 8. Only pass it to
    # JVMs that understand it.
    if java_major(java) >= 24:
        cmd.append("--enable-native-access=ALL-UNNAMED")
    cmd.extend(["-jar", str(PAKKU_JAR), *args])
    return cmd


def run(cmd: list[str], cwd: Path) -> int:
    print("+ " + " ".join(str(part) for part in cmd), flush=True)
    return subprocess.run(cmd, cwd=cwd).returncode
