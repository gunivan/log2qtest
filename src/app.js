import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ProgressBar from 'progress';
import _ from 'lodash';
import { Parser } from './junit';
import { Submitter } from './qtest';
import Constants from './constants';
import { Stopwatch } from './stopWatch';

/**
 * Main function for application
 */
export class App {
  createConfig() {
    try {
      let defaultConfig = require(path.resolve(__dirname, './default.config.json'));
      let sampleConfigFile = path.resolve(process.cwd(), 'config.json');
      fs.writeFileSync(sampleConfigFile, JSON.stringify(defaultConfig, null, 2));
      console.log(chalk.cyan('Created config.json at current directory.'));
    } catch (e) {
      console.log(chalk.yellow('Cannot create file config.json at current directory', e));
    }
  }
  loadConfig(program) {
    let config = {};
    try {
      config = require(path.resolve(process.cwd(), 'config.json'));
      console.log(chalk.cyan('Found config.json at current directory.'));
    } catch (e) {
      console.log(chalk.yellow('Not found config.json at current directory, use default console params.', e));
      config = {};
    }
    config = Object.assign(config, {
      host: program.host || config.host,
      username: program.username || config.username,
      password: program.password || config.password,
      project: program.project || config.project,
      suite: program.suite || config.suite,
      module: program.module || config.module,
      cycle: program.cycle || config.cycle,
      dir: program.dir || config.dir,
      pattern: program.pattern || config.pattern,
      methodAsTestCase: program.methodAsTestCase || config.methodAsTestCase,
      exeDate: program.exeDate || config.exeDate,
      startDate: new Date().toISOString(),
      modules: program.modules || config.modules
    });
    return config;
  }
  printConfig(config) {
    config.host && console.log(chalk.green(`qTest url: ${config.host}`));
    config.project && console.log(chalk.green(`Project: ${config.project}`));
    config.suite && console.log(chalk.green(`Test suite: ${config.suite}`));
    config.module && console.log(chalk.green(`Parent module: ${config.module}`));
    console.log(chalk.green(`Result dir: ${config.dir || './'}`));
    console.log(chalk.green(`Pattern: ${config.pattern || Constants.PATTERN_JUNIT}`));
    console.log(chalk.green(`Method as Test Case: ${config.methodAsTestCase || false}`));
    console.log(chalk.green(`Execution date: ${config.exeDate || ''}`));
  }
  parse(config) {
    let parser = new Parser();
    return parser.parse(config)
  }
  parseThenSubmit(config, submitWithNewApi) {
    let parser = new Parser();
    let bar = new ProgressBar('Parse and submit to qTest [:bar] :percent :etas \n', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: 2
    });
    let stopwatch = new Stopwatch();
    parser.parse(config).then(suites => {
      console.log(chalk.blue(`Done parse JUnit xml file in ${stopwatch.eslaped()}`));
      //set end time
      let totalTime = 0;
      _(suites).map(suite => {
        totalTime += (suite.time * 1000);
      });
      config.endDate = new Date(new Date(config.startDate).getTime() + totalTime).toISOString();
      bar.tick();

      let submitter = new Submitter();

      submitter.login(config).then(token => {
        config.token = token;
        console.log('Token:', token);
        stopwatch.reset();
        let task;
        if (submitWithNewApi) {
          console.log(chalk.blue(`Submitted to API v3 new`));
          task = submitter.submitV3New(config, suites)
        } else {
          console.log(chalk.blue(`Submitted to API v3.1`));
          task = submitter.submit(config, suites);
        }
        task.then(res => {
          bar.tick();
          console.log(chalk.blue(`Done submit in ${stopwatch.eslaped()}`));
          if (res.id) {
            console.log(`Submit success`, res);
            submitter.waitTaskDone(config, res.id, res.status);
          } else {
            console.error(chalk.red('Submit fail:', res.message));
          }
        }).catch(e => {
          console.error(chalk.red('Error while submit:', e));
          bar.tick();
        });
      });
    }).catch(e => {
      bar.tick();
      console.error(chalk.red('Error:', e));
    });
  }
}