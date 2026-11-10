# Copies the private working folder needle/ into a fork's submissions/needle/ for the public PR.
# Internal planning and review files stay in the private team repo only.
# Usage: powershell -File make_submission.ps1 -Target <fork-clone>\submissions\needle
param([Parameter(Mandatory = $true)][string]$Target)
$ErrorActionPreference = 'Stop'
$src = Join-Path $PSScriptRoot 'needle'

# Never copied (relative to needle/): internal plan, agent contract, internal reviews, secrets, data, caches.
$excludeFiles = @('CONTRACT.md', 'docs\PLAN.md', 'docs\evidence\review_claude.md', 'docs\evidence\review_codex.md',
                  '.env', 'pytest.ini.bak')
$excludeDirs  = @('.venv', 'data', '__pycache__', '.pytest_cache', '.streamlit\secrets', 'web\node_modules', 'web\dist')

if (Test-Path $Target) { throw "Target exists: $Target (remove it first; this script never overwrites)" }
New-Item -ItemType Directory -Force $Target | Out-Null
$xd = $excludeDirs | ForEach-Object { Join-Path $src $_ }
$xf = $excludeFiles | ForEach-Object { Join-Path $src $_ }
robocopy $src $Target /E /XD $xd /XF $xf '*.secret.env' '.env.*' /NFL /NDL /NJH /NJS | Out-Null
Copy-Item (Join-Path $src '.env.example') $Target -Force   # robocopy's .env.* filter would drop it

# Guard 1: no secrets. Every *PASSWORD value from the private .env must be absent from the copy.
$secrets = Get-Content (Join-Path $src '.env') | Where-Object { $_ -match '^[A-Z0-9_]*PASSWORD=(.+)$' } |
           ForEach-Object { $_.Split('=', 2)[1] } | Where-Object { $_.Length -ge 8 }
foreach ($s in $secrets) {
  $hit = Get-ChildItem $Target -Recurse -File | Select-String -SimpleMatch $s -List
  if ($hit) { throw "SECRET FOUND in $($hit.Path) - aborting" }
}
# Guard 2: no judge-profiling or internal notes. Organizer repo URLs (KunalGolaIBM/...) are allowed.
$names = 'Dhruv|Pawan|Keshav|Daya Nand|Shaik Sadiq|Gaurav Saxena|Chaturvedi|Maheshwari|Thakur|Kunal Gola|judge panel|what they reward'
$hits = Get-ChildItem $Target -Recurse -File -Include *.md,*.py,*.sql,*.json,*.ps1,*.sh,*.yml,*.toml,*.txt |
        Select-String -Pattern $names
if ($hits) { $hits | ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }; throw 'Internal/judge text found - fix before publishing' }
# Guard 3: required files for the organizer validator.
foreach ($f in 'README.md', 'architecture.md', 'submission.json', '.env.example') {
  if (-not (Test-Path (Join-Path $Target $f))) { throw "Missing required file: $f" }
}
"OK: copied to $Target; secrets guard, internal-text guard and required-files guard passed."
