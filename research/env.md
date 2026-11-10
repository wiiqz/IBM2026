# Db2 12.1.5 environment research (2026-11-09, ~18:30 CST)

Goal: the fastest reliable path to a running IBM Db2 12.1.5 database with `VECTOR`, `VECTOR_DISTANCE`,
`CREATE VECTOR INDEX` and `FETCH APPROX`, usable from Python on this machine, with ~12 h left.

Legend: **OBSERVED** = measured on this machine or read from a primary source in this session.
**ESTIMATE** = my time estimate, not measured. **UNKNOWN** = not verified.

---

## 1. Machine probe (OBSERVED, read-only)

| Check | Result |
|---|---|
| OS | Windows 11 Pro 10.0.26200, 64-bit |
| CPU | AMD Ryzen 9 7900X (x86-64, AVX2 capable) |
| `VirtualizationFirmwareEnabled` | **True** |
| `SecondLevelAddressTranslationExtensions` | True |
| `VMMonitorModeExtensions` | True |
| `HypervisorPresent` | **False** (no Hyper-V, no VBS hypervisor, no Virtual Machine Platform running) |
| `HvHost` service | Stopped. `vmcompute`, `vmms`, `LxssManager` not present |
| `wsl --status` | "The Windows Subsystem for Linux is not installed." |
| Container runtimes | None: no `docker`, `podman`, `nerdctl`; no Docker Desktop / Rancher Desktop / Podman Desktop folders |
| VM tools | None: no VirtualBox, VMware, QEMU, Multipass, Vagrant |
| Db2 | Not installed (`C:\Program Files\IBM` absent, no `db2` on PATH) |
| Cloud CLIs | None (`az`, `gcloud`, `aws`, `ibmcloud` absent) |
| `winget` | v1.29.380 |
| `gh` | Logged in as `KnigguKniggu-droid`; scopes `gist, read:org, repo`. **No `codespace` scope** (`gh codespace list` returns HTTP 403 and says run `gh auth refresh -h github.com -s codespace`) |
| Ollama | 0.40.14; models `qwen3:14b`, `nomic-embed-text:latest`, `qwen3:4b-instruct-2507-q4_K_M`, `gemma4:26b` |

Consequence: every Hyper-V-based route (WSL2, Docker Desktop, Podman, Rancher) needs a Windows feature
enabled, admin rights and a reboot. A type-2 hypervisor (VirtualBox) can use AMD-V directly because no
hypervisor is present.

---

## 2. Db2 feature facts (OBSERVED from ibm.com/docs, Db2 12.1.x)

- `VECTOR` data type: "available in Db2 12.1.2 and later". Max dimension 8168 (FLOAT32) / 32672 (INT8)
  on row-organized tables. **No platform restriction is stated.**
- `VECTOR_DISTANCE(vector1, vector2, metric)`, schema SYSIBM; metrics COSINE, EUCLIDEAN,
  EUCLIDEAN_SQUARED, DOT, HAMMING, MANHATTAN. **No platform restriction is stated.**
- `CREATE VECTOR INDEX`: "Vector index support is available in Db2 12.1.5 and later on LinuxAMD64
  platforms." and "Linux on AMD64 platforms only. Vector indexes are not supported on other platforms."
  **Confirmed: not on Windows.** Also not in DPF or pureScale.
  - Syntax: `CREATE VECTOR INDEX ix ON t (col) WITH DISTANCE {COSINE | EUCLIDEAN | EUCLIDEAN_SQUARED}`
    `[IN ts] [COMPRESSED VECTORS IN ts] [BUILD_MEM_BUDGET n] [BUILD_PARALLELISM n] ...`
  - COSINE needs FLOAT32. Zero-norm vectors fail the COSINE build (SQL0801N).
  - Index must be on a **NOT NULL** VECTOR column to be chosen. One vector column per index.
  - Only row-organized, non-partitioned tables.
  - Build is fully offline and takes a Z-lock on the table. `LOAD` is blocked on the table (SQL6104N).
    `TRUNCATE` makes the table inaccessible until the vector index is dropped. Index REORG is blocked.
  - The GA page does not say whether INSERT/UPDATE/DELETE work after the index exists (the 2025
    preview said the table became read-only). Treat as UNKNOWN: load all rows first, then build the index.
- `FETCH [APPROX | EXACT] FIRST n ROWS ONLY`: "In Db2 12.1.5 and later". APPROX uses the vector index
  when available. With neither keyword, the optimizer costs the index if one exists, else runs exact.
  The optimizer needs `RUNSTATS`. It can still pick exact on small tables. The metric in
  `VECTOR_DISTANCE` in `ORDER BY` must match the index metric.
- Db2 12.1.5 GA: 25 June 2026 (Fix Central page "Release Date: 25.JUNE.2026"). Community Edition was
  updated to 12.1.5 (IBM community thread, 2026-06-25).

### Vector index dimension cap by page size (OBSERVED, CREATE VECTOR INDEX page)

"the size of a single index key must fit within one-quarter of the database page."

| Page size | Max key | INT8 dims | FLOAT32 dims |
|---|---|---|---|
| 4K | 1K | 1024 | **256** |
| 8K | 2K | 2048 | **512** |
| 16K | 4K | 4096 | **1024** |
| 32K | 8K | 8192 | **2048** |

---

## 3. Embedding dimensions (OBSERVED)

- `ollama show nomic-embed-text`: architecture nomic-bert, 137M params, **embedding length 768**, F16.
- `POST /api/embed` with `nomic-embed-text` returned **768** floats.
- `POST /api/embed` with `"dimensions": 256` returned **256** floats (Ollama 0.40.14 supports it;
  nomic-embed-text v1.5 is Matryoshka-trained, so truncation is an intended use).

Implication:
- 768-dim FLOAT32 = 3072-byte key. It needs a **16K or 32K page**. The Db2 default page size is 4K,
  so a 768-dim vector index on a default database fails the key-size rule.
- Option A (recommended): create the database with 32K pages:
  `db2 create database VECDB pagesize 32 K`. Then any table and index fit up to 2048 FLOAT32 dims.
- Option B: keep the default database, then create a 32K bufferpool and tablespace and put the table
  and the index there (`IN TS32K`). Risk: the doc says "database page"; I did not verify whether the
  limit follows the index tablespace page size or the database default. Option A removes the doubt.
- Option C: request `"dimensions": 256` from Ollama. This fits 4K pages. Cost: some recall loss.

---

## 4. Container image facts (OBSERVED from icr.io, anonymous registry API)

- `GET https://icr.io/v2/db2_community/db2/tags/list` returns tags `11.5.5.1, 11.5.8.0, 11.5.9.0,
  12.1.0.0, 12.1.1.0, 12.1.2.0, 12.1.3.0, 12.1.4.0, 12.1.5.0, latest`. **No login needed to pull.**
- `12.1.5.0` is a manifest list for **linux/amd64, linux/ppc64le, linux/s390x**. **No arm64.**
  (So ARM free tiers such as Oracle A1 or AWS Graviton cannot run it.)
- linux/amd64 image: 13 layers, **2,625 MB compressed** (uncompressed size UNKNOWN; expect roughly 2-3x).
- Image created 2026-07-13, UBI 9.8 base, entrypoint `/var/db2_setup/lib/setup_db2_instance.sh`,
  ports 50000 (Db2), 55000, 60006, 60007, 22; volumes `/database`, `/hadr`; `LICENSE_NAME=db2dec.lic`.
- `--privileged` is required by IBM's documented run command (community posts report failure without it).
- Known issues:
  - DBI20187E on container restart (wrong owner on `fencedid`): IBM says fixed in `12.1.5.0` and `latest`.
  - First-start time: ~1-2 min on 12.1.0 (Dec 2024 reports; ~1 min with `TO_CREATE_SAMPLEDB=false`,
    `REPODB=false`, `ARCHIVE_LOGS=false`). One 12.1.2 user saw **75 min** for `CREATE DATABASE`;
    a 12.1.3 user on Podman saw 2 min 19 s. 12.1.5 timing UNKNOWN. Budget 5-15 min, risk up to 60+ min.
  - A container stop/start re-runs parts of setup (minutes). Do not stop it during the hackathon.

---

## 5. Options compared

### Ranked summary

| Rank | Option | Vector index + FETCH APPROX | Admin | Reboot | Sign-in / cloud resource | ESTIMATE to `SELECT` working |
|---|---|---|---|---|---|---|
| 1 | GitHub Codespaces + `db2:12.1.5.0` in docker-in-docker | Yes (Linux AMD64) | No | No | `gh auth refresh -s codespace` (browser) + creates a codespace | 15-30 min |
| 2 | WSL2 + Docker Engine in Ubuntu (no Docker Desktop) | Yes | Yes | **Yes** | None | 30-50 min incl. reboot |
| 3 | VirtualBox 7.2.22 + Ubuntu Server VM + Docker | Yes (verify `avx2` in guest) | Yes | Not expected (UNKNOWN) | None | 60-100 min |
| 4 | Native Db2 CE 12.1.5 for Windows | **No** vector index (VECTOR + VECTOR_DISTANCE likely OK, untested) | Yes | Usually no (UNKNOWN) | IBMid registration | 45-90 min |
| 5 | Cloud Linux x86 VM (AWS/GCP/Azure) + container | Yes | No | No | Account, card, billing | 20-40 min if account exists |
| 6 | IBM Cloud Db2 SaaS Lite | UNKNOWN (likely no) | No | No | IBMid + likely card | UNKNOWN |
| - | Docker Desktop (Hyper-V), Podman Desktop, Rancher Desktop | Yes | Yes | **Yes** | Docker Desktop: free for personal / small business | No faster than option 2 |

### 5a. `wsl --install` + Docker (WSL2 backend)

- Reboot: **Yes.** Microsoft Learn (updated 2026-06-02): "Open PowerShell in administrator mode ...
  enter the wsl --install command, then restart your machine." `HypervisorPresent=False` confirms the
  Virtual Machine Platform is not active yet, so enabling it needs the restart. Build 26200 has no
  documented exception.
- Docker Desktop requirements (docs.docker.com): Windows 11 Pro 23H2 (22631)+, WSL 2.1.5+, SLAT,
  8 GB RAM, BIOS virtualization. Per-user install needs no admin, but "Enabling WSL 2 for the first time"
  needs admin. Licence: free for personal use and small business (<250 staff, <$10M revenue).
- Faster variant: skip Docker Desktop. Install `docker.io` inside Ubuntu on WSL2.
- Commands (user runs; admin; reboot):
  ```powershell
  # Admin PowerShell
  wsl --install -d Ubuntu-24.04
  # Restart Windows. Then open "Ubuntu" from Start, create the Linux user.
  ```
  ```bash
  sudo apt-get update && sudo apt-get install -y docker.io
  sudo usermod -aG docker $USER && newgrp docker
  sudo systemctl enable --now docker   # Ubuntu 24.04 on current WSL has systemd on by default
  # then the same docker run as in section 6
  ```
  Windows Python connects to `localhost:50000` (WSL2 NAT mode forwards localhost by default).
- Time ESTIMATE: wsl install 5-10 min + reboot 3-5 min + Ubuntu first launch 2 min + docker 3 min +
  image pull 3-6 min (2.6 GB) + Db2 setup 5-15 min = **~25-45 min**.
- Risks: reboot interrupts the session; WSL2 disk (VHDX) grows on C: (115 GB free is enough);
  Db2 first-start slowness.

### 5b. Docker Desktop Hyper-V backend / Podman Desktop / Rancher Desktop

- Docker Desktop Hyper-V backend: "You must turn on the Hyper-V and Containers Windows features" ->
  admin + **reboot**.
- Podman Desktop on Windows uses a WSL2 or Hyper-V machine provider -> **reboot** (same features).
- Rancher Desktop on Windows uses WSL2 -> **reboot**.
- None is faster than 5a. All add a GUI install (~0.5-0.7 GB) on top.

### 5c. Native Db2 Community Edition for Windows x64

- Download: IBM "Get started" page "Start free trial" -> `https://www.ibm.com/account/reg/subscribe?formid=urx-33669`
  (page heading "Sign up for the IBM Db2 Community Edition trial") -> **IBMid registration required**.
  Alternative: Fix Central "Db2 Server Fix Pack" 12.1.5000.317 Windows 64-bit (PTF DYN2606181600WIN64),
  also behind IBMid login. A community answer says the CE licence (`db2dec.lic`) ships in regular fix packs.
- Installer size: UNKNOWN (one unofficial AI-generated page says ~1.4 GB; not trusted).
- Install: admin; creates Windows services. Time ESTIMATE 15-30 min after download. Reboot: usually not
  required (UNKNOWN for 12.1.5).
- Features: `VECTOR` + `VECTOR_DISTANCE`: docs state no platform restriction -> likely work on Windows,
  **not tested**. `CREATE VECTOR INDEX`: **not supported on Windows** (docs: "Linux on AMD64 platforms
  only"). `FETCH APPROX` therefore cannot use an index on Windows; queries run as exact scans.
- Verdict: fails the "ideally vector index" goal and needs IBMid. Use only as a no-container fallback.

### 5d. GitHub Codespaces running the Db2 CE container

- Privileged: the Codespaces default image (`devcontainers/images` `src/universal`) includes feature
  `ghcr.io/devcontainers/features/docker-in-docker:4`, and that feature's `devcontainer-feature.json`
  (v4.1.3) sets `"privileged": true` (OBSERVED via `gh api`). So the codespace container runs privileged
  and an inner `docker run --privileged` is expected to work. **Not tested on this account (UNKNOWN).**
- Free quota (docs.github.com billing): GitHub Free personal = **120 core-hours + 15 GB-month storage
  per month**; Pro = 180 h + 20 GB-month. Without a payment method, usage is blocked at the quota
  (no surprise charges). 4-core machine = 30 wall-clock hours; 2-core = 60 h. Current month usage UNKNOWN.
- Machines (secondary sources, not official table): 2-core / 8 GB RAM / 32 GB disk;
  4-core / 16 GB RAM / 32-64 GB disk. Db2 CE is capped at 4 cores / 16 GB anyway. Pick 4-core.
- Public devcontainer examples running Db2 in Codespaces: none found.
- Linux AMD64 host -> vector index supported. AVX2 on Azure x86 hosts: expected, verify with
  `grep -c avx2 /proc/cpuinfo`.
- Connectivity: run Python inside the codespace, or forward the port to Windows with
  `gh codespace ports forward 50000:50000 -c <name>` and keep local Ollama embeddings + local `ibm_db`
  (raw TCP forwarding through gh: expected to work, UNKNOWN on this account).
- Risks: disk space in the default universal image (image ~2.6 GB compressed plus extracted layers plus
  the database); idle timeout stops the codespace (default 30 min; set `--idle-timeout 240m`), and a
  restart re-runs Db2 setup; network latency for every SQL round trip if Python stays on Windows.

### 5e. IBM Cloud Db2 SaaS Lite / free plan

- IBM's pricing page lists a "Free" Db2 SaaS tier; IBM's Db2 get-started page and IBM Cloud docs describe
  Lite as 200 MB storage, 5-15 connections, shared multi-tenant, re-extend every 30 (or 90) days,
  Dallas/London only. Sources disagree on details.
- Credit card: IBM Cloud registration asks for a card for identity verification (most sources);
  one capture says no card. Treat as **likely required**.
- Db2 version on Lite: **UNKNOWN**. VECTOR support: **UNKNOWN**. Vector index: unlikely on a shared plan.
- Verdict: sign-in + possible card + unknown features + 200 MB. Not recommended.

### 5f. Other cloud Linux VM

- Any x86-64 Linux VM with >= 4 vCPU / 16 GB works with the same `docker run`.
  Approximate on-demand prices (not re-verified today): AWS t3.xlarge ~USD 0.17/h, GCP e2-standard-4
  ~USD 0.13/h, Azure D4s_v5 ~USD 0.19/h -> about USD 2-3 for 12 h plus disk.
- Setup ESTIMATE 20-40 min if an account already exists; new-account card verification adds unknown delay.
- ARM free tiers do not work (no arm64 image; vector index is Linux AMD64 only).
- Requires sign-in and cloud resources -> user decision.

### Extra local option: VirtualBox (no Hyper-V, likely no reboot)

- `HypervisorPresent=False`, so VirtualBox runs with native AMD-V (fastest mode).
- VirtualBox 7.2.22 Windows installer: `https://download.virtualbox.org/virtualbox/7.2.22/VirtualBox-7.2.22-175245-Win.exe`
  (direct download, no login). Install needs admin (kernel and network drivers). Reboot: not normally
  required; **not verified**.
- Then: Ubuntu Server 24.04 ISO install (manual, 15-20 min), `apt install docker.io`, same `docker run`,
  NAT port forward 50000 -> host. Ollama on Windows is reachable from the guest at `10.0.2.2:11434`.
- Risks: most manual steps; AVX2 must be visible in the guest (`grep avx2 /proc/cpuinfo`);
  installing WSL/Hyper-V later makes VirtualBox slower.

---

## 6. Exact commands for the top option (GitHub Codespaces)

Prerequisites (user actions, need explicit user approval: browser auth + cloud resource):

```powershell
# 1. Add the codespace scope (opens a browser device-code flow)
gh auth refresh -h github.com -s codespace

# 2. Pick a repo you own (any; a new empty private repo is fine) and list machine types
gh api /repos/KnigguKniggu-droid/<repo>/codespaces/machines --jq ".machines[] | [.name, .cpus, .memory_in_bytes, .storage_in_bytes] | @tsv"

# 3. Create a 4-core codespace with a long idle timeout (machine name from step 2;
#    GitHub docs mention "standardLinux32gb")
gh codespace create -R KnigguKniggu-droid/<repo> -b main -m standardLinux32gb --idle-timeout 240m

# 4. Open a shell in it
gh codespace ssh -c <codespace-name>
```

Inside the codespace:

```bash
docker info | grep -i -E "server version|cgroup"     # confirm docker-in-docker runs
grep -c avx2 /proc/cpuinfo                           # expect > 0
df -h /var/lib/docker /                              # need ~15 GB free

docker pull icr.io/db2_community/db2:12.1.5.0
docker run -d --name db2 --privileged=true -p 50000:50000 \
  -e LICENSE=accept -e DB2INSTANCE=db2inst1 -e DB2INST1_PASSWORD='ChangeMe-123' \
  -e TO_CREATE_SAMPLEDB=false -e REPODB=false -e ARCHIVE_LOGS=false \
  -e HADR_ENABLED=false -e PERSISTENT_HOME=true -e BLU=false \
  -v db2data:/database \
  icr.io/db2_community/db2:12.1.5.0
docker logs -f db2        # wait for "Setup has completed"

# Create the database with 32K pages so 768-dim FLOAT32 vector indexes fit
docker exec -i db2 su - db2inst1 -c "db2 create database VECDB pagesize 32 K"
docker exec -i db2 su - db2inst1 -c "db2level"     # expect 12.1.5
docker exec -i db2 su - db2inst1 -c "db2 connect to VECDB && db2 \"values SYSTOOLS.JSON2BSON('{}')\""
```

Back on Windows (to use local Ollama and the local `ibm_db` venv):

```powershell
gh codespace ports forward 50000:50000 -c <codespace-name>
```

Smoke-test SQL (run after data load; vector index build is offline):

```sql
CREATE TABLE DOCS (ID INT NOT NULL PRIMARY KEY, TXT CLOB(1M), EMB VECTOR(768, FLOAT32) NOT NULL);
-- insert rows: VECTOR('[0.1, ...]', 768, FLOAT32)
CREATE VECTOR INDEX DOCS_VIX ON DOCS (EMB) WITH DISTANCE COSINE;
RUNSTATS ON TABLE DB2INST1.DOCS AND INDEXES ALL;
SELECT ID FROM DOCS
ORDER BY VECTOR_DISTANCE(EMB, VECTOR(?, 768, FLOAT32), COSINE)
FETCH APPROX FIRST 5 ROWS ONLY;
```

Python connection string: `DATABASE=VECDB;HOSTNAME=127.0.0.1;PORT=50000;PROTOCOL=TCPIP;UID=db2inst1;PWD=...;`

---

## 7. Python driver check (OBSERVED, venv at `...\scratchpad\ibm26\venv313`, Python 3.13.2)

| Package | Version | Install | Import |
|---|---|---|---|
| `ibm_db` | **3.3.0** (wheel `ibm_db-3.3.0-cp313-cp313-win_amd64.whl`, 28.4 MB) | OK, 21 s | `import ibm_db, ibm_db_dbi` OK |
| `langchain-db2` | **1.0.0** | OK (with the next one, 96 s) | `from langchain_db2 import DB2VS` OK |
| `ibm-db-haystack` | **1.0.0** (pulls `haystack-ai` 3.4.1) | OK | `from haystack_integrations.document_stores.ibm_db import IBMDb2DocumentStore` and `from haystack_integrations.components.retrievers.ibm_db import IBMDb2EmbeddingRetriever` OK |

Other resolved versions: `langchain-core` 1.7.6, `langchain-community` 0.4.2, `numpy` 2.5.4, `sqlalchemy` 2.1.8.

- **clidriver is bundled in the wheel**: `site-packages\clidriver\` exists (`bin, bnd, cfg, conv, db2,
  include, lib, license, msg, properties`). The verbose pip log shows only the wheel download; no
  separate clidriver download at install time.
- Driver load test: `ibm_db.connect(...)` to `127.0.0.1:50000` (nothing listening) returned
  `[IBM][CLI Driver] SQL30081N A communication error has been detected...`, so the native CLI driver loads.
- Note the module path: `haystack_integrations.document_stores.ibm_db` (not `.db2`).
- Integration caveats (read from installed source):
  - `langchain_db2/db2vs.py` search SQL uses `VECTOR_DISTANCE(...)` with `ORDER BY distance FETCH FIRST k
    ROWS ONLY`; a TODO says "No APPROX in 'FETCH APPROX FIRST' now". Per GA docs the optimizer may still
    cost a vector index when neither keyword is given, but APPROX is not forced. For guaranteed
    `FETCH APPROX`, write the query directly with `ibm_db`.
  - Both integrations call `SYSTOOLS.JSON2BSON` / `SYSTOOLS.BSON2JSON`. Verify these exist in the new
    database (`values SYSTOOLS.JSON2BSON('{}')`) before relying on them.
  - `langchain_db2` inlines the embedding as a string literal `VECTOR('[...]', n, FLOAT32)`; fine for 768 dims.
- Reproduce: `...\scratchpad\ibm26\scripts\check_imports.py`; logs in `...\scratchpad\ibm26\logs\`.

---

## 8. Risks (all options)

1. Db2 first-start / `CREATE DATABASE` time is volatile (2 min to 75 min reported across 12.1.x builds).
2. Vector index build is offline with a Z-lock; `LOAD` is blocked; DML after build is UNKNOWN.
   Plan: load all rows, build the index once, `RUNSTATS`, then query. Rebuild (drop + create) if data changes.
3. 768-dim index needs >= 16K pages; use `pagesize 32 K` at database creation or 256-dim embeddings.
4. COSINE index rejects zero-norm vectors (SQL0801N) -> filter empty texts before embedding.
5. Codespaces: privileged docker-in-docker and TCP port forwarding are expected but untested here;
   quota usage this month UNKNOWN.
6. Community Edition limits: 4 cores, 16 GB RAM (IBM docs for the CE image).

---

## Sources

- IBM Docs, CREATE VECTOR INDEX: https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-create-vector-index
- IBM Docs, fetch-clause (APPROX/EXACT): https://www.ibm.com/docs/en/db2/12.1.x?topic=subselect-fetch-clause
- IBM Docs, Vector values: https://www.ibm.com/docs/en/db2/12.1.x?topic=list-vector-values
- IBM Docs, VECTOR_DISTANCE: https://www.ibm.com/docs/en/db2/12.1.x?topic=functions-vector-distance
- IBM Fix Central page, Db2 12.1 Mod 5 FP0: https://www.ibm.com/support/pages/db2-version-121-mod-5-fix-pack-0-linux-unix-and-windows
- IBM release notes 12.1.5 (JP): https://www.ibm.com/support/pages/node/7278094
- IBM community, 12.1.5 CE release: https://community.ibm.com/community/user/discussion/1215-community-edition-release
- IBM community, vector index performance (2026-06-19): https://community.ibm.com/community/user/blogs/zach-hoggard/2026/06/19/vector-indexes-in-db2-mastering-vector-index-perfo
- IBM community, early preview (2025-10-04): https://community.ibm.com/community/user/blogs/christian-garcia-arellano/2025/10/04/vector-indexes-in-db2-an-early-preview
- Triton, 12.1.5 highlights: https://www.triton.co.uk/ibm-db2-12-1-5-is-here-my-personal-highlights/
- IBM community, slow DB creation: https://community.ibm.com/community/user/discussion/db2-12120-in-docker-still-very-slow-database-creation
- IBM community, slow startup timings: https://community.ibm.com/community/user/discussion/db2-community-docker-slow-startup
- IBM community, DBI20187E: https://community.ibm.com/community/user/discussion/121-container-community-edition-docker-start-fails-dbi20187e
- IBM Db2 developer extension, docker run: https://ibm.github.io/db2developerextension-about/docs/tips-and-tricks/manual-db2-installation
- IBM Db2 get started: https://www.ibm.com/products/db2/get-started
- icr.io registry API (tags, manifests) queried directly: https://icr.io/v2/db2_community/db2/tags/list
- Microsoft Learn, Install WSL: https://learn.microsoft.com/en-us/windows/wsl/install
- Docker Desktop Windows install: https://docs.docker.com/desktop/setup/install/windows-install/
- GitHub Codespaces billing: https://docs.github.com/en/billing/concepts/product-billing/github-codespaces
- GitHub Codespaces machine types: https://docs.github.com/en/codespaces/customizing-your-codespace/changing-the-machine-type-for-your-codespace
- devcontainers docker-in-docker feature: https://github.com/devcontainers/features/tree/main/src/docker-in-docker
- IBM Cloud free FAQ: https://www.ibm.com/cloud/free/faq
- VirtualBox downloads: https://www.virtualbox.org/wiki/Downloads
