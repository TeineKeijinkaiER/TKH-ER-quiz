$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ports = 8000..8010

function Test-QuizErServer {
  param([int]$Port)

  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/" -TimeoutSec 1
    return $response.Content -like "*Quiz-TKHER*"
  } catch {
    return $false
  }
}

function Test-PortFree {
  param([int]$Port)

  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    $listener.Start()
    return $true
  } catch {
    return $false
  } finally {
    if ($listener) {
      $listener.Stop()
    }
  }
}

function Wait-ForServer {
  param([int]$Port)

  foreach ($attempt in 1..20) {
    if (Test-QuizErServer -Port $Port) {
      return
    }
    Start-Sleep -Milliseconds 250
  }

  throw "Could not start Quiz-TKHER local server."
}

$runningPort = $ports | Where-Object { Test-QuizErServer -Port $_ } | Select-Object -First 1
if ($runningPort) {
  Start-Process "http://127.0.0.1:$runningPort/"
  exit 0
}

$port = $ports | Where-Object { Test-PortFree -Port $_ } | Select-Object -First 1
if (-not $port) {
  throw "No free local port found from 8000 to 8010."
}

$python = Get-Command python -ErrorAction SilentlyContinue
$pythonArgs = @("-m", "http.server", [string]$port, "--bind", "127.0.0.1")

if (-not $python) {
  $python = Get-Command py -ErrorAction SilentlyContinue
  $pythonArgs = @("-3", "-m", "http.server", [string]$port, "--bind", "127.0.0.1")
}

if (-not $python) {
  throw "Python was not found. Install Python or run: python -m http.server 8000"
}

Start-Process -FilePath $python.Source -ArgumentList $pythonArgs -WorkingDirectory $root -WindowStyle Hidden
Wait-ForServer -Port $port
Start-Process "http://127.0.0.1:$port/"
