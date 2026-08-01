param([string]$Root = (Resolve-Path "$PSScriptRoot/../.."))

$required = @(
  'README.md','FICHA_TECNICA.md','AI_HANDOFF.md','CHANGELOG.md','LICENSE',
  'docs/ARCHITECTURE.md','docs/DEVELOPMENT_STANDARD.md','docs/PRESENTATION_CONTRACT.md',
  'docs/SCENE_CONTRACT.md','docs/STATE_CATALOG.md','docs/ACCESSIBILITY.md',
  'docs/SECURITY.md','docs/PUBLISHING.md','docs/DECISIONS.md',
  'docs/ECOSYSTEM_STANDARD.md','docs/LABORATORY.md','docs/PRODUCT_VISION_1_0.md','docs/PLAYER_CONTRACT.md','docs/RESPONSIVE_REVIEW.md','docs/THEME_CONTRACT.md','docs/LAYOUT_CONTRACT.md',
  'docs/USER_JOURNEYS.md','docs/PUBLICATION_CONTRACT.md','docs/PREVIEW_BRIDGE.md',
  'docs/EXPORT_SERVICE.md','docs/ONBOARDING.md','docs/HELP_SYSTEM.md',
  'docs/PHASE_6_PLAN.md','docs/IMPORT_CONTRACT.md','docs/DRAFT_REPOSITORY.md',
  'docs/STORAGE_MODEL.md','docs/MIGRATION_PLAN.md',
  'docs/ASSET_ARCHITECTURE.md','docs/MEDIA_CONTRACT.md','docs/MOTION_SYSTEM.md',
  'docs/ENGINE_AUDIT_PHASE_7.md','docs/PACKAGE_CONTRACT.md','docs/PORTABLE_RUNTIME.md',
  'THIRD_PARTY_NOTICES.md','docs/SECURITY_REVIEW_1.0.md','docs/PERFORMANCE_BUDGET_1.0.md',
  'docs/COMPATIBILITY_MATRIX_1.0.md','docs/RELEASE_CANDIDATE_REPORT.md',
  'docs/LAUNCH_CHECKLIST.md','docs/ROLLBACK_PLAN.md','docs/GITHUB_PAGES_PLAN.md',
  'docs/PRIVACY.md','docs/TERMS.md','docs/FAQ.md','docs/SUPPORT.md'
)
$errors = [System.Collections.Generic.List[string]]::new()
foreach ($relative in $required) {
  $path = Join-Path $Root $relative
  if (-not (Test-Path -LiteralPath $path)) { $errors.Add("Missing: $relative"); continue }
  if ((Get-Content -LiteralPath $path).Count -gt 400) { $errors.Add("Over 400 lines: $relative") }
}
$forbiddenUi = Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object {
  $_.FullName -notmatch '[\\/](node_modules|dist|artifacts)[\\/]' -and
  (($_.Extension -in '.html','.css' -and $_.Name -notin 'index.html','studio.html','library.html','404.html','styles.css') -or
   ($_.Extension -in '.js','.mjs' -and $_.FullName -notmatch '[\\/](src[\\/](contracts|player|ui|input|themes|layouts|media|studio|import|storage|library|package)|tests|demo|tools|portable|vendor)[\\/]' -and $_.Name -notin 'app.js','studio.js','library.js','version.js'))
}
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
if ($main -ne '8c108df87ce40747405f6dbd7092f582194ecfae') { $errors.Add('main moved from the approved Phase 5 complete commit.') }
if ($errors.Count) { $errors | ForEach-Object { Write-Error $_ }; exit 1 }
Write-Output 'Documentation verification passed.'
