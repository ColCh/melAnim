(function(){/*
 melAnim.js by melky (coloured_chalk@mail.ru). Licensed under the GPLv3 license. */
'use strict';var ba = Object, ca = Function, da = document, d = Math, f = parseInt, l = parseFloat, D, K, Pa, Ta, Xa, Ya, Za, $a;
function n(a, c) {
  return a.toString = c
}
function ea(a, c) {
  return a.prototype = c
}
var fa = "push", p = "test", q = "replace", t = "data", u = "item", v = "indexOf", w = "color", x = "match", y = "length", ga = "propertyIsEnumerable", z = "prototype", A = "split", B = "style", ha = "call";
function C(a) {
  return function(c) {
    this[a] = c
  }
}
function ia(a) {
  return function() {
    return this[a]
  }
}
function E() {
}
function F(a) {
  var c = typeof a, b;
  if("object" == c) {
    if(a) {
      if(a instanceof Array) {
        return"array"
      }
      if(a instanceof ba) {
        return c
      }
      b = ba[z].toString[ha](a);
      if("[object Window]" == b) {
        return"object"
      }
      if("[object Array]" == b || "number" == typeof a[y] && "undefined" != typeof a.splice && "undefined" != typeof a[ga] && !a[ga]("splice")) {
        return"array"
      }
      if("[object Function]" == b || "undefined" != typeof a[ha] && "undefined" != typeof a[ga] && !a[ga]("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if("function" == c && "undefined" == typeof a[ha]) {
      return"object"
    }
  }
  return c
}
function G(a) {
  return void 0 !== a
}
function ja(a) {
  return null === a
}
function H(a) {
  return"string" == typeof a
}
function I(a) {
  return"number" == typeof a
}
function ka(a) {
  var c = typeof a;
  return"object" == c && null != a || "function" == c
}
function la(a, c) {
  var b = ca();
  ea(b, c[z]);
  a.Xa = c[z];
  ea(a, new b)
}
function ma(a, c) {
  for(var b = 0;b < a[y];b++) {
    if(!0 === c(a[b], b, a)) {
      return b
    }
  }
  return-1
}
function J(a, c) {
  var b = c ? K : na, e;
  if(a in b) {
    return a
  }
  e = oa(a);
  if(e in b) {
    return e
  }
  e = e.charAt(0).toUpperCase() + e.substr(1);
  if(!G(L)) {
    for(var g = 0, h = M[y];g < h;g++) {
      if(M[g] + e in b || M[g].toLowerCase() + e in b) {
        L = M[g], pa = M[g].toLowerCase()
      }
    }
  }
  if(G(L)) {
    if(L + e in b) {
      return L + e
    }
    if(pa + e in b) {
      return pa + e
    }
  }
  return""
}
function qa(a, c, b, e, g) {
  for(var h = !1, r, k, m = 0, s = a[y];m < s;m++) {
    r = e[m], k = c[m] - a[m], k = l((k * b + a[m]).toFixed(g)), r !== k && (e[m] = k, h = !0)
  }
  return h
}
function oa(a) {
  return a[q](ra, function(a) {
    return a.charAt(1).toUpperCase()
  })
}
function sa(a, c, b) {
  c = J(c, !1);
  if(!b) {
    return a[B][c]
  }
  if(ta) {
    return a = K.getComputedStyle(a, null), a[c]
  }
}
function ua(a, c, b, e) {
  if(!b) {
    return[]
  }
  if(c in N) {
    return N[c](a, c, b, e)
  }
  if(va[p](e)) {
    return N[w](a, c, b, e)
  }
  c = wa[p](e);
  O[p](b) || (b = 0);
  if(I(b)) {
    return[b]
  }
  var g = b[x](O), h = l(g[1]), g = g[2];
  if("" === g || "px" === g) {
    return[h]
  }
  if("%" === g && -1 !== e[v]("border")) {
    return h = h / 100 * (c ? a.clientWidth : a.clientHeight), [h]
  }
  P[B].cssText = "border-style:solid; border-width:0; position:absolute; line-height:0;";
  e = a;
  "%" !== g && e.appendChild ? P[B][c ? "borderLeftWidth" : "borderTopWidth"] = b : (e = a.parentNode || da.body, P[B][c ? "width" : "height"] = b);
  e.appendChild(P);
  a = P[c ? "offsetWidth" : "offsetHeight"];
  e.removeChild(P);
  return[a]
}
function Q(a) {
  this.a = a;
  this.l = []
}
function xa() {
}
function ya(a) {
  this.e = a;
  this.w = J(a);
  this.da = [];
  this.V = new xa;
  this.Y = new Q(null)
}
function R() {
}
function S() {
  this.ga = za++
}
function Aa(a, c, b, e) {
  this.t = a;
  this.I = c;
  this.u = b;
  this.J = e
}
function Ba(a, c) {
  this.h = a;
  this.p = c
}
function Ca(a, c, b) {
  0 > b && (b += 1);
  1 < b && (b -= 1);
  return 1 > 6 * b ? a + 6 * (c - a) * b : 1 > 2 * b ? c : 2 > 3 * b ? a + 6 * (c - a) * (2 / 3 - b) : a
}
function T() {
  this.data = [0, 0, 0, 0, [0, 0, 0]]
}
function U() {
  this.ca = "melAnimation" + za++;
  this.b = new R
}
function V() {
  U[ha](this)
}
function W(a, c, b, e, g) {
  var h = new V, r, k, m;
  h.target(a);
  3 === arguments[y] && ka(b) && (k = b, b = k.duration, e = k.easing, r = k.progress, g = k.complete, h.ea(k.delay), h.ia(k.fillMode), h.direction(k.direction), h.na(k.iterationCount));
  h.duration(b);
  h.fa(e);
  "function" == F(r) && h.ra(r);
  "function" == F(g) && h.qa(g);
  for(m in c) {
    h.sa(m, c[m])
  }
  h.start();
  return h
}
K = ca("return this")();
K.Sa = !0;
"DONT use strict";
var za = 0, Da = "document" in K ? da.documentElement : null, Ea = /([\w-]+?)\(([^)]*?)\)/, O = /^(-?\d*\.?\d+)(.*)$/, Fa = 1E3 / 60, na = Da[B], M = ["Ms", "O", "Moz", "WebKit"], L, pa, Ga = "performance" in K && "now" in K.performance ? function() {
  return K.performance.timing.navigationStart + K.performance.now()
} : "now" in Date ? Date.now : function() {
  return+new Date
}, Ha = "" !== J("requestAnimationFrame", !0), Ia, Ja;
Ha && (Ia = K[J("requestAnimationFrame", !0)], Ja = K[J("cancelRequestAnimationFrame", !0)]);
var X = {r:{}, H:0, pa:function(a) {
  var c = za++;
  this.r[c] = a;
  this.H++;
  this.j || this.N();
  return c
}, oa:function(a) {
  a in this.r && (delete this.r[a], this.H--, 0 === this.H && this.j && this.X())
}, Z:Ha, j:!1, ja:Fa, N:function() {
  this.j || (this.G = this.q = Ga(), this.j = !0, this.Ka = this.Z ? Ia(this.M, Da) : setTimeout(this.M, this.ja))
}, X:function() {
  this.j && (this.j = !1, this.G = this.q = this.A = 0, (this.Z ? Ja : clearTimeout)(this.Ka))
}, q:0, G:0, A:0, M:function() {
  X.q = Ga();
  X.A = X.q - X.G;
  if(X.A) {
    for(var a in X.r) {
      X.r[a](X.A)
    }
    X.G = X.q
  }
  X.H ? (X.j = !1, X.N()) : X.X()
}, Ua:60, Qa:function(a) {
  this.ja = 1E3 / a
}, Ia:function(a) {
  this.X();
  this.Z = Ha && !Boolean(a);
  this.N()
}}, ra = /-[a-z]/g, Ka = ca(), La = "create" in ba ? ba.create : function(a) {
  ea(Ka, a);
  return new Ka
}, ta = "getComputedStyle" in K, P = da.createElement("div"), wa = /(?:left|right|width)/i, va = /color/i, N = {}, Y = {}, Ma = {"fill-opacity":!0, "font-weight":!0, "line-height":!0, opacity:!0, orphans:!0, widows:!0, "z-index":!0, zoom:!0}, Z = {}, Na = 360 / (2 * d.PI), Oa = 400 / 360, $ = {grad:function(a) {
  return a * Oa
}, rad:function(a) {
  return a * Na
}, turn:function(a) {
  return 360 * a
}};
Q[z].a = 1;
Q[z].m = "";
Q[z].Ca = function(a) {
  this.l.length = 0;
  this.l[fa].apply(this.l, a)
};
Q[z].T = function() {
  return this.l[y] ? this.l.concat() : null
};
la(xa, Array);
D = xa[z];
D.indexOf = function(a) {
  return ma(this, function(c) {
    return c.a === a
  })
};
D.add = function(a) {
  a = new Q(a);
  this[fa](a);
  for(var c, b = 0, e;b < this[y] - 1;b += 1) {
    for(e = 0;e < this[y] - 1 - b;e += 1) {
      1 === (this[e].a === this[e + 1].a ? 0 : this[e].a < this[e + 1].a ? -1 : 1) && (c = this[e], this[e] = this[e + 1], this[e + 1] = c)
    }
  }
  return a
};
D.i = 0;
D.Ja = function(a) {
  var c, b;
  if(2 > this[y]) {
    return-1
  }
  c = this[this.i];
  b = this[this.i + 1];
  if(c.a > a || a >= b.a) {
    do {
      (!b || c.a > a) && this.i--, b.a < a && this.i++, c = this[this.i], b = this[this.i + 1]
    }while(c.a > a || b.a < a)
  }
  return this.i
};
D.item = function(a) {
  return this[a]
};
ya[z].e = "";
ya[z].w = "";
la(R, Array);
R[z].indexOf = function(a) {
  return ma(this, function(c) {
    return c.e === a
  })
};
R[z].add = function(a) {
  a = new ya(a);
  this[fa](a);
  return a
};
R[z].item = function(a) {
  return this[a]
};
Pa = {ha:[], Oa:function(a) {
  var c, b = Pa;
  a instanceof S ? c = a : "function" == F(a) ? (c = new S, c.f = a) : c = b.Ea(a);
  if(null === c) {
    return null
  }
  -1 === ma(b.ha, function(a) {
    return a.Q(c)
  }) && b.ha[fa](c);
  return c
}, Ea:function(a) {
  var c, b, e;
  H(a) ? (a = a[q](/^\s+|\s+$/g, ""), b = oa(a), b in Qa ? e = Qa[b] : Ea[p](a) && (e = a[x](Ea), e = e[2][q](/\s+/g, "")[A](","))) : "array" == F(a) && (e = a);
  a = "array" == F(e) ? e[y] : 0;
  if(4 == a) {
    e[0] = +e[0], e[1] = +e[1], e[2] = +e[2], e[3] = +e[3], 0 <= e[0] && (1 >= e[0] && 0 <= e[2] && 1 >= e[2]) && (c = new Aa(e[0], e[1], e[2], e[3]), b in Ra && (c.f = Ra[b]))
  }else {
    if(1 == a || 2 == a) {
      b = f(e[0], 10), e = "start" === e[1], I(b) && (c = new Ba(b, e))
    }
  }
  return G(c) ? c : null
}};
S[z].ga = za++;
S[z].f = function(a) {
  return a
};
S[z].Q = function(a) {
  return this.f === a.f
};
n(S[z], function() {
  return"" + this.ga
});
la(Aa, S);
D = Aa[z];
D.$ = function(a, c, b) {
  var e = 3 * b, g = 1 - b;
  return e * g * (g * a + e * c) + b * b * b
};
D.aa = function(a) {
  return this.$(this.t, this.u, a)
};
D.ba = function(a) {
  return 3 * ((a * (3 * a - 4) + 1) * this.t + a * ((2 - 3 * a) * this.u + a))
};
D.Da = function(a) {
  return this.$(this.I, this.J, a)
};
D.f = function(a) {
  var c = a, b, e = 3, g, h = 0.0055 + a;
  do {
    g = this.ba(c), b = this.aa(c) - a, c = b = c - b / this.ba(c - b / (2 * g))
  }while(0 !== e-- && 0 !== g && this.aa(b) > h);
  return this.Da(b)
};
D.Q = function(a) {
  var c = this.I === a.I, b = this.u === a.u, e = this.J === a.J;
  return this.t === a.t && c && b && e
};
n(D, function() {
  return"cubic-bezier(" + this.t + ", " + this.I + ", " + this.u + ", " + this.J + ")"
});
la(Ba, S);
D = Ba[z];
D.h = 0;
D.p = !0;
D.f = function(a) {
  return this.p ? d.min(d.ceil(this.h * a) / this.h, 1) : d.floor(this.h * a) / this.h
};
D.Q = function(a) {
  var c = this.p === a.p;
  return this.h === a.h && c
};
n(D, function() {
  return"steps(" + this.h + ", " + (this.p ? "start" : "end") + ")"
});
N.color = function(a, c, b) {
  if(b in Sa) {
    return Sa[b]
  }
  if(-1 !== b[v]("#")) {
    return a = f(b, 16), [a >> 16 & 255, a >> 8 & 255, a & 255]
  }
  a = b[x](Ea);
  c = a[1];
  b = a[2][q](/\s+/g, "")[A](",");
  for(var e = 0;e < b[y];e++) {
    a = b[e][x](O), b[e] = [f(a[1]), a[2]]
  }
  return c in Ta ? Ta[c](b) : [0, 0, 0]
};
Ta = {hsl:function(a) {
  var c = a[0][0], b = a[1][0] / 100;
  a = a[2][0] / 100;
  b = 0.5 >= a ? a * (b + 1) : a + b - a * b;
  a = 2 * a - b;
  return[255 * Ca(a, b, c + 1 / 3), 255 * Ca(a, b, c), 255 * Ca(a, b, c - 1 / 3)]
}, rgb:function(a) {
  for(var c = 0;c < a[y];c++) {
    "%" === a[c][1] && (a[c][0] /= 100, a[c][0] *= 255), 0 > a[c][0] ? a[c][0] = 0 : 255 < a[c][0] && (a[c][0] = 255)
  }
  return[a[0][0], a[1][0], a[2][0]]
}};
Y.color = function(a, c, b) {
  return"rgb(" + b.toString() + ")"
};
Z.color = function(a, c, b, e) {
  0 > b ? b = 0 : 1 < b && (b = 1);
  return qa(a, c, b, e, 1)
};
var Ua = /\s(?![-\.\d])/, Va = {scaleX:function(a, c) {
  c[1] = 100 * l(a[0])
}, scaleY:function(a, c) {
  c[2] = 100 * l(a[0])
}, scale:function(a, c) {
  c[1] = 100 * l(a[0]);
  c[2] = 100 * l(a[1])
}, rotate:function(a, c) {
  var b, e = a[0][x](O);
  b = f(e[1], 10);
  e = e[2];
  b = e in $ ? $[e](b) : b;
  c[0] = b
}, skewX:function(a, c) {
  c[3] = f(a[0])
}, skewY:function(a, c) {
  c[4] = f(a[0])
}, skew:function(a, c) {
  c[3] = f(a[0]);
  c[4] = f(a[1])
}, translateX:function(a, c) {
  c[5] = l(a[0])
}, translateY:function(a, c) {
  c[6] = l(a[0])
}, translate:function(a, c) {
  c[5] = l(a[0]);
  c[6] = l(a[1])
}, matrix:function(a, c) {
  for(var b = 0;b < a[y];b++) {
    a[b] = l(a[b])
  }
  c[5] = a[4];
  c[6] = a[5];
  b = d.sqrt(a[0] * a[0] + a[1] * a[1]);
  c[1] = 100 * b;
  a[0] /= b;
  a[1] /= b;
  b = a[0] * a[2] + a[1] * a[3];
  c[3] = $.rad(b);
  a[2] -= b * a[0];
  a[3] -= b * a[1];
  b = d.sqrt(a[2] * a[2] + a[3] * a[3]);
  c[2] = 100 * b;
  a[2] /= b;
  a[3] /= b;
  b = a[0] * a[4] + a[1] * a[5];
  c[4] = $.rad(b);
  a[4] -= b * a[0];
  a[5] -= b * a[1];
  b = d.sqrt(a[4] * a[4] + a[5] * a[5]);
  a[4] /= b;
  a[5] /= b;
  c[0] = $.rad(d.atan2(a[1], a[0]))
}};
N.transform = function(a, c, b) {
  a = [0, 100, 100, 0, 0, 0, 0];
  if("none" !== b && "" !== b) {
    var e, g;
    b = b[A](Ua);
    for(c = 0;c < b[y];c++) {
      e = b[c][x](Ea), g = e[1], e = e[2][q](/\s+/g, "")[A](","), Va[g](e, a)
    }
    return a
  }
};
Y.transform = function(a, c, b) {
  a = "";
  0 !== b[0] % 360 && (a += " rotate(" + b[0] + "deg)");
  if(0 !== b[3] || 0 !== b[4]) {
    a += " skew(" + b[3] + "deg," + b[4] + "deg)"
  }
  if(0 !== b[5] || 0 !== b[6]) {
    a += " translate(" + b[5] + "px," + b[6] + "px)"
  }
  if(100 !== b[1] || 100 !== b[2]) {
    a += " scale(" + b[1] / 100 + "," + b[2] / 100 + ")"
  }
  return a
};
T[z].d = !1;
T[z].k = !1;
T[z].parse = function(a) {
  if("none" === a) {
    this.k = !0
  }else {
    var c = a[x](/(?:inset\s)?(?:\s*-?\d*\.?\d+\w*\s*){2,4}/)[0];
    a = a[q](c, "");
    this[t][4] = N[w](null, "color", a, !1);
    for(var c = c[A](" "), b = a = 0;b < c[y];b++) {
      "inset" == c[b] ? this.d = !0 : O[p](c[b]) && (this[t][a++] = 10 * l(c[b]))
    }
  }
};
n(T[z], function() {
  var a = "", c;
  this.d && (a += "inset ");
  for(c = 0;4 > c;c++) {
    if(1 < c || 0 !== this[t][c]) {
      a += this[t][c] / 10 + "px "
    }
  }
  return a += N[w](null, "color", this[t][4], !0)
});
N["text-shadow"] = N["box-shadow"] = function(a) {
  var c, b;
  c = a[A](/,\s*(?![^\)]+\))/);
  for(b = 0;b < c[y];b++) {
    a = new T, a.parse(c[b]), c[b] = a
  }
  return c
};
Z["text-shadow"] = Z["box-shadow"] = function(a, c, b, e, g) {
  var h = !1, r, k, m, s, aa;
  e = g in e ? e[g] : e[g] = [];
  g = a[y] > c[y] ? a[y] : c[y];
  for(s = 0;s < g;s++) {
    if(s in a ? k = a[s] : (k = a[s] = new T, k.k = !0), s in c ? m = c[s] : (m = c[s] = new T, m.k = !0), k.d === m.d || k.k || m.k) {
      s in e ? r = e[s] : (r = e[s] = new T, r.d = k.k ? m.d : m.k ? k.d : k.d && m.d, h = !0);
      for(aa = 0;4 > aa;aa++) {
        qa(k[t][aa], m[t][aa], b, r[t], "" + aa) && !1 === h && (h = !0)
      }
      Z[w](k[t][4], m[t][4], b, r[t], "4") && !h && (h = !0)
    }
  }
  return h
};
Z.opacity = function(a, c, b, e) {
  return qa(a, c, b, e, 2)
};
var Qa = {easeInCubic:[0.55, 0.055, 0.675, 0.19]}, Ra = {easeInCubic:function(a) {
  return a * a * a
}}, Sa = {Ta:[0, 0, 0], blue:[0, 0, 255], Za:[255, 255, 255], $a:[255, 255, 0], Wa:[255, 165, 0], Va:[128, 128, 128], green:[0, 128, 0], red:[255, 0, 0], Ya:[255, 255, 255]}, Wa = new S;
U[z].ca = "none";
U[z].Ba = C("c");
U[z].setTarget = U[z].Ba;
U[z].Ha = ia("c");
U[z].getTarget = U[z].Ha;
U[z].b = null;
U[z].L = function(a, c, b, e) {
  var g = this.b[v](a);
  a = (-1 === g ? this.b.add(a) : this.b[u](g)).V;
  g = a[v](b);
  b = -1 !== g ? a[u](g) : a.add(b);
  b.Ca(c);
  b.m = H(e) ? e : ""
};
U[z].setPropAt = U[z].L;
U[z].B = function(a, c) {
  var b;
  b = this.b[v](a);
  return-1 !== b && (b = this.b[u](b), b = b.V, -1 !== b[v](c)) ? (b = b[u](c), b.T()) : null
};
U[z].getPropAt = U[z].B;
U[z].Aa = function(a, c, b) {
  var e = this.b[v](a);
  a = (-1 === e ? this.b.add(a) : this.b[u](e)).Y;
  a.Ca(c);
  a.m = H(b) ? b : ""
};
U[z].setStartingValue = U[z].Aa;
U[z].ma = function(a) {
  a = this.b[v](a);
  return-1 !== a ? (a = this.b[u](a), a.Y.T()) : null
};
U[z].getStartingValue = U[z].ma;
U[z].K = function(a, c, b) {
  c = H(c) ? c : null === c ? "" : va[p](b) ? Y[w](this.c, a, c, b) : a in Y ? Y[a](this.c, a, c, b) : c + (a in Ma ? "" : "px");
  var e = this.c;
  a = b || J(a);
  e[B][a] = c
};
U[z].n = 0;
U[z].ua = C("n");
U[z].setDelay = U[z].ua;
U[z].P = 400;
U[z].wa = C("P");
U[z].setDuration = U[z].wa;
U[z].F = 1;
U[z].C = 1;
U[z].za = function(a) {
  a === Number.POSITIVE_INFINITY ? this.F = this.C = Number.POSITIVE_INFINITY : isFinite(a) && 0 <= a && (this.F = a, this.C = d.floor(a))
};
U[z].setIterations = U[z].za;
U[z].U = !1;
U[z].D = !1;
U[z].va = function(a) {
  this.U = 0 !== (a & 2);
  this.D = 0 !== (a & 1)
};
U[z].setDirection = U[z].va;
U[z].ka = function() {
  var a = 0;
  this.U && (a &= 2);
  this.D && (a &= 1);
  return a
};
U[z].getDirection = U[z].ka;
U[z].La = function() {
  return this.U ? this.D ? 0 === this.O % 2 : 1 === this.O % 2 : this.D ? !0 : !1
};
U[z].S = !0;
U[z].R = !1;
U[z].ya = function(a) {
  this.S = 0 !== (a & 2);
  this.R = 0 !== (a & 1)
};
U[z].setFillMode = U[z].ya;
U[z].la = function() {
  var a = 0;
  this.S && (a |= 2);
  this.R && (a |= 1);
  return a
};
U[z].getFillMode = U[z].la;
U[z].elapsedTime = 0;
U[z].v = Wa;
U[z].xa = C("v");
U[z].setEasing = U[z].xa;
U[z].Fa = ia("v");
U[z].getEasing = U[z].Fa;
U[z].o = 0;
U[z].g = 0;
U[z].O = 0;
U[z].Ga = ia("g");
U[z].getFractionalTime = U[z].Ga;
U[z].M = function(a) {
  var c, b;
  this.elapsedTime += a;
  c = d.max(this.elapsedTime - this.n, 0);
  this.o = c / this.P;
  b = d.floor(this.o);
  0 < b ? (this.O = b > this.C ? this.C : b, b = this.o - b) : b = this.o;
  1 < b && (b = 1);
  this.La() && (b = 1 - b);
  this.g = b;
  if(this.o < this.F) {
    this.update(), 0 < this.n && c <= a && this.elapsedTime >= this.n ? this.s !== E && this.s() : this.W !== E && 0 !== this.g && this.W()
  }else {
    if(this.stop(), this.oncomplete !== E) {
      this.oncomplete()
    }
  }
};
U[z].update = function() {
  for(var a, c, b, e = null, g, h, r, k = qa, m = 0;m < this.b[y];m++) {
    b = this.b[u](m), c = b.V, a = c.Ja(this.g), h = c[u](a), c = c[u](a + 1), a = 0 === h.a && 1 === c.a ? this.g : (this.g - h.a) / (c.a - h.a), 0 === a || 1 === a ? (r = 0 === a ? h : c, r.m[y] && this.K(b.e, r.m, b.w)) : a === this.g ? (null === e && (e = this.v.f(a)), g = e) : g = this.v.f(a), r || (va[p](b.e) ? k = Z[w] : b.e in Z && (k = Z[b.e]), k(h.l, c.l, g, b.da, 0) && this.K(b.e, b.da, b.w))
  }
};
n(U[z], ia("ca"));
U[z].start = function() {
  this.elapsedTime = 0;
  this.R && this.update();
  0 >= this.n && this.s !== E && this.s();
  this.ta()
};
U[z].start = U[z].start;
U[z].stop = function() {
  if(this.S) {
    this.g = 1, this.update()
  }else {
    for(var a = 0;a < this.b[y];a++) {
      var c = this.b[u](a), b = c.Y;
      b.m[y] ? this.K(c.e, b.m, c.w) : this.K(c.e, b.T(), c.w)
    }
  }
  this.pause()
};
U[z].stop = U[z].stop;
U[z].ta = function() {
  var a = this;
  this.Ra = X.pa(function(c) {
    a.M(c)
  })
};
U[z].resume = U[z].ta;
U[z].pause = function() {
  X.oa(this.Ra)
};
U[z].pause = U[z].pause;
U[z].Pa = function() {
};
U[z].setClassicMode = U[z].Pa;
U[z].oncomplete = E;
U[z].qa = C("oncomplete");
U[z].onComplete = U[z].qa;
U[z].s = E;
U[z].Na = C("s");
U[z].onStart = U[z].Na;
U[z].W = E;
U[z].ra = C("W");
U[z].onStep = U[z].ra;
U[z].Ma = function() {
};
U[z].onIteration = U[z].Ma;
ea(V, La(U[z]));
V[z].target = function(a) {
  return ka(a) ? (this.Ba(a), this) : this.c
};
V[z].target = V[z].target;
Xa = {from:0, half:0.5, to:1};
V[z].sa = function(a, c, b) {
  var e = 1;
  G(b) && (I(b) ? e = b : H(b) && (b in Xa ? e = Xa[b] : (b = b[x](O), "array" != F(b) || b[2] && "%" !== b[2] || (e = +b[1]))), 1 < e && (e /= 100), 0 > e || 1 < e) && (e = 1);
  return G(c) ? (b = "array" == F(c) ? c : I(c) ? [c] : ua(this.c, a, c, J(a)), this.L(a, b, e, H(c) ? c : ""), ja(this.B(a, 0)) && (c = sa(this.c, a, !0), b = ua(this.c, a, c, J(a)), this.L(a, b, 0, c)), ja(this.B(a, 1)) && (c = sa(this.c, a, !0), b = ua(this.c, a, c, J(a)), this.L(a, b, 1, c)), ja(this.ma(a)) && (c = sa(this.c, a, !1), b = ua(this.c, a, c, J(a)), this.Aa(a, b, c)), this) : this.B(a, e)
};
V[z].propAt = V[z].sa;
Ya = {slow:600, fast:200};
V[z].duration = function(a) {
  var c;
  return G(a) ? (I(a) ? c = a : H(a) && (a in Ya ? c = Ya[a] : (a = a[x](O), c = a[1] * ("s" === a[2] ? 1E3 : 1))), 0 <= c && this.wa(c), this) : this.P
};
V[z].duration = V[z].duration;
V[z].ea = function(a) {
  var c;
  return G(a) ? (I(a) ? c = a | 0 : H(a) && (a = a[x](O), c = a[1] * ("s" === a[2] ? 1E3 : 1)), isFinite(c) && this.ua(c), this) : this.n
};
V[z].delay = V[z].ea;
V[z].na = function(a) {
  return G(a) ? (a = "infinite" === a ? Number.POSITIVE_INFINITY : 1 * a, this.za(a), this) : this.F
};
V[z].iterationCount = V[z].na;
Za = {normal:0, reverse:1, alternate:2, "alternate-reverse":0};
V[z].direction = function(a) {
  var c = -1;
  return G(a) ? (I(a) ? c = a : a in Za && (c = Za[a]), -1 !== c && this.va(c), this) : this.ka()
};
V[z].direction = V[z].direction;
$a = {none:0, forwards:2, backwards:1, both:0};
V[z].ia = function(a) {
  var c = -1, b = "", c, e;
  if(G(a)) {
    return I(a) ? c = a : a in $a && (c = $a[a]), -1 !== c && this.ya(c), this
  }
  c = this.la();
  for(e in $a) {
    if($a[e] === c) {
      b = e;
      break
    }
  }
  return b
};
V[z].fillMode = V[z].ia;
V[z].fa = function(a) {
  return G(a) ? (a = Pa.Oa(a), null === a || this.xa(a), this) : this.v
};
V[z].easing = V[z].fa;
K.melAnim = W;
W.Animation = V;
W.css = function(a, c, b) {
  if(H(b)) {
    c = J(c), a[B][c] = b
  }else {
    return sa(a, c, !0)
  }
};
W.now = Ga;
W.Ticker = X;
X.attach = X.pa;
X.detach = X.oa;
X.setFPS = X.Qa;
X.ignoreReflow = X.Ia;
})();