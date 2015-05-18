#!/bin/env node
"use strict";

if(!process.argv[2])
{
    console.error("Usage: test-lzjb.js <testfile>");
    process.exit();
}

var l = require("./lzjb.js");

var inp = new Uint8Array(require("fs").readFileSync(process.argv[2]));
var out = new Uint8Array(inp.length);
var orig = new Uint8Array(inp.length);

console.time("compress");
var len = l.compress(inp, out);
console.timeEnd("compress");

console.time("decompress");
l.decompress(out, len, orig);
console.timeEnd("decompress");

console.log("compressed from=%dk to=%dk", inp.length >> 10, len >> 10);

for(var i = 0; i < inp.length; i++)
{
    if(inp[i] !== orig[i])
    {
        throw "Failed";
    }
}

