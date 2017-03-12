'use strict';
import { parse } from './parser';
import fs from 'fs';
// import async from 'async';
import _ from 'lodash';
import q from 'q';

export function fromFiles(listOfFiles) {
  let deferred = q.defer();

  let listOfReads = _(listOfFiles).map(function (file) {
    return function (callback) { fs.readFile(file, callback); };
  }).value();

  // async.parallel(listOfReads, function (error, contents) {
  //   if (error) {
  //     deferred.reject(new Error(error));
  //   } else {
  //     deferred.resolve(exports.strings(_(contents).invoke('toString').value()));
  //   }
  // });

  return deferred.promise;
}

export function fromStrings(listOfStrings) {
  return _(listOfStrings).map(parse).value();
}