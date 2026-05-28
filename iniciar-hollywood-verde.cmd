@echo off
setlocal
set "HACKER_SELF=%~f0"
set "WINDOW_TITLE=Hollywood Hacker - Verde"

start "%WINDOW_TITLE%" powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$raw=Get-Content -LiteralPath $env:HACKER_SELF -Raw; $marker='###POWERSHELL_PAYLOAD###'; $pos=$raw.LastIndexOf($marker); if($pos -lt 0){Write-Host 'Payload nao encontrado.' -ForegroundColor Red; Start-Sleep -Seconds 5; exit 1}; $code=$raw.Substring($pos+$marker.Length); Invoke-Expression $code"
endlocal
exit /b

###POWERSHELL_PAYLOAD###
$ErrorActionPreference = 'SilentlyContinue'
$script:running = $true

function Get-Clock {
  return (Get-Date -Format 'HH:mm:ss.fff')
}

function New-Hex {
  param([int]$Length = 16)

  $chars = '0123456789ABCDEF'
  return -join (1..$Length | ForEach-Object {
    $chars[(Get-Random -Minimum 0 -Maximum $chars.Length)]
  })
}

function Write-Banner {
  Clear-Host
  Write-Host 'hacker-animation' -ForegroundColor Green -NoNewline
  Write-Host '  theme=hollywood color=green' -ForegroundColor DarkGreen
  Write-Host ''
  Write-Host 'Pressione Ctrl+C para sair.' -ForegroundColor DarkGreen
  Write-Host ''
}

function Write-Log {
  param(
    [string]$Tag,
    [string]$Message
  )

  Write-Host (Get-Clock) -ForegroundColor DarkGreen -NoNewline
  Write-Host ' [' -ForegroundColor DarkGreen -NoNewline
  Write-Host $Tag -ForegroundColor Green -NoNewline
  Write-Host '] ' -ForegroundColor DarkGreen -NoNewline
  Write-Host $Message -ForegroundColor Green
}

function Write-Command {
  $commands = @(
    'scan perimeter --ports 21,22,80,443 --quiet',
    'sync cache://172.16.48.9/omega --verify',
    'decrypt segment F4A9 --key rotating',
    'trace route shadow-node --hops 9',
    'index fragments --bucket ghost-7F31',
    'mount vault://blackbox --read-only',
    'compile exploit-sim --target sandbox',
    'inspect packet-stream --entropy high',
    'rebuild access-map --strategy silent',
    'probe gateway://10.0.0.1 --latency'
  )

  Write-Host (Get-Clock) -ForegroundColor DarkGreen -NoNewline
  Write-Host ' $ ' -ForegroundColor Green -NoNewline
  Write-Host ($commands | Get-Random) -ForegroundColor Green
}

function Write-HexDump {
  $rows = Get-Random -Minimum 2 -Maximum 6

  for ($row = 0; $row -lt $rows -and $script:running; $row++) {
    $line = '{0} {1}  {2} {3} {4}' -f (Get-Clock), (New-Hex 8), (New-Hex 16), (New-Hex 16), (New-Hex 16)
    Write-Host $line -ForegroundColor DarkGreen
    Start-Sleep -Milliseconds (Get-Random -Minimum 18 -Maximum 65)
  }
}

function Write-ProgressLine {
  $labels = @(
    'cipher/F36ECC',
    'kernel-map/AA19',
    'payload/ghost-ring',
    'telemetry/blackout',
    'matrix/shard-09',
    'vault/sentinel'
  )

  $steps = Get-Random -Minimum 14 -Maximum 28
  $label = $labels | Get-Random

  for ($i = 0; $i -le $steps -and $script:running; $i++) {
    $percent = [int](($i / $steps) * 100)
    $filled = [int](($percent / 100) * 24)
    $bar = ('#' * $filled).PadRight(24, '.')
    $text = "`r{0} [LOAD] [{1}] {2,3}% {3}" -f (Get-Clock), $bar, $percent, $label
    Write-Host $text -ForegroundColor Green -NoNewline
    Start-Sleep -Milliseconds (Get-Random -Minimum 35 -Maximum 100)
  }

  Write-Host ''
}

function Write-StatusBurst {
  $tags = @('TRACE', 'SYNC', 'AUTH', 'LOCKED', 'SCAN', 'CACHE', 'NET', 'IO', 'RETRY', 'OK')
  $messages = @(
    'signature fragment {0} matched',
    'shadow route mapped through node {0}',
    'zero-trust gate returned status SYNC',
    'packet entropy accepted at {0} percent',
    'session token rotated: {0}',
    'remote mirror acknowledged block {0}',
    'temporary fault recovered on bus {0}',
    'access table rebuilt from shard {0}',
    'memory lattice stabilized at sector {0}',
    'handshake replay blocked: {0}'
  )

  $tag = $tags | Get-Random
  $message = ($messages | Get-Random) -f (New-Hex 8)
  Write-Log $tag $message
}

$cancelHandler = [System.ConsoleCancelEventHandler]{
  param($sender, $eventArgs)
  $eventArgs.Cancel = $true
  $script:running = $false
}

try {
  [System.Console]::TreatControlCAsInput = $false
  [System.Console]::add_CancelKeyPress($cancelHandler)
  [System.Console]::Title = 'Hollywood Hacker - Verde'
  [System.Console]::ForegroundColor = 'Green'
  [System.Console]::BackgroundColor = 'Black'
  [System.Console]::CursorVisible = $false

  Write-Banner

  while ($script:running) {
    $choice = Get-Random -Minimum 0 -Maximum 10

    if ($choice -lt 3) {
      Write-Command
    } elseif ($choice -lt 5) {
      Write-HexDump
    } elseif ($choice -lt 7) {
      Write-ProgressLine
    } else {
      Write-StatusBurst
    }

    Start-Sleep -Milliseconds (Get-Random -Minimum 40 -Maximum 170)
  }
} finally {
  [System.Console]::CursorVisible = $true
  [System.Console]::ResetColor()
  Write-Host ''
  Write-Host 'Encerrado.' -ForegroundColor Green
  [System.Console]::remove_CancelKeyPress($cancelHandler)
}
