'use strict';
import { Client } from 'node-rest-client';;
import Constants from './constants';
import _ from 'lodash';
import chalk from 'chalk';

const client = new Client();

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
    let itvId = setInterval(() => {
      this.getTask(config, id).then(res => {
        state !== res.state && console.log(chalk.cyan('Status: ', res.state));
        state = res.state
        if (Constants.TASK_SUCCESS === state) {
          clearInterval(itvId);
        }
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
    console.log('Submit', suites.suite.summary);
    let url = `${config.host}/api/v3.1/projects/${config.project}/test-runs/0/auto-test-logs?type=automation`;
    let testLogs = this.buildTestLogs(config, suites.suite);
    console.log(chalk.cyan(`Test logs ${testLogs.length}`));
    console.log(chalk.cyan('Submit to qTest...'));
    let submitData = _({
      'test_logs': testLogs
    }).value();
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
    console.log(chalk.cyan(`Method as testcase: ${config.methodAsTestCase}`));
    let _this = this;
    if (config.methodAsTestCase) {
      return _(suite.tests)
        .map((test) => {
          return _(_this.buildTestLog(config, [test], test.classname))
            .tap(testLog => { testLog['status'] = config.status[test.status] })
            .value();
        }).value();
    } else {
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
              testLog['status'] = config.status[fail ? 'fail' : 'pass'];
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
    let testLog = {
      'name': classname,
      'automation_content': classname,
      'exe_start_date': config.startDate,
      'exe_end_date': config.endDate
    };
    // testLog['attachments'] = _(tests)
    //   .map(test => {
    //     _({
    //       'name': '',
    //       'content_type': 'text/plain',
    //       'data':''
    //     }).value()
    //   });
    testLog['test_step_logs'] = _(tests)
      .map(test => {
        return _({
          'description': test.name,
          'expected_result': test.name,
          'actual_result': test.name,
          'status': test.status
        }).value();
      }).value();
    return _(testLog).value();
  }

}
