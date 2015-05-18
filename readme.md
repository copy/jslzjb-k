jslzjb-k
=

This is a fork of the jslzjb project, https://code.google.com/p/jslzjb/

It has been modified to work on `Uint8Array` values exclusively and avoids all
allocations during compression and decompression. These changes have been made
out of the need to compress large buffers in a reasonable amount of time.

It performs compression of a 100 MB buffer in the order of seconds.


**TODO**

- Benchmarks
- Make use of asm.js
- Make use of simd

