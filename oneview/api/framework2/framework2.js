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

var suitePath = path.join(process.cwd(), 'views','data', moduleName, 'suite')
var testPath = path.join(process.cwd(), 'views','data', moduleName, 'test')
var keywordsPath = path.join(process.cwd(), 'views','data', moduleName, 'keyword')

// Functions

function createDataDir(dirList) {

    for (var i = 0; i < dirList.length; i++) {
        var path = dirList[i]
        fse.ensureDir(path, function(err) {
            if (err) {
                logger.error(err)
            }
        })
    }
}

// create data directories if not present
createDataDir([suitePath, testPath, keywordsPath])


function writeToJsonFile(fileName, fileContent) {

    logger.debug("Writing to Json file: " + fileName)
    jsonfile.writeFile(fileName, fileContent, {spaces: 2}, function(err) {
        if (err) {
            logger.error(err)
        }
    })

}

function nameCreator(nameList) {

    var name = ''
    for (var i = 0; i < nameList.length; i++) {
        names = nameList[i].split(' ')
        for (var j = 0; j < names.length; j++) {
            name = name + names[j].substr(0,3)
        }
    }
    return name
}

var reportParser = function(req, res) {

    var filePath = path.join(process.cwd(), 'reports', 'framework2', 'output.xml') 
    logger.debug("filePath:" + filePath)
    fse.readFile(filePath, 'utf8', function(err, contents) {
        parseString(contents, function(err, result) {
            writeSuiteJsonFile(result.robot.suite[0])
            response = JSON.stringify(result)
            //console.log(JSON.stringify(result))
            res.end(response)
        })
    })

}

function writeSuiteJsonFile(suite) {
    
    logger.info("Building test suite json") 
    var suiteName = suite.attributes.name
    var data = {"type": "suite", "name": suiteName, "status": suite.status[0].attributes.status}
    var suiteFile = path.join(suitePath, suiteName + '.json')
    if ('kw' in suite) {
        buildSuiteKeywordsJson(suite.kw, data)
    }
    writeToJsonFile(suiteFile, data)
    
}

function buildSuiteKeywordsJson(keywords, data) {
   
    logger.info("Building suite Json")
    data.keywords = []
    for (var kw = 0; kw < keywords.length; kw++) {
        var attributes = keywords[kw].attributes
        var status = keywords[kw].status[0]
        if ('type' in attributes) {
            if (attributes.type == 'setup') {
               data['suite setup'] = {'name': attributes.name,
                                      'status': status.attributes.status,
                                      'starttime': status.attributes.starttime,
                                      'endtime': status.attributes.endtime
                                     } 
            } else if (attributes.type == 'teardown') {
               data['suite teardown'] = {'name': attributes.name,
                                         'status': status.attributes.status,
                                         'starttime': status.attributes.starttime,
                                         'endtime': status.attributes.endtime
                                        } 
            }
            data.keywords[kw] = attributes.name
            if ('kw' in keywords[kw]) {
                for (var childKw = 0; childKw < keywords[kw]['kw'].length; childKw++) {
                    var parentNames = nameCreator([data.name, attributes.name])
                    buildKeywordsJson(keywords[kw]['kw'][childKw], attributes.name, parentNames)
                }
            } 
        }
    }
    
}

function buildKeywordsJson(keyword, parent, filePrefix) {

    logger.info("Building Keyword")
    
    var keywordObj = {}
    keywordObj.name = keyword.attributes.name
    keywordObj.executedBy = parent
    keywordObj.library = keyword.attributes.library
    keywordObj.description = keyword.doc[0]
    keywordObj.arguments = keyword.arguments[0].arg
    keywordObj.msg = keyword.msg[0].value
    keywordObj.status = keyword.status[0].attributes.status
    keywordObj.starttime = keyword.status[0].attributes.starttime
    keywordObj.endtime = keyword.status[0].attributes.endtime 
    var keywordFile = path.join(keywordsPath, filePrefix + '_' + keywordObj.name.replace(' ', '_')  + '.json')
    writeToJsonFile(keywordFile, keywordObj)
     
    
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
