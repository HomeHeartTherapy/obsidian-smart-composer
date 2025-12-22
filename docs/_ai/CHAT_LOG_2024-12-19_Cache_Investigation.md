# Chat Log: Cache Investigation & wcm-sync UI Debug

**Date:** 2024-12-19
**Session:** Cache Investigation (Late Evening)
**Participants:** Stuart Ryan (Human), Claude Opus 4.5 (AI)

---

## Problem Statement

The two-row UI layout was implemented and working in the test vault (`C:\obsidian-test`), but NOT appearing in the production vault (`C:\wcm-sync`) despite:
- Identical main.js files (same MD5 hash: `def6eed1d9efa519713b9ddc0195eba8`)
- Identical manifest.json files
- Same schema version (14) in data.json
- Multiple Obsidian restarts
- Plugin disable/enable cycles

---

## Investigation Timeline

### 1. File Structure Discovery

Found wcm-sync vault at `C:\wcm-sync` (not `C:\Vaults\wcm-sync`).

**Smart Composer file locations:**

| Location | Purpose |
|----------|---------|
| `C:\wcm-sync\.smtcmp_json_db\chats\` | Chat history (19-21 JSON files) |
| `C:\wcm-sync\.smtcmp_json_db\templates\` | Prompt templates (21-23 JSON files) |
| `C:\wcm-sync\.smtcmp_vector_db.tar.gz` | Vector embeddings (~4.4MB) |
| `C:\wcm-sync\.obsidian\plugins\smart-composer\` | Plugin files |

### 2. Obsidian Vault ID Mapping

Found in `C:\Users\stuart.ryan\AppData\Roaming\obsidian\obsidian.json`:

```json
{
  "vaults": {
    "27bf24272b1bc5cb": {"path": "C:\\wcm-sync"},
    "02a70a40e61e2637": {"path": "C:\\obsidian-test"},
    "f9c5a6c53cdb0477": {"path": "C:\\obsidian-test-BACKUP"}
  }
}
```

### 3. Vault-Specific Cache Discovery

Each vault has its own cache partition at:
```
C:\Users\stuart.ryan\AppData\Roaming\obsidian\Partitions\vault-{id}\
```

For wcm-sync (vault-27bf24272b1bc5cb):
```
├── Cache\           <- General Chromium cache
├── Code Cache\      <- COMPILED JAVASCRIPT CACHE (key culprit!)
├── IndexedDB\       <- Database storage
├── Session Storage\ <- Session state
├── Local Storage\   <- Local storage
├── GPUCache\        <- Graphics cache
├── blob_storage\    <- Binary objects
└── ...
```

### 4. Code Cache Hypothesis

The **Code Cache** directory (18MB) stores compiled/cached JavaScript from Chromium's V8 engine. This can cache OLD versions of plugin code even after the source files are updated.

### 5. Cache Flush Procedure Developed

```powershell
# 1. Close Obsidian completely

# 2. Rename workspace to force state refresh
cd C:\wcm-sync\.obsidian
ren workspace.json workspace.json.bak

# 3. Clear vault-specific Code Cache
Remove-Item -Recurse "C:\Users\stuart.ryan\AppData\Roaming\obsidian\Partitions\vault-27bf24272b1bc5cb\Code Cache\*" -Force

# 4. Clear vault-specific general cache
Remove-Item -Recurse "C:\Users\stuart.ryan\AppData\Roaming\obsidian\Partitions\vault-27bf24272b1bc5cb\Cache\*" -Force

# 5. Restart Obsidian
```

### 6. Fresh Plugin Copy

Performed complete deletion and fresh copy:
```powershell
# Delete existing
rm -rf "C:\wcm-sync\.obsidian\plugins\smart-composer"

# Copy fresh from build
cp main.js, manifest.json, styles.css from build output
cp data.json from backup (preserves settings)
```

---

## Backup Created

```
C:\Backups\smart-composer-wcm-sync-20241219\
├── .smtcmp_json_db\
│   ├── chats\       (19 files)
│   └── templates\   (21 files)
├── .smtcmp_vector_db.tar.gz
└── plugin-files\
    ├── data.json
    ├── main.js
    ├── manifest.json
    └── styles.css
```

---

## Key Learnings

1. **Obsidian uses Chromium's V8 cache** - Plugin JavaScript gets compiled and cached at the Chromium level, NOT just the Obsidian app level

2. **Vault-specific caches exist** - Each vault has its own cache partition, identified by a hash ID

3. **File checksums aren't enough** - Even with identical files, cached compiled code can differ

4. **workspace.json affects more than layout** - Renaming it forces Obsidian to re-initialize state

5. **The smart-composer_FULL_BAK folder** - Found old backup at `C:\wcm-sync\.obsidian\plugins\smart-composer_FULL_BAK\` with older main.js (8,348,591 bytes vs 8,548,817 bytes current)

---

## Verification Commands

```bash
# Check if two-row UI code is in bundle
grep -c "smtcmp-chat-user-input-controls__row--1" main.js

# Compare file checksums
md5sum /c/Projects/.../main.js /c/wcm-sync/.../main.js

# Find vault ID mapping
cat "/c/Users/stuart.ryan/AppData/Roaming/obsidian/obsidian.json"
```

---

## Status at Session End

- Cache flush procedure executed
- Fresh plugin files copied
- Caches cleared
- Waiting for Obsidian restart to verify fix

---

## Future Recommendations

1. **Add to GOTCHAS.md**: Document Obsidian cache clearing procedure
2. **Add to deployment checklist**: Clear Code Cache after major plugin updates
3. **Consider adding version indicator**: Show plugin version in UI to verify loaded version

---

*This log preserved before context compaction.*
