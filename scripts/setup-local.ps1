param(
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

function Assert-ProjectRoot {
  if (-not (Test-Path -LiteralPath "package.json")) {
    throw "Run this script from the project root."
  }

  if (-not (Test-Path -LiteralPath "package-lock.json")) {
    throw "package-lock.json was not found. This project expects npm with a lockfile."
  }
}

Assert-ProjectRoot

$nodeVersion = (& node --version) 2>$null
if (-not $nodeVersion) {
  throw "Node.js is required but was not found on PATH."
}

$npmVersion = (& npm --version) 2>$null
if (-not $npmVersion) {
  throw "npm is required but was not found on PATH."
}

Write-Host "Node: $nodeVersion"
Write-Host "npm: $npmVersion"

if ($SkipInstall) {
  Write-Host "Skipping install because -SkipInstall was provided."
  exit 0
}

Write-Host "Installing dependencies with npm ci..."
npm ci

if (Test-Path -LiteralPath ".env") {
  Write-Host ".env exists and was not modified."
}

if (Test-Path -LiteralPath ".env.local") {
  Write-Host ".env.local exists and was not modified."
}
