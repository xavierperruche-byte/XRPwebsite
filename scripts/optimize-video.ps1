Param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile,
    [Parameter(Mandatory=$true)]
    [string]$OutPrefix
)

function Fail($msg){ Write-Error $msg; exit 1 }

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Fail "ffmpeg not found in PATH. Install ffmpeg and re-run."
}

$inPath = Resolve-Path -LiteralPath $InputFile
$inDir = Split-Path -Parent $inPath

$mp4_720 = Join-Path $inDir "$OutPrefix-720.mp4"
$webm_720 = Join-Path $inDir "$OutPrefix-720.webm"
$mp4_480 = Join-Path $inDir "$OutPrefix-480.mp4"

Write-Host "Input: $inPath"
Write-Host "Output directory: $inDir"

Write-Host "Generating optimized MP4 (H.264) - 720p -> $mp4_720"
& ffmpeg -y -i $inPath -c:v libx264 -preset slow -crf 28 -vf "scale='min(1280,iw)':'-2'" -c:a aac -b:a 96k $mp4_720

Write-Host "Generating optimized WebM (VP9) - 720p -> $webm_720"
& ffmpeg -y -i $inPath -c:v libvpx-vp9 -b:v 800k -vf "scale='min(1280,iw)':'-2'" -c:a libopus -b:a 64k $webm_720

Write-Host "Generating smaller MP4 (480p) as fallback -> $mp4_480"
& ffmpeg -y -i $inPath -c:v libx264 -preset faster -crf 30 -vf "scale='min(854,iw)':'-2'" -c:a aac -b:a 64k $mp4_480

Write-Host "Done. Files written to: $inDir"
