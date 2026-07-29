param([string]$Root = (Resolve-Path "$PSScriptRoot/../.."))

$required = @(
  'README.md','FICHA_TECNICA.md','AI_HANDOFF.md','CHANGELOG.md','LICENSE',
  'docs/ARCHITECTURE.md','docs/DEVELOPMENT_STANDARD.md','docs/PRESENTATION_CONTRACT.md',
  'docs/SCENE_CONTRACT.md','docs/STATE_CATALOG.md','docs/ACCESSIBILITY.md',
  'docs/SECURITY.md','docs/PUBLISHING.md','docs/DECISIONS.md',
  'docs/ECOSYSTEM_STANDARD.md','docs/LABORATORY.md','docs/PRODUCT_VISION_1_0.md','docs/PLAYER_CONTRACT.md','docs/RESPONSIVE_REVIEW.md','docs/THEME_CONTRACT.md','docs/LAYOUT_CONTRACT.md',
  'docs/USER_JOURNEYS.md','docs/PUBLICATION_CONTRACT.md'
)
$errors = [System.Collections.Generic.List[string]]::new()
foreach ($relative in $required) {
  $path = Join-Path $Root $relative
  if (-not (Test-Path -LiteralPath $path)) { $errors.Add("Missing: $relative"); continue }
  if ((Get-Content -LiteralPath $path).Count -gt 400) { $errors.Add("Over 400 lines: $relative") }
}
$forbiddenUi = Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object { ($_.Extension -in '.html','.css' -and $_.Name -notin 'index.html','styles.css') -or ($_.Extension -in '.js','.mjs' -and $_.FullName -notmatch '[\\/](src[\\/](contracts|player|ui|input|themes|layouts)|tests|demo|tools)[\\/]' -and $_.Name -ne 'app.js') }
if ($forbiddenUi) { $errors.Add('Unexpected production code is present.') }
$secretPattern = '(gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_|AKIA[0-9A-Z]{16}|BEGIN( RSA| EC| OPENSSH)? PRIVATE KEY)'
Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object { $_.Extension -eq '.md' -or $_.Name -eq 'LICENSE' } | ForEach-Object {
  if (Select-String -LiteralPath $_.FullName -Pattern $secretPattern -Quiet) { $errors.Add("Possible secret: $($_.FullName)") }
}
foreach ($relative in @('README.md','AI_HANDOFF.md')) {
  if (-not (Select-String -LiteralPath (Join-Path $Root $relative) -Pattern 'DEVELOPMENT_STANDARD|PRESENTATION_CONTRACT' -Quiet)) { $errors.Add("Missing contract reference: $relative") }
  if (-not (Select-String -LiteralPath (Join-Path $Root $relative) -Pattern 'PLAYER_CONTRACT' -Quiet)) { $errors.Add("Missing Player contract reference: $relative") }
}
if (-not (Select-String -LiteralPath (Join-Path $Root 'docs/PRODUCT_VISION_1_0.md') -Pattern 'Studio|Player|Presenter|Publisher|Laboratory' -Quiet)) { $errors.Add('Missing NEXUS pillar in product vision.') }
if (-not (Select-String -LiteralPath (Join-Path $Root 'docs/PUBLICATION_CONTRACT.md') -Pattern 'PublicBundle|PublishAdapter' -Quiet)) { $errors.Add('Missing publication contract concepts.') }
$required | Where-Object { $_ -like '*.md' } | ForEach-Object {
  $file = Join-Path $Root $_
  [regex]::Matches((Get-Content -LiteralPath $file -Raw), '\]\(([^)#]+)\)') | ForEach-Object {
    $target = $_.Groups[1].Value
    if ($target -notmatch '^https?://' -and -not (Test-Path -LiteralPath (Join-Path (Split-Path $file) $target))) { $errors.Add("Broken link: $target") }
  }
}
$main = git -c "safe.directory=$Root" -C $Root rev-parse main 2>$null
if ($main -ne '756e0031ed126b7618e318230e2196b2a7d29ae6') { $errors.Add('main moved from the approved Phase 3 completion commit.') }
if ($errors.Count) { $errors | ForEach-Object { Write-Error $_ }; exit 1 }
Write-Output 'Documentation verification passed.'
