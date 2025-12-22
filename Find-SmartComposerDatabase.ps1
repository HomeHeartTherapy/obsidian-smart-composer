# =============================================================================
# Find-SmartComposerDatabase.ps1
# GUI-based database locator with persistent location history
# =============================================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# --- Configuration ---
$configFile = "$env:USERPROFILE\.smart-composer-db-locations.json"

# --- Helper Functions ---

function Get-DatabaseInfo {
    param([string]$Path)

    $info = @{
        Path = $Path
        Valid = $false
        VectorDb = $null
        JsonDb = $null
        TemplateCount = 0
        ChatCount = 0
    }

    $vectorPath = Join-Path $Path ".smtcmp_vector_db.tar.gz"
    $jsonPath = Join-Path $Path ".smtcmp_json_db"

    if (Test-Path $vectorPath) {
        $file = Get-Item $vectorPath
        $info.VectorDb = @{
            Exists = $true
            Size = [math]::Round($file.Length / 1MB, 2)
            Modified = $file.LastWriteTime
        }
        $info.Valid = $true
    }

    if (Test-Path $jsonPath) {
        $folder = Get-Item $jsonPath
        $info.JsonDb = @{
            Exists = $true
            Modified = $folder.LastWriteTime
        }

        $templatesPath = Join-Path $jsonPath "templates"
        $chatsPath = Join-Path $jsonPath "chats"

        if (Test-Path $templatesPath) {
            $info.TemplateCount = (Get-ChildItem $templatesPath -File | Measure-Object).Count
        }
        if (Test-Path $chatsPath) {
            $info.ChatCount = (Get-ChildItem $chatsPath -File | Measure-Object).Count
        }
        $info.Valid = $true
    }

    return $info
}

function Load-KnownLocations {
    if (Test-Path $configFile) {
        try {
            $content = Get-Content $configFile -Raw | ConvertFrom-Json
            return $content.locations | Sort-Object -Property DateAdded -Descending
        } catch {
            return @()
        }
    }
    return @()
}

function Save-KnownLocation {
    param([string]$Path)

    $locations = @()
    if (Test-Path $configFile) {
        try {
            $content = Get-Content $configFile -Raw | ConvertFrom-Json
            $locations = @($content.locations)
        } catch {}
    }

    # Remove if already exists (we'll re-add with new date)
    $locations = @($locations | Where-Object { $_.Path -ne $Path })

    # Add new entry
    $newEntry = @{
        Path = $Path
        DateAdded = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    $locations = @($newEntry) + $locations

    # Keep only last 20 locations
    if ($locations.Count -gt 20) {
        $locations = $locations[0..19]
    }

    $config = @{ locations = $locations }
    $config | ConvertTo-Json -Depth 10 | Set-Content $configFile
}

function Show-ConfirmationDialog {
    param(
        [string]$Path,
        [hashtable]$Info,
        [bool]$AutoDetected = $false
    )

    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Smart Composer Database Found"
    $form.Size = New-Object System.Drawing.Size(550, 400)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
    $form.ForeColor = [System.Drawing.Color]::White

    # Title
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Location = New-Object System.Drawing.Point(20, 15)
    $titleLabel.Size = New-Object System.Drawing.Size(500, 30)
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
    if ($AutoDetected) {
        $titleLabel.Text = "Database Auto-Detected!"
        $titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 200, 100)
    } else {
        $titleLabel.Text = "Database Location Selected"
        $titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 150, 255)
    }
    $form.Controls.Add($titleLabel)

    # Path
    $pathLabel = New-Object System.Windows.Forms.Label
    $pathLabel.Location = New-Object System.Drawing.Point(20, 50)
    $pathLabel.Size = New-Object System.Drawing.Size(500, 20)
    $pathLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $pathLabel.Text = "Location: $Path"
    $pathLabel.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 200)
    $form.Controls.Add($pathLabel)

    # Info panel
    $infoPanel = New-Object System.Windows.Forms.Panel
    $infoPanel.Location = New-Object System.Drawing.Point(20, 80)
    $infoPanel.Size = New-Object System.Drawing.Size(495, 180)
    $infoPanel.BackColor = [System.Drawing.Color]::FromArgb(45, 45, 45)
    $infoPanel.BorderStyle = "FixedSingle"
    $form.Controls.Add($infoPanel)

    $yPos = 10

    # Vector database info
    $vectorTitle = New-Object System.Windows.Forms.Label
    $vectorTitle.Location = New-Object System.Drawing.Point(15, $yPos)
    $vectorTitle.Size = New-Object System.Drawing.Size(460, 20)
    $vectorTitle.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $vectorTitle.Text = "Vector Database (.smtcmp_vector_db.tar.gz)"
    $vectorTitle.ForeColor = [System.Drawing.Color]::FromArgb(150, 200, 255)
    $infoPanel.Controls.Add($vectorTitle)
    $yPos += 22

    if ($Info.VectorDb -and $Info.VectorDb.Exists) {
        $vectorInfo = New-Object System.Windows.Forms.Label
        $vectorInfo.Location = New-Object System.Drawing.Point(25, $yPos)
        $vectorInfo.Size = New-Object System.Drawing.Size(460, 35)
        $vectorInfo.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $vectorInfo.Text = "Size: $($Info.VectorDb.Size) MB`nLast Modified: $($Info.VectorDb.Modified.ToString('yyyy-MM-dd HH:mm:ss'))"
        $vectorInfo.ForeColor = [System.Drawing.Color]::FromArgb(100, 255, 100)
        $infoPanel.Controls.Add($vectorInfo)
    } else {
        $vectorInfo = New-Object System.Windows.Forms.Label
        $vectorInfo.Location = New-Object System.Drawing.Point(25, $yPos)
        $vectorInfo.Size = New-Object System.Drawing.Size(460, 20)
        $vectorInfo.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $vectorInfo.Text = "Not found (will be created on first run)"
        $vectorInfo.ForeColor = [System.Drawing.Color]::FromArgb(255, 200, 100)
        $infoPanel.Controls.Add($vectorInfo)
    }
    $yPos += 45

    # JSON database info
    $jsonTitle = New-Object System.Windows.Forms.Label
    $jsonTitle.Location = New-Object System.Drawing.Point(15, $yPos)
    $jsonTitle.Size = New-Object System.Drawing.Size(460, 20)
    $jsonTitle.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $jsonTitle.Text = "Templates & Chat History (.smtcmp_json_db/)"
    $jsonTitle.ForeColor = [System.Drawing.Color]::FromArgb(150, 200, 255)
    $infoPanel.Controls.Add($jsonTitle)
    $yPos += 22

    if ($Info.JsonDb -and $Info.JsonDb.Exists) {
        $jsonInfo = New-Object System.Windows.Forms.Label
        $jsonInfo.Location = New-Object System.Drawing.Point(25, $yPos)
        $jsonInfo.Size = New-Object System.Drawing.Size(460, 50)
        $jsonInfo.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $jsonInfo.Text = "Templates: $($Info.TemplateCount)`nChat Histories: $($Info.ChatCount)`nLast Modified: $($Info.JsonDb.Modified.ToString('yyyy-MM-dd HH:mm:ss'))"
        $jsonInfo.ForeColor = [System.Drawing.Color]::FromArgb(100, 255, 100)
        $infoPanel.Controls.Add($jsonInfo)
    } else {
        $jsonInfo = New-Object System.Windows.Forms.Label
        $jsonInfo.Location = New-Object System.Drawing.Point(25, $yPos)
        $jsonInfo.Size = New-Object System.Drawing.Size(460, 20)
        $jsonInfo.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $jsonInfo.Text = "Not found (will start fresh)"
        $jsonInfo.ForeColor = [System.Drawing.Color]::FromArgb(255, 200, 100)
        $infoPanel.Controls.Add($jsonInfo)
    }

    # Question
    $questionLabel = New-Object System.Windows.Forms.Label
    $questionLabel.Location = New-Object System.Drawing.Point(20, 270)
    $questionLabel.Size = New-Object System.Drawing.Size(500, 25)
    $questionLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $questionLabel.Text = "Use this database for your new installation?"
    $questionLabel.ForeColor = [System.Drawing.Color]::White
    $form.Controls.Add($questionLabel)

    # Buttons
    $useButton = New-Object System.Windows.Forms.Button
    $useButton.Location = New-Object System.Drawing.Point(120, 310)
    $useButton.Size = New-Object System.Drawing.Size(140, 40)
    $useButton.Text = "Use This"
    $useButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $useButton.BackColor = [System.Drawing.Color]::FromArgb(60, 130, 60)
    $useButton.ForeColor = [System.Drawing.Color]::White
    $useButton.FlatStyle = "Flat"
    $useButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.Controls.Add($useButton)

    $browseButton = New-Object System.Windows.Forms.Button
    $browseButton.Location = New-Object System.Drawing.Point(280, 310)
    $browseButton.Size = New-Object System.Drawing.Size(140, 40)
    $browseButton.Text = "Browse Different"
    $browseButton.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $browseButton.BackColor = [System.Drawing.Color]::FromArgb(70, 70, 70)
    $browseButton.ForeColor = [System.Drawing.Color]::White
    $browseButton.FlatStyle = "Flat"
    $browseButton.DialogResult = [System.Windows.Forms.DialogResult]::Retry
    $form.Controls.Add($browseButton)

    $form.AcceptButton = $useButton

    return $form.ShowDialog()
}

function Show-BrowseDialog {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Find Smart Composer Database"
    $form.Size = New-Object System.Drawing.Size(500, 300)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
    $form.ForeColor = [System.Drawing.Color]::White

    # Title
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Location = New-Object System.Drawing.Point(20, 15)
    $titleLabel.Size = New-Object System.Drawing.Size(450, 30)
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
    $titleLabel.Text = "Database Not Found"
    $titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(255, 180, 100)
    $form.Controls.Add($titleLabel)

    # Description
    $descLabel = New-Object System.Windows.Forms.Label
    $descLabel.Location = New-Object System.Drawing.Point(20, 55)
    $descLabel.Size = New-Object System.Drawing.Size(450, 60)
    $descLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $descLabel.Text = "No Smart Composer database was found in the default locations.`n`nBrowse to a folder containing your .smtcmp_* files, or skip to start fresh."
    $descLabel.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 200)
    $form.Controls.Add($descLabel)

    # Looking for label
    $lookingLabel = New-Object System.Windows.Forms.Label
    $lookingLabel.Location = New-Object System.Drawing.Point(20, 125)
    $lookingLabel.Size = New-Object System.Drawing.Size(450, 50)
    $lookingLabel.Font = New-Object System.Drawing.Font("Consolas", 9)
    $lookingLabel.Text = "Looking for:`n  .smtcmp_vector_db.tar.gz`n  .smtcmp_json_db/"
    $lookingLabel.ForeColor = [System.Drawing.Color]::FromArgb(150, 150, 200)
    $form.Controls.Add($lookingLabel)

    # Buttons
    $browseButton = New-Object System.Windows.Forms.Button
    $browseButton.Location = New-Object System.Drawing.Point(80, 200)
    $browseButton.Size = New-Object System.Drawing.Size(140, 45)
    $browseButton.Text = "Browse..."
    $browseButton.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $browseButton.BackColor = [System.Drawing.Color]::FromArgb(60, 100, 180)
    $browseButton.ForeColor = [System.Drawing.Color]::White
    $browseButton.FlatStyle = "Flat"
    $browseButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.Controls.Add($browseButton)

    $skipButton = New-Object System.Windows.Forms.Button
    $skipButton.Location = New-Object System.Drawing.Point(270, 200)
    $skipButton.Size = New-Object System.Drawing.Size(140, 45)
    $skipButton.Text = "Skip (Fresh)"
    $skipButton.Font = New-Object System.Drawing.Font("Segoe UI", 11)
    $skipButton.BackColor = [System.Drawing.Color]::FromArgb(70, 70, 70)
    $skipButton.ForeColor = [System.Drawing.Color]::White
    $skipButton.FlatStyle = "Flat"
    $skipButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    $form.Controls.Add($skipButton)

    return $form.ShowDialog()
}

function Show-FolderBrowser {
    $browser = New-Object System.Windows.Forms.FolderBrowserDialog
    $browser.Description = "Select folder containing Smart Composer database files (.smtcmp_*)"
    $browser.ShowNewFolderButton = $false

    if ($browser.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        return $browser.SelectedPath
    }
    return $null
}

# --- Main Function ---

function Find-SmartComposerDatabase {
    param(
        [string]$DefaultSource = "",
        [switch]$Silent
    )

    $result = @{
        Found = $false
        Path = $null
        Info = $null
        Skipped = $false
    }

    # Build search list: default source + known locations + common paths
    $searchPaths = @()

    if ($DefaultSource -and (Test-Path $DefaultSource)) {
        $searchPaths += $DefaultSource
    }

    # Add known locations (most recent first)
    $knownLocations = Load-KnownLocations
    foreach ($loc in $knownLocations) {
        if ($loc.Path -and ($searchPaths -notcontains $loc.Path)) {
            $searchPaths += $loc.Path
        }
    }

    # Add common fallback paths
    $fallbackPaths = @(
        "$PSScriptRoot",
        "D:\smart-composer-backup",
        "E:\smart-composer-backup",
        "$env:USERPROFILE\OneDrive\smart-composer-backup",
        "$env:USERPROFILE\Dropbox\smart-composer-backup"
    )
    foreach ($path in $fallbackPaths) {
        if ($searchPaths -notcontains $path) {
            $searchPaths += $path
        }
    }

    # Search for valid database
    $foundPath = $null
    $foundInfo = $null

    foreach ($path in $searchPaths) {
        if (Test-Path $path) {
            $info = Get-DatabaseInfo -Path $path
            if ($info.Valid) {
                $foundPath = $path
                $foundInfo = $info
                break
            }
        }
    }

    if ($Silent) {
        # Silent mode - just return what was found
        if ($foundPath) {
            $result.Found = $true
            $result.Path = $foundPath
            $result.Info = $foundInfo
        }
        return $result
    }

    # GUI mode
    if ($foundPath) {
        # Show confirmation dialog
        $dialogResult = Show-ConfirmationDialog -Path $foundPath -Info $foundInfo -AutoDetected $true

        if ($dialogResult -eq [System.Windows.Forms.DialogResult]::OK) {
            Save-KnownLocation -Path $foundPath
            $result.Found = $true
            $result.Path = $foundPath
            $result.Info = $foundInfo
            return $result
        }
        # User wants to browse for different location
    }

    # Show browse dialog
    while ($true) {
        $browseResult = Show-BrowseDialog

        if ($browseResult -eq [System.Windows.Forms.DialogResult]::Cancel) {
            # User chose to skip
            $result.Skipped = $true
            return $result
        }

        # User wants to browse
        $selectedPath = Show-FolderBrowser

        if (-not $selectedPath) {
            continue  # User cancelled browser, show dialog again
        }

        $info = Get-DatabaseInfo -Path $selectedPath

        if ($info.Valid) {
            $confirmResult = Show-ConfirmationDialog -Path $selectedPath -Info $info -AutoDetected $false

            if ($confirmResult -eq [System.Windows.Forms.DialogResult]::OK) {
                Save-KnownLocation -Path $selectedPath
                $result.Found = $true
                $result.Path = $selectedPath
                $result.Info = $info
                return $result
            }
            # User wants to browse again
        } else {
            [System.Windows.Forms.MessageBox]::Show(
                "No Smart Composer database files found in:`n$selectedPath`n`nLooking for .smtcmp_vector_db.tar.gz or .smtcmp_json_db/",
                "Not Found",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Warning
            )
        }
    }
}

# --- Entry Point (when run directly) ---
if ($MyInvocation.InvocationName -ne '.') {
    $result = Find-SmartComposerDatabase -DefaultSource $args[0]

    if ($result.Found) {
        Write-Host "`nSelected database location: $($result.Path)" -ForegroundColor Green
        Write-Host "Templates: $($result.Info.TemplateCount), Chats: $($result.Info.ChatCount)" -ForegroundColor Cyan
    } elseif ($result.Skipped) {
        Write-Host "`nSkipped - will start with fresh database" -ForegroundColor Yellow
    }

    # Return path for pipeline use
    return $result.Path
}
