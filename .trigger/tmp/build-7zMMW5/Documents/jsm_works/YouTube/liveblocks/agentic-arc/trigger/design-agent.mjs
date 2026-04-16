import {
  createGoogleGenerativeAI
} from "../../../../../../chunk-NIQCOBT6.mjs";
import {
  external_exports,
  generateText,
  stepCountIs,
  tool
} from "../../../../../../chunk-74QZRFK3.mjs";
import "../../../../../../chunk-RQYKA76I.mjs";
import {
  task
} from "../../../../../../chunk-PX67KK3X.mjs";
import "../../../../../../chunk-HCD45DYG.mjs";
import {
  __commonJS,
  __name,
  __toESM,
  init_esm
} from "../../../../../../chunk-3R76H35D.mjs";

// node_modules/@stablelib/base64/lib/base64.js
var require_base64 = __commonJS({
  "node_modules/@stablelib/base64/lib/base64.js"(exports) {
    "use strict";
    init_esm();
    var __extends = exports && exports.__extends || /* @__PURE__ */ function() {
      var extendStatics = /* @__PURE__ */ __name(function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      }, "extendStatics");
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        __name(__, "__");
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports, "__esModule", { value: true });
    var INVALID_BYTE = 256;
    var Coder = (
      /** @class */
      function() {
        function Coder2(_paddingCharacter) {
          if (_paddingCharacter === void 0) {
            _paddingCharacter = "=";
          }
          this._paddingCharacter = _paddingCharacter;
        }
        __name(Coder2, "Coder");
        Coder2.prototype.encodedLength = function(length) {
          if (!this._paddingCharacter) {
            return (length * 8 + 5) / 6 | 0;
          }
          return (length + 2) / 3 * 4 | 0;
        };
        Coder2.prototype.encode = function(data) {
          var out = "";
          var i = 0;
          for (; i < data.length - 2; i += 3) {
            var c = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
            out += this._encodeByte(c >>> 3 * 6 & 63);
            out += this._encodeByte(c >>> 2 * 6 & 63);
            out += this._encodeByte(c >>> 1 * 6 & 63);
            out += this._encodeByte(c >>> 0 * 6 & 63);
          }
          var left = data.length - i;
          if (left > 0) {
            var c = data[i] << 16 | (left === 2 ? data[i + 1] << 8 : 0);
            out += this._encodeByte(c >>> 3 * 6 & 63);
            out += this._encodeByte(c >>> 2 * 6 & 63);
            if (left === 2) {
              out += this._encodeByte(c >>> 1 * 6 & 63);
            } else {
              out += this._paddingCharacter || "";
            }
            out += this._paddingCharacter || "";
          }
          return out;
        };
        Coder2.prototype.maxDecodedLength = function(length) {
          if (!this._paddingCharacter) {
            return (length * 6 + 7) / 8 | 0;
          }
          return length / 4 * 3 | 0;
        };
        Coder2.prototype.decodedLength = function(s) {
          return this.maxDecodedLength(s.length - this._getPaddingLength(s));
        };
        Coder2.prototype.decode = function(s) {
          if (s.length === 0) {
            return new Uint8Array(0);
          }
          var paddingLength = this._getPaddingLength(s);
          var length = s.length - paddingLength;
          var out = new Uint8Array(this.maxDecodedLength(length));
          var op = 0;
          var i = 0;
          var haveBad = 0;
          var v0 = 0, v1 = 0, v2 = 0, v3 = 0;
          for (; i < length - 4; i += 4) {
            v0 = this._decodeChar(s.charCodeAt(i + 0));
            v1 = this._decodeChar(s.charCodeAt(i + 1));
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            v3 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = v0 << 2 | v1 >>> 4;
            out[op++] = v1 << 4 | v2 >>> 2;
            out[op++] = v2 << 6 | v3;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v1 & INVALID_BYTE;
            haveBad |= v2 & INVALID_BYTE;
            haveBad |= v3 & INVALID_BYTE;
          }
          if (i < length - 1) {
            v0 = this._decodeChar(s.charCodeAt(i));
            v1 = this._decodeChar(s.charCodeAt(i + 1));
            out[op++] = v0 << 2 | v1 >>> 4;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v1 & INVALID_BYTE;
          }
          if (i < length - 2) {
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            out[op++] = v1 << 4 | v2 >>> 2;
            haveBad |= v2 & INVALID_BYTE;
          }
          if (i < length - 3) {
            v3 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = v2 << 6 | v3;
            haveBad |= v3 & INVALID_BYTE;
          }
          if (haveBad !== 0) {
            throw new Error("Base64Coder: incorrect characters for decoding");
          }
          return out;
        };
        Coder2.prototype._encodeByte = function(b) {
          var result = b;
          result += 65;
          result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
          result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
          result += 61 - b >>> 8 & 52 - 48 - 62 + 43;
          result += 62 - b >>> 8 & 62 - 43 - 63 + 47;
          return String.fromCharCode(result);
        };
        Coder2.prototype._decodeChar = function(c) {
          var result = INVALID_BYTE;
          result += (42 - c & c - 44) >>> 8 & -INVALID_BYTE + c - 43 + 62;
          result += (46 - c & c - 48) >>> 8 & -INVALID_BYTE + c - 47 + 63;
          result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
          result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
          result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
          return result;
        };
        Coder2.prototype._getPaddingLength = function(s) {
          var paddingLength = 0;
          if (this._paddingCharacter) {
            for (var i = s.length - 1; i >= 0; i--) {
              if (s[i] !== this._paddingCharacter) {
                break;
              }
              paddingLength++;
            }
            if (s.length < 4 || paddingLength > 2) {
              throw new Error("Base64Coder: incorrect padding");
            }
          }
          return paddingLength;
        };
        return Coder2;
      }()
    );
    exports.Coder = Coder;
    var stdCoder = new Coder();
    function encode2(data) {
      return stdCoder.encode(data);
    }
    __name(encode2, "encode");
    exports.encode = encode2;
    function decode(s) {
      return stdCoder.decode(s);
    }
    __name(decode, "decode");
    exports.decode = decode;
    var URLSafeCoder = (
      /** @class */
      function(_super) {
        __extends(URLSafeCoder2, _super);
        function URLSafeCoder2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        __name(URLSafeCoder2, "URLSafeCoder");
        URLSafeCoder2.prototype._encodeByte = function(b) {
          var result = b;
          result += 65;
          result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
          result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
          result += 61 - b >>> 8 & 52 - 48 - 62 + 45;
          result += 62 - b >>> 8 & 62 - 45 - 63 + 95;
          return String.fromCharCode(result);
        };
        URLSafeCoder2.prototype._decodeChar = function(c) {
          var result = INVALID_BYTE;
          result += (44 - c & c - 46) >>> 8 & -INVALID_BYTE + c - 45 + 62;
          result += (94 - c & c - 96) >>> 8 & -INVALID_BYTE + c - 95 + 63;
          result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
          result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
          result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
          return result;
        };
        return URLSafeCoder2;
      }(Coder)
    );
    exports.URLSafeCoder = URLSafeCoder;
    var urlSafeCoder = new URLSafeCoder();
    function encodeURLSafe(data) {
      return urlSafeCoder.encode(data);
    }
    __name(encodeURLSafe, "encodeURLSafe");
    exports.encodeURLSafe = encodeURLSafe;
    function decodeURLSafe(s) {
      return urlSafeCoder.decode(s);
    }
    __name(decodeURLSafe, "decodeURLSafe");
    exports.decodeURLSafe = decodeURLSafe;
    exports.encodedLength = function(length) {
      return stdCoder.encodedLength(length);
    };
    exports.maxDecodedLength = function(length) {
      return stdCoder.maxDecodedLength(length);
    };
    exports.decodedLength = function(s) {
      return stdCoder.decodedLength(s);
    };
  }
});

// node_modules/fast-sha256/sha256.js
var require_sha256 = __commonJS({
  "node_modules/fast-sha256/sha256.js"(exports, module) {
    init_esm();
    (function(root, factory) {
      var exports2 = {};
      factory(exports2);
      var sha2562 = exports2["default"];
      for (var k in exports2) {
        sha2562[k] = exports2[k];
      }
      if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = sha2562;
      } else if (typeof define === "function" && define.amd) {
        define(function() {
          return sha2562;
        });
      } else {
        root.sha256 = sha2562;
      }
    })(exports, function(exports2) {
      "use strict";
      exports2.__esModule = true;
      exports2.digestLength = 32;
      exports2.blockSize = 64;
      var K = new Uint32Array([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      function hashBlocks(w, v, p, pos, len) {
        var a, b, c, d, e, f, g2, h, u, i, j, t1, t2;
        while (len >= 64) {
          a = v[0];
          b = v[1];
          c = v[2];
          d = v[3];
          e = v[4];
          f = v[5];
          g2 = v[6];
          h = v[7];
          for (i = 0; i < 16; i++) {
            j = pos + i * 4;
            w[i] = (p[j] & 255) << 24 | (p[j + 1] & 255) << 16 | (p[j + 2] & 255) << 8 | p[j + 3] & 255;
          }
          for (i = 16; i < 64; i++) {
            u = w[i - 2];
            t1 = (u >>> 17 | u << 32 - 17) ^ (u >>> 19 | u << 32 - 19) ^ u >>> 10;
            u = w[i - 15];
            t2 = (u >>> 7 | u << 32 - 7) ^ (u >>> 18 | u << 32 - 18) ^ u >>> 3;
            w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
          }
          for (i = 0; i < 64; i++) {
            t1 = (((e >>> 6 | e << 32 - 6) ^ (e >>> 11 | e << 32 - 11) ^ (e >>> 25 | e << 32 - 25)) + (e & f ^ ~e & g2) | 0) + (h + (K[i] + w[i] | 0) | 0) | 0;
            t2 = ((a >>> 2 | a << 32 - 2) ^ (a >>> 13 | a << 32 - 13) ^ (a >>> 22 | a << 32 - 22)) + (a & b ^ a & c ^ b & c) | 0;
            h = g2;
            g2 = f;
            f = e;
            e = d + t1 | 0;
            d = c;
            c = b;
            b = a;
            a = t1 + t2 | 0;
          }
          v[0] += a;
          v[1] += b;
          v[2] += c;
          v[3] += d;
          v[4] += e;
          v[5] += f;
          v[6] += g2;
          v[7] += h;
          pos += 64;
          len -= 64;
        }
        return pos;
      }
      __name(hashBlocks, "hashBlocks");
      var Hash = (
        /** @class */
        function() {
          function Hash2() {
            this.digestLength = exports2.digestLength;
            this.blockSize = exports2.blockSize;
            this.state = new Int32Array(8);
            this.temp = new Int32Array(64);
            this.buffer = new Uint8Array(128);
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            this.reset();
          }
          __name(Hash2, "Hash");
          Hash2.prototype.reset = function() {
            this.state[0] = 1779033703;
            this.state[1] = 3144134277;
            this.state[2] = 1013904242;
            this.state[3] = 2773480762;
            this.state[4] = 1359893119;
            this.state[5] = 2600822924;
            this.state[6] = 528734635;
            this.state[7] = 1541459225;
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            return this;
          };
          Hash2.prototype.clean = function() {
            for (var i = 0; i < this.buffer.length; i++) {
              this.buffer[i] = 0;
            }
            for (var i = 0; i < this.temp.length; i++) {
              this.temp[i] = 0;
            }
            this.reset();
          };
          Hash2.prototype.update = function(data, dataLength) {
            if (dataLength === void 0) {
              dataLength = data.length;
            }
            if (this.finished) {
              throw new Error("SHA256: can't update because hash was finished.");
            }
            var dataPos = 0;
            this.bytesHashed += dataLength;
            if (this.bufferLength > 0) {
              while (this.bufferLength < 64 && dataLength > 0) {
                this.buffer[this.bufferLength++] = data[dataPos++];
                dataLength--;
              }
              if (this.bufferLength === 64) {
                hashBlocks(this.temp, this.state, this.buffer, 0, 64);
                this.bufferLength = 0;
              }
            }
            if (dataLength >= 64) {
              dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength);
              dataLength %= 64;
            }
            while (dataLength > 0) {
              this.buffer[this.bufferLength++] = data[dataPos++];
              dataLength--;
            }
            return this;
          };
          Hash2.prototype.finish = function(out) {
            if (!this.finished) {
              var bytesHashed = this.bytesHashed;
              var left = this.bufferLength;
              var bitLenHi = bytesHashed / 536870912 | 0;
              var bitLenLo = bytesHashed << 3;
              var padLength = bytesHashed % 64 < 56 ? 64 : 128;
              this.buffer[left] = 128;
              for (var i = left + 1; i < padLength - 8; i++) {
                this.buffer[i] = 0;
              }
              this.buffer[padLength - 8] = bitLenHi >>> 24 & 255;
              this.buffer[padLength - 7] = bitLenHi >>> 16 & 255;
              this.buffer[padLength - 6] = bitLenHi >>> 8 & 255;
              this.buffer[padLength - 5] = bitLenHi >>> 0 & 255;
              this.buffer[padLength - 4] = bitLenLo >>> 24 & 255;
              this.buffer[padLength - 3] = bitLenLo >>> 16 & 255;
              this.buffer[padLength - 2] = bitLenLo >>> 8 & 255;
              this.buffer[padLength - 1] = bitLenLo >>> 0 & 255;
              hashBlocks(this.temp, this.state, this.buffer, 0, padLength);
              this.finished = true;
            }
            for (var i = 0; i < 8; i++) {
              out[i * 4 + 0] = this.state[i] >>> 24 & 255;
              out[i * 4 + 1] = this.state[i] >>> 16 & 255;
              out[i * 4 + 2] = this.state[i] >>> 8 & 255;
              out[i * 4 + 3] = this.state[i] >>> 0 & 255;
            }
            return this;
          };
          Hash2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          Hash2.prototype._saveState = function(out) {
            for (var i = 0; i < this.state.length; i++) {
              out[i] = this.state[i];
            }
          };
          Hash2.prototype._restoreState = function(from, bytesHashed) {
            for (var i = 0; i < this.state.length; i++) {
              this.state[i] = from[i];
            }
            this.bytesHashed = bytesHashed;
            this.finished = false;
            this.bufferLength = 0;
          };
          return Hash2;
        }()
      );
      exports2.Hash = Hash;
      var HMAC = (
        /** @class */
        function() {
          function HMAC2(key) {
            this.inner = new Hash();
            this.outer = new Hash();
            this.blockSize = this.inner.blockSize;
            this.digestLength = this.inner.digestLength;
            var pad = new Uint8Array(this.blockSize);
            if (key.length > this.blockSize) {
              new Hash().update(key).finish(pad).clean();
            } else {
              for (var i = 0; i < key.length; i++) {
                pad[i] = key[i];
              }
            }
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54;
            }
            this.inner.update(pad);
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54 ^ 92;
            }
            this.outer.update(pad);
            this.istate = new Uint32Array(8);
            this.ostate = new Uint32Array(8);
            this.inner._saveState(this.istate);
            this.outer._saveState(this.ostate);
            for (var i = 0; i < pad.length; i++) {
              pad[i] = 0;
            }
          }
          __name(HMAC2, "HMAC");
          HMAC2.prototype.reset = function() {
            this.inner._restoreState(this.istate, this.inner.blockSize);
            this.outer._restoreState(this.ostate, this.outer.blockSize);
            return this;
          };
          HMAC2.prototype.clean = function() {
            for (var i = 0; i < this.istate.length; i++) {
              this.ostate[i] = this.istate[i] = 0;
            }
            this.inner.clean();
            this.outer.clean();
          };
          HMAC2.prototype.update = function(data) {
            this.inner.update(data);
            return this;
          };
          HMAC2.prototype.finish = function(out) {
            if (this.outer.finished) {
              this.outer.finish(out);
            } else {
              this.inner.finish(out);
              this.outer.update(out, this.digestLength).finish(out);
            }
            return this;
          };
          HMAC2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          return HMAC2;
        }()
      );
      exports2.HMAC = HMAC;
      function hash(data) {
        var h = new Hash().update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      __name(hash, "hash");
      exports2.hash = hash;
      exports2["default"] = hash;
      function hmac2(key, data) {
        var h = new HMAC(key).update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      __name(hmac2, "hmac");
      exports2.hmac = hmac2;
      function fillBuffer(buffer, hmac3, info, counter) {
        var num = counter[0];
        if (num === 0) {
          throw new Error("hkdf: cannot expand more");
        }
        hmac3.reset();
        if (num > 1) {
          hmac3.update(buffer);
        }
        if (info) {
          hmac3.update(info);
        }
        hmac3.update(counter);
        hmac3.finish(buffer);
        counter[0]++;
      }
      __name(fillBuffer, "fillBuffer");
      var hkdfSalt = new Uint8Array(exports2.digestLength);
      function hkdf(key, salt, info, length) {
        if (salt === void 0) {
          salt = hkdfSalt;
        }
        if (length === void 0) {
          length = 32;
        }
        var counter = new Uint8Array([1]);
        var okm = hmac2(salt, key);
        var hmac_ = new HMAC(okm);
        var buffer = new Uint8Array(hmac_.digestLength);
        var bufpos = buffer.length;
        var out = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
          if (bufpos === buffer.length) {
            fillBuffer(buffer, hmac_, info, counter);
            bufpos = 0;
          }
          out[i] = buffer[bufpos++];
        }
        hmac_.clean();
        buffer.fill(0);
        counter.fill(0);
        return out;
      }
      __name(hkdf, "hkdf");
      exports2.hkdf = hkdf;
      function pbkdf2(password, salt, iterations, dkLen) {
        var prf = new HMAC(password);
        var len = prf.digestLength;
        var ctr = new Uint8Array(4);
        var t = new Uint8Array(len);
        var u = new Uint8Array(len);
        var dk = new Uint8Array(dkLen);
        for (var i = 0; i * len < dkLen; i++) {
          var c = i + 1;
          ctr[0] = c >>> 24 & 255;
          ctr[1] = c >>> 16 & 255;
          ctr[2] = c >>> 8 & 255;
          ctr[3] = c >>> 0 & 255;
          prf.reset();
          prf.update(salt);
          prf.update(ctr);
          prf.finish(u);
          for (var j = 0; j < len; j++) {
            t[j] = u[j];
          }
          for (var j = 2; j <= iterations; j++) {
            prf.reset();
            prf.update(u).finish(u);
            for (var k = 0; k < len; k++) {
              t[k] ^= u[k];
            }
          }
          for (var j = 0; j < len && i * len + j < dkLen; j++) {
            dk[i * len + j] = t[j];
          }
        }
        for (var i = 0; i < len; i++) {
          t[i] = u[i] = 0;
        }
        for (var i = 0; i < 4; i++) {
          ctr[i] = 0;
        }
        prf.clean();
        return dk;
      }
      __name(pbkdf2, "pbkdf2");
      exports2.pbkdf2 = pbkdf2;
    });
  }
});

// trigger/design-agent.ts
init_esm();

// node_modules/@liveblocks/node/dist/index.js
init_esm();

// node_modules/@liveblocks/core/dist/index.js
init_esm();
var __defProp = Object.defineProperty;
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
}, "__export");
var PKG_NAME = "@liveblocks/core";
var PKG_VERSION = "3.18.1";
var PKG_FORMAT = "esm";
var g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
var crossLinkedDocs = "https://liveblocks.io/docs/errors/cross-linked";
var dupesDocs = "https://liveblocks.io/docs/errors/dupes";
var SPACE = " ";
function error(msg) {
  if (process.env.NODE_ENV === "production") {
    console.error(msg);
  } else {
    throw new Error(msg);
  }
}
__name(error, "error");
function detectDupes(pkgName, pkgVersion, pkgFormat) {
  const pkgId = Symbol.for(pkgName);
  const pkgBuildInfo = pkgFormat ? `${pkgVersion || "dev"} (${pkgFormat})` : pkgVersion || "dev";
  if (!g[pkgId]) {
    g[pkgId] = pkgBuildInfo;
  } else if (g[pkgId] === pkgBuildInfo) {
  } else {
    const msg = [
      `Multiple copies of Liveblocks are being loaded in your project. This will cause issues! See ${dupesDocs + SPACE}`,
      "",
      "Conflicts:",
      `- ${pkgName} ${g[pkgId]} (already loaded)`,
      `- ${pkgName} ${pkgBuildInfo} (trying to load this now)`
    ].join("\n");
    error(msg);
  }
  if (pkgVersion && PKG_VERSION && pkgVersion !== PKG_VERSION) {
    error(
      [
        `Cross-linked versions of Liveblocks found, which will cause issues! See ${crossLinkedDocs + SPACE}`,
        "",
        "Conflicts:",
        `- ${PKG_NAME} is at ${PKG_VERSION}`,
        `- ${pkgName} is at ${pkgVersion}`,
        "",
        "Always upgrade all Liveblocks packages to the same version number."
      ].join("\n")
    );
  }
}
__name(detectDupes, "detectDupes");
function makeEventSource() {
  const _observers = /* @__PURE__ */ new Set();
  function subscribe(callback) {
    _observers.add(callback);
    return () => _observers.delete(callback);
  }
  __name(subscribe, "subscribe");
  function subscribeOnce(callback) {
    const unsub = subscribe((event) => {
      unsub();
      return callback(event);
    });
    return unsub;
  }
  __name(subscribeOnce, "subscribeOnce");
  async function waitUntil(predicate) {
    let unsub;
    return new Promise((res) => {
      unsub = subscribe((event) => {
        if (predicate === void 0 || predicate(event)) {
          res(event);
        }
      });
    }).finally(() => unsub?.());
  }
  __name(waitUntil, "waitUntil");
  function notify(event) {
    let called = false;
    for (const callback of _observers) {
      callback(event);
      called = true;
    }
    return called;
  }
  __name(notify, "notify");
  function count() {
    return _observers.size;
  }
  __name(count, "count");
  return {
    // Private/internal control over event emission
    notify,
    subscribe,
    subscribeOnce,
    count,
    waitUntil,
    dispose() {
      _observers.clear();
    },
    // Publicly exposable subscription API
    observable: {
      subscribe,
      subscribeOnce,
      waitUntil
    }
  };
}
__name(makeEventSource, "makeEventSource");
var freeze = process.env.NODE_ENV === "production" ? (
  /* istanbul ignore next */
  (x) => x
) : Object.freeze;
function raise(msg) {
  throw new Error(msg);
}
__name(raise, "raise");
function create(obj, descriptors) {
  if (typeof descriptors !== "undefined") {
    return Object.create(obj, descriptors);
  }
  return Object.create(obj);
}
__name(create, "create");
function tryParseJson(rawMessage) {
  try {
    return JSON.parse(rawMessage);
  } catch (e) {
    return void 0;
  }
}
__name(tryParseJson, "tryParseJson");
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}
__name(deepClone, "deepClone");
function compactObject(obj) {
  const newObj = { ...obj };
  Object.keys(obj).forEach((k) => {
    const key = k;
    if (newObj[key] === void 0) {
      delete newObj[key];
    }
  });
  return newObj;
}
__name(compactObject, "compactObject");
var kSinks = Symbol("kSinks");
var kTrigger = Symbol("kTrigger");
var signalsToTrigger = null;
var trackedReads = null;
function enqueueTrigger(signal) {
  if (!signalsToTrigger) raise("Expected to be in an active batch");
  signalsToTrigger.add(signal);
}
__name(enqueueTrigger, "enqueueTrigger");
var AbstractSignal = class {
  static {
    __name(this, "AbstractSignal");
  }
  /** @internal */
  equals;
  #eventSource;
  /** @internal */
  [kSinks];
  constructor(equals) {
    this.equals = equals ?? Object.is;
    this.#eventSource = makeEventSource();
    this[kSinks] = /* @__PURE__ */ new Set();
    this.get = this.get.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.subscribeOnce = this.subscribeOnce.bind(this);
  }
  dispose() {
    this.#eventSource.dispose();
    this.#eventSource = "(disposed)";
    this.equals = "(disposed)";
  }
  get hasWatchers() {
    if (this.#eventSource.count() > 0) return true;
    for (const sink of this[kSinks]) {
      if (sink.hasWatchers) {
        return true;
      }
    }
    return false;
  }
  [kTrigger]() {
    this.#eventSource.notify();
    for (const sink of this[kSinks]) {
      enqueueTrigger(sink);
    }
  }
  subscribe(callback) {
    if (this.#eventSource.count() === 0) {
      this.get();
    }
    return this.#eventSource.subscribe(callback);
  }
  subscribeOnce(callback) {
    const unsub = this.subscribe(() => {
      unsub();
      return callback();
    });
    return unsub;
  }
  waitUntil() {
    throw new Error("waitUntil not supported on Signals");
  }
  markSinksDirty() {
    for (const sink of this[kSinks]) {
      sink.markDirty();
    }
  }
  addSink(sink) {
    this[kSinks].add(sink);
  }
  removeSink(sink) {
    this[kSinks].delete(sink);
  }
  asReadonly() {
    return this;
  }
};
var INITIAL = Symbol();
var DerivedSignal = class _DerivedSignal extends AbstractSignal {
  static {
    __name(this, "_DerivedSignal");
  }
  #prevValue;
  #dirty;
  // When true, the value in #value may not be up-to-date and needs re-checking
  #sources;
  #deps;
  #transform;
  // prettier-ignore
  static from(...args) {
    const last = args.pop();
    if (typeof last !== "function")
      raise("Invalid .from() call, last argument expected to be a function");
    if (typeof args[args.length - 1] === "function") {
      const equals = last;
      const transform = args.pop();
      return new _DerivedSignal(args, transform, equals);
    } else {
      const transform = last;
      return new _DerivedSignal(args, transform);
    }
  }
  constructor(deps, transform, equals) {
    super(equals);
    this.#dirty = true;
    this.#prevValue = INITIAL;
    this.#deps = deps;
    this.#sources = /* @__PURE__ */ new Set();
    this.#transform = transform;
  }
  dispose() {
    for (const src of this.#sources) {
      src.removeSink(this);
    }
    this.#prevValue = "(disposed)";
    this.#sources = "(disposed)";
    this.#deps = "(disposed)";
    this.#transform = "(disposed)";
  }
  get isDirty() {
    return this.#dirty;
  }
  #recompute() {
    const oldTrackedReads = trackedReads;
    let derived;
    trackedReads = /* @__PURE__ */ new Set();
    try {
      derived = this.#transform(...this.#deps.map((p) => p.get()));
    } finally {
      const oldSources = this.#sources;
      this.#sources = /* @__PURE__ */ new Set();
      for (const sig of trackedReads) {
        this.#sources.add(sig);
        oldSources.delete(sig);
      }
      for (const oldSource of oldSources) {
        oldSource.removeSink(this);
      }
      for (const newSource of this.#sources) {
        newSource.addSink(this);
      }
      trackedReads = oldTrackedReads;
    }
    this.#dirty = false;
    if (!this.equals(this.#prevValue, derived)) {
      this.#prevValue = derived;
      return true;
    }
    return false;
  }
  markDirty() {
    if (!this.#dirty) {
      this.#dirty = true;
      this.markSinksDirty();
    }
  }
  get() {
    if (this.#dirty) {
      this.#recompute();
    }
    trackedReads?.add(this);
    return this.#prevValue;
  }
  /**
   * Called by the Signal system if one or more of the dependent signals have
   * changed. In the case of a DerivedSignal, we'll only want to re-evaluate
   * the actual value if it's being watched, or any of their sinks are being
   * watched actively.
   */
  [kTrigger]() {
    if (!this.hasWatchers) {
      return;
    }
    const updated = this.#recompute();
    if (updated) {
      super[kTrigger]();
    }
  }
};
function bisectRight(arr, x, lt) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = lo + (hi - lo >> 1);
    if (lt(x, arr[mid])) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}
__name(bisectRight, "bisectRight");
var SortedList = class _SortedList {
  static {
    __name(this, "_SortedList");
  }
  #data;
  #lt;
  constructor(alreadySortedList, lt) {
    this.#lt = lt;
    this.#data = alreadySortedList;
  }
  /**
   * Creates an empty SortedList with the given "less than" function.
   */
  static with(lt) {
    return _SortedList.fromAlreadySorted([], lt);
  }
  static from(arr, lt) {
    const sorted = new _SortedList([], lt);
    for (const item of arr) {
      sorted.add(item);
    }
    return sorted;
  }
  static fromAlreadySorted(alreadySorted, lt) {
    return new _SortedList(alreadySorted, lt);
  }
  /**
   * Clones the sorted list to a new instance.
   */
  clone() {
    return new _SortedList(this.#data.slice(), this.#lt);
  }
  /**
   * Adds a new item to the sorted list, such that it remains sorted.
   * Returns the index where the item was inserted.
   */
  add(value) {
    const idx = bisectRight(this.#data, value, this.#lt);
    this.#data.splice(idx, 0, value);
    return idx;
  }
  /**
   * Removes all values from the sorted list, making it empty again.
   * Returns whether the list was mutated or not.
   */
  clear() {
    const hadData = this.#data.length > 0;
    this.#data.length = 0;
    return hadData;
  }
  /**
   * Removes the first value matching the predicate.
   * Returns whether the list was mutated or not.
   */
  removeBy(predicate, limit = Number.POSITIVE_INFINITY) {
    let deleted = 0;
    for (let i = 0; i < this.#data.length; i++) {
      if (predicate(this.#data[i])) {
        this.#data.splice(i, 1);
        deleted++;
        if (deleted >= limit) {
          break;
        } else {
          i--;
        }
      }
    }
    return deleted > 0;
  }
  /**
   * Removes the given value from the sorted list, if it exists. The given
   * value must be `===` to one of the list items. Only the first entry will be
   * removed if the element exists in the sorted list multiple times.
   *
   * Returns whether the list was mutated or not.
   */
  remove(value) {
    const idx = this.#data.indexOf(value);
    if (idx >= 0) {
      this.#data.splice(idx, 1);
      return true;
    }
    return false;
  }
  /**
   * Removes the item at the given index.
   * Returns the removed item, or undefined if index is out of bounds.
   */
  removeAt(index) {
    if (index < 0 || index >= this.#data.length) {
      return void 0;
    }
    const [removed] = this.#data.splice(index, 1);
    return removed;
  }
  /**
   * Repositions an item to maintain sorted order after its sort key has
   * been mutated in-place. For example:
   *
   *   const item = sorted.at(3);
   *   item.updatedAt = new Date();  // mutate the item's sort key in-place
   *   sorted.reposition(item);      // restore sorted order
   *
   * Returns the new index of the item. Throws if the item is not in the list.
   *
   * Semantically equivalent to remove(value) + add(value), but optimized
   * to avoid array shifting when the item only moves a short distance.
   */
  reposition(value) {
    const oldIdx = this.#data.indexOf(value);
    if (oldIdx < 0) {
      throw new Error("Cannot reposition item that is not in the list");
    }
    const prev = this.#data[oldIdx - 1];
    const next = this.#data[oldIdx + 1];
    const validLeft = prev === void 0 || this.#lt(prev, value);
    const validRight = next === void 0 || this.#lt(value, next);
    if (validLeft && validRight) {
      return oldIdx;
    }
    let newIdx = oldIdx;
    while (newIdx > 0 && this.#lt(value, this.#data[newIdx - 1])) {
      this.#data[newIdx] = this.#data[newIdx - 1];
      newIdx--;
    }
    if (newIdx < oldIdx) {
      this.#data[newIdx] = value;
      return newIdx;
    }
    while (newIdx < this.#data.length - 1 && !this.#lt(value, this.#data[newIdx + 1])) {
      this.#data[newIdx] = this.#data[newIdx + 1];
      newIdx++;
    }
    if (newIdx !== oldIdx) {
      this.#data[newIdx] = value;
    }
    return newIdx;
  }
  at(index) {
    return this.#data[index];
  }
  get length() {
    return this.#data.length;
  }
  *filter(predicate) {
    for (const item of this.#data) {
      if (predicate(item)) {
        yield item;
      }
    }
  }
  // XXXX If we keep this, add unit tests. Or remove it.
  *findAllRight(predicate) {
    for (let i = this.#data.length - 1; i >= 0; i--) {
      const item = this.#data[i];
      if (predicate(item, i)) {
        yield item;
      }
    }
  }
  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]();
  }
  *iterReversed() {
    for (let i = this.#data.length - 1; i >= 0; i--) {
      yield this.#data[i];
    }
  }
  /** Finds the leftmost item that matches the predicate. */
  find(predicate, start) {
    const idx = this.findIndex(predicate, start);
    return idx > -1 ? this.#data.at(idx) : void 0;
  }
  /** Finds the leftmost index that matches the predicate. */
  findIndex(predicate, start = 0) {
    for (let i = Math.max(0, start); i < this.#data.length; i++) {
      if (predicate(this.#data[i], i)) {
        return i;
      }
    }
    return -1;
  }
  /** Finds the rightmost item that matches the predicate. */
  findRight(predicate, start) {
    const idx = this.findIndexRight(predicate, start);
    return idx > -1 ? this.#data.at(idx) : void 0;
  }
  /** Finds the rightmost index that matches the predicate. */
  findIndexRight(predicate, start = this.#data.length - 1) {
    for (let i = Math.min(start, this.#data.length - 1); i >= 0; i--) {
      if (predicate(this.#data[i], i)) {
        return i;
      }
    }
    return -1;
  }
  get rawArray() {
    return this.#data;
  }
};
function convertToCommentData(data) {
  const editedAt = data.editedAt ? new Date(data.editedAt) : void 0;
  const createdAt = new Date(data.createdAt);
  const reactions = data.reactions.map((reaction) => ({
    ...reaction,
    createdAt: new Date(reaction.createdAt)
  }));
  if (data.body) {
    return {
      ...data,
      reactions,
      createdAt,
      editedAt
    };
  } else {
    const deletedAt = new Date(data.deletedAt);
    return {
      ...data,
      reactions,
      createdAt,
      editedAt,
      deletedAt
    };
  }
}
__name(convertToCommentData, "convertToCommentData");
function convertToThreadData(data) {
  const createdAt = new Date(data.createdAt);
  const updatedAt = new Date(data.updatedAt);
  const comments = data.comments.map(
    (comment) => convertToCommentData(comment)
  );
  return {
    ...data,
    createdAt,
    updatedAt,
    comments
  };
}
__name(convertToThreadData, "convertToThreadData");
function convertToCommentUserReaction(data) {
  return {
    ...data,
    createdAt: new Date(data.createdAt)
  };
}
__name(convertToCommentUserReaction, "convertToCommentUserReaction");
function convertToInboxNotificationData(data) {
  const notifiedAt = new Date(data.notifiedAt);
  const readAt = data.readAt ? new Date(data.readAt) : null;
  if ("activities" in data) {
    const activities = data.activities.map((activity) => ({
      ...activity,
      createdAt: new Date(activity.createdAt)
    }));
    return {
      ...data,
      notifiedAt,
      readAt,
      activities
    };
  }
  return {
    ...data,
    notifiedAt,
    readAt
  };
}
__name(convertToInboxNotificationData, "convertToInboxNotificationData");
function convertToSubscriptionData(data) {
  const createdAt = new Date(data.createdAt);
  return {
    ...data,
    createdAt
  };
}
__name(convertToSubscriptionData, "convertToSubscriptionData");
function convertToUserSubscriptionData(data) {
  const createdAt = new Date(data.createdAt);
  return {
    ...data,
    createdAt
  };
}
__name(convertToUserSubscriptionData, "convertToUserSubscriptionData");
function convertToGroupData(data) {
  const createdAt = new Date(data.createdAt);
  const updatedAt = new Date(data.updatedAt);
  const members = data.members.map((member) => ({
    ...member,
    addedAt: new Date(member.addedAt)
  }));
  return {
    ...data,
    createdAt,
    updatedAt,
    members
  };
}
__name(convertToGroupData, "convertToGroupData");
function assertNever(_value, errmsg) {
  throw new Error(errmsg);
}
__name(assertNever, "assertNever");
function assert(condition, errmsg) {
  if (process.env.NODE_ENV !== "production") {
    if (!condition) {
      const err = new Error(errmsg);
      err.name = "Assertion failure";
      throw err;
    }
  }
}
__name(assert, "assert");
function nn(value, errmsg = "Expected value to be non-nullable") {
  assert(value !== null && value !== void 0, errmsg);
  return value;
}
__name(nn, "nn");
var fancy_console_exports = {};
__export(fancy_console_exports, {
  error: /* @__PURE__ */ __name(() => error2, "error"),
  errorWithTitle: /* @__PURE__ */ __name(() => errorWithTitle, "errorWithTitle"),
  warn: /* @__PURE__ */ __name(() => warn, "warn"),
  warnWithTitle: /* @__PURE__ */ __name(() => warnWithTitle, "warnWithTitle")
});
var badge = "background:#0e0d12;border-radius:9999px;color:#fff;padding:3px 7px;font-family:sans-serif;font-weight:600;";
var bold = "font-weight:600";
function wrap(method) {
  return typeof window === "undefined" || process.env.NODE_ENV === "test" ? console[method] : (
    /* istanbul ignore next */
    (message, ...args) => console[method]("%cLiveblocks", badge, message, ...args)
  );
}
__name(wrap, "wrap");
var warn = wrap("warn");
var error2 = wrap("error");
function wrapWithTitle(method) {
  return typeof window === "undefined" || process.env.NODE_ENV === "test" ? console[method] : (
    /* istanbul ignore next */
    (title, message, ...args) => console[method](
      `%cLiveblocks%c ${title}`,
      badge,
      bold,
      message,
      ...args
    )
  );
}
__name(wrapWithTitle, "wrapWithTitle");
var warnWithTitle = wrapWithTitle("warn");
var errorWithTitle = wrapWithTitle("error");
function isPlainObject(blob) {
  return blob !== null && typeof blob === "object" && Object.prototype.toString.call(blob) === "[object Object]";
}
__name(isPlainObject, "isPlainObject");
function isStartsWithOperator(blob) {
  return isPlainObject(blob) && typeof blob.startsWith === "string";
}
__name(isStartsWithOperator, "isStartsWithOperator");
function isNumberOperator(blob) {
  return isPlainObject(blob) && (typeof blob.lt === "number" || typeof blob.gt === "number" || typeof blob.lte === "number" || typeof blob.gte === "number");
}
__name(isNumberOperator, "isNumberOperator");
var nanoid = /* @__PURE__ */ __name((t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(
  (t2, e) => t2 += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e < 63 ? "_" : "-",
  ""
), "nanoid");
var identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
function objectToQuery(obj) {
  let filterList = [];
  const entries2 = Object.entries(obj);
  const keyValuePairs = [];
  const keyValuePairsWithOperator = [];
  const indexedKeys = [];
  entries2.forEach(([key, value]) => {
    if (!identifierRegex.test(key)) {
      throw new Error("Key must only contain letters, numbers, _");
    }
    if (isSimpleValue(value)) {
      keyValuePairs.push([key, value]);
    } else if (isPlainObject(value)) {
      if (isStartsWithOperator(value) || isNumberOperator(value)) {
        keyValuePairsWithOperator.push([key, value]);
      } else {
        indexedKeys.push([key, value]);
      }
    }
  });
  filterList = [
    ...getFiltersFromKeyValuePairs(keyValuePairs),
    ...getFiltersFromKeyValuePairsWithOperator(keyValuePairsWithOperator)
  ];
  indexedKeys.forEach(([key, value]) => {
    const nestedEntries = Object.entries(value);
    const nKeyValuePairs = [];
    const nKeyValuePairsWithOperator = [];
    nestedEntries.forEach(([nestedKey, nestedValue]) => {
      if (isStringEmpty(nestedKey)) {
        throw new Error("Key cannot be empty");
      }
      if (isSimpleValue(nestedValue)) {
        nKeyValuePairs.push([formatFilterKey(key, nestedKey), nestedValue]);
      } else if (isStartsWithOperator(nestedValue) || isNumberOperator(nestedValue)) {
        nKeyValuePairsWithOperator.push([
          formatFilterKey(key, nestedKey),
          nestedValue
        ]);
      }
    });
    filterList = [
      ...filterList,
      ...getFiltersFromKeyValuePairs(nKeyValuePairs),
      ...getFiltersFromKeyValuePairsWithOperator(nKeyValuePairsWithOperator)
    ];
  });
  return filterList.map(({ key, operator, value }) => `${key}${operator}${quote(value)}`).join(" ");
}
__name(objectToQuery, "objectToQuery");
var getFiltersFromKeyValuePairs = /* @__PURE__ */ __name((keyValuePairs) => {
  const filters = [];
  keyValuePairs.forEach(([key, value]) => {
    filters.push({
      key,
      operator: ":",
      value
    });
  });
  return filters;
}, "getFiltersFromKeyValuePairs");
var getFiltersFromKeyValuePairsWithOperator = /* @__PURE__ */ __name((keyValuePairsWithOperator) => {
  const filters = [];
  keyValuePairsWithOperator.forEach(([key, value]) => {
    if ("startsWith" in value && typeof value.startsWith === "string") {
      filters.push({
        key,
        operator: "^",
        value: value.startsWith
      });
    }
    if ("lt" in value && typeof value.lt === "number") {
      filters.push({
        key,
        operator: "<",
        value: value.lt
      });
    }
    if ("gt" in value && typeof value.gt === "number") {
      filters.push({
        key,
        operator: ">",
        value: value.gt
      });
    }
    if ("gte" in value && typeof value.gte === "number") {
      filters.push({
        key,
        operator: ">=",
        value: value.gte
      });
    }
    if ("lte" in value && typeof value.lte === "number") {
      filters.push({
        key,
        operator: "<=",
        value: value.lte
      });
    }
  });
  return filters;
}, "getFiltersFromKeyValuePairsWithOperator");
var isSimpleValue = /* @__PURE__ */ __name((value) => {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null;
}, "isSimpleValue");
var formatFilterKey = /* @__PURE__ */ __name((key, nestedKey) => {
  if (nestedKey) {
    return `${key}[${quote(nestedKey)}]`;
  }
  return key;
}, "formatFilterKey");
var isStringEmpty = /* @__PURE__ */ __name((value) => {
  return !value || value.toString().trim() === "";
}, "isStringEmpty");
function quote(input) {
  const result = JSON.stringify(input);
  if (typeof input !== "string") {
    return result;
  }
  if (result.includes("'")) {
    return result;
  }
  return `'${result.slice(1, -1).replace(/\\"/g, '"')}'`;
}
__name(quote, "quote");
function toURLSearchParams(params) {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== void 0 && value !== null) {
      result.set(key, value.toString());
    }
  }
  return result;
}
__name(toURLSearchParams, "toURLSearchParams");
function urljoin(baseUrl, path, params) {
  const url2 = new URL(path, baseUrl);
  if (params !== void 0) {
    url2.search = (params instanceof URLSearchParams ? params : toURLSearchParams(params)).toString();
  }
  return url2.toString();
}
__name(urljoin, "urljoin");
function url(strings, ...values2) {
  return strings.reduce(
    (result, str, i) => result + encodeURIComponent(values2[i - 1] ?? "") + str
  );
}
__name(url, "url");
var ServerMsgCode = Object.freeze({
  // For Presence
  UPDATE_PRESENCE: 100,
  USER_JOINED: 101,
  USER_LEFT: 102,
  BROADCASTED_EVENT: 103,
  ROOM_STATE: 104,
  // For Storage
  STORAGE_STATE_V7: 200,
  // Only sent in V7
  STORAGE_CHUNK: 210,
  // Used in V8+
  STORAGE_STREAM_END: 211,
  // Used in V8+
  UPDATE_STORAGE: 201,
  // For Yjs Docs
  UPDATE_YDOC: 300,
  // For Comments
  THREAD_CREATED: 400,
  THREAD_DELETED: 407,
  THREAD_METADATA_UPDATED: 401,
  THREAD_UPDATED: 408,
  COMMENT_CREATED: 402,
  COMMENT_EDITED: 403,
  COMMENT_DELETED: 404,
  COMMENT_REACTION_ADDED: 405,
  COMMENT_REACTION_REMOVED: 406,
  COMMENT_METADATA_UPDATED: 409,
  // For Feeds
  FEEDS_LIST: 500,
  FEEDS_ADDED: 501,
  FEEDS_UPDATED: 502,
  FEED_DELETED: 503,
  FEED_MESSAGES_LIST: 504,
  FEED_MESSAGES_ADDED: 505,
  FEED_MESSAGES_UPDATED: 506,
  FEED_MESSAGES_DELETED: 507,
  FEED_REQUEST_FAILED: 508,
  // Error codes
  REJECT_STORAGE_OP: 299
  // Sent if a mutation was not allowed on the server (i.e. due to permissions, limit exceeded, etc)
});
var BACKOFF_DELAYS = [250, 500, 1e3, 2e3, 4e3, 8e3, 1e4];
var RESET_DELAY = BACKOFF_DELAYS[0] - 1;
function log(level, message) {
  const logger = level === 2 ? error2 : level === 1 ? warn : (
    /* black hole */
    () => {
    }
  );
  return () => {
    logger(message);
  };
}
__name(log, "log");
var logPermanentClose = log(
  1,
  "Connection to WebSocket closed permanently. Won't retry."
);
var kInternal = Symbol();
var EMPTY_OBJECT = Object.freeze({});
var NULL_KEYWORD_CHARS = Array.from(new Set("null"));
var TRUE_KEYWORD_CHARS = Array.from(new Set("true"));
var FALSE_KEYWORD_CHARS = Array.from(new Set("false"));
var ALL_KEYWORD_CHARS = Array.from(new Set("nulltruefalse"));
var kWILDCARD = Symbol("*");
var OpCode = Object.freeze({
  INIT: 0,
  SET_PARENT_KEY: 1,
  CREATE_LIST: 2,
  UPDATE_OBJECT: 3,
  CREATE_OBJECT: 4,
  DELETE_CRDT: 5,
  DELETE_OBJECT_KEY: 6,
  CREATE_MAP: 7,
  CREATE_REGISTER: 8
});
var CrdtType = Object.freeze({
  OBJECT: 0,
  LIST: 1,
  MAP: 2,
  REGISTER: 3
});
function isRootStorageNode(node) {
  return node[0] === "root";
}
__name(isRootStorageNode, "isRootStorageNode");
function isObjectStorageNode(node) {
  return node[1].type === CrdtType.OBJECT;
}
__name(isObjectStorageNode, "isObjectStorageNode");
function isListStorageNode(node) {
  return node[1].type === CrdtType.LIST;
}
__name(isListStorageNode, "isListStorageNode");
function isMapStorageNode(node) {
  return node[1].type === CrdtType.MAP;
}
__name(isMapStorageNode, "isMapStorageNode");
function isRegisterStorageNode(node) {
  return node[1].type === CrdtType.REGISTER;
}
__name(isRegisterStorageNode, "isRegisterStorageNode");
var MIN_CODE = 32;
var MAX_CODE = 126;
var NUM_DIGITS = MAX_CODE - MIN_CODE + 1;
var ZERO = nthDigit(0);
var ONE = nthDigit(1);
var ZERO_NINE = ZERO + nthDigit(-1);
function nthDigit(n) {
  const code = MIN_CODE + (n < 0 ? NUM_DIGITS + n : n);
  if (code < MIN_CODE || code > MAX_CODE) {
    throw new Error(`Invalid n value: ${n}`);
  }
  return String.fromCharCode(code);
}
__name(nthDigit, "nthDigit");
function makePosition(x, y) {
  if (x !== void 0 && y !== void 0) {
    return between(x, y);
  } else if (x !== void 0) {
    return after(x);
  } else if (y !== void 0) {
    return before(y);
  } else {
    return ONE;
  }
}
__name(makePosition, "makePosition");
function before(pos) {
  const lastIndex = pos.length - 1;
  for (let i = 0; i <= lastIndex; i++) {
    const code = pos.charCodeAt(i);
    if (code <= MIN_CODE) {
      continue;
    }
    if (i === lastIndex) {
      if (code === MIN_CODE + 1) {
        return pos.substring(0, i) + ZERO_NINE;
      } else {
        return pos.substring(0, i) + String.fromCharCode(code - 1);
      }
    } else {
      return pos.substring(0, i + 1);
    }
  }
  return ONE;
}
__name(before, "before");
var VIEWPORT_START = 2;
var VIEWPORT_STEP = 3;
function after(pos) {
  for (let i = 0; i < pos.length; i++) {
    const code = pos.charCodeAt(i);
    if (code < MIN_CODE || code > MAX_CODE) {
      return pos + ONE;
    }
  }
  while (pos.length > 1 && pos.charCodeAt(pos.length - 1) === MIN_CODE) {
    pos = pos.slice(0, -1);
  }
  if (pos.length === 0 || pos === ZERO) {
    return ONE;
  }
  let viewport = VIEWPORT_START;
  if (pos.length > VIEWPORT_START) {
    viewport = VIEWPORT_START + Math.ceil((pos.length - VIEWPORT_START) / VIEWPORT_STEP) * VIEWPORT_STEP;
  }
  const result = incrementWithinViewport(pos, viewport);
  if (result !== null) {
    return result;
  }
  viewport += VIEWPORT_STEP;
  const extendedResult = incrementWithinViewport(pos, viewport);
  if (extendedResult !== null) {
    return extendedResult;
  }
  return pos + ONE;
}
__name(after, "after");
function incrementWithinViewport(pos, viewport) {
  const digits = [];
  for (let i = 0; i < viewport; i++) {
    if (i < pos.length) {
      digits.push(pos.charCodeAt(i) - MIN_CODE);
    } else {
      digits.push(0);
    }
  }
  let carry = 1;
  for (let i = viewport - 1; i >= 0 && carry; i--) {
    const sum = digits[i] + carry;
    if (sum >= NUM_DIGITS) {
      digits[i] = 0;
      carry = 1;
    } else {
      digits[i] = sum;
      carry = 0;
    }
  }
  if (carry) {
    return null;
  }
  let result = "";
  for (const d of digits) {
    result += String.fromCharCode(d + MIN_CODE);
  }
  while (result.length > 1 && result.charCodeAt(result.length - 1) === MIN_CODE) {
    result = result.slice(0, -1);
  }
  return result;
}
__name(incrementWithinViewport, "incrementWithinViewport");
function between(lo, hi) {
  if (lo < hi) {
    return _between(lo, hi);
  } else if (lo > hi) {
    return _between(hi, lo);
  } else {
    throw new Error("Cannot compute value between two equal positions");
  }
}
__name(between, "between");
function _between(lo, hi) {
  let index = 0;
  const loLen = lo.length;
  const hiLen = hi.length;
  while (true) {
    const loCode = index < loLen ? lo.charCodeAt(index) : MIN_CODE;
    const hiCode = index < hiLen ? hi.charCodeAt(index) : MAX_CODE;
    if (loCode === hiCode) {
      index++;
      continue;
    }
    if (hiCode - loCode === 1) {
      const size = index + 1;
      let prefix = lo.substring(0, size);
      if (prefix.length < size) {
        prefix += ZERO.repeat(size - prefix.length);
      }
      const suffix = lo.substring(size);
      const nines = "";
      return prefix + _between(suffix, nines);
    } else {
      return takeN(lo, index) + String.fromCharCode(hiCode + loCode >> 1);
    }
  }
}
__name(_between, "_between");
function takeN(pos, n) {
  return n < pos.length ? pos.substring(0, n) : pos + ZERO.repeat(n - pos.length);
}
__name(takeN, "takeN");
var MIN_NON_ZERO_CODE = MIN_CODE + 1;
function isPos(str) {
  if (str === "") {
    return false;
  }
  const lastIdx = str.length - 1;
  const last = str.charCodeAt(lastIdx);
  if (last < MIN_NON_ZERO_CODE || last > MAX_CODE) {
    return false;
  }
  for (let i = 0; i < lastIdx; i++) {
    const code = str.charCodeAt(i);
    if (code < MIN_CODE || code > MAX_CODE) {
      return false;
    }
  }
  return true;
}
__name(isPos, "isPos");
function convertToPos(str) {
  const codes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    codes.push(code < MIN_CODE ? MIN_CODE : code > MAX_CODE ? MAX_CODE : code);
  }
  while (codes.length > 0 && codes[codes.length - 1] === MIN_CODE) {
    codes.length--;
  }
  return codes.length > 0 ? String.fromCharCode(...codes) : (
    // Edge case: the str was a 0-only string, which is invalid. Default back to .1
    ONE
  );
}
__name(convertToPos, "convertToPos");
function asPos(str) {
  return isPos(str) ? str : convertToPos(str);
}
__name(asPos, "asPos");
function createManagedPool(roomId, options) {
  const {
    getCurrentConnectionId,
    onDispatch,
    isStorageWritable = /* @__PURE__ */ __name(() => true, "isStorageWritable")
  } = options;
  let clock = 0;
  let opClock = 0;
  const nodes = /* @__PURE__ */ new Map();
  return {
    roomId,
    nodes,
    getNode: /* @__PURE__ */ __name((id) => nodes.get(id), "getNode"),
    addNode: /* @__PURE__ */ __name((id, node) => void nodes.set(id, node), "addNode"),
    deleteNode: /* @__PURE__ */ __name((id) => void nodes.delete(id), "deleteNode"),
    generateId: /* @__PURE__ */ __name(() => `${getCurrentConnectionId()}:${clock++}`, "generateId"),
    generateOpId: /* @__PURE__ */ __name(() => `${getCurrentConnectionId()}:${opClock++}`, "generateOpId"),
    dispatch(ops, reverse, storageUpdates) {
      onDispatch?.(ops, reverse, storageUpdates);
    },
    assertStorageIsWritable: /* @__PURE__ */ __name(() => {
      if (!isStorageWritable()) {
        throw new Error(
          "Cannot write to storage with a read only user, please ensure the user has write permissions"
        );
      }
    }, "assertStorageIsWritable")
  };
}
__name(createManagedPool, "createManagedPool");
function crdtAsLiveNode(value) {
  return value;
}
__name(crdtAsLiveNode, "crdtAsLiveNode");
function HasParent(node, key, pos = asPos(key)) {
  return Object.freeze({ type: "HasParent", node, key, pos });
}
__name(HasParent, "HasParent");
var NoParent = Object.freeze({ type: "NoParent" });
function Orphaned(oldKey, oldPos = asPos(oldKey)) {
  return Object.freeze({ type: "Orphaned", oldKey, oldPos });
}
__name(Orphaned, "Orphaned");
var AbstractCrdt = class {
  static {
    __name(this, "AbstractCrdt");
  }
  //                  ^^^^^^^^^^^^ TODO: Make this an interface
  #pool;
  #id;
  #parent = NoParent;
  /** @internal */
  _getParentKeyOrThrow() {
    switch (this.parent.type) {
      case "HasParent":
        return this.parent.key;
      case "NoParent":
        throw new Error("Parent key is missing");
      case "Orphaned":
        return this.parent.oldKey;
      default:
        return assertNever(this.parent, "Unknown state");
    }
  }
  /** @internal */
  get _parentPos() {
    switch (this.parent.type) {
      case "HasParent":
        return this.parent.pos;
      case "NoParent":
        throw new Error("Parent key is missing");
      case "Orphaned":
        return this.parent.oldPos;
      default:
        return assertNever(this.parent, "Unknown state");
    }
  }
  /** @internal */
  get _pool() {
    return this.#pool;
  }
  get roomId() {
    return this.#pool ? this.#pool.roomId : null;
  }
  /** @internal */
  get _id() {
    return this.#id;
  }
  /** @internal */
  get parent() {
    return this.#parent;
  }
  /** @internal */
  get _parentKey() {
    switch (this.parent.type) {
      case "HasParent":
        return this.parent.key;
      case "NoParent":
        return null;
      case "Orphaned":
        return this.parent.oldKey;
      default:
        return assertNever(this.parent, "Unknown state");
    }
  }
  /** @internal */
  _apply(op, _isLocal) {
    switch (op.type) {
      case OpCode.DELETE_CRDT: {
        if (this.parent.type === "HasParent") {
          return this.parent.node._detachChild(crdtAsLiveNode(this));
        }
        return { modified: false };
      }
    }
    return { modified: false };
  }
  /** @internal */
  _setParentLink(newParentNode, newParentKey) {
    switch (this.parent.type) {
      case "HasParent":
        if (this.parent.node !== newParentNode) {
          throw new Error("Cannot set parent: node already has a parent");
        } else {
          this.#parent = HasParent(newParentNode, newParentKey);
          return;
        }
      case "Orphaned":
      case "NoParent": {
        this.#parent = HasParent(newParentNode, newParentKey);
        return;
      }
      default:
        return assertNever(this.parent, "Unknown state");
    }
  }
  /** @internal */
  _attach(id, pool2) {
    if (this.#id || this.#pool) {
      throw new Error("Cannot attach node: already attached");
    }
    pool2.addNode(id, crdtAsLiveNode(this));
    this.#id = id;
    this.#pool = pool2;
  }
  /** @internal */
  _detach() {
    if (this.#pool && this.#id) {
      this.#pool.deleteNode(this.#id);
    }
    switch (this.parent.type) {
      case "HasParent": {
        this.#parent = Orphaned(this.parent.key, this.parent.pos);
        break;
      }
      case "NoParent": {
        this.#parent = NoParent;
        break;
      }
      case "Orphaned": {
        break;
      }
      default:
        assertNever(this.parent, "Unknown state");
    }
    this.#pool = void 0;
  }
  /**
   * Serializes this CRDT and all its children into a list of creation ops
   * with opIds. Used for forward operations that will be sent over the wire
   * immediately. Each op gets a unique opId for server acknowledgement.
   *
   * @internal
   */
  _toOpsWithOpId(parentId, parentKey, pool2) {
    return this._toOps(parentId, parentKey).map((op) => ({
      opId: pool2.generateOpId(),
      ...op
    }));
  }
  /** This caches the result of the last .toJSON() call for this Live node. */
  #cachedJson;
  #cachedTreeNodeKey;
  /** This caches the result of the last .toTreeNode() call for this Live node. */
  #cachedTreeNode;
  /**
   * @internal
   *
   * Clear the cached snapshots, so that the next call to `.toJSON()` will
   * recompute. Call this after every mutation to the Live node.
   */
  invalidate() {
    if (this.#cachedJson !== void 0 || this.#cachedTreeNode !== void 0) {
      this.#cachedJson = void 0;
      this.#cachedTreeNode = void 0;
      if (this.parent.type === "HasParent") {
        this.parent.node.invalidate();
      }
    }
  }
  /**
   * @internal
   * Return an snapshot of this Live tree for use in DevTools.
   */
  toTreeNode(key) {
    if (this.#cachedTreeNode === void 0 || this.#cachedTreeNodeKey !== key) {
      this.#cachedTreeNodeKey = key;
      this.#cachedTreeNode = this._toTreeNode(key);
    }
    return this.#cachedTreeNode;
  }
  /**
   * @private
   * Returns true if the cached JSON snapshot exists and is reference-equal
   * to the given value. Does not trigger a recompute.
   */
  hasCache(value) {
    return this.#cachedJson !== void 0 && this.#cachedJson === value;
  }
  /**
   * Return a JSON-compatible snapshot of this Live node and its children.
   * LiveObject values become plain objects, LiveList values become arrays,
   * and LiveMap values also become plain objects (not Map instances).
   * The result is cached and only recomputed when the contents change.
   */
  toJSON() {
    if (this.#cachedJson === void 0) {
      this.#cachedJson = this._toJSON();
    }
    return this.#cachedJson;
  }
};
var LiveRegister = class _LiveRegister extends AbstractCrdt {
  static {
    __name(this, "_LiveRegister");
  }
  #data;
  constructor(data) {
    super();
    this.#data = data;
  }
  get data() {
    return this.#data;
  }
  /** @internal */
  static _deserialize([id, item], _parentToChildren, pool2) {
    const register = new _LiveRegister(item.data);
    register._attach(id, pool2);
    return register;
  }
  /** @internal */
  _toOps(parentId, parentKey) {
    if (this._id === void 0) {
      throw new Error(
        "Cannot serialize register if parentId or parentKey is undefined"
      );
    }
    return [
      {
        type: OpCode.CREATE_REGISTER,
        id: this._id,
        parentId,
        parentKey,
        data: this.data
      }
    ];
  }
  /** @internal */
  _serialize() {
    if (this.parent.type !== "HasParent") {
      throw new Error("Cannot serialize LiveRegister if parent is missing");
    }
    return {
      type: CrdtType.REGISTER,
      parentId: nn(this.parent.node._id, "Parent node expected to have ID"),
      parentKey: this.parent.key,
      data: this.data
    };
  }
  /** @internal */
  _attachChild(_op) {
    throw new Error("Method not implemented.");
  }
  /** @internal */
  _detachChild(_crdt) {
    throw new Error("Method not implemented.");
  }
  /** @internal */
  _apply(op, isLocal) {
    return super._apply(op, isLocal);
  }
  /** @internal */
  _toTreeNode(key) {
    return {
      type: "Json",
      id: this._id ?? nanoid(),
      key,
      payload: this.#data
    };
  }
  /** @internal */
  _toJSON() {
    return this.#data;
  }
  clone() {
    return deepClone(this.data);
  }
};
function childNodeLt(a, b) {
  return a._parentPos < b._parentPos;
}
__name(childNodeLt, "childNodeLt");
var LiveList = class _LiveList extends AbstractCrdt {
  static {
    __name(this, "_LiveList");
  }
  #items;
  #implicitlyDeletedItems;
  #unacknowledgedSets;
  constructor(items) {
    super();
    this.#implicitlyDeletedItems = /* @__PURE__ */ new WeakSet();
    this.#unacknowledgedSets = /* @__PURE__ */ new Map();
    const nodes = [];
    let lastPos;
    for (const item of items) {
      const pos = makePosition(lastPos);
      const node = lsonToLiveNode(item);
      node._setParentLink(this, pos);
      nodes.push(node);
      lastPos = pos;
    }
    this.#items = SortedList.fromAlreadySorted(nodes, childNodeLt);
  }
  /** @internal */
  static _deserialize([id, _], parentToChildren, pool2) {
    const list = new _LiveList([]);
    list._attach(id, pool2);
    const children = parentToChildren.get(id);
    if (children === void 0) {
      return list;
    }
    for (const node of children) {
      const crdt = node[1];
      const child = deserialize(node, parentToChildren, pool2);
      child._setParentLink(list, crdt.parentKey);
      list.#insert(child);
    }
    return list;
  }
  /**
   * @internal
   * This function assumes that the resulting ops will be sent to the server if they have an 'opId'
   * so we mutate _unacknowledgedSets to avoid potential flickering
   * https://github.com/liveblocks/liveblocks/pull/1177
   *
   * This is quite unintuitive and should disappear as soon as
   * we introduce an explicit LiveList.Set operation
   */
  _toOps(parentId, parentKey) {
    if (this._id === void 0) {
      throw new Error("Cannot serialize item is not attached");
    }
    const ops = [];
    const op = {
      id: this._id,
      type: OpCode.CREATE_LIST,
      parentId,
      parentKey
    };
    ops.push(op);
    for (const item of this.#items) {
      const parentKey2 = item._getParentKeyOrThrow();
      const childOps = HACK_addIntentAndDeletedIdToOperation(
        item._toOps(this._id, parentKey2),
        void 0
      );
      for (const childOp of childOps) {
        ops.push(childOp);
      }
    }
    return ops;
  }
  /**
   * Inserts a new child into the list in the correct location (binary search
   * finds correct position efficiently). Returns the insertion index.
   */
  #insert(childNode) {
    const index = this.#items.add(childNode);
    this.invalidate();
    return index;
  }
  /**
   * Updates an item's position and repositions it in the sorted list.
   * Encapsulates the remove -> mutate -> add cycle needed when changing sort keys.
   *
   * IMPORTANT: Item must exist in this list. List count remains unchanged.
   */
  #updateItemPosition(item, newKey) {
    item._setParentLink(this, newKey);
    this.#items.reposition(item);
    this.invalidate();
  }
  /**
   * Updates an item's position by index. Safer than #updateItemPosition when you have
   * an index, as it ensures the item exists and is from this list.
   */
  #updateItemPositionAt(index, newKey) {
    const item = nn(this.#items.at(index));
    this.#updateItemPosition(item, newKey);
  }
  /** @internal */
  _indexOfPosition(position) {
    return this.#items.findIndex(
      (item) => item._getParentKeyOrThrow() === position
    );
  }
  /** @internal */
  _attach(id, pool2) {
    super._attach(id, pool2);
    for (const item of this.#items) {
      item._attach(pool2.generateId(), pool2);
    }
  }
  /** @internal */
  _detach() {
    super._detach();
    for (const item of this.#items) {
      item._detach();
    }
  }
  #applySetRemote(op) {
    if (this._pool === void 0) {
      throw new Error("Can't attach child if managed pool is not present");
    }
    const { id, parentKey: key } = op;
    const child = creationOpToLiveNode(op);
    child._attach(id, this._pool);
    child._setParentLink(this, key);
    const deletedId = op.deletedId;
    const indexOfItemWithSamePosition = this._indexOfPosition(key);
    if (indexOfItemWithSamePosition !== -1) {
      const itemWithSamePosition = nn(
        this.#items.removeAt(indexOfItemWithSamePosition)
      );
      if (itemWithSamePosition._id === deletedId) {
        itemWithSamePosition._detach();
        this.#items.add(child);
        return {
          modified: makeUpdate(this, [
            setDelta(indexOfItemWithSamePosition, child)
          ]),
          reverse: []
        };
      } else {
        this.#implicitlyDeletedItems.add(itemWithSamePosition);
        this.#items.remove(itemWithSamePosition);
        this.#items.add(child);
        const delta = [
          setDelta(indexOfItemWithSamePosition, child)
        ];
        const deleteDelta2 = this.#detachItemAssociatedToSetOperation(
          op.deletedId
        );
        if (deleteDelta2) {
          delta.push(deleteDelta2);
        }
        return {
          modified: makeUpdate(this, delta),
          reverse: []
        };
      }
    } else {
      const updates = [];
      const deleteDelta2 = this.#detachItemAssociatedToSetOperation(
        op.deletedId
      );
      if (deleteDelta2) {
        updates.push(deleteDelta2);
      }
      this.#insert(child);
      updates.push(insertDelta(this._indexOfPosition(key), child));
      return {
        reverse: [],
        modified: makeUpdate(this, updates)
      };
    }
  }
  #applySetAck(op) {
    if (this._pool === void 0) {
      throw new Error("Can't attach child if managed pool is not present");
    }
    const delta = [];
    const deletedDelta = this.#detachItemAssociatedToSetOperation(op.deletedId);
    if (deletedDelta) {
      delta.push(deletedDelta);
    }
    const unacknowledgedOpId = this.#unacknowledgedSets.get(op.parentKey);
    if (unacknowledgedOpId !== void 0) {
      if (unacknowledgedOpId !== op.opId) {
        return delta.length === 0 ? { modified: false } : { modified: makeUpdate(this, delta), reverse: [] };
      } else {
        this.#unacknowledgedSets.delete(op.parentKey);
      }
    }
    const indexOfItemWithSamePosition = this._indexOfPosition(op.parentKey);
    const existingItem = this.#items.find((item) => item._id === op.id);
    if (existingItem !== void 0) {
      if (existingItem._parentKey === op.parentKey) {
        return {
          modified: delta.length > 0 ? makeUpdate(this, delta) : false,
          reverse: []
        };
      }
      if (indexOfItemWithSamePosition !== -1) {
        const itemAtPosition = nn(
          this.#items.removeAt(indexOfItemWithSamePosition)
        );
        this.#implicitlyDeletedItems.add(itemAtPosition);
        delta.push(deleteDelta(indexOfItemWithSamePosition, itemAtPosition));
      }
      const prevIndex = this.#items.findIndex((item) => item === existingItem);
      this.#updateItemPosition(existingItem, op.parentKey);
      const newIndex = this.#items.findIndex((item) => item === existingItem);
      if (newIndex !== prevIndex) {
        delta.push(moveDelta(prevIndex, newIndex, existingItem));
      }
      return {
        modified: delta.length > 0 ? makeUpdate(this, delta) : false,
        reverse: []
      };
    } else {
      const orphan = this._pool.getNode(op.id);
      if (orphan && this.#implicitlyDeletedItems.has(orphan)) {
        orphan._setParentLink(this, op.parentKey);
        this.#implicitlyDeletedItems.delete(orphan);
        const recreatedItemIndex = this.#insert(orphan);
        return {
          modified: makeUpdate(this, [
            // If there is an item at this position, update is a set, else it's an insert
            indexOfItemWithSamePosition === -1 ? insertDelta(recreatedItemIndex, orphan) : setDelta(recreatedItemIndex, orphan),
            ...delta
          ]),
          reverse: []
        };
      } else {
        if (indexOfItemWithSamePosition !== -1) {
          const displaced = nn(
            this.#items.removeAt(indexOfItemWithSamePosition)
          );
          this.#implicitlyDeletedItems.add(displaced);
        }
        const { newItem, newIndex } = this.#createAttachItemAndSort(
          op,
          op.parentKey
        );
        return {
          modified: makeUpdate(this, [
            // If there is an item at this position, update is a set, else it's an insert
            indexOfItemWithSamePosition === -1 ? insertDelta(newIndex, newItem) : setDelta(newIndex, newItem),
            ...delta
          ]),
          reverse: []
        };
      }
    }
  }
  /**
   * Returns the update delta of the deletion or null
   */
  #detachItemAssociatedToSetOperation(deletedId) {
    if (deletedId === void 0 || this._pool === void 0) {
      return null;
    }
    const deletedItem = this._pool.getNode(deletedId);
    if (deletedItem === void 0) {
      return null;
    }
    const result = this._detachChild(deletedItem);
    if (result.modified === false) {
      return null;
    }
    return result.modified.updates[0];
  }
  #applyRemoteInsert(op) {
    if (this._pool === void 0) {
      throw new Error("Can't attach child if managed pool is not present");
    }
    const key = asPos(op.parentKey);
    const existingItemIndex = this._indexOfPosition(key);
    if (existingItemIndex !== -1) {
      this.#shiftItemPosition(existingItemIndex, key);
    }
    const { newItem, newIndex } = this.#createAttachItemAndSort(op, key);
    return {
      modified: makeUpdate(this, [insertDelta(newIndex, newItem)]),
      reverse: []
    };
  }
  #applyInsertAck(op) {
    const existingItem = this.#items.find((item) => item._id === op.id);
    const key = asPos(op.parentKey);
    const itemIndexAtPosition = this._indexOfPosition(key);
    if (existingItem) {
      if (existingItem._parentKey === key) {
        return {
          modified: false
        };
      } else {
        const oldPositionIndex = this.#items.findIndex(
          (item) => item === existingItem
        );
        if (itemIndexAtPosition !== -1) {
          this.#shiftItemPosition(itemIndexAtPosition, key);
        }
        this.#updateItemPosition(existingItem, key);
        const newIndex = this._indexOfPosition(key);
        if (newIndex === oldPositionIndex) {
          return { modified: false };
        }
        return {
          modified: makeUpdate(this, [
            moveDelta(oldPositionIndex, newIndex, existingItem)
          ]),
          reverse: []
        };
      }
    } else {
      const orphan = nn(this._pool).getNode(op.id);
      if (orphan && this.#implicitlyDeletedItems.has(orphan)) {
        orphan._setParentLink(this, key);
        this.#implicitlyDeletedItems.delete(orphan);
        this.#insert(orphan);
        const newIndex = this._indexOfPosition(key);
        return {
          modified: makeUpdate(this, [insertDelta(newIndex, orphan)]),
          reverse: []
        };
      } else {
        if (itemIndexAtPosition !== -1) {
          this.#shiftItemPosition(itemIndexAtPosition, key);
        }
        const { newItem, newIndex } = this.#createAttachItemAndSort(op, key);
        return {
          modified: makeUpdate(this, [insertDelta(newIndex, newItem)]),
          reverse: []
        };
      }
    }
  }
  #applyInsertUndoRedo(op) {
    const { id, parentKey: key } = op;
    const child = creationOpToLiveNode(op);
    if (this._pool?.getNode(id) !== void 0) {
      return { modified: false };
    }
    child._attach(id, nn(this._pool));
    child._setParentLink(this, key);
    const existingItemIndex = this._indexOfPosition(key);
    let newKey = key;
    if (existingItemIndex !== -1) {
      const before2 = this.#items.at(existingItemIndex)?._parentPos;
      const after2 = this.#items.at(existingItemIndex + 1)?._parentPos;
      newKey = makePosition(before2, after2);
      child._setParentLink(this, newKey);
    }
    this.#insert(child);
    const newIndex = this._indexOfPosition(newKey);
    return {
      modified: makeUpdate(this, [insertDelta(newIndex, child)]),
      reverse: [{ type: OpCode.DELETE_CRDT, id }]
    };
  }
  #applySetUndoRedo(op) {
    const { id, parentKey: key } = op;
    const child = creationOpToLiveNode(op);
    if (this._pool?.getNode(id) !== void 0) {
      return { modified: false };
    }
    this.#unacknowledgedSets.set(key, nn(op.opId));
    const indexOfItemWithSameKey = this._indexOfPosition(key);
    child._attach(id, nn(this._pool));
    child._setParentLink(this, key);
    const newKey = key;
    if (indexOfItemWithSameKey !== -1) {
      const existingItem = this.#items.at(indexOfItemWithSameKey);
      existingItem._detach();
      this.#items.remove(existingItem);
      this.#items.add(child);
      const reverse = HACK_addIntentAndDeletedIdToOperation(
        existingItem._toOps(nn(this._id), key),
        op.id
      );
      const delta = [setDelta(indexOfItemWithSameKey, child)];
      const deletedDelta = this.#detachItemAssociatedToSetOperation(
        op.deletedId
      );
      if (deletedDelta) {
        delta.push(deletedDelta);
      }
      return {
        modified: makeUpdate(this, delta),
        reverse
      };
    } else {
      this.#insert(child);
      this.#detachItemAssociatedToSetOperation(op.deletedId);
      const newIndex = this._indexOfPosition(newKey);
      return {
        reverse: [{ type: OpCode.DELETE_CRDT, id }],
        modified: makeUpdate(this, [insertDelta(newIndex, child)])
      };
    }
  }
  /** @internal */
  _attachChild(op, source) {
    if (this._pool === void 0) {
      throw new Error("Can't attach child if managed pool is not present");
    }
    let result;
    if (op.intent === "set") {
      if (source === 1) {
        result = this.#applySetRemote(op);
      } else if (source === 2) {
        result = this.#applySetAck(op);
      } else {
        result = this.#applySetUndoRedo(op);
      }
    } else {
      if (source === 1) {
        result = this.#applyRemoteInsert(op);
      } else if (source === 2) {
        result = this.#applyInsertAck(op);
      } else {
        result = this.#applyInsertUndoRedo(op);
      }
    }
    if (result.modified !== false) {
      this.invalidate();
    }
    return result;
  }
  /** @internal */
  _detachChild(child) {
    if (child) {
      const parentKey = nn(child._parentKey);
      const reverse = child._toOps(nn(this._id), parentKey);
      const indexToDelete = this.#items.findIndex((item) => item === child);
      if (indexToDelete === -1) {
        return {
          modified: false
        };
      }
      const previousNode = this.#items.at(indexToDelete);
      this.#items.remove(child);
      this.invalidate();
      child._detach();
      return {
        modified: makeUpdate(this, [deleteDelta(indexToDelete, previousNode)]),
        reverse
      };
    }
    return { modified: false };
  }
  #applySetChildKeyRemote(newKey, child) {
    if (this.#implicitlyDeletedItems.has(child)) {
      this.#implicitlyDeletedItems.delete(child);
      child._setParentLink(this, newKey);
      const newIndex = this.#insert(child);
      return {
        modified: makeUpdate(this, [insertDelta(newIndex, child)]),
        reverse: []
      };
    }
    const previousKey = child._parentKey;
    if (newKey === previousKey) {
      return {
        modified: false
      };
    }
    const existingItemIndex = this._indexOfPosition(newKey);
    if (existingItemIndex === -1) {
      const previousIndex = this.#items.findIndex((item) => item === child);
      this.#updateItemPosition(child, newKey);
      const newIndex = this.#items.findIndex((item) => item === child);
      if (newIndex === previousIndex) {
        return {
          modified: false
        };
      }
      return {
        modified: makeUpdate(this, [moveDelta(previousIndex, newIndex, child)]),
        reverse: []
      };
    } else {
      this.#updateItemPositionAt(
        existingItemIndex,
        makePosition(newKey, this.#items.at(existingItemIndex + 1)?._parentPos)
      );
      const previousIndex = this.#items.findIndex((item) => item === child);
      this.#updateItemPosition(child, newKey);
      const newIndex = this.#items.findIndex((item) => item === child);
      if (newIndex === previousIndex) {
        return {
          modified: false
        };
      }
      return {
        modified: makeUpdate(this, [moveDelta(previousIndex, newIndex, child)]),
        reverse: []
      };
    }
  }
  #applySetChildKeyAck(newKey, child) {
    const previousKey = nn(child._parentKey);
    if (this.#implicitlyDeletedItems.has(child)) {
      const existingItemIndex = this._indexOfPosition(newKey);
      this.#implicitlyDeletedItems.delete(child);
      if (existingItemIndex !== -1) {
        const existingItem = this.#items.at(existingItemIndex);
        existingItem._setParentLink(
          this,
          makePosition(
            newKey,
            this.#items.at(existingItemIndex + 1)?._parentPos
          )
        );
        this.#items.reposition(existingItem);
      }
      child._setParentLink(this, newKey);
      const newIndex = this.#insert(child);
      return {
        modified: makeUpdate(this, [insertDelta(newIndex, child)]),
        reverse: []
      };
    } else {
      if (newKey === previousKey) {
        return {
          modified: false
        };
      }
      const previousIndex = this.#items.findIndex((item) => item === child);
      const existingItemIndex = this._indexOfPosition(newKey);
      if (existingItemIndex !== -1) {
        this.#updateItemPositionAt(
          existingItemIndex,
          makePosition(
            newKey,
            this.#items.at(existingItemIndex + 1)?._parentPos
          )
        );
      }
      this.#updateItemPosition(child, newKey);
      const newIndex = this.#items.findIndex((item) => item === child);
      if (previousIndex === newIndex) {
        return {
          modified: false
        };
      } else {
        return {
          modified: makeUpdate(this, [
            moveDelta(previousIndex, newIndex, child)
          ]),
          reverse: []
        };
      }
    }
  }
  #applySetChildKeyUndoRedo(newKey, child) {
    const previousKey = nn(child._parentKey);
    const previousIndex = this.#items.findIndex((item) => item === child);
    const existingItemIndex = this._indexOfPosition(newKey);
    let actualNewKey = newKey;
    if (existingItemIndex !== -1) {
      actualNewKey = makePosition(
        newKey,
        this.#items.at(existingItemIndex + 1)?._parentPos
      );
    }
    this.#updateItemPosition(child, actualNewKey);
    const newIndex = this.#items.findIndex((item) => item === child);
    if (previousIndex === newIndex) {
      return {
        modified: false
      };
    }
    return {
      modified: makeUpdate(this, [moveDelta(previousIndex, newIndex, child)]),
      reverse: [
        {
          type: OpCode.SET_PARENT_KEY,
          id: nn(child._id),
          parentKey: previousKey
        }
      ]
    };
  }
  /** @internal */
  _setChildKey(newKey, child, source) {
    if (source === 1) {
      return this.#applySetChildKeyRemote(newKey, child);
    } else if (source === 2) {
      return this.#applySetChildKeyAck(newKey, child);
    } else {
      return this.#applySetChildKeyUndoRedo(newKey, child);
    }
  }
  /** @internal */
  _apply(op, isLocal) {
    return super._apply(op, isLocal);
  }
  /** @internal */
  _serialize() {
    if (this.parent.type !== "HasParent") {
      throw new Error("Cannot serialize LiveList if parent is missing");
    }
    return {
      type: CrdtType.LIST,
      parentId: nn(this.parent.node._id, "Parent node expected to have ID"),
      parentKey: this.parent.key
    };
  }
  /**
   * Returns the number of elements.
   */
  get length() {
    return this.#items.length;
  }
  /**
   * Adds one element to the end of the LiveList.
   * @param element The element to add to the end of the LiveList.
   */
  push(element) {
    this._pool?.assertStorageIsWritable();
    return this.insert(element, this.length);
  }
  /**
   * Inserts one element at a specified index.
   * @param element The element to insert.
   * @param index The index at which you want to insert the element.
   */
  insert(element, index) {
    this._pool?.assertStorageIsWritable();
    if (index < 0 || index > this.#items.length) {
      throw new Error(
        `Cannot insert list item at index "${index}". index should be between 0 and ${this.#items.length}`
      );
    }
    const before2 = this.#items.at(index - 1)?._parentPos;
    const after2 = this.#items.at(index)?._parentPos;
    const position = makePosition(before2, after2);
    const value = lsonToLiveNode(element);
    value._setParentLink(this, position);
    this.#insert(value);
    if (this._pool && this._id) {
      const id = this._pool.generateId();
      value._attach(id, this._pool);
      this._pool.dispatch(
        value._toOpsWithOpId(this._id, position, this._pool),
        [{ type: OpCode.DELETE_CRDT, id }],
        /* @__PURE__ */ new Map([
          [this._id, makeUpdate(this, [insertDelta(index, value)])]
        ])
      );
    }
  }
  /**
   * Move one element from one index to another.
   * @param index The index of the element to move
   * @param targetIndex The index where the element should be after moving.
   */
  move(index, targetIndex) {
    this._pool?.assertStorageIsWritable();
    if (targetIndex < 0) {
      throw new Error("targetIndex cannot be less than 0");
    }
    if (targetIndex >= this.#items.length) {
      throw new Error(
        "targetIndex cannot be greater or equal than the list length"
      );
    }
    if (index < 0) {
      throw new Error("index cannot be less than 0");
    }
    if (index >= this.#items.length) {
      throw new Error("index cannot be greater or equal than the list length");
    }
    let beforePosition = null;
    let afterPosition = null;
    if (index < targetIndex) {
      afterPosition = targetIndex === this.#items.length - 1 ? void 0 : this.#items.at(targetIndex + 1)?._parentPos;
      beforePosition = this.#items.at(targetIndex)._parentPos;
    } else {
      afterPosition = this.#items.at(targetIndex)._parentPos;
      beforePosition = targetIndex === 0 ? void 0 : this.#items.at(targetIndex - 1)?._parentPos;
    }
    const position = makePosition(beforePosition, afterPosition);
    const item = this.#items.at(index);
    const previousPosition = item._getParentKeyOrThrow();
    this.#updateItemPositionAt(index, position);
    if (this._pool && this._id) {
      const storageUpdates = /* @__PURE__ */ new Map([
        [this._id, makeUpdate(this, [moveDelta(index, targetIndex, item)])]
      ]);
      this._pool.dispatch(
        [
          {
            type: OpCode.SET_PARENT_KEY,
            id: nn(item._id),
            opId: this._pool.generateOpId(),
            parentKey: position
          }
        ],
        [
          {
            type: OpCode.SET_PARENT_KEY,
            id: nn(item._id),
            parentKey: previousPosition
          }
        ],
        storageUpdates
      );
    }
  }
  /**
   * Deletes an element at the specified index
   * @param index The index of the element to delete
   */
  delete(index) {
    this._pool?.assertStorageIsWritable();
    if (index < 0 || index >= this.#items.length) {
      throw new Error(
        `Cannot delete list item at index "${index}". index should be between 0 and ${this.#items.length - 1}`
      );
    }
    const item = this.#items.at(index);
    item._detach();
    this.#items.remove(item);
    this.invalidate();
    if (this._pool) {
      const childRecordId = item._id;
      if (childRecordId) {
        const storageUpdates = /* @__PURE__ */ new Map();
        storageUpdates.set(
          nn(this._id),
          makeUpdate(this, [deleteDelta(index, item)])
        );
        this._pool.dispatch(
          [
            {
              id: childRecordId,
              opId: this._pool.generateOpId(),
              type: OpCode.DELETE_CRDT
            }
          ],
          item._toOps(nn(this._id), item._getParentKeyOrThrow()),
          storageUpdates
        );
      }
    }
  }
  clear() {
    this._pool?.assertStorageIsWritable();
    if (this._pool) {
      const ops = [];
      const reverseOps = [];
      const updateDelta = [];
      for (const item of this.#items) {
        item._detach();
        const childId = item._id;
        if (childId) {
          ops.push({
            type: OpCode.DELETE_CRDT,
            id: childId,
            opId: this._pool.generateOpId()
          });
          reverseOps.push(
            ...item._toOps(nn(this._id), item._getParentKeyOrThrow())
          );
          updateDelta.push(deleteDelta(0, item));
        }
      }
      this.#items.clear();
      this.invalidate();
      const storageUpdates = /* @__PURE__ */ new Map();
      storageUpdates.set(nn(this._id), makeUpdate(this, updateDelta));
      this._pool.dispatch(ops, reverseOps, storageUpdates);
    } else {
      for (const item of this.#items) {
        item._detach();
      }
      this.#items.clear();
      this.invalidate();
    }
  }
  set(index, item) {
    this._pool?.assertStorageIsWritable();
    if (index < 0 || index >= this.#items.length) {
      throw new Error(
        `Cannot set list item at index "${index}". index should be between 0 and ${this.#items.length - 1}`
      );
    }
    const existingItem = this.#items.at(index);
    const position = existingItem._getParentKeyOrThrow();
    const existingId = existingItem._id;
    existingItem._detach();
    const value = lsonToLiveNode(item);
    value._setParentLink(this, position);
    this.#items.remove(existingItem);
    this.#items.add(value);
    this.invalidate();
    if (this._pool && this._id) {
      const id = this._pool.generateId();
      value._attach(id, this._pool);
      const storageUpdates = /* @__PURE__ */ new Map();
      storageUpdates.set(this._id, makeUpdate(this, [setDelta(index, value)]));
      const ops = HACK_addIntentAndDeletedIdToOperation(
        value._toOpsWithOpId(this._id, position, this._pool),
        existingId
      );
      this.#unacknowledgedSets.set(position, nn(ops[0].opId));
      const reverseOps = HACK_addIntentAndDeletedIdToOperation(
        existingItem._toOps(this._id, position),
        id
      );
      this._pool.dispatch(ops, reverseOps, storageUpdates);
    }
  }
  #unwrap(node) {
    return liveNodeToLson(node);
  }
  /**
   * Tests whether all elements pass the test implemented by the provided function.
   * @param predicate Function to test for each element, taking two arguments (the element and its index).
   * @returns true if the predicate function returns a truthy value for every element. Otherwise, false.
   */
  every(predicate) {
    return this.#items.rawArray.every(
      (node, i) => predicate(this.#unwrap(node), i)
    );
  }
  /**
   * Creates an array with all elements that pass the test implemented by the provided function.
   * @param predicate Function to test each element of the LiveList. Return a value that coerces to true to keep the element, or to false otherwise.
   * @returns An array with the elements that pass the test.
   */
  filter(predicate) {
    const result = [];
    this.#items.rawArray.forEach((node, i) => {
      const item = this.#unwrap(node);
      if (predicate(item, i)) result.push(item);
    });
    return result;
  }
  /**
   * Returns the first element that satisfies the provided testing function.
   * @param predicate Function to execute on each value.
   * @returns The value of the first element in the LiveList that satisfies the provided testing function. Otherwise, undefined is returned.
   */
  find(predicate) {
    for (const [i, node] of this.#items.rawArray.entries()) {
      const item = this.#unwrap(node);
      if (predicate(item, i)) return item;
    }
    return void 0;
  }
  /**
   * Returns the index of the first element in the LiveList that satisfies the provided testing function.
   * @param predicate Function to execute on each value until the function returns true, indicating that the satisfying element was found.
   * @returns The index of the first element in the LiveList that passes the test. Otherwise, -1.
   */
  findIndex(predicate) {
    return this.#items.rawArray.findIndex(
      (node, i) => predicate(this.#unwrap(node), i)
    );
  }
  /**
   * Executes a provided function once for each element.
   * @param callbackfn Function to execute on each element.
   */
  forEach(callbackfn) {
    this.#items.rawArray.forEach(
      (node, i) => callbackfn(this.#unwrap(node), i)
    );
  }
  /**
   * Get the element at the specified index.
   * @param index The index on the element to get.
   * @returns The element at the specified index or undefined.
   */
  get(index) {
    const item = this.#items.at(index);
    return item !== void 0 ? this.#unwrap(item) : void 0;
  }
  /**
   * Returns the first index at which a given element can be found in the LiveList, or -1 if it is not present.
   * @param searchElement Element to locate.
   * @param fromIndex The index to start the search at.
   * @returns The first index of the element in the LiveList; -1 if not found.
   */
  indexOf(searchElement, fromIndex) {
    return this.#items.rawArray.findIndex(
      (node, i) => i >= (fromIndex ?? 0) && this.#unwrap(node) === searchElement
    );
  }
  /**
   * Returns the last index at which a given element can be found in the LiveList, or -1 if it is not present. The LiveList is searched backwards, starting at fromIndex.
   * @param searchElement Element to locate.
   * @param fromIndex The index at which to start searching backwards.
   * @returns The last index of the element in the LiveList; -1 if not found.
   */
  lastIndexOf(searchElement, fromIndex) {
    const arr = this.#items.rawArray;
    for (let i = fromIndex ?? arr.length - 1; i >= 0; i--) {
      if (this.#unwrap(arr[i]) === searchElement) return i;
    }
    return -1;
  }
  /**
   * Creates an array populated with the results of calling a provided function on every element.
   * @param callback Function that is called for every element.
   * @returns An array with each element being the result of the callback function.
   */
  map(callback) {
    return this.#items.rawArray.map(
      (node, i) => callback(this.#unwrap(node), i)
    );
  }
  /**
   * Tests whether at least one element in the LiveList passes the test implemented by the provided function.
   * @param predicate Function to test for each element.
   * @returns true if the callback function returns a truthy value for at least one element. Otherwise, false.
   */
  some(predicate) {
    return this.#items.rawArray.some(
      (node, i) => predicate(this.#unwrap(node), i)
    );
  }
  *[Symbol.iterator]() {
    for (const node of this.#items) {
      yield this.#unwrap(node);
    }
  }
  #createAttachItemAndSort(op, key) {
    const newItem = creationOpToLiveNode(op);
    newItem._attach(op.id, nn(this._pool));
    newItem._setParentLink(this, key);
    this.#insert(newItem);
    const newIndex = this._indexOfPosition(key);
    return { newItem, newIndex };
  }
  #shiftItemPosition(index, key) {
    const shiftedPosition = makePosition(
      key,
      this.#items.length > index + 1 ? this.#items.at(index + 1)?._parentPos : void 0
    );
    this.#updateItemPositionAt(index, shiftedPosition);
  }
  /** @internal */
  _toTreeNode(key) {
    const payload = [];
    let index = 0;
    for (const item of this.#items) {
      payload.push(item.toTreeNode(index.toString()));
      index++;
    }
    return {
      type: "LiveList",
      id: this._id ?? nanoid(),
      key,
      payload
    };
  }
  toJSON() {
    return super.toJSON();
  }
  /** @internal */
  _toJSON() {
    const result = Array.from(this.#items, (node) => node.toJSON());
    return freeze(result);
  }
  clone() {
    return new _LiveList(
      Array.from(this.#items, (item) => item.clone())
    );
  }
};
function makeUpdate(liveList, deltaUpdates) {
  return {
    node: liveList,
    type: "LiveList",
    updates: deltaUpdates
  };
}
__name(makeUpdate, "makeUpdate");
function setDelta(index, item) {
  return {
    index,
    type: "set",
    item: item instanceof LiveRegister ? item.data : item
  };
}
__name(setDelta, "setDelta");
function deleteDelta(index, deletedNode) {
  return {
    type: "delete",
    index,
    deletedItem: deletedNode instanceof LiveRegister ? deletedNode.data : deletedNode
  };
}
__name(deleteDelta, "deleteDelta");
function insertDelta(index, item) {
  return {
    index,
    type: "insert",
    item: item instanceof LiveRegister ? item.data : item
  };
}
__name(insertDelta, "insertDelta");
function moveDelta(previousIndex, index, item) {
  return {
    type: "move",
    index,
    item: item instanceof LiveRegister ? item.data : item,
    previousIndex
  };
}
__name(moveDelta, "moveDelta");
function HACK_addIntentAndDeletedIdToOperation(ops, deletedId) {
  return ops.map((op, index) => {
    if (index === 0) {
      const firstOp = op;
      return {
        ...firstOp,
        intent: "set",
        deletedId
      };
    } else {
      return op;
    }
  });
}
__name(HACK_addIntentAndDeletedIdToOperation, "HACK_addIntentAndDeletedIdToOperation");
var LiveMap = class _LiveMap extends AbstractCrdt {
  static {
    __name(this, "_LiveMap");
  }
  #map;
  #unacknowledgedSet;
  constructor(entries2) {
    super();
    this.#unacknowledgedSet = /* @__PURE__ */ new Map();
    if (entries2) {
      const mappedEntries = [];
      for (const [key, value] of entries2) {
        const node = lsonToLiveNode(value);
        node._setParentLink(this, key);
        mappedEntries.push([key, node]);
      }
      this.#map = new Map(mappedEntries);
    } else {
      this.#map = /* @__PURE__ */ new Map();
    }
  }
  /** @internal */
  _toOps(parentId, parentKey) {
    if (this._id === void 0) {
      throw new Error("Cannot serialize item is not attached");
    }
    const ops = [];
    const op = {
      id: this._id,
      type: OpCode.CREATE_MAP,
      parentId,
      parentKey
    };
    ops.push(op);
    for (const [key, value] of this.#map) {
      for (const childOp of value._toOps(this._id, key)) {
        ops.push(childOp);
      }
    }
    return ops;
  }
  /** @internal */
  static _deserialize([id, _item], parentToChildren, pool2) {
    const map = new _LiveMap();
    map._attach(id, pool2);
    const children = parentToChildren.get(id);
    if (children === void 0) {
      return map;
    }
    for (const node of children) {
      const crdt = node[1];
      const child = deserialize(node, parentToChildren, pool2);
      child._setParentLink(map, crdt.parentKey);
      map.#map.set(crdt.parentKey, child);
      map.invalidate();
    }
    return map;
  }
  /** @internal */
  _attach(id, pool2) {
    super._attach(id, pool2);
    for (const [_key, value] of this.#map) {
      if (isLiveNode(value)) {
        value._attach(pool2.generateId(), pool2);
      }
    }
  }
  /** @internal */
  _attachChild(op, source) {
    if (this._pool === void 0) {
      throw new Error("Can't attach child if managed pool is not present");
    }
    const { id, parentKey, opId } = op;
    const key = parentKey;
    const child = creationOpToLiveNode(op);
    if (this._pool.getNode(id) !== void 0) {
      return { modified: false };
    }
    if (source === 2) {
      const lastUpdateOpId = this.#unacknowledgedSet.get(key);
      if (lastUpdateOpId === opId) {
        this.#unacknowledgedSet.delete(key);
        return { modified: false };
      } else if (lastUpdateOpId !== void 0) {
        return { modified: false };
      }
    } else if (source === 1) {
      this.#unacknowledgedSet.delete(key);
    }
    const previousValue = this.#map.get(key);
    let reverse;
    if (previousValue) {
      const thisId = nn(this._id);
      reverse = previousValue._toOps(thisId, key);
      previousValue._detach();
    } else {
      reverse = [{ type: OpCode.DELETE_CRDT, id }];
    }
    child._setParentLink(this, key);
    child._attach(id, this._pool);
    this.#map.set(key, child);
    this.invalidate();
    return {
      modified: {
        node: this,
        type: "LiveMap",
        updates: { [key]: { type: "update" } }
      },
      reverse
    };
  }
  /** @internal */
  _detach() {
    super._detach();
    for (const item of this.#map.values()) {
      item._detach();
    }
  }
  /** @internal */
  _detachChild(child) {
    const id = nn(this._id);
    const parentKey = nn(child._parentKey);
    const reverse = child._toOps(id, parentKey);
    for (const [key, value] of this.#map) {
      if (value === child) {
        this.#map.delete(key);
        this.invalidate();
      }
    }
    child._detach();
    const storageUpdate = {
      node: this,
      type: "LiveMap",
      updates: {
        [parentKey]: {
          type: "delete",
          deletedItem: liveNodeToLson(child)
        }
      }
    };
    return { modified: storageUpdate, reverse };
  }
  /** @internal */
  _serialize() {
    if (this.parent.type !== "HasParent") {
      throw new Error("Cannot serialize LiveMap if parent is missing");
    }
    return {
      type: CrdtType.MAP,
      parentId: nn(this.parent.node._id, "Parent node expected to have ID"),
      parentKey: this.parent.key
    };
  }
  /**
   * Returns a specified element from the LiveMap.
   * @param key The key of the element to return.
   * @returns The element associated with the specified key, or undefined if the key can't be found in the LiveMap.
   */
  get(key) {
    const value = this.#map.get(key);
    if (value === void 0) {
      return void 0;
    }
    return liveNodeToLson(value);
  }
  /**
   * Adds or updates an element with a specified key and a value.
   * @param key The key of the element to add. Should be a string.
   * @param value The value of the element to add. Should be serializable to JSON.
   */
  set(key, value) {
    this._pool?.assertStorageIsWritable();
    const oldValue = this.#map.get(key);
    if (oldValue) {
      oldValue._detach();
    }
    const item = lsonToLiveNode(value);
    item._setParentLink(this, key);
    this.#map.set(key, item);
    this.invalidate();
    if (this._pool && this._id) {
      const id = this._pool.generateId();
      item._attach(id, this._pool);
      const storageUpdates = /* @__PURE__ */ new Map();
      storageUpdates.set(this._id, {
        node: this,
        type: "LiveMap",
        updates: { [key]: { type: "update" } }
      });
      const ops = item._toOpsWithOpId(this._id, key, this._pool);
      this.#unacknowledgedSet.set(key, nn(ops[0].opId));
      this._pool.dispatch(
        ops,
        oldValue ? oldValue._toOps(this._id, key) : [{ type: OpCode.DELETE_CRDT, id }],
        storageUpdates
      );
    }
  }
  /**
   * Returns the number of elements in the LiveMap.
   */
  get size() {
    return this.#map.size;
  }
  /**
   * Returns a boolean indicating whether an element with the specified key exists or not.
   * @param key The key of the element to test for presence.
   */
  has(key) {
    return this.#map.has(key);
  }
  /**
   * Removes the specified element by key.
   * @param key The key of the element to remove.
   * @returns true if an element existed and has been removed, or false if the element does not exist.
   */
  delete(key) {
    this._pool?.assertStorageIsWritable();
    const item = this.#map.get(key);
    if (item === void 0) {
      return false;
    }
    item._detach();
    this.#map.delete(key);
    this.invalidate();
    if (this._pool && item._id) {
      const thisId = nn(this._id);
      const storageUpdates = /* @__PURE__ */ new Map();
      storageUpdates.set(thisId, {
        node: this,
        type: "LiveMap",
        updates: {
          [key]: {
            type: "delete",
            deletedItem: liveNodeToLson(item)
          }
        }
      });
      this._pool.dispatch(
        [
          {
            type: OpCode.DELETE_CRDT,
            id: item._id,
            opId: this._pool.generateOpId()
          }
        ],
        item._toOps(thisId, key),
        storageUpdates
      );
    }
    return true;
  }
  /**
   * Returns a new Iterator object that contains the [key, value] pairs for each element.
   */
  entries() {
    const innerIterator = this.#map.entries();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        const iteratorValue = innerIterator.next();
        if (iteratorValue.done) {
          return {
            done: true,
            value: void 0
          };
        }
        const entry = iteratorValue.value;
        const key = entry[0];
        const value = liveNodeToLson(iteratorValue.value[1]);
        return {
          value: [key, value]
        };
      }
    };
  }
  /**
   * Same function object as the initial value of the entries method.
   */
  [Symbol.iterator]() {
    return this.entries();
  }
  /**
   * Returns a new Iterator object that contains the keys for each element.
   */
  keys() {
    return this.#map.keys();
  }
  /**
   * Returns a new Iterator object that contains the values for each element.
   */
  values() {
    const innerIterator = this.#map.values();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        const iteratorValue = innerIterator.next();
        if (iteratorValue.done) {
          return {
            done: true,
            value: void 0
          };
        }
        const value = liveNodeToLson(iteratorValue.value);
        return { value };
      }
    };
  }
  /**
   * Executes a provided function once per each key/value pair in the Map object, in insertion order.
   * @param callback Function to execute for each entry in the map.
   */
  forEach(callback) {
    for (const entry of this) {
      callback(entry[1], entry[0], this);
    }
  }
  /** @internal */
  _toTreeNode(key) {
    return {
      type: "LiveMap",
      id: this._id ?? nanoid(),
      key,
      payload: Array.from(this.#map.entries()).map(
        ([key2, val]) => val.toTreeNode(key2)
      )
    };
  }
  toJSON() {
    return super.toJSON();
  }
  /** @internal */
  _toJSON() {
    const result = {};
    for (const [key, value] of this.#map) {
      result[key] = value.toJSON();
    }
    return freeze(result);
  }
  clone() {
    return new _LiveMap(
      Array.from(this.#map).map(([key, node]) => [key, node.clone()])
    );
  }
};
function deepLiveify(value, config) {
  if (Array.isArray(value)) {
    return new LiveList(value.map((v) => deepLiveify(v, config)));
  } else if (isPlainObject(value)) {
    const init = {};
    const locals = {};
    for (const key in value) {
      const val = value[key];
      if (val === void 0) {
        continue;
      }
      const subConfig = isPlainObject(config) ? config[key] : config;
      if (subConfig === false) {
        locals[key] = val;
      } else if (subConfig === "atomic") {
        init[key] = val;
      } else {
        init[key] = deepLiveify(val, subConfig);
      }
    }
    const lo = new LiveObject(init);
    for (const key in locals) {
      lo.setLocal(key, locals[key]);
    }
    return lo;
  } else {
    return value;
  }
}
__name(deepLiveify, "deepLiveify");
function reconcile(live, json, config) {
  if (isLiveObject(live) && isPlainObject(json)) {
    return reconcileLiveObject(live, json, "full", config);
  } else if (isLiveList(live) && Array.isArray(json)) {
    return reconcileLiveList(live, json, config);
  } else if (isLiveMap(live) && isPlainObject(json)) {
    return reconcileLiveMap(live, config);
  } else {
    return deepLiveify(json, config);
  }
}
__name(reconcile, "reconcile");
function reconcileLiveMap(_liveMap, _config) {
  throw new Error("Reconciling a LiveMap is not supported yet");
}
__name(reconcileLiveMap, "reconcileLiveMap");
function reconcileLiveObject(liveObj, jsonObj, extent, config) {
  const currentKeys = liveObj.keys();
  for (const key in jsonObj) {
    currentKeys.delete(key);
    const newVal = jsonObj[key];
    if (newVal === void 0) {
      if (extent === "full") {
        liveObj.delete(key);
      }
      continue;
    }
    const subConfig = isPlainObject(config) ? config[key] : config;
    if (subConfig === false) {
      liveObj.setLocal(key, newVal);
    } else if (subConfig === "atomic") {
      const curVal = liveObj.get(key);
      if (curVal !== newVal) {
        liveObj.set(key, newVal);
      }
    } else {
      const curVal = liveObj.get(key);
      if (curVal === void 0) {
        liveObj.set(key, deepLiveify(newVal, subConfig));
      } else if (isLiveStructure(curVal)) {
        const next = reconcile(curVal, newVal, subConfig);
        if (next !== curVal) {
          liveObj.set(key, next);
        }
      } else if (curVal !== newVal) {
        liveObj.set(key, deepLiveify(newVal, subConfig));
      }
    }
  }
  if (extent === "full") {
    for (const key of currentKeys) {
      liveObj.delete(key);
    }
  }
  return liveObj;
}
__name(reconcileLiveObject, "reconcileLiveObject");
function reconcileLiveList(liveList, jsonArr, config) {
  const curLen = liveList.length;
  const newLen = jsonArr.length;
  for (let i = 0; i < Math.min(curLen, newLen); i++) {
    const curVal = liveList.get(i);
    const newVal = jsonArr[i];
    if (isLiveStructure(curVal)) {
      const next = reconcile(curVal, newVal, config);
      if (next !== curVal) {
        liveList.set(i, next);
      }
    } else if (curVal !== newVal) {
      liveList.set(i, deepLiveify(newVal, config));
    }
  }
  for (let i = curLen; i < newLen; i++) {
    liveList.push(deepLiveify(jsonArr[i], config));
  }
  for (let i = curLen - 1; i >= newLen; i--) {
    liveList.delete(i);
  }
  return liveList;
}
__name(reconcileLiveList, "reconcileLiveList");
var MAX_LIVE_OBJECT_SIZE = 128 * 1024;
var LiveObject = class _LiveObject extends AbstractCrdt {
  static {
    __name(this, "_LiveObject");
  }
  #synced;
  #local = /* @__PURE__ */ new Map();
  /**
   * Tracks unacknowledged local changes per property to preserve optimistic
   * updates. Maps property keys to their pending operation IDs.
   *
   * INVARIANT: Only locally-generated opIds are ever stored here. Remote opIds
   * are only compared against (to detect ACKs), never stored.
   *
   * When a local change is made, the opId is stored here. When a remote op
   * arrives for the same key:
   * - If no entry exists → apply remote op
   * - If opId matches → it's an ACK, clear the entry
   * - If opId differs → ignore remote op to preserve optimistic update
   */
  #unackedOpsByKey;
  /**
   * Enable or disable detection of too large LiveObjects.
   * When enabled, throws an error if LiveObject static data exceeds 128KB, which
   * is the maximum value the server will be able to accept.
   * By default, this behavior is disabled to avoid the runtime performance
   * overhead on every LiveObject.set() or LiveObject.update() call.
   *
   * @experimental
   */
  static detectLargeObjects = false;
  static #buildRootAndParentToChildren(nodes) {
    const parentToChildren = /* @__PURE__ */ new Map();
    let root = null;
    for (const node of nodes) {
      if (isRootStorageNode(node)) {
        root = node[1];
      } else {
        const crdt = node[1];
        const children = parentToChildren.get(crdt.parentId);
        if (children !== void 0) {
          children.push(node);
        } else {
          parentToChildren.set(crdt.parentId, [node]);
        }
      }
    }
    if (root === null) {
      throw new Error("Root can't be null");
    }
    return [root, parentToChildren];
  }
  /** @private Do not use this API directly */
  static _fromItems(nodes, pool2) {
    const [root, parentToChildren] = _LiveObject.#buildRootAndParentToChildren(nodes);
    return _LiveObject._deserialize(
      ["root", root],
      parentToChildren,
      pool2
    );
  }
  constructor(obj = {}) {
    super();
    this.#unackedOpsByKey = /* @__PURE__ */ new Map();
    const o = compactObject(obj);
    for (const key of Object.keys(o)) {
      const value = o[key];
      if (isLiveNode(value)) {
        value._setParentLink(this, key);
      }
    }
    this.#synced = new Map(Object.entries(o));
  }
  /** @internal */
  _toOps(parentId, parentKey) {
    if (this._id === void 0) {
      throw new Error("Cannot serialize item is not attached");
    }
    const ops = [];
    const op = {
      type: OpCode.CREATE_OBJECT,
      id: this._id,
      parentId,
      parentKey,
      data: {}
    };
    ops.push(op);
    for (const [key, value] of this.#synced) {
      if (isLiveNode(value)) {
        for (const childOp of value._toOps(this._id, key)) {
          ops.push(childOp);
        }
      } else {
        op.data[key] = value;
      }
    }
    return ops;
  }
  /** @internal */
  static _deserialize([id, item], parentToChildren, pool2) {
    const liveObj = new _LiveObject(item.data);
    liveObj._attach(id, pool2);
    return this._deserializeChildren(liveObj, parentToChildren, pool2);
  }
  /** @internal */
  static _deserializeChildren(liveObj, parentToChildren, pool2) {
    const children = parentToChildren.get(nn(liveObj._id));
    if (children === void 0) {
      return liveObj;
    }
    for (const node of children) {
      const child = deserializeToLson(node, parentToChildren, pool2);
      const crdt = node[1];
      if (isLiveStructure(child)) {
        child._setParentLink(liveObj, crdt.parentKey);
      }
      liveObj.#synced.set(crdt.parentKey, child);
      liveObj.invalidate();
    }
    return liveObj;
  }
  /** @internal */
  _attach(id, pool2) {
    super._attach(id, pool2);
    for (const [_key, value] of this.#synced) {
      if (isLiveNode(value)) {
        value._attach(pool2.generateId(), pool2);
      }
    }
  }
  /** @internal */
  _attachChild(op, source) {
    if (this._pool === void 0) {
      throw new Error("Can't attach child if managed pool is not present");
    }
    const { id, opId, parentKey: key } = op;
    const child = creationOpToLson(op);
    if (this._pool.getNode(id) !== void 0) {
      if (this.#unackedOpsByKey.get(key) === opId) {
        this.#unackedOpsByKey.delete(key);
      }
      return { modified: false };
    }
    if (source === 0) {
      this.#unackedOpsByKey.set(key, nn(opId));
    } else if (this.#unackedOpsByKey.get(key) === void 0) {
    } else if (this.#unackedOpsByKey.get(key) === opId) {
      this.#unackedOpsByKey.delete(key);
      return { modified: false };
    } else {
      return { modified: false };
    }
    const thisId = nn(this._id);
    const previousValue = this.#synced.get(key);
    let reverse;
    if (isLiveNode(previousValue)) {
      reverse = previousValue._toOps(thisId, key);
      previousValue._detach();
    } else if (previousValue === void 0) {
      reverse = [{ type: OpCode.DELETE_OBJECT_KEY, id: thisId, key }];
    } else {
      reverse = [
        {
          type: OpCode.UPDATE_OBJECT,
          id: thisId,
          data: { [key]: previousValue }
        }
      ];
    }
    this.#local.delete(key);
    this.#synced.set(key, child);
    this.invalidate();
    if (isLiveStructure(child)) {
      child._setParentLink(this, key);
      child._attach(id, this._pool);
    }
    return {
      reverse,
      modified: {
        node: this,
        type: "LiveObject",
        updates: { [key]: { type: "update" } }
      }
    };
  }
  /** @internal */
  _detachChild(child) {
    if (child) {
      const id = nn(this._id);
      const parentKey = nn(child._parentKey);
      const reverse = child._toOps(id, parentKey);
      for (const [key, value] of this.#synced) {
        if (value === child) {
          this.#synced.delete(key);
          this.invalidate();
        }
      }
      child._detach();
      const storageUpdate = {
        node: this,
        type: "LiveObject",
        updates: {
          [parentKey]: { type: "delete" }
        }
      };
      return { modified: storageUpdate, reverse };
    }
    return { modified: false };
  }
  /** @internal */
  _detach() {
    super._detach();
    for (const value of this.#synced.values()) {
      if (isLiveNode(value)) {
        value._detach();
      }
    }
  }
  /** @internal */
  _apply(op, isLocal) {
    if (op.type === OpCode.UPDATE_OBJECT) {
      return this.#applyUpdate(op, isLocal);
    } else if (op.type === OpCode.DELETE_OBJECT_KEY) {
      return this.#applyDeleteObjectKey(op, isLocal);
    }
    return super._apply(op, isLocal);
  }
  /** @internal */
  _serialize() {
    const data = {};
    for (const [key, value] of this.#synced) {
      if (!isLiveNode(value)) {
        data[key] = value;
      }
    }
    if (this.parent.type === "HasParent" && this.parent.node._id) {
      return {
        type: CrdtType.OBJECT,
        parentId: this.parent.node._id,
        parentKey: this.parent.key,
        data
      };
    } else {
      return {
        type: CrdtType.OBJECT,
        data
      };
    }
  }
  #applyUpdate(op, isLocal) {
    let isModified = false;
    const id = nn(this._id);
    const reverse = [];
    const reverseUpdate = {
      type: OpCode.UPDATE_OBJECT,
      id,
      data: {}
    };
    for (const key in op.data) {
      const oldValue = this.#synced.get(key);
      if (isLiveNode(oldValue)) {
        for (const childOp of oldValue._toOps(id, key)) {
          reverse.push(childOp);
        }
        oldValue._detach();
      } else if (oldValue !== void 0) {
        reverseUpdate.data[key] = oldValue;
      } else if (oldValue === void 0) {
        reverse.push({ type: OpCode.DELETE_OBJECT_KEY, id, key });
      }
    }
    const updateDelta = {};
    for (const key in op.data) {
      const value = op.data[key];
      if (value === void 0) {
        continue;
      }
      if (isLocal) {
        this.#unackedOpsByKey.set(key, nn(op.opId));
      } else if (this.#unackedOpsByKey.get(key) === void 0) {
        isModified = true;
      } else if (this.#unackedOpsByKey.get(key) === op.opId) {
        this.#unackedOpsByKey.delete(key);
        continue;
      } else {
        continue;
      }
      const oldValue = this.#synced.get(key);
      if (isLiveNode(oldValue)) {
        oldValue._detach();
      }
      isModified = true;
      updateDelta[key] = { type: "update" };
      this.#local.delete(key);
      this.#synced.set(key, value);
      this.invalidate();
    }
    if (Object.keys(reverseUpdate.data).length !== 0) {
      reverse.unshift(reverseUpdate);
    }
    return isModified ? {
      modified: {
        node: this,
        type: "LiveObject",
        updates: updateDelta
      },
      reverse
    } : { modified: false };
  }
  #applyDeleteObjectKey(op, isLocal) {
    const key = op.key;
    const oldValue = this.#synced.get(key);
    if (oldValue === void 0) {
      return { modified: false };
    }
    if (!isLocal && this.#unackedOpsByKey.get(key) !== void 0) {
      return { modified: false };
    }
    const id = nn(this._id);
    let reverse = [];
    if (isLiveNode(oldValue)) {
      reverse = oldValue._toOps(id, op.key);
      oldValue._detach();
    } else if (oldValue !== void 0) {
      reverse = [
        {
          type: OpCode.UPDATE_OBJECT,
          id,
          data: { [key]: oldValue }
        }
      ];
    }
    this.#local.delete(key);
    this.#synced.delete(key);
    this.invalidate();
    return {
      modified: {
        node: this,
        type: "LiveObject",
        updates: {
          [op.key]: { type: "delete", deletedItem: oldValue }
        }
      },
      reverse
    };
  }
  /** @private */
  keys() {
    const result = new Set(this.#synced.keys());
    for (const key of this.#local.keys()) {
      result.add(key);
    }
    return result;
  }
  /**
   * Adds or updates a property with a specified key and a value.
   * @param key The key of the property to add
   * @param value The value of the property to add
   */
  set(key, value) {
    this.update({ [key]: value });
  }
  /**
   * @experimental
   *
   * Sets a local-only property that is not synchronized over the wire. The
   * value will be visible via get(), and toJSON() on this client only. Other
   * clients and the server will see `undefined` for this key.
   *
   * Caveat: this method will not add changes to the undo/redo stack.
   */
  setLocal(key, value) {
    this._pool?.assertStorageIsWritable();
    const deleteResult = this.#prepareDelete(key);
    this.#local.set(key, value);
    this.invalidate();
    if (this._pool !== void 0 && this._id !== void 0) {
      const ops = deleteResult?.[0] ?? [];
      const reverse = deleteResult?.[1] ?? [];
      const storageUpdates = deleteResult?.[2] ?? /* @__PURE__ */ new Map();
      const existing = storageUpdates.get(this._id);
      storageUpdates.set(this._id, {
        node: this,
        type: "LiveObject",
        updates: {
          ...existing?.updates,
          [key]: { type: "update" }
        }
      });
      this._pool.dispatch(ops, reverse, storageUpdates);
    }
  }
  /**
   * Returns a specified property from the LiveObject.
   * @param key The key of the property to get
   */
  get(key) {
    return this.#local.has(key) ? this.#local.get(key) : this.#synced.get(key);
  }
  /**
   * Removes a synced key, returning the ops, reverse ops, and storage updates
   * needed to notify the pool. Returns null if the key doesn't exist in
   * #synced or pool/id are unavailable. Does NOT dispatch.
   */
  #prepareDelete(key) {
    this._pool?.assertStorageIsWritable();
    const k = key;
    if (this.#local.has(k) && !this.#synced.has(k)) {
      const oldValue2 = this.#local.get(k);
      this.#local.delete(k);
      this.invalidate();
      if (this._pool !== void 0 && this._id !== void 0) {
        const storageUpdates2 = /* @__PURE__ */ new Map();
        storageUpdates2.set(this._id, {
          node: this,
          type: "LiveObject",
          updates: {
            [k]: {
              type: "delete",
              deletedItem: oldValue2
            }
          }
        });
        return [[], [], storageUpdates2];
      }
      return null;
    }
    this.#local.delete(k);
    const oldValue = this.#synced.get(k);
    if (oldValue === void 0) {
      return null;
    }
    if (this._pool === void 0 || this._id === void 0) {
      if (isLiveNode(oldValue)) {
        oldValue._detach();
      }
      this.#synced.delete(k);
      this.invalidate();
      return null;
    }
    const ops = [
      {
        type: OpCode.DELETE_OBJECT_KEY,
        key: k,
        id: this._id,
        opId: this._pool.generateOpId()
      }
    ];
    let reverse;
    if (isLiveNode(oldValue)) {
      oldValue._detach();
      reverse = oldValue._toOps(this._id, k);
    } else {
      reverse = [
        {
          type: OpCode.UPDATE_OBJECT,
          data: { [k]: oldValue },
          id: this._id
        }
      ];
    }
    this.#synced.delete(k);
    this.invalidate();
    const storageUpdates = /* @__PURE__ */ new Map();
    storageUpdates.set(this._id, {
      node: this,
      type: "LiveObject",
      updates: {
        [key]: { type: "delete", deletedItem: oldValue }
      }
    });
    return [ops, reverse, storageUpdates];
  }
  /**
   * Deletes a key from the LiveObject
   * @param key The key of the property to delete
   */
  delete(key) {
    const result = this.#prepareDelete(key);
    if (result) {
      const [ops, reverse, storageUpdates] = result;
      this._pool?.dispatch(ops, reverse, storageUpdates);
    }
  }
  /**
   * Adds or updates multiple properties at once with an object.
   * @param patch The object used to overrides properties
   */
  update(patch) {
    this._pool?.assertStorageIsWritable();
    if (_LiveObject.detectLargeObjects) {
      const data = {};
      for (const [key, value] of this.#synced) {
        if (!isLiveNode(value)) {
          data[key] = value;
        }
      }
      for (const key of Object.keys(patch)) {
        const value = patch[key];
        if (value === void 0) continue;
        if (!isLiveNode(value)) {
          data[key] = value;
        }
      }
      const jsonString = JSON.stringify(data);
      const upperBoundSize = jsonString.length * 4;
      if (upperBoundSize > MAX_LIVE_OBJECT_SIZE) {
        const preciseSize = new TextEncoder().encode(jsonString).length;
        if (preciseSize > MAX_LIVE_OBJECT_SIZE) {
          throw new Error(
            `LiveObject size exceeded limit: ${preciseSize} bytes > ${MAX_LIVE_OBJECT_SIZE} bytes. See https://liveblocks.io/docs/platform/limits#Liveblocks-Storage-limits`
          );
        }
      }
    }
    if (this._pool === void 0 || this._id === void 0) {
      for (const key in patch) {
        const newValue = patch[key];
        if (newValue === void 0) {
          continue;
        }
        const oldValue = this.#synced.get(key);
        if (isLiveNode(oldValue)) {
          oldValue._detach();
        }
        if (isLiveNode(newValue)) {
          newValue._setParentLink(this, key);
        }
        this.#local.delete(key);
        this.#synced.set(key, newValue);
        this.invalidate();
      }
      return;
    }
    const ops = [];
    const reverseOps = [];
    const opId = this._pool.generateOpId();
    const updatedProps = {};
    const reverseUpdateOp = {
      id: this._id,
      type: OpCode.UPDATE_OBJECT,
      data: {}
    };
    const updateDelta = {};
    for (const key in patch) {
      const newValue = patch[key];
      if (newValue === void 0) {
        continue;
      }
      const oldValue = this.#synced.get(key);
      if (oldValue === newValue) {
        continue;
      }
      if (isLiveNode(oldValue)) {
        for (const childOp of oldValue._toOps(this._id, key)) {
          reverseOps.push(childOp);
        }
        oldValue._detach();
      } else if (oldValue === void 0) {
        reverseOps.push({ type: OpCode.DELETE_OBJECT_KEY, id: this._id, key });
      } else {
        reverseUpdateOp.data[key] = oldValue;
      }
      if (isLiveNode(newValue)) {
        newValue._setParentLink(this, key);
        newValue._attach(this._pool.generateId(), this._pool);
        const newAttachChildOps = newValue._toOpsWithOpId(
          this._id,
          key,
          this._pool
        );
        const createCrdtOp = newAttachChildOps.find(
          (op) => op.parentId === this._id
        );
        if (createCrdtOp) {
          this.#unackedOpsByKey.set(key, nn(createCrdtOp.opId));
        }
        for (const childOp of newAttachChildOps) {
          ops.push(childOp);
        }
      } else {
        updatedProps[key] = newValue;
        this.#unackedOpsByKey.set(key, opId);
      }
      this.#local.delete(key);
      this.#synced.set(key, newValue);
      this.invalidate();
      updateDelta[key] = { type: "update" };
    }
    if (Object.keys(reverseUpdateOp.data).length !== 0) {
      reverseOps.unshift(reverseUpdateOp);
    }
    if (Object.keys(updatedProps).length !== 0) {
      ops.unshift({
        opId,
        id: this._id,
        type: OpCode.UPDATE_OBJECT,
        data: updatedProps
      });
    }
    if (ops.length === 0 && reverseOps.length === 0 && Object.keys(updateDelta).length === 0) {
      return;
    }
    const storageUpdates = /* @__PURE__ */ new Map();
    storageUpdates.set(this._id, {
      node: this,
      type: "LiveObject",
      updates: updateDelta
    });
    this._pool.dispatch(ops, reverseOps, storageUpdates);
  }
  static from(obj, config) {
    if (!isPlainObject(obj)) throw new Error("Expected a JSON object");
    const liveObj = new _LiveObject({});
    liveObj.reconcile(obj, config);
    return liveObj;
  }
  reconcile(jsonObj, config) {
    if (this.hasCache(jsonObj)) return;
    if (!isPlainObject(jsonObj))
      throw new Error(
        "Reconciling the document root expects a plain object value"
      );
    reconcileLiveObject(this, jsonObj, "full", config);
  }
  /**
   * Like reconcile(), but only touches the top-level keys present in
   * `partialObj`. Keys on this LiveObject that are absent from `partialObj`
   * are left untouched. Typically called on the storage root when
   * reconciling a subset of keys without affecting other keys on the root.
   *
   * Note: the partial behavior only applies to the top-level keys of this
   * object. Nested structures are always fully reconciled.
   *
   * @private
   */
  reconcilePartially(partialObj, config) {
    if (!isPlainObject(partialObj))
      throw new Error(
        "Reconciling the document root expects a plain object value"
      );
    reconcileLiveObject(this, partialObj, "partial", config);
  }
  /** @internal */
  toTreeNode(key) {
    return super.toTreeNode(key);
  }
  /** @internal */
  _toTreeNode(key) {
    const nodeId = this._id ?? nanoid();
    return {
      type: "LiveObject",
      id: nodeId,
      key,
      payload: Array.from(this.#synced.entries()).map(
        ([key2, value]) => isLiveNode(value) ? value.toTreeNode(key2) : { type: "Json", id: `${nodeId}:${key2}`, key: key2, payload: value }
      )
    };
  }
  toJSON() {
    return super.toJSON();
  }
  /** @internal */
  _toJSON() {
    const result = {};
    for (const [key, val] of this.#synced) {
      result[key] = isLiveStructure(val) ? val.toJSON() : val;
    }
    for (const [key, val] of this.#local) {
      result[key] = val;
    }
    return freeze(result);
  }
  clone() {
    const cloned = new _LiveObject(
      Object.fromEntries(
        Array.from(this.#synced).map(([key, value]) => [
          key,
          isLiveStructure(value) ? value.clone() : deepClone(value)
        ])
      )
    );
    for (const [key, value] of this.#local) {
      cloned.#local.set(key, deepClone(value));
    }
    return cloned;
  }
};
function creationOpToLiveNode(op) {
  return lsonToLiveNode(creationOpToLson(op));
}
__name(creationOpToLiveNode, "creationOpToLiveNode");
function creationOpToLson(op) {
  switch (op.type) {
    case OpCode.CREATE_REGISTER:
      return op.data;
    case OpCode.CREATE_OBJECT:
      return new LiveObject(op.data);
    case OpCode.CREATE_MAP:
      return new LiveMap();
    case OpCode.CREATE_LIST:
      return new LiveList([]);
    default:
      return assertNever(op, "Unknown creation Op");
  }
}
__name(creationOpToLson, "creationOpToLson");
function deserialize(node, parentToChildren, pool2) {
  if (isObjectStorageNode(node)) {
    return LiveObject._deserialize(node, parentToChildren, pool2);
  } else if (isListStorageNode(node)) {
    return LiveList._deserialize(node, parentToChildren, pool2);
  } else if (isMapStorageNode(node)) {
    return LiveMap._deserialize(node, parentToChildren, pool2);
  } else if (isRegisterStorageNode(node)) {
    return LiveRegister._deserialize(node, parentToChildren, pool2);
  } else {
    throw new Error("Unexpected CRDT type");
  }
}
__name(deserialize, "deserialize");
function deserializeToLson(node, parentToChildren, pool2) {
  if (isObjectStorageNode(node)) {
    return LiveObject._deserialize(node, parentToChildren, pool2);
  } else if (isListStorageNode(node)) {
    return LiveList._deserialize(node, parentToChildren, pool2);
  } else if (isMapStorageNode(node)) {
    return LiveMap._deserialize(node, parentToChildren, pool2);
  } else if (isRegisterStorageNode(node)) {
    return node[1].data;
  } else {
    throw new Error("Unexpected CRDT type");
  }
}
__name(deserializeToLson, "deserializeToLson");
function isLiveStructure(value) {
  return isLiveList(value) || isLiveMap(value) || isLiveObject(value);
}
__name(isLiveStructure, "isLiveStructure");
function isLiveNode(value) {
  return isLiveStructure(value) || isLiveRegister(value);
}
__name(isLiveNode, "isLiveNode");
function isLiveList(value) {
  return value instanceof LiveList;
}
__name(isLiveList, "isLiveList");
function isLiveMap(value) {
  return value instanceof LiveMap;
}
__name(isLiveMap, "isLiveMap");
function isLiveObject(value) {
  return value instanceof LiveObject;
}
__name(isLiveObject, "isLiveObject");
function isLiveRegister(value) {
  return value instanceof LiveRegister;
}
__name(isLiveRegister, "isLiveRegister");
function liveNodeToLson(obj) {
  if (obj instanceof LiveRegister) {
    return obj.data;
  } else if (obj instanceof LiveList || obj instanceof LiveMap || obj instanceof LiveObject) {
    return obj;
  } else {
    return assertNever(obj, "Unknown AbstractCrdt");
  }
}
__name(liveNodeToLson, "liveNodeToLson");
function lsonToLiveNode(value) {
  if (value instanceof LiveObject || value instanceof LiveMap || value instanceof LiveList) {
    return value;
  } else {
    return new LiveRegister(value);
  }
}
__name(lsonToLiveNode, "lsonToLiveNode");
var eventSource = makeEventSource();
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  window.addEventListener("message", (event) => {
    if (event.source === window && event.data?.source === "liveblocks-devtools-panel") {
      eventSource.notify(event.data);
    } else {
    }
  });
}
var onMessageFromPanel = eventSource.observable;
var loadedAt = Date.now();
var kPlain = Symbol("notification-settings-plain");
function createNotificationSettings(plain) {
  const channels = [
    "email",
    "slack",
    "teams",
    "webPush"
  ];
  const descriptors = {
    [kPlain]: {
      value: plain,
      enumerable: false
    }
  };
  for (const channel of channels) {
    descriptors[channel] = {
      enumerable: true,
      /**
       * In the TypeScript standard library definitions, the built-in interface for a property descriptor
       * does not include a specialized type for the “this” context in the getter or setter functions.
       * As a result, both the ⁠get and ⁠set methods implicitly have ⁠this: any.
       * The reason is that property descriptors in JavaScript are used across various objects with
       * no enforced shape for ⁠this. And so the standard library definitions have to remain as broad as possible
       * to support any valid JavaScript usage (e.g `Object.defineProperty`).
       *
       * So we can safely tells that this getter is typed as `this: NotificationSettings` because we're
       * creating a well known shaped object → `NotificationSettings`.
       */
      get() {
        const value = this[kPlain][channel];
        if (typeof value === "undefined") {
          error2(
            `In order to use the '${channel}' channel, please set up your project first. For more information: https://liveblocks.io/docs/errors/enable-a-notification-channel`
          );
          return null;
        }
        return value;
      }
    };
  }
  return create(null, descriptors);
}
__name(createNotificationSettings, "createNotificationSettings");
var ClientMsgCode = Object.freeze({
  // For Presence
  UPDATE_PRESENCE: 100,
  BROADCAST_EVENT: 103,
  // For Storage
  FETCH_STORAGE: 200,
  UPDATE_STORAGE: 201,
  // For Yjs support
  FETCH_YDOC: 300,
  UPDATE_YDOC: 301,
  // For Feeds
  FETCH_FEEDS: 510,
  FETCH_FEED_MESSAGES: 511,
  ADD_FEED: 512,
  UPDATE_FEED: 513,
  DELETE_FEED: 514,
  ADD_FEED_MESSAGE: 515,
  UPDATE_FEED_MESSAGE: 516,
  DELETE_FEED_MESSAGE: 517
});
function checkBounds(option, value, min, max, recommendedMin) {
  if (typeof value !== "number" || value < min || max !== void 0 && value > max) {
    throw new Error(
      max !== void 0 ? `${option} should be between ${recommendedMin ?? min} and ${max}.` : `${option} should be at least ${recommendedMin ?? min}.`
    );
  }
  return value;
}
__name(checkBounds, "checkBounds");
var htmlEscapables = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var htmlEscapablesRegex = new RegExp(
  Object.keys(htmlEscapables).map((entity) => `\\${entity}`).join("|"),
  "g"
);
var markdownEscapables = {
  _: "\\_",
  "*": "\\*",
  "#": "\\#",
  "`": "\\`",
  "~": "\\~",
  "!": "\\!",
  "|": "\\|",
  "(": "\\(",
  ")": "\\)",
  "{": "\\{",
  "}": "\\}",
  "[": "\\[",
  "]": "\\]"
};
var markdownEscapablesRegex = new RegExp(
  Object.keys(markdownEscapables).map((entity) => `\\${entity}`).join("|"),
  "g"
);
function makeAbortController(externalSignal) {
  const ctl = new AbortController();
  return {
    signal: externalSignal ? AbortSignal.any([ctl.signal, externalSignal]) : ctl.signal,
    abort: ctl.abort.bind(ctl)
  };
}
__name(makeAbortController, "makeAbortController");
detectDupes(PKG_NAME, PKG_VERSION, PKG_FORMAT);

// node_modules/@liveblocks/node/dist/index.js
var base64 = __toESM(require_base64(), 1);
var sha256 = __toESM(require_sha256(), 1);
var PKG_NAME2 = "@liveblocks/node";
var PKG_VERSION2 = "3.18.1";
var PKG_FORMAT2 = "esm";
async function asyncConsume(iterable) {
  const result = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}
__name(asyncConsume, "asyncConsume");
async function runConcurrently(iterable, fn, concurrency) {
  const queue = /* @__PURE__ */ new Set();
  for await (const item of iterable) {
    if (queue.size >= concurrency) {
      await Promise.race(queue);
    }
    const promise = (async () => {
      try {
        await fn(item);
      } finally {
        queue.delete(promise);
      }
    })();
    queue.add(promise);
  }
  if (queue.size > 0) {
    await Promise.all(queue);
  }
}
__name(runConcurrently, "runConcurrently");
var LineStream = class extends TransformStream {
  static {
    __name(this, "LineStream");
  }
  constructor() {
    let buffer = "";
    super({
      transform(chunk, controller) {
        buffer += chunk;
        if (buffer.includes("\n")) {
          const lines = buffer.split("\n");
          for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].length > 0) {
              controller.enqueue(lines[i]);
            }
          }
          buffer = lines[lines.length - 1];
        }
      },
      flush(controller) {
        if (buffer.length > 0) {
          controller.enqueue(buffer);
        }
      }
    });
  }
};
var NdJsonStream = class extends TransformStream {
  static {
    __name(this, "NdJsonStream");
  }
  constructor() {
    super({
      transform(line, controller) {
        const json = JSON.parse(line);
        controller.enqueue(json);
      }
    });
  }
};
function xwarn(resp, method, path) {
  const message = resp.headers.get("X-LB-Warn");
  if (message) {
    const msg = `  ⚠ [Liveblocks] ${message} (${method} ${path})`;
    if (resp.ok) {
      console.warn(msg);
    } else {
      console.error(msg);
    }
  }
}
__name(xwarn, "xwarn");
var DEFAULT_BASE_URL = "https://api.liveblocks.io";
var VALID_KEY_CHARS_REGEX = /^[\w-]+$/;
function getBaseUrl(baseUrl) {
  if (typeof baseUrl === "string" && baseUrl.startsWith("http")) {
    return baseUrl;
  } else {
    return DEFAULT_BASE_URL;
  }
}
__name(getBaseUrl, "getBaseUrl");
async function fetchPolyfill() {
  return typeof globalThis.fetch !== "undefined" ? globalThis.fetch : (await import("../../../../../../lib-FYJD7YWW.mjs")).default;
}
__name(fetchPolyfill, "fetchPolyfill");
function isString(value) {
  return typeof value === "string";
}
__name(isString, "isString");
function startsWith(value, prefix) {
  return isString(value) && value.startsWith(prefix);
}
__name(startsWith, "startsWith");
function isNonEmpty(value) {
  return isString(value) && value.length > 0;
}
__name(isNonEmpty, "isNonEmpty");
function assertNonEmpty(value, field) {
  if (!isNonEmpty(value)) {
    throw new Error(
      `Invalid value for field '${field}'. Please provide a non-empty string. For more information: https://liveblocks.io/docs/api-reference/liveblocks-node#authorize`
    );
  }
}
__name(assertNonEmpty, "assertNonEmpty");
function assertSecretKey(value, field) {
  if (!startsWith(value, "sk_")) {
    throw new Error(
      `Invalid value for field '${field}'. Secret keys must start with 'sk_'. Please provide the secret key from your Liveblocks dashboard at https://liveblocks.io/dashboard/apikeys.`
    );
  }
  if (!VALID_KEY_CHARS_REGEX.test(value)) {
    throw new Error(
      `Invalid chars found in field '${field}'. Please check that you correctly copied the secret key from your Liveblocks dashboard at https://liveblocks.io/dashboard/apikeys.`
    );
  }
}
__name(assertSecretKey, "assertSecretKey");
function normalizeStatusCode(statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    return 200;
  } else if (statusCode >= 500) {
    return 503;
  } else {
    return statusCode;
  }
}
__name(normalizeStatusCode, "normalizeStatusCode");
var ALL_PERMISSIONS = Object.freeze([
  "room:write",
  "room:read",
  "room:presence:write",
  "comments:write",
  "comments:read",
  "feeds:write"
]);
function isPermission(value) {
  return ALL_PERMISSIONS.includes(value);
}
__name(isPermission, "isPermission");
var MAX_PERMS_PER_SET = 10;
var READ_ACCESS = Object.freeze([
  "room:read",
  "room:presence:write",
  // TODO: Remove once backend no longer requires this
  "comments:read"
  // TODO: Remove — implied by room:read
]);
var FULL_ACCESS = Object.freeze(["room:write"]);
var roomPatternRegex = /^([*]|[^*]{1,128}[*]?)$/;
var Session = class {
  static {
    __name(this, "Session");
  }
  FULL_ACCESS = FULL_ACCESS;
  READ_ACCESS = READ_ACCESS;
  #postFn;
  #userId;
  #userInfo;
  #organizationId;
  /** Only used as a hint to produce better error messages. */
  #localDev;
  #sealed = false;
  #permissions = /* @__PURE__ */ new Map();
  /** @internal */
  constructor(postFn, userId, userInfo, organizationId, localDev) {
    assertNonEmpty(userId, "userId");
    this.#postFn = postFn;
    this.#userId = userId;
    this.#userInfo = userInfo;
    this.#organizationId = organizationId;
    this.#localDev = localDev ?? false;
  }
  #getOrCreate(roomId) {
    if (this.#sealed) {
      throw new Error("You can no longer change these permissions.");
    }
    let perms = this.#permissions.get(roomId);
    if (perms) {
      return perms;
    } else {
      if (this.#permissions.size >= MAX_PERMS_PER_SET) {
        throw new Error(
          "You cannot add permissions for more than 10 rooms in a single token"
        );
      }
      perms = /* @__PURE__ */ new Set();
      this.#permissions.set(roomId, perms);
      return perms;
    }
  }
  allow(roomIdOrPattern, newPerms) {
    if (typeof roomIdOrPattern !== "string") {
      throw new Error("Room name or pattern must be a string");
    }
    if (!roomPatternRegex.test(roomIdOrPattern)) {
      throw new Error("Invalid room name or pattern");
    }
    if (newPerms.length === 0) {
      throw new Error("Permission list cannot be empty");
    }
    const existingPerms = this.#getOrCreate(roomIdOrPattern);
    for (const perm of newPerms) {
      if (!isPermission(perm)) {
        throw new Error(`Not a valid permission: ${perm}`);
      }
      existingPerms.add(perm);
    }
    return this;
  }
  /** @internal - For unit tests only */
  hasPermissions() {
    return this.#permissions.size > 0;
  }
  /** @internal - For unit tests only */
  seal() {
    if (this.#sealed) {
      throw new Error(
        "You cannot reuse Session instances. Please create a new session every time."
      );
    }
    this.#sealed = true;
  }
  /** @internal - For unit tests only */
  serializePermissions() {
    return Object.fromEntries(
      Array.from(this.#permissions.entries()).map(([pat, perms]) => [
        pat,
        Array.from(perms)
      ])
    );
  }
  /**
   * Call this to authorize the session to access Liveblocks. Note that this
   * will return a Liveblocks "access token". Anyone that obtains such access
   * token will have access to the allowed resources.
   */
  async authorize() {
    this.seal();
    if (!this.hasPermissions()) {
      console.warn(
        "Access tokens without any permission will not be supported soon, you should use wildcards when the client requests a token for resources outside a room. See https://liveblocks.io/docs/errors/liveblocks-client/access-tokens-not-enough-permissions"
      );
    }
    try {
      const body = {
        // Required
        userId: this.#userId,
        permissions: this.serializePermissions(),
        // Optional metadata
        userInfo: this.#userInfo
      };
      if (this.#organizationId !== void 0) {
        body.organizationId = this.#organizationId;
      }
      const resp = await this.#postFn(url`/v2/authorize-user`, body);
      return {
        status: normalizeStatusCode(resp.status),
        body: await resp.text()
      };
    } catch (er) {
      return {
        status: 503,
        body: this.#localDev ? "Could not connect to your Liveblocks dev server. Is it running?" : 'Call to /v2/authorize-user failed. See "error" for more information.',
        error: er
      };
    }
  }
};
function inflateRoomData(room) {
  const createdAt = new Date(room.createdAt);
  const lastConnectionAt = room.lastConnectionAt ? new Date(room.lastConnectionAt) : void 0;
  return {
    ...room,
    createdAt,
    lastConnectionAt
  };
}
__name(inflateRoomData, "inflateRoomData");
function inflateAiCopilot(copilot) {
  return {
    ...copilot,
    createdAt: new Date(copilot.createdAt),
    updatedAt: new Date(copilot.updatedAt),
    lastUsedAt: copilot.lastUsedAt ? new Date(copilot.lastUsedAt) : void 0
  };
}
__name(inflateAiCopilot, "inflateAiCopilot");
function inflateKnowledgeSource(source) {
  return {
    ...source,
    createdAt: new Date(source.createdAt),
    updatedAt: new Date(source.updatedAt),
    lastIndexedAt: new Date(source.lastIndexedAt)
  };
}
__name(inflateKnowledgeSource, "inflateKnowledgeSource");
function inflateWebKnowledgeSourceLink(link) {
  return {
    ...link,
    createdAt: new Date(link.createdAt),
    lastIndexedAt: new Date(link.lastIndexedAt)
  };
}
__name(inflateWebKnowledgeSourceLink, "inflateWebKnowledgeSourceLink");
var Liveblocks = class {
  static {
    __name(this, "Liveblocks");
  }
  #secret;
  #baseUrl;
  /** Only used as a hint to produce better error messages. */
  #localDev;
  /**
   * Interact with the Liveblocks API from your Node.js backend.
   */
  constructor(options) {
    const options_ = options;
    const secret = options_.secret;
    assertSecretKey(secret, "secret");
    this.#secret = secret;
    this.#baseUrl = new URL(getBaseUrl(options.baseUrl));
    this.#localDev = !!options.baseUrl && /^https?:\/\/localhost[:/]/.test(options.baseUrl);
  }
  async #post(path, json, options) {
    const url3 = urljoin(this.#baseUrl, path);
    const headers = {
      Authorization: `Bearer ${this.#secret}`,
      "Content-Type": "application/json"
    };
    const fetch = await fetchPolyfill();
    const res = await fetch(url3, {
      method: "POST",
      headers,
      body: JSON.stringify(json),
      signal: options?.signal
    });
    xwarn(res, "POST", path);
    return res;
  }
  async #patch(path, json, options) {
    const url3 = urljoin(this.#baseUrl, path);
    const headers = {
      Authorization: `Bearer ${this.#secret}`,
      "Content-Type": "application/json"
    };
    const fetch = await fetchPolyfill();
    const res = await fetch(url3, {
      method: "PATCH",
      headers,
      body: JSON.stringify(json),
      signal: options?.signal
    });
    xwarn(res, "PATCH", path);
    return res;
  }
  async #putBinary(path, body, params, options) {
    const url3 = urljoin(this.#baseUrl, path, params);
    const headers = {
      Authorization: `Bearer ${this.#secret}`,
      "Content-Type": "application/octet-stream"
    };
    const fetch = await fetchPolyfill();
    const res = await fetch(url3, {
      method: "PUT",
      headers,
      body,
      signal: options?.signal
    });
    xwarn(res, "PUT", path);
    return res;
  }
  async #delete(path, params, options) {
    const url3 = urljoin(this.#baseUrl, path, params);
    const headers = {
      Authorization: `Bearer ${this.#secret}`
    };
    const fetch = await fetchPolyfill();
    const res = await fetch(url3, {
      method: "DELETE",
      headers,
      signal: options?.signal
    });
    xwarn(res, "DELETE", path);
    return res;
  }
  async #get(path, params, options) {
    const url3 = urljoin(this.#baseUrl, path, params);
    const headers = {
      Authorization: `Bearer ${this.#secret}`
    };
    const fetch = await fetchPolyfill();
    const res = await fetch(url3, {
      method: "GET",
      headers,
      signal: options?.signal
    });
    xwarn(res, "GET", path);
    return res;
  }
  /* -------------------------------------------------------------------------------------------------
   * Authentication
   * -----------------------------------------------------------------------------------------------*/
  /**
   * Prepares a new session to authorize a user to access Liveblocks.
   *
   * IMPORTANT:
   * Always make sure that you trust the user making the request to your
   * backend before calling .prepareSession()!
   *
   * @param userId Tell Liveblocks the user ID of the user to authorize. Must
   * uniquely identify the user account in your system. The uniqueness of this
   * value will determine how many MAUs will be counted/billed.
   *
   * @param options.organizationId (optional) The organization ID to authorize the user for.
   *
   * @param options.userInfo Custom metadata to attach to this user. Data you
   * add here will be visible to all other clients in the room, through the
   * `other.info` property.
   *
   */
  prepareSession(userId, ...rest) {
    const options = rest[0];
    return new Session(
      this.#post.bind(this),
      userId,
      options?.userInfo,
      options?.organizationId ?? options?.tenantId,
      this.#localDev
    );
  }
  /**
   * Call this to authenticate the user as an actor you want to allow to use
   * Liveblocks.
   *
   * You should use this method only if you want to manage your permissions
   * through the Liveblocks Permissions API. This method is more complicated to
   * set up, but allows for finer-grained specification of permissions.
   *
   * Calling `.identifyUser()` only lets you securely identify a user (and what
   * groups they belong to). What permissions this user will end up having is
   * determined by whatever permissions you assign the user/group in your
   * Liveblocks account, through the Permissions API:
   * https://liveblocks.io/docs/rooms/permissions
   *
   * IMPORTANT:
   * Always verify that you trust the user making the request before calling
   * .identifyUser()!
   *
   * @param identity Tell Liveblocks the user ID of the user to authenticate.
   * Must uniquely identify the user account in your system. The uniqueness of
   * this value will determine how many MAUs will be counted/billed.
   *
   * If you also want to assign which groups this user belongs to, use the
   * object form and specify the `groupIds` property. Those `groupIds` should
   * match the groupIds you assigned permissions to via the Liveblocks
   * Permissions API, see
   * https://liveblocks.io/docs/rooms/permissions#permissions-levels-groups-accesses-example
   *
   * @param options.userInfo Custom metadata to attach to this user. Data you
   * add here will be visible to all other clients in the room, through the
   * `other.info` property.
   */
  // These fields define the security identity of the user. Whatever you pass in here will define which
  async identifyUser(identity, ...rest) {
    const options = rest[0];
    const path = url`/v2/identify-user`;
    const { userId, groupIds, tenantId, organizationId } = typeof identity === "string" ? {
      userId: identity,
      groupIds: void 0,
      tenantId: void 0,
      organizationId: void 0
    } : identity;
    assertNonEmpty(userId, "userId");
    const body = {
      userId,
      groupIds,
      userInfo: options?.userInfo
    };
    if (organizationId !== void 0) {
      body.organizationId = organizationId;
    } else if (tenantId !== void 0) {
      body.organizationId = tenantId;
    }
    try {
      const resp = await this.#post(path, body);
      return {
        status: normalizeStatusCode(resp.status),
        body: await resp.text()
      };
    } catch (er) {
      return {
        status: 503,
        body: this.#localDev ? "Could not connect to your Liveblocks dev server. Is it running?" : `Call to ${urljoin(
          this.#baseUrl,
          path
        )} failed. See "error" for more information.`,
        error: er
      };
    }
  }
  /* -------------------------------------------------------------------------------------------------
   * Room
   * -----------------------------------------------------------------------------------------------*/
  /**
   * Returns a list of your rooms. The rooms are returned sorted by creation date, from newest to oldest. You can filter rooms by metadata, users accesses and groups accesses.
   * @param params.limit (optional) A limit on the number of rooms to be returned. The limit can range between 1 and 100, and defaults to 20.
   * @param params.startingAfter (optional) A cursor used for pagination. You get the value from the response of the previous page.
   * @param params.userId (optional) A filter on users accesses.
   * @param params.metadata (optional) A filter on metadata. Multiple metadata keys can be used to filter rooms.
   * @param params.groupIds (optional) A filter on groups accesses. Multiple groups can be used.
   * @param params.organizationId (optional) A filter on organization ID.
   * @param params.query (optional) A query to filter rooms by. It is based on our query language. You can filter by metadata and room ID.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A list of rooms.
   */
  async getRooms(params = {}, options) {
    const path = url`/v2/rooms`;
    let query;
    if (typeof params.query === "string") {
      query = params.query;
    } else if (typeof params.query === "object") {
      query = objectToQuery(params.query);
    }
    const queryParams = {
      limit: params.limit,
      startingAfter: params.startingAfter,
      userId: params.userId,
      groupIds: params.groupIds ? params.groupIds.join(",") : void 0,
      query
    };
    if (params.organizationId !== void 0) {
      queryParams.organizationId = params.organizationId;
    } else if (params.tenantId !== void 0) {
      queryParams.organizationId = params.tenantId;
    }
    const res = await this.#get(path, queryParams, options);
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const page = await res.json();
    const rooms = page.data.map(inflateRoomData);
    return {
      ...page,
      data: rooms
    };
  }
  /**
   * Iterates over all rooms that match the given criteria.
   *
   * The difference with .getRooms() is that pagination will happen
   * automatically under the hood, using the given `pageSize`.
   *
   * @param criteria.userId (optional) A filter on users accesses.
   * @param criteria.groupIds (optional) A filter on groups accesses. Multiple groups can be used.
   * @param criteria.query.roomId (optional) A filter by room ID.
   * @param criteria.query.metadata (optional) A filter by metadata.
   *
   * @param options.pageSize (optional) The page size to use for each request.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async *iterRooms(criteria, options) {
    const { signal } = options ?? {};
    const pageSize = checkBounds("pageSize", options?.pageSize ?? 40, 20);
    let cursor = void 0;
    while (true) {
      const { nextCursor, data } = await this.getRooms(
        { ...criteria, startingAfter: cursor, limit: pageSize },
        { signal }
      );
      for (const item of data) {
        yield item;
      }
      if (!nextCursor) {
        break;
      }
      cursor = nextCursor;
    }
  }
  /**
   * Creates a new room with the given id.
   * @param roomId The id of the room to create.
   * @param params.defaultAccesses The default accesses for the room.
   * @param params.groupsAccesses (optional) The group accesses for the room. Can contain a maximum of 100 entries. Key length has a limit of 40 characters.
   * @param params.usersAccesses (optional) The user accesses for the room. Can contain a maximum of 100 entries. Key length has a limit of 40 characters.
   * @param params.metadata (optional) The metadata for the room. Supports upto a maximum of 50 entries. Key length has a limit of 40 characters. Value length has a limit of 256 characters.
   * @param params.organizationId (optional) The organization ID to create the room for.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The created room.
   */
  async createRoom(roomId, params, options) {
    const {
      defaultAccesses,
      groupsAccesses,
      usersAccesses,
      metadata,
      tenantId,
      organizationId
    } = params;
    const body = {
      id: roomId,
      defaultAccesses,
      groupsAccesses,
      usersAccesses,
      metadata
    };
    if (organizationId !== void 0) {
      body.organizationId = organizationId;
    } else if (tenantId !== void 0) {
      body.organizationId = tenantId;
    }
    const res = await this.#post(
      options?.idempotent ? url`/v2/rooms?idempotent` : url`/v2/rooms`,
      body,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return inflateRoomData(data);
  }
  /**
   * Returns a room with the given id, or creates one with the given creation
   * options if it doesn't exist yet.
   *
   * @param roomId The id of the room.
   * @param params.defaultAccesses The default accesses for the room if the room will be created.
   * @param params.groupsAccesses (optional) The group accesses for the room if the room will be created. Can contain a maximum of 100 entries. Key length has a limit of 40 characters.
   * @param params.usersAccesses (optional) The user accesses for the room if the room will be created. Can contain a maximum of 100 entries. Key length has a limit of 40 characters.
   * @param params.metadata (optional) The metadata for the room if the room will be created. Supports upto a maximum of 50 entries. Key length has a limit of 40 characters. Value length has a limit of 256 characters.
   * @param params.organizationId (optional) The organization ID to create the room for.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The room.
   */
  async getOrCreateRoom(roomId, params, options) {
    return await this.createRoom(roomId, params, {
      ...options,
      idempotent: true
    });
  }
  /**
   * Updates or creates a new room with the given properties.
   *
   * @param roomId The id of the room to update or create.
   * @param update The fields to update. These values will be updated when the room exists, or set when the room does not exist and gets created. Must specify at least one key.
   * @param create (optional) The fields to only use when the room does not exist and will be created. When the room already exists, these values are ignored.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The room.
   */
  async upsertRoom(roomId, params, options) {
    const res = await this.#post(
      url`/v2/rooms/${roomId}/upsert`,
      params,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return inflateRoomData(data);
  }
  /**
   * Returns a room with the given id.
   * @param roomId The id of the room to return.
   * @returns The room with the given id.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async getRoom(roomId, options) {
    const res = await this.#get(url`/v2/rooms/${roomId}`, void 0, options);
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return inflateRoomData(data);
  }
  /**
   * Updates specific properties of a room. It’s not necessary to provide the entire room’s information.
   * Setting a property to `null` means to delete this property.
   * @param roomId The id of the room to update.
   * @param params.defaultAccesses (optional) The default accesses for the room.
   * @param params.groupsAccesses (optional) The group accesses for the room. Can contain a maximum of 100 entries. Key length has a limit of 40 characters.
   * @param params.usersAccesses (optional) The user accesses for the room. Can contain a maximum of 100 entries. Key length has a limit of 40 characters.
   * @param params.metadata (optional) The metadata for the room. Supports upto a maximum of 50 entries. Key length has a limit of 40 characters. Value length has a limit of 256 characters.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The updated room.
   */
  async updateRoom(roomId, params, options) {
    const { defaultAccesses, groupsAccesses, usersAccesses, metadata } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}`,
      {
        defaultAccesses,
        groupsAccesses,
        usersAccesses,
        metadata
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return inflateRoomData(data);
  }
  /**
   * Deletes a room with the given id. A deleted room is no longer accessible from the API or the dashboard and it cannot be restored.
   * @param roomId The id of the room to delete.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteRoom(roomId, options) {
    const res = await this.#delete(
      url`/v2/rooms/${roomId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Prepares a room for connectivity, making the eventual connection faster. Use this when you know you'll be loading a room but are not yet connected to it.
   * @param roomId The id of the room to prewarm.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async prewarmRoom(roomId, options) {
    const res = await this.#get(
      url`/v2/rooms/${roomId}/prewarm`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Returns a list of users currently present in the requested room. For better performance, we recommand to call this endpoint every 10 seconds maximum. Duplicates can happen if a user is in the requested room with multiple browser tabs opened.
   * @param roomId The id of the room to get the users from.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A list of users currently present in the requested room.
   */
  async getActiveUsers(roomId, options) {
    const res = await this.#get(
      url`/v2/rooms/${roomId}/active_users`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Boadcasts an event to a room without having to connect to it via the client from @liveblocks/client. The connectionId passed to event listeners is -1 when using this API.
   * @param roomId The id of the room to broadcast the event to.
   * @param message The message to broadcast. It can be any JSON serializable value.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async broadcastEvent(roomId, message, options) {
    const res = await this.#post(
      url`/v2/rooms/${roomId}/broadcast_event`,
      message,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Sets ephemeral presence for a user in a room without requiring a WebSocket connection.
   * The presence data will automatically expire after the specified TTL.
   * This is useful for scenarios like showing an AI agent's presence in a room.
   *
   * @param roomId The id of the room to set presence in.
   * @param params.userId The ID of the user to set presence for.
   * @param params.data The presence data as a JSON object.
   * @param params.userInfo (optional) Metadata about the user or agent
   * @param params.ttl (optional) Time-to-live in seconds. If not specified, the default TTL is 60 seconds. (minimum: 2, maximum: 3599).
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async setPresence(roomId, params, options) {
    const res = await this.#post(
      url`/v2/rooms/${roomId}/presence`,
      {
        userId: params.userId,
        data: params.data,
        userInfo: params.userInfo,
        ttl: params.ttl
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  async getStorageDocument(roomId, format = "plain-lson", options) {
    const res = await this.#get(
      url`/v2/rooms/${roomId}/storage`,
      { format },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  async #requestStorageMutation(roomId, options) {
    const resp = await this.#post(
      url`/v2/rooms/${roomId}/request-storage-mutation`,
      {},
      options
    );
    if (!resp.ok) {
      throw await LiveblocksError.from(resp);
    }
    if (resp.headers.get("content-type") !== "application/x-ndjson") {
      throw new Error("Unexpected response content type");
    }
    if (resp.body === null) {
      throw new Error("Unexpected null body in response");
    }
    const stream = resp.body.pipeThrough(new TextDecoderStream()).pipeThrough(new LineStream()).pipeThrough(new NdJsonStream());
    const iter = stream[Symbol.asyncIterator]();
    const first = (await iter.next()).value;
    if (!isPlainObject(first) || typeof first.actor !== "number") {
      throw new Error("Failed to obtain a unique session");
    }
    const nodes = await asyncConsume(iter);
    return { actor: first.actor, nodes };
  }
  /**
   * Initializes a room’s Storage. The room must already exist and have an empty Storage.
   * Calling this endpoint will disconnect all users from the room if there are any.
   *
   * @param roomId The id of the room to initialize the storage from.
   * @param document The document to initialize the storage with.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The initialized storage document. It is of the same format as the one passed in.
   */
  async initializeStorageDocument(roomId, document2, options) {
    const res = await this.#post(
      url`/v2/rooms/${roomId}/storage`,
      document2,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Deletes all of the room’s Storage data and disconnect all users from the room if there are any. Note that this does not delete the Yjs document in the room if one exists.
   * @param roomId The id of the room to delete the storage from.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteStorageDocument(roomId, options) {
    const res = await this.#delete(
      url`/v2/rooms/${roomId}/storage`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /* -------------------------------------------------------------------------------------------------
   * Yjs
   * -----------------------------------------------------------------------------------------------*/
  /**
   * Returns a JSON representation of the room’s Yjs document.
   * @param roomId The id of the room to get the Yjs document from.
   * @param params.format (optional) If true, YText will return formatting.
   * @param params.key (optional) If provided, returns only a single key’s value, e.g. doc.get(key).toJSON().
   * @param params.type (optional) Used with key to override the inferred type, i.e. "ymap" will return doc.get(key, Y.Map).
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A JSON representation of the room’s Yjs document.
   */
  async getYjsDocument(roomId, params = {}, options) {
    const { format, key, type } = params;
    const path = url`v2/rooms/${roomId}/ydoc`;
    const res = await this.#get(
      path,
      { formatting: format ? "true" : void 0, key, type },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Send a Yjs binary update to the room’s Yjs document. You can use this endpoint to initialize Yjs data for the room or to update the room’s Yjs document.
   * @param roomId The id of the room to send the Yjs binary update to.
   * @param update The Yjs update to send. Typically the result of calling `Yjs.encodeStateAsUpdate(doc)`. Read the [Yjs documentation](https://docs.yjs.dev/api/document-updates) to learn how to create a binary update.
   * @param params.guid (optional) If provided, the binary update will be applied to the Yjs subdocument with the given guid. If not provided, the binary update will be applied to the root Yjs document.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async sendYjsBinaryUpdate(roomId, update, params = {}, options) {
    const res = await this.#putBinary(
      url`/v2/rooms/${roomId}/ydoc`,
      update,
      { guid: params.guid },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Returns the room’s Yjs document encoded as a single binary update. This can be used by Y.applyUpdate(responseBody) to get a copy of the document in your backend.
   * See [Yjs documentation](https://docs.yjs.dev/api/document-updates) for more information on working with updates.
   * @param roomId The id of the room to get the Yjs document from.
   * @param params.guid (optional) If provided, returns the binary update of the Yjs subdocument with the given guid. If not provided, returns the binary update of the root Yjs document.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The room’s Yjs document encoded as a single binary update.
   */
  async getYjsDocumentAsBinaryUpdate(roomId, params = {}, options) {
    const res = await this.#get(
      url`/v2/rooms/${roomId}/ydoc-binary`,
      { guid: params.guid },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return res.arrayBuffer();
  }
  /* -------------------------------------------------------------------------------------------------
   * Comments
   * -----------------------------------------------------------------------------------------------*/
  /**
   * Gets all the threads in a room.
   *
   * @param params.roomId The room ID to get the threads from.
   * @param params.query The query to filter threads by. It is based on our query language and can filter by metadata.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A list of threads.
   */
  async getThreads(params, options) {
    const { roomId } = params;
    let query;
    if (typeof params.query === "string") {
      query = params.query;
    } else if (typeof params.query === "object") {
      query = objectToQuery(params.query);
    }
    const res = await this.#get(
      url`/v2/rooms/${roomId}/threads`,
      { query },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const { data } = await res.json();
    return {
      data: data.map((thread) => convertToThreadData(thread))
    };
  }
  /**
   * Gets a thread.
   *
   * @param params.roomId The room ID to get the thread from.
   * @param params.threadId The thread ID.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A thread.
   */
  async getThread(params, options) {
    const { roomId, threadId } = params;
    const res = await this.#get(
      url`/v2/rooms/${roomId}/threads/${threadId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return convertToThreadData(await res.json());
  }
  /**
   * @deprecated Prefer using `getMentionsFromCommentBody` to extract mentions
   * from comments and threads, or `Liveblocks.getThreadSubscriptions` to get
   * the list of users who are subscribed to a thread.
   *
   * Gets a thread's participants.
   *
   * Participants are users who have commented on the thread
   * or users that have been mentioned in a comment.
   *
   * @param params.roomId The room ID to get the thread participants from.
   * @param params.threadId The thread ID to get the participants from.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns An object containing an array of participant IDs.
   */
  async getThreadParticipants(params, options) {
    const { roomId, threadId } = params;
    const res = await this.#get(
      url`/v2/rooms/${roomId}/threads/${threadId}/participants`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Gets a thread's subscriptions.
   *
   * @param params.roomId The room ID to get the thread subscriptions from.
   * @param params.threadId The thread ID to get the subscriptions from.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns An array of subscriptions.
   */
  async getThreadSubscriptions(params, options) {
    const { roomId, threadId } = params;
    const res = await this.#get(
      url`/v2/rooms/${roomId}/threads/${threadId}/subscriptions`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const { data } = await res.json();
    return {
      data: data.map(convertToUserSubscriptionData)
    };
  }
  /**
   * Gets a thread's comment.
   *
   * @param params.roomId The room ID to get the comment from.
   * @param params.threadId The thread ID to get the comment from.
   * @param params.commentId The comment ID.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A comment.
   */
  async getComment(params, options) {
    const { roomId, threadId, commentId } = params;
    const res = await this.#get(
      url`/v2/rooms/${roomId}/threads/${threadId}/comments/${commentId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return convertToCommentData(await res.json());
  }
  /**
   * Creates a comment.
   *
   * @param params.roomId The room ID to create the comment in.
   * @param params.threadId The thread ID to create the comment in.
   * @param params.data.userId The user ID of the user who is set to create the comment.
   * @param params.data.createdAt (optional) The date the comment is set to be created.
   * @param params.data.body The body of the comment.
   * @param params.data.metadata (optional) The metadata for the comment.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The created comment.
   */
  async createComment(params, options) {
    const { roomId, threadId, data } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads/${threadId}/comments`,
      {
        ...data,
        createdAt: data.createdAt?.toISOString()
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return convertToCommentData(await res.json());
  }
  /**
   * Edits a comment.
   * @param params.roomId The room ID to edit the comment in.
   * @param params.threadId The thread ID to edit the comment in.
   * @param params.commentId The comment ID to edit.
   * @param params.data.body The body of the comment.
   * @param params.data.metadata (optional) The metadata for the comment. Value must be a string, boolean or number. Use null to delete a key.
   * @param params.data.editedAt (optional) The date the comment was edited.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The edited comment.
   */
  async editComment(params, options) {
    const { roomId, threadId, commentId, data } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads/${threadId}/comments/${commentId}`,
      {
        body: data.body,
        editedAt: data.editedAt?.toISOString(),
        metadata: data.metadata
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return convertToCommentData(await res.json());
  }
  /**
   * Deletes a comment. Deletes a comment. If there are no remaining comments in the thread, the thread is also deleted.
   * @param params.roomId The room ID to delete the comment in.
   * @param params.threadId The thread ID to delete the comment in.
   * @param params.commentId The comment ID to delete.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteComment(params, options) {
    const { roomId, threadId, commentId } = params;
    const res = await this.#delete(
      url`/v2/rooms/${roomId}/threads/${threadId}/comments/${commentId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Gets an attachment's metadata and a presigned download URL.
   *
   * @param params.roomId The room ID the attachment belongs to.
   * @param params.attachmentId The attachment ID (starts with "at_").
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The attachment metadata including a presigned download URL.
   */
  async getAttachment(params, options) {
    const { roomId, attachmentId } = params;
    const res = await this.#get(
      url`/v2/rooms/${roomId}/attachments/${attachmentId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Creates a new thread. The thread will be created with the specified comment as its first comment.
   * If the thread already exists, a `LiveblocksError` will be thrown with status code 409.
   * @param params.roomId The room ID to create the thread in.
   * @param params.thread.metadata (optional) The metadata for the thread. Supports upto a maximum of 10 entries. Value must be a string, boolean or number
   * @param params.thread.comment.userId The user ID of the user who created the comment.
   * @param params.thread.comment.createdAt (optional) The date the comment was created.
   * @param params.thread.comment.body The body of the comment.
   * @param params.thread.comment.metadata (optional) The metadata for the comment.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The created thread. The thread will be created with the specified comment as its first comment.
   */
  async createThread(params, options) {
    const { roomId, data } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads`,
      {
        ...data,
        comment: {
          ...data.comment,
          createdAt: data.comment.createdAt?.toISOString()
        }
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return convertToThreadData(await res.json());
  }
  /**
   * Deletes a thread and all of its comments.
   * @param params.roomId The room ID to delete the thread in.
   * @param params.threadId The thread ID to delete.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteThread(params, options) {
    const { roomId, threadId } = params;
    const res = await this.#delete(
      url`/v2/rooms/${roomId}/threads/${threadId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Mark a thread as resolved.
   * @param params.roomId The room ID of the thread.
   * @param params.threadId The thread ID to mark as resolved.
   * @param params.data.userId The user ID of the user who marked the thread as resolved.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The thread marked as resolved.
   */
  async markThreadAsResolved(params, options) {
    const { roomId, threadId } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads/${threadId}/mark-as-resolved`,
      { userId: params.data.userId },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return convertToThreadData(await res.json());
  }
  /**
   * Mark a thread as unresolved.
   * @param params.roomId The room ID of the thread.
   * @param params.threadId The thread ID to mark as unresolved.
   * @param params.data.userId The user ID of the user who marked the thread as unresolved.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The thread marked as unresolved.
   */
  async markThreadAsUnresolved(params, options) {
    const { roomId, threadId } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads/${threadId}/mark-as-unresolved`,
      { userId: params.data.userId },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return convertToThreadData(await res.json());
  }
  /**
   * Subscribes a user to a thread.
   * @param params.roomId The room ID of the thread.
   * @param params.threadId The thread ID to subscribe to.
   * @param params.data.userId The user ID of the user to subscribe to the thread.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The thread subscription.
   */
  async subscribeToThread(params, options) {
    const { roomId, threadId } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads/${threadId}/subscribe`,
      { userId: params.data.userId },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return convertToSubscriptionData(
      await res.json()
    );
  }
  /**
   * Unsubscribes a user from a thread.
   * @param params.roomId The room ID of the thread.
   * @param params.threadId The thread ID to unsubscribe from.
   * @param params.data.userId The user ID of the user to unsubscribe from the thread.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async unsubscribeFromThread(params, options) {
    const { roomId, threadId } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads/${threadId}/unsubscribe`,
      { userId: params.data.userId },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Updates the metadata of the specified thread in a room.
   * @param params.roomId The room ID to update the thread in.
   * @param params.threadId The thread ID to update.
   * @param params.data.metadata The metadata for the thread. Value must be a string, boolean or number
   * @param params.data.userId The user ID of the user who updated the thread.
   * @param params.data.updatedAt (optional) The date the thread is set to be updated.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The updated thread metadata.
   */
  async editThreadMetadata(params, options) {
    const { roomId, threadId, data } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads/${threadId}/metadata`,
      {
        ...data,
        updatedAt: data.updatedAt?.toISOString()
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Updates the metadata of the specified comment in a room.
   * @param params.roomId The room ID to update the comment in.
   * @param params.threadId The thread ID to update the comment in.
   * @param params.commentId The comment ID to update.
   * @param params.data.metadata The metadata for the comment. Value must be a string, boolean or number. Use null to delete a key.
   * @param params.data.userId The user ID of the user who updated the comment.
   * @param params.data.updatedAt (optional) The date the comment metadata is set to be updated.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The updated comment metadata.
   */
  async editCommentMetadata(params, options) {
    const { roomId, threadId, commentId, data } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads/${threadId}/comments/${commentId}/metadata`,
      {
        ...data,
        updatedAt: data.updatedAt?.toISOString()
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Adds a new comment reaction to a comment.
   * @param params.roomId The room ID to add the comment reaction in.
   * @param params.threadId The thread ID to add the comment reaction in.
   * @param params.commentId The comment ID to add the reaction in.
   * @param params.data.emoji The (emoji) reaction to add.
   * @param params.data.userId The user ID of the user associated with the reaction.
   * @param params.data.createdAt (optional) The date the reaction is set to be created.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The created comment reaction.
   */
  async addCommentReaction(params, options) {
    const { roomId, threadId, commentId, data } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads/${threadId}/comments/${commentId}/add-reaction`,
      {
        ...data,
        createdAt: data.createdAt?.toISOString()
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const reaction = await res.json();
    return convertToCommentUserReaction(reaction);
  }
  /**
   * Removes a reaction from a comment.
   * @param params.roomId The room ID to remove the comment reaction from.
   * @param params.threadId The thread ID to remove the comment reaction from.
   * @param params.commentId The comment ID to remove the reaction from.
   * @param params.data.emoji The (emoji) reaction to remove.
   * @param params.data.userId The user ID of the user associated with the reaction.
   * @param params.data.removedAt (optional) The date the reaction is set to be removed.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async removeCommentReaction(params, options) {
    const { roomId, threadId, data } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/threads/${threadId}/comments/${params.commentId}/remove-reaction`,
      {
        ...data,
        removedAt: data.removedAt?.toISOString()
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Returns the inbox notifications for a user.
   * @param params.userId The user ID to get the inbox notifications from.
   * @param params.inboxNotificationId The ID of the inbox notification to get.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async getInboxNotification(params, options) {
    const { userId, inboxNotificationId } = params;
    const res = await this.#get(
      url`/v2/users/${userId}/inbox-notifications/${inboxNotificationId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return convertToInboxNotificationData(
      await res.json()
    );
  }
  /**
   * Returns the inbox notifications for a user.
   * @param params.userId The user ID to get the inbox notifications from.
   * @param params.query The query to filter inbox notifications by. It is based on our query language and can filter by unread.
   * @param params.organizationId (optional) The organization ID to get the inbox notifications for.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async getInboxNotifications(params, options) {
    const { userId, tenantId, organizationId, limit, startingAfter } = params;
    let query;
    if (typeof params.query === "string") {
      query = params.query;
    } else if (typeof params.query === "object") {
      query = objectToQuery(params.query);
    }
    const queryParams = {
      query,
      limit,
      startingAfter
    };
    if (organizationId !== void 0) {
      queryParams.organizationId = organizationId;
    } else if (tenantId !== void 0) {
      queryParams.organizationId = tenantId;
    }
    const res = await this.#get(
      url`/v2/users/${userId}/inbox-notifications`,
      queryParams,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const page = await res.json();
    return {
      ...page,
      data: page.data.map(convertToInboxNotificationData)
    };
  }
  /**
   * Iterates over all inbox notifications for a user.
   *
   * The difference with .getInboxNotifications() is that pagination will
   * happen automatically under the hood, using the given `pageSize`.
   *
   * @param criteria.userId The user ID to get the inbox notifications from.
   * @param criteria.query The query to filter inbox notifications by. It is based on our query language and can filter by unread.
   * @param criteria.organizationId (optional) The organization ID to get the inbox notifications for.
   * @param options.pageSize (optional) The page size to use for each request.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async *iterInboxNotifications(criteria, options) {
    const { signal } = options ?? {};
    const pageSize = checkBounds("pageSize", options?.pageSize ?? 50, 10);
    let cursor = void 0;
    while (true) {
      const { nextCursor, data } = await this.getInboxNotifications(
        { ...criteria, startingAfter: cursor, limit: pageSize },
        { signal }
      );
      for (const item of data) {
        yield item;
      }
      if (!nextCursor) {
        break;
      }
      cursor = nextCursor;
    }
  }
  /**
   * Returns all room subscription settings for a user.
   * @param params.userId The user ID to get the room subscription settings from.
   * @param params.organizationId (optional) The organization ID to get the room subscription settings for.
   * @param params.startingAfter (optional) The cursor to start the pagination from.
   * @param params.limit (optional) The number of items to return.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async getUserRoomSubscriptionSettings(params, options) {
    const { userId, tenantId, organizationId, startingAfter, limit } = params;
    const queryParams = {
      startingAfter,
      limit
    };
    if (organizationId !== void 0) {
      queryParams.organizationId = organizationId;
    } else if (tenantId !== void 0) {
      queryParams.organizationId = tenantId;
    }
    const res = await this.#get(
      url`/v2/users/${userId}/room-subscription-settings`,
      queryParams,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Gets the user's room subscription settings.
   * @param params.userId The user ID to get the room subscription settings from.
   * @param params.roomId The room ID to get the room subscription settings from.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async getRoomSubscriptionSettings(params, options) {
    const { userId, roomId } = params;
    const res = await this.#get(
      url`/v2/rooms/${roomId}/users/${userId}/subscription-settings`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Updates the user's room subscription settings.
   * @param params.userId The user ID to update the room subscription settings for.
   * @param params.roomId The room ID to update the room subscription settings for.
   * @param params.data The new room subscription settings for the user.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async updateRoomSubscriptionSettings(params, options) {
    const { userId, roomId, data } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/users/${userId}/subscription-settings`,
      data,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Delete the user's room subscription settings.
   * @param params.userId The user ID to delete the room subscription settings from.
   * @param params.roomId The room ID to delete the room subscription settings from.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteRoomSubscriptionSettings(params, options) {
    const { userId, roomId } = params;
    const res = await this.#delete(
      url`/v2/rooms/${roomId}/users/${userId}/subscription-settings`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Update a room ID.
   * @param params.roomId The current ID of the room.
   * @param params.newRoomId The new room ID.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async updateRoomId(params, options) {
    const { currentRoomId, newRoomId } = params;
    const res = await this.#post(
      url`/v2/rooms/${currentRoomId}/update-room-id`,
      { newRoomId },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return inflateRoomData(data);
  }
  /**
   * Triggers an inbox notification for a user.
   * @param params.userId The user ID to trigger the inbox notification for.
   * @param params.kind The kind of inbox notification to trigger.
   * @param params.subjectId The subject ID of the triggered inbox notification.
   * @param params.activityData The activity data of the triggered inbox notification.
   * @param params.roomId (optional) The room ID to trigger the inbox notification for.
   * @param params.organizationId (optional) The organization ID to trigger the inbox notification for.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async triggerInboxNotification(params, options) {
    const { tenantId, organizationId, ...restParams } = params;
    const body = {
      ...restParams
    };
    if (organizationId !== void 0) {
      body.organizationId = organizationId;
    } else if (tenantId !== void 0) {
      body.organizationId = tenantId;
    }
    const res = await this.#post(
      url`/v2/inbox-notifications/trigger`,
      body,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Deletes an inbox notification for a user.
   * @param params.userId The user ID for which to delete the inbox notification.
   * @param params.inboxNotificationId The ID of the inbox notification to delete.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteInboxNotification(params, options) {
    const { userId, inboxNotificationId } = params;
    const res = await this.#delete(
      url`/v2/users/${userId}/inbox-notifications/${inboxNotificationId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Deletes all inbox notifications for a user.
   * @param params.userId The user ID for which to delete all the inbox notifications.
   * @param params.organizationId (optional) The organization ID to delete the inbox notifications for.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteAllInboxNotifications(params, options) {
    const { userId, tenantId, organizationId } = params;
    const queryParams = {};
    if (organizationId !== void 0) {
      queryParams.organizationId = organizationId;
    } else if (tenantId !== void 0) {
      queryParams.organizationId = tenantId;
    }
    const res = await this.#delete(
      url`/v2/users/${userId}/inbox-notifications`,
      queryParams,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Get notification settings for a user for a project.
   * @param params.userId The user ID to get the notifications settings for.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async getNotificationSettings(params, options) {
    const { userId } = params;
    const res = await this.#get(
      url`/v2/users/${userId}/notification-settings`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const plainSettings = await res.json();
    const settings = createNotificationSettings(plainSettings);
    return settings;
  }
  /**
   * Update the user's notification settings.
   * @param params.userId The user ID to update the notification settings for.
   * @param params.data The new notification settings for the user.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async updateNotificationSettings(params, options) {
    const { userId, data } = params;
    const res = await this.#post(
      url`/v2/users/${userId}/notification-settings`,
      data,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const plainSettings = await res.json();
    const settings = createNotificationSettings(plainSettings);
    return settings;
  }
  /**
   * Delete the user's notification settings
   * @param params.userId The user ID to update the notification settings for.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteNotificationSettings(params, options) {
    const { userId } = params;
    const res = await this.#delete(
      url`/v2/users/${userId}/notification-settings`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Create a group
   * @param params.groupId The ID of the group to create.
   * @param params.memberIds The IDs of the members to add to the group.
   * @param params.organizationId (optional) The organization ID to create the group for.
   * @param params.scopes (optional) The scopes to grant to the group. The default is `{ mention: true }`.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async createGroup(params, options) {
    const { tenantId, organizationId, ...restParams } = params;
    const body = {
      ...restParams,
      // The REST API uses `id` since a group is a resource,
      // but we use `groupId` here for consistency with the other methods.
      id: params.groupId
    };
    if (organizationId !== void 0) {
      body.organizationId = organizationId;
    } else if (tenantId !== void 0) {
      body.organizationId = tenantId;
    }
    const res = await this.#post(url`/v2/groups`, body, options);
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const group = await res.json();
    return convertToGroupData(group);
  }
  /**
   * Get a group
   * @param params.groupId The ID of the group to get.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async getGroup(params, options) {
    const res = await this.#get(
      url`/v2/groups/${params.groupId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const group = await res.json();
    return convertToGroupData(group);
  }
  /**
   * Add members to a group
   * @param params.groupId The ID of the group to add members to.
   * @param params.memberIds The IDs of the members to add to the group.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async addGroupMembers(params, options) {
    const res = await this.#post(
      url`/v2/groups/${params.groupId}/add-members`,
      { memberIds: params.memberIds },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const group = await res.json();
    return convertToGroupData(group);
  }
  /**
   * Remove members from a group
   * @param params.groupId The ID of the group to remove members from.
   * @param params.memberIds The IDs of the members to remove from the group.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async removeGroupMembers(params, options) {
    const res = await this.#post(
      url`/v2/groups/${params.groupId}/remove-members`,
      { memberIds: params.memberIds },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const group = await res.json();
    return convertToGroupData(group);
  }
  /**
   * Delete a group
   * @param params.groupId The ID of the group to delete.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteGroup(params, options) {
    const res = await this.#delete(
      url`/v2/groups/${params.groupId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Get all groups
   * @param params.limit (optional) The number of groups to return.
   * @param params.startingAfter (optional) The cursor to start the pagination from.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async getGroups(params, options) {
    const res = await this.#get(
      url`/v2/groups`,
      { startingAfter: params?.startingAfter, limit: params?.limit },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const page = await res.json();
    return {
      ...page,
      data: page.data.map(convertToGroupData)
    };
  }
  /**
   * Returns all groups a user is a member of.
   * @param params.userId The user ID to get the groups for.
   * @param params.startingAfter (optional) The cursor to start the pagination from.
   * @param params.limit (optional) The number of items to return.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async getUserGroups(params, options) {
    const { userId, startingAfter, limit } = params;
    const res = await this.#get(
      url`/v2/users/${userId}/groups`,
      { startingAfter, limit },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const page = await res.json();
    return {
      ...page,
      data: page.data.map(convertToGroupData)
    };
  }
  /**
   * Retrieves the current Storage contents for the given room ID and calls the
   * provided callback function, in which you can mutate the Storage contents
   * at will.
   *
   * If you need to run the same mutation across multiple rooms, prefer using
   * `.massMutateStorage()` instead of looping over room IDs yourself.
   */
  async mutateStorage(roomId, callback, options) {
    return this.#_mutateOneRoom(roomId, void 0, callback, options);
  }
  /**
   * Retrieves the Storage contents for each room that matches the given
   * criteria and calls the provided callback function, in which you can mutate
   * the Storage contents at will.
   *
   * You can use the `criteria` parameter to select which rooms to process by
   * their metadata. If you pass `{}` (empty object), all rooms will be
   * selected and processed.
   *
   * This method will execute mutations in parallel, using the specified
   * `concurrency` value. If you which to run the mutations serially, set
   * `concurrency` to 1.
   */
  async massMutateStorage(criteria, callback, massOptions) {
    const concurrency = checkBounds(
      "concurrency",
      massOptions?.concurrency ?? 8,
      1,
      20
    );
    const pageSize = Math.max(20, concurrency * 4);
    const { signal } = massOptions ?? {};
    const rooms = this.iterRooms(criteria, { pageSize, signal });
    const options = { signal };
    await runConcurrently(
      rooms,
      (roomData) => this.#_mutateOneRoom(roomData.id, roomData, callback, options),
      concurrency
    );
  }
  async #_mutateOneRoom(roomId, room, callback, options) {
    const debounceInterval = 200;
    const { signal, abort } = makeAbortController(options?.signal);
    let opsBuffer = [];
    let outstandingFlush$ = void 0;
    let lastFlush = performance.now();
    const flushIfNeeded = /* @__PURE__ */ __name((force) => {
      if (opsBuffer.length === 0)
        return;
      if (outstandingFlush$) {
        return;
      }
      const now = performance.now();
      if (!(force || now - lastFlush > debounceInterval)) {
        return;
      }
      lastFlush = now;
      const ops = opsBuffer;
      opsBuffer = [];
      outstandingFlush$ = this.#sendMessage(
        roomId,
        [{ type: ClientMsgCode.UPDATE_STORAGE, ops }],
        { signal }
      ).catch((err) => {
        abort(err);
      }).finally(() => {
        outstandingFlush$ = void 0;
      });
    }, "flushIfNeeded");
    try {
      const resp = await this.#requestStorageMutation(roomId, { signal });
      const { actor, nodes } = resp;
      const pool2 = createManagedPool(roomId, {
        getCurrentConnectionId: /* @__PURE__ */ __name(() => actor, "getCurrentConnectionId"),
        onDispatch: /* @__PURE__ */ __name((ops, _reverse, _storageUpdates) => {
          if (ops.length === 0) return;
          for (const op of ops) {
            opsBuffer.push(op);
          }
          flushIfNeeded(
            /* force */
            false
          );
        }, "onDispatch")
      });
      const root = LiveObject._fromItems(nodes, pool2);
      const callback$ = callback({ room, root });
      flushIfNeeded(
        /* force */
        true
      );
      await callback$;
    } catch (e) {
      abort();
      throw e;
    } finally {
      await outstandingFlush$;
      flushIfNeeded(
        /* force */
        true
      );
      await outstandingFlush$;
    }
  }
  async #sendMessage(roomId, messages, options) {
    const res = await this.#post(
      url`/v2/rooms/${roomId}/send-message`,
      { messages },
      { signal: options?.signal }
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Returns a paginated list of AI copilots. The copilots are returned sorted by creation date, from newest to oldest.
   * @param params.limit (optional) A limit on the number of copilots to return. The limit can range between 1 and 100, and defaults to 20.
   * @param params.startingAfter (optional) A cursor used for pagination. You get the value from the response of the previous page.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A paginated list of AI copilots.
   */
  async getAiCopilots(params = {}, options) {
    const res = await this.#get(
      url`/v2/ai/copilots`,
      {
        limit: params.limit,
        startingAfter: params.startingAfter
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const page = await res.json();
    return {
      ...page,
      data: page.data.map(inflateAiCopilot)
    };
  }
  /**
   * Creates an AI copilot.
   * @param params The parameters to create the copilot with.
   * @returns The created copilot.
   */
  async createAiCopilot(params, options) {
    const res = await this.#post(url`/v2/ai/copilots`, params, options);
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return inflateAiCopilot(data);
  }
  /**
   * Returns an AI copilot with the given id.
   * @param copilotId The id of the copilot to return.
   * @returns The copilot with the given id.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async getAiCopilot(copilotId, options) {
    const res = await this.#get(
      url`/v2/ai/copilots/${copilotId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return inflateAiCopilot(data);
  }
  /**
   * Updates an AI copilot with the given id.
   * @param copilotId The id of the copilot to update.
   * @param params The parameters to update the copilot with.
   * @returns The updated copilot.
   */
  async updateAiCopilot(copilotId, params, options) {
    const res = await this.#post(
      url`/v2/ai/copilots/${copilotId}`,
      params,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return inflateAiCopilot(data);
  }
  /**
   * Deletes an AI copilot with the given id. A deleted copilot is no longer accessible from the API or the dashboard and it cannot be restored.
   * @param copilotId The id of the copilot to delete.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteAiCopilot(copilotId, options) {
    const res = await this.#delete(
      url`/v2/ai/copilots/${copilotId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Creates a web knowledge source.
   * @param params.url The URL of the web knowledge source.
   * @param params.type The type of the web knowledge source: "individual_link", "crawl" or "sitemap".
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The id of the created web knowledge source.
   */
  async createWebKnowledgeSource(params, options) {
    const res = await this.#post(
      url`/v2/ai/copilots/${params.copilotId}/knowledge/web`,
      params,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return data;
  }
  /**
   * Creates a file knowledge source.
   * @param params.copilotId The id of the copilot.
   * @param params.name The name of the file knowledge source.
   * @param params.file The file to create the knowledge source from.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The id of the created file knowledge source.
   */
  async createFileKnowledgeSource(params, options) {
    const fetch = await fetchPolyfill();
    const res = await fetch(
      urljoin(
        this.#baseUrl,
        url`/v2/ai/copilots/${params.copilotId}/knowledge/file/${params.file.name}`
      ),
      {
        method: "PUT",
        body: params.file,
        headers: {
          Authorization: `Bearer ${this.#secret}`,
          "Content-Type": params.file.type,
          "Content-Length": String(params.file.size)
        },
        signal: options?.signal
      }
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return data;
  }
  /**
   * Deletes a file knowledge source.
   * @param params.copilotId The id of the copilot.
   * @param params.knowledgeSourceId The id of the knowledge source to delete.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteFileKnowledgeSource(params, options) {
    const res = await this.#delete(
      url`/v2/ai/copilots/${params.copilotId}/knowledge/file/${params.knowledgeSourceId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Deletes a web knowledge source.
   * @param params.copilotId The id of the copilot.
   * @param params.knowledgeSourceId The id of the knowledge source to delete.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteWebKnowledgeSource(params, options) {
    const res = await this.#delete(
      url`/v2/ai/copilots/${params.copilotId}/knowledge/web/${params.knowledgeSourceId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Returns a paginated list of knowledge sources.
   * @param params.copilotId The id of the copilot.
   * @param params.limit (optional) A limit on the number of knowledge sources to return. The limit can range between 1 and 100, and defaults to 20.
   * @param params.startingAfter (optional) A cursor used for pagination. You get the value from the response of the previous page.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A paginated list of knowledge sources.
   */
  async getKnowledgeSources(params, options) {
    const res = await this.#get(
      url`/v2/ai/copilots/${params.copilotId}/knowledge`,
      {
        limit: params.limit,
        startingAfter: params.startingAfter
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const page = await res.json();
    return {
      ...page,
      data: page.data.map(inflateKnowledgeSource)
    };
  }
  /**
   * Returns a knowledge source with the given id.
   * @param params.copilotId The id of the copilot.
   * @param params.knowledgeSourceId The id of the knowledge source to return.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The knowledge source.
   */
  async getKnowledgeSource(params, options) {
    const res = await this.#get(
      url`/v2/ai/copilots/${params.copilotId}/knowledge/${params.knowledgeSourceId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return inflateKnowledgeSource(data);
  }
  /**
   * Returns the content of a file knowledge source.
   * @param params.copilotId The id of the copilot.
   * @param params.knowledgeSourceId The id of the knowledge source.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The content of the file knowledge source.
   */
  async getFileKnowledgeSourceMarkdown(params, options) {
    const res = await this.#get(
      url`/v2/ai/copilots/${params.copilotId}/knowledge/file/${params.knowledgeSourceId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const data = await res.json();
    return data.content;
  }
  /**
   * Returns a paginated list of web knowledge source links.
   * @param params.copilotId The id of the copilot.
   * @param params.knowledgeSourceId The id of the knowledge source.
   * @param params.limit (optional) A limit on the number of links to return. The limit can range between 1 and 100, and defaults to 20.
   * @param params.startingAfter (optional) A cursor used for pagination. You get the value from the response of the previous page.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A paginated list of web knowledge source links.
   */
  async getWebKnowledgeSourceLinks(params, options) {
    const res = await this.#get(
      url`/v2/ai/copilots/${params.copilotId}/knowledge/web/${params.knowledgeSourceId}/links`,
      {
        limit: params.limit,
        startingAfter: params.startingAfter
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    const page = await res.json();
    return {
      ...page,
      data: page.data.map(inflateWebKnowledgeSourceLink)
    };
  }
  /* -------------------------------------------------------------------------------------------------
   * Feeds
   * -----------------------------------------------------------------------------------------------*/
  /**
   * Returns a list of feeds in a room.
   * @param params.roomId The room ID to get the feeds from.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A list of feeds.
   */
  async getFeeds(params, options) {
    const { roomId } = params;
    const res = await this.#get(
      url`/v2/rooms/${roomId}/feeds`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Creates a new feed in a room.
   * @param params.roomId The room ID to create the feed in.
   * @param params.feedId The feed ID.
   * @param params.metadata (optional) The metadata for the feed.
   * @param params.createdAt (optional) Creation time in ms. Sent to the API as `timestamp`. If not provided, the server uses the current time.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The created feed.
   */
  async createFeed(params, options) {
    const { roomId, feedId, metadata, createdAt } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/feeds`,
      {
        feedId,
        ...metadata !== void 0 ? { metadata } : {},
        ...createdAt !== void 0 ? { timestamp: createdAt } : {}
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Returns a feed with the given id.
   * @param params.roomId The room ID to get the feed from.
   * @param params.feedId The feed ID.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The feed.
   */
  async getFeed(params, options) {
    const { roomId, feedId } = params;
    const res = await this.#get(
      url`/v2/rooms/${roomId}/feeds/${feedId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Updates the metadata of a feed.
   * @param params.roomId The room ID to update the feed in.
   * @param params.feedId The feed ID to update.
   * @param params.metadata The metadata for the feed.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The updated feed.
   */
  async updateFeed(params, options) {
    const { roomId, feedId, metadata } = params;
    const res = await this.#patch(
      url`/v2/rooms/${roomId}/feeds/${feedId}`,
      { metadata },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Deletes a feed.
   * @param params.roomId The room ID to delete the feed from.
   * @param params.feedId The feed ID to delete.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteFeed(params, options) {
    const { roomId, feedId } = params;
    const res = await this.#delete(
      url`/v2/rooms/${roomId}/feeds/${feedId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
  /**
   * Returns a list of messages in a feed.
   * @param params.roomId The room ID to get the feed messages from.
   * @param params.feedId The feed ID to get the messages from.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns A list of feed messages.
   */
  async getFeedMessages(params, options) {
    const { roomId, feedId } = params;
    const res = await this.#get(
      url`/v2/rooms/${roomId}/feeds/${feedId}/messages`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Creates a new message in a feed.
   * @param params.roomId The room ID to create the feed message in.
   * @param params.feedId The feed ID to create the message in.
   * @param params.id (optional) The message ID. If not provided, one will be generated.
   * @param params.createdAt (optional) Creation time in ms. Sent to the API as `timestamp`. If not provided, the server uses the current time.
   * @param params.data The message data.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The created feed message.
   */
  async createFeedMessage(params, options) {
    const { roomId, feedId, id, createdAt, data } = params;
    const res = await this.#post(
      url`/v2/rooms/${roomId}/feeds/${feedId}/messages`,
      {
        data,
        ...id !== void 0 ? { id } : {},
        ...createdAt !== void 0 ? { timestamp: createdAt } : {}
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Updates a feed message.
   * @param params.roomId The room ID to update the feed message in.
   * @param params.feedId The feed ID to update the message in.
   * @param params.messageId The message ID to update.
   * @param params.data The message data.
   * @param params.updatedAt (optional) Update time in ms. Sent to the API as `timestamp`. If omitted, the server uses the current time.
   * @param options.signal (optional) An abort signal to cancel the request.
   * @returns The updated feed message.
   */
  async updateFeedMessage(params, options) {
    const { roomId, feedId, messageId, data, updatedAt } = params;
    const res = await this.#patch(
      url`/v2/rooms/${roomId}/feeds/${feedId}/messages/${messageId}`,
      {
        data,
        ...updatedAt !== void 0 ? { timestamp: updatedAt } : {}
      },
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
    return await res.json();
  }
  /**
   * Deletes a feed message.
   * @param params.roomId The room ID to delete the feed message from.
   * @param params.feedId The feed ID to delete the message from.
   * @param params.messageId The message ID to delete.
   * @param options.signal (optional) An abort signal to cancel the request.
   */
  async deleteFeedMessage(params, options) {
    const { roomId, feedId, messageId } = params;
    const res = await this.#delete(
      url`/v2/rooms/${roomId}/feeds/${feedId}/messages/${messageId}`,
      void 0,
      options
    );
    if (!res.ok) {
      throw await LiveblocksError.from(res);
    }
  }
};
var LiveblocksError = class _LiveblocksError extends Error {
  static {
    __name(this, "_LiveblocksError");
  }
  status;
  details;
  constructor(message, status, details) {
    super(message);
    this.name = "LiveblocksError";
    this.status = status;
    this.details = details;
  }
  toString() {
    let msg = `${this.name}: ${this.message} (status ${this.status})`;
    if (this.details) {
      msg += `
${this.details}`;
    }
    return msg;
  }
  static async from(res) {
    const origErrLocation = new Error();
    Error.captureStackTrace(origErrLocation, _LiveblocksError.from);
    const FALLBACK = "An error happened without an error message";
    let text;
    try {
      text = await res.text();
    } catch {
      text = FALLBACK;
    }
    const obj = tryParseJson(text) ?? { message: text };
    const message = obj.message || FALLBACK;
    const details = [
      obj.suggestion ? `Suggestion: ${String(obj.suggestion)}` : void 0,
      obj.docs ? `See also: ${String(obj.docs)}` : void 0
    ].filter(Boolean).join("\n") || void 0;
    const err = new _LiveblocksError(message, res.status, details);
    err.stack = origErrLocation.stack;
    return err;
  }
};
var WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60;
detectDupes(PKG_NAME2, PKG_VERSION2, PKG_FORMAT2);

// node_modules/@liveblocks/react-flow/dist/node.js
init_esm();

// node_modules/@liveblocks/react-flow/dist/lib/shared.js
init_esm();
var DEFAULT_STORAGE_KEY = "flow";
var NODE_BASE_CONFIG = {
  // Local-only (not synced)
  selected: false,
  dragging: false,
  measured: false,
  resizing: false,
  // Atomic (synced as plain Json)
  position: "atomic",
  sourcePosition: "atomic",
  targetPosition: "atomic",
  extent: "atomic",
  origin: "atomic",
  handles: "atomic"
  // Note: the `data` key is intentionally left out of this base config, as it
  // is expected to be provided by the end user
};
var EDGE_BASE_CONFIG = {
  // Local-only (not synced)
  selected: false,
  // Atomic (synced as plain Json)
  markerStart: "atomic",
  markerEnd: "atomic",
  label: "atomic",
  labelBgPadding: "atomic"
  // Note: the `data` key is intentionally left out of this base config, as it
  // is expected to be provided by the end user
};
function buildFlowDataConfigCache(base, data) {
  if (!data)
    return () => base;
  const dataFallback = data["*"];
  const fallback = dataFallback ? { ...base, data: dataFallback } : base;
  const cache = /* @__PURE__ */ new Map();
  for (const type in data) {
    if (type === "*")
      continue;
    const specific = data[type];
    if (!specific)
      continue;
    const dataConfig = { ...dataFallback, ...specific };
    cache.set(type, { ...base, data: dataConfig });
  }
  return (type) => cache.get(type) || fallback;
}
__name(buildFlowDataConfigCache, "buildFlowDataConfigCache");
function buildNodeConfigCache(nodeDataConfig) {
  return buildFlowDataConfigCache(NODE_BASE_CONFIG, nodeDataConfig);
}
__name(buildNodeConfigCache, "buildNodeConfigCache");
function buildEdgeConfigCache(edgeDataConfig) {
  return buildFlowDataConfigCache(EDGE_BASE_CONFIG, edgeDataConfig);
}
__name(buildEdgeConfigCache, "buildEdgeConfigCache");
function toLiveblocksInternalNode(node, config) {
  return LiveObject.from(
    node,
    config
  );
}
__name(toLiveblocksInternalNode, "toLiveblocksInternalNode");
function toLiveblocksInternalEdge(edge, config) {
  return LiveObject.from(
    edge,
    config
  );
}
__name(toLiveblocksInternalEdge, "toLiveblocksInternalEdge");

// node_modules/@liveblocks/react-flow/dist/node.js
async function mutateFlow(options, callback) {
  const { client, roomId } = options;
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const getNodeSyncConfig = buildNodeConfigCache(options.nodes?.sync);
  const getEdgeSyncConfig = buildEdgeConfigCache(options.edges?.sync);
  const nodeListCache = /* @__PURE__ */ new WeakMap();
  const edgeListCache = /* @__PURE__ */ new WeakMap();
  await client.mutateStorage(roomId, async ({ root }) => {
    let flow = root.get(storageKey);
    if (!flow) {
      const newFlow = new LiveObject({
        nodes: new LiveMap(),
        edges: new LiveMap()
      });
      root.set(storageKey, newFlow);
      flow = newFlow;
    }
    const nodesLiveMap = flow.get("nodes");
    const edgesLiveMap = flow.get("edges");
    function getNodes() {
      const nodeMap = nodesLiveMap.toJSON();
      if (!nodeListCache.has(nodeMap)) {
        nodeListCache.set(nodeMap, Object.values(nodeMap));
      }
      return nodeListCache.get(nodeMap);
    }
    __name(getNodes, "getNodes");
    function getEdges() {
      const edgeMap = edgesLiveMap.toJSON();
      if (!edgeListCache.has(edgeMap)) {
        edgeListCache.set(edgeMap, Object.values(edgeMap));
      }
      return edgeListCache.get(edgeMap);
    }
    __name(getEdges, "getEdges");
    function getNode(id) {
      return nodesLiveMap.get(id)?.toJSON();
    }
    __name(getNode, "getNode");
    function getEdge(id) {
      return edgesLiveMap.get(id)?.toJSON();
    }
    __name(getEdge, "getEdge");
    function upsertNode(id, newNode) {
      const existing = nodesLiveMap.get(id);
      const syncConfig = getNodeSyncConfig(newNode.type);
      if (!existing) {
        nodesLiveMap.set(id, toLiveblocksInternalNode(newNode, syncConfig));
      } else {
        existing.reconcile(newNode, syncConfig);
      }
    }
    __name(upsertNode, "upsertNode");
    function upsertEdge(id, newEdge) {
      const existing = edgesLiveMap.get(id);
      const syncConfig = getEdgeSyncConfig(newEdge.type);
      if (!existing) {
        edgesLiveMap.set(id, toLiveblocksInternalEdge(newEdge, syncConfig));
      } else {
        existing.reconcile(newEdge, syncConfig);
      }
    }
    __name(upsertEdge, "upsertEdge");
    const mutableFlow = {
      get nodes() {
        return getNodes();
      },
      get edges() {
        return getEdges();
      },
      toJSON() {
        return { nodes: getNodes(), edges: getEdges() };
      },
      getNode,
      getEdge,
      addNode(node) {
        upsertNode(node.id, node);
      },
      addNodes(nodes) {
        for (const node of nodes) {
          mutableFlow.addNode(node);
        }
      },
      updateNode(id, partialOrUpdater) {
        const oldNode = getNode(id);
        if (!oldNode)
          return;
        let newNode;
        if (typeof partialOrUpdater === "function") {
          newNode = partialOrUpdater(oldNode);
        } else {
          newNode = { ...oldNode, ...partialOrUpdater };
        }
        return upsertNode(id, newNode);
      },
      updateNodeData(id, partialOrUpdater) {
        return mutableFlow.updateNode(id, (node) => {
          const currData = node.data ?? {};
          const newData = typeof partialOrUpdater === "function" ? partialOrUpdater(currData) : { ...currData, ...partialOrUpdater };
          return { ...node, data: newData };
        });
      },
      removeNode(id) {
        nodesLiveMap.delete(id);
      },
      removeNodes(ids) {
        for (const id of ids) {
          nodesLiveMap.delete(id);
        }
      },
      addEdge(edge) {
        upsertEdge(edge.id, edge);
      },
      addEdges(edges) {
        for (const edge of edges) {
          mutableFlow.addEdge(edge);
        }
      },
      updateEdge(id, partialOrUpdater) {
        const oldEdge = getEdge(id);
        if (!oldEdge)
          return;
        let newEdge;
        if (typeof partialOrUpdater === "function") {
          newEdge = partialOrUpdater(oldEdge);
        } else {
          newEdge = { ...oldEdge, ...partialOrUpdater };
        }
        return upsertEdge(id, newEdge);
      },
      updateEdgeData(id, partialOrUpdater) {
        return mutableFlow.updateEdge(id, (edge) => {
          const currData = edge.data;
          const newData = typeof partialOrUpdater === "function" ? partialOrUpdater(currData) : { ...currData, ...partialOrUpdater };
          return { ...edge, data: newData };
        });
      },
      removeEdge(id) {
        edgesLiveMap.delete(id);
      },
      removeEdges(ids) {
        for (const id of ids) {
          edgesLiveMap.delete(id);
        }
      }
    };
    await callback(mutableFlow);
  });
}
__name(mutateFlow, "mutateFlow");

// node_modules/nanoid/index.js
init_esm();
import { webcrypto as crypto2 } from "node:crypto";

// node_modules/nanoid/url-alphabet/index.js
init_esm();
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/nanoid/index.js
var POOL_SIZE_MULTIPLIER = 128;
var pool;
var poolOffset;
function fillPool(bytes) {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    crypto2.getRandomValues(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    crypto2.getRandomValues(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
}
__name(fillPool, "fillPool");
function nanoid2(size = 21) {
  fillPool(size |= 0);
  let id = "";
  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }
  return id;
}
__name(nanoid2, "nanoid");

// trigger/design-agent.ts
var PRESENCE_TTL = 20;
var AGENT_PAUSE_MS = 120;
var CURSOR_THINK_INTERVAL_MS = 1e3;
var DEFAULT_BOUNDS_RADIUS = 300;
var ANIMATION_STEPS = 10;
var AGENT_ID = "ai-architect";
var AGENT_INFO = {
  name: "AI Architect",
  avatar: "",
  color: "#6366f1"
};
var NODE_SHAPES = ["rectangle", "diamond", "circle", "pill"];
var NODE_COLORS = [
  "#1e293b",
  "#1e3a8a",
  "#0369a1",
  "#0f766e",
  "#065f46",
  "#3730a3",
  "#5b21b6",
  "#7e22ce",
  "#9f1239",
  "#9a3412"
];
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
__name(sleep, "sleep");
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
__name(easeInOutCubic, "easeInOutCubic");
function getNodeCenter(node) {
  const w = node.width ?? 260;
  const h = node.height ?? 120;
  return {
    x: (node.position?.x ?? 0) + w / 2,
    y: (node.position?.y ?? 0) + h / 2
  };
}
__name(getNodeCenter, "getNodeCenter");
function getBoundsFromNodes(nodes) {
  if (nodes.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const node of nodes) {
    const x = node.position?.x ?? 0;
    const y = node.position?.y ?? 0;
    const w = node.width ?? 260;
    const h = node.height ?? 120;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  }
  return { minX, minY, maxX, maxY };
}
__name(getBoundsFromNodes, "getBoundsFromNodes");
function getRandomPointInBounds(bounds) {
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY)
  };
}
__name(getRandomPointInBounds, "getRandomPointInBounds");
function getMidpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
__name(getMidpoint, "getMidpoint");
function getEdgeHandles(source, target) {
  const sc = getNodeCenter(source);
  const tc = getNodeCenter(target);
  const dx = tc.x - sc.x;
  const dy = tc.y - sc.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? { sourceHandle: "right", targetHandle: "left" } : { sourceHandle: "left", targetHandle: "right" };
  }
  return dy > 0 ? { sourceHandle: "bottom", targetHandle: "top" } : { sourceHandle: "top", targetHandle: "bottom" };
}
__name(getEdgeHandles, "getEdgeHandles");
var designAgent = task({
  id: "design-agent",
  retry: {
    maxAttempts: 1
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const { roomId, prompt } = payload;
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set.");
    const secret = process.env.LIVEBLOCKS_SECRET_KEY;
    if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not set.");
    const gemini = createGoogleGenerativeAI({ apiKey });
    const liveblocks = new Liveblocks({ secret });
    let lastCursor = null;
    let lastThinking = true;
    async function setPresence(opts) {
      const cursor = opts.cursor ?? lastCursor;
      const thinking = opts.thinking ?? lastThinking;
      await liveblocks.setPresence(roomId, {
        userId: AGENT_ID,
        data: {
          cursor: cursor ? { x: cursor.x, y: cursor.y } : null,
          thinking
        },
        userInfo: AGENT_INFO,
        ttl: opts.ttl ?? PRESENCE_TTL
      });
      if (cursor) lastCursor = cursor;
      lastThinking = thinking;
    }
    __name(setPresence, "setPresence");
    function pause() {
      return sleep(AGENT_PAUSE_MS);
    }
    __name(pause, "pause");
    let queue = Promise.resolve();
    const enqueue = /* @__PURE__ */ __name((fn) => {
      const run = queue.then(() => fn());
      queue = run.then(
        () => void 0,
        () => void 0
      );
      return run;
    }, "enqueue");
    await mutateFlow(
      { client: liveblocks, roomId },
      async (flow) => {
        const bounds = getBoundsFromNodes([...flow.nodes]) ?? {
          minX: -DEFAULT_BOUNDS_RADIUS,
          minY: -DEFAULT_BOUNDS_RADIUS,
          maxX: DEFAULT_BOUNDS_RADIUS,
          maxY: DEFAULT_BOUNDS_RADIUS
        };
        await setPresence({ cursor: getRandomPointInBounds(bounds) });
        let thinkingInterval = setInterval(() => {
          void setPresence({ cursor: getRandomPointInBounds(bounds) });
        }, CURSOR_THINK_INTERVAL_MS);
        function stopThinking() {
          clearInterval(thinkingInterval);
          thinkingInterval = void 0;
          lastThinking = false;
        }
        __name(stopThinking, "stopThinking");
        try {
          await generateText({
            model: gemini(process.env.GEMINI_MODEL ?? "gemini-2.0-flash"),
            maxOutputTokens: 4096,
            system: `You edit a live collaborative React Flow diagram for system architecture design.

Node shape: { id, position: { x, y }, width, height, data: { label, shape, color } }.
Edge shape: { id, source, target, sourceHandle, targetHandle }.

Rules:
- All nodes use type "canvasNode".
- Shapes: ${NODE_SHAPES.join(" | ")}.
- Colors (hex): ${NODE_COLORS.join(", ")}.
- Make small, deliberate changes that are easy to follow visually.
- Keep labels short and descriptive.
- Maintain readable spacing and avoid overlap (minimum 50px gap between nodes).
- Use varied shapes and colors to distinguish different types of components (e.g. database=diamond, service=rectangle, queue=pill).
- When creating a system design, lay out nodes in a clean top-to-bottom or left-to-right flow.
- Edge handles should match spatial layout: "bottom"->"top" for vertical, "right"->"left" for horizontal.
- Use moveNode for position, resizeNode for size, updateNodeData for label/shape/color — never mix them.
- Delete nodes or edges only when the user clearly asks.`,
            prompt: `<current-diagram>
${JSON.stringify({ nodes: flow.nodes, edges: flow.edges }, null, 2)}
</current-diagram>

<user-request>
${prompt}
</user-request>`,
            tools: {
              addNode: tool({
                description: "Create one node on the canvas.",
                inputSchema: external_exports.object({
                  id: external_exports.string().optional(),
                  position: external_exports.object({ x: external_exports.number(), y: external_exports.number() }),
                  width: external_exports.number().min(60).max(400).optional(),
                  height: external_exports.number().min(60).max(400).optional(),
                  label: external_exports.string().optional(),
                  shape: external_exports.enum(NODE_SHAPES).optional(),
                  color: external_exports.enum(NODE_COLORS).optional()
                }),
                execute: /* @__PURE__ */ __name((input) => enqueue(async () => {
                  const w = input.width ?? 260;
                  const h = input.height ?? 120;
                  await setPresence({
                    cursor: {
                      x: input.position.x + w / 2,
                      y: input.position.y + h / 2
                    },
                    thinking: false
                  });
                  await pause();
                  const id = input.id ?? `node-${nanoid2(8)}`;
                  if (flow.getNode(id))
                    return { ok: false, reason: "id_exists", id };
                  flow.addNode({
                    id,
                    type: "canvasNode",
                    position: input.position,
                    width: w,
                    height: h,
                    data: {
                      label: input.label ?? "",
                      color: input.color ?? "#1e293b",
                      shape: input.shape ?? "rectangle"
                    }
                  });
                  await pause();
                  return { ok: true, id };
                }), "execute")
              }),
              moveNode: tool({
                description: "Move one node to a new position with animated cursor.",
                inputSchema: external_exports.object({
                  id: external_exports.string(),
                  position: external_exports.object({ x: external_exports.number(), y: external_exports.number() })
                }),
                execute: /* @__PURE__ */ __name((input) => enqueue(async () => {
                  const node = flow.getNode(input.id);
                  if (!node)
                    return { ok: false, reason: "not_found", id: input.id };
                  const w = node.width ?? 260;
                  const h = node.height ?? 120;
                  const from = node.position;
                  await setPresence({
                    cursor: getNodeCenter(node),
                    thinking: false
                  });
                  await pause();
                  for (let i = 1; i <= ANIMATION_STEPS; i++) {
                    const t = easeInOutCubic(i / ANIMATION_STEPS);
                    const pos = {
                      x: from.x + (input.position.x - from.x) * t,
                      y: from.y + (input.position.y - from.y) * t
                    };
                    flow.updateNode(input.id, { position: pos });
                    await setPresence({
                      cursor: { x: pos.x + w / 2, y: pos.y + h / 2 }
                    });
                  }
                  flow.updateNode(input.id, { position: input.position });
                  await pause();
                  return { ok: true, id: input.id };
                }), "execute")
              }),
              resizeNode: tool({
                description: "Resize one node.",
                inputSchema: external_exports.object({
                  id: external_exports.string(),
                  width: external_exports.number().min(60).max(400).optional(),
                  height: external_exports.number().min(60).max(400).optional()
                }),
                execute: /* @__PURE__ */ __name((input) => enqueue(async () => {
                  const node = flow.getNode(input.id);
                  if (!node)
                    return { ok: false, reason: "not_found", id: input.id };
                  await setPresence({
                    cursor: getNodeCenter(node),
                    thinking: false
                  });
                  await pause();
                  const partial = {};
                  if (input.width !== void 0) partial.width = input.width;
                  if (input.height !== void 0)
                    partial.height = input.height;
                  if (Object.keys(partial).length > 0)
                    flow.updateNode(input.id, partial);
                  await pause();
                  return { ok: true, id: input.id };
                }), "execute")
              }),
              updateNodeData: tool({
                description: "Update one node's label, shape, or color.",
                inputSchema: external_exports.object({
                  id: external_exports.string(),
                  label: external_exports.string().optional(),
                  shape: external_exports.enum(NODE_SHAPES).optional(),
                  color: external_exports.enum(NODE_COLORS).optional()
                }),
                execute: /* @__PURE__ */ __name((input) => enqueue(async () => {
                  const node = flow.getNode(input.id);
                  if (!node)
                    return { ok: false, reason: "not_found", id: input.id };
                  await setPresence({
                    cursor: getNodeCenter(node),
                    thinking: false
                  });
                  await pause();
                  const data = {};
                  if (input.label !== void 0) data.label = input.label;
                  if (input.shape !== void 0) data.shape = input.shape;
                  if (input.color !== void 0) data.color = input.color;
                  if (Object.keys(data).length > 0)
                    flow.updateNodeData(input.id, data);
                  await pause();
                  return { ok: true, id: input.id };
                }), "execute")
              }),
              deleteNode: tool({
                description: "Delete one node.",
                inputSchema: external_exports.object({ id: external_exports.string() }),
                execute: /* @__PURE__ */ __name(({ id }) => enqueue(async () => {
                  const node = flow.getNode(id);
                  if (!node) return { ok: false, reason: "not_found", id };
                  await setPresence({
                    cursor: getNodeCenter(node),
                    thinking: false
                  });
                  await pause();
                  flow.removeNode(id);
                  await pause();
                  return { ok: true, id };
                }), "execute")
              }),
              addEdge: tool({
                description: "Create one edge between two nodes.",
                inputSchema: external_exports.object({
                  id: external_exports.string().optional(),
                  source: external_exports.string(),
                  target: external_exports.string()
                }),
                execute: /* @__PURE__ */ __name((input) => enqueue(async () => {
                  const srcNode = flow.getNode(input.source);
                  const tgtNode = flow.getNode(input.target);
                  if (!srcNode || !tgtNode) {
                    return {
                      ok: false,
                      reason: "not_found",
                      source: input.source,
                      target: input.target
                    };
                  }
                  await setPresence({
                    cursor: getNodeCenter(srcNode),
                    thinking: false
                  });
                  await pause();
                  await setPresence({ cursor: getNodeCenter(tgtNode) });
                  await pause();
                  const id = input.id ?? `e-${input.source}-${input.target}-${nanoid2(6)}`;
                  if (flow.getEdge(id))
                    return { ok: false, reason: "id_exists", id };
                  const { sourceHandle, targetHandle } = getEdgeHandles(
                    srcNode,
                    tgtNode
                  );
                  flow.addEdge({
                    id,
                    source: input.source,
                    target: input.target,
                    sourceHandle,
                    targetHandle,
                    type: "smoothstep",
                    style: { stroke: "#e2e8f0", strokeWidth: 1.8 },
                    markerEnd: {
                      type: "arrowclosed",
                      color: "#e2e8f0",
                      width: 14,
                      height: 14
                    }
                  });
                  await pause();
                  return { ok: true, id };
                }), "execute")
              }),
              deleteEdge: tool({
                description: "Delete one edge.",
                inputSchema: external_exports.object({ id: external_exports.string() }),
                execute: /* @__PURE__ */ __name(({ id }) => enqueue(async () => {
                  const edge = flow.getEdge(id);
                  if (!edge) return { ok: false, reason: "not_found", id };
                  const srcNode = flow.getNode(edge.source);
                  const tgtNode = flow.getNode(edge.target);
                  if (srcNode && tgtNode) {
                    await setPresence({
                      cursor: getMidpoint(
                        getNodeCenter(srcNode),
                        getNodeCenter(tgtNode)
                      ),
                      thinking: false
                    });
                    await pause();
                  }
                  flow.removeEdge(id);
                  await pause();
                  return { ok: true, id };
                }), "execute")
              })
            },
            stopWhen: stepCountIs(30),
            experimental_onToolCallStart: stopThinking
          });
        } finally {
          stopThinking();
        }
      }
    );
    await setPresence({ ttl: 3 });
    return { ok: true };
  }, "run")
});
export {
  designAgent
};
//# sourceMappingURL=design-agent.mjs.map
