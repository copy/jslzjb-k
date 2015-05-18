/*
Based on jslzjb: https://code.google.com/p/jslzjb/
Heavily modified for speed
*/

var jslzjb = (function() {
    // TODO:
    //"use asm";

    // Constants was used for compress/decompress function.
    var
        /** @const */ NBBY = 8,
        /** @const */ MATCH_BITS = 6,
        /** @const */ MATCH_MIN = 3,
        /** @const */ MATCH_MAX = ((1 << MATCH_BITS) + (MATCH_MIN - 1)),
        /** @const */ OFFSET_MASK = ((1 << (16 - MATCH_BITS)) - 1),
        /** @const */ LEMPEL_SIZE = 256;

    /**
     * Compress string or byte array using fast and efficient algorithm.
     *
     * Because of weak of javascript's natural, many compression algorithm
     * become useless in javascript implementation. The main problem is
     * performance, even the simple Huffman, LZ77/78 algorithm will take many
     * many time to operate. We use LZJB algorithm to do that, it suprisingly
     * fulfills our requirement to compress string fastly and efficiently.
     *
     * Our implementation is based on
     * http://src.opensolaris.org/source/raw/onnv/onnv-gate/
     * usr/src/uts/common/os/compress.c
     * It is licensed under CDDL.
     *
     * @param {Uint8Array} sstart  The buffer to compress
     * @param {Uint8Array} dstart  The buffer to write into
     * @return {number} compressed length
     */
    function compress(sstart, dstart)
    {
        var
            slen = 0,
            src = 0,
            dst = 0,
            cpy = 0,
            copymap = 0,
            copymask = 1 << (NBBY - 1),
            mlen = 0,
            offset = 0,
            hp = 0,
            lempel = new Int32Array(LEMPEL_SIZE),
            i = 0;

        // Initialize lempel array.
        for(i = 0; i < LEMPEL_SIZE; i++)
        {
            lempel[i] = -858993460;
        }

        slen = sstart.length;

        while (src < slen)
        {
            if ((copymask <<= 1) == (1 << NBBY)) {
                if (dst >= slen - 1 - 2 * NBBY) {
                    mlen = slen;
                    for (src = 0, dst = 0; mlen; mlen--)
                        dstart[dst++] = sstart[src++];
                    return dstart;
                }
                copymask = 1;
                copymap = dst;
                dstart[dst++] = 0;
            }

            if (src > slen - MATCH_MAX) {
                dstart[dst++] = sstart[src++];
                continue;
            }

            hp = ((sstart[src] + 13) ^
                  (sstart[src + 1] - 13) ^
                   sstart[src + 2]) &
                 (LEMPEL_SIZE - 1);

            offset = (src - lempel[hp]) & OFFSET_MASK;
            lempel[hp] = src;
            cpy = src - offset;

            if (cpy >= 0 && cpy != src &&
                sstart[src] == sstart[cpy] &&
                sstart[src + 1] == sstart[cpy + 1] &&
                sstart[src + 2] == sstart[cpy + 2]) {
                dstart[copymap] |= copymask;
                for (mlen = MATCH_MIN; mlen < MATCH_MAX; mlen++)
                    if (sstart[src + mlen] != sstart[cpy + mlen])
                        break;
                dstart[dst++] = ((mlen - MATCH_MIN) << (NBBY - MATCH_BITS)) |
                                (offset >> NBBY);
                dstart[dst++] = offset;
                src += mlen;
            } else {
                dstart[dst++] = sstart[src++];
            }
        }

        console.assert(dstart.length >= dst);
        console.assert(sstart.length >= src);

        return dst;
    }

    /**
     * Decompress string or byte array using fast and efficient algorithm.
     *
     * Our implementation is based on
     * http://src.opensolaris.org/source/raw/onnv/onnv-gate/
     * usr/src/uts/common/os/compress.c
     * It is licensed under CDDL.
     *
     * @param {Uint8Array} sstart  The buffer to decompress
     * @param {number} slen  compressed length
     * @param {Uint8Array} dstart  The buffer to write into
     *
     * @return {number} decompressed length
     */
    function decompress(sstart, slen, dstart)
    {
        slen = slen | 0;

        var
            src = 0,
            dst = 0,
            cpy = 0,
            copymap = 0,
            copymask = 1 << (NBBY - 1 | 0),
            mlen = 0,
            offset = 0;

        //var avg_mlen = [];

        while (src < slen)
        {
            if ((copymask <<= 1) === (1 << NBBY))
            {
                copymask = 1;
                copymap = sstart[src];
                src = src + 1 | 0;
            }

            if (copymap & copymask)
            {
                mlen = (sstart[src] >> (NBBY - MATCH_BITS | 0)) + MATCH_MIN | 0;
                offset = ((sstart[src] << NBBY) | sstart[src + 1 | 0]) & OFFSET_MASK;
                src = src + 2 | 0;

                cpy = dst - offset | 0;
                //if (cpy >= 0)
                {
                    //console.log(mlen);
                    //avg_mlen.push(mlen);

                    //dstart.set(dstart.subarray(cpy, cpy + mlen | 0), dst);
                    //dst = dst + mlen | 0;
                    //cpy = cpy + mlen | 0;

                    //mlen = mlen - 1 | 0;
                    while (mlen > 4)
                    {
                        dstart[dst] = dstart[cpy];
                        dst = dst + 1 | 0;
                        cpy = cpy + 1 | 0;

                        dstart[dst] = dstart[cpy];
                        dst = dst + 1 | 0;
                        cpy = cpy + 1 | 0;

                        dstart[dst] = dstart[cpy];
                        dst = dst + 1 | 0;
                        cpy = cpy + 1 | 0;

                        dstart[dst] = dstart[cpy];
                        dst = dst + 1 | 0;
                        cpy = cpy + 1 | 0;

                        mlen = mlen - 4 | 0;
                    }

                    while (mlen > 0)
                    {
                        dstart[dst] = dstart[cpy];
                        dst = dst + 1 | 0;
                        cpy = cpy + 1 | 0;
                        mlen = mlen - 1 | 0;
                    }
                }
                //else
                //{
                //    /*
                //     * offset before start of destination buffer
                //     * indicates corrupt source data
                //     */
                //    console.warn("possibly corrupt data");
                //    return dstart;
                //}
            }
            else
            {
                dstart[dst] = sstart[src];
                dst = dst + 1 | 0;
                src = src + 1 | 0;
            }
        }

        //console.log(avg_mlen.reduce(function(a, x) { return a + x; }, 0) / avg_mlen.length);

        //console.assert(dstart.length >= dst);
        //console.assert(sstart.length >= src);

        return dst;
    }

    return {
        compress: compress,
        decompress: decompress,
    };

})();

typeof module === "undefined" || (module.exports = jslzjb);

