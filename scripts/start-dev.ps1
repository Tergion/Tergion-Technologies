param(
  [int]$Port = 0,
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath "package.json")) {
  throw "Run this script from the project root."
}

if (-not (Test-Path -LiteralPath "node_modules")) {
  throw "node_modules was not found. Run npm ci before starting the dev server."
}

function Test-PortAvailable {
  param([int]$CandidatePort)

  $connection = Get-NetTCPConnection -LocalPort $CandidatePort -ErrorAction SilentlyContinue
  return -not $connection
}

if ($Port -gt 0) {
  if (-not (Test-PortAvailable -CandidatePort $Port)) {
    throw "Port $Port is already in use."
  }

  $selectedPort = $Port
} else {
  $selectedPort = $null

  foreach ($candidate in 3000..3010) {
    if (Test-PortAvailable -CandidatePort $candidate) {
      $selectedPort = $candidate
      break
    }
  }

  if (-not $selectedPort) {
    throw "No available port found from 3000 to 3010."
  }
}

$url = "http://localhost:$selectedPort"
Write-Host "Starting development server at $url"

if (-not $NoOpen) {
  Start-Process $url
}

npm run dev -- --port $selectedPort
