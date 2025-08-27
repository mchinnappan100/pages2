# The Complete Git Commands Handbook: Mastering Version Control

Git is the backbone of modern software development, enabling millions of developers worldwide to collaborate, track changes, and manage their code efficiently. This comprehensive guide will take you from Git novice to expert, covering everything from basic commands to advanced workflows.

Whether you're a beginner taking your first steps into version control or an experienced developer looking to deepen your Git knowledge, this handbook provides practical examples, real-world scenarios, and best practices that will transform how you work with code.

## Introduction to Git: The Foundation of Modern Development

Git is a distributed version control system created by Linus Torvalds in 2005. Unlike centralized version control systems, Git gives every developer a complete copy of the project history, making it incredibly powerful for collaborative development.

### Why Git Revolutionized Software Development

Before Git, developers struggled with centralized systems that created bottlenecks and made offline work nearly impossible. Git changed everything by introducing:

- **Distributed Architecture**: Every clone is a full backup
- **Branching and Merging**: Lightweight branches that encourage experimentation
- **Speed**: Operations are fast because they're mostly local
- **Data Integrity**: Every file and commit is checksummed
- **Non-linear Development**: Support for thousands of parallel branches

### The Git Philosophy

Git follows a simple philosophy: *track changes, not files*. This fundamental shift in thinking enables powerful features like:

- Tracking content across file renames
- Detecting when identical changes are made independently
- Merging changes from multiple sources intelligently
- Maintaining complete project history in a compact format

> *"Git is not just a version control system; it's a content tracker that happens to be very good at version control."*

## Setting Up Your Git Environment

Before diving into commands, let's ensure your Git environment is properly configured for optimal productivity.

### Initial Configuration

Every Git installation should begin with proper configuration. These settings affect every repository on your system:

```bash
# Set your identity (required for all commits)
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"

# Set your preferred text editor
git config --global core.editor "code --wait"  # VS Code
git config --global core.editor "vim"          # Vim
git config --global core.editor "nano"         # Nano

# Set default branch name for new repositories
git config --global init.defaultBranch main

# Enable helpful colorization
git config --global color.ui auto
```

### Advanced Configuration Options

Enhance your Git experience with these advanced configurations:

```bash
# Set up aliases for common commands
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'

# Configure merge and diff tools
git config --global merge.tool vimdiff
git config --global diff.tool vimdiff

# Set up automatic line ending conversion
git config --global core.autocrlf input    # Linux/Mac
git config --global core.autocrlf true     # Windows

# Configure push behavior
git config --global push.default simple
```

### Understanding Git Configuration Levels

Git operates with three configuration levels, each overriding the previous:

1. **System Level** (`--system`): Affects all users on the system
2. **Global Level** (`--global`): Affects all repositories for the current user
3. **Local Level** (`--local`): Affects only the current repository

## Repository Fundamentals: Creating and Cloning

Every Git journey begins with creating or obtaining a repository. Understanding these foundational operations sets the stage for everything that follows.

### Creating a New Repository

Starting a new project with Git is straightforward, but there are several approaches depending on your situation:

```bash
# Initialize a new repository in current directory
git init

# Initialize a new repository with a specific name
git init my-project-name

# Initialize a repository with a custom initial branch
git init --initial-branch=main my-project

# Create a bare repository (for servers)
git init --bare my-repo.git
```

### Understanding Repository Structure

When you run `git init`, Git creates a `.git` directory containing:

- **objects/**: Stores all content (blobs, trees, commits)
- **refs/**: Stores pointers to commits (branches, tags)
- **HEAD**: Points to the current branch
- **config**: Repository-specific configuration
- **hooks/**: Scripts that run at specific Git events

### Cloning Existing Repositories

Cloning creates a complete copy of a remote repository:

```bash
# Clone a repository
git clone https://github.com/user/repository.git

# Clone into a specific directory
git clone https://github.com/user/repository.git my-folder

# Clone only a specific branch
git clone -b develop https://github.com/user/repository.git

# Clone with a specific depth (shallow clone)
git clone --depth 1 https://github.com/user/repository.git

# Clone using SSH (requires SSH key setup)
git clone git@github.com:user/repository.git
```

### Remote Repository Protocols

Git supports several protocols for accessing remote repositories:

- **HTTPS**: `https://github.com/user/repo.git`
  - Easy to set up, works through firewalls
  - Requires username/password or token authentication
  
- **SSH**: `git@github.com:user/repo.git`
  - More secure, uses key-based authentication
  - Requires SSH key setup
  
- **Git Protocol**: `git://github.com/user/repo.git`
  - Fastest for read-only access
  - No authentication, rarely used now

## The Three States: Working Directory, Staging Area, and Repository

Understanding Git's three-state system is crucial for mastering version control. Every file in your Git project exists in one of three states.

### Working Directory: Your Sandbox

The working directory contains the current version of your project files. This is where you make changes, create new files, and modify existing ones. Files in the working directory can be:

- **Tracked**: Files Git knows about
- **Untracked**: New files Git hasn't seen before
- **Modified**: Tracked files that have been changed since the last commit

### Staging Area: Preparing for Commitment

The staging area (also called the "index") is where you prepare changes for the next commit. Think of it as a rough draft of your next commit. This intermediate step allows you to:

- Review changes before committing
- Selectively commit only certain changes
- Craft meaningful, atomic commits
- Fix mistakes before they become permanent

### Repository: The Permanent Record

The repository (stored in the `.git` directory) contains the complete history of your project. Once changes are committed here, they become part of your project's permanent record.

### Visualizing the Three States

```
Working Directory  →  Staging Area  →  Repository
     (edit)           (git add)      (git commit)
      ↓                   ↓              ↓
  Modified files    →  Staged files → Committed files
```

## Basic Commands: Your Daily Git Toolkit

These commands form the foundation of daily Git usage. Mastering them will handle 90% of your version control needs.

### Checking Repository Status

The `git status` command is your best friend. It shows:
- Which files are staged, unstaged, or untracked
- Which branch you're on
- How your branch relates to the remote branch

```bash
# Full status output
git status

# Short status format
git status -s
git status --short

# Show branch and tracking information
git status -b
git status --branch
```

### Status Output Interpretation

Understanding status output is crucial:

```
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   README.md
        new file:   src/utils.js

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes)
        modified:   src/main.js

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        temp.txt
```

### Adding Changes to Staging Area

The `git add` command moves changes from your working directory to the staging area:

```bash
# Add a specific file
git add filename.txt

# Add multiple files
git add file1.txt file2.txt file3.txt

# Add all files in current directory
git add .

# Add all files in the repository
git add -A
git add --all

# Add only modified and deleted files (not new files)
git add -u
git add --update

# Interactively choose changes to add
git add -i
git add --interactive

# Add parts of files (patch mode)
git add -p
git add --patch
```

### The Power of Patch Mode

Patch mode (`git add -p`) is incredibly powerful for creating precise commits:

```bash
git add -p filename.txt
```

Git will show you each change and ask what to do:
- **y**: Stage this hunk
- **n**: Don't stage this hunk
- **s**: Split this hunk into smaller parts
- **e**: Edit this hunk manually
- **q**: Quit patch mode

### Committing Changes

Commits are snapshots of your repository at a specific point in time:

```bash
# Commit staged changes with inline message
git commit -m "Add user authentication feature"

# Commit with detailed message using editor
git commit

# Commit all tracked files (skip staging)
git commit -a -m "Fix typos in documentation"

# Amend the last commit
git commit --amend

# Amend without changing commit message
git commit --amend --no-edit
```

### Writing Great Commit Messages

Good commit messages follow these conventions:

```
Short (50 chars or less) summary

More detailed explanatory text, if necessary. Wrap it to
about 72 characters or so. In some contexts, the first
line is treated as the subject of an email and the rest
as the body.

Further paragraphs come after blank lines.

- Bullet points are okay, too
- Use a hyphen or asterisk for bullets
```

**Examples of good commit messages:**

```bash
git commit -m "Add user authentication with JWT tokens"
git commit -m "Fix memory leak in image processing module"
git commit -m "Update dependencies to address security vulnerabilities"
```

## Viewing History: Understanding Your Project's Evolution

Git's history commands let you explore your project's evolution, understand changes, and debug issues.

### Basic Log Viewing

The `git log` command shows commit history:

```bash
# Basic log output
git log

# One line per commit
git log --oneline

# Show last 5 commits
git log -5
git log -n 5

# Show commits with file changes
git log --stat

# Show actual changes
git log -p
git log --patch
```

### Advanced Log Formatting

Customize log output for different needs:

```bash
# Custom format
git log --pretty=format:"%h - %an, %ar : %s"

# Graph view of branches
git log --graph --oneline --all

# Show decorations (branches, tags)
git log --decorate

# Combine multiple options
git log --graph --pretty=format:'%h -%d %s (%cr) <%an>' --abbrev-commit
```

### Filtering Commits

Find specific commits with powerful filtering:

```bash
# Commits by author
git log --author="John Doe"

# Commits since a date
git log --since="2023-01-01"
git log --after="2 weeks ago"

# Commits until a date
git log --until="2023-12-31"
git log --before="yesterday"

# Commits affecting specific files
git log -- filename.txt
git log --follow -- filename.txt  # Follow renames

# Commits with specific text in message
git log --grep="bug fix"

# Commits that changed specific text
git log -S "function_name"
git log --grep="function_name" --source --all
```

### Visualizing Differences

Compare different versions of your code:

```bash
# Show changes in working directory
git diff

# Show staged changes
git diff --staged
git diff --cached

# Compare two commits
git diff commit1 commit2

# Compare specific files between commits
git diff commit1 commit2 -- filename.txt

# Compare branches
git diff main feature-branch

# Show word-level differences
git diff --word-diff
```

### Understanding Diff Output

Git diff output follows a standard format:

```diff
diff --git a/file.txt b/file.txt
index 1234567..abcdefg 100644
--- a/file.txt
+++ b/file.txt
@@ -1,4 +1,4 @@
 This line stays the same
-This line was removed
+This line was added
 This line also stays the same
```

## Branching and Merging: Parallel Development Made Easy

Branching is where Git truly shines. It enables parallel development, experimentation, and collaboration without interfering with stable code.

### Understanding Branches

In Git, a branch is simply a movable pointer to a specific commit. The default branch is usually called `main` (formerly `master`). Branches are:

- **Lightweight**: Creating a branch is nearly instantaneous
- **Local**: Branches exist locally until pushed to a remote
- **Independent**: Changes in one branch don't affect others

### Basic Branch Operations

```bash
# List all branches
git branch

# List all branches including remotes
git branch -a

# Create a new branch
git branch feature-login

# Create and switch to new branch
git checkout -b feature-login
# or using newer syntax
git switch -c feature-login

# Switch to existing branch
git checkout main
# or
git switch main

# Delete a branch (safe - prevents deletion of unmerged branches)
git branch -d feature-login

# Force delete a branch
git branch -D feature-login

# Rename current branch
git branch -m new-branch-name

# Rename any branch
git branch -m old-name new-name
```

### Understanding Branch Pointers

Visualizing how branches work:

```
      A---B---C main
           \
            D---E feature-login
```

When you commit on the `feature-login` branch, it moves forward while `main` stays put:

```
      A---B---C main
           \
            D---E---F feature-login
```

### Merging Strategies

Git offers several merge strategies, each suited for different scenarios.

#### Fast-Forward Merge

When the target branch hasn't changed since the feature branch was created:

```bash
# Switch to target branch
git checkout main

# Merge feature branch (fast-forward)
git merge feature-login
```

Result:
```
      A---B---C---D---E---F main (feature-login deleted)
```

#### Three-Way Merge

When both branches have new commits:

```bash
git checkout main
git merge feature-login
```

Result:
```
      A---B---C-------G main
           \         /
            D---E---F feature-login
```

#### Merge vs. Rebase

**Merging** preserves history but can create complex graphs:
```bash
git checkout main
git merge feature-branch
```

**Rebasing** creates linear history by replaying commits:
```bash
git checkout feature-branch
git rebase main
```

### Advanced Branching Patterns

#### Feature Branch Workflow

```bash
# Create feature branch
git checkout -b feature-payment-processing

# Work on feature
git add .
git commit -m "Add payment validation"
git commit -m "Integrate payment gateway"

# Update main and rebase feature branch
git checkout main
git pull origin main
git checkout feature-payment-processing
git rebase main

# Merge back to main
git checkout main
git merge feature-payment-processing --no-ff
git branch -d feature-payment-processing
```

#### Git Flow Model

A branching model with specific branch types:

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: New feature development
- **release/***: Release preparation
- **hotfix/***: Emergency fixes

```bash
# Start a new feature
git checkout develop
git pull origin develop
git checkout -b feature/user-dashboard

# Finish feature
git checkout develop
git pull origin develop
git merge --no-ff feature/user-dashboard
git branch -d feature/user-dashboard
git push origin develop
```

## Remote Repositories: Collaborating with the World

Remote repositories enable collaboration by providing a shared space where multiple developers can contribute to the same project.

### Understanding Remotes

A remote is a version of your project hosted elsewhere - typically on services like GitHub, GitLab, or Bitbucket. The most common remote is called `origin`, which usually points to where you cloned the repository from.

### Managing Remotes

```bash
# List all remotes
git remote -v

# Add a new remote
git remote add upstream https://github.com/original/repository.git

# Remove a remote
git remote remove old-remote

# Rename a remote
git remote rename old-name new-name

# Change remote URL
git remote set-url origin https://github.com/user/new-repo.git

# Show detailed remote information
git remote show origin
```

### Fetching and Pulling

Understanding the difference between fetch and pull is crucial:

**Fetch** downloads data but doesn't merge:
```bash
# Fetch from all remotes
git fetch --all

# Fetch from specific remote
git fetch origin

# Fetch specific branch
git fetch origin main
```

**Pull** fetches and merges in one command:
```bash
# Pull current branch
git pull

# Pull from specific remote/branch
git pull origin main

# Pull with rebase instead of merge
git pull --rebase

# Pull with specific strategy
git pull --no-ff  # Always create merge commit
```

### Pushing Changes

Share your work by pushing to remote repositories:

```bash
# Push current branch to origin
git push

# Push specific branch
git push origin feature-branch

# Push and set upstream tracking
git push -u origin feature-branch

# Push all branches
git push --all

# Push tags
git push --tags

# Force push (dangerous!)
git push --force
git push --force-with-lease  # Safer force push
```

### Understanding Tracking Branches

Tracking branches are local branches that have a direct relationship with remote branches:

```bash
# Set up tracking branch
git branch --set-upstream-to=origin/main main

# Create tracking branch from remote
git checkout --track origin/feature-branch

# Push and create tracking branch
git push -u origin feature-branch
```

### Collaborative Workflows

#### Centralized Workflow

Simple workflow for small teams:

```bash
# Everyone works on main branch
git clone repo-url
git pull origin main
# Make changes
git add .
git commit -m "Add new feature"
git push origin main
```

#### Feature Branch Workflow

Each feature gets its own branch:

```bash
# Developer A
git checkout -b feature-a
# Work on feature
git push origin feature-a

# Developer B reviews and merges
git checkout main
git pull origin main
git merge origin/feature-a
git push origin main
```

#### Forking Workflow

Used in open source projects:

```bash
# Fork repository on GitHub
# Clone your fork
git clone https://github.com/yourname/project.git
git remote add upstream https://github.com/original/project.git

# Create feature branch
git checkout -b feature-branch

# Push to your fork
git push origin feature-branch

# Create pull request on GitHub
```

## Undoing Changes: Git's Safety Net

One of Git's greatest strengths is its ability to undo changes safely. Understanding these commands can save you from disasters and give you confidence to experiment.

### Discarding Working Directory Changes

When you have uncommitted changes you want to discard:

```bash
# Discard changes to specific file
git restore filename.txt
# or
git checkout -- filename.txt

# Discard all changes in working directory
git restore .
# or
git checkout -- .

# Remove untracked files
git clean -f

# Remove untracked files and directories
git clean -fd

# Preview what would be cleaned
git clean -n
```

### Unstaging Changes

Remove changes from staging area without losing them:

```bash
# Unstage specific file
git restore --staged filename.txt
# or
git reset HEAD filename.txt

# Unstage all files
git restore --staged .
# or
git reset HEAD
```

### Modifying Commits

#### Amending the Last Commit

```bash
# Change commit message
git commit --amend -m "New commit message"

# Add more changes to last commit
git add forgotten-file.txt
git commit --amend --no-edit

# Change author of last commit
git commit --amend --author="New Author <new@email.com>"
```

#### Resetting Commits

Reset moves the current branch pointer backward:

```bash
# Soft reset - keep changes in staging area
git reset --soft HEAD~1

# Mixed reset (default) - keep changes in working directory
git reset HEAD~1
git reset --mixed HEAD~1

# Hard reset - discard all changes
git reset --hard HEAD~1

# Reset to specific commit
git reset --hard abc123
```

**Reset Types Visualized:**

```
Before reset:
A---B---C (HEAD)

Soft reset to B:
A---B (HEAD)
Changes from C are staged

Mixed reset to B:
A---B (HEAD)
Changes from C are in working directory

Hard reset to B:
A---B (HEAD)
Changes from C are lost
```

### Advanced Undoing with Revert

Revert creates new commits that undo previous commits, preserving history:

```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert abc123

# Revert merge commit
git revert -m 1 merge-commit-hash

# Revert multiple commits
git revert HEAD~3..HEAD
```

### Interactive Rebase: Rewriting History

Interactive rebase is a powerful tool for cleaning up commit history:

```bash
# Start interactive rebase for last 3 commits
git rebase -i HEAD~3

# Rebase onto different branch
git rebase -i main
```

Interactive rebase options:
- **pick**: Keep commit as-is
- **reword**: Change commit message
- **edit**: Stop to modify commit
- **squash**: Combine with previous commit
- **fixup**: Like squash but discard commit message
- **drop**: Remove commit entirely

### Recovering Lost Commits

Git rarely loses data permanently. Use these commands to recover:

```bash
# Show reflog (reference log)
git reflog

# Recover commit using reflog
git checkout commit-hash

# Create branch from recovered commit
git checkout -b recovered-branch commit-hash

# Show commits not reachable from any branch
git fsck --lost-found
```

## Advanced Git Techniques: Power User Features

These advanced techniques will elevate your Git skills and make you more efficient in complex scenarios.

### Stashing: Temporary Storage

Stashing temporarily saves your work when you need to switch contexts quickly:

```bash
# Stash current changes
git stash

# Stash with message
git stash save "Work in progress on login feature"

# List all stashes
git stash list

# Apply most recent stash
git stash apply

# Apply and remove stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Drop specific stash
git stash drop stash@{1}

# Clear all stashes
git stash clear

# Stash including untracked files
git stash -u

# Stash only unstaged changes
git stash --keep-index

# Create branch from stash
git stash branch feature-branch stash@{0}
```

### Cherry-Picking: Selective Commits

Apply specific commits from one branch to another:

```bash
# Cherry-pick a single commit
git cherry-pick abc123

# Cherry-pick multiple commits
git cherry-pick abc123 def456 ghi789

# Cherry-pick a range of commits
git cherry-pick abc123..def456

# Cherry-pick without committing
git cherry-pick --no-commit abc123

# Cherry-pick and edit commit message
git cherry-pick --edit abc123
```

### Bisect: Finding Bugs

Use binary search to find the commit that introduced a bug:

```bash
# Start bisecting
git bisect start

# Mark current commit as bad
git bisect bad

# Mark a known good commit
git bisect good abc123

# Git will check out a commit in the middle
# Test the code, then mark as good or bad
git bisect good   # if it works
git bisect bad    # if it's broken

# Continue until Git finds the problematic commit
# Reset when done
git bisect reset
```

### Submodules: Managing Dependencies

Include other Git repositories as subdirectories:

```bash
# Add a submodule
git submodule add https://github.com/user/library.git lib/library

# Initialize submodules after cloning
git submodule init
git submodule update

# Or do both in one command
git submodule update --init

# Update all submodules
git submodule update --remote

# Clone repository with submodules
git clone --recurse-submodules https://github.com/user/project.git
```

### Hooks: Automating Workflows

Git hooks are scripts that run automatically at certain points:

**Pre-commit hook example:**
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run tests before allowing commit
npm test
if [ $? -ne 0 ]; then
    echo "Tests must pass before committing!"
    exit 1
fi

# Check code formatting
npm run lint
if [ $? -ne 0 ]; then
    echo "Please fix linting errors before committing!"
    exit 1
fi
```

**Common hooks:**
- **pre-commit**: Run before commit is created
- **commit-msg**: Validate commit messages
- **pre-push**: Run before pushing to remote
- **post-receive**: Run on server after receiving push

### Worktrees: Multiple Working Directories

Work on multiple branches simultaneously:

```bash
# Create new worktree
git worktree add ../project-feature feature-branch

# List worktrees
git worktree list

# Remove worktree
git worktree remove ../project-feature

# Prune deleted worktrees
git worktree prune
```

## Git Workflows: Team Collaboration Patterns

Different teams and projects benefit from different Git workflows. Understanding these patterns helps you choose the right approach.

### GitHub Flow

Simple workflow perfect for continuous deployment:

```bash
# 1. Create feature branch
git checkout -b feature-name

# 2. Make changes and commit
git add .
git commit -m "Add feature"

# 3. Push branch
git push origin feature-name

# 4. Create Pull Request on GitHub

# 5. After review and merge, update main
git checkout main
git pull origin main
git branch -d feature-name
```

### GitLab Flow

Extends GitHub Flow with environment branches:

```bash
# Development workflow
git checkout -b feature-branch
# Develop feature
git push origin feature-branch
# Create Merge Request to main

# Release workflow
git checkout -b release/1.0 main
# Deploy to staging
# After testing, merge to production branch
git checkout production
git merge release/1.0
```

### Atlassian Git Flow

Structured workflow with specific branch types:

```bash
# Feature development
git checkout develop
git checkout -b feature/payment-system
# Develop feature
git checkout develop
git merge --no-ff feature/payment-system

# Release preparation
git checkout -b release/1.5 develop
# Bug fixes and release prep
git checkout main
git merge --no-ff release/1.5
git tag v1.5
git checkout develop
git merge --no-ff main

# Hotfix
git checkout -b hotfix/critical-bug main
# Fix bug
git checkout main
git merge --no-ff hotfix/critical-bug
git tag v1.5.1
git checkout develop
git merge --no-ff main
```

### Microsoft Git Flow

Similar to Git Flow but with a twist:

```bash
# All work branches from main
git checkout main
git checkout -b users/john/feature-branch

# Regular integration with main
git fetch origin
git merge origin/main

# When complete, rebase and merge
git rebase main
git checkout main
git merge --no-ff users/john/feature-branch
```

## Troubleshooting: Common Git Problems and Solutions

Even experienced developers encounter Git issues. Here are solutions to common problems.

### Merge Conflicts

When Git can't automatically merge changes:

```bash
# When merge conflict occurs
git status  # Shows conflicted files

# Edit conflicted files to resolve conflicts
# Conflicts look like this:
<<<<<<< HEAD
Your changes
=======
Their changes
>>>>>>> branch-name

# After resolving conflicts
git add conflicted-file.txt
git commit  # Complete the merge
```

**Merge conflict resolution strategies:**

```bash
# Accept all changes from one side
git checkout --theirs conflicted-file.txt  # Accept their changes
git checkout --ours conflicted-file.txt    # Keep your changes

# Use merge tool
git mergetool

# Abort merge
git merge --abort
```

### Detached HEAD State

When you check out a specific commit instead of a branch:

```bash
# You're in detached HEAD state
git checkout abc123

# To make changes permanent, create a branch
git checkout -b new-branch-name

# Or return to a branch
git checkout main
```

### Accidentally Committed to Wrong Branch

Move commits to the correct branch:

```bash
# If you committed to main instead of feature branch
git branch feature-branch  # Create branch at current position
git reset --hard HEAD~3    # Move main back 3 commits
git checkout feature-branch # Switch to feature branch
```

### Undoing Pushed Commits

When you need to undo commits that have been pushed:

```bash
# Create revert commits (safe for shared repositories)
git revert HEAD~2..HEAD

# Force push after local reset (dangerous!)
git reset --hard HEAD~2
git push --force-with-lease
```

### Large File Issues

Dealing with large files in Git:

```bash
# Remove large file from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch large-file.zip' \
  --prune-empty --tag-name-filter cat -- --all

# Use Git LFS for large files
git lfs install
git lfs track "*.zip"
git add .gitattributes
git add large-file.zip
git commit -m "Add large file with LFS"
```

### Repository Corruption

Rare but serious issues:

```bash
# Check repository integrity
git fsck --full

# Recover from backup
git clone --mirror backup-repo.git
cd backup-repo.git
git push --mirror origin
```

## Git Best Practices: Professional Development Guidelines

Following these best practices will make you a better collaborator and maintain cleaner project history.

### Commit Message Guidelines

**The Seven Rules of Great Git Commit Messages:**

1. **Separate subject from body with blank line**
2. **Limit subject line to 50 characters**
3. **Capitalize the subject line**
4. **Don't end subject line with period**
5. **Use imperative mood in subject line**
6. **Wrap body at 72 characters**
7. **Use body to explain what and why, not how**

**Example:**
```
Add user authentication with OAuth 2.0

Integrate Google and Facebook OAuth providers to allow users
to sign in with their existing accounts. This improves user
experience by reducing registration friction.

- Add OAuth configuration
- Implement callback handlers
- Update user model to support external IDs
- Add tests for authentication flow

Closes #123
```

### Branching Strategies

**Branch Naming Conventions:**

```bash
# Feature branches
feature/user-authentication
feature/payment-integration
feat/mobile-responsive-design

# Bug fix branches
bugfix/login-validation
fix/memory-leak-in-parser

# Hotfix branches
hotfix/security-vulnerability
hotfix/critical-crash

# Release branches
release/v1.2.0
release/2023.12
```

### Repository Organization

**Directory Structure:**
```
project-root/
├── .git/
├── .gitignore
├── .gitattributes
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── src/
├── tests/
├── docs/
└── scripts/
```

**Essential files:**

**.gitignore:**
```gitignore
# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/
*.o
*.exe

# IDE files
.vscode/
.idea/
*.swp

# OS files
.DS_Store
Thumbs.db

# Environment files
.env
.env.local

# Logs
*.log
logs/
```

**.gitattributes:**
```gitattributes
# Ensure consistent line endings
* text=auto

# Binary files
*.png binary
*.jpg binary
*.pdf binary

# Language-specific settings
*.js text eol=lf
*.css text eol=lf
*.html text eol=lf
*.md text eol=lf

# Archive files
*.zip export-ignore
*.tar.gz export-ignore
```

### Security Best Practices

**Protecting Sensitive Information:**

```bash
# Never commit sensitive data
echo "config/secrets.json" >> .gitignore
echo ".env" >> .gitignore
echo "*.key" >> .gitignore

# Remove accidentally committed secrets
git rm --cached secrets.json
git commit -m "Remove secrets file"

# Use git-secrets to prevent accidental commits
git secrets --register-aws
git secrets --install
```

**GPG Signing:**
```bash
# Generate GPG key
gpg --gen-key

# Configure Git to use GPG key
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# Sign commits and tags
git commit -S -m "Signed commit"
git tag -s v1.0.0 -m "Signed tag"
```

### Performance Optimization

**Keeping Repositories Fast:**

```bash
# Garbage collection
git gc --aggressive --prune=now

# Optimize repository
git repack -Ad

# Check repository size
git count-objects -vH

# Shallow clones for CI/CD
git clone --depth 1 --single-branch repository.git

# Partial clones (Git 2.19+)
git clone --filter=blob:none repository.git
```

**Large Repository Management:**

```bash
# Use Git LFS for large files
git lfs install
git lfs track "*.psd"
git lfs track "*.mp4"
git add .gitattributes

# Sparse checkout for large repositories
git config core.sparseCheckout true
echo "src/" > .git/info/sparse-checkout
git read-tree -m -u HEAD
```

## Git Internals: Understanding the Engine

Understanding Git's internal structure helps you use it more effectively and troubleshoot complex issues.

### Git Object Model

Git stores everything as objects in a content-addressable file system. There are four types of objects:

#### Blob Objects (File Contents)
```bash
# Create a blob object
echo "Hello, Git!" | git hash-object -w --stdin

# Read blob content
git cat-file -p blob-hash

# Check object type
git cat-file -t blob-hash
```

#### Tree Objects (Directory Structure)
```bash
# View tree object
git cat-file -p HEAD^{tree}

# Create tree object
git write-tree
```

#### Commit Objects (Snapshots)
```bash
# View commit object
git cat-file -p HEAD

# Commit structure:
# tree [tree-hash]
# parent [parent-hash]
# author [name] [timestamp]
# committer [name] [timestamp]
# 
# [commit message]
```

#### Tag Objects (References)
```bash
# Create annotated tag
git tag -a v1.0 -m "Version 1.0"

# View tag object
git cat-file -p v1.0
```

### References and HEAD

Git uses references (refs) to point to commits:

```bash
# List all references
git for-each-ref

# Show what HEAD points to
git symbolic-ref HEAD

# Show commit that HEAD points to
git rev-parse HEAD

# Reference types:
# refs/heads/    - local branches
# refs/remotes/  - remote branches
# refs/tags/     - tags
```

### The Index File

The index (staging area) is stored in `.git/index`:

```bash
# Show index contents
git ls-files --stage

# Show index in human-readable format
git status --porcelain
```

### Packfiles and Compression

Git compresses objects into packfiles for efficiency:

```bash
# Force packing
git gc

# Verify pack integrity
git verify-pack .git/objects/pack/pack-*.idx

# Show pack statistics
git count-objects -v
```

## Git Configuration Deep Dive

Master Git configuration to customize your workflow and improve productivity.

### Configuration Hierarchy

Git reads configuration from multiple locations in order:

1. **System**: `/etc/gitconfig` (affects all users)
2. **Global**: `~/.gitconfig` (affects current user)
3. **Local**: `.git/config` (affects current repository)
4. **Worktree**: `.git/config.worktree` (affects current worktree)

### Essential Configuration Options

```bash
# Identity
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Editor settings
git config --global core.editor "code --wait"
git config --global sequence.editor "code --wait"

# Merge and diff tools
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'

# Default behaviors
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global push.default simple
git config --global rerere.enabled true

# Performance settings
git config --global core.preloadindex true
git config --global core.fscache true
git config --global gc.auto 256

# Security settings
git config --global transfer.fsckObjects true
git config --global fetch.fsckObjects true
git config --global receive.fsckObjects true
```

### Advanced Configuration

```bash
# Custom aliases
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'

# URL rewrites
git config --global url."git@github.com:".insteadOf "https://github.com/"

# Custom attributes
git config --global filter.tabspace.smudge 'expand --tabs=4'
git config --global filter.tabspace.clean 'expand --tabs=4'
```

### Conditional Configuration

Configure Git differently based on directory:

**~/.gitconfig:**
```ini
[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig-work
[includeIf "gitdir:~/personal/"]
    path = ~/.gitconfig-personal
```

**~/.gitconfig-work:**
```ini
[user]
    name = John Doe
    email = john.doe@company.com
    signingKey = WORK_GPG_KEY
```

## Advanced Collaboration Techniques

### Managing Multiple Remotes

Working with multiple remotes for complex collaboration:

```bash
# Add upstream remote (for forks)
git remote add upstream https://github.com/original/repo.git

# Fetch from all remotes
git fetch --all

# Push to multiple remotes
git remote set-url --add origin https://github.com/backup/repo.git

# Create tracking branches from different remotes
git checkout -b feature --track upstream/feature
```

### Advanced Merging Strategies

```bash
# Merge with custom strategy
git merge -X theirs feature-branch
git merge -X ours feature-branch

# Subtree merge
git read-tree --prefix=lib/ -u library-branch

# Octopus merge (multiple branches)
git merge branch1 branch2 branch3

# No fast-forward merge (always create merge commit)
git merge --no-ff feature-branch
```

### Sophisticated Rebasing

```bash
# Interactive rebase with autosquash
git commit --fixup=abc123
git rebase -i --autosquash HEAD~5

# Preserve merge commits during rebase
git rebase --preserve-merges main

# Rebase onto different branch
git rebase --onto main feature-base feature-branch

# Continue rebase after resolving conflicts
git rebase --continue

# Skip problematic commit during rebase
git rebase --skip

# Abort rebase
git rebase --abort
```

### Patch Management

```bash
# Create patch files
git format-patch -3 HEAD

# Create patch with cover letter
git format-patch --cover-letter -3 HEAD

# Apply patch files
git apply patch-file.patch

# Apply patches as commits
git am patch-file.patch

# Create patch between branches
git diff main..feature > feature.patch
```

## Git Hosting and CI/CD Integration

### GitHub Integration

**GitHub CLI Usage:**
```bash
# Install GitHub CLI
# Create pull request
gh pr create --title "Add new feature" --body "Description"

# List pull requests
gh pr list

# Check out pull request locally
gh pr checkout 123

# Merge pull request
gh pr merge 123 --merge --delete-branch
```

**GitHub Actions with Git:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      with:
        fetch-depth: 0  # Full history for better Git operations
    - name: Run tests
      run: npm test
    - name: Check commit messages
      run: |
        git log --oneline -10 | grep -E '^[a-f0-9]+ (feat|fix|docs|style|refactor|test|chore):'
```

### GitLab Integration

**GitLab CI with Git:**
```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  GIT_DEPTH: 10
  GIT_STRATEGY: clone

build:
  stage: build
  script:
    - git submodule sync --recursive
    - git submodule update --init --recursive
    - make build
```

### Automated Workflows

**Pre-commit hooks for code quality:**
```bash
# Install pre-commit
pip install pre-commit

# .pre-commit-config.yaml
repos:
-   repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
    -   id: trailing-whitespace
    -   id: end-of-file-fixer
    -   id: check-yaml
    -   id: check-added-large-files

# Install hooks
pre-commit install
```

## Git Performance and Scalability

### Optimizing Large Repositories

```bash
# Enable partial clone
git clone --filter=blob:none --single-branch large-repo.git

# Configure for large repositories
git config core.preloadindex true
git config core.fscache true
git config gc.auto 256

# Use sparse checkout
git config core.sparseCheckout true
echo "important-directory/" > .git/info/sparse-checkout
git read-tree -m -u HEAD

# Monitor repository health
git fsck --full
git count-objects -vH
```

### Git LFS for Large Files

```bash
# Install Git LFS
git lfs install

# Track file types
git lfs track "*.zip"
git lfs track "*.mp4"
git lfs track "design-assets/**"

# Check tracked patterns
git lfs ls-files

# Migrate existing files
git lfs migrate import --include="*.zip"

# Clone with LFS
git lfs clone repository-url
```

### Server-side Git

**Setting up Git server:**
```bash
# Create bare repository
git init --bare project.git

# Configure Git daemon
git daemon --reuseaddr --base-path=/opt/git/ /opt/git/

# Set up SSH access
# Add users to git group
usermod -a -G git username

# Configure post-receive hook
#!/bin/bash
# hooks/post-receive
while read oldrev newrev refname; do
    if [[ $refname == "refs/heads/main" ]]; then
        cd /var/www/project
        git --git-dir=/opt/git/project.git --work-tree=/var/www/project checkout -f
        # Restart services, run tests, etc.
    fi
done
```

## Troubleshooting Advanced Git Issues

### Repository Corruption Recovery

```bash
# Check repository integrity
git fsck --full --no-reflogs

# Recover lost commits
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Restore from backup
git remote add backup /path/to/backup.git
git fetch backup
git reset --hard backup/main
```

### Complex Merge Conflicts

```bash
# Use three-way merge tool
git mergetool --tool=vimdiff

# Resolve using specific strategy
git merge -X patience feature-branch
git merge -X diff-algorithm=histogram feature-branch

# Manual conflict resolution
git checkout --conflict=diff3 conflicted-file.txt
```

### Dealing with Binary Files

```bash
# Set merge strategy for binary files
echo "*.pdf binary" >> .gitattributes
echo "*.docx binary" >> .gitattributes

# Use custom merge driver
git config merge.ours.driver true
echo "database.db merge=ours" >> .gitattributes
```

### Network and Authentication Issues

```bash
# Debug network issues
GIT_TRACE=1 git push origin main
GIT_CURL_VERBOSE=1 git push origin main

# Fix SSL certificate issues
git config --global http.sslVerify false  # Not recommended
git config --global http.sslCAInfo /path/to/ca-bundle.crt

# Use credential helpers
git config --global credential.helper store
git config --global credential.helper 'cache --timeout=3600'
```

## Git Tips and Tricks for Experts

### Advanced Log and History Analysis

```bash
# Find commits that changed specific content
git log -S "function_name" --source --all

# Show commits that touched specific lines
git log -L 15,23:filename.txt

# Find commits by date range and author
git log --since="2023-01-01" --until="2023-12-31" --author="John"

# Show files changed in each commit
git log --name-status --oneline

# Create custom log format
git config --global pretty.custom "%C(red)%h%C(reset) -%C(yellow)%d%C(reset) %s %C(green)(%cr) %C(bold blue)<%an>%C(reset)"
git log --pretty=custom
```

### Powerful Git Aliases

```bash
# Advanced aliases
git config --global alias.tree 'log --graph --pretty=format:"%h - %d %s (%cr) <%an>" --abbrev-commit'
git config --global alias.who 'shortlog -s -n'
git config --global alias.aliases 'config --get-regexp alias'
git config --global alias.amend 'commit --amend --no-edit'
git config --global alias.uncommit 'reset --soft HEAD~1'
git config --global alias.save '!git add -A && git commit -m "SAVEPOINT"'
git config --global alias.wipe '!git add -A && git commit -qm "WIPE SAVEPOINT" && git reset HEAD~1 --hard'
```

### Scripting with Git

**Git in shell scripts:**
```bash
#!/bin/bash
# deploy.sh - Automated deployment script

# Check if repository is clean
if ! git diff-index --quiet HEAD --; then
    echo "Repository has uncommitted changes. Aborting."
    exit 1
fi

# Get current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Only deploy from main branch
if [ "$current_branch" != "main" ]; then
    echo "Deploy only from main branch. Currently on: $current_branch"
    exit 1
fi

# Check if we're ahead of remote
if [ $(git rev-list HEAD...origin/main --count) -gt 0 ]; then
    echo "Local branch is ahead of remote. Please push first."
    exit 1
fi

# Deploy
echo "Deploying commit $(git rev-parse --short HEAD)..."
# Add deployment commands here
```

### Git Integration with IDEs

**VS Code Git configuration:**
```json
{
    "git.autofetch": true,
    "git.enableCommitSigning": true,
    "git.confirmSync": false,
    "git.defaultCloneDirectory": "~/projects",
    "git.rebaseWhenSync": true
}
```

**Vim Git integration:**
```vim
" .vimrc
" Fugitive plugin bindings
nnoremap <leader>gs :Git<CR>
nnoremap <leader>gd :Gdiff<CR>
nnoremap <leader>gc :Git commit<CR>
nnoremap <leader>gb :Git blame<CR>
nnoremap <leader>gl :Git log<CR>
```

## The Future of Git

### Emerging Features and Trends

**Git 2.40+ Features:**
- Improved sparse-checkout performance
- Better handling of large repositories
- Enhanced security features
- Improved merge conflict resolution

**Next-generation version control:**
- **Partial clone improvements**: Better support for massive repositories
- **Git protocol v2**: More efficient data transfer
- **Commit-graph**: Faster history queries
- **Multi-pack-index**: Better packfile management

### Git Best Practices Evolution

**Modern Git workflows:**
- Trunk-based development with feature flags
- Continuous integration with every commit
- Automated code review and testing
- Security scanning in Git hooks

**Emerging patterns:**
- Micro-repositories with submodules
- Monorepo management with Git
- AI-powered commit message generation
- Automated merge conflict resolution

## Conclusion: Mastering Git for Professional Success

Git is more than just a version control system—it's the foundation of modern software development collaboration. The journey from Git novice to expert is ongoing, as new features, workflows, and best practices continue to evolve.

### Key Takeaways

**Foundation Knowledge:**
- Understand the three-state system (working directory, staging area, repository)
- Master basic commands (add, commit, push, pull, merge)
- Learn branching and merging strategies

**Advanced Techniques:**
- Use interactive rebase to maintain clean history
- Implement proper Git workflows for your team
- Leverage hooks and automation for quality control
- Understand Git internals for better troubleshooting

**Professional Practice:**
- Write clear, meaningful commit messages
- Organize repositories with proper structure
- Implement security best practices
- Optimize performance for large repositories

### Continuing Your Git Journey

**Resources for further learning:**
- **Official Git documentation**: git-scm.com
- **Pro Git book**: Available free online
- **Git training platforms**: GitHub Learning Lab, GitLab Learn
- **Community forums**: Stack Overflow, Reddit r/git

**Practice exercises:**
- Contribute to open source projects
- Implement different Git workflows in personal projects
- Practice complex scenarios in test repositories
- Teach Git concepts to others

### The Git Mindset

Successful Git usage requires adopting the right mindset:

- **Version control is not just about backup**—it's about collaboration and history
- **Commits should tell a story**—each commit should represent a logical unit of change
- **Branches are cheap**—don't be afraid to create branches for experiments
- **History matters**—keep it clean and meaningful for future developers

### Final Words

Git mastery comes through consistent practice and understanding the underlying concepts, not just memorizing commands. Every mistake is a learning opportunity, and every complex merge conflict conquered makes you a better developer.

As you continue your Git journey, remember that the goal is not to know every command by heart, but to understand the principles that make Git powerful. With this foundation, you can confidently tackle any version control challenge and collaborate effectively with teams around the world.

The commands in this handbook are your tools, but your understanding of Git's philosophy and best practices is what will make you truly proficient. Keep practicing, keep learning, and most importantly, keep sharing your knowledge with others.

*Happy Git-ing!*

---

**"In Git we trust, in version control we prosper."**

*This handbook represents the collective wisdom of the Git community. Continue learning, practicing, and contributing to make the development world a better place.*