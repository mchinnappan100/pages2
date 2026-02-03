const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const open = require('open');
const chalk = require('chalk');
const { GitAnalyzer } = require('./analyzer');

async function startServer(repoPath, port, openBrowser = true) {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });
  
  const analyzer = new GitAnalyzer(repoPath);

  // Serve static files
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());

  // API endpoints
  app.get('/api/analyze', async (req, res) => {
    try {
      const analysis = await analyzer.analyze();
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/tree', async (req, res) => {
    try {
      const tree = await analyzer.getFileTree();
      res.json(tree);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/graph', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const graph = await analyzer.getCommitGraph(limit);
      res.json(graph);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/file/:ref/*', async (req, res) => {
    try {
      const ref = req.params.ref;
      const filepath = req.params[0];
      const content = await analyzer.git.show([`${ref}:${filepath}`]);
      res.json({ content });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/gc', async (req, res) => {
    try {
      await analyzer.git.raw(['gc', '--aggressive']);
      res.json({ success: true, message: 'Garbage collection completed' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // WebSocket for real-time updates
  wss.on('connection', (ws) => {
    console.log(chalk.green('🔌 Client connected'));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'refresh') {
          const analysis = await analyzer.analyze();
          ws.send(JSON.stringify({ type: 'update', data: analysis }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', error: error.message }));
      }
    });

    ws.on('close', () => {
      console.log(chalk.yellow('🔌 Client disconnected'));
    });
  });

  // Start server
  server.listen(port, async () => {
    const url = `http://localhost:${port}`;
    
    console.log(chalk.green('✓ Server started'));
    console.log(chalk.cyan(`\n  🌐 ${url}\n`));
    
    if (openBrowser) {
      console.log(chalk.dim('Opening browser...'));
      await open(url);
    }
  });

  return server;
}

module.exports = { startServer };
