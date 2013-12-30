// var moment = require('moment');
// var async = require('async');
var BSON_FILE = "test-read.bson"
var GEN_RANGE = 1440;
var _ = require('lodash');
var buffalo = require('buffalo');
var fs = require('fs');
var assert = require('assert');

var candles = [];

var checkpoints = [];
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

console.log("Going to load " + GEN_RANGE + " candles and deserialize them from BSON.");
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

var buf = buffalo.serialize(candles);
fs.writeFileSync(BSON_FILE, buf);
console.log("... BSON prepared.");


time_now();
var input = fs.readFileSync("mytest.bbb");
time_now("file read");
var result = buffalo.parse(input);
time_now("BSON parsed");

var i = 0;
try {
    assert.equals(result.length, candles.length);
    for (i = 0, l = candles.length; i < l; i++) {
        assert.deepEqual(result[i], candles[i]);
    }
    console.log("Test pass: Parsed data equals to original.");
} catch(ex) {
    console.log("Test failed: Parsed data differs from original at candle " + i + ".");
}

console.log(result.length, candles.length);
