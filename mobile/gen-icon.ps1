# Generates assets/icon.png (solid bg) and assets/splash-icon.png (transparent bg)
# Rubber-stamp "DON'T FIRE ME" in CorpMail red on office-paper gray.
Add-Type -AssemblyName System.Drawing

function New-StampImage([bool]$solidBg, [string]$outPath) {
  $size = 1024
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'

  if ($solidBg) {
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#DFE3EA'))
    # faint ruled lines like the app background
    $linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(18, 30, 58, 110)), 3
    for ($y = 0; $y -lt $size; $y += 56) { $g.DrawLine($linePen, 0, $y, $size, $y) }
    $linePen.Dispose()
  } else {
    $g.Clear([System.Drawing.Color]::Transparent)
  }

  $red = [System.Drawing.ColorTranslator]::FromHtml('#C03B2D')
  $redBrush = New-Object System.Drawing.SolidBrush $red

  # rotate around center
  $g.TranslateTransform($size/2, $size/2)
  $g.RotateTransform(-8)

  # double border stamp rectangle
  $w = 780; $h = 560
  $outer = New-Object System.Drawing.Pen $red, 22
  $inner = New-Object System.Drawing.Pen $red, 10
  $g.DrawRectangle($outer, -$w/2, -$h/2, $w, $h)
  $g.DrawRectangle($inner, (-$w/2 + 34), (-$h/2 + 34), ($w - 68), ($h - 68))

  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'

  $fontBig = New-Object System.Drawing.Font('Consolas', 150, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fontSmall = New-Object System.Drawing.Font('Consolas', 96, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

  $left = [single](-$w / 2)
  $rTop = [System.Drawing.RectangleF]::new($left, [single](-$h / 2 + 60), [single]$w, 130)
  $rMid = [System.Drawing.RectangleF]::new($left, -85, [single]$w, 170)
  $rBot = [System.Drawing.RectangleF]::new($left, 95, [single]$w, 170)
  $g.DrawString("DON'T", $fontSmall, $redBrush, $rTop, $fmt)
  $g.DrawString('FIRE', $fontBig, $redBrush, $rMid, $fmt)
  $g.DrawString('ME', $fontBig, $redBrush, $rBot, $fmt)

  $g.Dispose()
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "wrote $outPath"
}

$assets = Join-Path $PSScriptRoot 'assets'
New-StampImage $true  (Join-Path $assets 'icon.png')
New-StampImage $false (Join-Path $assets 'splash-icon.png')
