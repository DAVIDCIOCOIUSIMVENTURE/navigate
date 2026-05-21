<#
.SYNOPSIS
  Stops whatever process is listening on a TCP port.

.DESCRIPTION
  Finds the PID(s) holding a LISTEN socket on the given port and force-stops
  them. Prints what was stopped, then re-checks the port. Safe to re-run.

.PARAMETER Port
  TCP port to free. Defaults to 4000 (this repo's `npm run dev`).
#>
param(
  [int]$Port = 4000
)

$ErrorActionPreference = 'Stop'

$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listeners) {
  Write-Output "Port $Port is already free."
  exit 0
}

$pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $pids) {
  $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
  if ($proc) {
    Write-Output "Stopping PID $procId ($($proc.ProcessName), started $($proc.StartTime))."
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
}

Start-Sleep -Milliseconds 500

$still = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($still) {
  Write-Output "WARNING: port $Port still has a listener after stop attempt."
  exit 1
} else {
  Write-Output "Port $Port is now free."
}
