#!/usr/bin/env node --harmony

import program from 'commander';
import ProgressBar from 'progress';
import fs from 'fs';
import chalk from 'chalk';
import pkg from '../package.json';
import { App } from './app';

program.version(pkg.version)
  .description(pkg.description)
  .option('-C, --config', 'Generate sample config file.')
  .option('-c, --convert', 'Parse Junit xml files')
  .option('-s, --submit', 'Submit logs to qTest')
  .option('-n, --apinew', 'Submit logs to qTest with API new')
  .option('-d, --dir <dir>', 'Directory that contains JUnit xml file')
  .option('-p, --pattern <pattern>', 'File pattern to filter JUnit xml')
  .option('-H, --host <host>', 'qTest site url')
  .option('-u, --username <username>', 'qTest username')
  .option('-w, --password <password>', 'qTest user pasword')
  .option('-P, --project <project>', 'qTest project id', parseInt)
  .option('-s, --suite <suite>', 'qTest testsuite that test runs will be located', parseInt)
  .option('-m, --module <module>', 'qTest parent module that Automation module will be located ', parseInt)
  .option('-t, --exeDate <exedate>', 'Execution date in format as yyyy-MM-dd')
  .option('-M, --methodAsTestCase', 'Junit method as qTest testcase')
  .on('--help', () => {
    console.log('Examples:');
    console.log('  -Parse junit xml file in config file:');
    console.log('     log2qtest -c');
    console.log('  -Parse and submit logs to qTest with API v3.1:');
    console.log('     log2qtest -c -s');
    console.log('  -Parse and submit logs to qTest with API new:');
    console.log('     log2qtest -c -s -n');
  })
  .parse(process.argv);

let app = new App();
if (program.config) {
  app.createConfig();
} else {
  let config = app.loadConfig(program);

  if (program.submit) {
    app.printConfig(config);
    try {
      app.parseThenSubmit(config, program.apinew);
    } catch (e) {
      console.error(chalk.red('Error while submit', e));
    }
  } else if (program.convert) {
    app.parse(config);
  } else {
    program.help();
  }
}