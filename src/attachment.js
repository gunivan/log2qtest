'use stricts';
import fs from "fs";
import zip from "node-native-zip";
import _ from 'lodash';

export class Attachment {
  /**
   * Convert string to base64
   * @param {*} data 
   */
  buildText(data) {
    return new Buffer(data, 'utf8').toString('base64');
  }
  /**
   * Convert list string to zip stream
   * @param {*} failures an array with fields: name, and message
   */
  buildZip(failures) {
    let archive = new zip();
    _.each(failures, (item) => {
      archive.add(`${item.name}.txt`, new Buffer(item.message, "utf8"));
    });
    return archive.toBuffer().toString('base64');
  }
}