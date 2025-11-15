<#
PowerShell helper to initialize, commit, and push this repo to GitHub.
Usage:
  1. Install Git for Windows: https://git-scm.com/download/win
  2. Open PowerShell in the project root (this script's folder is ./scripts)
  3. Edit the $remoteUrl variable below (or pass as first argument)
  4. Run: .\scripts\push-changes.ps1

This script will:
 - check for git
 - init repo if needed
 - set branch to main
 - add remote (or update it)
 - stage all changes, commit if needed
 - push to remote and set upstream
#>
param(
  [string]$remoteUrl = '',
  [switch]$Sync
)

# If remote URL not passed, edit the variable below or pass as param
if (-not $remoteUrl -or $remoteUrl -eq '') {
  # Example: https://github.com/your-username/your-repo.git
  $remoteUrl = Read-Host "Enter remote repository URL (HTTPS or SSH)"
}

function Fail($msg) {
  Write-Error $msg
  exit 1
}

# Check git
try {
  git --version > $null 2>&1
} catch {
  Fail "git not found. Install Git for Windows from https://git-scm.com/download/win and try again."
}

# Ensure in repo root (one level up from scripts)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir
Set-Location ..

# Init repo if needed
$gitDirExists = Test-Path -Path .git
if (-not $gitDirExists) {
  git init
  if ($LASTEXITCODE -ne 0) { Fail "git init failed" }
  Write-Output "Initialized empty git repository"
}

# Normalize branch name to main
git branch --show-current 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  # no branch yet
  git checkout -b main
  if ($LASTEXITCODE -ne 0) { Fail "Failed to create main branch" }
} else {
  $current = git branch --show-current
  if ($current -ne 'main') {
    git branch -M main
    if ($LASTEXITCODE -ne 0) { Fail "Failed to rename branch to main" }
  }
}

# Set or update remote
$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Output "Existing remote: $existingRemote"
  if ($existingRemote -ne $remoteUrl) {
    git remote remove origin
    git remote add origin $remoteUrl
    if ($LASTEXITCODE -ne 0) { Fail "Failed to add remote" }
    Write-Output "Remote updated to $remoteUrl"
  } else {
    Write-Output "Remote already set to $remoteUrl"
  }
} else {
  git remote add origin $remoteUrl
  if ($LASTEXITCODE -ne 0) { Fail "Failed to add remote" }
  Write-Output "Remote added: $remoteUrl"
}

# If requested, fetch and pull remote changes before committing local ones
if ($Sync) {
  Write-Output "Sync requested: fetching and pulling remote changes..."
  git fetch origin
  if ($LASTEXITCODE -ne 0) { Fail "git fetch failed" }

  # Use rebase to keep history linear
  git pull --rebase origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "git pull returned non-zero. You may need to resolve merge conflicts manually."
  } else {
    Write-Output "Remote changes pulled and rebased onto local branch."
  }
}

# Stage and commit
git add -A
# commit if changes
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m "feat: pairing — realtime accept + permission prompts; surface edge function errors"
  if ($LASTEXITCODE -ne 0) { Fail "Commit failed" }
  Write-Output "Committed changes"
} else {
  Write-Output "No changes to commit"
}

# Push and set upstream
git push -u origin main
if ($LASTEXITCODE -ne 0) { Fail "Push failed. Check remote URL and authentication. Use 'gh auth login' or set up SSH keys/personal access token." }
Write-Output "Pushed to $remoteUrl"
