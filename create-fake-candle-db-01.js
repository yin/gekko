// var moment = require('moment');
// var async = require('async');
var BUF_SIZE = 1024*1024;
var BSON_FILE = "test-07.bson"
var _ = require('lodash');
var bufallo = require('bufallo');
var fs = require('fs');
 
var candles = [];

var checkpoints = [];
var start;

var time_now = function(note){
    var precision = 3;
    var elapsed;

    if (!start) {
       start = process.hrtime();
       return;
    }
    start = process.hrtime(start);
    checkponts.push(start);
    elapsed = start[0] * 1000 + start[1] / 100000;
    console.log("Elapsed: " + elapsed.toFixed(precision) + " ms - " + note);
}

time_now();
_.each(_.range(1440), function(d) {
	var candle = {
		s: d,
		o: Math.random() * 1000,
		h: Math.random() * 1000,
		l: Math.random() * 1000,
		c: Math.random() * 1000,
		v: Math.random() * 1000,
		p: Math.random() * 1000
	};
 
	candles.push(candle);
});
time_now('creating candles');
var buf = bufallo.serialize(candles);
time_now('serializing BSON');
fs.writeSync(BSON_FILE);
time_now('writting file');
