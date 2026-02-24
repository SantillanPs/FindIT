param (
    [Parameter(Mandatory=$true)]
    [int]$Port
)

$ErrorActionPreference = "SilentlyContinue"

$process = Get-NetTCPConnection -LocalPort $Port | Select-Object -ExpandProperty OwningProcess -First 1

if ($process) {
    Write-Host "Cleaning up port $Port (Process ID: $process)..." -ForegroundColor Cyan
    Stop-Process -Id $process -Force
} else {
    Write-Host "Port $Port is already free." -ForegroundColor Gray
}
