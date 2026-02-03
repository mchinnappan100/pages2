# ⚡ GitMaster - The Ultimate Git UI

**The best Git UI in the world** - A powerful combination of CLI and web interface that provides deep insights into your Git repositories. Better than SourceTree, even Linus would approve!

## 🚀 Features

### 📊 Comprehensive Repository Analysis
- **Real-time statistics** - Total commits, contributors, branches, and repository size
- **Activity tracking** - See commits by day, week, and month
- **Contributor insights** - Top contributors with commit counts
- **Health scoring** - Repository health assessment with actionable suggestions

### 🌳 Advanced Git Tree Visualization
- **File tree browser** - Navigate your repository structure
- **Commit history** - Beautiful commit log with author and date information
- **Branch management** - View all branches with current branch highlighting
- **Status monitoring** - Real-time working directory status

### 📈 Statistical Analysis
- **Temporal patterns** - Commits by day of week and hour of day
- **Activity trends** - Average commits per day
- **Visual charts** - Beautiful Chart.js visualizations

### 🔧 Repository Optimization
- **Garbage collection analysis** - Detect when GC is needed
- **Storage insights** - Loose objects, pack files, and sizes
- **One-click optimization** - Run git gc directly from the UI
- **Health recommendations** - Actionable suggestions to improve repo performance

### 🎨 Beautiful Dark Theme UI
- **Modern Tailwind CSS design** - Responsive and beautiful
- **Dark theme** - Easy on the eyes for long sessions
- **Real-time updates** - WebSocket-powered live data
- **Smooth animations** - Professional transitions and effects

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- Git installed on your system
- A Git repository to analyze

### Install Dependencies

```bash
npm install
```

## 🎯 Usage

### Basic Usage

```bash
# Navigate to your project directory
cd /path/to/your/project

# Run GitMaster (analyzes current directory)
node cli.js

# Or specify a different repository
node cli.js -g /path/to/repo
```

### Command Line Options

```bash
# Specify git repository path
node cli.js --git-folder /path/to/repo

# Specify custom port
node cli.js --port 8080

# Don't open browser automatically
node cli.js --no-browser

# Combine options
node cli.js -g /path/to/repo -p 8080 --no-browser
```

### Global Installation (Optional)

Make GitMaster available globally:

```bash
# Install globally
npm install -g .

# Now use from anywhere
gitmaster -g /path/to/any/repo
```

## 🖥️ Web Interface

Once started, GitMaster opens a beautiful web interface with six main tabs:

### 1. **Overview**
- Quick stats dashboard
- Recent activity summary
- Top contributors
- Repository health score

### 2. **Commits**
- Last 50 commits
- Author information
- Commit messages and hashes
- Timestamps

### 3. **Branches**
- All local branches
- Current branch highlighted
- Commit hashes
- Easy navigation

### 4. **File Tree**
- Complete repository structure
- Folders and files
- Hierarchical display
- Easy browsing

### 5. **Statistics**
- Commits by day of week chart
- Commits by hour of day chart
- Activity patterns
- Visual insights

### 6. **Optimize**
- Repository storage analysis
- Garbage collection recommendations
- Health report with issues
- One-click optimization

## 🔥 Key Features Explained

### Health Scoring System

GitMaster analyzes your repository and provides a health score (0-100):

- **Excellent (90-100)**: Repository is in great shape
- **Good (70-89)**: Minor improvements possible
- **Needs Attention (50-69)**: Several issues to address
- **Poor (0-49)**: Requires immediate attention

Health checks include:
- Recent commit activity
- Garbage collection needs
- Pack file optimization
- Large file detection

### Garbage Collection Analysis

GitMaster helps you understand when to run garbage collection:

- **Loose objects count** - Files not yet packed
- **Loose size** - Space used by loose objects
- **Pack count** - Number of pack files
- **Pack size** - Space used by packs

Automatic recommendations when:
- More than 1000 loose objects exist
- Loose objects exceed 10 MB

### Real-time Updates

WebSocket connection provides:
- Live repository status
- Instant refresh capability
- Connection status indicator
- Automatic reconnection

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Git Integration**: simple-git
- **Frontend**: HTML5 + Tailwind CSS
- **Charts**: Chart.js
- **Real-time**: WebSocket (ws)
- **CLI**: Commander + Chalk + Ora

## 📋 API Endpoints

GitMaster exposes several API endpoints:

- `GET /api/analyze` - Complete repository analysis
- `GET /api/tree` - File tree structure
- `GET /api/graph?limit=100` - Commit graph
- `GET /api/file/:ref/*` - File content at specific ref
- `POST /api/gc` - Run garbage collection

## 🎨 Customization

### Port Configuration

```bash
# Use custom port
node cli.js --port 3001
```

### Analysis Depth

Edit `analyzer.js` to customize:
- Number of commits to analyze
- Health check thresholds
- Garbage collection recommendations

## 🐛 Troubleshooting

### "Not a git repository"
Make sure you're running GitMaster in a directory with a `.git` folder.

### Port already in use
Use the `--port` option to specify a different port:
```bash
node cli.js --port 3001
```

### WebSocket connection failed
Check your firewall settings and ensure the port is accessible.

## 🚀 Performance Tips

1. **Large repositories**: GitMaster analyzes up to 1000 commits by default
2. **Run GC regularly**: Use the Optimize tab to keep your repo lean
3. **Monitor health score**: Address issues as they appear

## 📝 Example Output

```
┌───────────────────────────────────────────┐
│                                           │
│   🚀 GitMaster                            │
│                                           │
│   The Ultimate Git Repository Analyzer   │
│   Even Linus would approve!               │
│                                           │
└───────────────────────────────────────────┘

📁 Repository: /Users/dev/my-project
🌐 Port: 3000

✓ Repository validated
  Branches: 12
  Commits: 1,543
  Contributors: 8

✓ Server started

  🌐 http://localhost:3000
```

## 🤝 Contributing

This is a demonstration project showcasing the ultimate Git UI. Feel free to:
- Fork and improve
- Add new features
- Submit issues
- Share feedback

## 📄 License

MIT License - Feel free to use this for any purpose!

## 🌟 Why GitMaster?

- **Fast**: Analyzes repositories quickly
- **Comprehensive**: More insights than SourceTree
- **Beautiful**: Modern, dark-themed interface
- **Smart**: Health scoring and recommendations
- **Free**: Open source, no subscriptions
- **Cross-platform**: Works on Mac, Linux, Windows

## 🎯 Roadmap

Future enhancements could include:
- Commit graph visualization
- Diff viewer
- Branch comparison
- Merge conflict detection
- Performance profiling
- Custom themes
- Plugin system

---

**Made with ⚡ for developers who love Git**

*"The only Git UI that Linus might actually use"* - Probably not Linus
