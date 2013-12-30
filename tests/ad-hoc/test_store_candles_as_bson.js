// var moment = require('moment');
// var async = require('async');
var BUF_SIZE = 1024*1024;
var BSON_FILE = "test-07.bson"
var GEN_RANGE = 1440 * 10;
var _ = require('lodash');
var buffalo = require('buffalo');
var fs = require('fs');
 
var candles = [];

var checkpoints = [];
var last;

var time_now = function(note){
    var precision = 3;
    var elapsed;

    if (checkpoints.length > 0) {
	var last = checkpoints[checkpoints.length - 1];
	var diff = process.hrtime(last);
	elapsed = diff[0] * 1000 + diff[1] / 100000;
	console.log("Elapsed: " + elapsed.toFixed(precision) + " ms - " + note);
    }
    checkpoints.push(process.hrtime());
}

time_now();
_.each(_.range(GEN_RANGE), function(d) {
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

console.log("Going to generate " + GEN_RANGE  + " candles and store them as BSON.");

time_now('creating candles');
var buf = buffalo.serialize(candles);
time_now('serializing BSON');
fs.writeSync(BSON_FILE, buf);
time_now('writting file');

console.log("Buffer content: ");
console.log(buf);
