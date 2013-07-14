(function(){'use strict';var b = null, d = !1, i = Object, j = Function, E, Y, Z, $, fa;
function m(a, c) {
  return a.toString = c
}
function n(a, c) {
  return a.prototype = c
}
var p = "push", q = "match", r = "length", s = "propertyIsEnumerable", t = "prototype", u = "call";
function v(a) {
  return function(c) {
    this[a] = c
  }
}
function w(a) {
  return function() {
    return this[a]
  }
}
function y() {
}
function z(a) {
  var c = typeof a, e;
  if("object" == c) {
    if(a) {
      if(a instanceof Array) {
        return"array"
      }
      if(a instanceof i) {
        return c
      }
      e = i[t].toString[u](a);
      if("[object Window]" == e) {
        return"object"
      }
      if("[object Array]" == e || "number" == typeof a[r] && "undefined" != typeof a.splice && "undefined" != typeof a[s] && !a[s]("splice")) {
        return"array"
      }
      if("[object Function]" == e || "undefined" != typeof a[u] && "undefined" != typeof a[s] && !a[s]("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if("function" == c && "undefined" == typeof a[u]) {
      return"object"
    }
  }
  return c
}
function A(a) {
  return void 0 !== a
}
function B(a) {
  return"string" == typeof a
}
function C(a) {
  return"number" == typeof a
}
function D(a, c) {
  var e = a.split("."), g = E, f;
  !(e[0] in g) && g.execScript && g.execScript("var " + e[0]);
  for(;e[r] && (f = e.shift());) {
    !e[r] && A(c) ? g[f] = c : g = g[f] ? g[f] : g[f] = {}
  }
}
function F(a) {
  var c = G, e = j();
  n(e, c[t]);
  a.Ca = c[t];
  n(a, new e)
}
function H(a, c) {
  for(var e = 0;e < a[r];e++) {
    if(!0 === c(a[e], e, a)) {
      return e
    }
  }
  return-1
}
function G() {
  this.Q = I++
}
function J(a, c, e, g) {
  this.j = a;
  this.v = c;
  this.k = e;
  this.w = g
}
function K(a, c, e) {
  var g = 3 * e, f = 1 - e;
  return g * f * (f * a + g * c) + e * e * e
}
function L(a, c) {
  return 3 * ((c * (3 * c - 4) + 1) * a.j + c * ((2 - 3 * c) * a.k + c))
}
function M(a, c) {
  this.e = a;
  this.m = c
}
function N() {
  this.L = "melAnimation" + I++;
  this.c = []
}
function O() {
  N[u](this)
}
function P(a, c, e, g, f) {
  var h = new O, k, l;
  3 === arguments[r] && (e = c.duration, g = c.easing, k = c.progress, f = c.complete, h.O(c.delay), h.R(c.fillMode), h.direction(c.direction), h.W(c.iterationCount));
  h.duration(e);
  h.P(g);
  "function" == z(k) && h.$(k);
  "function" == z(f) && h.Z(f);
  for(l in c) {
    h.aa(l, c[l])
  }
  h.start();
  return h
}
E = j("return this")();
E.Aa = !0;
var I = 0, aa = "document" in E ? document.documentElement : b, ba = /([\w-]+?)\(([^)]*?)\)/, R = /^(-?\d*\.?\d+)(.*)$/, S = "performance" in E ? function() {
  return E.performance.timing.navigationStart + E.performance.now()
} : "now" in Date ? Date.now : function() {
  return+new Date
}, T = {f:[], Y:function(a) {
  var c = I++;
  this.f[p]({ma:a, za:c});
  this.i || this.M();
  return c
}, X:function(a) {
  var c = H(this.f, function(c) {
    return c.za === a
  });
  this.f.splice(c, 1);
  0 === this.f[r] && this.i && this.xa()
}, la:d, i:d, S:1E3 / 60, M:function() {
  this.i || (this.u = this.n = S(), this.i = !0);
  this.qa = this.la ? requestAnimationFrame(this.A, aa) : setTimeout(this.A, this.S)
}, xa:function() {
  this.i && (this.i = d, this.u = this.n = this.D = 0);
  (this.la ? cancelRequestAnimationFrame : clearTimeout)(this.qa)
}, n:0, u:0, D:0, A:function() {
  T.n = S();
  T.D = T.n - T.u;
  for(var a = 0, c = T.f[r];a < c;a++) {
    T.f[a].ma(T.D)
  }
  T.u = T.n;
  T.f[r] && T.M()
}, wa:function(a) {
  this.S = 1E3 / a
}};
T.attach = T.Y;
T.detach = T.X;
T.setFPS = T.wa;
var ca = /-[a-z]/g, U = j(), da = "create" in i ? i.create : function(a) {
  n(U, a);
  return new U
}, V = [];
G[t].Q = I++;
G[t].d = function(a) {
  return a
};
G[t].F = function(a) {
  return this.d === a.d
};
m(G[t], function() {
  return"" + this.Q
});
F(J);
J[t].d = function(a) {
  var c = a, e, g = 3, f, h = 0.0055 + a;
  do {
    f = L(this, c), e = K(this.j, this.k, c) - a, c = e = c - e / L(this, c - e / (2 * f))
  }while(0 !== g-- && 0 !== f && K(this.j, this.k, e) > h);
  return K(this.v, this.w, e)
};
J[t].F = function(a) {
  var c = this.v === a.v, e = this.k === a.k, g = this.w === a.w;
  return this.j === a.j && c && e && g
};
m(J[t], function() {
  return"cubic-bezier(" + this.j + ", " + this.v + ", " + this.k + ", " + this.w + ")"
});
F(M);
M[t].e = 0;
M[t].m = !0;
M[t].d = function(a) {
  return this.m ? Math.min(Math.ceil(this.e * a) / this.e, 1) : Math.floor(this.e * a) / this.e
};
M[t].F = function(a) {
  var c = this.m === a.m;
  return this.e === a.e && c
};
m(M[t], function() {
  return"steps(" + this.e + ", " + (this.m ? "start" : "end") + ")"
});
var W = {easeInCubic:[0.55, 0.055, 0.675, 0.19]}, X = {easeInCubic:function(a) {
  return a * a * a
}}, ea = new G;
D("Animation", N);
N[t].L = "none";
N[t].q = b;
N[t].ka = v("q");
N[t].setTarget = N[t].ka;
N[t].pa = w("q");
N[t].getTarget = N[t].pa;
N[t].c = b;
N[t].ja = function(a, c, e) {
  var g, f, h;
  g = H(this.c, function(c) {
    return c.K === a
  });
  -1 === g ? (f = {K:a, N:[], Ba:"", g:0, c:[]}, this.c[p](f)) : f = this.c[g];
  g = H(f.c, function(a) {
    return a.a === e
  });
  if(-1 === g) {
    g = {a:e, z:c, ra:d};
    f.c[p](g);
    c = f.c;
    for(g = 0;g < c[r] - 1;g += 1) {
      for(h = 0;h < c[r] - 1 - g;h += 1) {
        if(1 === (c[h].a === c[h + 1].a ? 0 : c[h].a < c[h + 1].a ? -1 : 1)) {
          f = c[h], c[h] = c[h + 1], c[h + 1] = f
        }
      }
    }
  }else {
    g = f.c[g], g.z = c.slice(0), g.ra = d
  }
};
N[t].setPropAt = N[t].ja;
N[t].V = function(a, c) {
  var e, g;
  e = H(this.c, function(c) {
    return c.K === a
  });
  return-1 !== e && (g = this.c[e], e = H(g.c, function(a) {
    return a.a === c
  }), -1 !== e) ? g.c[e].z : b
};
N[t].getPropAt = N[t].V;
N[t].ba = function(a, c) {
  this.q.style[a] = c[0] + "px"
};
N[t].ua = v("ba");
N[t].replaceRenderer = N[t].ua;
N[t].h = 0;
N[t].da = v("h");
N[t].setDelay = N[t].da;
N[t].C = 400;
N[t].fa = v("C");
N[t].setDuration = N[t].fa;
N[t].t = 1;
N[t].r = 1;
N[t].ia = function(a) {
  a === Number.POSITIVE_INFINITY ? this.t = this.r = Number.POSITIVE_INFINITY : isFinite(a) && 0 <= a && (this.t = a, this.r = Math.floor(a))
};
N[t].setIterations = N[t].ia;
N[t].I = d;
N[t].s = d;
N[t].ea = function(a) {
  this.I = 0 !== (a & 2);
  this.s = 0 !== (a & 1)
};
N[t].setDirection = N[t].ea;
N[t].T = function() {
  var a = 0;
  this.I && (a &= 2);
  this.s && (a &= 1);
  return a
};
N[t].getDirection = N[t].T;
N[t].H = !0;
N[t].G = d;
N[t].ha = function(a) {
  this.H = 0 !== (a & 2);
  this.G = 0 !== (a & 1)
};
N[t].setFillMode = N[t].ha;
N[t].U = function() {
  var a = 0;
  this.H && (a &= 2);
  this.G && (a &= 1);
  return a
};
N[t].getFillMode = N[t].U;
N[t].elapsedTime = 0;
N[t].p = ea;
N[t].ga = v("p");
N[t].setEasing = N[t].ga;
N[t].na = w("p");
N[t].getEasing = N[t].na;
N[t].l = 0;
N[t].b = 0;
N[t].B = 0;
N[t].oa = w("b");
N[t].getFractionalTime = N[t].oa;
N[t].A = function(a) {
  var c, e;
  this.elapsedTime += a;
  c = Math.max(this.elapsedTime - this.h, 0);
  this.l = c / this.C;
  e = Math.floor(this.l);
  0 < e ? (this.B = e > this.r ? this.r : e, e = this.l - e) : e = this.l;
  1 < e && (e = 1);
  (this.I ? this.s ? 0 === this.B % 2 : 1 === this.B % 2 : this.s) && (e = 1 - e);
  this.b = e;
  if(this.l < this.t) {
    this.update(), 0 < this.h && c <= a && this.elapsedTime >= this.h ? this.o !== y && this.o() : this.J !== y && 0 !== this.b && this.J()
  }else {
    if(this.stop(), this.oncomplete !== y) {
      this.oncomplete()
    }
  }
};
N[t].update = function() {
  for(var a = this.c, c = this.p.d(this.b), e, g = 0;g < a[r];g++) {
    var f = a[g], h = f.c, k, l;
    if(0 === this.b || 1 === this.b) {
      e = this.b, k = l = 0 === this.b ? h[0] : h[h[r] - 1]
    }else {
      k = h[f.g];
      l = h[f.g + 1];
      if(k.a > this.b || this.b >= l.a) {
        do {
          (!l || k.a > this.b) && f.g--, l.a < this.b && f.g++, k = h[f.g], l = h[f.g + 1]
        }while(k.a > this.b || l.a < this.b)
      }
      e = 0 === k.a && 1 === l.a ? c : this.p.d((this.b - k.a) / (l.a - k.a))
    }
    h = k.z;
    l = l.z;
    k = f.N;
    for(var Q = d, x = 0, ga = h[r];x < ga;x++) {
      Q = k[x] !== (k[x] = (l[x] - h[x]) * e + h[x] | 0) || Q
    }
    Q && this.ba(f.K, f.N)
  }
};
m(N[t], w("L"));
N[t].start = function() {
  this.elapsedTime = 0;
  this.G && this.update();
  0 >= this.h && this.o !== y && this.o();
  this.ca()
};
N[t].start = N[t].start;
N[t].stop = function() {
  this.H && (this.b = 1, this.update());
  this.pause()
};
N[t].stop = N[t].stop;
N[t].ca = function() {
  var a = this;
  this.ya = T.Y(function(c) {
    a.A(c)
  })
};
N[t].resume = N[t].ca;
N[t].pause = function() {
  T.X(this.ya)
};
N[t].pause = N[t].pause;
N[t].va = function() {
};
N[t].setClassicMode = N[t].va;
N[t].oncomplete = y;
N[t].Z = v("oncomplete");
N[t].onComplete = N[t].Z;
N[t].o = y;
N[t].ta = v("o");
N[t].onStart = N[t].ta;
N[t].J = y;
N[t].$ = v("J");
N[t].onStep = N[t].$;
N[t].sa = function() {
};
N[t].onIteration = N[t].sa;
n(O, da(N[t]));
O[t].target = function(a) {
  var c = typeof a;
  return"object" == c && a != b || "function" == c ? (this.ka(a), this) : this.q
};
D("AnimationWrap.prototype.target", O[t].target);
Y = {from:0, half:0.5, to:1};
O[t].aa = function(a, c, e) {
  var g = 1;
  if(A(e)) {
    if(C(e)) {
      g = e
    }else {
      if(B(e)) {
        if(e in Y) {
          g = Y[e]
        }else {
          if(e = e[q](R), "array" == z(e) && (!e[2] || "%" === e[2])) {
            g = 1 * e[1]
          }
        }
      }
    }
    1 < g && (g /= 100);
    if(0 > g || 1 < g) {
      g = 1
    }
  }
  return A(c) ? (c = [c], this.ja(a, c, g), this) : this.V(a, g)
};
D("AnimationWrap.prototype.propAt", O[t].aa);
Z = {slow:600, fast:200};
O[t].duration = function(a) {
  return A(a) ? (B(a) && (a in Z ? a = Z[a] : (a = a[q](R), a = a[1] * ("s" === a[2] ? 1E3 : 1)), 0 <= a && this.fa(a)), this) : this.C
};
D("AnimationWrap.prototype.duration", O[t].duration);
O[t].O = function(a) {
  return A(a) ? (B(a) && (a = a[q](R), a = a[1] * ("s" === a[2] ? 1E3 : 1), isFinite(a) && this.da(a)), this) : this.h
};
D("AnimationWrap.prototype.delay", O[t].O);
O[t].W = function(a) {
  return A(a) ? (a = "infinite" === a ? Number.POSITIVE_INFINITY : 1 * a, this.ia(a), this) : this.t
};
D("AnimationWrap.prototype.iterationCount", O[t].W);
$ = {normal:0, reverse:1, alternate:2, "alternate-reverse":0};
O[t].direction = function(a) {
  var c = -1;
  return A(a) ? (C(a) ? c = a : a in $ && (c = $[a]), -1 !== c && this.ea(c), this) : this.T()
};
D("AnimationWrap.prototype.direction", O[t].direction);
fa = {none:0, forwards:2, backwards:1, both:0};
O[t].R = function(a) {
  var c = -1;
  return A(a) ? (C(a) ? c = a : a in fa && (c = fa[a]), -1 !== c && this.ha(c), this) : this.U()
};
D("AnimationWrap.prototype.fillMode", O[t].R);
O[t].P = function(a) {
  var c, e, g, f;
  if(A(a)) {
    if(a instanceof G) {
      e = a
    }else {
      if("function" == z(a)) {
        e = new G, e.d = a
      }else {
        B(a) ? (f = a.replace(/^\s+|\s+$/g, ""), g = f.replace(ca, function(a) {
          return a.charAt(1).toUpperCase()
        }), g in W ? f = W[g] : (f = f[q](ba), f = f[2].replace(/\s+/g, "").split(","))) : "array" == z(a) && (f = a);
        a = f[r];
        if(4 == a) {
          f[0] = +f[0], f[1] = +f[1], f[2] = +f[2], f[3] = +f[3], 0 <= f[0] && (1 >= f[0] && 0 <= f[2] && 1 >= f[2]) && (c = new J(f[0], f[1], f[2], f[3]), g in X && (c.d = X[g]))
        }else {
          if(1 == a || 2 == a) {
            g = parseInt(f[0], 10), f = "start" === f[1], C(g) && (c = new M(g, f))
          }
        }
        e = A(c) ? c : b
      }
    }
    -1 === H(V, function(a) {
      return a.F(e)
    }) && V[p](e);
    c = e;
    c === b || this.ga(c);
    return this
  }
  return this.p
};
D("AnimationWrap.prototype.easing", O[t].P);
E.melAnim = P;
P.Animation = O;
P.Ticker = T;
})();