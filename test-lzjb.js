#!/bin/env node
"use strict";

var filename = process.argv[2];
if(!filename)
{
    console.error("Usage: test-lzjb.js <testfile>");
    process.exit();
}

var l = require("./lzjb.js");

var inp = new Uint8Array(require("fs").readFileSync(filename));
var out = new Uint8Array(Math.max(inp.length, 16 * 1024));
var orig = new Uint8Array(inp.length);

console.time("compress");
var len = l.compress(inp, out);
console.timeEnd("compress");

console.time("decompress");
l.decompress(out, len, orig);
console.timeEnd("decompress");

console.log("compressed %s from=%dk to=%dk", filename, inp.length >> 10, len >> 10);

for(var i = 0; i < inp.length; i++)
{
    if(inp[i] !== orig[i])
    {
        throw filename + ": Failed at index " + i;
    }
}
