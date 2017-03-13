# log2qtest

This is CLI app that allow parse JUnit xml file then submit to qTest via rest API

# Config file: config.json
{
  "host": "<qTest url>",
  "username": "<qTest username>",
  "password": "<qTest password>",
  "project": <qTest project>,
  "suite": <qTest test suite>,
  "module": <qTest parent module>,
  "file": "<junit xml file>",
  "methodAsTestCase": <true|false>, //if true then each junit method as a qTest testcase, default is false
  "status": {/*mapping pass and fail status*/
    "pass": "PASSED",
    "fail": "FAILED"
  },
  "exe_date": null //must be formatted as yyyy-MM-dd
}

# Usages
-C: to generate config file, then you should see and update config.json at current working directory
-c: to parse from xml file
-c '<xml file>': to parse specific xml file
-s: to submit logs to qTest
-M: each method as test case