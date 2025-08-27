# Setup
git config --global user.name "Name"
git config --global user.email "email@example.com"

# Create & Clone
git init
git clone <url>

# Status & Add
git status
git add <file>
git add .

# Commit
git commit -m "Message"
git commit --amend

# Branching
git branch
git checkout -b new-branch
git switch main
git merge feature

# Remote
git remote -v
git fetch origin
git pull origin main
git push origin feature

# Undo
git restore <file>
git reset --hard HEAD~1
git revert <commit>

# History
git log --oneline --graph
git diff
git show <commit>

# Advanced
git stash
git cherry-pick <commit>
git rebase -i HEAD~3
git worktree add ../dir branch
