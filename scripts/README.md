# Build scripts

Run these from the repository root (`.minecraft`):

```bash
python scripts/build_server.py
python scripts/build_client.py
```

External mods are declared in `external-mods.json` at the repo root. The
client build turns each entry into packwiz URL metadata; the server build
downloads the jars into the gitignored Pakku override cache.

Example entry:

```json
{
  "name": "Thaumaturge",
  "filename": "thaumaturge-1.21.1-NeoForge-1.0.6.jar",
  "url": "https://mods.deepa.cat/angel/packmods/thaumaturge-1.21.1-NeoForge-1.0.6.jar",
  "category": "mods",
  "side": "both",
  "hash-format": "sha1",
  "hash": "2b00a5cbe43d33cc1200b3f6d91b81faef88c594"
}
```

## setup_dev.py

Sets up the repo as a playable development instance:

```bash
python scripts/setup_dev.py
```

It downloads/verifies external mods, copies them into both
`.pakku/overrides/mods/` and `mods/`, then runs `pakku -y fetch -r 3`.
It is idempotent and removes stale external mods when their entries are
removed from `external-mods.json`.

Options:

- `--java PATH` — use a specific Java executable.
- `--skip-fetch` — only sync external mods; skip Pakku fetch.

## build_server.py

Calls Pakku's normal export command and copies the serverpack zip to
`modpackbuilds/server/<pack>-<version>.zip`. It first downloads external mod
jars into `.pakku/overrides/mods/` so Pakku includes them in the server pack.

Options:

- `--java PATH` — use a specific Java executable.
- `--output PATH` — override the output zip path.
- `--clean-build` — remove Pakku's `build/curseforge`, `build/modrinth`,
  and `build/serverpack` after copying the server zip.

## build_client.py

Builds a packwiz pack from `pakku-lock.json`, creates a Prism instance zip,
and writes it to `modpackbuilds/client/<pack>-<version>.zip`. The pack source
is written separately to `modpackbuilds/client/pack/` for uploading to a
static host.

Options:

- `--output PATH` — override the output zip path.
- `--installer PATH` — use a different `packwiz-installer.jar`.
- `--bootstrap PATH` — use a different
  `packwiz-installer-bootstrap.jar`.
- `--pack-url URL` — hosted `pack.toml` used by the bootstrap. Default:
  `https://raw.githubusercontent.com/Deepacat/angels-smp-modpack/packwiz-pack/pack.toml`
- `--local-pack` — bundle the pack in the instance and run the installer
  directly, for offline testing.
- `--smoke-projects N` — only include the first N projects (quick test).
- `--smoke-overrides N` — only include the N smallest manual overrides.
- `--display-name NAME` — Prism instance display name.

Hosted client zip contents:

```text
instance.cfg
mmc-pack.json
.minecraft/packwiz-installer.jar
.minecraft/packwiz-installer-bootstrap.jar
```

The pack source in `modpackbuilds/client/pack/` contains external mods as
packwiz `[download]` URL metadata. No external jar is copied into it.

Local-pack mode also contains `.minecraft/packwiz-pack/` and uses the direct
installer main class instead of the bootstrap.

## upload_packwiz_branch.py

Builds the pack, copies it to the ignored local `packwiz/` folder, and
optionally publishes it to the generated `packwiz-pack` branch:

```bash
python scripts/upload_packwiz_branch.py --push
```

Source branches (`main` and the temporary `packwiz-dev-test`) do not track
`packwiz/`. The published branch is a fresh one-commit branch, so it contains
no dev history or jar history.

Options:

- `--no-build` — use the existing generated pack.
- `--push` — create and force-push the generated pack branch.
- `--branch NAME` — target another generated pack branch.

The served URL is:

```text
https://raw.githubusercontent.com/Deepacat/angels-smp-modpack/packwiz-pack/pack.toml
```

The script sets `core.autocrlf=false` in the temporary publish repo and
verifies every committed blob against `index.toml` before pushing. This
prevents Git LF/CRLF conversion from causing `Invalid mod file hash` on
clients.

## pakku_to_packwiz.py

Shared converter. It:

- reads `pakku-lock.json` and `pakku.json`
- writes `pack.toml`, `index.toml`, `mods/*.pw.toml`,
  `resourcepacks/*.pw.toml`
- copies tracked override files
- embeds or URL-links `.pakku` manual overrides
- generates the packwiz index without requiring `packwiz.exe`
- for the client build, writes `side = "both"` for every non-export project,
  matching Pakku's `export_server_side_projects_to_client` behavior

## Notes

- `modpackbuilds/` and `build/` are gitignored.
- The scripts use only the Python standard library.
- The server script requires Pakku/Java; the client script requires only
  Python (the installer and bootstrap jars are bundled for distribution).
- The hosted pack source must be published before the client zip is
  distributed. The default raw-GitHub URL is not live until the
  `packwiz-pack` branch is pushed.
