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
var out = new Uint8Array(Math.max(inp.length * 1.5 | 0, 16 * 1024));
//var out = new Uint8Array(inp.length);
var orig = new Uint8Array(inp.length);

console.time("compress");
var len = l.compress(inp, out);
console.timeEnd("compress");
console.assert(typeof len === "number");
if(len > out.length)
{
    console.error("Output buffer for file %s is too small (buffer size is %d, needed %d)", filename, out.length, len);
    process.exit(1);
}

console.time("decompress");
l.decompress(out, len, orig);
console.timeEnd("decompress");

var from = inp.length;
var to = len;

if(from >= 1024 && to >= 1024)
{
    from = (from >> 10) + "k";
    to = (to >> 10) + "k";
}

console.log("compressed %s from=%s to=%s", filename, from, to);

for(var i = 0; i < inp.length; i++)
{
    if(inp[i] !== orig[i])
    {
        throw filename + ": Failed at index " + i;
    }
}
