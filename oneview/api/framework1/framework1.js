/*
Author: Madhu Chakravarthy
*/

// Initialize constants

const express = require('express')
const config = require('config')
const logger = require('../log').logger

//const app = express()

var fs =  require('fs')

//Initialize Module Name
var moduleName = 'framework1'
module.exports.moduleName = moduleName

// Initialize report path
var reportPath = config.get(moduleName + '.reports')
logger.info(moduleName + " report path: " + reportPath)
