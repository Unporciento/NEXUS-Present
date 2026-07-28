param([string]$Root = (Resolve-Path "$PSScriptRoot/../.."))

$required = @(
  'README.md','FICHA_TECNICA.md','AI_HANDOFF.md','CHANGELOG.md','LICENSE',
  'docs/ARCHITECTURE.md','docs/DEVELOPMENT_STANDARD.md','docs/PRESENTATION_CONTRACT.md',
  'docs/SCENE_CONTRACT.md','docs/STATE_CATALOG.md','docs/ACCESSIBILITY.md',
  'docs/SECURITY.md','docs/PUBLISHING.md','docs/DECISIONS.md',
  'docs/ECOSYSTEM_STANDARD.md','docs/LABORATORY.md'
)
$errors = [System.Collections.Generic.List[string]]::new()
foreach ($relative in $required) {
  $path = Join-Path $Root $relative
  if (-not (Test-Path -LiteralPath $path)) { $errors.Add("Missing: $relative"); continue }
  if ((Get-Content -LiteralPath $path).Count -gt 400) { $errors.Add("Over 400 lines: $relative") }
}
$trackedCode = Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object { $_.Extension -in '.html','.css','.js','.mjs' }
if ($trackedCode) { $errors.Add('Production HTML, CSS or JavaScript is present during documentation-only phase.') }
$secretPattern = '(gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_|AKIA[0-9A-Z]{16}|BEGIN( RSA| EC| OPENSSH)? PRIVATE KEY)'
Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object { $_.Extension -eq '.md' -or $_.Name -eq 'LICENSE' } | ForEach-Object {
  if (Select-String -LiteralPath $_.FullName -Pattern $secretPattern -Quiet) { $errors.Add("Possible secret: $($_.FullName)") }
}
foreach ($relative in @('README.md','AI_HANDOFF.md')) {
  if (-not (Select-String -LiteralPath (Join-Path $Root $relative) -Pattern 'DEVELOPMENT_STANDARD|PRESENTATION_CONTRACT' -Quiet)) { $errors.Add("Missing contract reference: $relative") }
}
$required | Where-Object { $_ -like '*.md' } | ForEach-Object {
  $file = Join-Path $Root $_
  [regex]::Matches((Get-Content -LiteralPath $file -Raw), '\]\(([^)#]+)\)') | ForEach-Object {
    $target = $_.Groups[1].Value
    if ($target -notmatch '^https?://' -and -not (Test-Path -LiteralPath (Join-Path (Split-Path $file) $target))) { $errors.Add("Broken link: $target") }
  }
}
$main = git -c "safe.directory=$Root" -C $Root rev-parse main 2>$null
if ($main -ne 'b555504058978c6c889c3cbcaa531b4abce978d4') { $errors.Add('main moved from the approved Phase 1 baseline.') }
if ($errors.Count) { $errors | ForEach-Object { Write-Error $_ }; exit 1 }
Write-Output 'Documentation verification passed.'
