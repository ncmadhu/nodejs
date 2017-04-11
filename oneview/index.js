/*
Author: Madhu Chakravarthy
*/

// Initialize constants

var express = require('express')
var config = require('config')
var logger = require('./api/common/log').logger

var app = express()
const port = config.get('server.port')

// Import all framework modules

var frameworkArray = config.get('frameworks')
var frameworkModules = {}
for(var i = 0; length = frameworkArray.length, i < length; i++) {
    var name = frameworkArray[i]
    var module = config.get(name + '.module') 
    var path = './api/' + name + '/' + module + '.js'
    frameworkModules[name] = require(path)
    app.use('/' + name, frameworkModules[name])
    logger.debug("Imported Module: " + frameworkModules[name].moduleName)
}

//Initialize request logger

var requestLogger = function (req, res, next) {
    logger.info('request url received - ', req.url)
    next()
}

app.use(requestLogger)

//Initialize error handler

var errHandler = function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Whoops not a good sign. Something broke')
}

app.use(errHandler)

/*
Routes
*/

//Response for get request
app.get('/', function (req, res) {
    res.send('Request Received')
})

//unsupported URL

app.use(function (req, res, next) {
    res.status(404).send('Page not found')
})
	
//Start the server

app.listen(port, function () {
    console.log('Listening on port: ' + port)
})

