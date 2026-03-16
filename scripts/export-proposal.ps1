$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$mdPath = Join-Path $root "PROJECT_PROPOSAL_GreenSight.md"
$docxPath = Join-Path $root "PROJECT_PROPOSAL_GreenSight.docx"
$pdfPath = Join-Path $root "PROJECT_PROPOSAL_GreenSight.pdf"

if (-not (Test-Path $mdPath)) {
  throw "Markdown proposal not found: $mdPath"
}

$lines = Get-Content -Path $mdPath
$word = $null
$doc = $null
$sel = $null

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $doc = $word.Documents.Add()
  $sel = $word.Selection

  foreach ($line in $lines) {
    if ($line -match '^# (.+)$') {
      $sel.Style = "Heading 1"
      $sel.TypeText($Matches[1])
      $sel.TypeParagraph()
      continue
    }
    if ($line -match '^## (.+)$') {
      $sel.Style = "Heading 2"
      $sel.TypeText($Matches[1])
      $sel.TypeParagraph()
      continue
    }
    if ($line -match '^### (.+)$') {
      $sel.Style = "Heading 3"
      $sel.TypeText($Matches[1])
      $sel.TypeParagraph()
      continue
    }
    if ($line -match '^---$') {
      $sel.Style = "Normal"
      $sel.TypeParagraph()
      continue
    }

    $clean = $line -replace '\*\*(.*?)\*\*', '$1' -replace '\*(.*?)\*', '$1'
    $sel.Style = "Normal"
    $sel.TypeText($clean)
    $sel.TypeParagraph()
  }

  $doc.SaveAs2($docxPath, 16)
  $doc.ExportAsFixedFormat($pdfPath, 17)

  Write-Output "Generated: $docxPath"
  Write-Output "Generated: $pdfPath"
}
finally {
  if ($doc -ne $null) { $doc.Close() }
  if ($word -ne $null) { $word.Quit() }
  if ($sel -ne $null) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($sel) }
  if ($doc -ne $null) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
  if ($word -ne $null) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
}
