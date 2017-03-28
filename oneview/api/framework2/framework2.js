/*
Author: Madhu Chakravarthy
*/

// Initialize variables

var moduleName = 'framework2'
var express = require('express')
var router = express.Router()
var config = require('config')
var logger = require('../log').logger
var fs =  require('fs')
var parseString = require('xml2js').parseString;

var reportParser = function(req, res) {
    //var filePath = process.cwd() + '/reports/framework2/report.xml' 
    var filePath = process.cwd() + '/reports/framework2/output.xml' 
    logger.debug("filePath:" + filePath)
    fs.readFile(filePath, 'utf8', function(err, contents) {
        parseString(contents, function(err, result) {
            response = JSON.stringify(result)
            console.log(JSON.stringify(result))
            res.end(response)
        })
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
