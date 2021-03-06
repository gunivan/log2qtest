'use strict';
import { Client } from 'node-rest-client';;
import Constants from './constants';
import _ from 'lodash';
import chalk from 'chalk';
import { Attachment } from './attachment';
import { Stopwatch } from './stopWatch';

const client = new Client();
const attachment = new Attachment();

/**
 * Functional connect to qTest
 */
export class Submitter {
  /**
   * Login to qTest to get access token
   */
  login(config) {
    let loginUrl = `${config.host}/oauth/token`;
    let headerAuth = 'Basic ' + Buffer.from(`${config.username}:`).toString('base64');
    let args = {
      parameters: {
        username: config.username,
        password: config.password,
        grant_type: Constants.OAUTH_GRANT_TYPE
      },
      headers: {
        'Authorization': headerAuth,
        'Content-Type': Constants.HEADER.FORM_ENCODED
      }
    };
    console.log(chalk.cyan('Login to qTest at:', loginUrl));
    return new Promise((resolve, reject) => {
      client.post(loginUrl, args, (data, response) => {
        if (data.error) {
          console.error(chalk.red('Error while login to qTest:'), data);
          throw new Error(error);
        }
        resolve(data.access_token);
      });
    });
  }
  /**
   * Get task
   * @param {*} config 
   * @param {*} id 
   */
  getTask(config, id) {
    let url = `${config.host}/api/v3/projects/queue-processing/${id}`;
    let args = {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': Constants.HEADER.JSON
      }
    };
    return new Promise((resolve, reject) => {
      client.get(url, args, (data, response) => {
        if (data.error) {
          console.error(chalk.red('Error while get task:'), data);
          throw new Error(error);
        }
        resolve(data);
      });
    });
  }

  /**
   * 
   * @param {*} submitter 
   * @param {*} config 
   * @param {*} id 
   * @param {*} status 
   */
  waitTaskDone(config, id, status) {
    let state = status;
    let count = 1;
    let stopwatch = new Stopwatch();
    let itvId = setInterval(() => {
      if (count >= Constants.MAX_RETRY_GET_TASK) {
        clearInterval(itvId);
        console.log(chalk.yellow('Stop get task due to reach max retry to get task status'));
      }
      this.getTask(config, id).then(res => {
        state !== res.state && console.log(chalk.cyan('Status: ', res.state));
        if (state !== res.state && Constants.TASK_SUCCESS === res.state) {
          clearInterval(itvId);
          let content = Constants.HEADER.JSON === res.contentType ? JSON.parse(res.content) : {};
          console.log(chalk.blue(`Test suite link: ${config.host}/p/${config.project}/portal/project#tab=testexecution&object=2&id=${content.testSuiteId}`));
          console.log(chalk.cyan(`  Total test cases: ${content.totalTestCases || 0}`));
          console.log(chalk.cyan(`  Total test runs were created: ${content.totalTestRuns || 0}`));
          console.log(chalk.cyan(`  Total test logs were created: ${content.totalTestLogs || 0}`));
          console.log(chalk.blue(`  Done get submit task in ${stopwatch.eslaped()}`));
        }
        state = res.state
        count++;
      }).catch(e => {
        console.error(chalk.red(`Error while get task ${id}`, e));
        clearInterval(itvId);
      });
    }, 1000);
  }

  /**
   * Build submit data from suites then submit to qTest
   * @param {*} data @see parser.parse
   */
  submit(config, suites) {
    let url = `${config.host}/api/v3.1/projects/${config.project}/test-runs/0/auto-test-logs?type=automation`;
    let testLogs = _(suites).map(suite => {
      let logs = this.buildTestLogs(config, suite);
      console.log(chalk.cyan(`Suite summary ${JSON.stringify(suite.summary)}, logs ${logs.length}`));
      return logs;
    }).flatten((a, b) => {
      return a.concat(b);
    }).value();

    console.log(chalk.cyan(`Submit to qTest with testLogs ${testLogs.length}...`));
    let submitData = {
      'test_logs': testLogs
    };
    config.module && (submitData['parent_module'] = config.module);
    config.suite && (submitData['test_suite'] = config.suite);
    config.exeDate && (submitData['execution_date'] = config.exeDate);
    let args = {
      data: submitData,
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': Constants.HEADER.JSON
      }
    };
    if (config.skipSubmit) {
      return new Promise((resolve, reject) => {
        resolve({});
      });
    }
    return new Promise((resolve, reject) => {
      client.post(url, args, (data, response) => {
        if (data.error) {
          console.error(chalk.red('Error while submit logs to qTest:', data));
          throw new Error(error);
        }
        resolve(data);
      });
    });
  }

  submitV3New(config, suites) {
    let url = `${config.host}/api/v3/projects/${config.project}/auto-test-logs?type=automation`;
    let testLogs = _(suites).map(suite => {
      let logs = this.buildTestLogs(config, suite);
      console.log(chalk.cyan(`Suite summary ${JSON.stringify(suite.summary)}, logs ${logs.length}`));
      return logs;
    }).flatten((a, b) => {
      return a.concat(b);
    }).value();

    console.log(chalk.cyan(`Submit to qTest API v3 new with testLogs ${testLogs.length}...`));
    let submitData = {
      'test_logs': testLogs
    };
    config.module && (submitData['parent_module'] = config.module);
    config.suite && (submitData['test_suite'] = config.suite);
    config.exeDate && (submitData['execution_date'] = config.exeDate);
    config.cycle && (submitData['test_cycle'] = config.cycle);
    let args = {
      data: submitData,
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': Constants.HEADER.JSON
      }
    };
    if (config.skipSubmit) {
      return new Promise((resolve, reject) => {
        resolve({});
      });
    }
    return new Promise((resolve, reject) => {
      client.post(url, args, (data, response) => {
        if (data.error) {
          console.error(chalk.red('Error while submit logs to qTest:', data));
          throw new Error(error);
        }
        resolve(data);
      });
    });
  }
  /**
   * Build testLogs from suite
   * @param {*} config 
   * @param {*} suite 
   */
  buildTestLogs(config, suite) {
    let _this = this;
    //each method as a testCase
    if (config.methodAsTestCase) {
      return _(suite.tests)
        .map((test) => {
          return _(_this.buildTestLog(config, [test], test.name))
            .tap(testLog => { testLog['status'] = config.status[test.status] })
            .value();
        }).value();
    } else {
      //each method as a teststep
      return _(suite.tests)
        .groupBy('classname')
        .map((tests, classname) => {
          let fail = false;
          _.each(tests, (test) => {
            if ('fail' === test.status) {
              fail = true;
            };
          });
          return _(_this.buildTestLog(config, tests, classname))
            .tap(testLog => {
              testLog['status'] = config.status[fail ? Constants.STATUS.FAIL : Constants.STATUS.PASS];
            }).value();
        }).value();
    }
  }
  /**
   * Build testLog
   * @param {*} config 
   * @param {*} tests 
   * @param {*} classname 
   */
  buildTestLog(config, tests, classname) {
    let modules = (config.modules && config.modules.length) ? config.modules : classname.split(".");
    let testLog = {
      'name': classname,
      'automation_content': classname,
      'exe_start_date': config.startDate,
      'exe_end_date': config.endDate,
      "module_names": modules
    };
    let failures = _(tests)
      .filter(test => test.status === Constants.STATUS.FAIL)
      .value();

    let attachments = [];
    if (failures.length < 5) {
      attachments = _(failures)
        .map(test => {
          return _({
            'name': `${test.name}.txt`,
            'content_type': Constants.HEADER.TEXT,
            'data': attachment.buildText(test.failure.message)
          }).value();
        }).value();
    } else {
      let zipName = `${failures[0].classname}.zip`;
      failures = _(failures).map(test => {
        return _({
          'name': test.name,
          'message': test.failure.message
        }).value();
      }).value();
      attachments = _([{
        'name': zipName,
        'content_type': Constants.HEADER.ZIP,
        'data': attachment.buildZip(failures)
      }]).value();
    }
    (attachments.length > 0 && (testLog['attachments'] = attachments));

    testLog['test_step_logs'] = _(tests)
      .map(test => {
        return _({
          'description': test.name,
          'expected_result': test.name,
          'actual_result': test.name,
          'status': config.status[test.status]
        }).value();
      }).value();
    return _(testLog).value();
  }
}
