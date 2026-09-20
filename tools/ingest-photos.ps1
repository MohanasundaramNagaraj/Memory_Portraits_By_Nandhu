<#
.SYNOPSIS
    Drops the studio's original photographs into the website's image folders,
    resized for the web and renamed to the filenames the pages already use.

.DESCRIPTION
    1. Put your original JPG/PNG photos into these folders (create them next to this script):

           tools/incoming/hero/        (optional: name them hero-home.jpg, hero-wedding.jpg, ... to override heroes)
           tools/incoming/weddings/
           tools/incoming/newborn/
           tools/incoming/maternity/
           tools/incoming/toddlers/
           tools/incoming/about/       (about-photographer.jpg, about-studio.jpg)

       Order matters: files are sorted by name, so prefix them (01-, 02-, ...) if you want a
       particular photo in a particular slot. wedding-01.jpg is the first wedding photo, etc.

    2. Run in PowerShell:   .\tools\ingest-photos.ps1
       Add -DryRun to preview without writing anything.

    The script resizes to a maximum long edge (default 1920px), saves JPEG at quality 82,
    strips nothing from your originals (they are never modified), and overwrites the
    placeholder images in assets/images/<category>/.

    Landscape/portrait is detected automatically; the website's gallery slots crop to fit,
    so the aspect ratio does not have to match the placeholder exactly.
#>
param(
    [int]$MaxEdge = 1920,
    [int]$Quality = 82,
    [switch]$DryRun
)

Add-Type -AssemblyName System.Drawing

$root     = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$incoming = Join-Path $PSScriptRoot 'incoming'
$assets   = Join-Path $root 'assets\images'

$plan = @{
    weddings  = 'wedding-{0:D2}.jpg'
    newborn   = 'newborn-{0:D2}.jpg'
    maternity = 'maternity-{0:D2}.jpg'
    toddlers  = 'toddler-{0:D2}.jpg'
}

if (-not (Test-Path $incoming)) {
    New-Item -ItemType Directory -Force -Path $incoming | Out-Null
    foreach ($d in @('hero','weddings','newborn','maternity','toddlers','about')) {
        New-Item -ItemType Directory -Force -Path (Join-Path $incoming $d) | Out-Null
    }
    Write-Host "Created $incoming with one sub-folder per category."
    Write-Host "Copy the studio's original photos into those folders, then run this script again."
    exit 0
}

function Save-Resized([string]$src, [string]$dst, [int]$maxEdge, [int]$quality, [switch]$dry) {
    $img = [System.Drawing.Image]::FromFile($src)
    try {
        $w = $img.Width; $h = $img.Height
        $scale = [Math]::Min(1.0, $maxEdge / [Math]::Max($w, $h))
        $nw = [int][Math]::Round($w * $scale); $nh = [int][Math]::Round($h * $scale)

        if ($dry) { Write-Host ("  {0}  ->  {1}   ({2}x{3} -> {4}x{5})" -f (Split-Path $src -Leaf), (Split-Path $dst -Leaf), $w, $h, $nw, $nh); return }

        $bmp = New-Object System.Drawing.Bitmap $nw, $nh
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($img, 0, 0, $nw, $nh)
        $g.Dispose()

        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
        $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$quality)
        $bmp.Save($dst, $codec, $ep)
        $bmp.Dispose(); $ep.Dispose()
        Write-Host ("  {0}  ->  {1}   ({2}x{3} -> {4}x{5}, {6:N0} KB)" -f (Split-Path $src -Leaf), (Split-Path $dst -Leaf), $w, $h, $nw, $nh, ((Get-Item $dst).Length / 1KB))
    } finally { $img.Dispose() }
}

$exts = '*.jpg','*.jpeg','*.png','*.JPG','*.JPEG','*.PNG'
$total = 0

# Sequentially numbered categories
foreach ($cat in $plan.Keys) {
    $srcDir = Join-Path $incoming $cat
    if (-not (Test-Path $srcDir)) { continue }
    $files = Get-ChildItem -Path (Join-Path $srcDir "*") -Include $exts -File -Recurse | Sort-Object Name
    if (-not $files) { continue }
    Write-Host "`n[$cat] $($files.Count) photo(s)"
    $i = 1
    foreach ($f in $files) {
        $dst = Join-Path (Join-Path $assets $cat) ($plan[$cat] -f $i)
        Save-Resized $f.FullName $dst $MaxEdge $Quality -dry:$DryRun
        $i++; $total++
    }
    $expected = (Get-ChildItem (Join-Path $assets $cat) -Filter '*.jpg').Count
    if ($files.Count -lt $expected) {
        Write-Host ("  note: the site references {0} {1} images; {2} placeholder(s) remain until you add more." -f $expected, $cat, ($expected - $files.Count))
    }
}

# Named files: heroes and about (keep whatever filename you give them)
foreach ($cat in @('hero','about')) {
    $srcDir = Join-Path $incoming $cat
    if (-not (Test-Path $srcDir)) { continue }
    $files = Get-ChildItem -Path (Join-Path $srcDir "*") -Include $exts -File | Sort-Object Name
    if (-not $files) { continue }
    Write-Host "`n[$cat] $($files.Count) photo(s)"
    foreach ($f in $files) {
        $name = [IO.Path]::GetFileNameWithoutExtension($f.Name) + '.jpg'
        $dst = Join-Path (Join-Path $assets $cat) $name
        Save-Resized $f.FullName $dst $MaxEdge $Quality -dry:$DryRun
        $total++
    }
}

Write-Host ("`n{0} photo(s) {1}." -f $total, $(if ($DryRun) { 'previewed (dry run, nothing written)' } else { 'written into assets/images' }))
