# HomeHeart Smart Composer - Complete Windows Installation Guide

**Version:** 2.1
**Last Updated:** 2025-12-18
**Tested On:** Windows 11, Node.js v24.x, Git for Windows

This guide captures all the issues encountered during installation and provides checks and fixes for each one. Follow it step-by-step for a smooth installation.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Pre-Flight Checks](#2-pre-flight-checks)
3. [Clone and Build the Plugin](#3-clone-and-build-the-plugin)
4. [Install Plugin to Obsidian Vault](#4-install-plugin-to-obsidian-vault)
5. [Install Claude Code CLI](#5-install-claude-code-cli)
6. [Configure and Test](#6-configure-and-test)
7. [Troubleshooting Reference](#7-troubleshooting-reference)
8. [Corporate/Managed Machine Issues](#8-corporatemanaged-machine-issues)
9. [Database Files (Templates & Vector Index)](#database-files-templates--vector-index)
10. [GUI Database Locator](#gui-database-locator-find-smartcomposerdatabaseps1)

---

## 1. Prerequisites

You need the following installed:

| Software | Minimum Version | Download |
|----------|-----------------|----------|
| Node.js | v18+ (v24 tested) | https://nodejs.org/ |
| npm | v9+ (comes with Node) | - |
| Git for Windows | Any recent | https://git-scm.com/downloads/win |
| Obsidian | v1.4+ | https://obsidian.md/ |

---

## 2. Pre-Flight Checks

Run these checks **BEFORE** building. Each check has a fix if it fails.

### 2.1 Check: PowerShell Execution Policy

**FIRST:** Ensure PowerShell can run scripts:

```powershell
Get-ExecutionPolicy
```

**Expected:** `RemoteSigned`, `Unrestricted`, or `Bypass`

**If it shows `Restricted`:**
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# If you can't run as admin (managed machine), try:
Set-ExecutionPolicy Bypass -Scope Process
# (This only affects current session)
```

---

### 2.2 Check: Node.js and npm installed

```powershell
node --version
npm --version
```

**Expected:** Version numbers displayed (Node v18+, npm v9+)

**If fails:** Install Node.js from https://nodejs.org/

**If behind corporate proxy, configure npm first:**
```powershell
# Replace with your proxy URL:
npm config set proxy http://proxy.yourcompany.com:8080
npm config set https-proxy http://proxy.yourcompany.com:8080
```

---

### 2.3 Check: Git installed and in PATH

```powershell
git --version
where.exe git
```

**Expected:** Git version and path displayed

**If fails:** Install Git for Windows from https://git-scm.com/downloads/win

---

### 2.4 Check: Git Bash exists and is NOT WSL

**CRITICAL:** If WSL is installed, `bash` might resolve to WSL's bash instead of Git Bash. The Claude Code CLI needs Git Bash specifically.

```powershell
# Check what 'bash' resolves to:
where.exe bash 2>$null

# Check if it's Git Bash or WSL:
$bashOutput = & bash --version 2>&1 | Out-String
if ($bashOutput -match "pc-linux" -or $bashOutput -match "microsoft") {
    Write-Host "WARNING: 'bash' resolves to WSL, not Git Bash!" -ForegroundColor Red
    Write-Host "You MUST set CLAUDE_CODE_GIT_BASH_PATH explicitly (see Section 5.1)" -ForegroundColor Yellow
} else {
    Write-Host "OK: bash appears to be Git Bash" -ForegroundColor Green
}
```

---

### 2.5 Check: Find Git Bash Location

Find where bash.exe is installed (we'll need this for Claude Code):

```powershell
# Search all common Git installation locations:
$bashPaths = @(
    # User-installed Git (most common on personal machines)
    "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe",

    # System-installed Git (Program Files)
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe",

    # Chocolatey
    "$env:ProgramData\chocolatey\lib\git\tools\bin\bash.exe",
    "C:\tools\git\bin\bash.exe",

    # Scoop
    "$env:USERPROFILE\scoop\apps\git\current\bin\bash.exe",

    # winget (may install to Program Files)
    "C:\Program Files\Git\bin\bash.exe",

    # GitHub Desktop bundled Git
    "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\bash.exe"
)

$foundBash = $null
foreach ($path in $bashPaths) {
    # Handle wildcards (for GitHub Desktop)
    $resolved = Resolve-Path $path -ErrorAction SilentlyContinue
    if ($resolved) {
        $foundBash = $resolved.Path
        Write-Host "Found bash.exe at: $foundBash" -ForegroundColor Green
        break
    }
}

if (-not $foundBash) {
    Write-Host "ERROR: Could not find bash.exe!" -ForegroundColor Red
    Write-Host "Install Git for Windows from https://git-scm.com/downloads/win" -ForegroundColor Yellow

    # Last resort - search the whole system (slow)
    Write-Host "Searching system (this may take a minute)..."
    $foundBash = Get-ChildItem -Path "C:\" -Filter "bash.exe" -Recurse -ErrorAction SilentlyContinue |
                 Where-Object { $_.FullName -notmatch "Windows\\System32" -and $_.FullName -notmatch "WindowsApps" } |
                 Select-Object -First 1 -ExpandProperty FullName
    if ($foundBash) {
        Write-Host "Found bash.exe at: $foundBash" -ForegroundColor Green
    }
}

# Save for later use:
$env:FOUND_BASH_PATH = $foundBash
```

**Write down this path** - you'll need it in Section 5.1.

---

### 2.6 Check: Git is in User PATH

```powershell
# Check if Git cmd is in your user PATH
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -match 'Git') {
    Write-Host "OK: Git is in User PATH" -ForegroundColor Green
    $userPath -split ';' | Where-Object { $_ -match 'Git' }
} else {
    Write-Host "WARNING: Git not found in User PATH" -ForegroundColor Yellow
}
```

**If missing:**
```powershell
# Find your Git cmd folder (not bin, cmd!):
$gitCmd = Split-Path (Split-Path $env:FOUND_BASH_PATH) -Parent
$gitCmd = Join-Path $gitCmd "cmd"

if (Test-Path $gitCmd) {
    $currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($currentPath -notlike "*$gitCmd*") {
        [Environment]::SetEnvironmentVariable('Path', "$currentPath;$gitCmd", 'User')
        Write-Host "Added $gitCmd to PATH. Restart terminal to apply." -ForegroundColor Green
    }
} else {
    Write-Host "Could not find Git cmd folder. Add manually." -ForegroundColor Red
}
```

---

### 2.7 Check: NODE_ENV is not set to 'production'

**CRITICAL:** If `NODE_ENV=production`, npm will NOT install devDependencies and the build will fail!

```powershell
$nodeEnvSession = $env:NODE_ENV
$nodeEnvUser = [Environment]::GetEnvironmentVariable('NODE_ENV', 'User')
$nodeEnvMachine = [Environment]::GetEnvironmentVariable('NODE_ENV', 'Machine')

Write-Host "NODE_ENV (session):  $nodeEnvSession"
Write-Host "NODE_ENV (user):     $nodeEnvUser"
Write-Host "NODE_ENV (machine):  $nodeEnvMachine"

if ($nodeEnvSession -eq 'production' -or $nodeEnvUser -eq 'production' -or $nodeEnvMachine -eq 'production') {
    Write-Host "WARNING: NODE_ENV is set to 'production'!" -ForegroundColor Red
    Write-Host "This will prevent devDependencies from installing." -ForegroundColor Yellow
} else {
    Write-Host "OK: NODE_ENV is not production" -ForegroundColor Green
}
```

**If it shows "production":**
```powershell
# Temporarily override for this session:
$env:NODE_ENV = "development"

# Or permanently remove from User environment:
[Environment]::SetEnvironmentVariable('NODE_ENV', $null, 'User')
```

---

### 2.8 Check: npm global bin is in PATH

```powershell
$npmPrefix = npm config get prefix
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')

Write-Host "npm global prefix: $npmPrefix"

if ($userPath -like "*$npmPrefix*") {
    Write-Host "OK: npm prefix is in PATH" -ForegroundColor Green
} else {
    Write-Host "WARNING: npm prefix not in PATH" -ForegroundColor Yellow
}
```

**If missing:**
```powershell
$npmPrefix = npm config get prefix
$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($currentPath -notlike "*$npmPrefix*") {
    [Environment]::SetEnvironmentVariable('Path', "$currentPath;$npmPrefix", 'User')
    Write-Host "Added $npmPrefix to PATH. Restart terminal."
}
```

---

### 2.9 Check: Network Connectivity

```powershell
# Test connectivity to required services:
$urls = @(
    @{Name="GitHub"; URL="https://github.com"},
    @{Name="npm Registry"; URL="https://registry.npmjs.org"},
    @{Name="Claude AI"; URL="https://claude.ai"}
)

foreach ($site in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $site.URL -Method Head -TimeoutSec 10 -UseBasicParsing
        Write-Host "OK: $($site.Name) reachable" -ForegroundColor Green
    } catch {
        Write-Host "FAIL: $($site.Name) not reachable - $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

**If any fail, see [Section 8: Corporate/Managed Machine Issues](#8-corporatemanaged-machine-issues)**

---

## 3. Clone and Build the Plugin

### 3.1 Get the source code

**Option A: Clone from GitHub (if repository is published)**

```powershell
cd C:\Projects  # or wherever you keep projects

# Test if repo exists first:
$repoUrl = "https://github.com/HomeHeartTherapy/obsidian-smart-composer"
try {
    Invoke-WebRequest -Uri $repoUrl -Method Head -TimeoutSec 10 -UseBasicParsing | Out-Null
    Write-Host "Repository exists, cloning..." -ForegroundColor Green
    git clone "$repoUrl.git" obsidian-smart-composer-homeheart-UPGRADED
} catch {
    Write-Host "Repository not found at $repoUrl" -ForegroundColor Red
    Write-Host "Use Option B (copy from local/network path) instead" -ForegroundColor Yellow
}

cd obsidian-smart-composer-homeheart-UPGRADED
```

**Option B: Copy from local/network path**

If the repo isn't on GitHub yet, copy from another machine:

```powershell
# From USB drive, network share, etc:
$sourcePath = "D:\obsidian-smart-composer-homeheart-UPGRADED"  # <-- CHANGE THIS
$destPath = "C:\Projects\obsidian-smart-composer-homeheart-UPGRADED"

Copy-Item -Path $sourcePath -Destination $destPath -Recurse
cd $destPath

# Clean any existing build artifacts:
Remove-Item -Recurse -Force node_modules, main.js -ErrorAction SilentlyContinue
```

### 3.2 Install dependencies

**IMPORTANT:** Use these exact flags to avoid issues:

```powershell
# Ensure NODE_ENV is not production (critical!)
$env:NODE_ENV = "development"

# Install with legacy-peer-deps to handle langchain conflicts
npm install --legacy-peer-deps --include=dev
```

**Verify devDependencies installed:**
```powershell
# TypeScript must be present - this is the canary check
if (Test-Path "node_modules\typescript") {
    Write-Host "OK: devDependencies installed" -ForegroundColor Green
} else {
    Write-Host "FAIL: devDependencies missing! See troubleshooting." -ForegroundColor Red
}
```

**If devDependencies missing:**
```powershell
# Nuclear option - clean and reinstall:
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
$env:NODE_ENV = "development"
npm install --legacy-peer-deps --include=dev
```

### 3.3 Build the plugin

```powershell
# Run esbuild directly (skip tsc type-check if it fails with newer TypeScript)
node esbuild.config.mjs production
```

**If you get TypeScript errors** about Buffer/ArrayBuffer, that's OK - just run esbuild directly (above command). The type error doesn't affect the build output.

**Verify build output:**
```powershell
$files = @("main.js", "manifest.json", "styles.css")
$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "OK: $file ($([math]::Round($size/1KB, 1)) KB)" -ForegroundColor Green
    } else {
        Write-Host "MISSING: $file" -ForegroundColor Red
        $allExist = $false
    }
}

if ($allExist) {
    Write-Host "`nBuild successful!" -ForegroundColor Green
} else {
    Write-Host "`nBuild failed - check errors above" -ForegroundColor Red
}
```

---

## 4. Install Plugin to Obsidian Vault

### 4.1 Create plugin folder

```powershell
# Replace with YOUR vault path:
$vaultPath = "C:\obsidian-test"  # <-- CHANGE THIS

# Verify vault exists:
if (-not (Test-Path $vaultPath)) {
    Write-Host "ERROR: Vault not found at $vaultPath" -ForegroundColor Red
    Write-Host "Create the vault in Obsidian first, or correct the path." -ForegroundColor Yellow
    return
}

# Verify .obsidian folder exists (confirms it's a real vault):
if (-not (Test-Path "$vaultPath\.obsidian")) {
    Write-Host "ERROR: $vaultPath doesn't appear to be an Obsidian vault" -ForegroundColor Red
    Write-Host "Open this folder as a vault in Obsidian first." -ForegroundColor Yellow
    return
}

$pluginPath = "$vaultPath\.obsidian\plugins\smart-composer"
New-Item -ItemType Directory -Force -Path $pluginPath | Out-Null
Write-Host "Created plugin folder: $pluginPath" -ForegroundColor Green
```

### 4.2 Copy built files

```powershell
Copy-Item main.js, manifest.json, styles.css -Destination $pluginPath -Force
Write-Host "Copied plugin files to vault" -ForegroundColor Green
```

### 4.3 Verify installation

```powershell
Get-ChildItem $pluginPath | Format-Table Name, Length
```

Should show: `main.js` (~8MB), `manifest.json`, `styles.css`

### 4.4 Enable in Obsidian

1. Open Obsidian with your vault
2. Settings → Community plugins → Turn OFF "Restricted mode"
3. Scroll down, find "Smart Composer" → Toggle ON
4. Settings → Smart Composer → Verify you see:
   - `claude-code` provider in providers list
   - `claude-code/opus-4.5`, `claude-code/sonnet-4.5`, etc. in models list

---

## 5. Install Claude Code CLI

The Claude Code CLI lets you use your Max/Pro subscription instead of API fees.

### 5.1 Set Git Bash path environment variable

**CRITICAL:** The installer needs to find Git Bash. Set this FIRST.

```powershell
# Use the path we found in Section 2.5, or search again:
$bashPaths = @(
    "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe",
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe",
    "$env:ProgramData\chocolatey\lib\git\tools\bin\bash.exe",
    "C:\tools\git\bin\bash.exe",
    "$env:USERPROFILE\scoop\apps\git\current\bin\bash.exe"
)

$bashPath = $bashPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($bashPath) {
    Write-Host "Found bash at: $bashPath" -ForegroundColor Green
    [Environment]::SetEnvironmentVariable('CLAUDE_CODE_GIT_BASH_PATH', $bashPath, 'User')
    Write-Host "Set CLAUDE_CODE_GIT_BASH_PATH environment variable" -ForegroundColor Green

    # Also set for current session:
    $env:CLAUDE_CODE_GIT_BASH_PATH = $bashPath
} else {
    Write-Host "ERROR: Could not find bash.exe!" -ForegroundColor Red
    Write-Host "Install Git for Windows first: https://git-scm.com/downloads/win" -ForegroundColor Yellow
    return
}
```

**Verify it's set:**
```powershell
[Environment]::GetEnvironmentVariable('CLAUDE_CODE_GIT_BASH_PATH', 'User')
```

### 5.2 Install Claude Code

**Open a NEW PowerShell window** (to pick up the environment variable), then:

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Expected output:**
```
✔ Claude Code successfully installed!
  Version: 2.x.x
  Location: C:\Users\<YOU>\.local\bin\claude.exe
```

**If the installer says "Installation complete!" but doesn't show the version/location**, it failed silently. See [Troubleshooting](#problem-claude-code-installer-says-complete-but-claude-not-found).

### 5.3 Add Claude to PATH

The installer puts claude.exe in `~\.local\bin` which is NOT in PATH by default:

```powershell
$claudePath = "$env:USERPROFILE\.local\bin"
$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')

if ($currentPath -notlike "*$claudePath*") {
    [Environment]::SetEnvironmentVariable('Path', "$currentPath;$claudePath", 'User')
    Write-Host "Added $claudePath to PATH. Restart terminal." -ForegroundColor Green
} else {
    Write-Host "Claude path already in PATH" -ForegroundColor Green
}
```

### 5.4 Verify installation

**Open a NEW PowerShell window**, then:

```powershell
claude --version
```

**Expected:** `2.0.65` or similar

**If "not recognized":**
```powershell
# Check if the exe exists:
Test-Path "$env:USERPROFILE\.local\bin\claude.exe"

# If False, installation failed - redo Section 5.1-5.2
# If True, PATH issue - redo Section 5.3 and restart terminal
```

### 5.5 Login to Claude

```powershell
claude login
```

Follow the browser prompts to authenticate with your Anthropic account.

**If browser doesn't open (headless/remote machine):**
```powershell
# The login URL will be displayed - copy and open it manually
claude login --no-browser
```

---

## 6. Configure and Test

### 6.1 Select a Claude Code model in Obsidian

1. Open Obsidian → Settings → Smart Composer
2. Find the **Chat Model** dropdown
3. Select one of:
   - `claude-code/opus-4.5` - Fastest responses
   - `claude-code/opus-4.5-think` - Light reasoning (~4k tokens)
   - `claude-code/opus-4.5-think-hard` - Deeper reasoning (~10k tokens)
   - `claude-code/opus-4.5-ultrathink` - Maximum reasoning (~32k tokens)

### 6.2 Open Smart Composer

- Click the brain icon in the left ribbon, OR
- Press `Ctrl+Alt+I`

### 6.3 Test it

Send a message like: "Hello! What model are you?"

**Expected:** Response from Claude via your Max/Pro subscription (no API cost!)

---

## 7. Troubleshooting Reference

### Problem: PowerShell scripts won't run

**Cause:** Execution policy is Restricted

**Fix:**
```powershell
# As Administrator:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# If no admin access:
Set-ExecutionPolicy Bypass -Scope Process
```

---

### Problem: `npm install` doesn't install devDependencies

**Cause:** `NODE_ENV=production` is set somewhere

**Check:**
```powershell
$env:NODE_ENV
[Environment]::GetEnvironmentVariable('NODE_ENV', 'User')
[Environment]::GetEnvironmentVariable('NODE_ENV', 'Machine')
```

**Fix:**
```powershell
$env:NODE_ENV = "development"
npm install --legacy-peer-deps --include=dev
```

---

### Problem: `npm install` fails with ERESOLVE dependency conflict

**Cause:** langchain packages have peer dependency conflicts

**Fix:** Always use `--legacy-peer-deps`:
```powershell
npm install --legacy-peer-deps
```

---

### Problem: `tsc` not found during build

**Cause:** TypeScript not installed (see NODE_ENV issue above)

**Fix:** Either fix devDependencies install, or skip tsc and run esbuild directly:
```powershell
node esbuild.config.mjs production
```

---

### Problem: TypeScript error about Buffer/ArrayBuffer

**Cause:** Newer TypeScript version is stricter

**Fix:** Skip type-check, run esbuild directly:
```powershell
node esbuild.config.mjs production
```

---

### Problem: Claude Code installer says complete but `claude` not found

**Cause:** Installer couldn't find Git Bash, silently skipped actual installation

**Check:**
```powershell
# Was the env var set?
[Environment]::GetEnvironmentVariable('CLAUDE_CODE_GIT_BASH_PATH', 'User')

# Does the exe exist?
Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
```

**Fix:**
```powershell
# 1. Find bash.exe (see Section 2.5)
# 2. Set the variable:
[Environment]::SetEnvironmentVariable('CLAUDE_CODE_GIT_BASH_PATH', "C:\Path\To\Git\bin\bash.exe", 'User')

# 3. Open NEW terminal
# 4. Reinstall:
irm https://claude.ai/install.ps1 | iex
```

---

### Problem: `bash` resolves to WSL instead of Git Bash

**Cause:** WSL is installed and its bash comes first in PATH

**Check:**
```powershell
where.exe bash
bash --version  # If it says "microsoft" or "ubuntu", it's WSL
```

**Fix:** Set the explicit path to Git Bash:
```powershell
# Find Git's bash.exe (not WSL's):
$gitBash = Get-ChildItem -Path "C:\Program Files\Git", "$env:LOCALAPPDATA\Programs\Git" -Filter "bash.exe" -Recurse -ErrorAction SilentlyContinue |
           Select-Object -First 1 -ExpandProperty FullName

[Environment]::SetEnvironmentVariable('CLAUDE_CODE_GIT_BASH_PATH', $gitBash, 'User')
```

---

### Problem: `claude` command not found after successful install

**Cause:** `~\.local\bin` not in PATH

**Fix:**
```powershell
$claudePath = "$env:USERPROFILE\.local\bin"
$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
[Environment]::SetEnvironmentVariable('Path', "$currentPath;$claudePath", 'User')
# Restart terminal
```

---

### Problem: Claude Code models don't appear in Obsidian

**Cause:** Settings migration didn't run (old data.json)

**Fix - Nuclear option:** Delete the plugin's data.json to reset settings:
```powershell
$dataJson = "$vaultPath\.obsidian\plugins\smart-composer\data.json"
if (Test-Path $dataJson) {
    Remove-Item $dataJson
    Write-Host "Deleted data.json - restart Obsidian to reinitialize"
}
```

---

### Problem: "Claude Code is not logged in" error

**Fix:**
```powershell
claude login
```

---

### Problem: "Usage limit reached" error

**Cause:** Max/Pro subscription has usage limits that reset every 5 hours

**Fix:** Wait for reset, or switch to API-based model (requires Anthropic API key)

---

## 8. Corporate/Managed Machine Issues

### 8.1 Cannot modify PATH or environment variables

**Symptom:** "Access denied" when trying to set environment variables

**Workaround - Session-only settings:**
```powershell
# These only last for the current PowerShell session:
$env:CLAUDE_CODE_GIT_BASH_PATH = "C:\Program Files\Git\bin\bash.exe"
$env:Path = "$env:Path;$env:USERPROFILE\.local\bin"
$env:NODE_ENV = "development"

# Then run your commands in this same session
```

**Workaround - Create a startup script:**
Save as `setup-env.ps1` and run it each time:
```powershell
$env:CLAUDE_CODE_GIT_BASH_PATH = "C:\Program Files\Git\bin\bash.exe"
$env:Path = "$env:Path;$env:USERPROFILE\.local\bin;C:\Program Files\Git\cmd"
$env:NODE_ENV = "development"
Write-Host "Environment configured for this session" -ForegroundColor Green
```

---

### 8.2 Corporate proxy blocks npm/GitHub

**Symptom:** `npm install` times out, `git clone` fails, "unable to get local issuer certificate"

**Fix - Configure npm proxy:**
```powershell
# Get your proxy URL from IT or browser settings:
$proxy = "http://proxy.yourcompany.com:8080"

npm config set proxy $proxy
npm config set https-proxy $proxy

# If SSL inspection breaks certificates:
npm config set strict-ssl false  # Use with caution
```

**Fix - Configure Git proxy:**
```powershell
git config --global http.proxy $proxy
git config --global https.proxy $proxy
```

**Fix - SSL certificate issues:**
```powershell
# If corporate SSL inspection breaks things:
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"  # Insecure, use temporarily
git config --global http.sslVerify false  # Insecure, use temporarily
```

---

### 8.3 Antivirus/EDR blocks executables

**Symptom:** `claude.exe` is quarantined, `node.exe` blocked, npm install fails mysteriously

**Fix:**
1. Check your antivirus quarantine folder
2. Request IT whitelist these paths:
   - `%USERPROFILE%\.local\bin\*`
   - `%USERPROFILE%\AppData\Roaming\npm\*`
   - `%LOCALAPPDATA%\Programs\Git\*`
   - `C:\Projects\*` (or your project folder)

---

### 8.4 No admin rights to install software

**Workaround - Portable Git:**
Download portable Git from https://git-scm.com/download/win (scroll down to "Portable" version). Extract to your user folder.

**Workaround - Node.js without installer:**
Download the `.zip` version from https://nodejs.org/en/download/ and extract to your user folder. Add the folder to your session PATH.

---

### 8.5 Vault is in OneDrive/Dropbox/synced folder

**Symptom:** Plugin doesn't load, "EBUSY" errors, settings keep resetting

**Fix:** Move vault to a non-synced location, or:
```powershell
# Exclude the plugins folder from sync (OneDrive example):
attrib +U -P "$vaultPath\.obsidian\plugins" /S /D
```

Or add `.obsidian/plugins` to your sync software's ignore list.

---

## Quick Reference: All Environment Variables

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `NODE_ENV` | Must NOT be "production" for build | `development` or unset |
| `CLAUDE_CODE_GIT_BASH_PATH` | Path to bash.exe for Claude CLI | `C:\Users\YOU\AppData\Local\Programs\Git\bin\bash.exe` |

## Quick Reference: All PATH Additions

| Path | Purpose |
|------|---------|
| `C:\Users\YOU\AppData\Local\Programs\Git\cmd` | Git commands |
| `C:\Users\YOU\AppData\Roaming\npm` | npm global packages |
| `C:\Users\YOU\.local\bin` | Claude Code CLI |

---

## Database Files (Templates & Vector Index)

Smart Composer stores two critical data files in the **vault root** (not the plugin folder):

### `.smtcmp_vector_db.tar.gz`
| Attribute | Value |
|-----------|-------|
| **Location** | `<vault_root>/.smtcmp_vector_db.tar.gz` |
| **Size** | ~4-5MB compressed |
| **Contents** | PGlite PostgreSQL database with pgvector |
| **Purpose** | RAG vector embeddings for semantic search |

This is the indexed "brain" that enables "find similar notes". Without it, the plugin re-indexes everything on first run (slow).

### `.smtcmp_json_db/`
| Attribute | Value |
|-----------|-------|
| **Location** | `<vault_root>/.smtcmp_json_db/` |
| **Contents** | `chats/` (conversation history), `templates/` (prompt templates) |
| **Purpose** | Your custom prompts and chat history |

**Templates include:** Assessment, Goals, ICD-10, Discharge, Subjective, Reassessment, HEP, Sanity Check, etc.

### How the Plugin Loads These

1. On startup, plugin checks if `.smtcmp_vector_db.tar.gz` exists
2. If **YES** → loads existing database
3. If **NO** → creates new empty database, starts indexing vault
4. Same logic for `.smtcmp_json_db/`

### To Create a Portable Backup (For USB/Network)

Run this on your CURRENT machine to create a backup you can use anywhere:

```powershell
# Your current vault with templates
$sourceVault = "C:\wcm-sync"

# Destination: USB drive, network share, or any backup location
$backupDir = "D:\smart-composer-backup"  # <-- USB/network path

# Create backup folder
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Copy the database files
Copy-Item "$sourceVault\.smtcmp_vector_db.tar.gz" -Destination $backupDir -Force
Copy-Item "$sourceVault\.smtcmp_json_db" -Destination $backupDir -Recurse -Force

Write-Host "Backup created at: $backupDir"
Write-Host "Files:"
Get-ChildItem $backupDir -Recurse | Format-Table Name, Length
```

Now on your new machine, set `$sourceVaultWithTemplates = "D:\smart-composer-backup"` in the one-shot script.

### To Migrate Your Templates to a New Machine

**BEFORE enabling the plugin for the first time:**

```powershell
# Source: your existing vault OR backup location (USB, network share)
$sourceVault = "C:\wcm-sync"  # <-- Or "D:\smart-composer-backup"

# Destination: your new vault
$destVault = "C:\obsidian-test"  # <-- New vault

# Copy database files to new vault root
Copy-Item "$sourceVault\.smtcmp_vector_db.tar.gz" -Destination $destVault -Force
Copy-Item "$sourceVault\.smtcmp_json_db" -Destination $destVault -Recurse -Force

Write-Host "Database files copied. Enable the plugin now."
```

**If plugin already created default files:**
```powershell
# Remove the defaults first
Remove-Item "$destVault\.smtcmp_vector_db.tar.gz" -Force -ErrorAction SilentlyContinue
Remove-Item "$destVault\.smtcmp_json_db" -Recurse -Force -ErrorAction SilentlyContinue

# Then copy yours
Copy-Item "$sourceVault\.smtcmp_vector_db.tar.gz" -Destination $destVault -Force
Copy-Item "$sourceVault\.smtcmp_json_db" -Destination $destVault -Recurse -Force

# Restart Obsidian to reload
```

---

## GUI Database Locator (Find-SmartComposerDatabase.ps1)

For a more user-friendly experience, use the included GUI-based database locator script.

### Features

- **Auto-detection**: Searches known locations from most recent to oldest
- **Confirmation dialog**: Shows file details (size, modification dates, template/chat counts)
- **Browse button**: Lets you manually select any folder
- **Persistent history**: Remembers locations you've used before in `~\.smart-composer-db-locations.json`
- **Skip option**: Start fresh without migrating any database

### How to Use

#### Option 1: Standalone

```powershell
# Run the GUI locator directly
.\Find-SmartComposerDatabase.ps1

# Or with a default source to check first:
.\Find-SmartComposerDatabase.ps1 "C:\wcm-sync"
```

#### Option 2: Integrated with One-Shot Script

Place `Find-SmartComposerDatabase.ps1` in the same folder as `install-smart-composer.ps1`. The installer will automatically detect it and launch the GUI during step [8/9].

#### Option 3: Silent Mode (No GUI)

For automated/scripted installations, disable the GUI:

```powershell
$env:SMART_COMPOSER_SILENT_INSTALL = "1"
.\install-smart-composer.ps1
```

### What You'll See

When database is auto-detected:

```text
╔══════════════════════════════════════════════════════════╗
║  ✓ Database Auto-Detected!                               ║
║                                                          ║
║  Location: C:\wcm-sync                                   ║
║                                                          ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ Vector Database (.smtcmp_vector_db.tar.gz)       │   ║
║  │   Size: 4.38 MB                                  │   ║
║  │   Last Modified: 2025-12-15 14:30:22             │   ║
║  │                                                  │   ║
║  │ Templates & Chat History (.smtcmp_json_db/)      │   ║
║  │   Templates: 22                                  │   ║
║  │   Chat Histories: 45                             │   ║
║  │   Last Modified: 2025-12-17 09:15:00             │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                          ║
║  Use this database for your new installation?            ║
║                                                          ║
║     [  Use This  ]    [  Browse Different  ]             ║
╚══════════════════════════════════════════════════════════╝
```

When database is NOT found:

```text
╔══════════════════════════════════════════════════════════╗
║  ⚠ Database Not Found                                    ║
║                                                          ║
║  No Smart Composer database was found in the default     ║
║  locations.                                              ║
║                                                          ║
║  Browse to a folder containing your .smtcmp_* files,     ║
║  or skip to start fresh.                                 ║
║                                                          ║
║  Looking for:                                            ║
║    .smtcmp_vector_db.tar.gz                              ║
║    .smtcmp_json_db/                                      ║
║                                                          ║
║     [  Browse...  ]    [  Skip (Fresh)  ]                ║
╚══════════════════════════════════════════════════════════╝
```

### Location History

The script maintains a history of used locations in:

```text
%USERPROFILE%\.smart-composer-db-locations.json
```

Example contents:

```json
{
  "locations": [
    { "Path": "C:\\wcm-sync", "DateAdded": "2025-12-18 10:30:00" },
    { "Path": "D:\\smart-composer-backup", "DateAdded": "2025-12-15 14:00:00" }
  ]
}
```

On subsequent runs, the script searches locations from most recent to oldest.

---

## One-Shot Installation Script

**Prerequisites:** Node.js and Git must already be installed.

Save as `install-smart-composer.ps1` and run:

```powershell
# ============================================================
# CONFIGURE THESE VARIABLES:
# ============================================================
$projectDir = "C:\Projects\obsidian-smart-composer-homeheart-UPGRADED"
$vaultPath = "C:\obsidian-test"
$repoUrl = "https://github.com/HomeHeartTherapy/obsidian-smart-composer.git"

# OPTIONAL: Path to existing vault OR folder containing your templates/database
# This can be:
#   - Your existing vault:     "C:\wcm-sync"
#   - A USB drive:             "D:\smart-composer-backup"
#   - A network share:         "\\server\share\backup"
#   - Same folder as script:   "$PSScriptRoot"  (portable install)
#   - Leave empty ("") to skip database migration (fresh install)
$sourceVaultWithTemplates = "C:\wcm-sync"
# ============================================================

Write-Host "=== HomeHeart Smart Composer Installer ===" -ForegroundColor Cyan

# --- Pre-flight checks ---
Write-Host "`n[1/9] Checking prerequisites..." -ForegroundColor Yellow

# Check Node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "FAIL: Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "FAIL: Git not found. Install from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Node $(node --version), Git $(git --version)" -ForegroundColor Green

# --- Find Git Bash ---
Write-Host "`n[2/9] Finding Git Bash..." -ForegroundColor Yellow

$bashPaths = @(
    "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe",
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe",
    "$env:ProgramData\chocolatey\lib\git\tools\bin\bash.exe",
    "$env:USERPROFILE\scoop\apps\git\current\bin\bash.exe"
)
$bashPath = $bashPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($bashPath) {
    Write-Host "OK: Found bash at $bashPath" -ForegroundColor Green
    [Environment]::SetEnvironmentVariable('CLAUDE_CODE_GIT_BASH_PATH', $bashPath, 'User')
    $env:CLAUDE_CODE_GIT_BASH_PATH = $bashPath
} else {
    Write-Host "WARN: Git Bash not found in common locations" -ForegroundColor Yellow
}

# --- Set NODE_ENV ---
Write-Host "`n[3/9] Setting NODE_ENV..." -ForegroundColor Yellow
$env:NODE_ENV = "development"
Write-Host "OK: NODE_ENV=development" -ForegroundColor Green

# --- Clone or update repo ---
Write-Host "`n[4/9] Getting source code..." -ForegroundColor Yellow

if (Test-Path $projectDir) {
    Write-Host "Project folder exists, using existing code" -ForegroundColor Green
} else {
    try {
        git clone $repoUrl $projectDir 2>&1 | Out-Null
        Write-Host "OK: Cloned repository" -ForegroundColor Green
    } catch {
        Write-Host "FAIL: Could not clone from $repoUrl" -ForegroundColor Red
        Write-Host "Copy the project folder manually to $projectDir" -ForegroundColor Yellow
        exit 1
    }
}

# --- Install dependencies ---
Write-Host "`n[5/9] Installing dependencies (this may take a minute)..." -ForegroundColor Yellow
Push-Location $projectDir

npm install --legacy-peer-deps --include=dev 2>&1 | Out-Null

if (Test-Path "node_modules\typescript") {
    Write-Host "OK: Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "FAIL: devDependencies not installed" -ForegroundColor Red
    Write-Host "Try: Remove-Item -Recurse node_modules, package-lock.json; npm install --legacy-peer-deps --include=dev" -ForegroundColor Yellow
    Pop-Location
    exit 1
}

# --- Build plugin ---
Write-Host "`n[6/9] Building plugin..." -ForegroundColor Yellow

node esbuild.config.mjs production 2>&1 | Out-Null

if ((Test-Path "main.js") -and (Test-Path "manifest.json") -and (Test-Path "styles.css")) {
    Write-Host "OK: Build successful" -ForegroundColor Green
} else {
    Write-Host "FAIL: Build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

# --- Install to vault ---
Write-Host "`n[7/9] Installing to Obsidian vault..." -ForegroundColor Yellow

if (-not (Test-Path "$vaultPath\.obsidian")) {
    Write-Host "FAIL: $vaultPath is not an Obsidian vault" -ForegroundColor Red
    Pop-Location
    exit 1
}

$pluginPath = "$vaultPath\.obsidian\plugins\smart-composer"
New-Item -ItemType Directory -Force -Path $pluginPath | Out-Null
Copy-Item main.js, manifest.json, styles.css -Destination $pluginPath -Force
Write-Host "OK: Plugin installed to $pluginPath" -ForegroundColor Green

Pop-Location

# --- Migrate database files (templates & vector index) ---
Write-Host "`n[8/9] Migrating templates and database..." -ForegroundColor Yellow

# Check if GUI locator script exists (for interactive selection)
$guiLocatorScript = Join-Path $PSScriptRoot "Find-SmartComposerDatabase.ps1"
$useGui = (Test-Path $guiLocatorScript) -and (-not $env:SMART_COMPOSER_SILENT_INSTALL)

$dbSource = $null

if ($useGui) {
    Write-Host "GUI database locator found - launching..." -ForegroundColor Cyan

    # Dot-source the GUI script to get its functions
    . $guiLocatorScript

    # Call the GUI locator with the configured default source
    $result = Find-SmartComposerDatabase -DefaultSource $sourceVaultWithTemplates

    if ($result.Found) {
        $dbSource = $result.Path
        Write-Host "Selected database location: $dbSource" -ForegroundColor Green
        if ($result.Info) {
            if ($result.Info.TemplateCount -gt 0) {
                Write-Host "  Templates: $($result.Info.TemplateCount)" -ForegroundColor Cyan
            }
            if ($result.Info.ChatCount -gt 0) {
                Write-Host "  Chat histories: $($result.Info.ChatCount)" -ForegroundColor Cyan
            }
        }
    } elseif ($result.Skipped) {
        Write-Host "User chose to skip database migration (fresh install)" -ForegroundColor Yellow
    }
} else {
    # Fallback: silent auto-detection (no GUI)
    Write-Host "Using silent auto-detection..." -ForegroundColor Gray

    # First, check if user specified a source
    if ($sourceVaultWithTemplates -and (Test-Path $sourceVaultWithTemplates)) {
        # Verify it actually has database files
        $hasVectorDb = Test-Path "$sourceVaultWithTemplates\.smtcmp_vector_db.tar.gz"
        $hasJsonDb = Test-Path "$sourceVaultWithTemplates\.smtcmp_json_db"
        if ($hasVectorDb -or $hasJsonDb) {
            $dbSource = $sourceVaultWithTemplates
            Write-Host "Using specified source: $dbSource" -ForegroundColor Cyan
        }
    }

    if (-not $dbSource) {
        # Auto-detect: check common backup locations
        $searchPaths = @(
            "$PSScriptRoot",                          # Same folder as script (portable)
            "D:\smart-composer-backup",               # USB drive
            "E:\smart-composer-backup",               # USB drive alternate
            "$env:USERPROFILE\OneDrive\smart-composer-backup",  # OneDrive
            "$env:USERPROFILE\Dropbox\smart-composer-backup",   # Dropbox
            "\\$env:COMPUTERNAME\share\smart-composer-backup"   # Local network share
        )

        foreach ($path in $searchPaths) {
            if ((Test-Path "$path\.smtcmp_json_db") -or (Test-Path "$path\.smtcmp_vector_db.tar.gz")) {
                $dbSource = $path
                Write-Host "Auto-detected database at: $dbSource" -ForegroundColor Cyan
                break
            }
        }
    }
}

# Copy database files if source was found
if ($dbSource) {
    $vectorDb = "$dbSource\.smtcmp_vector_db.tar.gz"
    $jsonDb = "$dbSource\.smtcmp_json_db"

    # Remove any existing defaults in destination
    Remove-Item "$vaultPath\.smtcmp_vector_db.tar.gz" -Force -ErrorAction SilentlyContinue
    Remove-Item "$vaultPath\.smtcmp_json_db" -Recurse -Force -ErrorAction SilentlyContinue

    $copied = $false

    if (Test-Path $vectorDb) {
        Copy-Item $vectorDb -Destination $vaultPath -Force
        $size = [math]::Round((Get-Item "$vaultPath\.smtcmp_vector_db.tar.gz").Length / 1MB, 2)
        Write-Host "OK: Copied vector database ($size MB)" -ForegroundColor Green
        $copied = $true
    } else {
        Write-Host "SKIP: No vector database found at source" -ForegroundColor Yellow
    }

    if (Test-Path $jsonDb) {
        Copy-Item $jsonDb -Destination $vaultPath -Recurse -Force
        $templateCount = (Get-ChildItem "$vaultPath\.smtcmp_json_db\templates" -ErrorAction SilentlyContinue | Measure-Object).Count
        $chatCount = (Get-ChildItem "$vaultPath\.smtcmp_json_db\chats" -ErrorAction SilentlyContinue | Measure-Object).Count
        Write-Host "OK: Copied $templateCount templates, $chatCount chat histories" -ForegroundColor Green
        $copied = $true
    } else {
        Write-Host "SKIP: No JSON database found at source" -ForegroundColor Yellow
    }

    if (-not $copied) {
        Write-Host "WARN: No database files found in source" -ForegroundColor Yellow
    }
} elseif ($sourceVaultWithTemplates -and -not $useGui) {
    Write-Host "WARN: Source not found: $sourceVaultWithTemplates" -ForegroundColor Yellow
    Write-Host "Skipping database migration. Plugin will create fresh database." -ForegroundColor Yellow
} elseif (-not $useGui) {
    Write-Host "SKIP: No source specified and none auto-detected (fresh install)" -ForegroundColor Yellow
    Write-Host "Tip: Place Find-SmartComposerDatabase.ps1 next to this script for GUI selection" -ForegroundColor Gray
}

# --- Add Claude CLI to PATH ---
Write-Host "`n[9/9] Configuring PATH for Claude CLI..." -ForegroundColor Yellow

$claudePath = "$env:USERPROFILE\.local\bin"
$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($currentPath -notlike "*$claudePath*") {
    [Environment]::SetEnvironmentVariable('Path', "$currentPath;$claudePath", 'User')
    Write-Host "OK: Added $claudePath to PATH" -ForegroundColor Green
} else {
    Write-Host "OK: Claude path already in PATH" -ForegroundColor Green
}

# --- Done ---
Write-Host "`n=== INSTALLATION COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open a NEW PowerShell window"
Write-Host "2. Run: irm https://claude.ai/install.ps1 | iex"
Write-Host "3. Run: claude login"
Write-Host "4. Open Obsidian, enable Smart Composer in Community Plugins"
Write-Host "5. Select a claude-code/* model and test!"
Write-Host ""
```

---

## Pre-Flight Check Script

Run this BEFORE installation to identify issues:

Save as `preflight-check.ps1`:

```powershell
Write-Host "=== Pre-Flight Checks ===" -ForegroundColor Cyan
$issues = @()

# 1. Execution Policy
$policy = Get-ExecutionPolicy
if ($policy -eq "Restricted") {
    $issues += "Execution Policy is Restricted"
    Write-Host "[FAIL] Execution Policy: $policy" -ForegroundColor Red
} else {
    Write-Host "[OK] Execution Policy: $policy" -ForegroundColor Green
}

# 2. Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Node.js: $(node --version)" -ForegroundColor Green
} else {
    $issues += "Node.js not installed"
    Write-Host "[FAIL] Node.js not found" -ForegroundColor Red
}

# 3. Git
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Git: $(git --version)" -ForegroundColor Green
} else {
    $issues += "Git not installed"
    Write-Host "[FAIL] Git not found" -ForegroundColor Red
}

# 4. Git Bash
$bashPaths = @(
    "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe",
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe",
    "$env:ProgramData\chocolatey\lib\git\tools\bin\bash.exe",
    "$env:USERPROFILE\scoop\apps\git\current\bin\bash.exe"
)
$bashFound = $bashPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($bashFound) {
    Write-Host "[OK] Git Bash: $bashFound" -ForegroundColor Green
} else {
    $issues += "Git Bash not found"
    Write-Host "[FAIL] Git Bash not found" -ForegroundColor Red
}

# 5. WSL Check
$wslBash = & where.exe bash 2>$null | Select-String "WindowsApps|Microsoft"
if ($wslBash) {
    $issues += "WSL bash may interfere - set CLAUDE_CODE_GIT_BASH_PATH explicitly"
    Write-Host "[WARN] WSL detected - may need explicit bash path" -ForegroundColor Yellow
} else {
    Write-Host "[OK] No WSL interference detected" -ForegroundColor Green
}

# 6. NODE_ENV
$nodeEnv = $env:NODE_ENV
$nodeEnvUser = [Environment]::GetEnvironmentVariable('NODE_ENV', 'User')
if ($nodeEnv -eq "production" -or $nodeEnvUser -eq "production") {
    $issues += "NODE_ENV is set to production"
    Write-Host "[FAIL] NODE_ENV=production (will break npm install)" -ForegroundColor Red
} else {
    Write-Host "[OK] NODE_ENV is not production" -ForegroundColor Green
}

# 7. Network
$urls = @("https://github.com", "https://registry.npmjs.org", "https://claude.ai")
foreach ($url in $urls) {
    try {
        Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5 -UseBasicParsing | Out-Null
        Write-Host "[OK] Network: $url reachable" -ForegroundColor Green
    } catch {
        $issues += "Cannot reach $url"
        Write-Host "[FAIL] Network: $url not reachable" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
if ($issues.Count -eq 0) {
    Write-Host "All checks passed! Ready to install." -ForegroundColor Green
} else {
    Write-Host "Issues found:" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
```

---

**End of Installation Guide**
