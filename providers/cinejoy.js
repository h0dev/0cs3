/**
 * cinejoy - Built from src/cinejoy/
 * Generated: 2026-10-20T13:52:19.147Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/cinejoy/sha256.js
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
var IV = new Uint32Array([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
function rotr(x, n) {
  return (x >>> n | x << 32 - n) >>> 0;
}
var Sha256 = class {
  constructor() {
    this.h = new Uint32Array(IV);
    this.buf = new Uint8Array(64);
    this.bufLen = 0;
    this.total = 0;
    this.w = new Uint32Array(64);
  }
  update(data) {
    const n = data.length;
    this.total += n;
    let off = 0;
    if (this.bufLen) {
      const take = Math.min(64 - this.bufLen, n);
      this.buf.set(data.subarray(0, take), this.bufLen);
      this.bufLen += take;
      off = take;
      if (this.bufLen === 64) {
        this._blocks(this.buf, 0, 1);
        this.bufLen = 0;
      }
    }
    const full = n - off >> 6 << 6;
    if (full)
      this._blocks(data, off, full >> 6);
    off += full;
    if (off < n) {
      this.buf.set(data.subarray(off), this.bufLen);
      this.bufLen += n - off;
    }
    return this;
  }
  digest() {
    const bitLenHi = Math.floor(this.total / 536870912) >>> 0;
    const bitLenLo = this.total << 3 >>> 0;
    const pad = new Uint8Array((this.bufLen < 56 ? 56 : 120) - this.bufLen + 8);
    pad[0] = 128;
    const dv = new DataView(pad.buffer);
    dv.setUint32(pad.length - 8, bitLenHi);
    dv.setUint32(pad.length - 4, bitLenLo);
    const total = this.total;
    this.update(pad);
    this.total = total;
    const out = new Uint8Array(32);
    const odv = new DataView(out.buffer);
    for (let i = 0; i < 8; i++)
      odv.setUint32(i * 4, this.h[i]);
    return out;
  }
  _blocks(data, off, count) {
    const w = this.w, h = this.h;
    for (let b = 0; b < count; b++) {
      const p = off + b * 64;
      for (let i = 0; i < 16; i++) {
        w[i] = data[p + i * 4] << 24 | data[p + i * 4 + 1] << 16 | data[p + i * 4 + 2] << 8 | data[p + i * 4 + 3];
      }
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ w[i - 15] >>> 3;
        const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ w[i - 2] >>> 10;
        w[i] = w[i - 16] + s0 + w[i - 7] + s1 >>> 0;
      }
      let a = h[0], bb = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = e & f ^ ~e & g;
        const t1 = hh + S1 + ch + K[i] + w[i] >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = a & bb ^ a & c ^ bb & c;
        const t2 = S0 + maj >>> 0;
        hh = g;
        g = f;
        f = e;
        e = d + t1 >>> 0;
        d = c;
        c = bb;
        bb = a;
        a = t1 + t2 >>> 0;
      }
      h[0] = h[0] + a >>> 0;
      h[1] = h[1] + bb >>> 0;
      h[2] = h[2] + c >>> 0;
      h[3] = h[3] + d >>> 0;
      h[4] = h[4] + e >>> 0;
      h[5] = h[5] + f >>> 0;
      h[6] = h[6] + g >>> 0;
      h[7] = h[7] + hh >>> 0;
    }
  }
};
function sha256(data) {
  return new Sha256().update(data).digest();
}
function hmacSha256(key, msg) {
  let k = key.length > 64 ? sha256(key) : key;
  const ipad = new Uint8Array(64 + msg.length);
  const opad = new Uint8Array(64 + 32);
  for (let i = 0; i < 64; i++)
    ipad[i] = (k[i] || 0) ^ 54;
  ipad.set(msg, 64);
  const inner = sha256(ipad);
  for (let i = 0; i < 64; i++)
    opad[i] = (k[i] || 0) ^ 92;
  opad.set(inner, 64);
  return sha256(opad);
}
function concat(...parts) {
  let len = 0;
  for (const p of parts)
    len += p.length;
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
function utf8(str) {
  if (typeof TextEncoder !== "undefined")
    return new TextEncoder().encode(str);
  const out = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 128)
      out.push(c);
    else if (c < 2048)
      out.push(192 | c >> 6, 128 | c & 63);
    else if (c >= 55296 && c < 56320) {
      const c2 = str.charCodeAt(++i);
      c = 65536 + (c - 55296 << 10) + (c2 - 56320);
      out.push(240 | c >> 18, 128 | c >> 12 & 63, 128 | c >> 6 & 63, 128 | c & 63);
    } else
      out.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
  }
  return new Uint8Array(out);
}
function fromUtf8(bytes) {
  if (typeof TextDecoder !== "undefined")
    return new TextDecoder().decode(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++)
    s += String.fromCharCode(bytes[i]);
  return decodeURIComponent(escape(s));
}
function randomBytes(n) {
  const out = new Uint8Array(n);
  const g = typeof globalThis !== "undefined" ? globalThis : {};
  if (g.crypto && typeof g.crypto.getRandomValues === "function") {
    g.crypto.getRandomValues(out);
    return out;
  }
  let seed = (Date.now() ^ Math.random() * 4294967295) >>> 0;
  for (let i = 0; i < n; i++) {
    seed = seed * 1664525 + 1013904223 >>> 0;
    out[i] = seed >>> 16 ^ Math.random() * 256 & 255;
  }
  return out;
}

// src/cinejoy/aesgcm.js
var SBOX = new Uint8Array(256);
var RCON = [1, 2, 4, 8, 16, 32, 64, 128, 27, 54, 108, 216, 171, 77];
(function buildSbox() {
  let p = 1, q = 1;
  do {
    p = (p ^ p << 1 ^ (p & 128 ? 27 : 0)) & 255;
    q ^= q << 1;
    q ^= q << 2;
    q ^= q << 4;
    q &= 255;
    if (q & 128)
      q ^= 9;
    const x = q ^ (q << 1 | q >>> 7) ^ (q << 2 | q >>> 6) ^ (q << 3 | q >>> 5) ^ (q << 4 | q >>> 4);
    SBOX[p] = (x ^ 99) & 255;
  } while (p !== 1);
  SBOX[0] = 99;
})();
var INV_SBOX = new Uint8Array(256);
for (let i = 0; i < 256; i++)
  INV_SBOX[SBOX[i]] = i;
function xtime(a) {
  return (a << 1 ^ (a & 128 ? 27 : 0)) & 255;
}
var Aes256 = class {
  constructor(key) {
    if (key.length !== 32)
      throw new Error("AES-256 needs a 32-byte key");
    const nk = 8, nr = 14;
    const w = new Uint8Array(16 * (nr + 1));
    w.set(key);
    for (let i = nk; i < 4 * (nr + 1); i++) {
      let t0 = w[(i - 1) * 4], t1 = w[(i - 1) * 4 + 1], t2 = w[(i - 1) * 4 + 2], t3 = w[(i - 1) * 4 + 3];
      if (i % nk === 0) {
        const tmp = t0;
        t0 = SBOX[t1] ^ RCON[i / nk - 1];
        t1 = SBOX[t2];
        t2 = SBOX[t3];
        t3 = SBOX[tmp];
      } else if (i % nk === 4) {
        t0 = SBOX[t0];
        t1 = SBOX[t1];
        t2 = SBOX[t2];
        t3 = SBOX[t3];
      }
      w[i * 4] = w[(i - nk) * 4] ^ t0;
      w[i * 4 + 1] = w[(i - nk) * 4 + 1] ^ t1;
      w[i * 4 + 2] = w[(i - nk) * 4 + 2] ^ t2;
      w[i * 4 + 3] = w[(i - nk) * 4 + 3] ^ t3;
    }
    this.w = w;
  }
  encryptBlock(input) {
    const w = this.w;
    const s = new Uint8Array(input);
    for (let i = 0; i < 16; i++)
      s[i] ^= w[i];
    const tmp = new Uint8Array(16);
    for (let round = 1; round <= 14; round++) {
      for (let c = 0; c < 4; c++) {
        for (let r = 0; r < 4; r++) {
          tmp[c * 4 + r] = SBOX[s[(c + r & 3) * 4 + r]];
        }
      }
      if (round !== 14) {
        for (let c = 0; c < 4; c++) {
          const a0 = tmp[c * 4], a1 = tmp[c * 4 + 1], a2 = tmp[c * 4 + 2], a3 = tmp[c * 4 + 3];
          s[c * 4] = xtime(a0) ^ (xtime(a1) ^ a1) ^ a2 ^ a3;
          s[c * 4 + 1] = a0 ^ xtime(a1) ^ (xtime(a2) ^ a2) ^ a3;
          s[c * 4 + 2] = a0 ^ a1 ^ xtime(a2) ^ (xtime(a3) ^ a3);
          s[c * 4 + 3] = xtime(a0) ^ a0 ^ a1 ^ a2 ^ xtime(a3);
        }
      } else {
        s.set(tmp);
      }
      const off = round * 16;
      for (let i = 0; i < 16; i++)
        s[i] ^= w[off + i];
    }
    return s;
  }
};
function ghashMul(x, y) {
  const z = new Uint8Array(16);
  const v = new Uint8Array(y);
  for (let i = 0; i < 128; i++) {
    const bit = x[i >> 3] >> 7 - (i & 7) & 1;
    if (bit)
      for (let j = 0; j < 16; j++)
        z[j] ^= v[j];
    const lsb = v[15] & 1;
    for (let j = 15; j > 0; j--)
      v[j] = (v[j] >>> 1 | (v[j - 1] & 1) << 7) & 255;
    v[0] = v[0] >>> 1;
    if (lsb)
      v[0] ^= 225;
  }
  return z;
}
function ghash(h, aad, ct) {
  const y = new Uint8Array(16);
  const data = [];
  const push = (bytes) => {
    for (let i = 0; i < bytes.length; i += 16) {
      const blk = new Uint8Array(16);
      blk.set(bytes.subarray(i, Math.min(i + 16, bytes.length)));
      data.push(blk);
    }
  };
  if (aad.length)
    push(aad);
  if (ct.length)
    push(ct);
  for (const blk of data) {
    for (let i = 0; i < 16; i++)
      y[i] ^= blk[i];
    y.set(ghashMul(y, h));
  }
  const lens = new Uint8Array(16);
  const dv = new DataView(lens.buffer);
  dv.setUint32(0, Math.floor(aad.length / 536870912));
  dv.setUint32(4, aad.length * 8 >>> 0);
  dv.setUint32(8, Math.floor(ct.length / 536870912));
  dv.setUint32(12, ct.length * 8 >>> 0);
  for (let i = 0; i < 16; i++)
    y[i] ^= lens[i];
  return ghashMul(y, h);
}
function ctrXor(aes, iv, data) {
  const out = new Uint8Array(data.length);
  const counter = new Uint8Array(16);
  counter.set(iv);
  counter[15] = 1;
  const ks = new Uint8Array(16);
  for (let off = 0; off < data.length; off += 16) {
    let carry = 1;
    for (let i = 15; i >= 12 && carry; i--) {
      const v = counter[i] + carry;
      counter[i] = v & 255;
      carry = v > 255 ? 1 : 0;
    }
    ks.set(aes.encryptBlock(counter));
    const n = Math.min(16, data.length - off);
    for (let i = 0; i < n; i++)
      out[off + i] = data[off + i] ^ ks[i];
  }
  return out;
}
function aesGcmEncrypt(key, iv, aad, plaintext) {
  const aes = new Aes256(key);
  const ct = ctrXor(aes, iv, plaintext);
  const h = aes.encryptBlock(new Uint8Array(16));
  const s = ghash(h, aad || new Uint8Array(0), ct);
  const j0 = new Uint8Array(16);
  j0.set(iv);
  j0[15] = 1;
  const ek = aes.encryptBlock(j0);
  const out = new Uint8Array(ct.length + 16);
  out.set(ct);
  for (let i = 0; i < 16; i++)
    out[ct.length + i] = s[i] ^ ek[i];
  return out;
}
function aesGcmDecrypt(key, iv, aad, sealed) {
  if (sealed.length < 16)
    throw new Error("ciphertext too short");
  const ct = sealed.subarray(0, sealed.length - 16);
  const tag = sealed.subarray(sealed.length - 16);
  const aes = new Aes256(key);
  const h = aes.encryptBlock(new Uint8Array(16));
  const s = ghash(h, aad || new Uint8Array(0), ct);
  const j0 = new Uint8Array(16);
  j0.set(iv);
  j0[15] = 1;
  const ek = aes.encryptBlock(j0);
  let diff = 0;
  for (let i = 0; i < 16; i++)
    diff |= tag[i] ^ s[i] ^ ek[i];
  if (diff !== 0)
    throw new Error("bad tag");
  return ctrXor(aes, iv, ct);
}

// src/cinejoy/p256.js
var B0 = BigInt(0);
var B1 = BigInt(1);
var B2 = BigInt(2);
var B3 = BigInt(3);
var B4 = BigInt(4);
var B8 = BigInt(8);
var B16 = BigInt(16);
var P = BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff");
var N = BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551");
var B = BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b");
var GX = BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296");
var GY = BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5");
function mod(a) {
  const r = a % P;
  return r >= B0 ? r : r + P;
}
function inv(a) {
  let result = B1, base = mod(a), exp = P - B2;
  while (exp > B0) {
    if (exp & B1)
      result = result * base % P;
    base = base * base % P;
    exp >>= B1;
  }
  return result;
}
function bytesToBig(bytes) {
  let v = B0;
  for (let i = 0; i < bytes.length; i++)
    v = v << B8 | BigInt(bytes[i]);
  return v;
}
function bigToBytes(v, len) {
  const out = new Uint8Array(len);
  let x = v;
  for (let i = len - 1; i >= 0; i--) {
    out[i] = Number(x & BigInt(255));
    x >>= B8;
  }
  return out;
}
function jDouble(p) {
  const [x, y, z] = p;
  if (y === B0)
    return [B0, B1, B0];
  const ysq = y * y % P;
  const s = B4 * x * ysq % P;
  const m = (B3 * x * x + P - B3 * (z * z % P) * (z * z % P)) % P;
  const nx = mod(m * m - B2 * s);
  const ny = mod(m * (s - nx) - B8 * ysq * ysq);
  const nz = B2 * y * z % P;
  return [nx, ny, nz];
}
function jAdd(p, q) {
  const [x1, y1, z1] = p;
  const [x2, y2, z2] = q;
  if (z1 === B0)
    return q;
  if (z2 === B0)
    return p;
  const z1z1 = z1 * z1 % P;
  const z2z2 = z2 * z2 % P;
  const u1 = x1 * z2z2 % P;
  const u2 = x2 * z1z1 % P;
  const s1 = y1 * z2 % P * z2z2 % P;
  const s2 = y2 * z1 % P * z1z1 % P;
  if (u1 === u2) {
    if (s1 !== s2)
      return [B0, B1, B0];
    return jDouble(p);
  }
  const h = mod(u2 - u1);
  const r = mod(s2 - s1);
  const h2 = h * h % P;
  const h3 = h2 * h % P;
  const u1h2 = u1 * h2 % P;
  const nx = mod(r * r - h3 - B2 * u1h2);
  const ny = mod(r * (u1h2 - nx) - s1 * h3);
  const nz = h * z1 % P * z2 % P;
  return [nx, ny, nz];
}
function toAffine(p) {
  const [x, y, z] = p;
  if (z === B0)
    throw new Error("point at infinity");
  const zi = inv(z);
  const zi2 = zi * zi % P;
  return [x * zi2 % P, y * zi2 % P * zi % P];
}
var ZERO = [B0, B1, B0];
function fromAffine(x, y) {
  return [x, y, B1];
}
var G = fromAffine(GX, GY);
function scalarMult(point, k) {
  k = (k % N + N) % N;
  if (k === B0)
    return [B0, B1, B0];
  const table = [ZERO];
  for (let i = 1; i < 16; i++)
    table.push(jAdd(table[i - 1], point));
  const nibbles = [];
  let kk = k;
  while (kk > B0) {
    nibbles.push(Number(kk & BigInt(15)));
    kk >>= B4;
  }
  let acc = ZERO;
  for (let i = nibbles.length - 1; i >= 0; i--) {
    for (let d = 0; d < 4; d++)
      acc = jDouble(acc);
    const nib = nibbles[i];
    if (nib)
      acc = jAdd(acc, table[nib]);
  }
  return acc;
}
function encodePoint(p) {
  const [x, y] = toAffine(p);
  const out = new Uint8Array(65);
  out[0] = 4;
  out.set(bigToBytes(x, 32), 1);
  out.set(bigToBytes(y, 32), 33);
  return out;
}
function decodePoint(bytes) {
  if (bytes.length === 65 && bytes[0] === 4) {
    return fromAffine(bytesToBig(bytes.subarray(1, 33)), bytesToBig(bytes.subarray(33, 65)));
  }
  if (bytes.length === 33 && (bytes[0] === 2 || bytes[0] === 3)) {
    const x = bytesToBig(bytes.subarray(1));
    const rhs = mod(x * x * x - B3 * x + B);
    let y = B1, base = rhs, exp = (P + B1) / B4;
    while (exp > B0) {
      if (exp & B1)
        y = y * base % P;
      base = base * base % P;
      exp >>= B1;
    }
    if ((y & B1) !== BigInt(bytes[0] & 1))
      y = P - y;
    return fromAffine(x, y);
  }
  throw new Error("unsupported point encoding");
}
function publicKey(privateBytes) {
  const d = bytesToBig(privateBytes);
  if (d === B0 || d >= N)
    throw new Error("invalid private key");
  return encodePoint(scalarMult(G, d));
}
function ecdh(privateBytes, peerPublic) {
  const d = bytesToBig(privateBytes);
  if (d === B0 || d >= N)
    throw new Error("invalid private key");
  const shared = scalarMult(decodePoint(peerPublic), d);
  const [x] = toAffine(shared);
  return bigToBytes(x, 32);
}
function isOnCurve(bytes) {
  if (!bytes || bytes.length !== 65 || bytes[0] !== 4)
    return false;
  const x = bytesToBig(bytes.subarray(1, 33));
  const y = bytesToBig(bytes.subarray(33, 65));
  if (x >= P || y >= P)
    return false;
  return mod(y * y - (x * x * x - B3 * x + B)) === B0;
}
var CURVE_ORDER = N;

// src/cinejoy/gate.js
var GATE_LABEL = "lumen-gate-v2";
var EPHEMERAL_LABEL = "lumen-gate-v2|ephemeral|";
var INFO_REQUEST = "lumen-gate-v2|c2s";
var INFO_RESPONSE = "lumen-gate-v2|s2c";
var KEY_ID = 2;
var BAKED_SERVER_KEY = new Uint8Array([
  4,
  92,
  136,
  160,
  174,
  51,
  198,
  131,
  164,
  135,
  37,
  144,
  176,
  75,
  34,
  244,
  119,
  74,
  79,
  225,
  198,
  236,
  247,
  71,
  133,
  199,
  74,
  145,
  154,
  113,
  32,
  124,
  169,
  79,
  158,
  107,
  90,
  120,
  84,
  195,
  170,
  59,
  68,
  238,
  70,
  188,
  68,
  79,
  234,
  105,
  75,
  159,
  35,
  188,
  216,
  15,
  134,
  78,
  203,
  239,
  72,
  193,
  239,
  110,
  20
]);
var SESSION_TTL_MS = 10 * 60 * 1e3;
var session = null;
var serverKey = BAKED_SERVER_KEY;
var lastKeyRefresh = 0;
function be32(n) {
  return new Uint8Array([n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255]);
}
function openSession() {
  const seed = randomBytes(32);
  const label = utf8(EPHEMERAL_LABEL);
  let priv = null;
  for (let counter = 0; counter < 8 && !priv; counter++) {
    const digest = sha256(concat(label, seed, be32(counter)));
    const d = BigInt("0x" + Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join(""));
    if (d !== BigInt(0) && d < CURVE_ORDER)
      priv = digest;
  }
  if (!priv)
    throw new Error("no usable ephemeral scalar");
  const pub = publicKey(priv);
  const shared = ecdh(priv, serverKey);
  const prk = hmacSha256(pub, shared);
  return {
    at: Date.now(),
    pub,
    kRequest: hmacSha256(prk, concat(utf8(INFO_REQUEST), new Uint8Array([1]))),
    kResponse: hmacSha256(prk, concat(utf8(INFO_RESPONSE), new Uint8Array([1]))),
    aadBase: concat(utf8(GATE_LABEL), new Uint8Array([0, 1, KEY_ID]), pub),
    aadBaseResponse: concat(utf8(GATE_LABEL), new Uint8Array([0, 2, KEY_ID]), pub)
  };
}
function getSession(force) {
  if (force || !session || Date.now() - session.at > SESSION_TTL_MS)
    session = openSession();
  return session;
}
function seal(path, payload) {
  const s = getSession(false);
  const plaintext = utf8(JSON.stringify({ path, payload }));
  const nonce = randomBytes(12);
  const sealed = aesGcmEncrypt(s.kRequest, nonce, s.aadBase, plaintext);
  const body = new Uint8Array(3 + 64 + 12 + sealed.length);
  body[0] = 2;
  body[1] = 2;
  body[2] = 4;
  body.set(s.pub.subarray(1), 3);
  body.set(nonce, 67);
  body.set(sealed, 79);
  return body;
}
function unseal(responseBytes) {
  try {
    return unsealWith(getSession(false), responseBytes);
  } catch (e) {
    session = null;
    return unsealWith(getSession(true), responseBytes);
  }
}
function unsealWith(s, bytes) {
  if (!bytes || bytes.length < 12 + 16)
    throw new Error("gate response too short");
  const iv = bytes.subarray(0, 12);
  const plain = aesGcmDecrypt(s.kResponse, iv, s.aadBaseResponse, bytes.subarray(12));
  return JSON.parse(fromUtf8(plain));
}
function learnServerKey(url = "https://api.wing.st/crush.wasm") {
  return __async(this, null, function* () {
    if (Date.now() - lastKeyRefresh < 60 * 1e3)
      return false;
    lastKeyRefresh = Date.now();
    try {
      const res = yield fetch(url, { headers: { referer: "https://cinejoy.pk/" } });
      if (!res.ok)
        return false;
      const wasm = new Uint8Array(yield res.arrayBuffer());
      const needle = utf8(EPHEMERAL_LABEL);
      const at = indexOfBytes(wasm, needle);
      if (at < 0)
        return false;
      const from = Math.max(0, at - 2048);
      for (let off = at - 65; off >= from; off--) {
        if (wasm[off] !== 4)
          continue;
        const candidate = wasm.subarray(off, off + 65);
        if (!isOnCurve(candidate))
          continue;
        console.log("[Cinejoy] gate: learned a new server key from crush.wasm");
        serverKey = new Uint8Array(candidate);
        session = null;
        return true;
      }
      return false;
    } catch (e) {
      console.log(`[Cinejoy] gate: key refresh failed (${e.message})`);
      return false;
    }
  });
}
function indexOfBytes(haystack, needle) {
  const limit = haystack.length - needle.length;
  for (let i = 0; i <= limit; i++) {
    if (haystack[i] !== needle[0])
      continue;
    let j = 1;
    while (j < needle.length && haystack[i + j] === needle[j])
      j++;
    if (j === needle.length)
      return i;
  }
  return -1;
}

// src/cinejoy/api.js
var BASE = "https://cinejoy.pk";
var BROWSER_UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36";
var API_ROOT = "https://api.wing.st";
var GATE_URL = `${API_ROOT}/g`;
var SUBS_ROOT = "https://subs.wing.st";
var DEFAULT_SERVERS = [
  { name: "Nebula", slug: "nebula", ok: true },
  { name: "Lisbon", slug: "lisbon", ok: true },
  { name: "Solara", slug: "solara", ok: true },
  { name: "Athens", slug: "athens", ok: true }
];
function withTimeout(promise, ms, tag) {
  return new Promise((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done)
        return;
      done = true;
      reject(new Error(`${tag || "request"} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (v) => {
        if (done)
          return;
        done = true;
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        if (done)
          return;
        done = true;
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}
function gateCall(path, payload, timeoutMs = 9e3) {
  return __async(this, null, function* () {
    try {
      return yield gateCallOnce(path, payload, timeoutMs);
    } catch (e) {
      if (!/bad tag|too short/i.test(e.message || ""))
        throw e;
      if (!(yield learnServerKey()))
        throw e;
      return gateCallOnce(path, payload, timeoutMs);
    }
  });
}
function gateCallOnce(path, payload, timeoutMs) {
  return __async(this, null, function* () {
    const body = seal(path, payload);
    const res = yield withTimeout(
      fetch(GATE_URL, {
        method: "POST",
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          origin: BASE,
          referer: `${BASE}/`,
          "user-agent": BROWSER_UA
        },
        body
      }),
      timeoutMs,
      `gate ${path}`
    );
    if (!res.ok) {
      const err = new Error(`gate ${path} HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const buf = new Uint8Array(yield res.arrayBuffer());
    return unseal(buf);
  });
}
function fetchServers(timeoutMs = 5e3) {
  return __async(this, null, function* () {
    try {
      const res = yield withTimeout(fetch(`${API_ROOT}/servers`, { headers: { referer: `${BASE}/` } }), timeoutMs, "servers");
      if (!res.ok)
        return DEFAULT_SERVERS;
      const json = yield res.json();
      const list = Array.isArray(json && json.servers) ? json.servers : [];
      const mapped = list.filter((s) => s && s.name && String(s.status || "ok") === "ok").map((s) => ({
        name: String(s.name),
        slug: String(s.name).toLowerCase(),
        fourK: !!s["4k"],
        ok: true
      }));
      return mapped.length ? mapped : DEFAULT_SERVERS;
    } catch (e) {
      console.log(`[Cinejoy] servers: ${e.message} \u2014 using defaults`);
      return DEFAULT_SERVERS;
    }
  });
}
function fetchServerStream(server, kind, params, timeoutMs = 9e3) {
  return __async(this, null, function* () {
    const path = `/${server.slug}/${kind}`;
    const json = yield gateCall(path, params, timeoutMs);
    const data = json && json.data || {};
    const streams = Array.isArray(data.stream) ? data.stream : [];
    if (json.status !== 200 || streams.length === 0) {
      const why = data.error || `status ${json.status}`;
      throw new Error(`${server.name}: ${why}`);
    }
    return streams.filter((s) => s && s.playlist);
  });
}
function fetchSubtitleTracks(kind, tmdbId, season, episode, timeoutMs = 6e3) {
  return __async(this, null, function* () {
    const query = kind === "series" ? `type=tv&tmdb=${encodeURIComponent(tmdbId)}&season=${encodeURIComponent(season || 1)}&episode=${encodeURIComponent(episode || 1)}` : `type=movie&tmdb=${encodeURIComponent(tmdbId)}`;
    try {
      const res = yield withTimeout(
        fetch(`${SUBS_ROOT}/subtitles?${query}`, { headers: { referer: `${BASE}/` } }),
        timeoutMs,
        "subtitles"
      );
      if (!res.ok)
        return [];
      const json = yield res.json();
      return Array.isArray(json && json.subtitles) ? json.subtitles : [];
    } catch (e) {
      console.log(`[Cinejoy] subtitles: ${e.message}`);
      return [];
    }
  });
}

// src/cinejoy/hls.js
var PROBE_BYTES = 8192;
function resolveUrl(base, rel) {
  if (/^https?:\/\//i.test(rel))
    return rel;
  if (rel.startsWith("//"))
    return "https:" + rel;
  const m = /^([a-z]+:\/\/[^/]+)(.*)$/i.exec(base);
  if (!m)
    return rel;
  const [, origin, pathAndQuery] = m;
  if (rel.startsWith("/"))
    return origin + rel;
  const dir = pathAndQuery.replace(/[?#].*$/, "").replace(/[^/]*$/, "");
  return origin + dir + rel;
}
function heightOf(attrs) {
  const m = /RESOLUTION=(\d+)x(\d+)/i.exec(attrs);
  if (m)
    return Number(m[2]) || 0;
  const name = /NAME="?([^",]*)"?/i.exec(attrs);
  if (name) {
    const h = /(\d{3,4})p/.exec(name[1]);
    if (h)
      return Number(h[1]);
  }
  return 0;
}
function probePlaylist(url, timeoutMs = 5e3) {
  return __async(this, null, function* () {
    try {
      const res = yield withTimeout(
        fetch(url, {
          headers: {
            "user-agent": BROWSER_UA,
            referer: "https://cinejoy.pk/",
            // Cloudflare edge honours this (206 + 2 KB); the other CDN
            // ignores it and sends the whole 50 KB playlist, which is
            // still cheap. Either way the read is bounded.
            Range: `bytes=0-${PROBE_BYTES - 1}`
          }
        }),
        timeoutMs,
        "probe"
      );
      if (!res.ok)
        return { ok: false, reason: `HTTP ${res.status}` };
      let text = yield res.text();
      if (text.length > PROBE_BYTES * 2)
        text = text.slice(0, PROBE_BYTES * 2);
      if (!/^\uFEFF?#EXTM3U/.test(text.trim())) {
        const head = text.trim().slice(0, 40).replace(/\s+/g, " ");
        return { ok: false, reason: `not a playlist (${head})` };
      }
      const lines = text.split(/\r?\n/);
      const variants = [];
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].startsWith("#EXT-X-STREAM-INF"))
          continue;
        const uri = lines[i + 1];
        if (!uri || uri.startsWith("#"))
          continue;
        variants.push({ url: resolveUrl(url, uri.trim()), height: heightOf(lines[i]) });
      }
      return { ok: true, master: variants.length > 0, variants, text };
    } catch (e) {
      return { ok: false, reason: e.message };
    }
  });
}
function expandPlaylist(url, serverName, timeoutMs) {
  return __async(this, null, function* () {
    const probe = yield probePlaylist(url, timeoutMs);
    if (!probe.ok) {
      const soft = /timed out/i.test(probe.reason || "");
      return { streams: soft ? [{ url, height: 0, server: serverName, soft: true }] : [], error: probe.reason, soft };
    }
    if (!probe.master) {
      return { streams: [{ url, height: 0, server: serverName }] };
    }
    const seen = /* @__PURE__ */ new Set();
    const streams = [];
    for (const v of probe.variants) {
      if (seen.has(v.url))
        continue;
      seen.add(v.url);
      streams.push({ url: v.url, height: v.height, server: serverName });
    }
    if (streams.length === 0)
      streams.push({ url, height: 0, server: serverName });
    return { streams };
  });
}

// src/cinejoy/index.js
var LABEL = "Cinejoy";
var CACHE_TTL_MS = 10 * 60 * 1e3;
var EMPTY_TTL_MS = 90 * 1e3;
var CACHE_MAX = 48;
var cache = /* @__PURE__ */ new Map();
var TOTAL_BUDGET_MS = 12 * 1e3;
var GATE_TIMEOUT_MS = 8 * 1e3;
var PROBE_TIMEOUT_MS = 6 * 1e3;
var MAX_SERVERS = 4;
var MAX_STREAMS = 10;
var MAX_SUBTITLES = 14;
var MAX_SUBTITLES_TOTAL = 20;
var LANGUAGE_NAMES = {
  en: "English",
  vi: "Vietnamese",
  ar: "Arabic",
  bg: "Bulgarian",
  zh: "Chinese",
  cs: "Czech",
  da: "Danish",
  nl: "Dutch",
  fi: "Finnish",
  fr: "French",
  de: "German",
  el: "Greek",
  he: "Hebrew",
  hi: "Hindi",
  hu: "Hungarian",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  ms: "Malay",
  no: "Norwegian",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  es: "Spanish",
  sv: "Swedish",
  th: "Thai",
  tr: "Turkish",
  uk: "Ukrainian",
  und: "Unknown",
  eng: "English",
  vie: "Vietnamese",
  ara: "Arabic",
  bul: "Bulgarian",
  chi: "Chinese",
  cze: "Czech",
  dan: "Danish",
  dut: "Dutch",
  fin: "Finnish",
  fre: "French",
  ger: "German",
  gre: "Greek",
  heb: "Hebrew",
  hin: "Hindi",
  hun: "Hungarian",
  ind: "Indonesian",
  ita: "Italian",
  jpn: "Japanese",
  kor: "Korean",
  may: "Malay",
  nor: "Norwegian",
  pol: "Polish",
  por: "Portuguese",
  rum: "Romanian",
  rus: "Russian",
  spa: "Spanish",
  swe: "Swedish",
  tha: "Thai",
  tur: "Turkish",
  ukr: "Ukrainian",
  tel: "Telugu",
  tam: "Tamil"
};
var SUBTITLE_PRIORITY = ["vi", "en"];
function languageName(code) {
  const c = String(code || "").toLowerCase();
  return LANGUAGE_NAMES[c] || (c ? c.toUpperCase() : "Unknown");
}
function parseTmdbId(raw) {
  const s = String(raw == null ? "" : raw).trim();
  const prefixed = /^(?:tmdb|themoviedb):(\d+)$/i.exec(s);
  if (prefixed)
    return prefixed[1];
  if (/^\d+$/.test(s))
    return s;
  return null;
}
function imdbToTmdb(raw, mediaType) {
  return __async(this, null, function* () {
    const kind = String(mediaType || "").toLowerCase() === "movie" ? "movie" : "series";
    try {
      const res = yield withTimeout(
        fetch(`https://v3-cinemeta.strem.io/meta/${kind}/${raw}.json`),
        5e3,
        "cinemeta"
      );
      const json = yield res.json();
      const id = json && json.meta && json.meta.moviedb_id;
      return id ? String(id) : null;
    } catch (e) {
      return null;
    }
  });
}
function qualityLabel(height) {
  if (height >= 2160)
    return "4K";
  if (height >= 1440)
    return "1440p";
  if (height >= 1080)
    return "1080p";
  if (height >= 720)
    return "720p";
  if (height >= 480)
    return "480p";
  if (height > 0)
    return `${height}p`;
  return "Auto";
}
function titleFor(server, height) {
  return height > 0 ? `${server} \xB7 ${qualityLabel(height)}` : `${server} \xB7 Adaptive`;
}
function captionsToSubtitles(captions) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const cap of captions || []) {
    if (!cap || !cap.url)
      continue;
    const lang = String(cap.language || cap.id || "und").toLowerCase();
    const key = `${lang}:${cap.url}`;
    if (seen.has(key))
      continue;
    seen.add(key);
    out.push({
      url: cap.url,
      language: languageName(lang),
      name: `${LABEL} \xB7 ${languageName(lang)}`,
      headers: { Referer: `${BASE}/`, "User-Agent": BROWSER_UA }
    });
  }
  return out;
}
function extraToSubtitles(tracks) {
  const rank = (lang) => {
    const i = SUBTITLE_PRIORITY.indexOf(String(lang || "").toLowerCase());
    return i === -1 ? SUBTITLE_PRIORITY.length : i;
  };
  const sorted = (tracks || []).filter((t) => t && t.url).sort((a, b) => rank(a.language) - rank(b.language));
  const out = [];
  const seenLang = /* @__PURE__ */ new Set();
  for (const t of sorted) {
    const lang = String(t.language || "und").toLowerCase();
    if (seenLang.has(lang))
      continue;
    seenLang.add(lang);
    out.push({
      url: t.url,
      language: languageName(lang),
      name: t.display ? `${LABEL} \xB7 ${t.display}` : `${LABEL} \xB7 ${languageName(lang)}`
    });
    if (out.length >= MAX_SUBTITLES)
      break;
  }
  return out;
}
function mergeSubtitles(primary, secondary) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const list of [primary, secondary]) {
    for (const sub of list) {
      const key = String(sub.language || "").toLowerCase();
      if (seen.has(key))
        continue;
      seen.add(key);
      out.push(sub);
      if (out.length >= MAX_SUBTITLES_TOTAL)
        return out;
    }
  }
  return out;
}
function resolveStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const isMovie = String(mediaType || "").toLowerCase() === "movie";
    const kind = isMovie ? "movie" : "series";
    let id = parseTmdbId(tmdbId);
    if (!id && /^tt\d+$/i.test(String(tmdbId || "").trim())) {
      id = yield imdbToTmdb(tmdbId, mediaType);
    }
    if (!id) {
      console.log(`[${LABEL}] unsupported id "${tmdbId}" (needs a TMDB id)`);
      return [];
    }
    const s = Number(season) || 1;
    const e = Number(episode) || 1;
    const params = isMovie ? { tmdb: id } : { tmdb: id, season: String(s), episode: String(e) };
    const serversPromise = fetchServers();
    const subtitlesPromise = fetchSubtitleTracks(kind, id, s, e, 4e3);
    let answers = yield Promise.all(
      DEFAULT_SERVERS.slice(0, MAX_SERVERS).map(
        (server) => fetchServerStream(server, kind, params, GATE_TIMEOUT_MS).then((entries) => ({ server, entries })).catch((err) => {
          console.log(`[${LABEL}] ${err.message}`);
          return { server, entries: null, status: err.status || 0 };
        })
      )
    );
    if (answers.every((a) => !a.entries) && answers.some((a) => a.status === 404)) {
      if (yield learnServerKey()) {
        console.log(`[${LABEL}] retrying mirrors with the refreshed key`);
        const retried = yield Promise.all(
          DEFAULT_SERVERS.slice(0, MAX_SERVERS).map(
            (server) => fetchServerStream(server, kind, params, GATE_TIMEOUT_MS).then((entries) => ({ server, entries })).catch((err) => ({ server, entries: null, status: err.status || 0 }))
          )
        );
        answers = retried;
      }
    }
    const probes = [];
    for (const answer of answers) {
      if (!answer.entries)
        continue;
      for (const entry of answer.entries) {
        probes.push(
          expandPlaylist(entry.playlist, answer.server.name, PROBE_TIMEOUT_MS).then((result) => __spreadProps(__spreadValues({}, result), {
            captions: entry.captions || [],
            server: answer.server
          }))
        );
      }
    }
    const expanded = yield Promise.all(probes);
    const servers = yield serversPromise;
    const fourK = new Set(servers.filter((srv) => srv.fourK).map((srv) => srv.name));
    const candidates = [];
    const dead = [];
    for (const result of expanded) {
      if (!result.streams.length) {
        dead.push(`${result.server.name} (${result.error || "no variant"})`);
        continue;
      }
      for (const st of result.streams) {
        candidates.push({
          url: st.url,
          height: st.height,
          server: result.server.name,
          fourK: fourK.has(result.server.name),
          soft: !!st.soft,
          captions: result.captions
        });
      }
    }
    if (dead.length)
      console.log(`[${LABEL}] unplayable: ${dead.join(", ")}`);
    if (candidates.length === 0)
      return [];
    const captions = candidates[0].captions || [];
    const extra = yield subtitlesPromise;
    const subtitles = mergeSubtitles(captionsToSubtitles(captions), extraToSubtitles(extra));
    const serverRank = { Nebula: 3, Lisbon: 2, Solara: 1, Athens: 0 };
    candidates.sort((a, b) => {
      if (a.soft !== b.soft)
        return a.soft ? 1 : -1;
      if (b.height !== a.height)
        return b.height - a.height;
      const ra = serverRank[a.server] || 0;
      const rb = serverRank[b.server] || 0;
      if (rb !== ra)
        return rb - ra;
      return (b.fourK ? 1 : 0) - (a.fourK ? 1 : 0);
    });
    const streams = [];
    const seen = /* @__PURE__ */ new Set();
    for (const c of candidates) {
      if (streams.length >= MAX_STREAMS)
        break;
      if (seen.has(c.url))
        continue;
      seen.add(c.url);
      const stream = {
        name: `${LABEL} \xB7 ${c.server}`,
        title: titleFor(c.server, c.height),
        quality: qualityLabel(c.height),
        url: c.url,
        headers: {
          "User-Agent": BROWSER_UA,
          Referer: `${BASE}/`
        }
      };
      if (subtitles.length)
        stream.subtitles = subtitles;
      streams.push(stream);
    }
    return streams;
  });
}
function cacheKey(type, id, season, episode) {
  return type === "series" ? `${type}:${id}:${season}:${episode}` : `${type}:${id}`;
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const started = Date.now();
    console.log(
      `[${LABEL}] getStreams id=${JSON.stringify(tmdbId)} mediaType=${JSON.stringify(
        mediaType
      )} season=${season} episode=${episode}`
    );
    const isMovie = String(mediaType || "").toLowerCase() === "movie";
    const id = parseTmdbId(tmdbId) || String(tmdbId || "");
    const key = cacheKey(isMovie ? "movie" : "series", id, Number(season) || 1, Number(episode) || 1);
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < hit.ttl) {
      console.log(`[${LABEL}] cache hit (${Date.now() - started}ms)`);
      return hit.value;
    }
    let failed = false;
    const pending = withTimeout(
      resolveStreams(tmdbId, mediaType, season, episode),
      TOTAL_BUDGET_MS,
      "resolve"
    ).catch((err) => {
      failed = true;
      console.log(`[${LABEL}] resolve failed: ${err.message}`);
      return [];
    });
    if (cache.size >= CACHE_MAX)
      cache.clear();
    const entry = { at: Date.now(), ttl: CACHE_TTL_MS, value: pending };
    cache.set(key, entry);
    const streams = yield pending;
    if (cache.get(key) === entry) {
      entry.ttl = failed ? 0 : streams.length ? CACHE_TTL_MS : EMPTY_TTL_MS;
      if (!streams.length)
        cache.delete(key);
    }
    console.log(`[${LABEL}] ${streams.length} stream(s) in ${Date.now() - started}ms`);
    for (const st of streams) {
      console.log(`[${LABEL}]   ${st.title} | ${st.quality} | ${st.url.slice(0, 90)}`);
    }
    return streams;
  });
}
module.exports = { getStreams };
