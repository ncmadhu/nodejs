/*
Author: Madhu Chakravarthy
*/

// Initialize variables

var moduleName = 'framework1'
var express = require('express')
var router = express.Router()
var config = require('config')
var logger = require('../log').logger
var fs =  require('fs')

var reportParser = function(req, res) {
    var filePath = process.cwd() + '/reports/framework1/testreport.txt' 
    logger.debug("filePath:" + filePath)
    fs.readFile(filePath, 'utf8', function(err, contents) {
        res.end(contents)
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
