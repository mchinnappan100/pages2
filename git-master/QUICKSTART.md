# 🚀 GitMaster - Quick Start Guide

## Installation (60 seconds)

### Step 1: Install Dependencies
```bash
cd gitmaster
npm install
```

### Step 2: Run GitMaster
```bash
# Analyze current directory
node cli.js

# Or analyze specific repo
node cli.js -g /path/to/your/repo
```

### Step 3: View in Browser
GitMaster automatically opens at `http://localhost:3000`

## Quick Commands

```bash
# Basic usage
node cli.js                          # Analyze current directory
node cli.js -g /path/to/repo         # Analyze specific repo
node cli.js -p 8080                  # Use custom port
node cli.js --no-browser             # Don't auto-open browser

# Combined
node cli.js -g ~/projects/myapp -p 3001 --no-browser
```

## What You'll See

### 1. CLI Output
```
┌───────────────────────────────────────┐
│                                       │
│   🚀 GitMaster                        │
│   The Ultimate Git Repository         │
│   Analyzer                            │
│                                       │
└───────────────────────────────────────┘

📁 Repository: /your/project/path
🌐 Port: 3000

✓ Repository validated
  Branches: 15
  Commits: 2,341
  Contributors: 12

✓ Server started
  🌐 http://localhost:3000
```

### 2. Web Interface Features

**Overview Tab**
- Total commits, contributors, branches, repo size
- Activity stats (last 24h, 7d, 30d)
- Top contributors list
- Repository health score

**Commits Tab**
- Last 50 commits with messages
- Author names and dates
- Commit hashes

**Branches Tab**
- All branches listed
- Current branch highlighted
- Branch commit info

**File Tree Tab**
- Complete repository structure
- Folders and files organized
- Easy navigation

**Statistics Tab**
- Commits by day of week (bar chart)
- Commits by hour (line chart)
- Activity patterns visualization

**Optimize Tab**
- Garbage collection analysis
- Storage usage breakdown
- Health recommendations
- One-click GC execution

## Pro Tips

✨ **Refresh Anytime**: Click the 🔄 Refresh button for latest data

✨ **Health Score**: Keep it above 90 for optimal performance

✨ **Run GC**: When suggested - reduces repo size significantly

✨ **Dark Theme**: Built-in, perfect for late-night coding

✨ **Real-time**: WebSocket keeps everything synchronized

## Troubleshooting

**"Not a git repository"**
→ Make sure you're in a folder with `.git/`

**Port 3000 in use**
→ Use `-p 3001` to specify different port

**Can't connect**
→ Check firewall, ensure port is open

## Next Steps

1. ⭐ Star the project
2. 🔧 Optimize your repo using suggestions
3. 📊 Analyze commit patterns
4. 🚀 Share with your team

---

**Need help?** Check README.md for full documentation

**Enjoying GitMaster?** Share it with fellow developers!
