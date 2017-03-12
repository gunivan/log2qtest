import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ProgressBar from 'progress';
import { Parser } from './junit';
import { Submitter } from './qtest';

/**
 * Main function for application
 */
export class App {
  loadConfig(program) {
    let config = {};
    try {
      config = require(path.resolve('config.json'));
      console.log('Found config.json at current directory.');
    } catch (e) {
      console.log('Not found config.json at current directory, use default console params.');
      config = {};
    }
    config = Object.assign(config, {
      host: program.host || config.host,
      username: program.username || config.username,
      password: program.password || config.password,
      token: program.token || config.token,
      project: program.project || config.project,
      suite: program.suite || config.suite,
      module: program.module || config.module,
      dir: program.parse || config.dir,
      methodAsTestCase: program.methodAsTestCase || config.methodAsTestCase,
      exeDate: program.exeDate || config.exe_date,
      startDate: new Date().toISOString()
    });
    delete config.exe_date;
    return config;
  }
  parseThenSubmit(config, parser) {
    let bar = new ProgressBar('Parse and submit to qTest [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: 2
    });
    parser.parse(config).then(data => {
      //set end time
      config.endDate = new Date(new Date(config.startDate).getTime() + (data.suite.time * 1000)).toISOString();
      bar.tick();
      console.log(chalk.blue('  Parse done'));

      let submitter = new Submitter();

      submitter.login(config).then(token => {
        config.token = token;
        console.log('Token:', token);
        submitter.submit(config, data).then(res => {
          console.log(chalk.blue('Submit success', res));
          bar.tick();
          submitter.waitTaskDone(config, res.id, res.status);
        }).catch(e => {
          console.error(chalk.red('Error while submit', e));
          bar.tick();
        });
      });
    }).catch(e => {
      bar.tick();
      console.error(chalk.red('Error:', e));
    });
  }
}