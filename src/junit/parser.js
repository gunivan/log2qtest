'use strict';
import xml2js from 'xml2js';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import _ from 'lodash';
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
  parseFromFiles(files) {
    let funcParseFiles = _(files).map(file => {
      let xml = fs.readFileSync(file).toString();
      console.log(`Read text from file [${file}], has text: ${xml != null}...`);
      return this.parseFromXml(xml);
    }).value();
    return Promise.all(funcParseFiles).then(results => {
      console.log(`Save objects to file [${Constants.OUT_FILE}]...`);
      if (!fs.existsSync(Constants.TMP_DIR)) {
        fs.mkdirSync(Constants.TMP_DIR);
      }
      fs.writeFileSync(Constants.OUT_FILE, JSON.stringify(results));
      return results;
    }).catch(e => {
      throw new Error(e);
    });
  }

  listFiles(config) {
    let pattern = `${config.pattern || Constants.PATTERN_JUNIT}`;
    let options = {
      'root': path.resolve('./')
    };
    if (fs.existsSync(config.dir)) {
      options.root = path.resolve(config.dir);
    }
    console.log(`List JUnit file with pattern: ${pattern} under folder: ${options.root}`);

    return new Promise((resolve, reject) => {
      glob(pattern, options, (error, files) => {
        if (error) {
          throw new Error(`Error while list file with pattern ${pattern}, error ${error}`);
        }
        resolve(files);
      });
    });
  }
  /**
   * Return object structure
   {
      name : '',
      time : '',
      summary : {
        tests : ''
        failures : ,
        skipped : ,
        errors : {}
      },
      tests : [{
          name : '',
          time : '',
          failure : {
            type : '',
            message : '',
            raw : '',
            error : '',
            out : ''
          }
        }
      ],
      extras : {
        output : '',
        errors : ''
      }
    }
   * @param {*} config
   */
  parse(config) {
    let force = config.force || true;
    if (force) {
      return this.listFiles(config).then(files => {
        return this.parseFromFiles(files);
      });
    } else {
      console.log(`Load from saved file.`);
      return new Promise((resolve, reject) => {
        resolve(require(Constants.OUT_FILE));
      });
    }
  }
}
