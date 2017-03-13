#!/usr/bin/env node --harmony

import program from 'commander';
import ProgressBar from 'progress';
import fs from 'fs';
import pkg from '../package.json';
import { Parser } from './junit';
import { App } from './app';

program.version(pkg.version)
  .description(pkg.description)
  .option('-C, --config', 'Generate sample config file.')
  .option('-c, --convert', 'Parse Junit xml files')
  .option('-s, --submit', 'Submit logs to qTest')
  .option('-f, --file <file>', 'JUnit xml file')
  .option('-H, --host <host>', 'qTest site url')
  .option('-u, --username <username>', 'qTest username')
  .option('-w, --password <password>', 'qTest user pasword')
  .option('-p, --project <project>', 'qTest project id', parseInt)
  .option('-s, --suite <suite>', 'qTest testsuite that test runs will be located', parseInt)
  .option('-m, --module <module>', 'qTest parent module that Automation module will be located ', parseInt)
  .option('-t, --exeDate <exedate>', 'Execution date in format as yyyy-MM-dd')
  .option('-M, --methodAsTestCase', 'Junit method as qTest testcase')
  .on('--help', () => {
    console.log('Examples:');
    console.log('  -Parse junit xml file in config file:');
    console.log('     log2qtest -c');
    console.log('  -Parse and submit logs to qTest:');
    console.log('     log2qtest -c <xml file> -s');
  })
  .parse(process.argv);

let app = new App();
if (program.config) {
  app.createConfig();
} else {
  let config = app.loadConfig(program);
  let parser = new Parser();

  if (program.submit) {
    app.parseThenSubmit(config, parser);
  } else if (program.convert) {
    parser.parse(config)
  } else {
    program.help();
  }
}