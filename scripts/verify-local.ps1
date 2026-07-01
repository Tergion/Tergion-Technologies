$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath "package.json")) {
  throw "Run this script from the project root."
}

$package = Get-Content -Raw -LiteralPath "package.json" | ConvertFrom-Json

npm run lint
npm run typecheck
npm run build

if ($package.scripts.PSObject.Properties.Name -contains "test") {
  npm run test
} else {
  Write-Host "No test script configured; skipping tests."
}
