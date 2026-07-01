param(
  [switch]$NodeModules
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath "package.json")) {
  throw "Run this script from the project root."
}

$root = [System.IO.Path]::GetFullPath((Get-Location).Path)

function Remove-ProjectDirectory {
  param([string]$RelativePath)

  $target = [System.IO.Path]::GetFullPath((Join-Path $root $RelativePath))

  if (-not $target.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove path outside project root: $target"
  }

  if (Test-Path -LiteralPath $target) {
    Write-Host "Removing $RelativePath"
    Remove-Item -LiteralPath $target -Recurse -Force
  } else {
    Write-Host "$RelativePath not found; nothing to clean."
  }
}

Remove-ProjectDirectory ".next"

if ($NodeModules) {
  Remove-ProjectDirectory "node_modules"
} else {
  Write-Host "node_modules was not removed. Pass -NodeModules to remove it explicitly."
}
