#!/usr/bin/env python3
"""Pakku -> packwiz conversion helpers for the distribution build scripts.

Development-side only. End users never run this; they only run
packwiz-installer.jar.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from typing import Iterable

PACK_FORMAT = "packwiz:1.1.0"
PROJECT_DIRS = {
    "MOD": "mods",
    "RESOURCE_PACK": "resourcepacks",
    "SHADER_PACK": "shaderpacks",
    "DATAPACK": "datapacks",
}
ASSET_CATEGORIES = {"mods", "resourcepacks", "shaderpacks", "datapacks"}


def toml_string(value: object) -> str:
    return json.dumps(str(value), ensure_ascii=False)


def read_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def sha1_file(path: Path) -> str:
    h = hashlib.sha1()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def glob_to_regex(pattern: str) -> re.Pattern[str]:
    out: list[str] = []
    i = 0
    while i < len(pattern):
        c = pattern[i]
        if c == "*":
            if i + 1 < len(pattern) and pattern[i + 1] == "*":
                out.append(".*")
                i += 2
                while i < len(pattern) and pattern[i] == "*":
                    i += 1
                continue
            out.append("[^/]*")
            i += 1
        elif c == "?":
            out.append("[^/]")
            i += 1
        elif c == "{":
            end = pattern.find("}", i + 1)
            if end == -1:
                out.append(re.escape(c))
                i += 1
            else:
                parts = pattern[i + 1:end].split(",")
                out.append("(?:" + "|".join(re.escape(p) for p in parts) + ")")
                i = end + 1
        else:
            out.append(re.escape(c))
            i += 1
    return re.compile("^" + "".join(out) + "$")


def pattern_matches(pattern: str, path: str) -> bool:
    p = pattern.strip()
    if not p:
        return False
    if p.startswith("!"):
        p = p[1:]
    p = p.removeprefix("./").rstrip("/")
    if not p:
        return False
    if not any(ch in p for ch in "*?{"):
        return path == p or path.startswith(p + "/")
    return bool(glob_to_regex(p).match(path))


def apply_patterns(paths: Iterable[str], patterns: list[str]) -> list[str]:
    selected: list[str] = []
    for path in paths:
        included = False
        for pattern in patterns:
            if pattern_matches(pattern, path):
                included = not pattern.lstrip().startswith("!")
        if included:
            selected.append(path)
    return selected


def git_tracked_files(minecraft_dir: Path) -> list[str] | None:
    try:
        raw = subprocess.check_output(
            ["git", "-C", str(minecraft_dir), "ls-files", "-z"],
            stderr=subprocess.DEVNULL,
        )
    except (OSError, subprocess.CalledProcessError):
        return None
    return [p for p in raw.decode("utf-8", "replace").split("\0") if p]


def fallback_tracked_files(minecraft_dir: Path) -> list[str]:
    result: list[str] = []
    for root, dirs, files in os.walk(minecraft_dir):
        rel_root = Path(root).relative_to(minecraft_dir)
        dirs[:] = [
            d for d in dirs
            if d not in {".git", ".gradle", ".idea", "build", "logs",
                         "saves", "backups", "modpackbuilds"}
        ]
        for name in files:
            result.append((rel_root / name).as_posix())
    return result


def choose_file(project: dict) -> dict | None:
    """Prefer Modrinth, then CurseForge, then whatever is present."""
    files = project.get("files") or []
    if not files:
        return None
    for provider in ("modrinth", "curseforge"):
        for file in files:
            if file.get("type") == provider:
                return file
    return files[0]


def project_metadata(
    project: dict,
    force_client_all: bool = False,
) -> tuple[str, str, str, dict] | None:
    category = PROJECT_DIRS.get(project.get("type", ""))
    if category is None:
        return None

    file = choose_file(project)
    if file is None:
        return None

    filename = file.get("file_name")
    if not filename:
        return None

    slug = (
        project.get("slug", {}).get("modrinth")
        or project.get("slug", {}).get("curseforge")
        or project.get("pakku_id")
        or Path(filename).stem
    )
    safe_slug = re.sub(r"[^A-Za-z0-9._-]+", "-", str(slug)).strip("-").lower() or "project"

    side = "both"
    if category in {"resourcepacks", "shaderpacks"}:
        side = "client"
    elif not force_client_all:
        if project.get("side") == "CLIENT":
            side = "client"
        elif project.get("side") == "SERVER":
            side = "server"

    update_table = ""
    file_type = file.get("type")
    if file_type == "modrinth":
        project_id = file.get("parent_id") or project.get("id", {}).get("modrinth")
        version_id = file.get("id")
        if project_id and version_id:
            update_table = (
                "\n[update]\n"
                "[update.modrinth]\n"
                f"mod-id = {toml_string(project_id)}\n"
                f"version = {toml_string(version_id)}\n"
            )
    elif file_type == "curseforge":
        project_id = file.get("parent_id") or project.get("id", {}).get("curseforge")
        file_id = file.get("id")
        if project_id and file_id:
            update_table = (
                "\n[update]\n"
                "[update.curseforge]\n"
                f"project-id = {int(project_id)}\n"
                f"file-id = {int(file_id)}\n"
            )

    hashes = file.get("hashes") or {}
    hash_format = None
    hash_value = None
    # Prefer the stronger Modrinth hash when it is available.
    for candidate in ("sha512", "sha1", "sha256", "md5"):
        if candidate in hashes:
            hash_format = candidate
            hash_value = hashes[candidate]
            break
    if not hash_format or not hash_value:
        return None

    name = (
        project.get("name", {}).get("modrinth")
        or project.get("name", {}).get("curseforge")
        or slug
    )
    text = (
        f"name = {toml_string(name)}\n"
        f"filename = {toml_string(filename)}\n"
        f"side = {toml_string(side)}\n"
        "\n[download]\n"
        f"url = {toml_string(file.get('url', ''))}\n"
        f"hash-format = {toml_string(hash_format)}\n"
        f"hash = {toml_string(hash_value)}\n"
        f"{update_table}"
    )
    summary = {
        "slug": slug,
        "category": category,
        "filename": filename,
        "provider": file_type,
        "size": int(file.get("size") or 0),
        "hash_format": hash_format,
    }
    return category, safe_slug, text, summary


def copy_tracked_overrides(
    minecraft_dir: Path,
    out_dir: Path,
    pakku_config: dict,
    tracked: list[str],
    summary: dict,
) -> None:
    patterns = list(pakku_config.get("overrides", []))
    if not patterns:
        return

    selected = apply_patterns(tracked, patterns)
    copied = 0
    copied_bytes = 0
    for rel in selected:
        src = minecraft_dir / rel
        if not src.is_file():
            continue
        dst = out_dir / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
        copied += 1
        copied_bytes += src.stat().st_size
    summary["override_files"] = copied
    summary["override_bytes"] = copied_bytes


def _raw_url(base: str, rel: Path) -> str:
    import urllib.parse
    return base.rstrip("/") + "/" + urllib.parse.quote(rel.as_posix(), safe="/")


def add_manual_overrides(
    minecraft_dir: Path,
    out_dir: Path,
    embed: bool,
    include_server: bool,
    raw_base: str,
    limit: int | None,
    summary: dict,
    skip_categories: set[str] | None = None,
) -> None:
    """Copy or URL-link .pakku manual overrides.

    embed=True is used for the no-server client build: the actual files are
    placed in the pack so packwiz-installer can copy them locally.
    embed=False keeps them in the source repo and creates URL metadata.
    """
    roots: list[tuple[Path, str]] = [
        (minecraft_dir / ".pakku" / "overrides", "both"),
        (minecraft_dir / ".pakku" / "client-overrides", "client"),
    ]
    if include_server:
        roots.append((minecraft_dir / ".pakku" / "server-overrides", "server"))

    candidates: list[tuple[Path, str]] = []
    for root, default_side in roots:
        if not root.is_dir():
            continue
        for path in root.rglob("*"):
            if path.is_file():
                candidates.append((path, default_side))
    candidates.sort(key=lambda item: (item[0].stat().st_size, item[0].as_posix()))
    if limit is not None:
        candidates = candidates[:limit]

    entries: list[dict] = []
    used_names: set[tuple[str, str]] = set()
    for path, default_side in candidates:
        rel = path.relative_to(minecraft_dir)
        parts = rel.parts
        if len(parts) < 4 or parts[0] != ".pakku":
            continue
        kind, category = parts[1], parts[2]
        if skip_categories and category in skip_categories:
            continue
        if category not in ASSET_CATEGORIES:
            # .pakku/overrides mirrors the game directory.
            dst = out_dir / Path(*parts[2:])
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, dst)
            continue

        side = default_side
        if category in {"resourcepacks", "shaderpacks"}:
            side = "client"

        if embed:
            dst = out_dir / category / Path(*parts[3:])
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, dst)
            entries.append({
                "file": rel.as_posix(),
                "category": category,
                "mode": "embedded",
                "size": path.stat().st_size,
            })
            continue

        stem = re.sub(r"[^A-Za-z0-9._-]+", "-", path.stem).strip("-").lower() or "file"
        meta_name = stem
        key = (category, meta_name)
        if key in used_names:
            meta_name = f"{stem}-{len(used_names)}"
        used_names.add(key)

        url = _raw_url(raw_base, rel)
        text = (
            f"name = {toml_string(path.stem)}\n"
            f"filename = {toml_string(path.name)}\n"
            f"side = {toml_string(side)}\n"
            "\n[download]\n"
            f"url = {toml_string(url)}\n"
            'hash-format = "sha1"\n'
            f"hash = {toml_string(sha1_file(path))}\n"
        )
        meta_path = out_dir / category / f"{meta_name}.pw.toml"
        meta_path.parent.mkdir(parents=True, exist_ok=True)
        meta_path.write_text(text, encoding="utf-8")
        entries.append({
            "file": rel.as_posix(),
            "category": category,
            "mode": "url",
            "size": path.stat().st_size,
            "url": url,
        })

    summary["manual_overrides"] = entries


def add_external_mods(out_dir: Path, external_mods: list[dict]) -> list[dict]:
    """Write packwiz URL-mode metadata for external mods.

    The mod jars are not copied into the pack. packwiz-installer downloads
    each one directly from its URL and verifies the supplied hash.
    """
    entries: list[dict] = []
    used: set[str] = set()
    for mod in external_mods:
        filename = mod.get("filename")
        url = mod.get("url")
        category = mod.get("category", "mods")
        hash_format = mod.get("hash-format", "sha1")
        hash_value = mod.get("hash")

        if not filename or not url:
            raise ValueError("External mod entries need 'filename' and 'url'")
        if category not in ASSET_CATEGORIES:
            raise ValueError(f"Unsupported external mod category: {category}")
        if not str(url).startswith(("https://", "http://")):
            raise ValueError(f"External mod URL must be http(s): {url}")
        if not hash_value:
            raise ValueError(
                f"External mod {filename} needs a 'hash' "
                f"(usually its {hash_format} digest)"
            )

        filename = Path(filename).name
        stem = re.sub(r"[^A-Za-z0-9._-]+", "-", Path(filename).stem).strip("-").lower()
        meta_name = "external-" + (stem or "mod")
        if meta_name in used:
            meta_name = f"{meta_name}-{len(used)}"
        used.add(meta_name)

        side = mod.get("side", "both")
        name = mod.get("name") or Path(filename).stem
        text = (
            f"name = {toml_string(name)}\n"
            f"filename = {toml_string(filename)}\n"
            f"side = {toml_string(side)}\n"
            "\n[download]\n"
            f"url = {toml_string(url)}\n"
            f"hash-format = {toml_string(hash_format)}\n"
            f"hash = {toml_string(hash_value)}\n"
        )
        meta_path = out_dir / category / f"{meta_name}.pw.toml"
        meta_path.parent.mkdir(parents=True, exist_ok=True)
        meta_path.write_text(text, encoding="utf-8")
        entries.append({
            "name": name,
            "filename": filename,
            "url": url,
            "category": category,
            "side": side,
            "hash-format": hash_format,
            "hash": hash_value,
        })
    return entries


def write_pack_toml(
    out_dir: Path,
    pakku_lock: dict,
    pakku_config: dict,
    pack_name: str,
    pack_author: str,
    pack_version: str,
) -> None:
    versions = {"minecraft": (pakku_lock.get("mc_versions") or ["1.21.1"])[0]}
    for loader, version in (pakku_lock.get("loaders") or {}).items():
        versions[loader] = version

    lines = [
        f"name = {toml_string(pack_name)}",
        f"author = {toml_string(pack_author)}",
        f"version = {toml_string(pack_version)}",
        f'pack-format = {toml_string(PACK_FORMAT)}',
        "",
        "[index]",
        'file = "index.toml"',
        'hash-format = "sha256"',
        'hash = ""',
        "",
        "[versions]",
    ]
    for key, value in versions.items():
        lines.append(f"{key} = {toml_string(value)}")
    lines.append("")
    (out_dir / "pack.toml").write_text("\n".join(lines), encoding="utf-8")


def generate_index(out_dir: Path) -> int:
    """Write index.toml and the pack.toml index hash without packwiz."""
    entries: list[tuple[str, Path]] = []
    for path in sorted(out_dir.rglob("*")):
        if not path.is_file():
            continue
        if path.name in {"pack.toml", "index.toml"}:
            continue
        entries.append((path.relative_to(out_dir).as_posix(), path))

    lines = ['hash-format = "sha256"', ""]
    for rel, path in entries:
        lines.append("[[files]]")
        lines.append(f"file = {toml_string(rel)}")
        lines.append(f"hash = {toml_string(sha256_file(path))}")
        if path.name.endswith(".pw.toml"):
            lines.append("metafile = true")
        lines.append("")
    index_bytes = "\n".join(lines).encode("utf-8")
    (out_dir / "index.toml").write_bytes(index_bytes)

    index_hash = hashlib.sha256(index_bytes).hexdigest()
    pack_path = out_dir / "pack.toml"
    pack_text = pack_path.read_text(encoding="utf-8")
    pack_text = re.sub(r'(?m)^hash = ""$', f'hash = "{index_hash}"', pack_text, count=1)
    pack_path.write_text(pack_text, encoding="utf-8")
    return len(entries)


def build_pack(
    minecraft_dir: Path,
    out_dir: Path,
    *,
    embed_overrides: bool = True,
    include_server_overrides: bool = False,
    raw_base: str = "",
    smoke_projects: int | None = None,
    smoke_overrides: int | None = None,
    pack_name: str | None = None,
    pack_author: str | None = None,
    pack_version: str | None = None,
    force_client_all: bool = True,
    external_mods_path: Path | None = None,
    skip_manual_categories: set[str] | None = None,
) -> dict:
    minecraft_dir = minecraft_dir.resolve()
    out_dir = out_dir.resolve()
    if not (minecraft_dir / "pakku-lock.json").is_file():
        raise FileNotFoundError(f"No pakku-lock.json in {minecraft_dir}")
    if not (minecraft_dir / "pakku.json").is_file():
        raise FileNotFoundError(f"No pakku.json in {minecraft_dir}")
    if out_dir == minecraft_dir or out_dir == minecraft_dir.parent:
        raise ValueError("Refusing to use the Minecraft directory as output")

    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    pakku_lock = read_json(minecraft_dir / "pakku-lock.json")
    pakku_config = read_json(minecraft_dir / "pakku.json")

    name = pack_name or pakku_config.get("name") or "Angelpack"
    author = pack_author or pakku_config.get("author") or ""
    version = pack_version or pakku_config.get("version") or "DEV"
    write_pack_toml(out_dir, pakku_lock, pakku_config, name, author, version)

    projects = list(pakku_lock.get("projects") or [])
    if smoke_projects is not None:
        projects = projects[:smoke_projects]

    summary: dict = {
        "pack": {
            "name": name,
            "author": author,
            "version": version,
            "minecraft": pakku_lock.get("mc_versions"),
            "loaders": pakku_lock.get("loaders"),
            "embed_overrides": embed_overrides,
            "force_client_all": force_client_all,
            "smoke_projects": smoke_projects,
            "smoke_overrides": smoke_overrides,
        },
        "projects": [],
        "skipped_projects": [],
        "external_mods": [],
    }

    used_meta: set[tuple[str, str]] = set()
    for project in projects:
        if project.get("export") is False:
            summary["skipped_projects"].append({
                "slug": project.get("slug"),
                "reason": "export=false",
            })
            continue
        meta = project_metadata(project, force_client_all=force_client_all)
        if meta is None:
            summary["skipped_projects"].append({
                "slug": project.get("slug"),
                "reason": "unsupported type/file/hash",
            })
            continue
        category, safe_slug, text, project_summary = meta
        meta_name = safe_slug
        if (category, meta_name) in used_meta:
            meta_name = f"{safe_slug}-{str(project.get('pakku_id', len(used_meta)))[:8]}"
        used_meta.add((category, meta_name))
        meta_path = out_dir / category / f"{meta_name}.pw.toml"
        meta_path.parent.mkdir(parents=True, exist_ok=True)
        meta_path.write_text(text, encoding="utf-8")
        summary["projects"].append(project_summary)

    tracked = git_tracked_files(minecraft_dir)
    if tracked is None:
        tracked = fallback_tracked_files(minecraft_dir)
    copy_tracked_overrides(minecraft_dir, out_dir, pakku_config, tracked, summary)

    add_manual_overrides(
        minecraft_dir,
        out_dir,
        embed_overrides,
        include_server_overrides,
        raw_base,
        smoke_overrides,
        summary,
        skip_categories=skip_manual_categories,
    )

    if external_mods_path and Path(external_mods_path).is_file():
        external_data = read_json(Path(external_mods_path))
        external_mods = external_data.get("mods", [])
        summary["external_mods"] = add_external_mods(out_dir, external_mods)

    summary["index_entries"] = generate_index(out_dir)
    summary["pack_bytes"] = sum(
        p.stat().st_size for p in out_dir.rglob("*") if p.is_file()
    )
    summary["project_download_bytes"] = sum(p["size"] for p in summary["projects"])
    summary["manual_override_bytes"] = sum(
        e["size"] for e in summary["manual_overrides"]
    )
    summary["external_mod_count"] = len(summary["external_mods"])
    return summary
