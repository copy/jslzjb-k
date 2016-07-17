jslzjb-k
=

This is a fork of the jslzjb project, https://code.google.com/p/jslzjb/

It has been modified to work on `Uint8Array` values exclusively and avoids all
allocations during compression and decompression. These changes have been made
out of the need to compress large buffers in a reasonable amount of time.

It performs compression of a 100 MB buffer in the order of a second.

Test it yourself:

```
% ./test-lzjb.js test-lzjb.js
compress: 0.822ms
decompress: 0.281ms
compressed test-lzjb.js from=905 to=659
% ./test-lzjb.js /bin/node
compress: 106.155ms
decompress: 55.874ms
compressed /bin/node from=14059k to=9348k
```

**TODO**

- Benchmarks
- Make use of asm.js
- Make use of simd

