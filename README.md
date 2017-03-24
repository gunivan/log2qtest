# log2qtest

This is CLI app that allow parse JUnit xml file then submit to qTest via rest API

# Config file: config.json
```
{
  "host": "<qTest url>",
  "username": "<qTest username>",
  "password": "<qTest password>",
  "project": <qTest project>,
  "suite": <qTest test suite>,
  "module": <qTest parent module>,
  "cycle":"<qTest parent test cycle>",
  "dir": "<folder that contains junit xml file>",
  "pattern":"<File pattern to filter JUnit xml pattern>",
  "methodAsTestCase": <true|false>, //if true then each junit method as a qTest testcase, default is false
  "status": {/*mapping pass and fail status*/
    "pass": "PASSED",
    "fail": "FAILED"
  },
  "exeDate": null //must be formatted as yyyy-MM-dd,
  "modules":[] //module names
}
```
# Usages
- -C: to generate config file, then you should see and update config.json at current working directory
- -c: to parse from xml file
- -s: to submit logs to qTest

- -d "\<dir\>": to parse xml files in dir
- -r: to filter file by pattern: *.xml or TEST-*.xml 
- -M: each method as test case
- -n: submit with new API 

# Examples
- Parse junit xml file in config file:');
-     log2qtest -c
- Parse and submit logs to qTest with API v3.1:');
-     log2qtest -c -s
- Parse and submit logs to qTest with API new:');
-     log2qtest -c -s -n