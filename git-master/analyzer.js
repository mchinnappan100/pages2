const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');

class GitAnalyzer {
  constructor(repoPath) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  async analyze() {
    const [
      branches,
      tags,
      remotes,
      status,
      log,
      contributors,
      repoSize,
      garbageInfo
    ] = await Promise.all([
      this.getBranches(),
      this.getTags(),
      this.getRemotes(),
      this.getStatus(),
      this.getLog(),
      this.getContributors(),
      this.getRepoSize(),
      this.analyzeGarbage()
    ]);

    const stats = this.calculateStats(log);
    const health = this.assessRepoHealth(log, garbageInfo);

    return {
      branches,
      tags,
      remotes,
      status,
      commitCount: log.total,
      recentCommits: log.all.slice(0, 50),
      contributors,
      stats,
      repoSize,
      garbageInfo,
      health,
      path: this.repoPath
    };
  }

  async getBranches() {
    const summary = await this.git.branch(['-a', '-v', '--sort=-committerdate']);
    const current = summary.current;
    
    return {
      current,
      all: Object.entries(summary.branches).map(([name, info]) => ({
        name,
        current: name === current,
        commit: info.commit,
        label: info.label,
        remote: name.startsWith('remotes/')
      }))
    };
  }

  async getTags() {
    const tags = await this.git.tags();
    return tags.all;
  }

  async getRemotes() {
    const remotes = await this.git.getRemotes(true);
    return remotes;
  }

  async getStatus() {
    const status = await this.git.status();
    return {
      modified: status.modified,
      created: status.created,
      deleted: status.deleted,
      renamed: status.renamed,
      staged: status.staged,
      conflicted: status.conflicted,
      ahead: status.ahead,
      behind: status.behind,
      tracking: status.tracking,
      isClean: status.isClean()
    };
  }

  async getLog() {
    const log = await this.git.log({ 
      '--all': null,
      '--max-count': 1000,
      '--no-merges': null 
    });
    return log;
  }

  async getContributors() {
    try {
      const result = await this.git.raw([
        'shortlog',
        '-sn',
        '--all',
        '--no-merges'
      ]);
      
      return result
        .trim()
        .split('\n')
        .map(line => {
          const match = line.trim().match(/^(\d+)\s+(.+)$/);
          if (match) {
            return {
              commits: parseInt(match[1]),
              name: match[2]
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  calculateStats(log) {
    const commits = log.all;
    const now = new Date();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const commitsLastDay = commits.filter(c => new Date(c.date) > dayAgo).length;
    const commitsLastWeek = commits.filter(c => new Date(c.date) > weekAgo).length;
    const commitsLastMonth = commits.filter(c => new Date(c.date) > monthAgo).length;

    // Calculate commits per day of week
    const dayOfWeek = [0, 0, 0, 0, 0, 0, 0];
    const hourOfDay = new Array(24).fill(0);
    
    commits.forEach(commit => {
      const date = new Date(commit.date);
      dayOfWeek[date.getDay()]++;
      hourOfDay[date.getHours()]++;
    });

    return {
      total: log.total,
      commitsLastDay,
      commitsLastWeek,
      commitsLastMonth,
      dayOfWeek,
      hourOfDay,
      avgCommitsPerDay: (commitsLastMonth / 30).toFixed(2)
    };
  }

  async getRepoSize() {
    try {
      const gitDir = path.join(this.repoPath, '.git');
      const size = await this.getDirectorySize(gitDir);
      return {
        bytes: size,
        mb: (size / 1024 / 1024).toFixed(2),
        gb: (size / 1024 / 1024 / 1024).toFixed(3)
      };
    } catch (error) {
      return { bytes: 0, mb: '0', gb: '0' };
    }
  }

  async getDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          totalSize += await this.getDirectorySize(itemPath);
        } else {
          const stats = await fs.stat(itemPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible files
    }
    
    return totalSize;
  }

  async analyzeGarbage() {
    try {
      // Get count-objects info
      const countObjects = await this.git.raw(['count-objects', '-v']);
      const lines = countObjects.split('\n');
      const info = {};
      
      lines.forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          info[key] = value;
        }
      });

      const looseObjects = parseInt(info['count'] || 0);
      const looseSize = parseFloat(info['size'] || 0);
      const packCount = parseInt(info['packs'] || 0);
      const packSize = parseFloat(info['size-pack'] || 0);

      // Recommend GC if there are many loose objects
      const shouldGC = looseObjects > 1000 || looseSize > 10;

      return {
        looseObjects,
        looseSize,
        packCount,
        packSize,
        shouldGC,
        recommendation: shouldGC 
          ? 'Run `git gc` to optimize repository performance'
          : 'Repository is well optimized'
      };
    } catch (error) {
      return {
        looseObjects: 0,
        looseSize: 0,
        packCount: 0,
        packSize: 0,
        shouldGC: false,
        recommendation: 'Unable to analyze'
      };
    }
  }

  assessRepoHealth(log, garbageInfo) {
    const scores = [];
    const issues = [];
    const suggestions = [];

    // Check commit frequency
    const commits = log.all;
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const recentCommits = commits.filter(c => new Date(c.date) > weekAgo).length;
    
    if (recentCommits > 0) {
      scores.push(100);
    } else {
      scores.push(50);
      issues.push('No commits in the last week');
    }

    // Check garbage collection
    if (garbageInfo.shouldGC) {
      scores.push(60);
      issues.push('Repository needs garbage collection');
      suggestions.push('Run: git gc --aggressive');
    } else {
      scores.push(100);
    }

    // Check for large pack files
    if (garbageInfo.packSize > 100) {
      issues.push('Large pack files detected');
      suggestions.push('Consider using git-lfs for large files');
    }

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    let status = 'excellent';
    if (avgScore < 90) status = 'good';
    if (avgScore < 70) status = 'needs attention';
    if (avgScore < 50) status = 'poor';

    return {
      score: Math.round(avgScore),
      status,
      issues,
      suggestions
    };
  }

  async getFileTree() {
    try {
      const result = await this.git.raw(['ls-tree', '-r', '--name-only', 'HEAD']);
      const files = result.trim().split('\n').filter(Boolean);
      
      // Build tree structure
      const tree = {};
      
      files.forEach(filepath => {
        const parts = filepath.split('/');
        let current = tree;
        
        parts.forEach((part, index) => {
          if (index === parts.length - 1) {
            // It's a file
            if (!current._files) current._files = [];
            current._files.push(part);
          } else {
            // It's a directory
            if (!current[part]) current[part] = {};
            current = current[part];
          }
        });
      });
      
      return tree;
    } catch (error) {
      return {};
    }
  }

  async getCommitGraph(limit = 100) {
    try {
      const result = await this.git.raw([
        'log',
        '--all',
        '--graph',
        '--pretty=format:%H|%P|%s|%an|%ar',
        `--max-count=${limit}`
      ]);
      
      const lines = result.split('\n');
      const commits = [];
      
      lines.forEach(line => {
        const graphMatch = line.match(/^([|\\\/ *]+)/);
        const graph = graphMatch ? graphMatch[1] : '';
        const data = line.substring(graph.length);
        
        if (data) {
          const [hash, parents, subject, author, date] = data.split('|');
          commits.push({
            graph,
            hash: hash.trim(),
            parents: parents ? parents.trim().split(' ') : [],
            subject: subject.trim(),
            author: author.trim(),
            date: date.trim()
          });
        }
      });
      
      return commits;
    } catch (error) {
      return [];
    }
  }
}

async function analyzeRepo(repoPath) {
  const analyzer = new GitAnalyzer(repoPath);
  return await analyzer.analyze();
}

module.exports = { GitAnalyzer, analyzeRepo };
