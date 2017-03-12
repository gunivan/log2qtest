'use strict';
import xml2js from 'xml2js';
import fs from 'fs';
import Constants from '../constants';
import { from } from './converter';

/**
 * Parser junit xml to objects
 */
export class Parser {
  /**
   * parse from junit xml string to model
   * @param {*} xml 
   */
  parseFromXml(xml) {
    return new Promise((resolve, reject) => {
      console.log('Parse xml string to objects');
      xml2js.parseString(xml, (error, raw) => {
        if (error) {
          throw new Error(error);
        }
        resolve(from(raw));
      });
    });
  }

  /**
   * parse with save file
   * @param {*} file 
   */
  parseFromFile(file) {
    let xml = fs.readFileSync(file).toString();
    console.log(`Read text from file [${file}], has text: ${xml != null}`);
    return this.parseFromXml(xml)
      .then(res => {
        if (!fs.existsSync(Constants.TMP_DIR)) {
          fs.mkdirSync(Constants.TMP_DIR);
        }
        console.log(`Save objects to file [${Constants.OUT_FILE}]`);
        fs.writeFile(Constants.OUT_FILE, JSON.stringify(res), (status) => {
          console.log(`Done save to file [${Constants.OUT_FILE}]`);
        });
        return res;
      })
      .catch(e => {
        throw e;
      });
  }

  /**
   * Return object structure
   {
    suite: {
      name: '',
      time: '',
      summary: {
        tests: ''
        failures: ,
        skipped: ,
        errors: {}
      },
      tests: [{
        name: '',
        time: '',
        failure: {
          type: '',
          message: '',
          raw: '',
          error: '',
          out: ''}
      }],
      extras: {
        output: '',
        errors: ''
      }
    }
  }
   * @param {*} config
   */
  parse(config) {
    let file = config.dir;
    let force = config.force || true;
    //!fs.existsSync(Constants.OUT_FILE)
    if (force) {
      console.log(`Parse from ${file} then persists.`);
      return this.parseFromFile(file)
    } else {
      console.log(`Load from saved file.`);
      return new Promise((resolve, reject) => {
        resolve(require(Constants.OUT_FILE));
      });
    }
  }
}
