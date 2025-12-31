# Troubleshooting: Claude CLI Not Found

**Symptom**: Error message "Claude Code CLI not found" or ENOENT error.

---

## Quick Check

Run this in terminal:

```bash
where claude      # Windows
which claude      # Mac/Linux
```

If it returns a path, Claude is installed. If not, install it.

---

## Installation

### Via npm (recommended for home/admin machines)

```bash
npm install -g @anthropic-ai/claude-code
```

### Via standalone installer (for work/no-admin machines)

Download from Anthropic and run the installer. It installs to `.local/bin/`.

---

## Path Detection

The plugin tries these paths in order:

| Order | Path | Machine |
|-------|------|---------|
| 1 | `.local\bin\claude.exe` | Work (standalone) |
| 2 | `AppData\Roaming\npm\claude.cmd` | Home (npm global) |
| 3 | `npm\claude.cmd` | Alternate npm |
| 4 | `.npm-global\claude.cmd` | Custom npm prefix |
| 5 | `AppData\Local\npm\claude.cmd` | Local npm |
| 6 | `claude.cmd` | In user profile |
| 7 | `bin\claude.cmd` | Custom bin |
| 8 | `claude` | In PATH |

All paths are relative to `%USERPROFILE%`.

---

## Debugging

### Step 1: Verify Claude is installed

```bash
claude --version
# Should output: Claude Code 2.0.75 or similar
```

### Step 2: Find actual location

```bash
where claude
# Example output:
# C:\Users\stuart.ryan\.local\bin\claude.exe
```

### Step 3: Check if it's in the path list

Look at `src/core/llm/claudeCode.ts`, method `buildPossiblePaths()`.

Is your path included? If not, add it.

### Step 4: Check environment variable expansion

In Obsidian DevTools console:
```javascript
console.log(process.env.USERPROFILE)
// Should output: C:\Users\your.username
```

---

## Common Issues

### Issue: Path has spaces

Windows paths with spaces need proper handling. The code uses `path.join()` which handles this correctly.

### Issue: .cmd vs .exe

- npm installs `.cmd` files (batch wrappers)
- Standalone installer creates `.exe` files

Both are supported. The code tries both extensions.

### Issue: shell:true not set

On Windows, `.cmd` files require `shell: true` in spawn options:

```typescript
spawn(cliPath, args, {
  shell: process.platform === 'win32',
  // ...
})
```

### Issue: Environment variable not expanded

`%USERPROFILE%` must be expanded manually in Node.js:

```typescript
// WRONG
const path = '%USERPROFILE%\\.local\\bin\\claude.exe'

// RIGHT
const userProfile = process.env.USERPROFILE || ''
const path = path.join(userProfile, '.local', 'bin', 'claude.exe')
```

---

## Adding a New Path

If Claude is installed in a location not covered:

1. Edit `src/core/llm/claudeCode.ts`
2. Find `buildPossiblePaths()` method
3. Add your path to the array:

```typescript
if (process.platform === 'win32') {
  return [
    // Add your path here
    path.join(userProfile, 'your', 'custom', 'path', 'claude.exe'),
    // ... existing paths
  ]
}
```

4. Rebuild: `npm run build`
5. Redeploy to Obsidian

---

## Verification

After fixing, check the DevTools console:

```
[Claude Code] Trying path [1/8]: C:\Users\...\.local\bin\claude.exe
[Claude Code] Caching working path: C:\Users\...\.local\bin\claude.exe
```

The "Caching working path" message means it found Claude.

---

## Still Not Working?

1. Check [VERIFIED_FACTS.md](../environment/VERIFIED_FACTS.md) for known working paths
2. Check [LESSONS_LEARNED.md](../history/LESSONS_LEARNED.md) for past issues
3. Run Claude directly in terminal to verify it works outside Obsidian

---

*If you discover a new path scenario, document it and add to the code.*
