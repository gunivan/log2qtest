#!/usr/bin/env node --harmony

import program from 'commander';
import ProgressBar from 'progress';
import fs from 'fs';
import pkg from '../package.json';
import { Parser } from './junit';
import { App } from './app';

program.version(pkg.version)
  .description(pkg.description)
  .option('-p, --parse <dir>', 'Parse Junit xml files')
  .option('-s, --submit', 'Submit logs to qTest')
  .option('-H, --host <host>', 'qTest site url')
  .option('-u, --username <username>', 'qTest username')
  .option('-w, --password <password>', 'qTest user pasword')
  .option('-p, --project <project>', 'qTest project id', parseInt)
  .option('-s, --suite <suite>', 'qTest testsuite that test runs will be located', parseInt)
  .option('-m, --module <module>', 'qTest parent module that Automation module will be located ', parseInt)
  .option('-t, --exeDate <exedate>', 'Execution date in format as yyyy-MM-dd')
  .option('-M, --methodAsTestCase <true|false>', 'Junit method as qTest testcase')
  .on('--help', () => {
    console.log('Examples:');
    console.log('  -Parse junit xml file:');
    console.log('     log2qtest -p <xml file>');
    console.log('  -Submit parsed logs to qTest:');
    console.log('     log2qtest -p <xml file> -s');
  })
  .parse(process.argv);

// if (!program.args.length) {
// program.help();
// }

let app = new App();
let config = app.loadConfig(program);
let parser = new Parser();

if (program.submit) {
  app.parseThenSubmit(config, parser);
} else if (fs.existsSync(program.parse)) {
  parser.parse(config)
}