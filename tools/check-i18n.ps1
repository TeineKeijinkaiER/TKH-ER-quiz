# tools/check-i18n.ps1
# Validates JA/EN content consistency for Quiz-TKHER.
# Usage:
#   .\tools\check-i18n.ps1            # full check
#   .\tools\check-i18n.ps1 -File <path>   # single file check
#
# Exit code 1 if any issue found.

param(
  [string]$File = "",
  [string]$Root = (Resolve-Path "$PSScriptRoot\..").Path
)

$ErrorActionPreference = "Continue"
$dataDir = Join-Path $Root "data"
$jaQDir  = Join-Path $dataDir "questions\ja"
$enQDir  = Join-Path $dataDir "questions\en"
$catJa   = Join-Path $dataDir "categories.ja.json"
$catEn   = Join-Path $dataDir "categories.en.json"

$exitCode = 0
function Report-Ok($msg)   { Write-Host "[OK]      $msg" -ForegroundColor Green }
function Report-Miss($msg) { Write-Host "[MISSING] $msg" -ForegroundColor Yellow; $script:exitCode = 1 }
function Report-Diff($msg) { Write-Host "[DIFF]    $msg" -ForegroundColor Red;    $script:exitCode = 1 }

function Check-Categories {
  if (-not (Test-Path $catJa)) { Report-Miss "categories.ja.json not found"; return }
  if (-not (Test-Path $catEn)) { Report-Miss "categories.en.json not found"; return }

  $jaJson = Get-Content $catJa -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Continue
  $enJson = Get-Content $catEn -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Continue

  if (-not $jaJson -or -not $enJson) { return }

  $ja = @($jaJson | ForEach-Object id)
  $en = @($enJson | ForEach-Object id)
  $onlyJa = @($ja | Where-Object { $_ -notin $en })
  $onlyEn = @($en | Where-Object { $_ -notin $ja })

  foreach ($i in $onlyJa) { Report-Diff ("categories: id '" + $i + "' missing in EN") }
  foreach ($i in $onlyEn) { Report-Diff ("categories: id '" + $i + "' missing in JA") }
  if ($onlyJa.Count -eq 0 -and $onlyEn.Count -eq 0) {
    Report-Ok ("categories.ja.json <-> categories.en.json (" + $ja.Count + " ids matched)")
  }
}

function Check-QuestionFile($jaPath) {
  $rel = $jaPath.Substring($jaQDir.Length).TrimStart("\", "/")
  $enPath = Join-Path $enQDir $rel
  if (-not (Test-Path $enPath)) {
    Report-Miss ("en/" + $rel + " - exists only in JA")
    return
  }

  $jaJson = Get-Content $jaPath -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Continue
  if (-not $jaJson) { Report-Diff ("ja/" + $rel + " - invalid JSON"); return }

  $enJson = Get-Content $enPath -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Continue
  if (-not $enJson) { Report-Diff ("en/" + $rel + " - invalid JSON"); return }

  $jaIds = @($jaJson.questions | ForEach-Object id)
  $enIds = @($enJson.questions | ForEach-Object id)
  $onlyJa = @($jaIds | Where-Object { $_ -notin $enIds })
  $onlyEn = @($enIds | Where-Object { $_ -notin $jaIds })

  foreach ($i in $onlyJa) { Report-Diff ("ja/" + $rel + " <-> en/" + $rel + ": id '" + $i + "' missing in EN") }
  foreach ($i in $onlyEn) { Report-Diff ("ja/" + $rel + " <-> en/" + $rel + ": id '" + $i + "' missing in JA") }
  if ($onlyJa.Count -eq 0 -and $onlyEn.Count -eq 0) {
    Report-Ok ("ja/" + $rel + " <-> en/" + $rel + " (" + $jaIds.Count + " questions matched)")
  }
}

function Check-OrphanEn {
  if (-not (Test-Path $enQDir)) { return }
  Get-ChildItem -Recurse -Filter *.json $enQDir | ForEach-Object {
    $rel = $_.FullName.Substring($enQDir.Length).TrimStart("\", "/")
    $jaPath = Join-Path $jaQDir $rel
    if (-not (Test-Path $jaPath)) { Report-Miss ("ja/" + $rel + " - exists only in EN") }
  }
}

if ($File) {
  $abs = Resolve-Path $File -ErrorAction Continue
  if ($abs) { Check-QuestionFile $abs.Path }
} else {
  Check-Categories
  if (Test-Path $jaQDir) {
    Get-ChildItem -Recurse -Filter *.json $jaQDir | ForEach-Object { Check-QuestionFile $_.FullName }
  }
  Check-OrphanEn
}

exit $exitCode
