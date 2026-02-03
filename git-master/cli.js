#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const chalk = require('chalk');
const boxen = require('boxen');
const { startServer } = require('./server');
const { analyzeRepo } = require('./analyzer');

program
  .name('gitmaster')
  .description('The ultimate Git UI - Better than SourceTree, approved by Linus')
  .version('1.0.0');

program
  .option('-g, --git-folder <path>', 'Path to git repository', process.cwd())
  .option('-p, --port <number>', 'Port for web server', '3000')
  .option('--no-browser', 'Don\'t open browser automatically')
  .action(async (options) => {
    const gitPath = path.resolve(options.gitFolder);
    
    console.log(boxen(
      chalk.bold.cyan('🚀 GitMaster') + '\n\n' +
      chalk.green('The Ultimate Git Repository Analyzer') + '\n' +
      chalk.dim('Even Linus would approve!'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    ));

    console.log(chalk.yellow('📁 Repository:'), chalk.white(gitPath));
    console.log(chalk.yellow('🌐 Port:'), chalk.white(options.port));
    console.log();

    try {
      // Quick analysis
      const analysis = await analyzeRepo(gitPath);
      
      console.log(chalk.green('✓ Repository validated'));
      console.log(chalk.dim(`  Branches: ${analysis.branches.length}`));
      console.log(chalk.dim(`  Commits: ${analysis.commitCount}`));
      console.log(chalk.dim(`  Contributors: ${analysis.contributors.length}`));
      console.log();

      // Start server
      await startServer(gitPath, options.port, options.browser);
      
    } catch (error) {
      console.error(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
