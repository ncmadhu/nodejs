/*
Author: Madhu Chakravarthy
*/

// Initialize variables

var moduleName = 'framework2'
var express = require('express')
var router = express.Router()
var config = require('config')
var logger = require('../log').logger
var fse =  require('fs-extra')
var path = require('path')
var xml2js = require('xml2js')
var jsonfile = require('jsonfile')

//Initialize xmlparser with attributes

var parser = new xml2js.Parser({"attrkey": "attributes", "trim": true, "charkey": "value"});
var parseString = parser.parseString;

//Initialize path variables

var suitePath = path.join(process.cwd(), 'views','data', moduleName)

fse.ensureDir(suitePath, function(err) {
    if (err) {
        logger.error(err)
    } else {
        logger.info(suitePath + " is created")
    }
})

// Functions

var reportParser = function(req, res) {

    var filePath = path.join(process.cwd(), 'reports', 'framework2', 'output.xml') 
    logger.debug("filePath:" + filePath)
    fse.readFile(filePath, 'utf8', function(err, contents) {
        parseString(contents, function(err, result) {
            suiteJsonFileBuilder(result.robot.suite[0])
            response = JSON.stringify(result)
            //console.log(JSON.stringify(result))
            res.end(response)
        })
    })

}

function suiteJsonFileBuilder(suite) {
    
    logger.info("Building test suite json") 
    var suiteName = suite.attributes.name
    var data = {"name": suiteName, "status": suite.status[0].attributes.status}
    var suiteFile = path.join(suitePath, suiteName + '.json')
    logger.debug("SuiteFile: " + suiteFile)
    jsonfile.writeFile(suiteFile, data, {spaces: 2}, function(err) {
        if (err) {
            logger.error(err)
        }
    })
    
}

//All request logger

var requestLogger = function (req, res, next) {
    logger.info('request url received - ', req.url)
    next()
}

router.use(requestLogger)

//Response for test request
router.get('/test', function (req, res) {
    res.send(moduleName + " Test working")
})

//Response for report request
router.get('/reports', function (req, res) {
    reportParser(req, res)
})

module.exports = router
module.exports.moduleName = moduleName
