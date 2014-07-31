/*!
 * HTMLHint v0.9.3
 * https://github.com/yaniswang/HTMLHint
 *
 * (c) 2013 Yanis Wang <yanis.wang@gmail.com>.
 * MIT Licensed
 */
var HTMLHint = function (e) {
    var t = {};
    
    return t.version = "0.9.3", t.rules = {}, t.defaultRuleset = {"tagname-lowercase": !0, "attr-lowercase": !0, "attr-value-double-quotes": !0, "doctype-first": !0, "tag-pair": !0, "spec-char-escape": !0, "id-unique": !0}, t.addRule = function (e) {
        t.rules[e.id] = e
    }, t.verify = function (a, r) {

        r===e&&(r=t.defaultRuleset);
        /*
        for (var key in rin)
        {
            if (typeof t.defaultRuleset[key] != 'undefined')
            {
                t.defaultRuleset[key] = rin[key];
            }
            else
            {
                t.defaultRuleset[key] = rin[key];
            }
        }
        var r = t.defaultRuleset; */
        var i, n = new HTMLParser, s = new t.Reporter(a.split(/\r?\n/), r), o = t.rules;
        for (var l in r)
        {
            if (r[l] !== false) {
                i = o[l], i !== e && i.init(n, s, r[l]);
            }
        }
        return n.parse(a), s.messages
    }, t
}();
"object" == typeof exports && exports && (exports.HTMLHint = HTMLHint), function (e) {

    
    var t = function () {
        var e = this;
        e._init.apply(e, arguments)
    };
    t.prototype = {_init: function (e, t) {
            var a = this;
            a.lines = e, a.ruleset = t, a.messages = []
        }, error: function (e, t, a, r, i) {
            this.report("error", e, t, a, r, i)
        }, warn: function (e, t, a, r, i) {
            this.report("warning", e, t, a, r, i)
        }, info: function (e, t, a, r, i) {
            this.report("info", e, t, a, r, i)
        }, report: function (e, t, a, r, i, n) {
            var s = this;
            s.messages.push({type: e, message: t, raw: n, evidence: s.lines[a - 1], line: a, col: r, rule: {id: i.id, description: i.description, link: "https://github.com/yaniswang/HTMLHint/wiki/" + i.id}})
        }}, e.Reporter = t
}(HTMLHint);

HTMLHint.selfCloseTags = "area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed,cp:footnote,cp:include,cp:set,cp:unset";

var HTMLParser = function (e) {

    var t = function () {
        var e = this;
        e._init.apply(e, arguments)
    };
    return t.prototype = {_init: function () {
            var e = this;
            e._listeners = {}, e._mapCdataTags = e.makeMap("script,style"), e._arrBlocks = []
        }, makeMap: function (e) {
            for (var t = {}, a = e.split(","), r = 0; a.length > r; r++)
                t[a[r]] = !0;
            return t
        }, parse: function (t) {
            function a (t, a, r, i) {
                var n = r - w + 1;
                i === e && (i = {}), i.raw = a, i.pos = r, i.line = L, i.col = n, b.push(i), u.fire(t, i);
                for (var s; s = m.exec(a); )
                    L++, w = r + m.lastIndex
            }
            var r, i, n, s, o, l, d, c, u = this, g = u._mapCdataTags, f = /<(?:\/([^\s>]+)\s*|!--([\s\S]*?)--|!([^>]*?)|([\w\-:]+)((?:\s+[\w\-:]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"']+))?)*?)\s*(\/?))>/g, p = /\s*([\w\-:]+)(?:\s*=\s*(?:(")([^"]*)"|(')([^']*)'|([^\s"']+)))?/g, m = /\r?\n/g, v = 0, h = 0, w = 0, L = 1, b = u._arrBlocks;
            for (u.fire("start", {pos:0, line:1, col:1}); r = f.exec(t); )
                if (i = r.index, i > v && (c = t.substring(v, i), o ? d.push(c) : a("text", c, v)), v = f.lastIndex, !(n = r[1]) || (o && n === o && (c = d.join(""), a("cdata", c, h, {tagName: o, attrs: l}), o = null, l = null, d = null), o))
                    if (o)
                        d.push(r[0]);
                    else if (n = r[4]) {
                        s = [];
                        for (var H, y = r[5], T = 0; H = p.exec(y); ) {
                            var x = H[1], M = H[2] ? H[2] : H[4] ? H[4] : "", N = H[3] ? H[3] : H[5] ? H[5] : H[6] ? H[6] : "";
                            s.push({name: x, value: N, quote: M, index: H.index, raw: H[0]}), T += H[0].length
                        }
                        T === y.length ? (a("tagstart", r[0], i, {tagName: n, attrs: s, close: r[6]}), g[n] && (o = n, l = s.concat(), d = [], h = v)) : a("text", r[0], i)
                    } else
                        (r[2] || r[3]) && a("comment", r[0], i, {content: r[2] || r[3], "long": r[2] ? !0 : !1});
                else
                    a("tagend", r[0], i, {tagName: n});
            t.length > v && (c = t.substring(v, t.length), a("text", c, v)), u.fire("end", {pos: v, line: L, col: v - w + 1})
        }, addListener: function (t, a) {
            for (var r, i = this._listeners, n = t.split(/[,\s]/), s = 0, o = n.length; o > s; s++)
                r = n[s], i[r] === e && (i[r] = []), i[r].push(a)
        }, fire: function (t, a) {
            a === e && (a = {}), a.type = t;
            var r = this, i = [], n = r._listeners[t], s = r._listeners.all;
            n !== e && (i = i.concat(n)), s !== e && (i = i.concat(s));
            for (var o = 0, l = i.length; l > o; o++)
                i[o].call(r, a)
        }, removeListener: function (t, a) {
            var r = this._listeners[t];
            if (r !== e)
                for (var i = 0, n = r.length; n > i; i++)
                    if (r[i] === a) {
                        r.splice(i, 1);
                        break
                    }
        }, fixPos: function (e, t) {
            var a, r = e.raw.substr(0, t), i = r.split(/\r?\n/), n = i.length - 1, s = e.line;
            return n > 0 ? (s += n, a = i[n].length + 1) : a = e.col + t, {line: s, col: a}
        }, getMapAttrs: function (e) {
            for (var t, a = {}, r = 0, i = e.length; i > r; r++)
                t = e[r], a[t.name] = t.value;
            return a
        }}, t
}();

"object" == typeof exports && exports && (exports.HTMLParser = HTMLParser), HTMLHint.addRule({id: "attr-lowercase", description: "Attribute name must be lowercase.", init: function (e, t) {
        var a = this;
        
        e.addListener("tagstart", function (e) {
            for (var r, i = e.attrs, n = e.col + e.tagName.length + 1, s = 0, o = i.length; o > s; s++) {
                r = i[s];
                var l = r.name;
                l !== l.toLowerCase() && t.error("Attribute name [ " + l + " ] must be lower case.", e.line, n + r.index, a, r.raw)
            }
        })
    }}), HTMLHint.addRule({id: "attr-value-double-quotes", description: "Attribute value must closed by double quotes.", init: function (e, t) {
        var a = this;
        e.addListener("tagstart", function (e) {
            for (var r, i = e.attrs, n = e.col + e.tagName.length + 1, s = 0, o = i.length; o > s; s++)
                r = i[s], '"' === r.quote || "" === r.value && "" !== (r.value === r.quote) || t.error("The value of attribute [ " + r.name + " ] must closed by double quotes.", e.line, n + r.index, a, r.raw)
        })
    }}), HTMLHint.addRule({id: "attr-value-not-empty", description: "Attribute must set value.", init: function (e, t) {
        var a = this;
        e.addListener("tagstart", function (e) {
            for (var r, i = e.attrs, n = e.col + e.tagName.length + 1, s = 0, o = i.length; o > s; s++)
                r = i[s], "" === r.quote && "" === r.value && t.warn("The attribute [ " + r.name + " ] must set value.", e.line, n + r.index, a, r.raw)
        })
    }}), HTMLHint.addRule({id: "csslint", description: "Scan css with csslint.", init: function (e, t, a) {
        var r = this;
        e.addListener("cdata", function (e) {
            if ("style" === e.tagName.toLowerCase()) {
                var i;
                if (i = "object" == typeof exports && require ? require("csslint").CSSLint.verify : CSSLint.verify, void 0 !== a) {
                    var n = e.line - 1, s = e.col - 1;
                    try {
                        var o = i(e.raw, a).messages;
                        o.forEach(function (e) {
                            var a = e.line;
                            t["warning" === e.type ? "warn" : "error"]("[" + e.rule.id + "] " + e.message, n + a, (1 === a ? s : 0) + e.col, r, e.evidence)
                        })
                    } catch (l) {
                    }
                }
            }
        })
    }}), HTMLHint.addRule({id: "doctype-first", description: "Doctype must be first.", init: function (e, t) {
        var a = this, r = function (i) {
            "start" === i.type || "text" === i.type && /^\s*$/.test(i.raw) || (("comment" !== i.type && i.long === !1 || /^DOCTYPE\s+/i.test(i.content) === !1) && t.error("Doctype must be first.", i.line, i.col, a, i.raw), e.removeListener("all", r))
        };
        e.addListener("all", r)
    }}), HTMLHint.addRule({id: "doctype-html5", description: "Doctype must be html5.", init: function (e, t) {
        function a (e) {
            e.long === !1 && "doctype html" !== e.content.toLowerCase() && t.warn("Doctype must be html5.", e.line, e.col, i, e.raw)
        }
        function r () {
            e.removeListener("comment", a), e.removeListener("tagstart", r)
        }
        var i = this;
        e.addListener("all", a), e.addListener("tagstart", r)
    }}), HTMLHint.addRule({id: "head-script-disabled", description: "The script tag can not be used in head.", init: function (e, t) {
        function a (e) {
            "script" === e.tagName.toLowerCase() && t.warn("The script tag can not be used in head.", e.line, e.col, i, e.raw)
        }
        function r (t) {
            "head" === t.tagName.toLowerCase() && (e.removeListener("tagstart", a), e.removeListener("tagstart", r))
        }
        var i = this;
        e.addListener("tagstart", a), e.addListener("tagend", r)
    }}), HTMLHint.addRule({id: "id-class-value", description: "Id and class value must meet some rules.", init: function (e, t, a) {
        var r, i = this, n = {underline: {regId: /^[a-z\d]+(_[a-z\d]+)*$/, message: "Id and class value must lower case and split by underline."}, dash: {regId: /^[a-z\d]+(-[a-z\d]+)*$/, message: "Id and class value must lower case and split by dash."}, hump: {regId: /^[a-z][a-zA-Z\d]*([A-Z][a-zA-Z\d]*)*$/, message: "Id and class value must meet hump style."}};
        if (r = "string" == typeof a ? n[a] : a, r && r.regId) {
            var s = r.regId, o = r.message;
            e.addListener("tagstart", function (e) {
                for (var a, r = e.attrs, n = e.col + e.tagName.length + 1, l = 0, d = r.length; d > l; l++)
                    if (a = r[l], "id" === a.name.toLowerCase() && s.test(a.value) === !1 && t.warn(o, e.line, n + a.index, i, a.raw), "class" === a.name.toLowerCase())
                        for (var c, u = a.value.split(/\s+/g), g = 0, f = u.length; f > g; g++)
                            c = u[g], c && s.test(c) === !1 && t.warn(o, e.line, n + a.index, i, c)
            })
        }
    }}), HTMLHint.addRule({id: "id-unique", description: "Id must be unique.", init: function (e, t) {
        var a = this, r = {};
        e.addListener("tagstart", function (e) {
            for (var i, n, s = e.attrs, o = e.col + e.tagName.length + 1, l = 0, d = s.length; d > l; l++)
                if (i = s[l], "id" === i.name.toLowerCase()) {
                    n = i.value, n && (void 0 === r[n] ? r[n] = 1 : r[n]++, r[n] > 1 && t.error("Id redefinition of [ " + n + " ].", e.line, o + i.index, a, i.raw));
                    break
                }
        })
    }}), HTMLHint.addRule({id: "img-alt-require", description: "Alt of img tag must be set value.", init: function (e, t) {
        var a = this;
        e.addListener("tagstart", function (e) {
            if ("img" === e.tagName.toLowerCase()) {
                for (var r = e.attrs, i = !1, n = 0, s = r.length; s > n; n++)
                    if ("alt" === r[n].name.toLowerCase()) {
                        i = !0;
                        break
                    }
                i === !1 && t.warn("Alt of img tag must be set value.", e.line, e.col, a, e.raw)
            }
        })
    }}), HTMLHint.addRule({id: "jshint", description: "Scan script with jshint.", init: function (e, t, a) {
        var r = this;
        e.addListener("cdata", function (i) {
            if ("script" === i.tagName.toLowerCase()) {
                var n = e.getMapAttrs(i.attrs), s = n.type;
                if (void 0 !== n.src || s && /^(text\/javascript)$/i.test(s) === !1)
                    return;
                var o;
                if (o = "object" == typeof exports && require ? require("jshint").JSHINT : JSHINT, void 0 !== a) {
                    var l = i.line - 1, d = i.col - 1, c = i.raw.replace(/\t/g, " ");
                    try {
                        var u = o(c, a);
                        u === !1 && o.errors.forEach(function (e) {
                            var a = e.line;
                            t.warn(e.reason, l + a, (1 === a ? d : 0) + e.character, r, e.evidence)
                        })
                    } catch (g) {
                    }
                }
            }
        })
    }}), HTMLHint.addRule({id: "spec-char-escape", description: "Special characters must be escaped.", init: function (e, t) {
        var a = this;
        e.addListener("text", function (r) {
            for (var i, n = r.raw, s = /[<>]/g; i = s.exec(n); ) {
                var o = e.fixPos(r, i.index);
                t.error("Special characters must be escaped : [ " + i[0] + " ].", o.line, o.col, a, r.raw)
            }
        })
    }}), HTMLHint.addRule({id: "style-disabled", description: "Style tag can not be use.", init: function (e, t) {
        var a = this;
        e.addListener("tagstart", function (e) {
            "style" === e.tagName.toLowerCase() && t.warn("Style tag can not be use.", e.line, e.col, a, e.raw)
        })
    }}), HTMLHint.addRule({id: "tag-pair", description: "Tag must be paired.", init: function (e, t) {
        var a = this, r = [], i = e.makeMap(HTMLHint.selfCloseTags);
        e.addListener("tagstart", function (e) {
            var t = e.tagName.toLowerCase();
            void 0 !== i[t] || e.close || r.push(t)
        }), e.addListener("tagend", function (e) {
            for (var i = e.tagName.toLowerCase(), n = r.length - 1; n >= 0 && r[n] !== i; n--)
                ;
            if (n >= 0) {
                for (var s = [], o = r.length - 1; o > n; o--)
                    s.push("</" + r[o] + ">");
                s.length > 0 && t.error("Tag must be paired, Missing: [ " + s.join("") + " ]", e.line, e.col, a, e.raw), r.length = n
            } else
                t.error("Tag must be paired, No start tag: [ " + e.raw + " ]", e.line, e.col, a, e.raw)
        }), e.addListener("end", function (e) {
            for (var i = [], n = r.length - 1; n >= 0; n--)
                i.push("</" + r[n] + ">");
            i.length > 0 && t.error("Tag must be paired, Missing: [ " + i.join("") + " ]", e.line, e.col, a, "")
        })
    }}), HTMLHint.addRule({id: "tag-self-close", description: "The empty tag must closed by self.", init: function (e, t) {
        var a = this, r = e.makeMap(HTMLHint.selfCloseTags);
        e.addListener("tagstart", function (e) {
            var i = e.tagName.toLowerCase();
            void 0 !== r[i] && (e.close || t.warn("The empty tag : [ " + i + " ] must closed by self.", e.line, e.col, a, e.raw))
        })
    }}), HTMLHint.addRule({id: "tagname-lowercase", description: "Tagname must be lowercase.", init: function (e, t) {
        var a = this;
        e.addListener("tagstart,tagend", function (e) {
            var r = e.tagName;
            r !== r.toLowerCase() && t.error("Tagname [ " + r + " ] must be lower case.", e.line, e.col, a, e.raw)
        })
    }});