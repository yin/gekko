/*

  Gekko is a Bitcoin trading bot for Mt. Gox written 
  in node, it features multiple trading methods using 
  technical analysis.

  Disclaimer:

  USE AT YOUR OWN RISK!

  The author of this project is NOT responsible for any damage or loss caused 
  by this software. There can be bugs and the bot may not perform as expected 
  or specified. Please consider testing it first with paper trading / 
  backtesting on historical data. Also look at the code to see what how 
  it's working.

*/

// helpers
var moment = require('moment');
var _ = require('lodash');
var util = require('./util');
var log = require('./log');
var async = require('async');
var Manager = require('./portfolioManager');
var exchangeChecker = require('./exchangeChecker');

var config = util.getConfig();

// var Consultant = require('./methods/' + config.tradingMethod.toLowerCase().split(' ').join('-'));

log.info('I\'m gonna make you rich, Bud Fox.');
log.info('Let me show you some ' + config.tradingMethod + '.\n\n');

//
// Normalize the configuration between normal & advanced.
// 
if(config.normal && config.normal.enabled) {
  // if the normal settings are enabled we overwrite the
  // watcher and traders set in the advanced zone
  log.info('Using normal settings to monitor the live market');
  config.watch = config.normal;
  config.traders = [];

  if(config.normal.tradingEnabled)
    config.traders.push( config.normal );
  else
    log.info('NOT trading with real money');
} else {
  log.info('Using advanced settings');
}

// make sure the monitoring exchange is configured correctly for monitoring
var invalid = exchangeChecker.cantMonitor(config.watch);
if(invalid)
  throw invalid;

// write config
util.setConfig(config);

// var TradeFetcher = require('./tradeFetcher.js');
// var tradeFetcher = new TradeFetcher();
var CM = require('./candleManager');
var a = new CM;
return;

// implement a trading method to create a consultant, we pass it a config and a 
// public mtgox object which the method can use to get data on past trades
var consultant = new Consultant(watcher);

// log advice
var Logger = require('./logger');
var logger = new Logger(_.extend(config.profitCalculator, config.watch));
consultant.on('advice', logger.inform);
if(config.profitCalculator.enabled)
  consultant.on('advice', logger.trackProfits);

//
// Configure automatic traders based on advice,
// after they are all prepared we continue.
// 
var managers = _.filter(config.traders, function(t) { return t.enabled });
var configureManagers = function(_next) {
  var amount = _.size(managers);
  if(!amount)
    return _next();

  var next = _.after(amount, _next);
  _.each(managers, function(conf) {
    conf.exchange = conf.exchange.toLowerCase();

    // make sure we the exchange is configured correctly
    // for trading.
    var invalid = exchangeChecker.cantTrade(conf);
    if(invalid)
      throw invalid;

    conf.
    log.info(
      'Trading for real money based on market advice at',
      conf.exchange
    );

    var manager = new Manager(conf);

    consultant.on('advice', manager.trade);
    manager.on('ready', next);
  });
}


//
// Configure automatic email on advice.
//
var configureMail = function(next) {
  if(config.mail.enabled && config.mail.email) {
    var mailer = require('./mailer');
    mailer.init(function() {
      consultant.on('advice', mailer.send);
      next();
    });
  } else
    next();
}

var start = function() {
  consultant.emit('prepare');
}

async.series([configureMail, configureManagers], start);
