/* 
 * DreamCMS 3.0
 * 
 * This source file is subject to the GNU GENERAL PUBLIC LICENSE Version 2
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.gnu.org/licenses/gpl-2.0.txt
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@dcms-studio.de so we can send you a copy immediately.
 * 
 * @copyright	Copyright (c) 2008-2013 Marcel Domke (http://www.dcms-studio.de)
 * @license     http://www.gnu.org/licenses/gpl-2.0.txt GNU GENERAL PUBLIC LICENSE Version 2
 * @author      Marcel Domke <http://www.dcms-studio.de>
 */


ace.define('dcms_ace/intellisense', ['require', 'exports', 'module', 'ace/lib/dom', 'ace/keyboard/hash_handler', 'ace/lib/event', 'ace/range'], function (require, exports, module) {

    var HashHandler = require("ace/keyboard/hash_handler").HashHandler;
    var dom = require("ace/lib/dom");
    var event = require("ace/lib/event");
    var Range = require("ace/range").Range;

    var phpCache = null;
    var xmlDictionary, phpDictionary = {}, jsDictionary = {}, cssDictionary = {}, intellisenseNode, intellisenseContainer, intellisenseUL;

    var baseAttribues = {
        "id": 2,
        "class": 2,
        "style": 2,
        "title": 2
    };
    var encoding = {
        "UTF-8": 3,
        "ISO-8859-1": 3,
        "Windows-1252": 3,
        "UTF-16LE": 3,
        "Windows-1256": 3,
        "ISO-8859-6": 3,
        "ISO-8859-4": 3,
        "ISO-8859-13": 3,
        "Windows-1257": 3,
        "ISO-8859-14": 3,
        "ISO-8859-2": 3,
        "Windows-1250": 3,
        GBK: 3,
        Big5: 3,
        "Big5-HKSCS": 3,
        "ISO-8859-5": 3,
        "Windows-1251": 3,
        "KOI8-R": 3,
        "KOI8-U": 3,
        "ISO-8859-7": 3,
        "Windows-1253": 3,
        "Windows-1255": 3,
        "ISO-8859-8-1": 3,
        "ISO-8859-8": 3,
        Shift_JIS: 3,
        "EUC-JP": 3,
        "ISO-2022-JP": 3,
        "ISO-8859-10": 3,
        "ISO-8859-16": 3,
        "ISO-8859-3": 3,
        "Windows-1258": 3,
        "ISO-8859-15": 3,
        Macintosh: 3
    }

// This is a simple helper function, and you can create as many as you want.
// In this case, it simply adds id, class, style and title as attributes, to the
// given set of custom attributes that you pass in the obj parameter
    function commonAttributes (obj)
    {
        var result = {};
        // if you pass custom attributes, add them first so they show up first
        if (obj)
            for (var n in obj)
                result[n] = obj[n];
        // second, add the common attributes
        for (var n in baseAttribues)
            result[n] = 2;
        return result;
    }

    function commonAttributesHtml5 (obj) {
        var result = {};
        // if you pass custom attributes, add them first so they show up first
        if (obj)
            for (var n in obj)
                result[n] = obj[n];
        // second, add the common attributes
        for (var n in baseAttribues)
        {
            result[n] = 2;
        }
        return result;
    }

    function initXML () {

        // tags = 1, attributes = 2, values = 3
        xmlDictionary = {
            // tags should return 1
            "html": {manifest: 2},
            "head": 1,
            // but if they have some attributes to suggest, they don't need to return 1
            // and simply return an object with those attributes, returning 2
            "link": {
                // however, this attribute wants to return values, so again it returns an
                // object, containing values that are marked as 3
                "type": {
                    "text/css": 3,
                    "image/png": 3,
                    "image/jpeg": 3,
                    "image/gif": 3
                },
                "rel": {
                    "stylesheet": 3,
                    "icon": 3
                },
                "href": 2,
                'hreflang': 2,
                sizes: 2,
                "media": {
                    "all": 3,
                    "screen": 3,
                    "print": 3
                }
            },
            "script": {
                "type": {
                    "text/javascript": 3
                },
                charset: encoding,
                async: 2,
                "src": 2

            },
            noscript: {href: 2},
            "title": 1,
            "style": {
                "type": {
                    "text/css": 3
                },
                "media": {
                    "all": 3,
                    "screen": 3,
                    "print": 3
                },
                scoped: 2
            },
            "meta": {
                "name": {
                    "description": 3,
                    "keywords": 3
                },
                "content": {
                    "text/html; charset=UTF-8": 3
                },
                "http-equiv": {
                    "content-type": 3
                },
                charset: encoding

            },
            // body returns all common attributes, but shows "onload" as first suggestion
            "body": commonAttributes(
                    {
                        "onload": 2,
                        'onbeforeprint': 2,
                        onbeforeunload: 2,
                        onhashchange: 2,
                        onmessage: 2,
                        onoffline: 2,
                        onredo: 2,
                        onresize: 2,
                        onundo: 2,
                        onunload: 2

                    }),
            "blockquote": commonAttributes(
                    {
                        "cite": 2
                    }),
            "a": commonAttributes(
                    {
                        "href": 2,
                        "target": {
                            "_blank": 3,
                            "top": 3
                        },
                        ping: 2,
                        rel: 2,
                        media: 2,
                        hreflang: 2,
                        type: 2

                    }),
            em: commonAttributes({}),
            i: commonAttributes({}),
            strong: commonAttributes({}),
            b: commonAttributes({}),
            u: commonAttributes({}),
            small: commonAttributes({}),
            s: commonAttributes({}),
            cite: 1,
            q: commonAttributes({cite: 2}),
            abbr: 1,
            data: 1,
            time: {datetime: 2},
            code: commonAttributes({}),
            'var': 1,
            sub: commonAttributes({}),
            sup: commonAttributes({}),
            span: commonAttributes({}),
            br: 1,
            wbr: 1,
            del: commonAttributes({cite: 2, datetime: 2}),
            ins: commonAttributes({cite: 2, datetime: 2}),
            span: commonAttributes({}),
                    "img": commonAttributes(
                            {
                                "src": 2,
                                "alt": 2,
                                "width": 2,
                                "height": 2,
                                usemap: 2,
                                ismap: 2
                            }),
            iframe: commonAttributes(
                    {
                        "src": 2,
                        "name": 2,
                        "width": 2,
                        "height": 2,
                        sandbox: 2,
                        seamless: 2
                    }),
            embed: commonAttributes(
                    {
                        "src": 2,
                        "name": 2,
                        "width": 2,
                        "height": 2,
                        type: 2
                    }),
            object: commonAttributes(
                    {
                        classid: 2,
                        type: 2,
                        param: 2,
                        data: 2,
                        "src": 2,
                        "name": 2,
                        "width": 2,
                        "height": 2
                    }),
            param: commonAttributes(
                    {
                        "value": 2,
                        "name": 2
                    }),
            "form": commonAttributes(
                    {
                        'accept-charset': 2,
                        'autocomplete': 2,
                        'name': 2,
                        'target': {
                            "_blank": 3,
                            "_self": 3,
                            "_top": 3
                        },
                        "method": {
                            "get": 3,
                            "post": 3
                        },
                        "action": 2,
                        "enctype": {
                            "multipart/form-data": 3,
                            "application/x-www-form-urlencoded": 3
                        },
                        "onsubmit": 2
                    }),
            h1: commonAttributes({}),
            h2: commonAttributes({}),
            h3: commonAttributes({}),
            h4: commonAttributes({}),
            h5: commonAttributes({}),
            h6: commonAttributes({}),
            hr: commonAttributes({}),
            "input": commonAttributes({
                "type": {
                    "text": 3,
                    "password": 3,
                    "hidden": 3,
                    "checkbox": 3,
                    "submit": 3,
                    "radio": 3,
                    "file": 3,
                    "button": 3,
                    "reset": 3,
                    "image": 3
                },
                "accept": 2,
                "alt": 2,
                "autocomplete": 2,
                "checked": {
                    "checked": 3
                },
                "disabled": {
                    "disabled": 3
                },
                "form": 2,
                "formaction": 2,
                "formenctype": 2,
                "formmethod": 2,
                "formnovalidate": 2,
                "formtarget": 2,
                "height": 2,
                "list": 2,
                "max": 2,
                "maxlength": 2,
                "min": 2,
                "multiple": 2,
                "pattern": 2,
                "placeholder": 2,
                "readonly": {
                    "readonly": 3
                },
                "required": 2,
                "size": 2,
                "src": 2,
                "step": 2,
                "width": 2,
                "files": 2,
                "value": 2
            }),
            "textarea": {
                "autofocus": 2,
                "disabled": {
                    "disabled": 3
                },
                "form": 2,
                "maxlength": 2,
                "name": 2,
                "placeholder": 2,
                "readonly": {
                    "readonly": 3
                },
                "required": {
                    "required": 3
                },
                "rows": 2,
                "cols": 2,
                "wrap": 2
            },
            'span': commonAttributes({}),
                    'sub': commonAttributes({}),
                    "select": commonAttributes(
                            {
                                "name": 2,
                                "size": 2,
                                "multiple": {
                                    "multiple": 3
                                },
                                "disabled": {
                                    "disabled": 3
                                },
                                "readonly": {
                                    "readonly": 3
                                }
                            }),
            ul: commonAttributes({}),
            li: commonAttributes({}),
            ol: commonAttributes({}),
            dl: commonAttributes({}),
            dt: commonAttributes({}),
            dd: commonAttributes({}),
            div: commonAttributes({}),
            figure: 1,
            figcaption: 1,
            fieldset: commonAttributes({}),
            "option": commonAttributes({
                "value": 2,
                label: 2,
                disabled: {
                    disabled: 3
                },
                "selected": {
                    "selected": 3
                }
            }),
            "optgroup": {
                "label": 2,
                disabled: {
                    disabled: 3
                }
            },
            "label": commonAttributes(
                    {
                        "for": 2
                    }),
            legend: commonAttributes({}),
            p: commonAttributes({}),
            pre: commonAttributes({}),
            "textarea": commonAttributes(
                    {
                        "name": 2,
                        "cols": 2,
                        "rows": 2,
                        "wrap": {
                            "on": 3,
                            "off": 3
                        },
                        "disabled": {
                            "disabled": 3
                        },
                        "readonly": {
                            "readonly": 3
                        }
                    }),
            "button": commonAttributes(
                    {
                        "onclick": 2
                    }),
            "table": commonAttributes(
                    {
                        "border": {
                            "0": 3
                        },
                        "cellpadding": {
                            "0": 3
                        },
                        "cellspacing": {
                            "0": 3
                        },
                        "width": 2,
                        "height": 2,
                        "summary": 2
                    }),
            "thead": commonAttributes({}),
            "tbody": commonAttributes({}),
            "tr": commonAttributes({}),
            "td": commonAttributes(
                    {
                        "colspan": 2,
                        "rowspan": 2,
                        "width": 2,
                        "height": 2,
                        "valign": {
                            "top": 3,
                            "bottom": 3,
                            "baseline": 3,
                            "middle": 3
                        }
                    }),
            "iframe": commonAttributes(
                    {
                        "src": 2,
                        "frameborder": {
                            "0": 3
                        }
                    }),
            // HTML 5

            "article": commonAttributes({
                pubdate: 2
            }),
            address: commonAttributes({}),
            main: commonAttributes({}),
            "header": commonAttributes({}),
            "footer": commonAttributes({}),
            "section": commonAttributes({}),
            "aside": commonAttributes({}),
            "nav": commonAttributes({}),
            "video": commonAttributesHtml5({"src": 2, "autobuffer": 2, "autoplay": 2, "loop": 2, "controls": 2, "width": 2, "height": 2, "poster": 2}),
            "audio": commonAttributesHtml5({"src": 2, "autobuffer": 2, "autoplay": 2, "loop": 2, "controls": 2}),
            "source": {"src": 2, "type": 2, "media": 2},
            "track": {"kind": 2, "src": 2, "srclang": 2, "label": 2, "default": 2},
            "canvas": {"width": 2, "height": 2},
            "map": {"name": 2},
            "area": {"shape": 2, "coords": 2, "href": 2, "hreflang": 2, "alt": 2, "target": 2, "media": 2, "rel": 2, "ping": 2, "type": 2},
            "svg": 1,
            "math": 1,
            "dialog": {open: 2},
            "keygen": {"autofocus": 2, "challenge": 2, "disabled": {disabled: 3}, "form": 2, "keytype": 2, "name": 2},
            "output": {"for": 2, "form": 2, "name": 2},
            "progress": {"value": 2, "max": 2},
            "meter": {"value": 2, "min": 2, "max": 2, "low": 2, "high": 2, "optimum": 2},
            "details": {"open": 2},
            "summary": 2,
            "command": {"type": 2, "label": 2, "icon": 2, "disabled": {disabled: 3}, "checked": {checked: 3}, "radiogroup": 2, "command": 2},
            "base": {
                "href": 2,
                'target': 2
            },
            "&Aacute;": 1,
            "&aacute;": 1,
            "&Acirc;": 1,
            "&acirc;": 1,
            "&acute;": 1,
            "&AElig;": 1,
            "&aelig;": 1,
            "&Agrave;": 1,
            "&agrave;": 1,
            "&alefsym;": 1,
            "&Alpha;": 1,
            "&alpha;": 1,
            "&amp;": 1,
            "&and;": 1,
            "&ang;": 1,
            "&Aring;": 1,
            "&aring;": 1,
            "&asymp;": 1,
            "&Atilde;": 1,
            "&atilde;": 1,
            "&Auml;": 1,
            "&auml;": 1,
            "&bdquo;": 1,
            "&Beta;": 1,
            "&beta;": 1,
            "&brvbar;": 1,
            "&bull;": 1,
            "&cap;": 1,
            "&Ccedil;": 1,
            "&ccedil;": 1,
            "&cedil;": 1,
            "&cent;": 1,
            "&Chi;": 1,
            "&chi;": 1,
            "&circ;": 1,
            "&clubs;": 1,
            "&cong;": 1,
            "&copy;": 1,
            "&crarr;": 1,
            "&cup;": 1,
            "&curren;": 1,
            "&Dagger;": 1,
            "&dagger;": 1,
            "&dArr;": 1,
            "&darr;": 1,
            "&deg;": 1,
            "&Delta;": 1,
            "&delta;": 1,
            "&diams;": 1,
            "&divide;": 1,
            "&Eacute;": 1,
            "&eacute;": 1,
            "&Ecirc;": 1,
            "&ecirc;": 1,
            "&Egrave;": 1,
            "&egrave;": 1,
            "&empty;": 1,
            "&emsp;": 1,
            "&ensp;": 1,
            "&Epsilon;": 1,
            "&epsilon;": 1,
            "&equiv;": 1,
            "&Eta;": 1,
            "&eta;": 1,
            "&ETH;": 1,
            "&eth;": 1,
            "&Euml;": 1,
            "&euml;": 1,
            "&euro;": 1,
            "&exist;": 1,
            "&fnof;": 1,
            "&forall;": 1,
            "&frac12;": 1,
            "&frac14;": 1,
            "&frac34;": 1,
            "&frasl;": 1,
            "&Gamma;": 1,
            "&gamma;": 1,
            "&ge;": 1,
            "&gt;": 1,
            "&hArr;": 1,
            "&harr;": 1,
            "&hearts;": 1,
            "&hellip;": 1,
            "&Iacute;": 1,
            "&iacute;": 1,
            "&Icirc;": 1,
            "&icirc;": 1,
            "&iexcl;": 1,
            "&Igrave;": 1,
            "&igrave;": 1,
            "&image;": 1,
            "&infin;": 1,
            "&int;": 1,
            "&Iota;": 1,
            "&iota;": 1,
            "&iquest;": 1,
            "&isin;": 1,
            "&Iuml;": 1,
            "&iuml;": 1,
            "&Kappa;": 1,
            "&kappa;": 1,
            "&Lambda;": 1,
            "&lambda;": 1,
            "&lang;": 1,
            "&laquo;": 1,
            "&lArr;": 1,
            "&larr;": 1,
            "&lceil;": 1,
            "&ldquo;": 1,
            "&le;": 1,
            "&lfloor;": 1,
            "&lowast;": 1,
            "&loz;": 1,
            "&lrm;": 1,
            "&lsaquo;": 1,
            "&lsquo;": 1,
            "&lt;": 1,
            "&macr;": 1,
            "&mdash;": 1,
            "&micro;": 1,
            "&middot;": 1,
            "&minus;": 1,
            "&Mu;": 1,
            "&mu;": 1,
            "&nabla;": 1,
            "&nbsp;": 1,
            "&ndash;": 1,
            "&ne;": 1,
            "&ni;": 1,
            "&not;": 1,
            "&notin;": 1,
            "&nsub;": 1,
            "&Ntilde;": 1,
            "&ntilde;": 1,
            "&Nu;": 1,
            "&nu;": 1,
            "&Oacute;": 1,
            "&oacute;": 1,
            "&Ocirc;": 1,
            "&ocirc;": 1,
            "&OElig;": 1,
            "&oelig;": 1,
            "&Ograve;": 1,
            "&ograve;": 1,
            "&oline;": 1,
            "&Omega;": 1,
            "&omega;": 1,
            "&Omicron;": 1,
            "&omicron;": 1,
            "&oplus;": 1,
            "&or;": 1,
            "&ordf;": 1,
            "&ordm;": 1,
            "&Oslash;": 1,
            "&oslash;": 1,
            "&Otilde;": 1,
            "&otilde;": 1,
            "&otimes;": 1,
            "&Ouml;": 1,
            "&ouml;": 1,
            "&para;": 1,
            "&part;": 1,
            "&permil;": 1,
            "&perp;": 1,
            "&Phi;": 1,
            "&phi;": 1,
            "&Pi;": 1,
            "&pi;": 1,
            "&piv;": 1,
            "&plusmn;": 1,
            "&pound;": 1,
            "&Prime;": 1,
            "&prime;": 1,
            "&prod;": 1,
            "&prop;": 1,
            "&Psi;": 1,
            "&psi;": 1,
            "&quot;": 1,
            "&radic;": 1,
            "&rang;": 1,
            "&raquo;": 1,
            "&rArr;": 1,
            "&rarr;": 1,
            "&rceil;": 1,
            "&rdquo;": 1,
            "&real;": 1,
            "&reg;": 1,
            "&rfloor;": 1,
            "&Rho;": 1,
            "&rho;": 1,
            "&rlm;": 1,
            "&rsaquo;": 1,
            "&rsquo;": 1,
            "&sbquo;": 1,
            "&Scaron;": 1,
            "&scaron;": 1,
            "&sdot;": 1,
            "&sect;": 1,
            "&shy;": 1,
            "&Sigma;": 1,
            "&sigma;": 1,
            "&sigmaf;": 1,
            "&sim;": 1,
            "&spades;": 1,
            "&sub;": 1,
            "&sube;": 1,
            "&sum;": 1,
            "&sup;": 1,
            "&sup1;": 1,
            "&sup2;": 1,
            "&sup3;": 1,
            "&supe;": 1,
            "&szlig;": 1,
            "&Tau;": 1,
            "&tau;": 1,
            "&there4;": 1,
            "&Theta;": 1,
            "&theta;": 1,
            "&thetasym;": 1,
            "&thinsp;": 1,
            "&THORN;": 1,
            "&thorn;": 1,
            "&tilde;": 1,
            "&times;": 1,
            "&trade;": 1,
            "&Uacute;": 1,
            "&uacute;": 1,
            "&uArr;": 1,
            "&uarr;": 1,
            "&Ucirc;": 1,
            "&ucirc;": 1,
            "&Ugrave;": 1,
            "&ugrave;": 1,
            "&uml;": 1,
            "&upsih;": 1,
            "&Upsilon;": 1,
            "&upsilon;": 1,
            "&Uuml;": 1,
            "&uuml;": 1,
            "&weierp;": 1,
            "&Xi;": 1,
            "&xi;": 1,
            "&Yacute;": 1,
            "&yacute;": 1,
            "&yen;": 1,
            "&Yuml;": 1,
            "&yuml;": 1,
            "&Zeta;": 1,
            "&zeta;": 1,
            "&zwj;": 1,
            "&zwnj;": 1
        };


        if (typeof top.dcms_tags != 'undefined')
        {
            for (var s in top.dcms_tags) {
                var t = top.dcms_tags[s];

                if (t.attributes) {
                    xmlDictionary[s] = t.attributes;
                }
                else {
                    xmlDictionary[s] = 1;
                }
            }
        }

    }

    var phpVarDictionary = {}, phpFunctionDictionary = [], phpKeywordDictionary = {}, phpConstructsDictionary = {};

    function initPhpDict () {

        if (phpFunctionDictionary.length) {
            return;
        }

        phpVarDictionary = {
            '$GLOBALS': '',
            '$_SERVER': '',
            '$_GET': '',
            '$_POST': '',
            '$_FILES': '',
            '$_REQUEST': '',
            '$_SESSION': '',
            '$_ENV': '',
            '$_COOKIE': '',
            '$php_errormsg': '',
            '$HTTP_RAW_POST_DATA': '',
            '$http_response_header': '',
            '$argc': '',
            '$argv': '',
            '$this': ''
        };

        phpKeywordDictionary = {
            'abstract': '',
            'and': '',
            'array': '',
            'as': '',
            'break': '',
            'case': '',
            'catch': '',
            'class': '',
            'clone': '',
            'const': '',
            'continue': '',
            'declare': '',
            'default': '',
            'do': '',
            'else': '',
            'elseif': '',
            'enddeclare': '',
            'endfor': '',
            'endforeach': '',
            'endif': '',
            'endswitch': '',
            'endwhile': '',
            'extends': '',
            'final': '',
            'for': '',
            'foreach': '',
            'function': '',
            'global': '',
            'goto': '',
            'if': '',
            'implements': '',
            'interface': '',
            'instanceof': '',
            'namespace': '',
            'new': '',
            'or': '',
            'private': '',
            'protected': '',
            'public': '',
            'static': '',
            'switch': '',
            'throw': '',
            'try': '',
            'use': '',
            'var': '',
            'while': '',
            'xor': ''
        };

        phpConstructsDictionary = {
            'die': '',
            'echo': '',
            'empty': '',
            'exit': '',
            'eval': '',
            'include': '',
            'include_once': '',
            'isset': '',
            'list': '',
            'require': '',
            'require_once': '',
            'return': '',
            'print': '',
            'unset': ''
        };



        _phpFunctionDictionary = {
            abs: "(mixed $number)",
            acos: "(float $arg)",
            acosh: "(float $arg)",
            addAction: "(SWFAction $action, int $flags)",
            'addASound': "(SWFSound $sound, int $flags)",
            addAttribute: "(string $name, string $value [, string $namespace])",
            addChars: "(string $char)",
            addChild: "(string $name [, string $value [, string $namespace]])",
            addColor: "(int $red, int $green, int $blue [, int $a])",
            addcslashes: "(string $str, string $charlist)",
            addEntry: "(float $ratio, int $red, int $green, int $blue [, int $a])",
            addExport: "(SWFCharacter $char, string $name)",
            addFill: "(int $red, int $green, int $blue [, int $a])",
            addFont: "(SWFFont $font)",
            addFunction: "(mixed $functions)",
            add_namespace: "(string $uri, string $prefix)",
            add: "(object $instance)",
            addShape: "(SWFShape $shape, int $flags)",
            addslashes: "(string $str)",
            addString: "(string $string)",
            addUTF8Chars: "(string $char)",
            addUTF8String: "(string $text)",
            aggregate_info: "(object $object)",
            aggregate_methods_by_list: "(object $object, string $class_name, array $methods_list [, bool $exclude])",
            aggregate_methods_by_regexp: "(object $object, string $class_name, string $regexp [, bool $exclude])",
            aggregate_methods: "(object $object, string $class_name)",
            aggregate: "(object $object, string $class_name)",
            aggregate_properties_by_list: "(object $object, string $class_name, array $properties_list [, bool $exclude])",
            aggregate_properties_by_regexp: "(object $object, string $class_name, string $regexp [, bool $exclude])",
            aggregate_properties: "(object $object, string $class_name)",
            align: "(int $alignement)",
            apache_child_terminate: "(void)",
            apache_getenv: "(string $variable [, bool $walk_to_top])",
            apache_get_modules: "(void)",
            apache_get_version: "(void)",
            apache_lookup_uri: "(string $filename)",
            apache_note: "(string $note_name [, string $note_value])",
            apache_request_headers: "(void)",
            apache_reset_timeout: "(void)",
            apache_response_headers: "(void)",
            apache_setenv: "(string $variable, string $value [, bool $walk_to_top])",
            apc_add: "(string $key, mixed $var [, int $ttl])",
            apc_cache_info: "([string $cache_type [, bool $limited]])",
            apc_clear_cache: "([string $cache_type])",
            apc_compile_file: "(string $filename)",
            apc_define_constants: "(string $key, array $constants [, bool $case_sensitive])",
            apc_delete: "(string $key)",
            apc_fetch: "(string $key)",
            apc_load_constants: "(string $key [, bool $case_sensitive])",
            apc_sma_info: "([bool $limited])",
            apc_store: "(string $key, mixed $var [, int $ttl])",
            apd_breakpoint: "(int $debug_level)",
            apd_callstack: "(void)",
            apd_clunk: "(string $warning [, string $delimiter])",
            apd_continue: "(int $debug_level)",
            apd_croak: "(string $warning [, string $delimiter])",
            apd_dump_function_table: "(void)",
            apd_dump_persistent_resources: "(void)",
            apd_dump_regular_resources: "(void)",
            apd_echo: "(string $output)",
            apd_get_active_symbols: "(void)",
            apd_set_pprof_trace: "([string $dump_directory [, string $fragment]])",
            apd_set_session: "(int $debug_level)",
            apd_set_session_trace: "(int $debug_level [, string $dump_directory])",
            apd_set_socket_session_trace: "(string $tcp_server, int $socket_type, int $port, int $debug_level)",
            append_child: "(DOMNode $newnode)",
            append: "(mixed $value)",
            array_change_key_case: "(array $input [, int $case])",
            array_chunk: "(array $input, int $size [, bool $preserve_keys])",
            array_combine: "(array $keys, array $values)",
            array_count_values: "(array $input)",
            array_diff: "(array $array1, array $array2 [, array $...])",
            array_diff_assoc: "(array $array1, array $array2 [, array $...])",
            array_diff_key: "(array $array1, array $array2 [, array $...])",
            array_diff_uassoc: "(array $array1, array $array2 [, array $...], callback $key_compare_func)",
            array_diff_ukey: "(array $array1, array $array2 [, array $...], callback $key_compare_func)",
            array_fill: "(int $start_index, int $num, mixed $value)",
            array_fill_keys: "(array $keys, mixed $value)",
            array_filter: "(array $input [, callback $callback])",
            array_flip: "(array $trans)",
            array_intersect: "(array $array1, array $array2 [, array $...])",
            array_intersect_assoc: "(array $array1, array $array2 [, array $...])",
            array_intersect_key: "(array $array1, array $array2 [, array $...])",
            array_intersect_uassoc: "(array $array1, array $array2 [, array $...], callback $key_compare_func)",
            array_intersect_ukey: "(array $array1, array $array2 [, array $...], callback $key_compare_func)",
            array_key_exists: "(mixed $key, array $search)",
            array_keys: "(array $input [, mixed $search_value [, bool $strict]])",
            array_map: "(callback $callback, array $arr1 [, array $...])",
            array_merge: "(array $array1 [, array $array2 [, array $...]])",
            array_merge_recursive: "(array $array1 [, array $...])",
            array: "([mixed $...])",
            array_multisort: "(array $arr [, mixed $arg [, mixed $...]])",
            array_pad: "(array $input, int $pad_size, mixed $pad_value)",
            array_pop: "(array& $array)",
            array_product: "(array $array)",
            array_push: "(array& $array, mixed $var [, mixed $...])",
            array_rand: "(array $input [, int $num_req])",
            array_reduce: "(array $input, callback $function [, int $initial])",
            array_reverse: "(array $array [, bool $preserve_keys])",
            array_search: "(mixed $needle, array $haystack [, bool $strict])",
            array_shift: "(array& $array)",
            array_slice: "(array $array, int $offset [, int $length [, bool $preserve_keys]])",
            array_splice: "(array& $input, int $offset [, int $length [, mixed $replacement]])",
            array_sum: "(array $array)",
            array_udiff: "(array $array1, array $array2 [, array $...], callback $data_compare_func)",
            array_udiff_assoc: "(array $array1, array $array2 [, array $...], callback $data_compare_func)",
            array_udiff_uassoc: "(array $array1, array $array2 [, array $...], callback $data_compare_func, callback $key_compare_func)",
            array_uintersect: "(array $array1, array $array2 [, array $...], callback $data_compare_func)",
            array_uintersect_assoc: "(array $array1, array $array2 [, array $...], callback $data_compare_func)",
            array_uintersect_uassoc: "(array $array1, array $array2 [, array $...], callback $data_compare_func, callback $key_compare_func)",
            array_unique: "(array $array)",
            array_unshift: "(array& $array, mixed $var [, mixed $...])",
            array_values: "(array $input)",
            array_walk: "(array& $array, callback $funcname [, mixed $userdata])",
            array_walk_recursive: "(array& $input, callback $funcname [, mixed $userdata])",
            arsort: "(array& $array [, int $sort_flags])",
            ascii2ebcdic: "(string $ascii_str)",
            asin: "(float $arg)",
            asinh: "(float $arg)",
            asort: "(array& $array [, int $sort_flags])",
            assert: "(mixed $assertion)",
            assert_options: "(int $what [, mixed $value])",
            assign: "(array $parameter)",
            assignElem: "(int $index, mixed $value)",
            asXML: "([string $filename])",
            atan2: "(float $y, float $x)",
            atan: "(float $arg)",
            atanh: "(float $arg)",
            attreditable: "(array $parameter)",
            attributes: "([string $ns [, bool $is_prefix]])",
            base64_decode: "(string $data [, bool $strict])",
            base64_encode: "(string $data)",
            base_convert: "(string $number, int $frombase, int $tobase)",
            basename: "(string $path [, string $suffix])",
            bbcode_add_element: "(resource $bbcode_container, string $tag_name, array $tag_rules)",
            bbcode_add_smiley: "(resource $bbcode_container, string $smiley, string $replace_by)",
            bbcode_create: "([array $bbcode_initial_tags])",
            bbcode_destroy: "(resource $bbcode_container)",
            bbcode_parse: "(resource $bbcode_container, string $to_parse)",
            bbcode_set_arg_parser: "(resource $bbcode_container, resource $bbcode_arg_parser)",
            bbcode_set_flags: "(resource $bbcode_container, int $flags [, int $mode])",
            bcadd: "(string $left_operand, string $right_operand [, int $scale])",
            bccomp: "(string $left_operand, string $right_operand [, int $scale])",
            bcdiv: "(string $left_operand, string $right_operand [, int $scale])",
            bcmod: "(string $left_operand, string $modulus)",
            bcmul: "(string $left_operand, string $right_operand [, int $scale])",
            bcompiler_load_exe: "(string $filename)",
            bcompiler_load: "(string $filename)",
            bcompiler_parse_class: "(string $class, string $callback)",
            bcompiler_read: "(resource $filehandle)",
            bcompiler_write_class: "(resource $filehandle, string $className [, string $extends])",
            bcompiler_write_constant: "(resource $filehandle, string $constantName)",
            bcompiler_write_exe_footer: "(resource $filehandle, int $startpos)",
            bcompiler_write_file: "(resource $filehandle, string $filename)",
            bcompiler_write_footer: "(resource $filehandle)",
            bcompiler_write_function: "(resource $filehandle, string $functionName)",
            bcompiler_write_functions_from_file: "(resource $filehandle, string $fileName)",
            bcompiler_write_header: "(resource $filehandle [, string $write_ver])",
            bcompiler_write_included_filename: "(resource $filehandle, string $filename)",
            bcpowmod: "(string $left_operand, string $right_operand, string $modulus [, int $scale])",
            bcpow: "(string $left_operand, string $right_operand [, int $scale])",
            bcscale: "(int $scale)",
            bcsqrt: "(string $operand [, int $scale])",
            bcsub: "(string $left_operand, string $right_operand [, int $scale])",
            bin2hex: "(string $str)",
            bindec: "(string $binary_string)",
            bind_textdomain_codeset: "(string $domain, string $codeset)",
            bindtextdomain: "(string $domain, string $directory)",
            bzclose: "(resource $bz)",
            bzcompress: "(string $source [, int $blocksize [, int $workfactor]])",
            bzdecompress: "(string $source [, int $small])",
            bzerrno: "(resource $bz)",
            bzerror: "(resource $bz)",
            bzerrstr: "(resource $bz)",
            bzflush: "(resource $bz)",
            bzopen: "(string $filename, string $mode)",
            bzread: "(resource $bz [, int $length])",
            bzwrite: "(resource $bz, string $data [, int $length])",
            calculhmac: "(string $clent, string $data)",
            calcul_hmac: "(string $clent, string $siretcode, string $price, string $reference, string $validity, string $taxation, string $devise, string $language)",
            cal_days_in_month: "(int $calendar, int $month, int $year)",
            cal_from_jd: "(int $jd, int $calendar)",
            cal_info: "([int $calendar])",
            __call: "(string $function_name, array $arguments [, array $options [, array $input_headers [, array $output_headers]]])",
            call_user_func_array: "(callback $function, array $param_arr)",
            call_user_func: "(callback $function [, mixed $parameter [, mixed $...]])",
            call_user_method_array: "(string $method_name, object& $obj, array $params)",
            call_user_method: "(string $method_name, object& $obj [, mixed $parameter [, mixed $...]])",
            cal_to_jd: "(int $calendar, int $month, int $day, int $year)",
            ceil: "(float $value)",
            chdir: "(string $directory)",
            checkdate: "(int $month, int $day, int $year)",
            checkdnsrr: "(string $host [, string $type])",
            checkin: "(array $parameter)",
            checkout: "(array $parameter)",
            chgrp: "(string $filename, mixed $group)",
            children: "(array $parameter)",
            chmod: "(string $filename, int $mode)",
            chown: "(string $filename, mixed $user)",
            chr: "(int $ascii)",
            chroot: "(string $directory)",
            chunk_split: "(string $body [, int $chunklen [, string $end]])",
            class_exists: "(string $class_name [, bool $autoload])",
            class_implements: "(mixed $class [, bool $autoload])",
            classkit_import: "(string $filename)",
            classkit_method_add: "(string $classname, string $methodname, string $args, string $code [, int $flags])",
            classkit_method_copy: "(string $dClass, string $dMethod, string $sClass [, string $sMethod])",
            classkit_method_redefine: "(string $classname, string $methodname, string $args, string $code [, int $flags])",
            classkit_method_remove: "(string $classname, string $methodname)",
            classkit_method_rename: "(string $classname, string $methodname, string $newname)",
            class_parents: "(mixed $class [, bool $autoload])",
            clearstatcache: "(void)",
            closedir: "(resource $dir_handle)",
            closelog: "(void)",
            close: "(void)",
            com_addref: "(void)",
            com_create_guid: "(void)",
            com_event_sink: "(variant $comobject, object $sinkobject [, mixed $sinkinterface])",
            com_get_active_object: "(string $progid [, int $code_page])",
            com_invoke: "(resource $com_object, string $function_name [, mixed $function_parameters])",
            com_isenum: "(variant $com_module)",
            com_load_typelib: "(string $typelib_name [, bool $case_insensitive])",
            com_message_pump: "([int $timeoutms])",
            commit: "(void)",
            compact: "(mixed $varname [, mixed $...])",
            com_print_typeinfo: "(object $comobject [, string $dispinterface [, bool $wantsink]])",
            com_release: "(void)",
            connection_aborted: "(void)",
            connection_status: "(void)",
            connection_timeout: "(void)",
            connect: "(string $protocol [, array $properties])",
            constant: "(string $name)",
            content: "(array $parameter)",
            convert_cyr_string: "(string $str, string $from, string $to)",
            convert_uudecode: "(string $data)",
            convert_uuencode: "(string $data)",
            copy: "(string $source, string $dest [, resource $context])",
            cos: "(float $arg)",
            cosh: "(float $arg)",
            count_chars: "(string $string [, int $mode])",
            count: "(mixed $var [, int $mode])",
            crack_check: "(resource $dictionary, string $password)",
            crack_closedict: "([resource $dictionary])",
            crack_getlastmessage: "(void)",
            crack_opendict: "(string $dictionary)",
            crc32: "(string $str)",
            create_function: "(string $args, string $code)",
            crypt: "(string $str [, string $salt])",
            ctype_alnum: "(string $text)",
            ctype_alpha: "(string $text)",
            ctype_cntrl: "(string $text)",
            ctype_digit: "(string $text)",
            ctype_graph: "(string $text)",
            ctype_lower: "(string $text)",
            ctype_print: "(string $text)",
            ctype_punct: "(string $text)",
            ctype_space: "(string $text)",
            ctype_upper: "(string $text)",
            ctype_xdigit: "(string $text)",
            curl_close: "(resource $ch)",
            curl_copy_handle: "(resource $ch)",
            curl_errno: "(resource $ch)",
            curl_error: "(resource $ch)",
            curl_exec: "(resource $ch)",
            curl_getinfo: "(resource $ch [, int $opt])",
            curl_init: "([string $url])",
            curl_multi_add_handle: "(resource $mh, resource $ch)",
            curl_multi_close: "(resource $mh)",
            curl_multi_exec: "(resource $mh, int& $still_running)",
            curl_multi_getcontent: "(resource $ch)",
            curl_multi_info_read: "(resource $mh [, int $msgs_in_queue])",
            curl_multi_init: "(void)",
            curl_multi_remove_handle: "(resource $mh, resource $ch)",
            curl_multi_select: "(resource $mh [, float $timeout])",
            curl_setopt_array: "(resource $ch, array $options)",
            curl_setopt: "(resource $ch, int $option, mixed $value)",
            curl_version: "([int $age])",
            current: "(array& $array)",
            cyrus_authenticate: "(resource $connection [, string $mechlist [, string $service [, string $user [, int $minssf [, int $maxssf [, string $authname [, string $password]]]]]]])",
            cyrus_bind: "(resource $connection, array $callbacks)",
            cyrus_close: "(resource $connection)",
            cyrus_connect: "([string $host [, string $port [, int $flags]]])",
            cyrus_query: "(resource $connection, string $query)",
            cyrus_unbind: "(resource $connection, string $trigger_name)",
            data: "(void)",
            date_add: "(DateTime $object, DateInterval $interval)",
            date_create: "([string $time [, DateTimeZone $timezone]])",
            date_date_set: "(DateTime $object, int $year, int $month, int $day)",
            date_default_timezone_get: "(void)",
            date_default_timezone_set: "(string $timezone_identifier)",
            date_format: "(DateTime $object, string $format)",
            date_isodate_set: "(DateTime $object, int $year, int $week [, int $day])",
            date_modify: "(DateTime $object, string $modify)",
            date_offset_get: "(DateTime $object)",
            date_parse: "(string $date)",
            date: "(string $format [, int $timestamp])",
            date_sub: "(DateTime $object, DateInterval $interval)",
            date_sun_info: "(int $time, float $latitude, float $longitude)",
            date_sunrise: "(int $timestamp [, int $format [, float $latitude [, float $longitude [, float $zenith [, float $gmt_offset]]]]])",
            date_sunset: "(int $timestamp [, int $format [, float $latitude [, float $longitude [, float $zenith [, float $gmt_offset]]]]])",
            date_time_set: "(DateTime $object, int $hour, int $minute [, int $second])",
            date_timezone_get: "(DateTime $object)",
            date_timezone_set: "(DateTime $object, DateTimeZone $timezone)",
            db2_autocommit: "(resource $connection [, bool $value])",
            db2_bind_param: "(resource $stmt, int $parameter-number, string $variable-name [, int $parameter-type [, int $data-type [, int $precision [, int $scale]]]])",
            db2_client_info: "(resource $connection)",
            db2_close: "(resource $connection)",
            db2_column_privileges: "(resource $connection [, string $qualifier [, string $schema [, string $table-name [, string $column-name]]]])",
            db2_columns: "(resource $connection [, string $qualifier [, string $schema [, string $table-name [, string $column-name]]]])",
            db2_commit: "(resource $connection)",
            db2_connect: "(string $database, string $username, string $password [, array $options])",
            db2_conn_errormsg: "([resource $connection])",
            db2_conn_error: "([resource $connection])",
            db2_cursor_type: "(resource $stmt)",
            db2_escape_string: "(string $string_literal)",
            db2_exec: "(resource $connection, string $statement [, array $options])",
            db2_execute: "(resource $stmt [, array $parameters])",
            db2_fetch_array: "(resource $stmt [, int $row_number])",
            db2_fetch_assoc: "(resource $stmt [, int $row_number])",
            db2_fetch_both: "(resource $stmt [, int $row_number])",
            db2_fetch_object: "(resource $stmt [, int $row_number])",
            db2_fetch_row: "(resource $stmt [, int $row_number])",
            db2_field_display_size: "(resource $stmt, mixed $column)",
            db2_field_name: "(resource $stmt, mixed $column)",
            db2_field_num: "(resource $stmt, mixed $column)",
            db2_field_precision: "(resource $stmt, mixed $column)",
            db2_field_scale: "(resource $stmt, mixed $column)",
            db2_field_type: "(resource $stmt, mixed $column)",
            db2_field_width: "(resource $stmt, mixed $column)",
            db2_foreign_keys: "(resource $connection, string $qualifier, string $schema, string $table-name)",
            db2_free_result: "(resource $stmt)",
            db2_free_stmt: "(resource $stmt)",
            db2_get_option: "(resource $resource, string $option)",
            db2_lob_read: "(resource $stmt, int $colnum, int $length)",
            db2_next_result: "(resource $stmt)",
            db2_num_fields: "(resource $stmt)",
            db2_num_rows: "(resource $stmt)",
            db2_pconnect: "(string $database, string $username, string $password [, array $options])",
            db2_prepare: "(resource $connection, string $statement [, array $options])",
            db2_primary_keys: "(resource $connection, string $qualifier, string $schema, string $table-name)",
            db2_procedure_columns: "(resource $connection, string $qualifier, string $schema, string $procedure, string $parameter)",
            db2_procedures: "(resource $connection, string $qualifier, string $schema, string $procedure)",
            db2_result: "(resource $stmt, mixed $column)",
            db2_rollback: "(resource $connection)",
            db2_server_info: "(resource $connection)",
            db2_set_option: "(resource $resource, array $options, int $type)",
            db2_special_columns: "(resource $connection, string $qualifier, string $schema, string $table_name, int $scope)",
            db2_statistics: "(resource $connection, string $qualifier, string $schema, string $table-name, bool $unique)",
            db2_stmt_errormsg: "([resource $stmt])",
            db2_stmt_error: "([resource $stmt])",
            db2_table_privileges: "(resource $connection [, string $qualifier [, string $schema [, string $table_name]]])",
            db2_tables: "(resource $connection [, string $qualifier [, string $schema [, string $table-name [, string $table-type]]]])",
            dba_close: "(resource $handle)",
            dba_delete: "(string $key, resource $handle)",
            dba_exists: "(string $key, resource $handle)",
            dba_fetch: "(string $key, resource $handle)",
            dba_firstkey: "(resource $handle)",
            dba_handlers: "([bool $full_info])",
            dba_insert: "(string $key, string $value, resource $handle)",
            dba_key_split: "(mixed $key)",
            dba_list: "(void)",
            dba_nextkey: "(resource $handle)",
            dba_open: "(string $path, string $mode [, string $handler [, mixed $...]])",
            dba_optimize: "(resource $handle)",
            dba_popen: "(string $path, string $mode [, string $handler [, mixed $...]])",
            dba_replace: "(string $key, string $value, resource $handle)",
            dbase_add_record: "(int $dbase_identifier, array $record)",
            dbase_close: "(int $dbase_identifier)",
            dbase_create: "(string $filename, array $fields)",
            dbase_delete_record: "(int $dbase_identifier, int $record_number)",
            dbase_get_header_info: "(int $dbase_identifier)",
            dbase_get_record: "(int $dbase_identifier, int $record_number)",
            dbase_get_record_with_names: "(int $dbase_identifier, int $record_number)",
            dbase_numfields: "(int $dbase_identifier)",
            dbase_numrecords: "(int $dbase_identifier)",
            dbase_open: "(string $filename, int $mode)",
            dbase_pack: "(int $dbase_identifier)",
            dbase_replace_record: "(int $dbase_identifier, array $record, int $record_number)",
            dba_sync: "(resource $handle)",
            dbplus_add: "(resource $relation, array $tuple)",
            dbplus_aql: "(string $query [, string $server [, string $dbpath]])",
            dbplus_chdir: "([string $newdir])",
            dbplus_close: "(resource $relation)",
            dbplus_curr: "(resource $relation, array& $tuple)",
            dbplus_errcode: "([int $errno])",
            dbplus_errno: "(void)",
            dbplus_find: "(resource $relation, array $constraints, mixed $tuple)",
            dbplus_first: "(resource $relation, array& $tuple)",
            dbplus_flush: "(resource $relation)",
            dbplus_freealllocks: "(void)",
            dbplus_freelock: "(resource $relation, string $tuple)",
            dbplus_freerlocks: "(resource $relation)",
            dbplus_getlock: "(resource $relation, string $tuple)",
            dbplus_getunique: "(resource $relation, int $uniqueid)",
            dbplus_info: "(resource $relation, string $key, array& $result)",
            dbplus_last: "(resource $relation, array& $tuple)",
            dbplus_lockrel: "(resource $relation)",
            dbplus_next: "(resource $relation, array& $tuple)",
            dbplus_open: "(string $name)",
            dbplus_prev: "(resource $relation, array& $tuple)",
            dbplus_rchperm: "(resource $relation, int $mask, string $user, string $group)",
            dbplus_rcreate: "(string $name, mixed $domlist [, bool $overwrite])",
            dbplus_rcrtexact: "(string $name, resource $relation [, bool $overwrite])",
            dbplus_rcrtlike: "(string $name, resource $relation [, int $overwrite])",
            dbplus_resolve: "(string $relation_name)",
            dbplus_restorepos: "(resource $relation, array $tuple)",
            dbplus_rkeys: "(resource $relation, mixed $domlist)",
            dbplus_ropen: "(string $name)",
            dbplus_rquery: "(string $query [, string $dbpath])",
            dbplus_rrename: "(resource $relation, string $name)",
            dbplus_rsecindex: "(resource $relation, mixed $domlist, int $type)",
            dbplus_runlink: "(resource $relation)",
            dbplus_rzap: "(resource $relation)",
            dbplus_savepos: "(resource $relation)",
            dbplus_setindexbynumber: "(resource $relation, int $idx_number)",
            dbplus_setindex: "(resource $relation, string $idx_name)",
            dbplus_sql: "(string $query [, string $server [, string $dbpath]])",
            dbplus_tcl: "(int $sid, string $script)",
            dbplus_tremove: "(resource $relation, array $tuple [, array& $current])",
            dbplus_undoprepare: "(resource $relation)",
            dbplus_undo: "(resource $relation)",
            dbplus_unlockrel: "(resource $relation)",
            dbplus_unselect: "(resource $relation)",
            dbplus_update: "(resource $relation, array $old, array $new)",
            dbplus_xlockrel: "(resource $relation)",
            dbplus_xunlockrel: "(resource $relation)",
            dbstat: "(array $parameter)",
            dbx_close: "(object $link_identifier)",
            dbx_compare: "(array $row_a, array $row_b, string $column_key [, int $flags])",
            dbx_connect: "(mixed $module, string $host, string $database, string $username, string $password [, int $persistent])",
            dbx_error: "(object $link_identifier)",
            dbx_escape_string: "(object $link_identifier, string $text)",
            dbx_fetch_row: "(object $result_identifier)",
            dbx_query: "(object $link_identifier, string $sql_statement [, int $flags])",
            dbx_sort: "(object $result, string $user_compare_function)",
            dcgettext: "(string $domain, string $message, int $category)",
            dcngettext: "(string $domain, string $msgid1, string $msgid2, int $n, int $category)",
            dcstat: "(array $parameter)",
            deaggregate: "(object $object [, string $class_name])",
            debug_backtrace: "([bool $provide_object])",
            debug_print_backtrace: "(void)",
            debug_zval_dump: "(mixed $variable)",
            decbin: "(int $number)",
            dechex: "(int $number)",
            decoct: "(int $number)",
            defined: "(string $name)",
            define: "(string $name, mixed $value [, bool $case_insensitive])",
            define_syslog_variables: "(void)",
            deg2rad: "(float $number)",
            "delete": "(void)",
            description: "(void)",
            dgettext: "(string $domain, string $message)",
            dio_close: "(resource $fd)",
            dio_fcntl: "(resource $fd, int $cmd [, mixed $args])",
            dio_open: "(string $filename, int $flags [, int $mode])",
            dio_read: "(resource $fd [, int $len])",
            dio_seek: "(resource $fd, int $pos [, int $whence])",
            dio_stat: "(resource $fd)",
            dio_tcsetattr: "(resource $fd, array $options)",
            dio_truncate: "(resource $fd, int $offset)",
            dio_write: "(resource $fd, string $data [, int $len])",
            dirname: "(string $path)",
            disconnect: "(void)",
            disk_free_space: "(string $directory)",
            disk_total_space: "(string $directory)",
            dl: "(string $library)",
            dngettext: "(string $domain, string $msgid1, string $msgid2, int $n)",
            dns_get_record: "(string $hostname [, int $type])",
            "DomDocument->add_root": "(string $name)",
            "DomDocument->create_attribute": "(string $name, string $value)",
            "DomDocument->create_cdata_section": "(string $content)",
            "DomDocument->create_comment": "(string $content)",
            "DomDocument->create_element_ns": "(string $uri, string $name [, string $prefix])",
            "DomDocument->create_element": "(string $name)",
            "DomDocument->create_entity_reference": "(string $content)",
            "DomDocument->create_processing_instruction": "(string $content)",
            "DomDocument->create_text_node": "(string $content)",
            "DomDocument->doctype": "(void)",
            "DomDocument->document_element": "(void)",
            "DomDocument->dump_file": "(string $filename [, bool $compressionmode [, bool $format]])",
            "DomDocument->dump_mem": "([bool $format [, string $encoding]])",
            "DomDocument->get_element_by_id": "(string $id)",
            "DomDocument->get_elements_by_tagname": "(string $name)",
            "DomDocument->html_dump_mem": "(void)",
            "DomDocument->xinclude": "(void)",
            dom_import_simplexml: "(SimpleXMLElement $node)",
            "DomNode->append_sibling": "(domelement $newnode)",
            "DomNode->attributes": "(void)",
            "DomNode->child_nodes": "(void)",
            "DomNode->clone_node": "(void)",
            "DomNode->dump_node": "(void)",
            "DomNode->first_child": "(void)",
            "DomNode->get_content": "(void)",
            "DomNode->has_attributes": "(void)",
            "DomNode->has_child_nodes": "(void)",
            "DomNode->insert_before": "(domelement $newnode, domelement $refnode)",
            "DomNode->is_blank_node": "(void)",
            "DomNode->last_child": "(void)",
            "DomNode->next_sibling": "(void)",
            "DomNode->node_name": "(void)",
            "DomNode->node_type": "(void)",
            "DomNode->node_value": "(void)",
            "DomNode->owner_document": "(void)",
            "DomNode->parent_node": "(void)",
            "DomNode->prefix": "(void)",
            "DomNode->previous_sibling": "(void)",
            "DomNode->remove_child": "(domtext $oldchild)",
            "DomNode->replace_child": "(domelement $newnode, domelement $oldnode)",
            "DomNode->replace_node": "(domelement $newnode)",
            "DomNode->set_content": "(string $content)",
            "DomNode->set_namespace": "(string $uri [, string $prefix])",
            "DomNode->set_name": "(void)",
            "DomNode->unlink_node": "(void)",
            domxml_new_doc: "(string $version)",
            domxml_open_file: "(string $filename [, int $mode [, array& $error]])",
            domxml_open_mem: "(string $str [, int $mode [, array& $error]])",
            domxml_version: "(void)",
            domxml_xmltree: "(string $str)",
            domxml_xslt_stylesheet_doc: "(DomDocument $xsl_doc)",
            domxml_xslt_stylesheet_file: "(string $xsl_file)",
            domxml_xslt_stylesheet: "(string $xsl_buf)",
            domxml_xslt_version: "(void)",
            __doRequest: "(string $request, string $location, string $action, int $version [, int $one_way])",
            dotnet_load: "(string $assembly_name [, string $datatype_name [, int $codepage]])",
            drawArc: "(float $r, float $startAngle, float $endAngle)",
            drawCircle: "(float $r)",
            drawCubic: "(float $bx, float $by, float $cx, float $cy, float $dx, float $dy)",
            drawCubicTo: "(float $bx, float $by, float $cx, float $cy, float $dx, float $dy)",
            drawCurve: "(int $controldx, int $controldy, int $anchordx, int $anchordy [, int $targetdx], int $targetdy)",
            drawCurveTo: "(int $controlx, int $controly, int $anchorx, int $anchory [, int $targetx], int $targety)",
            drawGlyph: "(SWFFont $font, string $character [, int $size])",
            drawLine: "(int $dx, int $dy)",
            drawLineTo: "(int $x, int $y)",
            dstanchors: "(array $parameter)",
            dstofsrcanchor: "(array $parameter)",
            each: "(array& $array)",
            easter_date: "([int $year])",
            easter_days: "([int $year [, int $method]])",
            ebcdic2ascii: "(string $ebcdic_str)",
            echo: "(string $arg1 [, string $...])",
            empty: "(mixed $var)",
            enchant_broker_describe: "(resource $broker)",
            enchant_broker_dict_exists: "(resource $broker, string $tag)",
            enchant_broker_free_dict: "(resource $dict)",
            enchant_broker_free: "(resource $broker)",
            enchant_broker_get_error: "(resource $broker)",
            enchant_broker_init: "(void)",
            enchant_broker_list_dicts: "(resource $broker)",
            enchant_broker_request_dict: "(resource $broker, string $tag)",
            enchant_broker_request_pwl_dict: "(resource $broker, string $filename)",
            enchant_broker_set_ordering: "(resource $broker, string $tag, string $ordering)",
            enchant_dict_add_to_personal: "(resource $dict, string $word)",
            enchant_dict_add_to_session: "(resource $dict, string $word)",
            enchant_dict_check: "(resource $dict, string $word)",
            enchant_dict_describe: "(resource $dict)",
            enchant_dict_get_error: "(resource $dict)",
            enchant_dict_is_in_session: "(resource $dict, string $word)",
            enchant_dict_quick_check: "(resource $dict, string $word [, array& $suggestions])",
            enchant_dict_store_replacement: "(resource $dict, string $mis, string $cor)",
            enchant_dict_suggest: "(resource $dict, string $word)",
            end: "(array& $array)",
            endAttribute: "(void)",
            endCData: "(void)",
            endComment: "(void)",
            endDocument: "(void)",
            endDTDAttlist: "(void)",
            endDTDElement: "(void)",
            endDTDEntity: "(void)",
            endDTD: "(void)",
            endElement: "(void)",
            endMask: "(void)",
            endPI: "(void)",
            entities: "(void)",
            eof: "(void)",
            erase: "([int $offset [, int $length]])",
            eregi_replace: "(string $pattern, string $replacement, string $string)",
            eregi: "(string $pattern, string $string [, array& $regs])",
            ereg_replace: "(string $pattern, string $replacement, string $string)",
            ereg: "(string $pattern, string $string [, array& $regs])",
            error_get_last: "(void)",
            error_log: "(string $message [, int $message_type [, string $destination [, string $extra_headers]]])",
            error_reporting: "([int $level])",
            escapeshellarg: "(string $arg)",
            escapeshellcmd: "(string $command)",
            eval: "(string $code_str)",
            exec: "(string $command [, array& $output [, int& $return_var]])",
            exif_imagetype: "(string $filename)",
            exif_read_data: "(string $filename [, string $sections [, bool $arrays [, bool $thumbnail]]])",
            exif_tagname: "(string $index)",
            exif_thumbnail: "(string $filename [, int& $width [, int& $height [, int& $imagetype]]])",
            exit: "([string $status])",
            expect_expectl: "(resource $expect, array $cases [, array& $match])",
            expect_popen: "(string $command)",
            exp: "(float $arg)",
            explode: "(string $delimiter, string $string [, int $limit])",
            expm1: "(float $arg)",
            "export": "(string $filename [, int $start [, int $length]])",
            extension_loaded: "(string $name)",
            extract: "(array $var_array [, int $extract_type [, string $prefix]])",
            ezmlm_hash: "(string $addr)",
            fam_cancel_monitor: "(resource $fam, resource $fam_monitor)",
            fam_close: "(resource $fam)",
            fam_monitor_collection: "(resource $fam, string $dirname, int $depth, string $mask)",
            fam_monitor_directory: "(resource $fam, string $dirname)",
            fam_monitor_file: "(resource $fam, string $filename)",
            fam_next_event: "(resource $fam)",
            fam_open: "([string $appname])",
            fam_pending: "(resource $fam)",
            fam_resume_monitor: "(resource $fam, resource $fam_monitor)",
            fam_suspend_monitor: "(resource $fam, resource $fam_monitor)",
            fault: "(string $code, string $string [, string $actor [, mixed $details [, string $name]]])",
            fbsql_affected_rows: "([resource $link_identifier])",
            fbsql_autocommit: "(resource $link_identifier [, bool $OnOff])",
            fbsql_blob_size: "(string $blob_handle [, resource $link_identifier])",
            fbsql_change_user: "(string $user, string $password [, string $database [, resource $link_identifier]])",
            fbsql_clob_size: "(string $clob_handle [, resource $link_identifier])",
            fbsql_close: "([resource $link_identifier])",
            fbsql_commit: "([resource $link_identifier])",
            fbsql_connect: "([string $hostname [, string $username [, string $password]]])",
            fbsql_create_blob: "(string $blob_data [, resource $link_identifier])",
            fbsql_create_clob: "(string $clob_data [, resource $link_identifier])",
            fbsql_create_db: "(string $database_name [, resource $link_identifier [, string $database_options]])",
            fbsql_database_password: "(resource $link_identifier [, string $database_password])",
            fbsql_database: "(resource $link_identifier [, string $database])",
            fbsql_data_seek: "(resource $result, int $row_number)",
            fbsql_db_query: "(string $database, string $query [, resource $link_identifier])",
            fbsql_db_status: "(string $database_name [, resource $link_identifier])",
            fbsql_drop_db: "(string $database_name [, resource $link_identifier])",
            fbsql_errno: "([resource $link_identifier])",
            fbsql_error: "([resource $link_identifier])",
            fbsql_fetch_array: "(resource $result [, int $result_type])",
            fbsql_fetch_assoc: "(resource $result)",
            fbsql_fetch_field: "(resource $result [, int $field_offset])",
            fbsql_fetch_lengths: "(resource $result)",
            fbsql_fetch_object: "(resource $result)",
            fbsql_fetch_row: "(resource $result)",
            fbsql_field_flags: "(resource $result [, int $field_offset])",
            fbsql_field_len: "(resource $result [, int $field_offset])",
            fbsql_field_name: "(resource $result [, int $field_index])",
            fbsql_field_seek: "(resource $result [, int $field_offset])",
            fbsql_field_table: "(resource $result [, int $field_offset])",
            fbsql_field_type: "(resource $result [, int $field_offset])",
            fbsql_free_result: "(resource $result)",
            fbsql_get_autostart_info: "([resource $link_identifier])",
            fbsql_hostname: "(resource $link_identifier [, string $host_name])",
            fbsql_insert_id: "([resource $link_identifier])",
            fbsql_list_dbs: "([resource $link_identifier])",
            fbsql_list_fields: "(string $database_name, string $table_name [, resource $link_identifier])",
            fbsql_list_tables: "(string $database [, resource $link_identifier])",
            fbsql_next_result: "(resource $result)",
            fbsql_num_fields: "(resource $result)",
            fbsql_num_rows: "(resource $result)",
            fbsql_password: "(resource $link_identifier [, string $password])",
            fbsql_pconnect: "([string $hostname [, string $username [, string $password]]])",
            fbsql_query: "(string $query [, resource $link_identifier [, int $batch_size]])",
            fbsql_read_blob: "(string $blob_handle [, resource $link_identifier])",
            fbsql_read_clob: "(string $clob_handle [, resource $link_identifier])",
            fbsql_result: "(resource $result [, int $row [, mixed $field]])",
            fbsql_rollback: "([resource $link_identifier])",
            fbsql_rows_fetched: "(resource $result)",
            fbsql_select_db: "([string $database_name [, resource $link_identifier]])",
            fbsql_set_characterset: "(resource $link_identifier, int $characterset [, int $in_out_both])",
            fbsql_set_lob_mode: "(resource $result, int $lob_mode)",
            fbsql_set_password: "(resource $link_identifier, string $user, string $password, string $old_password)",
            fbsql_set_transaction: "(resource $link_identifier, int $locking, int $isolation)",
            fbsql_start_db: "(string $database_name [, resource $link_identifier [, string $database_options]])",
            fbsql_stop_db: "(string $database_name [, resource $link_identifier])",
            fbsql_table_name: "(resource $result, int $index)",
            fbsql_username: "(resource $link_identifier [, string $username])",
            fbsql_warnings: "([bool $OnOff])",
            fclose: "(resource $handle)",
            fdf_add_doc_javascript: "(resource $fdf_document, string $script_name, string $script_code)",
            fdf_add_template: "(resource $fdf_document, int $newpage, string $filename, string $template, int $rename)",
            fdf_close: "(resource $fdf_document)",
            fdf_create: "(void)",
            fdf_enum_values: "(resource $fdf_document, callback $function [, mixed $userdata])",
            fdf_errno: "(void)",
            fdf_error: "([int $error_code])",
            fdf_get_ap: "(resource $fdf_document, string $field, int $face, string $filename)",
            fdf_get_attachment: "(resource $fdf_document, string $fieldname, string $savepath)",
            fdf_get_encoding: "(resource $fdf_document)",
            fdf_get_file: "(resource $fdf_document)",
            fdf_get_flags: "(resource $fdf_document, string $fieldname, int $whichflags)",
            fdf_get_opt: "(resource $fdf_document, string $fieldname [, int $element])",
            fdf_get_status: "(resource $fdf_document)",
            fdf_get_value: "(resource $fdf_document, string $fieldname [, int $which])",
            fdf_get_version: "([resource $fdf_document])",
            fdf_header: "(void)",
            fdf_next_field_name: "(resource $fdf_document [, string $fieldname])",
            fdf_open: "(string $filename)",
            fdf_open_string: "(string $fdf_data)",
            fdf_remove_item: "(resource $fdf_document, string $fieldname, int $item)",
            fdf_save: "(resource $fdf_document [, string $filename])",
            fdf_save_string: "(resource $fdf_document)",
            fdf_set_ap: "(resource $fdf_document, string $field_name, int $face, string $filename, int $page_number)",
            fdf_set_encoding: "(resource $fdf_document, string $encoding)",
            fdf_set_file: "(resource $fdf_document, string $url [, string $target_frame])",
            fdf_set_flags: "(resource $fdf_document, string $fieldname, int $whichFlags, int $newFlags)",
            fdf_set_javascript_action: "(resource $fdf_document, string $fieldname, int $trigger, string $script)",
            fdf_set_on_import_javascript: "(resource $fdf_document, string $script, bool $before_data_import)",
            fdf_set_opt: "(resource $fdf_document, string $fieldname, int $element, string $str1, string $str2)",
            fdf_set_status: "(resource $fdf_document, string $status)",
            fdf_set_submit_form_action: "(resource $fdf_document, string $fieldname, int $trigger, string $script, int $flags)",
            fdf_set_target_frame: "(resource $fdf_document, string $frame_name)",
            fdf_set_value: "(resource $fdf_document, string $fieldname, mixed $value [, int $isName])",
            fdf_set_version: "(resource $fdf_document, string $version)",
            feof: "(resource $handle)",
            fflush: "(resource $handle)",
            fgetc: "(resource $handle)",
            fgetcsv: "(resource $handle [, int $length [, string $delimiter [, string $enclosure [, string $escape]]]])",
            fgets: "(resource $handle [, int $length])",
            fgetss: "(resource $handle [, int $length [, string $allowable_tags]])",
            fileatime: "(string $filename)",
            filectime: "(string $filename)",
            file_exists: "(string $filename)",
            file_get_contents: "(string $filename [, int $flags [, resource $context [, int $offset [, int $maxlen]]]])",
            filegroup: "(string $filename)",
            fileinode: "(string $filename)",
            filemtime: "(string $filename)",
            fileowner: "(string $filename)",
            fileperms: "(string $filename)",
            filepro_fieldcount: "(void)",
            filepro_fieldname: "(int $field_number)",
            filepro_fieldtype: "(int $field_number)",
            filepro_fieldwidth: "(int $field_number)",
            filepro_retrieve: "(int $row_number, int $field_number)",
            filepro_rowcount: "(void)",
            filepro: "(string $directory)",
            file_put_contents: "(string $filename, mixed $data [, int $flags [, resource $context]])",
            filesize: "(string $filename)",
            file: "(string $filename [, int $flags [, resource $context]])",
            filetype: "(string $filename)",
            filter_has_var: "(int $type, string $variable_name)",
            filter_id: "(string $filtername)",
            filter_input_array: "(int $type [, mixed $definition])",
            filter_input: "(int $type, string $variable_name [, int $filter [, mixed $options]])",
            filter_list: "(void)",
            filter_var_array: "(array $data [, mixed $definition])",
            filter_var: "(mixed $variable [, int $filter [, mixed $options]])",
            find: "(array $parameter)",
            finfo_buffer: "(resource $finfo, string $string [, int $options [, resource $context]])",
            finfo_close: "(resource $finfo)",
            finfo_file: "(resource $finfo, string $file_name [, int $options [, resource $context]])",
            finfo_open: "([int $options [, string $arg]])",
            finfo_set_flags: "(resource $finfo, int $options)",
            floatval: "(mixed $var)",
            flock: "(resource $handle, int $operation [, int& $wouldblock])",
            floor: "(float $value)",
            flush: "(void)",
            fmod: "(float $x, float $y)",
            fnmatch: "(string $pattern, string $string [, int $flags])",
            fopen: "(string $filename, string $mode [, bool $use_include_path [, resource $context]])",
            fpassthru: "(resource $handle)",
            fprintf: "(resource $handle, string $format [, mixed $args [, mixed $...]])",
            fputcsv: "(resource $handle, array $fields [, string $delimiter [, string $enclosure]])",
            fread: "(resource $handle, int $length)",
            free: "(void)",
            frenchtojd: "(int $month, int $day, int $year)",
            fribidi_log2vis: "(string $str, string $direction, int $charset)",
            fscanf: "(resource $handle, string $format [, mixed& $...])",
            fseek: "(resource $handle, int $offset [, int $whence])",
            fsockopen: "(string $hostname [, int $port [, int& $errno [, string& $errstr [, float $timeout]]]])",
            fstat: "(resource $handle)",
            ftell: "(resource $handle)",
            ftok: "(string $pathname, string $proj)",
            ftp_alloc: "(resource $ftp_stream, int $filesize [, string& $result])",
            ftp_cdup: "(resource $ftp_stream)",
            ftp_chdir: "(resource $ftp_stream, string $directory)",
            ftp_chmod: "(resource $ftp_stream, int $mode, string $filename)",
            ftp_close: "(resource $ftp_stream)",
            ftp_connect: "(string $host [, int $port [, int $timeout]])",
            ftp_delete: "(resource $ftp_stream, string $path)",
            ftp_exec: "(resource $ftp_stream, string $command)",
            ftp_fget: "(resource $ftp_stream, resource $handle, string $remote_file, int $mode [, int $resumepos])",
            ftp_fput: "(resource $ftp_stream, string $remote_file, resource $handle, int $mode [, int $startpos])",
            ftp_get_option: "(resource $ftp_stream, int $option)",
            ftp_get: "(resource $ftp_stream, string $local_file, string $remote_file, int $mode [, int $resumepos])",
            ftp_login: "(resource $ftp_stream, string $username, string $password)",
            ftp_mdtm: "(resource $ftp_stream, string $remote_file)",
            ftp_mkdir: "(resource $ftp_stream, string $directory)",
            ftp_nb_continue: "(resource $ftp_stream)",
            ftp_nb_fget: "(resource $ftp_stream, resource $handle, string $remote_file, int $mode [, int $resumepos])",
            ftp_nb_fput: "(resource $ftp_stream, string $remote_file, resource $handle, int $mode [, int $startpos])",
            ftp_nb_get: "(resource $ftp_stream, string $local_file, string $remote_file, int $mode [, int $resumepos])",
            ftp_nb_put: "(resource $ftp_stream, string $remote_file, string $local_file, int $mode [, int $startpos])",
            ftp_nlist: "(resource $ftp_stream, string $directory)",
            ftp_pasv: "(resource $ftp_stream, bool $pasv)",
            ftp_put: "(resource $ftp_stream, string $remote_file, string $local_file, int $mode [, int $startpos])",
            ftp_pwd: "(resource $ftp_stream)",
            ftp_rawlist: "(resource $ftp_stream, string $directory [, bool $recursive])",
            ftp_raw: "(resource $ftp_stream, string $command)",
            ftp_rename: "(resource $ftp_stream, string $oldname, string $newname)",
            ftp_rmdir: "(resource $ftp_stream, string $directory)",
            ftp_set_option: "(resource $ftp_stream, int $option, mixed $value)",
            ftp_site: "(resource $ftp_stream, string $command)",
            ftp_size: "(resource $ftp_stream, string $remote_file)",
            ftp_ssl_connect: "(string $host [, int $port [, int $timeout]])",
            ftp_systype: "(resource $ftp_stream)",
            ftruncate: "(resource $handle, int $size)",
            ftstat: "(array $parameter)",
            fullEndElement: "(void)",
            func_get_arg: "(int $arg_num)",
            func_get_args: "(void)",
            func_num_args: "(void)",
            function_exists: "(string $function_name)",
            fwrite: "(resource $handle, string $string [, int $length])",
            gd_info: "(void)",
            geoip_country_code3_by_name: "(string $hostname)",
            geoip_country_code_by_name: "(string $hostname)",
            geoip_country_name_by_name: "(string $hostname)",
            geoip_database_info: "([int $database])",
            geoip_db_avail: "(int $database)",
            geoip_db_filename: "(int $database)",
            geoip_db_get_all_info: "(void)",
            geoip_id_by_name: "(string $hostname)",
            geoip_isp_by_name: "(string $hostname)",
            geoip_org_by_name: "(string $hostname)",
            geoip_record_by_name: "(string $hostname)",
            geoip_region_by_name: "(string $hostname)",
            getallheaders: "(void)",
            getAscent: "(void)",
            get_attribute_node: "(string $name)",
            get_attribute: "(string $name)",
            getAttr: "(void)",
            get_browser: "([string $user_agent [, bool $return_array]])",
            getBuffering: "(void)",
            get_cfg_var: "(string $option)",
            get_class_methods: "(mixed $class_name)",
            get_class: "([object $object])",
            get_class_vars: "(string $class_name)",
            getCrc: "(void)",
            get_current_user: "(void)",
            getcwd: "(void)",
            getdate: "([int $timestamp])",
            get_declared_classes: "(void)",
            get_declared_interfaces: "(void)",
            get_defined_constants: "([mixed $categorize])",
            get_defined_functions: "(void)",
            get_defined_vars: "(void)",
            getDescent: "(void)",
            getDocNamespaces: "([bool $recursive])",
            get_elements_by_tagname: "(string $name)",
            getElem: "(int $index)",
            getenv: "(string $varname)",
            get_extension_funcs: "(string $module_name)",
            getFileTime: "(void)",
            __getFunctions: "(void)",
            getFunctions: "(void)",
            get_headers: "(string $url [, int $format])",
            getHeight: "(void)",
            gethostbyaddr: "(string $ip_address)",
            gethostbynamel: "(string $hostname)",
            gethostbyname: "(string $hostname)",
            getHostOs: "(void)",
            get_html_translation_table: "([int $table [, int $quote_style]])",
            getimagesize: "(string $filename [, array& $imageinfo])",
            get_included_files: "(void)",
            get_include_path: "(void)",
            getlastmod: "(void)",
            __getLastRequestHeaders: "(void)",
            __getLastRequest: "(void)",
            __getLastResponseHeaders: "(void)",
            __getLastResponse: "(void)",
            getLeading: "(void)",
            get_loaded_extensions: "([bool $zend_extensions=FALSE])",
            get_magic_quotes_gpc: "(void)",
            get_magic_quotes_runtime: "(void)",
            get_meta_tags: "(string $filename [, bool $use_include_path])",
            getMethod: "(void)",
            getmxrr: "(string $hostname, array& $mxhosts [, array& $weight])",
            getmygid: "(void)",
            getmyinode: "(void)",
            getmypid: "(void)",
            getmyuid: "(void)",
            getNamespaces: "([bool $recursive])",
            getName: "(void)",
            getNumFrames: "(void)",
            get_object_vars: "(object $object)",
            getopt: "(string $options [, array $longopts])",
            getPackedSize: "(void)",
            get_parent_class: "([mixed $object])",
            getprotobyname: "(string $name)",
            getprotobynumber: "(int $number)",
            getrandmax: "(void)",
            get_resource_type: "(resource $handle)",
            getRot: "(void)",
            getrusage: "([int $who])",
            getservbyname: "(string $service, string $protocol)",
            getservbyport: "(int $port, string $protocol)",
            getShape1: "(void)",
            getShape2: "(void)",
            getShape: "(int $code)",
            gettext: "(string $message)",
            gettimeofday: "([bool $return_float])",
            gettype: "(mixed $var)",
            __getTypes: "(void)",
            getUnpackedSize: "(void)",
            getUTF8Width: "(string $string)",
            getVersion: "(void)",
            getWidth: "(string $string)",
            getXScale: "(void)",
            getXSkew: "(void)",
            getX: "(void)",
            getYScale: "(void)",
            getYSkew: "(void)",
            getY: "(void)",
            glob: "(string $pattern [, int $flags])",
            gmdate: "(string $format [, int $timestamp])",
            gmmktime: "([int $hour [, int $minute [, int $second [, int $month [, int $day [, int $year [, int $is_dst]]]]]]])",
            gmp_abs: "(resource $a)",
            gmp_add: "(resource $a, resource $b)",
            gmp_and: "(resource $a, resource $b)",
            gmp_clrbit: "(resource& $a, int $index)",
            gmp_cmp: "(resource $a, resource $b)",
            gmp_com: "(resource $a)",
            gmp_divexact: "(resource $n, resource $d)",
            gmp_div_q: "(resource $a, resource $b [, int $round])",
            gmp_div_qr: "(resource $n, resource $d [, int $round])",
            gmp_div_r: "(resource $n, resource $d [, int $round])",
            gmp_fact: "(int $a)",
            gmp_gcdext: "(resource $a, resource $b)",
            gmp_gcd: "(resource $a, resource $b)",
            gmp_hamdist: "(resource $a, resource $b)",
            gmp_init: "(mixed $number [, int $base])",
            gmp_intval: "(resource $gmpnumber)",
            gmp_invert: "(resource $a, resource $b)",
            gmp_jacobi: "(resource $a, resource $p)",
            gmp_legendre: "(resource $a, resource $p)",
            gmp_mod: "(resource $n, resource $d)",
            gmp_mul: "(resource $a, resource $b)",
            gmp_neg: "(resource $a)",
            gmp_nextprime: "(int $a)",
            gmp_or: "(resource $a, resource $b)",
            gmp_perfect_square: "(resource $a)",
            gmp_popcount: "(resource $a)",
            gmp_powm: "(resource $base, resource $exp, resource $mod)",
            gmp_pow: "(resource $base, int $exp)",
            gmp_prob_prime: "(resource $a [, int $reps])",
            gmp_random: "(int $limiter)",
            gmp_scan0: "(resource $a, int $start)",
            gmp_scan1: "(resource $a, int $start)",
            gmp_setbit: "(resource& $a, int $index [, bool $set_clear])",
            gmp_sign: "(resource $a)",
            gmp_sqrtrem: "(resource $a)",
            gmp_sqrt: "(resource $a)",
            gmp_strval: "(resource $gmpnumber [, int $base])",
            gmp_sub: "(resource $a, resource $b)",
            gmp_testbit: "(resource $a, int $index)",
            gmp_xor: "(resource $a, resource $b)",
            gmstrftime: "(string $format [, int $timestamp])",
            gnupg_adddecryptkey: "(resource $identifier, string $fingerprint, string $passphrase)",
            gnupg_addencryptkey: "(resource $identifier, string $fingerprint)",
            gnupg_addsignkey: "(resource $identifier, string $fingerprint [, string $passphrase])",
            gnupg_cleardecryptkeys: "(resource $identifier)",
            gnupg_clearencryptkeys: "(resource $identifier)",
            gnupg_clearsignkeys: "(resource $identifier)",
            gnupg_decrypt: "(resource $identifier, string $text)",
            gnupg_decryptverify: "(resource $identifier, string $text, string& $plaintext)",
            gnupg_encrypt: "(resource $identifier, string $plaintext)",
            gnupg_encryptsign: "(resource $identifier, string $plaintext)",
            gnupg_export: "(resource $identifier, string $fingerprint)",
            gnupg_geterror: "(resource $identifier)",
            gnupg_getprotocol: "(resource $identifier)",
            gnupg_import: "(resource $identifier, string $keydata)",
            gnupg_init: "(void)",
            gnupg_keyinfo: "(resource $identifier, string $pattern)",
            gnupg_setarmor: "(resource $identifier, int $armor)",
            gnupg_seterrormode: "(resource $identifier, int $errormode)",
            gnupg_setsignmode: "(resource $identifier, int $signmode)",
            gnupg_sign: "(resource $identifier, string $plaintext)",
            gnupg_verify: "(resource $identifier, string $signed_text, string $signature [, string& $plaintext])",
            gopher_parsedir: "(string $dirent)",
            grapheme_extract: "(string $haystack, int $size [, int $extract_type [, int $start [, int& $next]]])",
            grapheme_stripos: "(string $haystack, string $needle [, int $offset])",
            grapheme_stristr: "(string $haystack, string $needle [, boolean $before_needle])",
            grapheme_strlen: "(string $input)",
            grapheme_strpos: "(string $haystack, string $needle [, int $offset])",
            grapheme_strripos: "(string $haystack, string $needle [, int $offset])",
            grapheme_strrpos: "(string $haystack, string $needle [, int $offset])",
            grapheme_strstr: "(string $haystack, string $needle [, boolean $before_needle])",
            grapheme_substr: "(string $string, int $start [, int $length])",
            gregoriantojd: "(int $month, int $day, int $year)",
            gzclose: "(resource $zp)",
            gzcompress: "(string $data [, int $level])",
            gzdecode: "(string $data [, int $length])",
            gzdeflate: "(string $data [, int $level])",
            gzencode: "(string $data [, int $level [, int $encoding_mode]])",
            gzeof: "(resource $zp)",
            gzfile: "(string $filename [, int $use_include_path])",
            gzgetc: "(resource $zp)",
            gzgets: "(resource $zp, int $length)",
            gzgetss: "(resource $zp, int $length [, string $allowable_tags])",
            gzinflate: "(string $data [, int $length])",
            gzopen: "(string $filename, string $mode [, int $use_include_path])",
            gzpassthru: "(resource $zp)",
            gzread: "(resource $zp, int $length)",
            gzrewind: "(resource $zp)",
            gzseek: "(resource $zp, int $offset)",
            gztell: "(resource $zp)",
            gzuncompress: "(string $data [, int $length])",
            gzwrite: "(resource $zp, string $string [, int $length])",
            __halt_compiler: "(void)",
            handle: "([string $soap_request])",
            "HaruAnnotation::setBorderStyle": "(float $width, int $dash_on, int $dash_off)",
            "HaruAnnotation::setHighlightMode": "(int $mode)",
            "HaruAnnotation::setIcon": "(int $icon)",
            "HaruAnnotation::setOpened": "(bool $opened)",
            "HaruDestination::setFitBH": "(float $top)",
            "HaruDestination::setFitBV": "(float $left)",
            "HaruDestination::setFitB": "(void)",
            "HaruDestination::setFitH": "(float $top)",
            "HaruDestination::setFitR": "(float $left, float $bottom, float $right, float $top)",
            "HaruDestination::setFitV": "(float $left)",
            "HaruDestination::setFit": "(void)",
            "HaruDestination::setXYZ": "(float $left, float $top, float $zoom)",
            "HaruDoc::addPageLabel": "(int $first_page, int $style, int $first_num [, string $prefix])",
            "HaruDoc::addPage": "(void)",
            "HaruDoc::__construct": "(void)",
            "HaruDoc::createOutline": "(string $title [, object $parent_outline [, object $encoder]])",
            "HaruDoc::getCurrentEncoder": "(void)",
            "HaruDoc::getCurrentPage": "(void)",
            "HaruDoc::getEncoder": "(string $encoding)",
            "HaruDoc::getFont": "(string $fontname [, string $encoding])",
            "HaruDoc::getInfoAttr": "(int $type)",
            "HaruDoc::getPageLayout": "(void)",
            "HaruDoc::getPageMode": "(void)",
            "HaruDoc::getStreamSize": "(void)",
            "HaruDoc::insertPage": "(object $page)",
            "HaruDoc::loadJPEG": "(string $filename)",
            "HaruDoc::loadPNG": "(string $filename [, bool $deferred])",
            "HaruDoc::loadRaw": "(string $filename, int $width, int $height, int $color_space)",
            "HaruDoc::loadTTC": "(string $fontfile, int $index [, bool $embed])",
            "HaruDoc::loadTTF": "(string $fontfile [, bool $embed])",
            "HaruDoc::loadType1": "(string $afmfile [, string $pfmfile])",
            "HaruDoc::output": "(void)",
            "HaruDoc::readFromStream": "(int $bytes)",
            "HaruDoc::resetError": "(void)",
            "HaruDoc::resetStream": "(void)",
            "HaruDoc::save": "(string $file)",
            "HaruDoc::saveToStream": "(void)",
            "HaruDoc::setCompressionMode": "(int $mode)",
            "HaruDoc::setCurrentEncoder": "(string $encoding)",
            "HaruDoc::setEncryptionMode": "(int $mode [, int $key_len])",
            "HaruDoc::setInfoAttr": "(int $type, string $info)",
            "HaruDoc::setInfoDateAttr": "(int $type, int $year, int $month, int $day, int $hour, int $min, int $sec, string $ind, int $off_hour, int $off_min)",
            "HaruDoc::setOpenAction": "(object $destination)",
            "HaruDoc::setPageLayout": "(int $layout)",
            "HaruDoc::setPageMode": "(int $mode)",
            "HaruDoc::setPagesConfiguration": "(int $page_per_pages)",
            "HaruDoc::setPassword": "(string $owner_password, string $user_password)",
            "HaruDoc::setPermission": "(int $permission)",
            "HaruDoc::useCNSEncodings": "(void)",
            "HaruDoc::useCNSFonts": "(void)",
            "HaruDoc::useCNTEncodings": "(void)",
            "HaruDoc::useCNTFonts": "(void)",
            "HaruDoc::useJPEncodings": "(void)",
            "HaruDoc::useJPFonts": "(void)",
            "HaruDoc::useKREncodings": "(void)",
            "HaruDoc::useKRFonts": "(void)",
            "HaruEncoder::getByteType": "(string $text, int $index)",
            "HaruEncoder::getType": "(void)",
            "HaruEncoder::getUnicode": "(int $character)",
            "HaruEncoder::getWritingMode": "(void)",
            "HaruFont::getAscent": "(void)",
            "HaruFont::getCapHeight": "(void)",
            "HaruFont::getDescent": "(void)",
            "HaruFont::getEncodingName": "(void)",
            "HaruFont::getFontName": "(void)",
            "HaruFont::getTextWidth": "(string $text)",
            "HaruFont::getUnicodeWidth": "(int $character)",
            "HaruFont::getXHeight": "(void)",
            "HaruFont::measureText": "(string $text, float $width, float $font_size, float $char_space, float $word_space [, bool $word_wrap])",
            "HaruImage::getBitsPerComponent": "(void)",
            "HaruImage::getColorSpace": "(void)",
            "HaruImage::getHeight": "(void)",
            "HaruImage::getSize": "(void)",
            "HaruImage::getWidth": "(void)",
            "HaruImage::setColorMask": "(int $rmin, int $rmax, int $gmin, int $gmax, int $bmin, int $bmax)",
            "HaruImage::setMaskImage": "(object $mask_image)",
            "HaruOutline::setDestination": "(object $destination)",
            "HaruOutline::setOpened": "(bool $opened)",
            "HaruPage::arc": "(float $x, float $y, float $ray, float $ang1, float $ang2)",
            "HaruPage::beginText": "(void)",
            "HaruPage::circle": "(float $x, float $y, float $ray)",
            "HaruPage::closePath": "(void)",
            "HaruPage::concat": "(float $a, float $b, float $c, float $d, float $x, float $y)",
            "HaruPage::createDestination": "(void)",
            "HaruPage::createLinkAnnotation": "(array $rectangle, object $destination)",
            "HaruPage::createTextAnnotation": "(array $rectangle, string $text [, object $encoder])",
            "HaruPage::createURLAnnotation": "(array $rectangle, string $url)",
            "HaruPage::curveTo2": "(float $x2, float $y2, float $x3, float $y3)",
            "HaruPage::curveTo3": "(float $x1, float $y1, float $x3, float $y3)",
            "HaruPage::curveTo": "(float $x1, float $y1, float $x2, float $y2, float $x3, float $y3)",
            "HaruPage::drawImage": "(object $image, float $x, float $y, float $width, float $height)",
            "HaruPage::ellipse": "(float $x, float $y, float $xray, float $yray)",
            "HaruPage::endPath": "(void)",
            "HaruPage::endText": "(void)",
            "HaruPage::eoFillStroke": "([bool $close_path])",
            "HaruPage::eofill": "(void)",
            "HaruPage::fillStroke": "([bool $close_path])",
            "HaruPage::fill": "(void)",
            "HaruPage::getCharSpace": "(void)",
            "HaruPage::getCMYKFill": "(void)",
            "HaruPage::getCMYKStroke": "(void)",
            "HaruPage::getCurrentFontSize": "(void)",
            "HaruPage::getCurrentFont": "(void)",
            "HaruPage::getCurrentPos": "(void)",
            "HaruPage::getCurrentTextPos": "(void)",
            "HaruPage::getDash": "(void)",
            "HaruPage::getFillingColorSpace": "(void)",
            "HaruPage::getFlatness": "(void)",
            "HaruPage::getGMode": "(void)",
            "HaruPage::getGrayFill": "(void)",
            "HaruPage::getGrayStroke": "(void)",
            "HaruPage::getHeight": "(void)",
            "HaruPage::getHorizontalScaling": "(void)",
            "HaruPage::getLineCap": "(void)",
            "HaruPage::getLineJoin": "(void)",
            "HaruPage::getLineWidth": "(void)",
            "HaruPage::getMiterLimit": "(void)",
            "HaruPage::getRGBFill": "(void)",
            "HaruPage::getRGBStroke": "(void)",
            "HaruPage::getStrokingColorSpace": "(void)",
            "HaruPage::getTextLeading": "(void)",
            "HaruPage::getTextMatrix": "(void)",
            "HaruPage::getTextRenderingMode": "(void)",
            "HaruPage::getTextRise": "(void)",
            "HaruPage::getTextWidth": "(string $text)",
            "HaruPage::getTransMatrix": "(void)",
            "HaruPage::getWidth": "(void)",
            "HaruPage::getWordSpace": "(void)",
            "HaruPage::lineTo": "(float $x, float $y)",
            "HaruPage::measureText": "(string $text, float $width [, bool $wordwrap])",
            "HaruPage::moveTextPos": "(float $x, float $y [, bool $set_leading])",
            "HaruPage::moveTo": "(float $x, float $y)",
            "HaruPage::moveToNextLine": "(void)",
            "HaruPage::rectangle": "(float $x, float $y, float $width, float $height)",
            "HaruPage::setCharSpace": "(float $char_space)",
            "HaruPage::setCMYKFill": "(float $c, float $m, float $y, float $k)",
            "HaruPage::setCMYKStroke": "(float $c, float $m, float $y, float $k)",
            "HaruPage::setDash": "(array $pattern, int $phase)",
            "HaruPage::setFlatness": "(float $flatness)",
            "HaruPage::setFontAndSize": "(object $font, float $size)",
            "HaruPage::setGrayFill": "(float $value)",
            "HaruPage::setGrayStroke": "(float $value)",
            "HaruPage::setHeight": "(float $height)",
            "HaruPage::setHorizontalScaling": "(float $scaling)",
            "HaruPage::setLineCap": "(int $cap)",
            "HaruPage::setLineJoin": "(int $join)",
            "HaruPage::setLineWidth": "(float $width)",
            "HaruPage::setMiterLimit": "(float $limit)",
            "HaruPage::setRGBFill": "(float $r, float $g, float $b)",
            "HaruPage::setRGBStroke": "(float $r, float $g, float $b)",
            "HaruPage::setRotate": "(int $angle)",
            "HaruPage::setSize": "(int $size, int $direction)",
            "HaruPage::setSlideShow": "(int $type, float $disp_time, float $trans_time)",
            "HaruPage::setTextLeading": "(float $text_leading)",
            "HaruPage::setTextMatrix": "(float $a, float $b, float $c, float $d, float $x, float $y)",
            "HaruPage::setTextRenderingMode": "(int $mode)",
            "HaruPage::setTextRise": "(float $rise)",
            "HaruPage::setWidth": "(float $width)",
            "HaruPage::setWordSpace": "(float $word_space)",
            "HaruPage::showTextNextLine": "(string $text [, float $word_space [, float $char_space]])",
            "HaruPage::showText": "(string $text)",
            "HaruPage::stroke": "([bool $close_path])",
            "HaruPage::textOut": "(float $x, float $y, string $text)",
            "HaruPage::textRect": "(float $left, float $top, float $right, float $bottom, string $text [, int $align])",
            has_attribute: "(string $name)",
            hash_algos: "(void)",
            hash_copy: "(resource $context)",
            hash_file: "(string $algo, string $filename [, bool $raw_output])",
            hash_final: "(resource $context [, bool $raw_output])",
            hash_hmac_file: "(string $algo, string $filename, string $key [, bool $raw_output])",
            hash_hmac: "(string $algo, string $data, string $key [, bool $raw_output])",
            hash_init: "(string $algo [, int $options [, string $key]])",
            hash: "(string $algo, string $data [, bool $raw_output])",
            hash_update_file: "(resource $context, string $filename [, resource $context])",
            hash_update: "(resource $context, string $data)",
            hash_update_stream: "(resource $context, resource $handle [, int $length])",
            headers_list: "(void)",
            headers_sent: "([string& $file [, int& $line]])",
            header: "(string $string [, bool $replace [, int $http_response_code]])",
            hebrevc: "(string $hebrew_text [, int $max_chars_per_line])",
            hebrev: "(string $hebrew_text [, int $max_chars_per_line])",
            hexdec: "(string $hex_string)",
            highlight_file: "(string $filename [, bool $return])",
            highlight_string: "(string $str [, bool $return])",
            htmlentities: "(string $string [, int $quote_style [, string $charset [, bool $double_encode]]])",
            html_entity_decode: "(string $string [, int $quote_style [, string $charset]])",
            htmlspecialchars_decode: "(string $string [, int $quote_style])",
            htmlspecialchars: "(string $string [, int $quote_style [, string $charset [, bool $double_encode]]])",
            http_build_cookie: "(array $cookie)",
            http_build_query: "(array $formdata [, string $numeric_prefix [, string $arg_separator]])",
            http_build_str: "(array $query [, string $prefix [, string $arg_separator]])",
            http_build_url: "([mixed $url [, mixed $parts [, int $flags=HTTP_URL_REPLACE [, array& $new_url]]]])",
            http_cache_etag: "([string $etag])",
            http_cache_last_modified: "([int $timestamp_or_expires])",
            http_chunked_decode: "(string $encoded)",
            http_date: "([int $timestamp])",
            "HttpDeflateStream::__construct": "([int $flags=0])",
            "HttpDeflateStream::factory": "([int $flags=0 [, string $class_name=&#039;HttpDeflateStream&#039;]])",
            "HttpDeflateStream::finish": "([string $data])",
            "HttpDeflateStream::flush": "([string $data])",
            "HttpDeflateStream::update": "(string $data)",
            http_deflate: "(string $data [, int $flags=0])",
            http_get_request_body_stream: "(void)",
            http_get_request_body: "(void)",
            http_get_request_headers: "(void)",
            http_get: "(string $url [, array $options [, array& $info]])",
            http_head: "([string $url [, array $options [, array& $info]]])",
            "HttpInflateStream::__construct": "([int $flags=0])",
            "HttpInflateStream::factory": "([int $flags=0 [, string $class_name=&#039;HttpInflateStream&#039;]])",
            "HttpInflateStream::finish": "([string $data])",
            "HttpInflateStream::flush": "([string $data])",
            "HttpInflateStream::update": "(string $data)",
            http_inflate: "(string $data)",
            http_match_etag: "(string $etag [, bool $for_range=FALSE])",
            http_match_modified: "([int $timestamp [, bool $for_range=FALSE]])",
            http_match_request_header: "(string $header, string $value [, bool $match_case=FALSE])",
            "HttpMessage::addHeaders": "(array $headers [, bool $append=FALSE])",
            "HttpMessage::__construct": "([string $message])",
            "HttpMessage::detach": "(void)",
            "HttpMessage::factory": "([string $raw_message [, string $class_name=&#039;HttpMessage&#039;]])",
            "HttpMessage::fromEnv": "(int $message_type [, string $class_name=&#039;HttpMessage&#039;])",
            "HttpMessage::fromString": "([string $raw_message [, string $class_name=&#039;HttpMessage&#039;]])",
            "HttpMessage::getBody": "(void)",
            "HttpMessage::getHeader": "(string $header)",
            "HttpMessage::getHeaders": "(void)",
            "HttpMessage::getHttpVersion": "(void)",
            "HttpMessage::getParentMessage": "(void)",
            "HttpMessage::getRequestMethod": "(void)",
            "HttpMessage::getRequestUrl": "(void)",
            "HttpMessage::getResponseCode": "(void)",
            "HttpMessage::getResponseStatus": "(void)",
            "HttpMessage::getType": "(void)",
            "HttpMessage::guessContentType": "(string $magic_file [, int $magic_mode=MAGIC_MIME])",
            "HttpMessage::prepend": "(HttpMessage $message [, bool $top=TRUE])",
            "HttpMessage::reverse": "(void)",
            "HttpMessage::send": "(void)",
            "HttpMessage::setBody": "(string $body)",
            "HttpMessage::setHeaders": "(array $headers)",
            "HttpMessage::setHttpVersion": "(string $version)",
            "HttpMessage::setRequestMethod": "(string $method)",
            "HttpMessage::setRequestUrl": "(string $url)",
            "HttpMessage::setResponseCode": "(int $code)",
            "HttpMessage::setResponseStatus": "(string $status)",
            "HttpMessage::setType": "(int $type)",
            "HttpMessage::toMessageTypeObject": "(void)",
            "HttpMessage::toString": "([bool $include_parent=FALSE])",
            http_negotiate_charset: "(array $supported [, array& $result])",
            http_negotiate_content_type: "(array $supported [, array& $result])",
            http_negotiate_language: "(array $supported [, array& $result])",
            http_parse_cookie: "(string $cookie [, int $flags [, array $allowed_extras]])",
            http_parse_headers: "(string $header)",
            http_parse_message: "(string $message)",
            http_parse_params: "(string $param [, int $flags=HTTP_PARAMS_DEFAULT])",
            http_persistent_handles_clean: "([string $ident])",
            http_persistent_handles_count: "(void)",
            http_persistent_handles_ident: "(string $ident)",
            http_post_data: "(string $url [, string $data [, array $options [, array& $info]]])",
            http_post_fields: "(string $url [, array $data [, array $files [, array $options [, array& $info]]]])",
            http_put_data: "(string $url [, string $data [, array $options [, array& $info]]])",
            http_put_file: "(string $url [, string $file [, array $options [, array& $info]]])",
            http_put_stream: "(string $url [, resource $stream [, array $options [, array& $info]]])",
            "HttpQueryString::__construct": "([bool $global=TRUE [, mixed $add]])",
            "HttpQueryString::get": "([string $key [, mixed $type=0 [, mixed $defval=NULL [, bool $delete=FALSE]]]])",
            "HttpQueryString::mod": "(mixed $params)",
            "HttpQueryString::set": "(mixed $params)",
            "HttpQueryString::singleton": "([bool $global=TRUE])",
            "HttpQueryString::toArray": "(void)",
            "HttpQueryString::toString": "(void)",
            "HttpQueryString::xlate": "(string $ie, string $oe)",
            http_redirect: "([string $url [, array $params [, bool $session=FALSE [, int $status]]]])",
            "HttpRequest::addCookies": "(array $cookies)",
            "HttpRequest::addHeaders": "(array $headers)",
            "HttpRequest::addPostFields": "(array $post_data)",
            "HttpRequest::addPostFile": "(string $name, string $file [, string $content_type=&#039;application/x-octetstream&#039;])",
            "HttpRequest::addPutData": "(string $put_data)",
            "HttpRequest::addQueryData": "(array $query_params)",
            "HttpRequest::addRawPostData": "(string $raw_post_data)",
            "HttpRequest::addSslOptions": "(array $options)",
            http_request_body_encode: "(array $fields, array $files)",
            "HttpRequest::clearHistory": "(void)",
            "HttpRequest::__construct": "([string $url [, int $request_method=HTTP_METH_GET [, array $options]]])",
            "HttpRequest::enableCookies": "(void)",
            "HttpRequest::getContentType": "(void)",
            "HttpRequest::getCookies": "(void)",
            "HttpRequest::getHeaders": "(void)",
            "HttpRequest::getHistory": "(void)",
            "HttpRequest::getMethod": "(void)",
            "HttpRequest::getOptions": "(void)",
            "HttpRequest::getPostFields": "(void)",
            "HttpRequest::getPostFiles": "(void)",
            "HttpRequest::getPutData": "(void)",
            "HttpRequest::getPutFile": "(void)",
            "HttpRequest::getQueryData": "(void)",
            "HttpRequest::getRawPostData": "(void)",
            "HttpRequest::getRawRequestMessage": "(void)",
            "HttpRequest::getRawResponseMessage": "(void)",
            "HttpRequest::getRequestMessage": "(void)",
            "HttpRequest::getResponseBody": "(void)",
            "HttpRequest::getResponseCode": "(void)",
            "HttpRequest::getResponseCookies": "([int $flags [, array $allowed_extras]])",
            "HttpRequest::getResponseData": "(void)",
            "HttpRequest::getResponseHeader": "([string $name])",
            "HttpRequest::getResponseInfo": "([string $name])",
            "HttpRequest::getResponseMessage": "(void)",
            "HttpRequest::getResponseStatus": "(void)",
            "HttpRequest::getSslOptions": "(void)",
            "HttpRequest::getUrl": "(void)",
            http_request: "(int $method [, string $url [, string $body [, array $options [, array& $info]]]])",
            http_request_method_exists: "(mixed $method)",
            http_request_method_name: "(int $method)",
            http_request_method_register: "(string $method)",
            http_request_method_unregister: "(mixed $method)",
            "HttpRequestPool::attach": "(HttpRequest $request)",
            "HttpRequestPool::__construct": "([HttpRequest $request])",
            "HttpRequestPool::__destruct": "(void)",
            "HttpRequestPool::detach": "(HttpRequest $request)",
            "HttpRequestPool::getAttachedRequests": "(void)",
            "HttpRequestPool::getFinishedRequests": "(void)",
            "HttpRequestPool::reset": "(void)",
            "HttpRequestPool::send": "(void)",
            "HttpRequestPool::socketPerform": "(void)",
            "HttpRequestPool::socketSelect": "(void)",
            "HttpRequest::resetCookies": "([bool $session_only=FALSE])",
            "HttpRequest::send": "(void)",
            "HttpRequest::setContentType": "(string $content_type)",
            "HttpRequest::setCookies": "([array $cookies])",
            "HttpRequest::setHeaders": "([array $headers])",
            "HttpRequest::setMethod": "(int $request_method)",
            "HttpRequest::setOptions": "([array $options])",
            "HttpRequest::setPostFields": "(array $post_data)",
            "HttpRequest::setPostFiles": "(array $post_files)",
            "HttpRequest::setPutData": "([string $put_data])",
            "HttpRequest::setPutFile": "([string $file])",
            "HttpRequest::setQueryData": "(mixed $query_data)",
            "HttpRequest::setRawPostData": "([string $raw_post_data])",
            "HttpRequest::setSslOptions": "([array $options])",
            "HttpRequest::setUrl": "(string $url)",
            "HttpResponse::capture": "(void)",
            "HttpResponse::getBufferSize": "(void)",
            "HttpResponse::getCacheControl": "(void)",
            "HttpResponse::getCache": "(void)",
            "HttpResponse::getContentDisposition": "(void)",
            "HttpResponse::getContentType": "(void)",
            "HttpResponse::getData": "(void)",
            "HttpResponse::getETag": "(void)",
            "HttpResponse::getFile": "(void)",
            "HttpResponse::getGzip": "(void)",
            "HttpResponse::getHeader": "([string $name])",
            "HttpResponse::getLastModified": "(void)",
            "HttpResponse::getRequestBodyStream": "(void)",
            "HttpResponse::getRequestBody": "(void)",
            "HttpResponse::getRequestHeaders": "(void)",
            "HttpResponse::getStream": "(void)",
            "HttpResponse::getThrottleDelay": "(void)",
            "HttpResponse::guessContentType": "(string $magic_file [, int $magic_mode=MAGIC_MIME])",
            "HttpResponse::redirect": "([string $url [, array $params [, bool $session=FALSE [, int $status]]]])",
            "HttpResponse::send": "([bool $clean_ob=TRUE])",
            "HttpResponse::setBufferSize": "(int $bytes)",
            "HttpResponse::setCache": "(bool $cache)",
            "HttpResponse::setCacheControl": "(string $control [, int $max_age=0 [, bool $must_revalidate=TRUE]])",
            "HttpResponse::setContentDisposition": "(string $filename [, bool $inline=FALSE])",
            "HttpResponse::setContentType": "(string $content_type)",
            "HttpResponse::setData": "(mixed $data)",
            "HttpResponse::setETag": "(string $etag)",
            "HttpResponse::setFile": "(string $file)",
            "HttpResponse::setGzip": "(bool $gzip)",
            "HttpResponse::setHeader": "(string $name [, mixed $value [, bool $replace=TRUE]])",
            "HttpResponse::setLastModified": "(int $timestamp)",
            "HttpResponse::setStream": "(resource $stream)",
            "HttpResponse::setThrottleDelay": "(float $seconds)",
            "HttpResponse::status": "(int $status)",
            http_send_content_disposition: "(string $filename [, bool $inline=FALSE])",
            http_send_content_type: "([string $content_type=&#039;application/x-octetstream&#039;])",
            http_send_data: "(string $data)",
            http_send_file: "(string $file)",
            http_send_last_modified: "([int $timestamp])",
            http_send_status: "(int $status)",
            http_send_stream: "(resource $stream)",
            http_support: "([int $feature=0])",
            http_throttle: "([float $sec [, int $bytes=40960]])",
            hw_api_attribute: "([string $name [, string $value]])",
            hw_api_content: "(string $content, string $mimetype)",
            hwapi_hgcsp: "(string $hostname [, int $port])",
            hw_array2objrec: "(array $object_array)",
            hw_changeobject: "(int $link, int $objid, array $attributes)",
            hw_children: "(int $connection, int $objectID)",
            hw_childrenobj: "(int $connection, int $objectID)",
            hw_close: "(int $connection)",
            hw_connection_info: "(int $link)",
            hw_connect: "(string $host, int $port [, string $username], string $password)",
            hw_cp: "(int $connection, array $object_id_array, int $destination_id)",
            hw_deleteobject: "(int $connection, int $object_to_delete)",
            hw_docbyanchor: "(int $connection, int $anchorID)",
            hw_docbyanchorobj: "(int $connection, int $anchorID)",
            hw_document_attributes: "(int $hw_document)",
            hw_document_bodytag: "(int $hw_document [, string $prefix])",
            hw_document_content: "(int $hw_document)",
            hw_document_setcontent: "(int $hw_document, string $content)",
            hw_document_size: "(int $hw_document)",
            hw_dummy: "(int $link, int $id, int $msgid)",
            hw_edittext: "(int $connection, int $hw_document)",
            hw_error: "(int $connection)",
            hw_errormsg: "(int $connection)",
            hw_free_document: "(int $hw_document)",
            hw_getanchors: "(int $connection, int $objectID)",
            hw_getanchorsobj: "(int $connection, int $objectID)",
            hw_getandlock: "(int $connection, int $objectID)",
            hw_getchildcoll: "(int $connection, int $objectID)",
            hw_getchildcollobj: "(int $connection, int $objectID)",
            hw_getchilddoccoll: "(int $connection, int $objectID)",
            hw_getchilddoccollobj: "(int $connection, int $objectID)",
            hw_getobjectbyquerycoll: "(int $connection, int $objectID, string $query, int $max_hits)",
            hw_getobjectbyquerycollobj: "(int $connection, int $objectID, string $query, int $max_hits)",
            hw_getobjectbyquery: "(int $connection, string $query, int $max_hits)",
            hw_getobjectbyqueryobj: "(int $connection, string $query, int $max_hits)",
            hw_getobject: "(int $connection, mixed $objectID [, string $query])",
            hw_getparents: "(int $connection, int $objectID)",
            hw_getparentsobj: "(int $connection, int $objectID)",
            hw_getrellink: "(int $link, int $rootid, int $sourceid, int $destid)",
            hw_getremotechildren: "(int $connection, string $object_record)",
            hw_getremote: "(int $connection, int $objectID)",
            hw_getsrcbydestobj: "(int $connection, int $objectID)",
            hw_gettext: "(int $connection, int $objectID [, mixed $rootID/prefix])",
            hw_getusername: "(int $connection)",
            hw_identify: "(int $link, string $username, string $password)",
            hw_incollections: "(int $connection, array $object_id_array, array $collection_id_array, int $return_collections)",
            hw_info: "(int $connection)",
            hw_inscoll: "(int $connection, int $objectID, array $object_array)",
            hw_insdoc: "(resource $connection, int $parentID, string $object_record [, string $text])",
            hw_insertanchors: "(int $hwdoc, array $anchorecs, array $dest [, array $urlprefixes])",
            hw_insertdocument: "(int $connection, int $parent_id, int $hw_document)",
            hw_insertobject: "(int $connection, string $object_rec, string $parameter)",
            hw_mapid: "(int $connection, int $server_id, int $object_id)",
            hw_modifyobject: "(int $connection, int $object_to_change, array $remove, array $add [, int $mode])",
            hw_mv: "(int $connection, array $object_id_array, int $source_id, int $destination_id)",
            hw_new_document: "(string $object_record, string $document_data, int $document_size)",
            hw_objrec2array: "(string $object_record [, array $format])",
            hw_output_document: "(int $hw_document)",
            hw_pconnect: "(string $host, int $port [, string $username], string $password)",
            hw_pipedocument: "(int $connection, int $objectID [, array $url_prefixes])",
            hw_root: "(void)",
            hw_setlinkroot: "(int $link, int $rootid)",
            hwstat: "(array $parameter)",
            hw_stat: "(int $link)",
            hw_unlock: "(int $connection, int $objectID)",
            hw_who: "(int $connection)",
            hypot: "(float $x, float $y)",
            ibase_add_user: "(resource $service_handle, string $user_name, string $password [, string $first_name [, string $middle_name [, string $last_name]]])",
            ibase_affected_rows: "([resource $link_identifier])",
            ibase_backup: "(resource $service_handle, string $source_db, string $dest_file [, int $options [, bool $verbose]])",
            ibase_blob_add: "(resource $blob_handle, string $data)",
            ibase_blob_cancel: "(resource $blob_handle)",
            ibase_blob_close: "(resource $blob_handle)",
            ibase_blob_create: "([resource $link_identifier])",
            ibase_blob_echo: "([resource $link_identifier], string $blob_id)",
            ibase_blob_get: "(resource $blob_handle, int $len)",
            ibase_blob_import: "(resource $link_identifier, resource $file_handle)",
            ibase_blob_info: "(resource $link_identifier, string $blob_id)",
            ibase_blob_open: "(resource $link_identifier, string $blob_id)",
            ibase_close: "([resource $connection_id])",
            ibase_commit: "([resource $link_or_trans_identifier])",
            ibase_commit_ret: "([resource $link_or_trans_identifier])",
            ibase_connect: "([string $database [, string $username [, string $password [, string $charset [, int $buffers [, int $dialect [, string $role [, int $sync]]]]]]]])",
            ibase_db_info: "(resource $service_handle, string $db, int $action [, int $argument])",
            ibase_delete_user: "(resource $service_handle, string $user_name)",
            ibase_drop_db: "([resource $connection])",
            ibase_errcode: "(void)",
            ibase_errmsg: "(void)",
            ibase_execute: "(resource $query [, mixed $bind_arg [, mixed $...]])",
            ibase_fetch_assoc: "(resource $result [, int $fetch_flag])",
            ibase_fetch_object: "(resource $result_id [, int $fetch_flag])",
            ibase_fetch_row: "(resource $result_identifier [, int $fetch_flag])",
            ibase_field_info: "(resource $result, int $field_number)",
            ibase_free_event_handler: "(resource $event)",
            ibase_free_query: "(resource $query)",
            ibase_free_result: "(resource $result_identifier)",
            ibase_gen_id: "(string $generator [, int $increment [, resource $link_identifier]])",
            ibase_maintain_db: "(resource $service_handle, string $db, int $action [, int $argument])",
            ibase_modify_user: "(resource $service_handle, string $user_name, string $password [, string $first_name [, string $middle_name [, string $last_name]]])",
            ibase_name_result: "(resource $result, string $name)",
            ibase_num_fields: "(resource $result_id)",
            ibase_num_params: "(resource $query)",
            ibase_param_info: "(resource $query, int $param_number)",
            ibase_pconnect: "([string $database [, string $username [, string $password [, string $charset [, int $buffers [, int $dialect [, string $role [, int $sync]]]]]]]])",
            ibase_prepare: "(string $query)",
            ibase_query: "([resource $link_identifier], string $query [, int $bind_args])",
            ibase_restore: "(resource $service_handle, string $source_file, string $dest_db [, int $options [, bool $verbose]])",
            ibase_rollback: "([resource $link_or_trans_identifier])",
            ibase_rollback_ret: "([resource $link_or_trans_identifier])",
            ibase_server_info: "(resource $service_handle, int $action)",
            ibase_service_attach: "(string $host, string $dba_username, string $dba_password)",
            ibase_service_detach: "(resource $service_handle)",
            ibase_set_event_handler: "(callback $event_handler, string $event_name1 [, string $event_name2 [, string $...]])",
            ibase_timefmt: "(string $format [, int $columntype])",
            ibase_trans: "([int $trans_args [, resource $link_identifier]])",
            ibase_wait_event: "(string $event_name1 [, string $event_name2 [, string $...]])",
            iconv_get_encoding: "([string $type])",
            iconv_mime_decode_headers: "(string $encoded_headers [, int $mode [, string $charset]])",
            iconv_mime_decode: "(string $encoded_header [, int $mode [, string $charset]])",
            iconv_mime_encode: "(string $field_name, string $field_value [, array $preferences])",
            iconv_set_encoding: "(string $type, string $charset)",
            iconv: "(string $in_charset, string $out_charset, string $str)",
            iconv_strlen: "(string $str [, string $charset])",
            iconv_strpos: "(string $haystack, string $needle [, int $offset [, string $charset]])",
            iconv_strrpos: "(string $haystack, string $needle [, string $charset])",
            iconv_substr: "(string $str, int $offset)",
            id3_get_frame_long_name: "(string $frameId)",
            id3_get_frame_short_name: "(string $frameId)",
            id3_get_genre_id: "(string $genre)",
            id3_get_genre_list: "(void)",
            id3_get_genre_name: "(int $genre_id)",
            id3_get_tag: "(string $filename [, int $version])",
            id3_get_version: "(string $filename)",
            id3_remove_tag: "(string $filename [, int $version])",
            id3_set_tag: "(string $filename, array $tag [, int $version])",
            idate: "(string $format [, int $timestamp])",
            identify: "(array $parameter)",
            ifx_affected_rows: "(resource $result_id)",
            ifx_blobinfile_mode: "(int $mode)",
            ifx_byteasvarchar: "(int $mode)",
            ifx_close: "([resource $link_identifier])",
            ifx_connect: "([string $database [, string $userid [, string $password]]])",
            ifx_copy_blob: "(int $bid)",
            ifx_create_blob: "(int $type, int $mode, string $param)",
            ifx_create_char: "(string $param)",
            ifx_do: "(resource $result_id)",
            ifx_errormsg: "([int $errorcode])",
            ifx_error: "([resource $link_identifier])",
            ifx_fetch_row: "(resource $result_id [, mixed $position])",
            ifx_fieldproperties: "(resource $result_id)",
            ifx_fieldtypes: "(resource $result_id)",
            ifx_free_blob: "(int $bid)",
            ifx_free_char: "(int $bid)",
            ifx_free_result: "(resource $result_id)",
            ifx_get_blob: "(int $bid)",
            ifx_get_char: "(int $bid)",
            ifx_getsqlca: "(resource $result_id)",
            ifx_htmltbl_result: "(resource $result_id [, string $html_table_options])",
            ifx_nullformat: "(int $mode)",
            ifx_num_fields: "(resource $result_id)",
            ifx_num_rows: "(resource $result_id)",
            ifx_pconnect: "([string $database [, string $userid [, string $password]]])",
            ifx_prepare: "(string $query, resource $link_identifier [, int $cursor_def], mixed $blobidarray)",
            ifx_query: "(string $query, resource $link_identifier [, int $cursor_type [, mixed $blobidarray]])",
            ifx_textasvarchar: "(int $mode)",
            ifx_update_blob: "(int $bid, string $content)",
            ifx_update_char: "(int $bid, string $content)",
            ifxus_close_slob: "(int $bid)",
            ifxus_create_slob: "(int $mode)",
            ifxus_free_slob: "(int $bid)",
            ifxus_open_slob: "(int $bid, int $mode)",
            ifxus_read_slob: "(int $bid, int $nbytes)",
            ifxus_seek_slob: "(int $bid, int $mode, int $offset)",
            ifxus_tell_slob: "(int $bid)",
            ifxus_write_slob: "(int $bid, string $content)",
            ignore_user_abort: "([bool $setting])",
            iis_add_server: "(string $path, string $comment, string $server_ip, int $port, string $host_name, int $rights, int $start_server)",
            iis_get_dir_security: "(int $server_instance, string $virtual_path)",
            iis_get_script_map: "(int $server_instance, string $virtual_path, string $script_extension)",
            iis_get_server_by_comment: "(string $comment)",
            iis_get_server_by_path: "(string $path)",
            iis_get_server_rights: "(int $server_instance, string $virtual_path)",
            iis_get_service_state: "(string $service_id)",
            iis_remove_server: "(int $server_instance)",
            iis_set_app_settings: "(int $server_instance, string $virtual_path, string $application_scope)",
            iis_set_dir_security: "(int $server_instance, string $virtual_path, int $directory_flags)",
            iis_set_script_map: "(int $server_instance, string $virtual_path, string $script_extension, string $engine_path, int $allow_scripting)",
            iis_set_server_rights: "(int $server_instance, string $virtual_path, int $directory_flags)",
            iis_start_server: "(int $server_instance)",
            iis_start_service: "(string $service_id)",
            iis_stop_server: "(int $server_instance)",
            iis_stop_service: "(string $service_id)",
            image2wbmp: "(resource $image [, string $filename [, int $threshold]])",
            imagealphablending: "(resource $image, bool $blendmode)",
            imageantialias: "(resource $image, bool $on)",
            imagearc: "(resource $image, int $cx, int $cy, int $width, int $height, int $start, int $end, int $color)",
            imagechar: "(resource $image, int $font, int $x, int $y, string $c, int $color)",
            imagecharup: "(resource $image, int $font, int $x, int $y, string $c, int $color)",
            imagecolorallocatealpha: "(resource $image, int $red, int $green, int $blue, int $alpha)",
            imagecolorallocate: "(resource $image, int $red, int $green, int $blue)",
            imagecolorat: "(resource $image, int $x, int $y)",
            imagecolorclosestalpha: "(resource $image, int $red, int $green, int $blue, int $alpha)",
            imagecolorclosesthwb: "(resource $image, int $red, int $green, int $blue)",
            imagecolorclosest: "(resource $image, int $red, int $green, int $blue)",
            imagecolordeallocate: "(resource $image, int $color)",
            imagecolorexactalpha: "(resource $image, int $red, int $green, int $blue, int $alpha)",
            imagecolorexact: "(resource $image, int $red, int $green, int $blue)",
            imagecolormatch: "(resource $image1, resource $image2)",
            imagecolorresolvealpha: "(resource $image, int $red, int $green, int $blue, int $alpha)",
            imagecolorresolve: "(resource $image, int $red, int $green, int $blue)",
            imagecolorset: "(resource $image, int $index, int $red, int $green, int $blue)",
            imagecolorsforindex: "(resource $image, int $index)",
            imagecolorstotal: "(resource $image)",
            imagecolortransparent: "(resource $image [, int $color])",
            imageconvolution: "(resource $image, array $matrix, float $div, float $offset)",
            imagecopymergegray: "(resource $dst_im, resource $src_im, int $dst_x, int $dst_y, int $src_x, int $src_y, int $src_w, int $src_h, int $pct)",
            imagecopymerge: "(resource $dst_im, resource $src_im, int $dst_x, int $dst_y, int $src_x, int $src_y, int $src_w, int $src_h, int $pct)",
            imagecopyresampled: "(resource $dst_image, resource $src_image, int $dst_x, int $dst_y, int $src_x, int $src_y, int $dst_w, int $dst_h, int $src_w, int $src_h)",
            imagecopyresized: "(resource $dst_image, resource $src_image, int $dst_x, int $dst_y, int $src_x, int $src_y, int $dst_w, int $dst_h, int $src_w, int $src_h)",
            imagecopy: "(resource $dst_im, resource $src_im, int $dst_x, int $dst_y, int $src_x, int $src_y, int $src_w, int $src_h)",
            imagecreatefromgd2part: "(string $filename, int $srcX, int $srcY, int $width, int $height)",
            imagecreatefromgd2: "(string $filename)",
            imagecreatefromgd: "(string $filename)",
            imagecreatefromgif: "(string $filename)",
            imagecreatefromjpeg: "(string $filename)",
            imagecreatefrompng: "(string $filename)",
            imagecreatefromstring: "(string $data)",
            imagecreatefromwbmp: "(string $filename)",
            imagecreatefromxbm: "(string $filename)",
            imagecreatefromxpm: "(string $filename)",
            imagecreate: "(int $width, int $height)",
            imagecreatetruecolor: "(int $width, int $height)",
            imagedashedline: "(resource $image, int $x1, int $y1, int $x2, int $y2, int $color)",
            imagedestroy: "(resource $image)",
            imageellipse: "(resource $image, int $cx, int $cy, int $width, int $height, int $color)",
            imagefilledarc: "(resource $image, int $cx, int $cy, int $width, int $height, int $start, int $end, int $color, int $style)",
            imagefilledellipse: "(resource $image, int $cx, int $cy, int $width, int $height, int $color)",
            imagefilledpolygon: "(resource $image, array $points, int $num_points, int $color)",
            imagefilledrectangle: "(resource $image, int $x1, int $y1, int $x2, int $y2, int $color)",
            imagefill: "(resource $image, int $x, int $y, int $color)",
            imagefilltoborder: "(resource $image, int $x, int $y, int $border, int $color)",
            imagefilter: "(resource $image, int $filtertype [, int $arg1 [, int $arg2 [, int $arg3 [, int $arg4]]]])",
            imagefontheight: "(int $font)",
            imagefontwidth: "(int $font)",
            imageftbbox: "(float $size, float $angle, string $font_file, string $text [, array $extrainfo])",
            imagefttext: "(resource $image, float $size, float $angle, int $x, int $y, int $color, string $font_file, string $text [, array $extrainfo])",
            imagegammacorrect: "(resource $image, float $inputgamma, float $outputgamma)",
            imagegd2: "(resource $image [, string $filename [, int $chunk_size [, int $type]]])",
            imagegd: "(resource $image [, string $filename])",
            imagegif: "(resource $image [, string $filename])",
            imagegrabscreen: "(void)",
            imagegrabwindow: "(int $window [, int $client_area])",
            imageinterlace: "(resource $image [, int $interlace])",
            imageistruecolor: "(resource $image)",
            imagejpeg: "(resource $image [, string $filename [, int $quality]])",
            imagelayereffect: "(resource $image, int $effect)",
            imageline: "(resource $image, int $x1, int $y1, int $x2, int $y2, int $color)",
            imageloadfont: "(string $file)",
            imagepalettecopy: "(resource $destination, resource $source)",
            imagepng: "(resource $image [, string $filename [, int $quality [, int $filters]]])",
            imagepolygon: "(resource $image, array $points, int $num_points, int $color)",
            imagepsbbox: "(string $text, int $font, int $size)",
            imagepsencodefont: "(resource $font_index, string $encodingfile)",
            imagepsextendfont: "(int $font_index, float $extend)",
            imagepsfreefont: "(resource $fontindex)",
            imagepsloadfont: "(string $filename)",
            imagepsslantfont: "(resource $font_index, float $slant)",
            imagepstext: "(resource $image, string $text, resource $font, int $size, int $foreground, int $background, int $x, int $y [, int $space [, int $tightness [, float $angle [, int $antialias_steps]]]])",
            imagerectangle: "(resource $image, int $x1, int $y1, int $x2, int $y2, int $color)",
            imagerotate: "(resource $source_image, float $angle, int $bgd_color [, int $ignore_transparent])",
            imagesavealpha: "(resource $image, bool $saveflag)",
            imagesetbrush: "(resource $image, resource $brush)",
            imagesetpixel: "(resource $image, int $x, int $y, int $color)",
            imagesetstyle: "(resource $image, array $style)",
            imagesetthickness: "(resource $image, int $thickness)",
            imagesettile: "(resource $image, resource $tile)",
            imagestring: "(resource $image, int $font, int $x, int $y, string $string, int $color)",
            imagestringup: "(resource $image, int $font, int $x, int $y, string $string, int $color)",
            imagesx: "(resource $image)",
            imagesy: "(resource $image)",
            imagetruecolortopalette: "(resource $image, bool $dither, int $ncolors)",
            imagettfbbox: "(float $size, float $angle, string $fontfile, string $text)",
            imagettftext: "(resource $image, float $size, float $angle, int $x, int $y, int $color, string $fontfile, string $text)",
            imagetypes: "(void)",
            image_type_to_extension: "(int $imagetype [, bool $include_dot])",
            image_type_to_mime_type: "(int $imagetype)",
            imagewbmp: "(resource $image [, string $filename [, int $foreground]])",
            imagexbm: "(resource $image, string $filename [, int $foreground])",
            "Imagick::adaptiveBlurImage": "(float $radius, float $sigma [, int $channel])",
            "Imagick::adaptiveResizeImage": "(int $columns, int $rows [, bool $fit])",
            "Imagick::adaptiveSharpenImage": "(float $radius, float $sigma [, int $channel])",
            "Imagick::adaptiveThresholdImage": "(int $width, int $height, int $offset)",
            "Imagick::addImage": "(Imagick $source)",
            "Imagick::addNoiseImage": "(int $noise_type [, int $channel])",
            "Imagick::affineTransformImage": "(ImagickDraw $matrix)",
            "Imagick::annotateImage": "(ImagickDraw $draw_settings, float $x, float $y, float $angle, string $text)",
            "Imagick::appendImages": "(bool $stack)",
            "Imagick::averageImages": "(void)",
            "Imagick::blackThresholdImage": "(mixed $threshold)",
            "Imagick::blurImage": "(float $radius, float $sigma [, int $channel])",
            "Imagick::borderImage": "(mixed $bordercolor, int $width, int $height)",
            "Imagick::charcoalImage": "(float $radius, float $sigma)",
            "Imagick::chopImage": "(int $width, int $height, int $x, int $y)",
            "Imagick::clear": "(void)",
            "Imagick::clipImage": "(void)",
            "Imagick::clipPathImage": "(string $pathname, bool $inside)",
            "Imagick::clone": "(void)",
            "Imagick::clutImage": "(Imagick $lookup_table [, int $channel])",
            "Imagick::coalesceImages": "(void)",
            "Imagick::colorizeImage": "(mixed $colorize, mixed $opacity)",
            "Imagick::combineImages": "(int $channelType)",
            "Imagick::commentImage": "(string $comment)",
            "Imagick::compareImageChannels": "(Imagick $image, int $channelType, int $metricType)",
            "Imagick::compareImageLayers": "(int $method)",
            "Imagick::compareImages": "(Imagick $compare, int $metric)",
            "Imagick::compositeImage": "(Imagick $composite_object, int $composite, int $x, int $y [, int $channel])",
            "Imagick::__construct": "([mixed $files])",
            "Imagick::contrastImage": "(bool $sharpen)",
            "Imagick::contrastStretchImage": "(float $black_point, float $white_point [, int $channel])",
            "Imagick::convolveImage": "(array $kernel [, int $channel])",
            "Imagick::cropImage": "(int $width, int $height, int $x, int $y)",
            "Imagick::cropThumbnailImage": "(int $width, int $height)",
            "Imagick::current": "(void)",
            "Imagick::cycleColormapImage": "(int $displace)",
            "Imagick::deconstructImages": "(void)",
            "Imagick::despeckleImage": "(void)",
            "Imagick::destroy": "(void)",
            "Imagick::displayImages": "(string $servername)",
            "Imagick::displayImage": "(string $servername)",
            "Imagick::distortImage": "(int $method, array $arguments, bool $bestfit)",
            "ImagickDraw::affine": "(array $affine)",
            "ImagickDraw::annotation": "(float $x, float $y, string $text)",
            "ImagickDraw::arc": "(float $sx, float $sy, float $ex, float $ey, float $sd, float $ed)",
            "ImagickDraw::bezier": "(array $coordinates)",
            "ImagickDraw::circle": "(float $ox, float $oy, float $px, float $py)",
            "ImagickDraw::clear": "(void)",
            "ImagickDraw::clone": "(void)",
            "ImagickDraw::color": "(float $x, float $y, int $paintMethod)",
            "ImagickDraw::comment": "(string $comment)",
            "ImagickDraw::composite": "(int $compose, float $x, float $y, float $width, float $height, Imagick $compositeWand)",
            "ImagickDraw::__construct": "(void)",
            "ImagickDraw::destroy": "(void)",
            "ImagickDraw::ellipse": "(float $ox, float $oy, float $rx, float $ry, float $start, float $end)",
            "ImagickDraw::getClipPath": "(void)",
            "ImagickDraw::getClipRule": "(void)",
            "ImagickDraw::getClipUnits": "(void)",
            "ImagickDraw::getFillColor": "(void)",
            "ImagickDraw::getFillOpacity": "(void)",
            "ImagickDraw::getFillRule": "(void)",
            "ImagickDraw::getFontFamily": "(void)",
            "ImagickDraw::getFontSize": "(void)",
            "ImagickDraw::getFontStyle": "(void)",
            "ImagickDraw::getFont": "(void)",
            "ImagickDraw::getFontWeight": "(void)",
            "ImagickDraw::getGravity": "(void)",
            "ImagickDraw::getStrokeAntialias": "(void)",
            "ImagickDraw::getStrokeColor": "(ImagickPixel $stroke_color)",
            "ImagickDraw::getStrokeDashArray": "(void)",
            "ImagickDraw::getStrokeDashOffset": "(void)",
            "ImagickDraw::getStrokeLineCap": "(void)",
            "ImagickDraw::getStrokeLineJoin": "(void)",
            "ImagickDraw::getStrokeMiterLimit": "(void)",
            "ImagickDraw::getStrokeOpacity": "(void)",
            "ImagickDraw::getStrokeWidth": "(void)",
            "ImagickDraw::getTextAlignment": "(void)",
            "ImagickDraw::getTextAntialias": "(void)",
            "ImagickDraw::getTextDecoration": "(void)",
            "ImagickDraw::getTextEncoding": "(void)",
            "ImagickDraw::getTextUnderColor": "(void)",
            "ImagickDraw::getVectorGraphics": "(void)",
            "Imagick::drawImage": "(ImagickDraw $draw)",
            "ImagickDraw::line": "(float $sx, float $sy, float $ex, float $ey)",
            "ImagickDraw::matte": "(float $x, float $y, int $paintMethod)",
            "ImagickDraw::pathClose": "(void)",
            "ImagickDraw::pathCurveToAbsolute": "(float $x1, float $y1, float $x2, float $y2, float $x, float $y)",
            "ImagickDraw::pathCurveToQuadraticBezierAbsolute": "(float $x1, float $y1, float $x, float $y)",
            "ImagickDraw::pathCurveToQuadraticBezierRelative": "(float $x1, float $y1, float $x, float $y)",
            "ImagickDraw::pathCurveToQuadraticBezierSmoothAbsolute": "(float $x, float $y)",
            "ImagickDraw::pathCurveToQuadraticBezierSmoothRelative": "(float $x, float $y)",
            "ImagickDraw::pathCurveToRelative": "(float $x1, float $y1, float $x2, float $y2, float $x, float $y)",
            "ImagickDraw::pathCurveToSmoothAbsolute": "(float $x2, float $y2, float $x, float $y)",
            "ImagickDraw::pathCurveToSmoothRelative": "(float $x2, float $y2, float $x, float $y)",
            "ImagickDraw::pathEllipticArcAbsolute": "(float $rx, float $ry, float $x_axis_rotation, bool $large_arc_flag, bool $sweep_flag, float $x, float $y)",
            "ImagickDraw::pathEllipticArcRelative": "(float $rx, float $ry, float $x_axis_rotation, bool $large_arc_flag, bool $sweep_flag, float $x, float $y)",
            "ImagickDraw::pathFinish": "(void)",
            "ImagickDraw::pathLineToAbsolute": "(float $x, float $y)",
            "ImagickDraw::pathLineToHorizontalAbsolute": "(float $x)",
            "ImagickDraw::pathLineToHorizontalRelative": "(float $x)",
            "ImagickDraw::pathLineToRelative": "(float $x, float $y)",
            "ImagickDraw::pathLineToVerticalAbsolute": "(float $y)",
            "ImagickDraw::pathLineToVerticalRelative": "(float $y)",
            "ImagickDraw::pathMoveToAbsolute": "(float $x, float $y)",
            "ImagickDraw::pathMoveToRelative": "(float $x, float $y)",
            "ImagickDraw::pathStart": "(void)",
            "ImagickDraw::point": "(float $x, float $y)",
            "ImagickDraw::polygon": "(array $coordinates)",
            "ImagickDraw::polyline": "(array $coordinates)",
            "ImagickDraw::popClipPath": "(void)",
            "ImagickDraw::popDefs": "(void)",
            "ImagickDraw::popPattern": "(void)",
            "ImagickDraw::pop": "(void)",
            "ImagickDraw::pushClipPath": "(string $clip_mask_id)",
            "ImagickDraw::pushDefs": "(void)",
            "ImagickDraw::pushPattern": "(string $pattern_id, float $x, float $y, float $width, float $height)",
            "ImagickDraw::push": "(void)",
            "ImagickDraw::rectangle": "(float $x1, float $y1, float $x2, float $y2)",
            "ImagickDraw::render": "(void)",
            "ImagickDraw::rotate": "(float $degrees)",
            "ImagickDraw::roundRectangle": "(float $x1, float $y1, float $x2, float $y2, float $rx, float $ry)",
            "ImagickDraw::scale": "(float $x, float $y)",
            "ImagickDraw::setClipPath": "(string $clip_mask)",
            "ImagickDraw::setClipRule": "(int $fill_rule)",
            "ImagickDraw::setClipUnits": "(int $clip_units)",
            "ImagickDraw::setFillAlpha": "(float $opacity)",
            "ImagickDraw::setFillColor": "(ImagickPixel $fill_pixel)",
            "ImagickDraw::setFillOpacity": "(float $fillOpacity)",
            "ImagickDraw::setFillPatternURL": "(string $fill_url)",
            "ImagickDraw::setFillRule": "(int $fill_rule)",
            "ImagickDraw::setFontFamily": "(string $font_family)",
            "ImagickDraw::setFontSize": "(float $pointsize)",
            "ImagickDraw::setFontStretch": "(int $fontStretch)",
            "ImagickDraw::setFont": "(string $font_name)",
            "ImagickDraw::setFontStyle": "(int $style)",
            "ImagickDraw::setFontWeight": "(int $font_weight)",
            "ImagickDraw::setGravity": "(int $gravity)",
            "ImagickDraw::setStrokeAlpha": "(float $opacity)",
            "ImagickDraw::setStrokeAntialias": "(bool $stroke_antialias)",
            "ImagickDraw::setStrokeColor": "(ImagickPixel $stroke_pixel)",
            "ImagickDraw::setStrokeDashArray": "(array $dashArray)",
            "ImagickDraw::setStrokeDashOffset": "(float $dash_offset)",
            "ImagickDraw::setStrokeLineCap": "(int $linecap)",
            "ImagickDraw::setStrokeLineJoin": "(int $linejoin)",
            "ImagickDraw::setStrokeMiterLimit": "(int $miterlimit)",
            "ImagickDraw::setStrokeOpacity": "(float $stroke_opacity)",
            "ImagickDraw::setStrokePatternURL": "(string $stroke_url)",
            "ImagickDraw::setStrokeWidth": "(float $stroke_width)",
            "ImagickDraw::setTextAlignment": "(int $alignment)",
            "ImagickDraw::setTextAntialias": "(bool $antiAlias)",
            "ImagickDraw::setTextDecoration": "(int $decoration)",
            "ImagickDraw::setTextEncoding": "(string $encoding)",
            "ImagickDraw::setTextUnderColor": "(ImagickPixel $under_color)",
            "ImagickDraw::setVectorGraphics": "(string $xml)",
            "ImagickDraw::setViewbox": "(int $x1, int $y1, int $x2, int $y2)",
            "ImagickDraw::skewX": "(float $degrees)",
            "ImagickDraw::skewY": "(float $degrees)",
            "ImagickDraw::translate": "(float $x, float $y)",
            "Imagick::edgeImage": "(float $radius)",
            "Imagick::embossImage": "(float $radius, float $sigma)",
            "Imagick::enhanceImage": "(void)",
            "Imagick::equalizeImage": "(void)",
            "Imagick::evaluateImage": "(int $op, float $constant [, int $channel])",
            "Imagick::flattenImages": "(void)",
            "Imagick::flipImage": "(void)",
            "Imagick::flopImage": "(void)",
            "Imagick::frameImage": "(mixed $matte_color, int $width, int $height, int $inner_bevel, int $outer_bevel)",
            "Imagick::fxImage": "(string $expression [, int $channel])",
            "Imagick::gammaImage": "(float $gamma [, int $channel])",
            "Imagick::gaussianBlurImage": "(float $radius, float $sigma [, int $channel])",
            "Imagick::getCompressionQuality": "(void)",
            "Imagick::getCompression": "(void)",
            "Imagick::getCopyright": "(void)",
            "Imagick::getFilename": "(void)",
            "Imagick::getFormat": "(void)",
            "Imagick::getHomeURL": "(void)",
            "Imagick::getImageBackgroundColor": "(void)",
            "Imagick::getImageBlob": "(void)",
            "Imagick::getImageBluePrimary": "(float $x, float $y)",
            "Imagick::getImageBorderColor": "(void)",
            "Imagick::getImageChannelDepth": "(int $channelType)",
            "Imagick::getImageChannelDistortion": "(Imagick $reference, int $channel, int $metric)",
            "Imagick::getImageChannelExtrema": "(int $channel)",
            "Imagick::getImageChannelMean": "(int $channel)",
            "Imagick::getImageChannelStatistics": "(void)",
            "Imagick::getImageColormapColor": "(int $index)",
            "Imagick::getImageColorspace": "(void)",
            "Imagick::getImageColors": "(void)",
            "Imagick::getImageCompose": "(void)",
            "Imagick::getImageDelay": "(void)",
            "Imagick::getImageDepth": "(void)",
            "Imagick::getImageDispose": "(void)",
            "Imagick::getImageDistortion": "(MagickWand $reference, int $metric)",
            "Imagick::getImageExtrema": "(void)",
            "Imagick::getImageFilename": "(void)",
            "Imagick::getImageFormat": "(void)",
            "Imagick::getImageGamma": "(void)",
            "Imagick::getImageGeometry": "(void)",
            "Imagick::getImageGreenPrimary": "(void)",
            "Imagick::getImageHeight": "(void)",
            "Imagick::getImageHistogram": "(void)",
            "Imagick::getImageIndex": "(void)",
            "Imagick::getImageInterlaceScheme": "(void)",
            "Imagick::getImageInterpolateMethod": "(void)",
            "Imagick::getImageIterations": "(void)",
            "Imagick::getImageLength": "(void)",
            "Imagick::getImageMagickLicense": "(void)",
            "Imagick::getImageMatteColor": "(void)",
            "Imagick::getImageMatte": "(void)",
            "Imagick::getImageOrientation": "(void)",
            "Imagick::getImagePage": "(void)",
            "Imagick::getImagePixelColor": "(int $x, int $y)",
            "Imagick::getImageProfiles": "([string $pattern [, bool $only_names]])",
            "Imagick::getImageProfile": "(string $name)",
            "Imagick::getImageProperties": "([string $pattern [, bool $only_names]])",
            "Imagick::getImageProperty": "(string $name)",
            "Imagick::getImageRedPrimary": "(void)",
            "Imagick::getImageRegion": "(int $width, int $height, int $x, int $y)",
            "Imagick::getImageRenderingIntent": "(void)",
            "Imagick::getImageResolution": "(void)",
            "Imagick::getImageScene": "(void)",
            "Imagick::getImageSignature": "(void)",
            "Imagick::getImageSize": "(void)",
            "Imagick::getImageTicksPerSecond": "(void)",
            "Imagick::getImageTotalInkDensity": "(void)",
            "Imagick::getImageType": "(void)",
            "Imagick::getImageUnits": "(void)",
            "Imagick::getImageVirtualPixelMethod": "(void)",
            "Imagick::getImage": "(void)",
            "Imagick::getImageWhitePoint": "(void)",
            "Imagick::getImageWidth": "(void)",
            "Imagick::getInterlaceScheme": "(void)",
            "Imagick::getIteratorIndex": "(void)",
            "Imagick::getNumberImages": "(void)",
            "Imagick::getOption": "(string $key)",
            "Imagick::getPackageName": "(void)",
            "Imagick::getPage": "(void)",
            "Imagick::getPixelIterator": "(void)",
            "Imagick::getPixelRegionIterator": "(int $x, int $y, int $columns, int $rows)",
            "Imagick::getQuantumDepth": "(void)",
            "Imagick::getQuantumRange": "(void)",
            "Imagick::getReleaseDate": "(void)",
            "Imagick::getResource": "(int $type)",
            "Imagick::getResourceLimit": "(int $type)",
            "Imagick::getSamplingFactors": "(void)",
            "Imagick::getSizeOffset": "(void)",
            "Imagick::getSize": "(void)",
            "Imagick::getVersion": "(void)",
            "Imagick::hasNextImage": "(void)",
            "Imagick::hasPreviousImage": "(void)",
            "Imagick::identifyImage": "([bool $appendRawOutput])",
            "Imagick::implodeImage": "(float $radius)",
            "Imagick::labelImage": "(string $label)",
            "Imagick::levelImage": "(float $blackPoint, float $gamma, float $whitePoint [, int $channel])",
            "Imagick::linearStretchImage": "(float $blackPoint, float $whitePoint)",
            "Imagick::magnifyImage": "(void)",
            "Imagick::mapImage": "(Imagick $map, bool $dither)",
            "Imagick::matteFloodfillImage": "(float $alpha, float $fuzz, mixed $bordercolor, int $x, int $y)",
            "Imagick::medianFilterImage": "(float $radius)",
            "Imagick::minifyImage": "(void)",
            "Imagick::modulateImage": "(float $brightness, float $saturation, float $hue)",
            "Imagick::montageImage": "(ImagickDraw $draw, string $tile_geometry, string $thumbnail_geometry, int $mode, string $frame)",
            "Imagick::morphImages": "(int $number_frames)",
            "Imagick::mosaicImages": "(void)",
            "Imagick::motionBlurImage": "(float $radius, float $sigma, float $angle)",
            "Imagick::negateImage": "(bool $gray [, int $channel])",
            "Imagick::newImage": "(int $cols, int $rows, mixed $background [, string $format])",
            "Imagick::newPseudoImage": "(int $columns, int $rows, string $pseudoString)",
            "Imagick::nextImage": "(void)",
            "Imagick::normalizeImage": "([int $channel])",
            "Imagick::oilPaintImage": "(float $radius)",
            "Imagick::optimizeImageLayers": "(void)",
            "Imagick::paintFloodfillImage": "(mixed $fill, float $fuzz, mixed $bordercolor, int $x, int $y)",
            "Imagick::paintOpaqueImage": "(mixed $target, mixed $fill, float $fuzz [, int $channel])",
            "Imagick::paintTransparentImage": "(mixed $target, float $alpha, float $fuzz)",
            "Imagick::pingImageBlob": "(string $image)",
            "Imagick::pingImageFile": "(resource $filehandle [, string $fileName])",
            "Imagick::pingImage": "(string $filename)",
            "ImagickPixel::clear": "(void)",
            "ImagickPixel::__construct": "([string $color])",
            "ImagickPixel::destroy": "(void)",
            "ImagickPixel::getColorAsString": "(void)",
            "ImagickPixel::getColor": "([bool $normalized])",
            "ImagickPixel::getColorCount": "(void)",
            "ImagickPixel::getColorValue": "(int $color)",
            "ImagickPixel::getHSL": "(void)",
            "ImagickPixel::isSimilar": "(ImagickPixel $color, float $fuzz)",
            "ImagickPixelIterator::clear": "(void)",
            "ImagickPixelIterator::__construct": "(Imagick $wand)",
            "ImagickPixelIterator::destroy": "(void)",
            "ImagickPixelIterator::getCurrentIteratorRow": "(void)",
            "ImagickPixelIterator::getIteratorRow": "(void)",
            "ImagickPixelIterator::getNextIteratorRow": "(void)",
            "ImagickPixelIterator::getPreviousIteratorRow": "(void)",
            "ImagickPixelIterator::newPixelIterator": "(Imagick $wand)",
            "ImagickPixelIterator::newPixelRegionIterator": "(Imagick $wand, int $x, int $y, int $columns, int $rows)",
            "ImagickPixelIterator::resetIterator": "(void)",
            "ImagickPixelIterator::setIteratorFirstRow": "(void)",
            "ImagickPixelIterator::setIteratorLastRow": "(void)",
            "ImagickPixelIterator::setIteratorRow": "(int $row)",
            "ImagickPixelIterator::syncIterator": "(void)",
            "ImagickPixel::setColor": "(string $color)",
            "ImagickPixel::setColorValue": "(int $color, float $value)",
            "ImagickPixel::setHSL": "(float $hue, float $saturation, float $luminosity)",
            "Imagick::polaroidImage": "(ImagickDraw $properties, float $angle)",
            "Imagick::posterizeImage": "(int $levels, bool $dither)",
            "Imagick::previewImages": "(int $preview)",
            "Imagick::previousImage": "(void)",
            "Imagick::profileImage": "(string $name, string $profile)",
            "Imagick::quantizeImage": "(int $numberColors, int $colorspace, int $treedepth, bool $dither, bool $measureError)",
            "Imagick::quantizeImages": "(int $numberColors, int $colorspace, int $treedepth, bool $dither, bool $measureError)",
            "Imagick::queryFontMetrics": "(ImagickDraw $properties, string $text [, bool $multiline])",
            "Imagick::queryFonts": "([string $pattern])",
            "Imagick::queryFormats": "([string $pattern])",
            "Imagick::radialBlurImage": "(float $angle [, int $channel])",
            "Imagick::raiseImage": "(int $width, int $height, int $x, int $y, bool $raise)",
            "Imagick::randomThresholdImage": "(float $low, float $high [, int $channel])",
            "Imagick::readImageBlob": "(string $image [, string $filename])",
            "Imagick::readImageFile": "(resource $filehandle [, string $fileName])",
            "Imagick::readImage": "(string $filename)",
            "Imagick::reduceNoiseImage": "(float $radius)",
            "Imagick::removeImageProfile": "(string $name)",
            "Imagick::removeImage": "(void)",
            "Imagick::render": "(void)",
            "Imagick::resampleImage": "(float $x_resolution, float $y_resolution, int $filter, float $blur)",
            "Imagick::resizeImage": "(int $columns, int $rows, int $filter, float $blur [, bool $fit])",
            "Imagick::rollImage": "(int $x, int $y)",
            "Imagick::rotateImage": "(mixed $background, float $degrees)",
            "Imagick::roundCorners": "(float $x_rounding, float $y_rounding [, float $stroke_width [, float $displace [, float $size_correction]]])",
            "Imagick::sampleImage": "(int $columns, int $rows)",
            "Imagick::scaleImage": "(int $cols, int $rows [, bool $fit])",
            "Imagick::separateImageChannel": "(int $channel)",
            "Imagick::sepiaToneImage": "(float $threshold)",
            "Imagick::setBackgroundColor": "(mixed $background)",
            "Imagick::setCompression": "(int $compression)",
            "Imagick::setCompressionQuality": "(int $quality)",
            "Imagick::setFilename": "(string $filename)",
            "Imagick::setFirstIterator": "(void)",
            "Imagick::setFormat": "(string $format)",
            "Imagick::setImageBackgroundColor": "(mixed $background)",
            "Imagick::setImageBias": "(float $bias)",
            "Imagick::setImageBluePrimary": "(float $x, float $y)",
            "Imagick::setImageBorderColor": "(mixed $border)",
            "Imagick::setImageChannelDepth": "(int $channel, int $depth)",
            "Imagick::setImageColormapColor": "(int $index, ImagickPixel $color)",
            "Imagick::setImageColorspace": "(int $colorspace)",
            "Imagick::setImageCompose": "(int $compose)",
            "Imagick::setImageCompression": "(int $compression)",
            "Imagick::setImageDelay": "(int $delay)",
            "Imagick::setImageDepth": "(int $depth)",
            "Imagick::setImageDispose": "(int $dispose)",
            "Imagick::setImageExtent": "(int $columns, int $rows)",
            "Imagick::setImageFilename": "(string $filename)",
            "Imagick::setImageFormat": "(string $format)",
            "Imagick::setImageGamma": "(float $gamma)",
            "Imagick::setImageGreenPrimary": "(float $x, float $y)",
            "Imagick::setImage": "(Imagick $replace)",
            "Imagick::setImageIndex": "(int $index)",
            "Imagick::setImageInterlaceScheme": "(int $interlace_scheme)",
            "Imagick::setImageInterpolateMethod": "(int $method)",
            "Imagick::setImageIterations": "(int $iterations)",
            "Imagick::setImageMatte": "(bool $matte)",
            "Imagick::setImageMatteColor": "(mixed $matte)",
            "Imagick::setImageOpacity": "(float $opacity)",
            "Imagick::setImageOrientation": "(int $orientation)",
            "Imagick::setImagePage": "(int $width, int $height, int $x, int $y)",
            "Imagick::setImageProfile": "(string $name, string $profile)",
            "Imagick::setImageProperty": "(string $name, string $value)",
            "Imagick::setImageRedPrimary": "(float $x, float $y)",
            "Imagick::setImageRenderingIntent": "(int $rendering_intent)",
            "Imagick::setImageResolution": "(float $x_resolution, float $y_resolution)",
            "Imagick::setImageScene": "(int $scene)",
            "Imagick::setImageTicksPerSecond": "(int $ticks_per-second)",
            "Imagick::setImageType": "(int $image_type)",
            "Imagick::setImageUnits": "(int $units)",
            "Imagick::setImageVirtualPixelMethod": "(int $method)",
            "Imagick::setImageWhitePoint": "(float $x, float $y)",
            "Imagick::setInterlaceScheme": "(int $interlace_scheme)",
            "Imagick::setIteratorIndex": "(int $index)",
            "Imagick::setLastIterator": "(void)",
            "Imagick::setOption": "(string $key, string $value)",
            "Imagick::setPage": "(int $width, int $height, int $x, int $y)",
            "Imagick::setResolution": "(float $x_resolution, float $y_resolution)",
            "Imagick::setResourceLimit": "(int $type, int $limit)",
            "Imagick::setSamplingFactors": "(array $factors)",
            "Imagick::setSize": "(int $columns, int $rows)",
            "Imagick::setSizeOffset": "(int $columns, int $rows, int $offset)",
            "Imagick::setType": "(int $image_type)",
            "Imagick::shadeImage": "(bool $gray, float $azimuth, float $elevation)",
            "Imagick::shadowImage": "(float $opacity, float $sigma, int $x, int $y)",
            "Imagick::sharpenImage": "(float $radius, float $sigma [, int $channel])",
            "Imagick::shaveImage": "(int $columns, int $rows)",
            "Imagick::shearImage": "(mixed $background, float $x_shear, float $y_shear)",
            "Imagick::sigmoidalContrastImage": "(bool $sharpen, float $alpha, float $beta [, int $channel])",
            "Imagick::sketchImage": "(float $radius, float $sigma, float $angle)",
            "Imagick::solarizeImage": "(int $threshold)",
            "Imagick::spliceImage": "(int $width, int $height, int $x, int $y)",
            "Imagick::spreadImage": "(float $radius)",
            "Imagick::steganoImage": "(Imagick $watermark_wand, int $offset)",
            "Imagick::stereoImage": "(Imagick $offset_wand)",
            "Imagick::stripImage": "(void)",
            "Imagick::swirlImage": "(float $degrees)",
            "Imagick::textureImage": "(Imagick $texture_wand)",
            "Imagick::thresholdImage": "(float $threshold [, int $channel])",
            "Imagick::thumbnailImage": "(int $columns, int $rows [, bool $fit])",
            "Imagick::tintImage": "(mixed $tint, mixed $opacity)",
            "Imagick::transformImage": "(string $crop, string $geometry)",
            "Imagick::transverseImage": "(void)",
            "Imagick::trimImage": "(float $fuzz)",
            "Imagick::uniqueImageColors": "(void)",
            "Imagick::unsharpMaskImage": "(float $radius, float $sigma, float $amount, float $threshold [, int $channel])",
            "Imagick::valid": "(void)",
            "Imagick::vignetteImage": "(float $blackPoint, float $whitePoint, int $x, int $y)",
            "Imagick::waveImage": "(float $amplitude, float $length)",
            "Imagick::whiteThresholdImage": "(mixed $threshold)",
            "Imagick::writeImages": "(string $filename, bool $adjoin)",
            "Imagick::writeImage": "([string $filename])",
            imap_8bit: "(string $string)",
            imap_alerts: "(void)",
            imap_append: "(resource $imap_stream, string $mailbox, string $message [, string $options])",
            imap_base64: "(string $text)",
            imap_binary: "(string $string)",
            imap_body: "(resource $imap_stream, int $msg_number [, int $options])",
            imap_bodystruct: "(resource $imap_stream, int $msg_number, string $section)",
            imap_check: "(resource $imap_stream)",
            imap_clearflag_full: "(resource $imap_stream, string $sequence, string $flag [, string $options])",
            imap_close: "(resource $imap_stream [, int $flag])",
            imap_createmailbox: "(resource $imap_stream, string $mailbox)",
            imap_deletemailbox: "(resource $imap_stream, string $mailbox)",
            imap_delete: "(resource $imap_stream, int $msg_number [, int $options])",
            imap_errors: "(void)",
            imap_expunge: "(resource $imap_stream)",
            imap_fetchbody: "(resource $imap_stream, int $msg_number, string $part_number [, int $options])",
            imap_fetchheader: "(resource $imap_stream, int $msg_number [, int $options])",
            imap_fetch_overview: "(resource $imap_stream, string $sequence [, int $options])",
            imap_fetchstructure: "(resource $imap_stream, int $msg_number [, int $options])",
            imap_getacl: "(resource $imap_stream, string $mailbox)",
            imap_getmailboxes: "(resource $imap_stream, string $ref, string $pattern)",
            imap_get_quota: "(resource $imap_stream, string $quota_root)",
            imap_get_quotaroot: "(resource $imap_stream, string $quota_root)",
            imap_getsubscribed: "(resource $imap_stream, string $ref, string $pattern)",
            imap_headerinfo: "(resource $imap_stream, int $msg_number [, int $fromlength [, int $subjectlength [, string $defaulthost]]])",
            imap_headers: "(resource $imap_stream)",
            imap_last_error: "(void)",
            imap_list: "(resource $imap_stream, string $ref, string $pattern)",
            imap_listscan: "(resource $imap_stream, string $ref, string $pattern, string $content)",
            imap_lsub: "(resource $imap_stream, string $ref, string $pattern)",
            imap_mailboxmsginfo: "(resource $imap_stream)",
            imap_mail_compose: "(array $envelope, array $body)",
            imap_mail_copy: "(resource $imap_stream, string $msglist, string $mailbox [, int $options])",
            imap_mail_move: "(resource $imap_stream, string $msglist, string $mailbox [, int $options])",
            imap_mail: "(string $to, string $subject, string $message [, string $additional_headers [, string $cc [, string $bcc [, string $rpath]]]])",
            imap_mime_header_decode: "(string $text)",
            imap_msgno: "(resource $imap_stream, int $uid)",
            imap_num_msg: "(resource $imap_stream)",
            imap_num_recent: "(resource $imap_stream)",
            imap_open: "(string $mailbox, string $username, string $password [, int $options [, int $n_retries]])",
            imap_ping: "(resource $imap_stream)",
            imap_qprint: "(string $string)",
            imap_renamemailbox: "(resource $imap_stream, string $old_mbox, string $new_mbox)",
            imap_reopen: "(resource $imap_stream, string $mailbox [, int $options [, int $n_retries]])",
            imap_rfc822_parse_adrlist: "(string $address, string $default_host)",
            imap_rfc822_parse_headers: "(string $headers [, string $defaulthost])",
            imap_rfc822_write_address: "(string $mailbox, string $host, string $personal)",
            imap_savebody: "(resource $imap_stream, mixed $file, int $msg_number [, string $part_number [, int $options]])",
            imap_search: "(resource $imap_stream, string $criteria [, int $options [, string $charset]])",
            imap_setacl: "(resource $imap_stream, string $mailbox, string $id, string $rights)",
            imap_setflag_full: "(resource $imap_stream, string $sequence, string $flag [, int $options])",
            imap_set_quota: "(resource $imap_stream, string $quota_root, int $quota_limit)",
            imap_sort: "(resource $imap_stream, int $criteria, int $reverse [, int $options [, string $search_criteria [, string $charset]]])",
            imap_status: "(resource $imap_stream, string $mailbox, int $options)",
            imap_subscribe: "(resource $imap_stream, string $mailbox)",
            imap_thread: "(resource $imap_stream [, int $options])",
            imap_timeout: "(int $timeout_type [, int $timeout])",
            imap_uid: "(resource $imap_stream, int $msg_number)",
            imap_undelete: "(resource $imap_stream, int $msg_number [, int $flags])",
            imap_unsubscribe: "(string $imap_stream, string $mailbox)",
            imap_utf7_decode: "(string $text)",
            imap_utf7_encode: "(string $data)",
            imap_utf8: "(string $mime_encoded_text)",
            implode: "(string $glue, array $pieces)",
            importChar: "(string $libswf, string $name)",
            importFont: "(string $libswf, string $name)",
            import_request_variables: "(string $types [, string $prefix])",
            "import": "(string $filename)",
            in_array: "(mixed $needle, array $haystack [, bool $strict])",
            inclued_get_data: "(void)",
            inet_ntop: "(string $in_addr)",
            inet_pton: "(string $address)",
            info: "(array $parameter)",
            ingres_autocommit: "([resource $link])",
            ingres_close: "([resource $link])",
            ingres_commit: "([resource $link])",
            ingres_connect: "([string $database [, string $username [, string $password [, array $options]]]])",
            ingres_cursor: "([resource $link])",
            ingres_errno: "([resource $link])",
            ingres_error: "([resource $link])",
            ingres_errsqlstate: "([resource $link])",
            ingres_fetch_array: "([int $result_type [, resource $link]])",
            ingres_fetch_object: "([int $result_type [, resource $link]])",
            ingres_fetch_row: "([resource $link])",
            ingres_field_length: "(int $index [, resource $link])",
            ingres_field_name: "(int $index [, resource $link])",
            ingres_field_nullable: "(int $index [, resource $link])",
            ingres_field_precision: "(int $index [, resource $link])",
            ingres_field_scale: "(int $index [, resource $link])",
            ingres_field_type: "(int $index [, resource $link])",
            ingres_num_fields: "([resource $link])",
            ingres_num_rows: "([resource $link])",
            ingres_pconnect: "([string $database [, string $username [, string $password]]])",
            ingres_query: "(string $query [, resource $link])",
            ingres_rollback: "([resource $link])",
            ini_get_all: "([string $extension [, bool $details]])",
            ini_get: "(string $varname)",
            ini_restore: "(string $varname)",
            ini_set: "(string $varname, string $newvalue)",
            insertanchor: "(array $parameter)",
            insert: "(array $parameter)|(HW_API_Attribute $attribute)",
            insertcollection: "(array $parameter)",
            insertdocument: "(array $parameter)",
            interface_exists: "(string $interface_name [, bool $autoload])",
            internal_subset: "(void)",
            intl_error_name: "(integer $error_code)",
            intl_get_error_code: "(void)",
            intl_get_error_message: "(void)",
            intl_is_failure: "(integer $error_code)",
            intval: "(mixed $var [, int $base])",
            ip2long: "(string $ip_address)",
            iptcembed: "(string $iptcdata, string $jpeg_file_name [, int $spool])",
            iptcparse: "(string $iptcblock)",
            is_a: "(object $object, string $class_name)",
            is_array: "(mixed $var)",
            is_binary: "(mixed $var)",
            is_bool: "(mixed $var)",
            is_buffer: "(mixed $var)",
            is_callable: "(mixed $var [, bool $syntax_only [, string& $callable_name]])",
            isConnected: "(void)",
            is_dir: "(string $filename)",
            is_executable: "(string $filename)",
            is_file: "(string $filename)",
            is_finite: "(float $val)",
            is_float: "(mixed $var)",
            is_infinite: "(float $val)",
            is_int: "(mixed $var)",
            is_link: "(string $filename)",
            is_nan: "(float $val)",
            is_null: "(mixed $var)",
            is_numeric: "(mixed $var)",
            is_object: "(mixed $var)",
            is_readable: "(string $filename)",
            is_resource: "(mixed $var)",
            is_scalar: "(mixed $var)",
            isset: "(mixed $var [, mixed $var [,  $...]])",
            is_soap_fault: "(mixed $obj)",
            is_string: "(mixed $var)",
            is_subclass_of: "(mixed $object, string $class_name)",
            is_unicode: "(mixed $var)",
            is_uploaded_file: "(string $filename)",
            is_writable: "(string $filename)",
            iterator_count: "(IteratorAggregate $iterator)",
            iterator_to_array: "(IteratorAggregate $iterator [, bool $use_keys])",
            java_last_exception_clear: "(void)",
            java_last_exception_get: "(void)",
            jddayofweek: "(int $julianday [, int $mode])",
            jdmonthname: "(int $julianday, int $mode)",
            jdtofrench: "(int $juliandaycount)",
            jdtogregorian: "(int $julianday)",
            jdtojewish: "(int $juliandaycount [, bool $hebrew [, int $fl]])",
            jdtojulian: "(int $julianday)",
            jdtounix: "(int $jday)",
            jewishtojd: "(int $month, int $day, int $year)",
            jpeg2wbmp: "(string $jpegname, string $wbmpname, int $dest_height, int $dest_width, int $threshold)",
            json_decode: "(string $json [, bool $assoc])",
            json_encode: "(mixed $value)",
            juliantojd: "(int $month, int $day, int $year)",
            kadm5_chpass_principal: "(resource $handle, string $principal, string $password)",
            kadm5_create_principal: "(resource $handle, string $principal [, string $password [, array $options]])",
            kadm5_delete_principal: "(resource $handle, string $principal)",
            kadm5_destroy: "(resource $handle)",
            kadm5_flush: "(resource $handle)",
            kadm5_get_policies: "(resource $handle)",
            kadm5_get_principal: "(resource $handle, string $principal)",
            kadm5_get_principals: "(resource $handle)",
            kadm5_init_with_password: "(string $admin_server, string $realm, string $principal, string $password)",
            kadm5_modify_principal: "(resource $handle, string $principal, array $options)",
            key: "(array& $array)",
            krsort: "(array& $array [, int $sort_flags])",
            ksort: "(array& $array [, int $sort_flags])",
            labelFrame: "(string $label)",
            langdepvalue: "(string $language)",
            lcfirst: "(string $str)",
            lcg_value: "(void)",
            lchgrp: "(string $filename, mixed $group)",
            lchown: "(string $filename, mixed $user)",
            ldap_8859_to_t61: "(string $value)",
            ldap_add: "(resource $link_identifier, string $dn, array $entry)",
            ldap_bind: "(resource $link_identifier [, string $bind_rdn [, string $bind_password]])",
            ldap_compare: "(resource $link_identifier, string $dn, string $attribute, string $value)",
            ldap_connect: "([string $hostname [, int $port]])",
            ldap_count_entries: "(resource $link_identifier, resource $result_identifier)",
            ldap_delete: "(resource $link_identifier, string $dn)",
            ldap_dn2ufn: "(string $dn)",
            ldap_err2str: "(int $errno)",
            ldap_errno: "(resource $link_identifier)",
            ldap_error: "(resource $link_identifier)",
            ldap_explode_dn: "(string $dn, int $with_attrib)",
            ldap_first_attribute: "(resource $link_identifier, resource $result_entry_identifier)",
            ldap_first_entry: "(resource $link_identifier, resource $result_identifier)",
            ldap_first_reference: "(resource $link, resource $result)",
            ldap_free_result: "(resource $result_identifier)",
            ldap_get_attributes: "(resource $link_identifier, resource $result_entry_identifier)",
            ldap_get_dn: "(resource $link_identifier, resource $result_entry_identifier)",
            ldap_get_entries: "(resource $link_identifier, resource $result_identifier)",
            ldap_get_option: "(resource $link_identifier, int $option, mixed& $retval)",
            ldap_get_values_len: "(resource $link_identifier, resource $result_entry_identifier, string $attribute)",
            ldap_get_values: "(resource $link_identifier, resource $result_entry_identifier, string $attribute)",
            ldap_list: "(resource $link_identifier, string $base_dn, string $filter [, array $attributes [, int $attrsonly [, int $sizelimit [, int $timelimit [, int $deref]]]]])",
            ldap_mod_add: "(resource $link_identifier, string $dn, array $entry)",
            ldap_mod_del: "(resource $link_identifier, string $dn, array $entry)",
            ldap_modify: "(resource $link_identifier, string $dn, array $entry)",
            ldap_mod_replace: "(resource $link_identifier, string $dn, array $entry)",
            ldap_next_attribute: "(resource $link_identifier, resource $result_entry_identifier)",
            ldap_next_entry: "(resource $link_identifier, resource $result_entry_identifier)",
            ldap_next_reference: "(resource $link, resource $entry)",
            ldap_parse_reference: "(resource $link, resource $entry, array& $referrals)",
            ldap_parse_result: "(resource $link, resource $result, int& $errcode [, string& $matcheddn [, string& $errmsg [, array& $referrals]]])",
            ldap_read: "(resource $link_identifier, string $base_dn, string $filter [, array $attributes [, int $attrsonly [, int $sizelimit [, int $timelimit [, int $deref]]]]])",
            ldap_rename: "(resource $link_identifier, string $dn, string $newrdn, string $newparent, bool $deleteoldrdn)",
            ldap_sasl_bind: "(resource $link [, string $binddn [, string $password [, string $sasl_mech [, string $sasl_realm [, string $sasl_authz_id [, string $props]]]]]])",
            ldap_search: "(resource $link_identifier, string $base_dn, string $filter [, array $attributes [, int $attrsonly [, int $sizelimit [, int $timelimit [, int $deref]]]]])",
            ldap_set_option: "(resource $link_identifier, int $option, mixed $newval)",
            ldap_set_rebind_proc: "(resource $link, callback $callback)",
            ldap_sort: "(resource $link, resource $result, string $sortfilter)",
            ldap_start_tls: "(resource $link)",
            ldap_t61_to_8859: "(string $value)",
            ldap_unbind: "(resource $link_identifier)",
            levenshtein: "(string $str1, string $str2)",
            libxml_clear_errors: "(void)",
            libxml_get_errors: "(void)",
            libxml_get_last_error: "(void)",
            libxml_set_streams_context: "(resource $streams_context)",
            libxml_use_internal_errors: "([bool $use_errors])",
            linkinfo: "(string $path)",
            link: "(string $target, string $link)",
            list: "(mixed $varname [, mixed $...])",
            load: "(void)",
            localeconv: "(void)",
            localtime: "([int $timestamp [, bool $is_associative]])",
            lock: "(array $parameter)",
            log10: "(float $arg)",
            log1p: "(float $number)",
            log: "(float $arg [, float $base])",
            long2ip: "(int $proper_address)",
            loopCount: "(int $point)",
            loopInPoint: "(int $point)",
            loopOutPoint: "(int $point)",
            lstat: "(string $filename)",
            ltrim: "(string $str [, string $charlist])",
            lzf_compress: "(string $data)",
            lzf_decompress: "(string $data)",
            lzf_optimized_for: "(void)",
            mailparse_determine_best_xfer_encoding: "(resource $fp)",
            mailparse_msg_create: "(void)",
            mailparse_msg_extract_part_file: "(resource $mimemail, mixed $filename [, callback $callbackfunc])",
            mailparse_msg_extract_part: "(resource $mimemail, string $msgbody [, callback $callbackfunc])",
            mailparse_msg_extract_whole_part_file: "(resource $mimemail, string $filename [, callback $callbackfunc])",
            mailparse_msg_free: "(resource $mimemail)",
            mailparse_msg_get_part_data: "(resource $mimemail)",
            mailparse_msg_get_part: "(resource $mimemail, string $mimesection)",
            mailparse_msg_get_structure: "(resource $mimemail)",
            mailparse_msg_parse_file: "(string $filename)",
            mailparse_msg_parse: "(resource $mimemail, string $data)",
            mailparse_rfc822_parse_addresses: "(string $addresses)",
            mailparse_stream_encode: "(resource $sourcefp, resource $destfp, string $encoding)",
            mailparse_uudecode_all: "(resource $fp)",
            mail: "(string $to, string $subject, string $message [, string $additional_headers [, string $additional_parameters]])",
            max: "(array $values)",
            maxdb_affected_rows: "(resource $link)",
            maxdb_autocommit: "(resource $link, bool $mode)",
            maxdb_change_user: "(resource $link, string $user, string $password, string $database)",
            maxdb_character_set_name: "(resource $link)",
            maxdb_close: "(resource $link)",
            maxdb_commit: "(resource $link)",
            maxdb_connect_errno: "(void)",
            maxdb_connect_error: "(void)",
            maxdb_connect: "([string $host [, string $username [, string $passwd [, string $dbname [, int $port [, string $socket]]]]]])",
            maxdb_data_seek: "(resource $result, int $offset)",
            maxdb_debug: "(string $debug)",
            maxdb_disable_reads_from_master: "(resource $link)",
            maxdb_disable_rpl_parse: "(resource $link)",
            maxdb_dump_debug_info: "(resource $link)",
            maxdb_embedded_connect: "([string $dbname])",
            maxdb_enable_reads_from_master: "(resource $link)",
            maxdb_enable_rpl_parse: "(resource $link)",
            maxdb_errno: "(resource $link)",
            maxdb_error: "(resource $link)",
            maxdb_fetch_array: "(resource $result [, int $resulttype])",
            maxdb_fetch_assoc: "(resource $result)",
            maxdb_fetch_field_direct: "(resource $result, int $fieldnr)",
            maxdb_fetch_field: "(resource $result)",
            maxdb_fetch_fields: "(resource $result)",
            maxdb_fetch_lengths: "(resource $result)",
            maxdb_fetch_object: "(object $result)",
            maxdb_fetch_row: "(resource $result)",
            maxdb_field_count: "(resource $link)",
            maxdb_field_seek: "(resource $result, int $fieldnr)",
            maxdb_field_tell: "(resource $result)",
            maxdb_free_result: "(resource $result)",
            maxdb_get_client_info: "(void)",
            maxdb_get_client_version: "(void)",
            maxdb_get_host_info: "(resource $link)",
            maxdb_get_proto_info: "(resource $link)",
            maxdb_get_server_info: "(resource $link)",
            maxdb_get_server_version: "(resource $link)",
            maxdb_info: "(resource $link)",
            maxdb_init: "(void)",
            maxdb_insert_id: "(resource $link)",
            maxdb_kill: "(resource $link, int $processid)",
            maxdb_master_query: "(resource $link, string $query)",
            maxdb_more_results: "(resource $link)",
            maxdb_multi_query: "(resource $link, string $query)",
            maxdb_next_result: "(resource $link)",
            maxdb_num_fields: "(resource $result)",
            maxdb_num_rows: "(resource $result)",
            maxdb_options: "(resource $link, int $option, mixed $value)",
            maxdb_ping: "(resource $link)",
            maxdb_prepare: "(resource $link, string $query)",
            maxdb_query: "(resource $link, string $query [, int $resultmode])",
            maxdb_real_connect: "(resource $link [, string $hostname [, string $username [, string $passwd [, string $dbname [, int $port [, string $socket]]]]]])",
            maxdb_real_escape_string: "(resource $link, string $escapestr)",
            maxdb_real_query: "(resource $link, string $query)",
            maxdb_report: "(int $flags)",
            maxdb_rollback: "(resource $link)",
            maxdb_rpl_parse_enabled: "(resource $link)",
            maxdb_rpl_probe: "(resource $link)",
            maxdb_rpl_query_type: "(resource $link)",
            maxdb_select_db: "(resource $link, string $dbname)",
            maxdb_send_query: "(resource $link, string $query)",
            maxdb_server_end: "(void)",
            maxdb_server_init: "([array $server [, array $groups]])",
            maxdb_sqlstate: "(resource $link)",
            maxdb_ssl_set: "(resource $link, string $key, string $cert, string $ca, string $capath, string $cipher)",
            maxdb_stat: "(resource $link)",
            maxdb_stmt_affected_rows: "(resource $stmt)",
            maxdb_stmt_bind_param: "(resource $stmt, string $types, mixed& $var1 [, mixed& $...])",
            maxdb_stmt_bind_result: "(resource $stmt, mixed& $var1 [, mixed& $...])",
            maxdb_stmt_close_long_data: "(resource $stmt, int $param_nr)",
            maxdb_stmt_close: "(resource $stmt)",
            maxdb_stmt_data_seek: "(resource $statement, int $offset)",
            maxdb_stmt_errno: "(resource $stmt)",
            maxdb_stmt_error: "(resource $stmt)",
            maxdb_stmt_execute: "(resource $stmt)",
            maxdb_stmt_fetch: "(resource $stmt)",
            maxdb_stmt_free_result: "(resource $stmt)",
            maxdb_stmt_init: "(resource $link)",
            maxdb_stmt_num_rows: "(resource $stmt)",
            maxdb_stmt_param_count: "(resource $stmt)",
            maxdb_stmt_prepare: "(resource $stmt, string $query)",
            maxdb_stmt_reset: "(resource $stmt)",
            maxdb_stmt_result_metadata: "(resource $stmt)",
            maxdb_stmt_send_long_data: "(resource $stmt, int $param_nr, string $data)",
            maxdb_stmt_sqlstate: "(resource $stmt)",
            maxdb_stmt_store_result: "(resource $stmt)",
            maxdb_store_result: "(resource $link)",
            maxdb_thread_id: "(resource $link)",
            maxdb_thread_safe: "(void)",
            maxdb_use_result: "(resource $link)",
            maxdb_warning_count: "(resource $link)",
            mb_check_encoding: "([string $var [, string $encoding]])",
            mb_convert_case: "(string $str, int $mode [, string $encoding])",
            mb_convert_encoding: "(string $str, string $to_encoding [, mixed $from_encoding])",
            mb_convert_kana: "(string $str [, string $option [, string $encoding]])",
            mb_convert_variables: "(string $to_encoding, mixed $from_encoding, mixed& $vars [, mixed& $...])",
            mb_decode_mimeheader: "(string $str)",
            mb_decode_numericentity: "(string $str, array $convmap [, string $encoding])",
            mb_detect_encoding: "(string $str [, mixed $encoding_list [, bool $strict]])",
            mb_detect_order: "([mixed $encoding_list])",
            mb_encode_mimeheader: "(string $str [, string $charset [, string $transfer_encoding [, string $linefeed [, int $indent]]]])",
            mb_encode_numericentity: "(string $str, array $convmap [, string $encoding])",
            mb_eregi_replace: "(string $pattern, string $replace, string $string [, string $option])",
            mb_eregi: "(string $pattern, string $string [, array $regs])",
            mb_ereg_match: "(string $pattern, string $string [, string $option])",
            mb_ereg_replace: "(string $pattern, string $replacement, string $string [, string $option])",
            mb_ereg_search_getpos: "(void)",
            mb_ereg_search_getregs: "(void)",
            mb_ereg_search_init: "(string $string [, string $pattern [, string $option]])",
            mb_ereg_search_pos: "([string $pattern [, string $option]])",
            mb_ereg_search_regs: "([string $pattern [, string $option]])",
            mb_ereg_search_setpos: "(int $position)",
            mb_ereg_search: "([string $pattern [, string $option]])",
            mb_ereg: "(string $pattern, string $string [, array $regs])",
            mb_get_info: "([string $type])",
            mb_http_input: "([string $type])",
            mb_http_output: "([string $encoding])",
            mb_internal_encoding: "([string $encoding])",
            mb_language: "([string $language])",
            mb_list_encodings: "(void)",
            mb_output_handler: "(string $contents, int $status)",
            mb_parse_str: "(string $encoded_string [, array& $result])",
            mb_preferred_mime_name: "(string $encoding)",
            mb_regex_encoding: "([string $encoding])",
            mb_regex_set_options: "([string $options])",
            mb_send_mail: "(string $to, string $subject, string $message [, string $additional_headers [, string $additional_parameter]])",
            mb_split: "(string $pattern, string $string [, int $limit])",
            mb_strcut: "(string $str, int $start [, int $length [, string $encoding]])",
            mb_strimwidth: "(string $str, int $start, int $width [, string $trimmarker [, string $encoding]])",
            mb_stripos: "(string $haystack, string $needle [, int $offset [, string $encoding]])",
            mb_stristr: "(string $haystack, string $needle [, bool $part [, string $encoding]])",
            mb_strlen: "(string $str [, string $encoding])",
            mb_strpos: "(string $haystack, string $needle [, int $offset [, string $encoding]])",
            mb_strrchr: "(string $haystack, string $needle [, bool $part [, string $encoding]])",
            mb_strrichr: "(string $haystack, string $needle [, bool $part [, string $encoding]])",
            mb_strripos: "(string $haystack, string $needle [, int $offset [, string $encoding]])",
            mb_strrpos: "(string $haystack, string $needle [, int $offset [, string $encoding]])",
            mb_strstr: "(string $haystack, string $needle [, bool $part [, string $encoding]])",
            mb_strtolower: "(string $str [, string $encoding])",
            mb_strtoupper: "(string $str [, string $encoding])",
            mb_strwidth: "(string $str [, string $encoding])",
            mb_substitute_character: "([mixed $substrchar])",
            mb_substr_count: "(string $haystack, string $needle [, string $encoding])",
            mb_substr: "(string $str, int $start [, int $length [, string $encoding]])",
            m_checkstatus: "(resource $conn, int $identifier)",
            m_completeauthorizations: "(resource $conn, int& $array)",
            m_connectionerror: "(resource $conn)",
            m_connect: "(resource $conn)",
            mcrypt_cbc: "(int $cipher, string $key, string $data, int $mode [, string $iv])",
            mcrypt_cfb: "(int $cipher, string $key, string $data, int $mode, string $iv)",
            mcrypt_create_iv: "(int $size [, int $source])",
            mcrypt_decrypt: "(string $cipher, string $key, string $data, string $mode [, string $iv])",
            mcrypt_ecb: "(int $cipher, string $key, string $data, int $mode)",
            mcrypt_enc_get_algorithms_name: "(resource $td)",
            mcrypt_enc_get_block_size: "(resource $td)",
            mcrypt_enc_get_iv_size: "(resource $td)",
            mcrypt_enc_get_key_size: "(resource $td)",
            mcrypt_enc_get_modes_name: "(resource $td)",
            mcrypt_enc_get_supported_key_sizes: "(resource $td)",
            mcrypt_enc_is_block_algorithm_mode: "(resource $td)",
            mcrypt_enc_is_block_algorithm: "(resource $td)",
            mcrypt_enc_is_block_mode: "(resource $td)",
            mcrypt_encrypt: "(string $cipher, string $key, string $data, string $mode [, string $iv])",
            mcrypt_enc_self_test: "(resource $td)",
            mcrypt_generic_deinit: "(resource $td)",
            mcrypt_generic_end: "(resource $td)",
            mcrypt_generic_init: "(resource $td, string $key, string $iv)",
            mcrypt_generic: "(resource $td, string $data)",
            mcrypt_get_block_size: "(int $cipher)",
            mcrypt_get_cipher_name: "(int $cipher)",
            mcrypt_get_iv_size: "(string $cipher, string $mode)",
            mcrypt_get_key_size: "(int $cipher)",
            mcrypt_list_algorithms: "([string $lib_dir])",
            mcrypt_list_modes: "([string $lib_dir])",
            mcrypt_module_close: "(resource $td)",
            mcrypt_module_get_algo_block_size: "(string $algorithm [, string $lib_dir])",
            mcrypt_module_get_algo_key_size: "(string $algorithm [, string $lib_dir])",
            mcrypt_module_get_supported_key_sizes: "(string $algorithm [, string $lib_dir])",
            mcrypt_module_is_block_algorithm_mode: "(string $mode [, string $lib_dir])",
            mcrypt_module_is_block_algorithm: "(string $algorithm [, string $lib_dir])",
            mcrypt_module_is_block_mode: "(string $mode [, string $lib_dir])",
            mcrypt_module_open: "(string $algorithm, string $algorithm_directory, string $mode, string $mode_directory)",
            mcrypt_module_self_test: "(string $algorithm [, string $lib_dir])",
            mcrypt_ofb: "(int $cipher, string $key, string $data, int $mode, string $iv)",
            md5_file: "(string $filename [, bool $raw_output])",
            md5: "(string $str [, bool $raw_output])",
            mdecrypt_generic: "(resource $td, string $data)",
            m_deletetrans: "(resource $conn, int $identifier)",
            m_destroyconn: "(resource $conn)",
            m_destroyengine: "(void)",
            "Memcache::addServer": "(string $host [, int $port [, bool $persistent [, int $weight [, int $timeout [, int $retry_interval [, bool $status [, callback $failure_callback]]]]]]])",
            "Memcache::add": "(string $key, mixed $var [, int $flag [, int $expire]])",
            "Memcache::close": "(void)",
            "Memcache::connect": "(string $host [, int $port [, int $timeout]])",
            memcache_debug: "(bool $on_off)",
            "Memcache::decrement": "(string $key [, int $value])",
            "Memcache::delete": "(string $key [, int $timeout])",
            "Memcache::flush": "(void)",
            "Memcache::getExtendedStats": "([string $type [, int $slabid [, int $limit]]])",
            "Memcache::getServerStatus": "(string $host [, int $port])",
            "Memcache::getStats": "([string $type [, int $slabid [, int $limit]]])",
            "Memcache::get": "(string $key [, int& $flags])",
            "Memcache::getVersion": "(void)",
            "Memcache::increment": "(string $key [, int $value])",
            "Memcache::pconnect": "(string $host [, int $port [, int $timeout]])",
            "Memcache::replace": "(string $key, mixed $var [, int $flag [, int $expire]])",
            "Memcache::setCompressThreshold": "(int $threshold [, float $min_savings])",
            "Memcache::setServerParams": "(string $host [, int $port [, int $timeout [, int $retry_interval [, bool $status [, callback $failure_callback]]]]])",
            "Memcache::set": "(string $key, mixed $var [, int $flag [, int $expire]])",
            memory_get_peak_usage: "([bool $real_usage])",
            memory_get_usage: "([bool $real_usage])",
            metaphone: "(string $str [, int $phones])",
            method_exists: "(object $object, string $method_name)",
            m_getcellbynum: "(resource $conn, int $identifier, int $column, int $row)",
            m_getcell: "(resource $conn, int $identifier, string $column, int $row)",
            m_getcommadelimited: "(resource $conn, int $identifier)",
            m_getheader: "(resource $conn, int $identifier, int $column_num)",
            mhash_count: "(void)",
            mhash_get_block_size: "(int $hash)",
            mhash_get_hash_name: "(int $hash)",
            mhash: "(int $hash, string $data [, string $key])",
            mhash_keygen_s2k: "(int $hash, string $password, string $salt, int $bytes)",
            microtime: "([bool $get_as_float])",
            mime_content_type: "(string $filename)",
            mimetype: "(void)",
            min: "(array $values)",
            ming_keypress: "(string $char)",
            ming_setcubicthreshold: "(int $threshold)",
            ming_setscale: "(int $scale)",
            ming_setswfcompression: "(int $level)",
            ming_useconstants: "(int $use)",
            ming_useswfversion: "(int $version)",
            m_initconn: "(void)",
            m_initengine: "(string $location)",
            m_iscommadelimited: "(resource $conn, int $identifier)",
            mkdir: "(string $pathname [, int $mode [, bool $recursive [, resource $context]]])",
            mktime: "([int $hour [, int $minute [, int $second [, int $month [, int $day [, int $year [, int $is_dst]]]]]]])",
            m_maxconntimeout: "(resource $conn, int $secs)",
            m_monitor: "(resource $conn)",
            m_numcolumns: "(resource $conn, int $identifier)",
            m_numrows: "(resource $conn, int $identifier)",
            money_format: "(string $format, float $number)",
            move: "(array $parameter|int $dx, int $dy)",
            movePen: "(int $dx, int $dy)",
            movePenTo: "(int $x, int $y)",
            moveTo: "(int $x, int $y)",
            move_uploaded_file: "(string $filename, string $destination)",
            m_parsecommadelimited: "(resource $conn, int $identifier)",
            mqseries_back: "(resource $hconn, resource $compCode, resource $reason)",
            mqseries_begin: "(resource $hconn, array $beginOptions, resource $compCode, resource $reason)",
            mqseries_close: "(resource $hconn, resource $hobj, resource $compCode, resource $reason)",
            mqseries_cmit: "(resource $hconn, resource $compCode, resource $reason)",
            mqseries_conn: "(string $qManagerName, resource $hconn, resource $compCode, resource $reason)",
            mqseries_connx: "(string $qManagerName, array $connOptions, resource $hconn, resource $compCode, resource $reason)",
            mqseries_disc: "(resource $hconn, resource $compCode, resource $reason)",
            mqseries_get: "(resource $hConn, resource $hObj, array $md, array $gmo, int $bufferLength, string& $msg, int& $data_length, resource& $compCode, resource $reason)",
            mqseries_inq: "(resource $hconn, resource $hobj, int $selectorCount, array $selectors, int $intAttrCount, resource $intAttr, int $charAttrLength, resource $charAttr, resource $compCode, resource $reason)",
            mqseries_open: "(resource $hconn, array $objDesc, int $option, resource $hobj, resource $compCode, resource $reason)",
            mqseries_put1: "(resource $hconn, resource $objDesc, resource $msgDesc, resource $pmo, string $buffer, resource $compCode, resource $reason)",
            mqseries_put: "(resource $hConn, resource $hObj, array $md, array $pmo, string $message, resource $compCode, resource $reason)",
            mqseries_set: "(resource $hconn, resource $compCode, resource $reason)",
            mqseries_strerror: "(int $reason)",
            m_responsekeys: "(resource $conn, int $identifier)",
            m_responseparam: "(resource $conn, int $identifier, string $key)",
            m_returnstatus: "(resource $conn, int $identifier)",
            msession_connect: "(string $host, string $port)",
            msession_count: "(void)",
            msession_create: "(string $session, string $classname, string $data)",
            msession_destroy: "(string $name)",
            msession_disconnect: "(void)",
            msession_find: "(string $name, string $value)",
            msession_get_array: "(string $session)",
            msession_get_data: "(string $session)",
            msession_get: "(string $session, string $name, string $value)",
            msession_inc: "(string $session, string $name)",
            msession_listvar: "(string $name)",
            msession_list: "(void)",
            msession_lock: "(string $name)",
            msession_plugin: "(string $session, string $val [, string $param])",
            msession_randstr: "(int $param)",
            msession_set_array: "(string $session, array $tuples)",
            msession_set_data: "(string $session, string $value)",
            msession_set: "(string $session, string $name, string $value)",
            msession_timeout: "(string $session [, int $param])",
            msession_uniq: "(int $param, string $classname, string $data)",
            msession_unlock: "(string $session, int $key)",
            m_setblocking: "(resource $conn, int $tf)",
            m_setdropfile: "(resource $conn, string $directory)",
            m_setip: "(resource $conn, string $host, int $port)",
            m_setssl_cafile: "(resource $conn, string $cafile)",
            m_setssl_files: "(resource $conn, string $sslkeyfile, string $sslcertfile)",
            m_setssl: "(resource $conn, string $host, int $port)",
            m_settimeout: "(resource $conn, int $seconds)",
            msg_get_queue: "(int $key [, int $perms])",
            msg_queue_exists: "(int $key)",
            msg_receive: "(resource $queue, int $desiredmsgtype, int& $msgtype, int $maxsize, mixed& $message [, bool $unserialize [, int $flags [, int& $errorcode]]])",
            msg_remove_queue: "(resource $queue)",
            msg_send: "(resource $queue, int $msgtype, mixed $message [, bool $serialize [, bool $blocking [, int& $errorcode]]])",
            msg_set_queue: "(resource $queue, array $data)",
            msg_stat_queue: "(resource $queue)",
            msql_affected_rows: "(resource $result)",
            msql_close: "([resource $link_identifier])",
            msql_connect: "([string $hostname])",
            msql_create_db: "(string $database_name [, resource $link_identifier])",
            msql_data_seek: "(resource $result, int $row_number)",
            msql_db_query: "(string $database, string $query [, resource $link_identifier])",
            msql_drop_db: "(string $database_name [, resource $link_identifier])",
            msql_error: "(void)",
            msql_fetch_array: "(resource $result [, int $result_type])",
            msql_fetch_field: "(resource $result [, int $field_offset])",
            msql_fetch_object: "(resource $result)",
            msql_fetch_row: "(resource $result)",
            msql_field_flags: "(resource $result, int $field_offset)",
            msql_field_len: "(resource $result, int $field_offset)",
            msql_field_name: "(resource $result, int $field_offset)",
            msql_field_seek: "(resource $result, int $field_offset)",
            msql_field_table: "(resource $result, int $field_offset)",
            msql_field_type: "(resource $result, int $field_offset)",
            msql_free_result: "(resource $result)",
            msql_list_dbs: "([resource $link_identifier])",
            msql_list_fields: "(string $database, string $tablename [, resource $link_identifier])",
            msql_list_tables: "(string $database [, resource $link_identifier])",
            msql_num_fields: "(resource $result)",
            msql_num_rows: "(resource $query_identifier)",
            msql_pconnect: "([string $hostname])",
            msql_query: "(string $query [, resource $link_identifier])",
            msql_result: "(resource $result, int $row [, mixed $field])",
            msql_select_db: "(string $database_name [, resource $link_identifier])",
            m_sslcert_gen_hash: "(string $filename)",
            mssql_bind: "(resource $stmt, string $param_name, mixed& $var, int $type [, int $is_output [, int $is_null [, int $maxlen]]])",
            mssql_close: "([resource $link_identifier])",
            mssql_connect: "([string $servername [, string $username [, string $password [, bool $new_link]]]])",
            mssql_data_seek: "(resource $result_identifier, int $row_number)",
            mssql_execute: "(resource $stmt [, bool $skip_results])",
            mssql_fetch_array: "(resource $result [, int $result_type])",
            mssql_fetch_assoc: "(resource $result_id)",
            mssql_fetch_batch: "(resource $result)",
            mssql_fetch_field: "(resource $result [, int $field_offset])",
            mssql_fetch_object: "(resource $result)",
            mssql_fetch_row: "(resource $result)",
            mssql_field_length: "(resource $result [, int $offset])",
            mssql_field_name: "(resource $result [, int $offset])",
            mssql_field_seek: "(resource $result, int $field_offset)",
            mssql_field_type: "(resource $result [, int $offset])",
            mssql_free_result: "(resource $result)",
            mssql_free_statement: "(resource $stmt)",
            mssql_get_last_message: "(void)",
            mssql_guid_string: "(string $binary [, int $short_format])",
            mssql_init: "(string $sp_name [, resource $link_identifier])",
            mssql_min_error_severity: "(int $severity)",
            mssql_min_message_severity: "(int $severity)",
            mssql_next_result: "(resource $result_id)",
            mssql_num_fields: "(resource $result)",
            mssql_num_rows: "(resource $result)",
            mssql_pconnect: "([string $servername [, string $username [, string $password [, bool $new_link]]]])",
            mssql_query: "(string $query [, resource $link_identifier [, int $batch_size]])",
            mssql_result: "(resource $result, int $row, mixed $field)",
            mssql_rows_affected: "(resource $link_identifier)",
            mssql_select_db: "(string $database_name [, resource $link_identifier])",
            mt_getrandmax: "(void)",
            mt_rand: "(void)",
            m_transactionssent: "(resource $conn)",
            m_transinqueue: "(resource $conn)",
            m_transkeyval: "(resource $conn, int $identifier, string $key, string $value)",
            m_transnew: "(resource $conn)",
            m_transsend: "(resource $conn, int $identifier)",
            mt_srand: "([int $seed])",
            multColor: "(int $red, int $green, int $blue [, int $a])",
            m_uwait: "(int $microsecs)",
            m_validateidentifier: "(resource $conn, int $tf)",
            m_verifyconnection: "(resource $conn, int $tf)",
            m_verifysslcert: "(resource $conn, int $tf)",
            mysql_affected_rows: "([resource $link_identifier])",
            mysql_change_user: "(string $user, string $password [, string $database [, resource $link_identifier]])",
            mysql_client_encoding: "([resource $link_identifier])",
            mysql_close: "([resource $link_identifier])",
            mysql_connect: "([string $server [, string $username [, string $password [, bool $new_link [, int $client_flags]]]]])",
            mysql_create_db: "(string $database_name [, resource $link_identifier])",
            mysql_data_seek: "(resource $result, int $row_number)",
            mysql_db_name: "(resource $result, int $row [, mixed $field])",
            mysql_db_query: "(string $database, string $query [, resource $link_identifier])",
            mysql_drop_db: "(string $database_name [, resource $link_identifier])",
            mysql_errno: "([resource $link_identifier])",
            mysql_error: "([resource $link_identifier])",
            mysql_escape_string: "(string $unescaped_string)",
            mysql_fetch_array: "(resource $result [, int $result_type])",
            mysql_fetch_assoc: "(resource $result)",
            mysql_fetch_field: "(resource $result [, int $field_offset])",
            mysql_fetch_lengths: "(resource $result)",
            mysql_fetch_object: "(resource $result [, string $class_name [, array $params]])",
            mysql_fetch_row: "(resource $result)",
            mysql_field_flags: "(resource $result, int $field_offset)",
            mysql_field_len: "(resource $result, int $field_offset)",
            mysql_field_name: "(resource $result, int $field_offset)",
            mysql_field_seek: "(resource $result, int $field_offset)",
            mysql_field_table: "(resource $result, int $field_offset)",
            mysql_field_type: "(resource $result, int $field_offset)",
            mysql_free_result: "(resource $result)",
            mysql_get_client_info: "(void)",
            mysql_get_host_info: "([resource $link_identifier])",
            mysql_get_proto_info: "([resource $link_identifier])",
            mysql_get_server_info: "([resource $link_identifier])",
            mysqli_disable_reads_from_master: "(mysqli $link)",
            mysqli_disable_rpl_parse: "(mysqli $link)",
            mysqli_enable_reads_from_master: "(mysqli $link)",
            mysqli_enable_rpl_parse: "(mysqli $link)",
            mysqli_master_query: "(mysqli $link, string $query)",
            mysql_info: "([resource $link_identifier])",
            mysql_insert_id: "([resource $link_identifier])",
            mysqli_report: "(int $flags)",
            mysqli_rpl_parse_enabled: "(mysqli $link)",
            mysqli_rpl_probe: "(mysqli $link)",
            mysqli_rpl_query_type: "(mysqli $link, string $query)",
            mysqli_send_query: "(mysqli $link, string $query)",
            mysqli_slave_query: "(mysqli $link, string $query)",
            mysql_list_dbs: "([resource $link_identifier])",
            mysql_list_fields: "(string $database_name, string $table_name [, resource $link_identifier])",
            mysql_list_processes: "([resource $link_identifier])",
            mysql_list_tables: "(string $database [, resource $link_identifier])",
            mysql_num_fields: "(resource $result)",
            mysql_num_rows: "(resource $result)",
            mysql_pconnect: "([string $server [, string $username [, string $password [, int $client_flags]]]])",
            mysql_ping: "([resource $link_identifier])",
            mysql_query: "(string $query [, resource $link_identifier])",
            mysql_real_escape_string: "(string $unescaped_string [, resource $link_identifier])",
            mysql_result: "(resource $result, int $row [, mixed $field])",
            mysql_select_db: "(string $database_name [, resource $link_identifier])",
            mysql_set_charset: "(string $charset [, resource $link_identifier])",
            mysql_stat: "([resource $link_identifier])",
            mysql_tablename: "(resource $result, int $i)",
            mysql_thread_id: "([resource $link_identifier])",
            mysql_unbuffered_query: "(string $query [, resource $link_identifier])",
            name: "(void)",
            natcasesort: "(array& $array)",
            natsort: "(array& $array)",
            ncurses_addch: "(int $ch)",
            ncurses_addchnstr: "(string $s, int $n)",
            ncurses_addchstr: "(string $s)",
            ncurses_addnstr: "(string $s, int $n)",
            ncurses_addstr: "(string $text)",
            ncurses_assume_default_colors: "(int $fg, int $bg)",
            ncurses_attroff: "(int $attributes)",
            ncurses_attron: "(int $attributes)",
            ncurses_attrset: "(int $attributes)",
            ncurses_baudrate: "(void)",
            ncurses_beep: "(void)",
            ncurses_bkgd: "(int $attrchar)",
            ncurses_bkgdset: "(int $attrchar)",
            ncurses_border: "(int $left, int $right, int $top, int $bottom, int $tl_corner, int $tr_corner, int $bl_corner, int $br_corner)",
            ncurses_bottom_panel: "(resource $panel)",
            ncurses_can_change_color: "(void)",
            ncurses_cbreak: "(void)",
            ncurses_clear: "(void)",
            ncurses_clrtobot: "(void)",
            ncurses_clrtoeol: "(void)",
            ncurses_color_content: "(int $color, int& $r, int& $g, int& $b)",
            ncurses_color_set: "(int $pair)",
            ncurses_curs_set: "(int $visibility)",
            ncurses_define_key: "(string $definition, int $keycode)",
            ncurses_def_prog_mode: "(void)",
            ncurses_def_shell_mode: "(void)",
            ncurses_delay_output: "(int $milliseconds)",
            ncurses_delch: "(void)",
            ncurses_deleteln: "(void)",
            ncurses_del_panel: "(resource $panel)",
            ncurses_delwin: "(resource $window)",
            ncurses_doupdate: "(void)",
            ncurses_echochar: "(int $character)",
            ncurses_echo: "(void)",
            ncurses_end: "(void)",
            ncurses_erasechar: "(void)",
            ncurses_erase: "(void)",
            ncurses_filter: "(void)",
            ncurses_flash: "(void)",
            ncurses_flushinp: "(void)",
            ncurses_getch: "(void)",
            ncurses_getmaxyx: "(resource $window, int& $y, int& $x)",
            ncurses_getmouse: "(array& $mevent)",
            ncurses_getyx: "(resource $window, int& $y, int& $x)",
            ncurses_halfdelay: "(int $tenth)",
            ncurses_has_colors: "(void)",
            ncurses_has_ic: "(void)",
            ncurses_has_il: "(void)",
            ncurses_has_key: "(int $keycode)",
            ncurses_hide_panel: "(resource $panel)",
            ncurses_hline: "(int $charattr, int $n)",
            ncurses_inch: "(void)",
            ncurses_init_color: "(int $color, int $r, int $g, int $b)",
            ncurses_init_pair: "(int $pair, int $fg, int $bg)",
            ncurses_init: "(void)",
            ncurses_insch: "(int $character)",
            ncurses_insdelln: "(int $count)",
            ncurses_insertln: "(void)",
            ncurses_insstr: "(string $text)",
            ncurses_instr: "(string& $buffer)",
            ncurses_isendwin: "(void)",
            ncurses_keyok: "(int $keycode, bool $enable)",
            ncurses_keypad: "(resource $window, bool $bf)",
            ncurses_killchar: "(void)",
            ncurses_longname: "(void)",
            ncurses_meta: "(resource $window, bool $8bit)",
            ncurses_mouseinterval: "(int $milliseconds)",
            ncurses_mousemask: "(int $newmask, int& $oldmask)",
            ncurses_mouse_trafo: "(int& $y, int& $x, bool $toscreen)",
            ncurses_move: "(int $y, int $x)",
            ncurses_move_panel: "(resource $panel, int $startx, int $starty)",
            ncurses_mvaddch: "(int $y, int $x, int $c)",
            ncurses_mvaddchnstr: "(int $y, int $x, string $s, int $n)",
            ncurses_mvaddchstr: "(int $y, int $x, string $s)",
            ncurses_mvaddnstr: "(int $y, int $x, string $s, int $n)",
            ncurses_mvaddstr: "(int $y, int $x, string $s)",
            ncurses_mvcur: "(int $old_y, int $old_x, int $new_y, int $new_x)",
            ncurses_mvdelch: "(int $y, int $x)",
            ncurses_mvgetch: "(int $y, int $x)",
            ncurses_mvhline: "(int $y, int $x, int $attrchar, int $n)",
            ncurses_mvinch: "(int $y, int $x)",
            ncurses_mvvline: "(int $y, int $x, int $attrchar, int $n)",
            ncurses_mvwaddstr: "(resource $window, int $y, int $x, string $text)",
            ncurses_napms: "(int $milliseconds)",
            ncurses_newpad: "(int $rows, int $cols)",
            ncurses_new_panel: "(resource $window)",
            ncurses_newwin: "(int $rows, int $cols, int $y, int $x)",
            ncurses_nl: "(void)",
            ncurses_nocbreak: "(void)",
            ncurses_noecho: "(void)",
            ncurses_nonl: "(void)",
            ncurses_noqiflush: "(void)",
            ncurses_noraw: "(void)",
            ncurses_pair_content: "(int $pair, int& $f, int& $b)",
            ncurses_panel_above: "(resource $panel)",
            ncurses_panel_below: "(resource $panel)",
            ncurses_panel_window: "(resource $panel)",
            ncurses_pnoutrefresh: "(resource $pad, int $pminrow, int $pmincol, int $sminrow, int $smincol, int $smaxrow, int $smaxcol)",
            ncurses_prefresh: "(resource $pad, int $pminrow, int $pmincol, int $sminrow, int $smincol, int $smaxrow, int $smaxcol)",
            ncurses_putp: "(string $text)",
            ncurses_qiflush: "(void)",
            ncurses_raw: "(void)",
            ncurses_refresh: "(int $ch)",
            ncurses_replace_panel: "(resource $panel, resource $window)",
            ncurses_reset_prog_mode: "(void)",
            ncurses_reset_shell_mode: "(void)",
            ncurses_resetty: "(void)",
            ncurses_savetty: "(void)",
            ncurses_scr_dump: "(string $filename)",
            ncurses_scr_init: "(string $filename)",
            ncurses_scrl: "(int $count)",
            ncurses_scr_restore: "(string $filename)",
            ncurses_scr_set: "(string $filename)",
            ncurses_show_panel: "(resource $panel)",
            ncurses_slk_attroff: "(int $intarg)",
            ncurses_slk_attron: "(int $intarg)",
            ncurses_slk_attrset: "(int $intarg)",
            ncurses_slk_attr: "(void)",
            ncurses_slk_clear: "(void)",
            ncurses_slk_color: "(int $intarg)",
            ncurses_slk_init: "(int $format)",
            ncurses_slk_noutrefresh: "(void)",
            ncurses_slk_refresh: "(void)",
            ncurses_slk_restore: "(void)",
            ncurses_slk_set: "(int $labelnr, string $label, int $format)",
            ncurses_slk_touch: "(void)",
            ncurses_standend: "(void)",
            ncurses_standout: "(void)",
            ncurses_start_color: "(void)",
            ncurses_termattrs: "(void)",
            ncurses_termname: "(void)",
            ncurses_timeout: "(int $millisec)",
            ncurses_top_panel: "(resource $panel)",
            ncurses_typeahead: "(int $fd)",
            ncurses_ungetch: "(int $keycode)",
            ncurses_ungetmouse: "(array $mevent)",
            ncurses_update_panels: "(void)",
            ncurses_use_default_colors: "(void)",
            ncurses_use_env: "(bool $flag)",
            ncurses_use_extended_names: "(bool $flag)",
            ncurses_vidattr: "(int $intarg)",
            ncurses_vline: "(int $charattr, int $n)",
            ncurses_waddch: "(resource $window, int $ch)",
            ncurses_waddstr: "(resource $window, string $str [, int $n])",
            ncurses_wattroff: "(resource $window, int $attrs)",
            ncurses_wattron: "(resource $window, int $attrs)",
            ncurses_wattrset: "(resource $window, int $attrs)",
            ncurses_wborder: "(resource $window, int $left, int $right, int $top, int $bottom, int $tl_corner, int $tr_corner, int $bl_corner, int $br_corner)",
            ncurses_wclear: "(resource $window)",
            ncurses_wcolor_set: "(resource $window, int $color_pair)",
            ncurses_werase: "(resource $window)",
            ncurses_wgetch: "(resource $window)",
            ncurses_whline: "(resource $window, int $charattr, int $n)",
            ncurses_wmouse_trafo: "(resource $window, int& $y, int& $x, bool $toscreen)",
            ncurses_wmove: "(resource $window, int $y, int $x)",
            ncurses_wnoutrefresh: "(resource $window)",
            ncurses_wrefresh: "(resource $window)",
            ncurses_wstandend: "(resource $window)",
            ncurses_wstandout: "(resource $window)",
            ncurses_wvline: "(resource $window, int $charattr, int $n)",
            newt_bell: "(void)",
            newt_button_bar: "(array& $buttons)",
            newt_button: "(int $left, int $top, string $text)",
            newt_centered_window: "(int $width, int $height [, string $title])",
            newt_checkbox_get_value: "(resource $checkbox)",
            newt_checkbox: "(int $left, int $top, string $text, string $def_value [, string $seq])",
            newt_checkbox_set_flags: "(resource $checkbox, int $flags, int $sense)",
            newt_checkbox_set_value: "(resource $checkbox, string $value)",
            newt_checkbox_tree_add_item: "(resource $checkboxtree, string $text, mixed $data, int $flags, int $index [, int $...])",
            newt_checkbox_tree_find_item: "(resource $checkboxtree, mixed $data)",
            newt_checkbox_tree_get_current: "(resource $checkboxtree)",
            newt_checkbox_tree_get_entry_value: "(resource $checkboxtree, mixed $data)",
            newt_checkbox_tree_get_multi_selection: "(resource $checkboxtree, string $seqnum)",
            newt_checkbox_tree_get_selection: "(resource $checkboxtree)",
            newt_checkbox_tree: "(int $left, int $top, int $height [, int $flags])",
            newt_checkbox_tree_multi: "(int $left, int $top, int $height, string $seq [, int $flags])",
            newt_checkbox_tree_set_current: "(resource $checkboxtree, mixed $data)",
            newt_checkbox_tree_set_entry: "(resource $checkboxtree, mixed $data, string $text)",
            newt_checkbox_tree_set_entry_value: "(resource $checkboxtree, mixed $data, string $value)",
            newt_checkbox_tree_set_width: "(resource $checkbox_tree, int $width)",
            newt_clear_key_buffer: "(void)",
            newt_cls: "(void)",
            newt_compact_button: "(int $left, int $top, string $text)",
            newt_component_add_callback: "(resource $component, mixed $func_name, mixed $data)",
            newt_component_takes_focus: "(resource $component, bool $takes_focus)",
            newt_create_grid: "(int $cols, int $rows)",
            newt_cursor_off: "(void)",
            newt_cursor_on: "(void)",
            newt_delay: "(int $microseconds)",
            newt_draw_form: "(resource $form)",
            newt_draw_root_text: "(int $left, int $top, string $text)",
            newt_entry_get_value: "(resource $entry)",
            newt_entry: "(int $left, int $top, int $width [, string $init_value [, int $flags]])",
            newt_entry_set_filter: "(resource $entry, callback $filter, mixed $data)",
            newt_entry_set_flags: "(resource $entry, int $flags, int $sense)",
            newt_entry_set: "(resource $entry, string $value [, bool $cursor_at_end])",
            newt_finished: "(void)",
            newt_form_add_component: "(resource $form, resource $component)",
            newt_form_add_components: "(resource $form, array $components)",
            newt_form_add_hot_key: "(resource $form, int $key)",
            newt_form_destroy: "(resource $form)",
            newt_form_get_current: "(resource $form)",
            newt_form: "([resource $vert_bar [, string $help [, int $flags]]])",
            newt_form_run: "(resource $form, array& $exit_struct)",
            newt_form_set_background: "(resource $from, int $background)",
            newt_form_set_height: "(resource $form, int $height)",
            newt_form_set_size: "(resource $form)",
            newt_form_set_timer: "(resource $form, int $milliseconds)",
            newt_form_set_width: "(resource $form, int $width)",
            newt_form_watch_fd: "(resource $form, resource $stream [, int $flags])",
            newt_get_screen_size: "(int& $cols, int& $rows)",
            newt_grid_add_components_to_form: "(resource $grid, resource $form, bool $recurse)",
            newt_grid_basic_window: "(resource $text, resource $middle, resource $buttons)",
            newt_grid_free: "(resource $grid, bool $recurse)",
            newt_grid_get_size: "(resouce $grid, int& $width, int& $height)",
            newt_grid_h_close_stacked: "(int $element1_type, resource $element1 [, int $... [, resource $...]])",
            newt_grid_h_stacked: "(int $element1_type, resource $element1 [, int $... [, resource $...]])",
            newt_grid_place: "(resource $grid, int $left, int $top)",
            newt_grid_set_field: "(resource $grid, int $col, int $row, int $type, resource $val, int $pad_left, int $pad_top, int $pad_right, int $pad_bottom, int $anchor [, int $flags])",
            newt_grid_simple_window: "(resource $text, resource $middle, resource $buttons)",
            newt_grid_v_close_stacked: "(int $element1_type, resource $element1 [, int $... [, resource $...]])",
            newt_grid_v_stacked: "(int $element1_type, resource $element1 [, int $... [, resource $...]])",
            newt_grid_wrapped_window_at: "(resource $grid, string $title, int $left, int $top)",
            newt_grid_wrapped_window: "(resource $grid, string $title)",
            newt_init: "(void)",
            newt_label: "(int $left, int $top, string $text)",
            newt_label_set_text: "(resource $label, string $text)",
            newt_listbox_append_entry: "(resource $listbox, string $text, mixed $data)",
            newt_listbox_clear: "(resource $listobx)",
            newt_listbox_clear_selection: "(resource $listbox)",
            newt_listbox_delete_entry: "(resource $listbox, mixed $key)",
            newt_listbox_get_current: "(resource $listbox)",
            newt_listbox_get_selection: "(resource $listbox)",
            newt_listbox_insert_entry: "(resource $listbox, string $text, mixed $data, mixed $key)",
            newt_listbox: "(int $left, int $top, int $height [, int $flags])",
            newt_listbox_item_count: "(resource $listbox)",
            newt_listbox_select_item: "(resource $listbox, mixed $key, int $sense)",
            newt_listbox_set_current_by_key: "(resource $listbox, mixed $key)",
            newt_listbox_set_current: "(resource $listbox, int $num)",
            newt_listbox_set_data: "(resource $listbox, int $num, mixed $data)",
            newt_listbox_set_entry: "(resource $listbox, int $num, string $text)",
            newt_listbox_set_width: "(resource $listbox, int $width)",
            newt_listitem_get_data: "(resource $item)",
            newt_listitem: "(int $left, int $top, string $text, bool $is_default, resouce $prev_item, mixed $data [, int $flags])",
            newt_listitem_set: "(resource $item, string $text)",
            newt_open_window: "(int $left, int $top, int $width, int $height [, string $title])",
            newt_pop_help_line: "(void)",
            newt_pop_window: "(void)",
            newt_push_help_line: "([string $text])",
            newt_radiobutton: "(int $left, int $top, string $text, bool $is_default [, resource $prev_button])",
            newt_radio_get_current: "(resource $set_member)",
            newt_redraw_help_line: "(void)",
            newt_reflow_text: "(string $text, int $width, int $flex_down, int $flex_up, int& $actual_width, int& $actual_height)",
            newt_refresh: "(void)",
            newt_resize_screen: "([bool $redraw])",
            newt_resume: "(void)",
            newt_run_form: "(resource $form)",
            newt_scale: "(int $left, int $top, int $width, int $full_value)",
            newt_scale_set: "(resource $scale, int $amount)",
            newt_scrollbar_set: "(resource $scrollbar, int $where, int $total)",
            newt_set_help_callback: "(mixed $function)",
            newt_set_suspend_callback: "(callback $function, mixed $data)",
            newt_suspend: "(void)",
            newt_textbox_get_num_lines: "(resource $textbox)",
            newt_textbox: "(int $left, int $top, int $width, int $height [, int $flags])",
            newt_textbox_reflowed: "(int $left, int $top, char $*text, int $width, int $flex_down, int $flex_up [, int $flags])",
            newt_textbox_set_height: "(resource $textbox, int $height)",
            newt_textbox_set_text: "(resource $textbox, string $text)",
            newt_vertical_scrollbar: "(int $left, int $top, int $height [, int $normal_colorset [, int $thumb_colorset]])",
            newt_wait_for_key: "(void)",
            newt_win_choice: "(string $title, string $button1_text, string $button2_text, string $format [, mixed $args [, mixed $...]])",
            newt_win_entries: "(string $title, string $text, int $suggested_width, int $flex_down, int $flex_up, int $data_width, array& $items, string $button1 [, string $...])",
            newt_win_menu: "(string $title, string $text, int $suggestedWidth, int $flexDown, int $flexUp, int $maxListHeight, array $items, int& $listItem [, string $button1 [, string $...]])",
            newt_win_message: "(string $title, string $button_text, string $format [, mixed $args [, mixed $...]])",
            newt_win_messagev: "(string $title, string $button_text, string $format, array $args)",
            newt_win_ternary: "(string $title, string $button1_text, string $button2_text, string $button3_text, string $format [, mixed $args [, mixed $...]])",
            next: "(array& $array)",
            nextFrame: "(void)",
            ngettext: "(string $msgid1, string $msgid2, int $n)",
            nl2br: "(string $string)",
            nl_langinfo: "(int $item)",
            noMultiple: "(void)",
            notations: "(void)",
            notes_body: "(string $server, string $mailbox, int $msg_number)",
            notes_copy_db: "(string $from_database_name, string $to_database_name)",
            notes_create_db: "(string $database_name)",
            notes_create_note: "(string $database_name, string $form_name)",
            notes_drop_db: "(string $database_name)",
            notes_find_note: "(string $database_name, string $name [, string $type])",
            notes_header_info: "(string $server, string $mailbox, int $msg_number)",
            notes_list_msgs: "(string $db)",
            notes_mark_read: "(string $database_name, string $user_name, string $note_id)",
            notes_mark_unread: "(string $database_name, string $user_name, string $note_id)",
            notes_nav_create: "(string $database_name, string $name)",
            notes_search: "(string $database_name, string $keywords)",
            notes_unread: "(string $database_name, string $user_name)",
            notes_version: "(string $database_name)",
            nsapi_request_headers: "(void)",
            nsapi_response_headers: "(void)",
            nsapi_virtual: "(string $uri)",
            nthmac: "(string $clent, string $data)",
            number_format: "(float $number [, int $decimals])",
            ob_clean: "(void)",
            ob_deflatehandler: "(string $data, int $mode)",
            ob_end_clean: "(void)",
            ob_end_flush: "(void)",
            ob_etaghandler: "(string $data, int $mode)",
            ob_flush: "(void)",
            ob_get_clean: "(void)",
            ob_get_contents: "(void)",
            ob_get_flush: "(void)",
            ob_get_length: "(void)",
            ob_get_level: "(void)",
            ob_get_status: "([bool $full_status=FALSE])",
            ob_gzhandler: "(string $buffer, int $mode)",
            ob_iconv_handler: "(string $contents, int $status)",
            ob_implicit_flush: "([int $flag])",
            ob_inflatehandler: "(string $data, int $mode)",
            object: "(array $parameter)",
            objectbyanchor: "(array $parameter)",
            ob_list_handlers: "(void)",
            ob_start: "([callback $output_callback [, int $chunk_size [, bool $erase]]])",
            ob_tidyhandler: "(string $input [, int $mode])",
            oci_bind_array_by_name: "(resource $statement, string $name, array& $var_array, int $max_table_length [, int $max_item_length [, int $type]])",
            oci_bind_by_name: "(resource $statement, string $ph_name, mixed& $variable [, int $maxlength [, int $type]])",
            oci_cancel: "(resource $statement)",
            oci_close: "(resource $connection)",
            oci_commit: "(resource $connection)",
            oci_connect: "(string $username, string $password [, string $db [, string $charset [, int $session_mode]]])",
            oci_define_by_name: "(resource $statement, string $column_name, mixed& $variable [, int $type])",
            oci_error: "([resource $source])",
            oci_execute: "(resource $statement [, int $mode])",
            oci_fetch_all: "(resource $statement, array& $output [, int $skip [, int $maxrows [, int $flags]]])",
            oci_fetch_array: "(resource $statement [, int $mode])",
            oci_fetch_assoc: "(resource $statement)",
            ocifetchinto: "(resource $statement, array& $result [, int $mode])",
            oci_fetch_object: "(resource $statement)",
            oci_fetch: "(resource $statement)",
            oci_fetch_row: "(resource $statement)",
            oci_field_is_null: "(resource $statement, mixed $field)",
            oci_field_name: "(resource $statement, int $field)",
            oci_field_precision: "(resource $statement, int $field)",
            oci_field_scale: "(resource $statement, int $field)",
            oci_field_size: "(resource $statement, mixed $field)",
            oci_field_type_raw: "(resource $statement, int $field)",
            oci_field_type: "(resource $statement, int $field)",
            oci_free_statement: "(resource $statement)",
            oci_internal_debug: "(bool $onoff)",
            oci_lob_copy: "(OCI-Lob $lob_to, OCI-Lob $lob_from [, int $length])",
            oci_lob_is_equal: "(OCI-Lob $lob1, OCI-Lob $lob2)",
            oci_new_collection: "(resource $connection, string $tdo [, string $schema])",
            oci_new_connect: "(string $username, string $password [, string $db [, string $charset [, int $session_mode]]])",
            oci_new_cursor: "(resource $connection)",
            oci_new_descriptor: "(resource $connection [, int $type])",
            oci_num_fields: "(resource $statement)",
            oci_num_rows: "(resource $statement)",
            oci_parse: "(resource $connection, string $query)",
            oci_password_change: "(resource $connection, string $username, string $old_password, string $new_password)",
            oci_pconnect: "(string $username, string $password [, string $db [, string $charset [, int $session_mode]]])",
            oci_result: "(resource $statement, mixed $field)",
            oci_rollback: "(resource $connection)",
            oci_server_version: "(resource $connection)",
            oci_set_prefetch: "(resource $statement, int $rows)",
            oci_statement_type: "(resource $statement)",
            octdec: "(string $octal_string)",
            odbc_autocommit: "(resource $connection_id [, bool $OnOff])",
            odbc_binmode: "(resource $result_id, int $mode)",
            odbc_close_all: "(void)",
            odbc_close: "(resource $connection_id)",
            odbc_columnprivileges: "(resource $connection_id, string $qualifier, string $owner, string $table_name, string $column_name)",
            odbc_columns: "(resource $connection_id [, string $qualifier [, string $schema [, string $table_name [, string $column_name]]]])",
            odbc_commit: "(resource $connection_id)",
            odbc_connect: "(string $dsn, string $user, string $password [, int $cursor_type])",
            odbc_cursor: "(resource $result_id)",
            odbc_data_source: "(resource $connection_id, int $fetch_type)",
            odbc_errormsg: "([resource $connection_id])",
            odbc_error: "([resource $connection_id])",
            odbc_exec: "(resource $connection_id, string $query_string [, int $flags])",
            odbc_execute: "(resource $result_id [, array $parameters_array])",
            odbc_fetch_array: "(resource $result [, int $rownumber])",
            odbc_fetch_into: "(resource $result_id, array $result_array [, int $rownumber])",
            odbc_fetch_object: "(resource $result [, int $rownumber])",
            odbc_fetch_row: "(resource $result_id [, int $row_number])",
            odbc_field_len: "(resource $result_id, int $field_number)",
            odbc_field_name: "(resource $result_id, int $field_number)",
            odbc_field_num: "(resource $result_id, string $field_name)",
            odbc_field_scale: "(resource $result_id, int $field_number)",
            odbc_field_type: "(resource $result_id, int $field_number)",
            odbc_foreignkeys: "(resource $connection_id, string $pk_qualifier, string $pk_owner, string $pk_table, string $fk_qualifier, string $fk_owner, string $fk_table)",
            odbc_free_result: "(resource $result_id)",
            odbc_gettypeinfo: "(resource $connection_id [, int $data_type])",
            odbc_longreadlen: "(resource $result_id, int $length)",
            odbc_next_result: "(resource $result_id)",
            odbc_num_fields: "(resource $result_id)",
            odbc_num_rows: "(resource $result_id)",
            odbc_pconnect: "(string $dsn, string $user, string $password [, int $cursor_type])",
            odbc_prepare: "(resource $connection_id, string $query_string)",
            odbc_primarykeys: "(resource $connection_id, string $qualifier, string $owner, string $table)",
            odbc_procedurecolumns: "(resource $connection_id)",
            odbc_procedures: "(resource $connection_id)",
            odbc_result_all: "(resource $result_id [, string $format])",
            odbc_result: "(resource $result_id, mixed $field)",
            odbc_rollback: "(resource $connection_id)",
            odbc_setoption: "(resource $id, int $function, int $option, int $param)",
            odbc_specialcolumns: "(resource $connection_id, int $type, string $qualifier, string $owner, string $table, int $scope, int $nullable)",
            odbc_statistics: "(resource $connection_id, string $qualifier, string $owner, string $table_name, int $unique, int $accuracy)",
            odbc_tableprivileges: "(resource $connection_id, string $qualifier, string $owner, string $name)",
            odbc_tables: "(resource $connection_id [, string $qualifier [, string $owner [, string $name [, string $types]]]])",
            openal_buffer_create: "(void)",
            openal_buffer_data: "(resource $buffer, int $format, string $data, int $freq)",
            openal_buffer_destroy: "(resource $buffer)",
            openal_buffer_get: "(resource $buffer, int $property)",
            openal_buffer_loadwav: "(resource $buffer, string $wavfile)",
            openal_context_create: "(resource $device)",
            openal_context_current: "(resource $context)",
            openal_context_destroy: "(resource $context)",
            openal_context_process: "(resource $context)",
            openal_context_suspend: "(resource $context)",
            openal_device_close: "(resource $device)",
            openal_device_open: "([string $device_desc])",
            openal_listener_get: "(int $property)",
            openal_listener_set: "(int $property, mixed $setting)",
            openal_source_create: "(void)",
            openal_source_destroy: "(resource $source)",
            openal_source_get: "(resource $source, int $property)",
            openal_source_pause: "(resource $source)",
            openal_source_play: "(resource $source)",
            openal_source_rewind: "(resource $source)",
            openal_source_set: "(resource $source, int $property, mixed $setting)",
            openal_source_stop: "(resource $source)",
            openal_stream: "(resource $source, int $format, int $rate)",
            opendir: "(string $path [, resource $context])",
            openlog: "(string $ident, int $option, int $facility)",
            openMemory: "(void)",
            openssl_csr_export: "(resource $csr, string& $out [, bool $notext])",
            openssl_csr_export_to_file: "(resource $csr, string $outfilename [, bool $notext])",
            openssl_csr_get_public_key: "(mixed $csr [, bool $use_shortnames])",
            openssl_csr_get_subject: "(mixed $csr [, bool $use_shortnames])",
            openssl_csr_new: "(array $dn, resource& $privkey [, array $configargs [, array $extraattribs]])",
            openssl_csr_sign: "(mixed $csr, mixed $cacert, mixed $priv_key, int $days [, array $configargs [, int $serial]])",
            openssl_error_string: "(void)",
            openssl_free_key: "(resource $key_identifier)",
            openssl_open: "(string $sealed_data, string& $open_data, string $env_key, mixed $priv_key_id)",
            openssl_pkcs12_export: "(mixed $x509, string& $out, mixed $priv_key, string $pass [, array $args])",
            openssl_pkcs12_export_to_file: "(mixed $x509, string $filename, mixed $priv_key, string $pass [, array $args])",
            openssl_pkcs12_read: "(mixed $PKCS12, array& $certs, string $pass)",
            openssl_pkcs7_decrypt: "(string $infilename, string $outfilename, mixed $recipcert [, mixed $recipkey])",
            openssl_pkcs7_encrypt: "(string $infile, string $outfile, mixed $recipcerts, array $headers [, int $flags [, int $cipherid]])",
            openssl_pkcs7_sign: "(string $infilename, string $outfilename, mixed $signcert, mixed $privkey, array $headers [, int $flags [, string $extracerts]])",
            openssl_pkcs7_verify: "(string $filename, int $flags [, string $outfilename [, array $cainfo [, string $extracerts [, string $content]]]])",
            openssl_pkey_export: "(mixed $key, string& $out [, string $passphrase [, array $configargs]])",
            openssl_pkey_export_to_file: "(mixed $key, string $outfilename [, string $passphrase [, array $configargs]])",
            openssl_pkey_free: "(resource $key)",
            openssl_pkey_get_details: "(resource $key)",
            openssl_pkey_get_private: "(mixed $key [, string $passphrase])",
            openssl_pkey_get_public: "(mixed $certificate)",
            openssl_pkey_new: "([array $configargs])",
            openssl_private_decrypt: "(string $data, string& $decrypted, mixed $key [, int $padding])",
            openssl_private_encrypt: "(string $data, string& $crypted, mixed $key [, int $padding])",
            openssl_public_decrypt: "(string $data, string& $decrypted, mixed $key [, int $padding])",
            openssl_public_encrypt: "(string $data, string& $crypted, mixed $key [, int $padding])",
            openssl_seal: "(string $data, string& $sealed_data, array& $env_keys, array $pub_key_ids)",
            openssl_sign: "(string $data, string& $signature, mixed $priv_key_id [, int $signature_alg])",
            openssl_verify: "(string $data, string $signature, mixed $pub_key_id [, int $signature_alg])",
            openssl_x509_check_private_key: "(mixed $cert, mixed $key)",
            openssl_x509_checkpurpose: "(mixed $x509cert, int $purpose [, array $cainfo [, string $untrustedfile]])",
            openssl_x509_export: "(mixed $x509, string& $output [, bool $notext])",
            openssl_x509_export_to_file: "(mixed $x509, string $outfilename [, bool $notext])",
            openssl_x509_free: "(resource $x509cert)",
            openssl_x509_parse: "(mixed $x509cert [, bool $shortnames])",
            openssl_x509_read: "(mixed $x509certdata)",
            openURI: "(string $uri)",
            ord: "(string $string)",
            output_add_rewrite_var: "(string $name, string $value)",
            output: "([int $compression])",
            outputMemory: "([bool $flush])",
            output_reset_rewrite_vars: "(void)",
            overload: "(string $class_name)",
            override_function: "(string $function_name, string $function_args, string $function_code)",
            ovrimos_close: "(int $connection)",
            ovrimos_commit: "(int $connection_id)",
            ovrimos_connect: "(string $host, string $dborport, string $user, string $password)",
            ovrimos_cursor: "(int $result_id)",
            ovrimos_exec: "(int $connection_id, string $query)",
            ovrimos_execute: "(int $result_id [, array $parameters_array])",
            ovrimos_fetch_into: "(int $result_id, array& $result_array [, string $how [, int $rownumber]])",
            ovrimos_fetch_row: "(int $result_id [, int $how [, int $row_number]])",
            ovrimos_field_len: "(int $result_id, int $field_number)",
            ovrimos_field_name: "(int $result_id, int $field_number)",
            ovrimos_field_num: "(int $result_id, string $field_name)",
            ovrimos_field_type: "(int $result_id, int $field_number)",
            ovrimos_free_result: "(int $result_id)",
            ovrimos_longreadlen: "(int $result_id, int $length)",
            ovrimos_num_fields: "(int $result_id)",
            ovrimos_num_rows: "(int $result_id)",
            ovrimos_prepare: "(int $connection_id, string $query)",
            ovrimos_result_all: "(int $result_id [, string $format])",
            ovrimos_result: "(int $result_id, mixed $field)",
            ovrimos_rollback: "(int $connection_id)",
            pack: "(string $format [, mixed $args [, mixed $...]])",
            parents: "(array $parameter)",
            parse_ini_file: "(string $filename [, bool $process_sections])",
            parsekit_compile_file: "(string $filename [, array& $errors [, int $options]])",
            parsekit_compile_string: "(string $phpcode [, array& $errors [, int $options]])",
            parsekit_func_arginfo: "(mixed $function)",
            parse_str: "(string $str [, array& $arr])",
            parse_url: "(string $url [, int $component])",
            passthru: "(string $command [, int& $return_var])",
            pathinfo: "(string $path [, int $options])",
            pclose: "(resource $handle)",
            pcntl_alarm: "(int $seconds)",
            pcntl_exec: "(string $path [, array $args [, array $envs]])",
            pcntl_fork: "(void)",
            pcntl_getpriority: "([int $pid [, int $process_identifier]])",
            pcntl_setpriority: "(int $priority [, int $pid [, int $process_identifier]])",
            pcntl_signal: "(int $signo, callback $handler [, bool $restart_syscalls])",
            pcntl_wait: "(int& $status [, int $options])",
            pcntl_waitpid: "(int $pid, int& $status [, int $options])",
            pcntl_wexitstatus: "(int $status)",
            pcntl_wifexited: "(int $status)",
            pcntl_wifsignaled: "(int $status)",
            pcntl_wifstopped: "(int $status)",
            pcntl_wstopsig: "(int $status)",
            pcntl_wtermsig: "(int $status)",
            PDF_activate_item: "(resource $pdfdoc, int $id)",
            PDF_add_launchlink: "(resource $pdfdoc, float $llx, float $lly, float $urx, float $ury, string $filename)",
            PDF_add_locallink: "(resource $pdfdoc, float $lowerleftx, float $lowerlefty, float $upperrightx, float $upperrighty, int $page, string $dest)",
            PDF_add_nameddest: "(resource $pdfdoc, string $name, string $optlist)",
            PDF_add_note: "(resource $pdfdoc, float $llx, float $lly, float $urx, float $ury, string $contents, string $title, string $icon, int $open)",
            PDF_add_pdflink: "(resource $pdfdoc, float $bottom_left_x, float $bottom_left_y, float $up_right_x, float $up_right_y, string $filename, int $page, string $dest)",
            PDF_add_table_cell: "(resource $pdfdoc, int $table, int $column, int $row, string $text, string $optlist)",
            PDF_add_textflow: "(resource $pdfdoc, int $textflow, string $text, string $optlist)",
            PDF_add_thumbnail: "(resource $pdfdoc, int $image)",
            PDF_add_weblink: "(resource $pdfdoc, float $lowerleftx, float $lowerlefty, float $upperrightx, float $upperrighty, string $url)",
            PDF_arcn: "(resource $p, float $x, float $y, float $r, float $alpha, float $beta)",
            PDF_arc: "(resource $p, float $x, float $y, float $r, float $alpha, float $beta)",
            PDF_attach_file: "(resource $pdfdoc, float $llx, float $lly, float $urx, float $ury, string $filename, string $description, string $author, string $mimetype, string $icon)",
            PDF_begin_document: "(resource $pdfdoc, string $filename, string $optlist)",
            PDF_begin_font: "(resource $pdfdoc, string $filename, float $a, float $b, float $c, float $d, float $e, float $f, string $optlist)",
            PDF_begin_glyph: "(resource $pdfdoc, string $glyphname, float $wx, float $llx, float $lly, float $urx, float $ury)",
            PDF_begin_item: "(resource $pdfdoc, string $tag, string $optlist)",
            PDF_begin_layer: "(resource $pdfdoc, int $layer)",
            PDF_begin_page_ext: "(resource $pdfdoc, float $width, float $height, string $optlist)",
            PDF_begin_page: "(resource $pdfdoc, float $width, float $height)",
            PDF_begin_pattern: "(resource $pdfdoc, float $width, float $height, float $xstep, float $ystep, int $painttype)",
            PDF_begin_template_ext: "(resource $pdfdoc, float $width, float $height, string $optlist)",
            PDF_begin_template: "(resource $pdfdoc, float $width, float $height)",
            PDF_circle: "(resource $pdfdoc, float $x, float $y, float $r)",
            PDF_clip: "(resource $p)",
            PDF_close_image: "(resource $p, int $image)",
            PDF_closepath_fill_stroke: "(resource $p)",
            PDF_closepath: "(resource $p)",
            PDF_closepath_stroke: "(resource $p)",
            PDF_close_pdi_page: "(resource $p, int $page)",
            PDF_close_pdi: "(resource $p, int $doc)",
            PDF_close: "(resource $p)",
            PDF_concat: "(resource $p, float $a, float $b, float $c, float $d, float $e, float $f)",
            PDF_continue_text: "(resource $p, string $text)",
            PDF_create_3dview: "(resource $pdfdoc, string $username, string $optlist)",
            PDF_create_action: "(resource $pdfdoc, string $type, string $optlist)",
            PDF_create_annotation: "(resource $pdfdoc, float $llx, float $lly, float $urx, float $ury, string $type, string $optlist)",
            PDF_create_bookmark: "(resource $pdfdoc, string $text, string $optlist)",
            PDF_create_fieldgroup: "(resource $pdfdoc, string $name, string $optlist)",
            PDF_create_field: "(resource $pdfdoc, float $llx, float $lly, float $urx, float $ury, string $name, string $type, string $optlist)",
            PDF_create_gstate: "(resource $pdfdoc, string $optlist)",
            PDF_create_pvf: "(resource $pdfdoc, string $filename, string $data, string $optlist)",
            PDF_create_textflow: "(resource $pdfdoc, string $text, string $optlist)",
            PDF_curveto: "(resource $p, float $x1, float $y1, float $x2, float $y2, float $x3, float $y3)",
            PDF_define_layer: "(resource $pdfdoc, string $name, string $optlist)",
            PDF_delete_pvf: "(resource $pdfdoc, string $filename)",
            PDF_delete: "(resource $pdfdoc)",
            PDF_delete_table: "(resource $pdfdoc, int $table, string $optlist)",
            PDF_delete_textflow: "(resource $pdfdoc, int $textflow)",
            PDF_encoding_set_char: "(resource $pdfdoc, string $encoding, int $slot, string $glyphname, int $uv)",
            PDF_end_document: "(resource $pdfdoc, string $optlist)",
            PDF_end_font: "(resource $pdfdoc)",
            PDF_end_glyph: "(resource $pdfdoc)",
            PDF_end_item: "(resource $pdfdoc, int $id)",
            PDF_end_layer: "(resource $pdfdoc)",
            PDF_end_page_ext: "(resource $pdfdoc, string $optlist)",
            PDF_end_page: "(resource $p)",
            PDF_endpath: "(resource $p)",
            PDF_end_pattern: "(resource $p)",
            PDF_end_template: "(resource $p)",
            PDF_fill_imageblock: "(resource $pdfdoc, int $page, string $blockname, int $image, string $optlist)",
            PDF_fill_pdfblock: "(resource $pdfdoc, int $page, string $blockname, int $contents, string $optlist)",
            PDF_fill: "(resource $p)",
            PDF_fill_stroke: "(resource $p)",
            PDF_fill_textblock: "(resource $pdfdoc, int $page, string $blockname, string $text, string $optlist)",
            PDF_findfont: "(resource $p, string $fontname, string $encoding, int $embed)",
            PDF_fit_image: "(resource $pdfdoc, int $image, float $x, float $y, string $optlist)",
            PDF_fit_pdi_page: "(resource $pdfdoc, int $page, float $x, float $y, string $optlist)",
            PDF_fit_table: "(resource $pdfdoc, int $table, float $llx, float $lly, float $urx, float $ury, string $optlist)",
            PDF_fit_textflow: "(resource $pdfdoc, int $textflow, float $llx, float $lly, float $urx, float $ury, string $optlist)",
            PDF_fit_textline: "(resource $pdfdoc, string $text, float $x, float $y, string $optlist)",
            PDF_get_apiname: "(resource $pdfdoc)",
            PDF_get_buffer: "(resource $p)",
            PDF_get_errmsg: "(resource $pdfdoc)",
            PDF_get_errnum: "(resource $pdfdoc)",
            PDF_get_majorversion: "(void)",
            PDF_get_minorversion: "(void)",
            PDF_get_parameter: "(resource $p, string $key, float $modifier)",
            PDF_get_pdi_parameter: "(resource $p, string $key, int $doc, int $page, int $reserved)",
            PDF_get_pdi_value: "(resource $p, string $key, int $doc, int $page, int $reserved)",
            PDF_get_value: "(resource $p, string $key, float $modifier)",
            "PDF_info-font": "(resource $pdfdoc, int $font, string $keyword, string $optlist)",
            PDF_info_matchbox: "(resource $pdfdoc, string $boxname, int $num, string $keyword)",
            PDF_info_table: "(resource $pdfdoc, int $table, string $keyword)",
            PDF_info_textflow: "(resource $pdfdoc, int $textflow, string $keyword)",
            PDF_info_textline: "(resource $pdfdoc, string $text, string $keyword, string $optlist)",
            PDF_initgraphics: "(resource $p)",
            PDF_lineto: "(resource $p, float $x, float $y)",
            PDF_load_3ddata: "(resource $pdfdoc, string $filename, string $optlist)",
            PDF_load_font: "(resource $pdfdoc, string $fontname, string $encoding, string $optlist)",
            PDF_load_iccprofile: "(resource $pdfdoc, string $profilename, string $optlist)",
            PDF_load_image: "(resource $pdfdoc, string $imagetype, string $filename, string $optlist)",
            PDF_makespotcolor: "(resource $p, string $spotname)",
            PDF_moveto: "(resource $p, float $x, float $y)",
            PDF_new: "( $)",
            PDF_open_ccitt: "(resource $pdfdoc, string $filename, int $width, int $height, int $BitReverse, int $k, int $Blackls1)",
            PDF_open_file: "(resource $p, string $filename)",
            PDF_open_image_file: "(resource $p, string $imagetype, string $filename, string $stringparam, int $intparam)",
            PDF_open_image: "(resource $p, string $imagetype, string $source, string $data, int $length, int $width, int $height, int $components, int $bpc, string $params)",
            PDF_open_memory_image: "(resource $p, resource $image)",
            PDF_open_pdi_page: "(resource $p, int $doc, int $pagenumber, string $optlist)",
            PDF_open_pdi: "(resource $pdfdoc, string $filename, string $optlist, int $len)",
            PDF_pcos_get_number: "(resource $p, int $doc, string $path)",
            PDF_pcos_get_stream: "(resource $p, int $doc, string $optlist, string $path)",
            PDF_pcos_get_string: "(resource $p, int $doc, string $path)",
            PDF_place_image: "(resource $pdfdoc, int $image, float $x, float $y, float $scale)",
            PDF_place_pdi_page: "(resource $pdfdoc, int $page, float $x, float $y, float $sx, float $sy)",
            PDF_process_pdi: "(resource $pdfdoc, int $doc, int $page, string $optlist)",
            PDF_rect: "(resource $p, float $x, float $y, float $width, float $height)",
            PDF_restore: "(resource $p)",
            PDF_resume_page: "(resource $pdfdoc, string $optlist)",
            PDF_rotate: "(resource $p, float $phi)",
            PDF_save: "(resource $p)",
            PDF_scale: "(resource $p, float $sx, float $sy)",
            PDF_set_border_color: "(resource $p, float $red, float $green, float $blue)",
            PDF_set_border_dash: "(resource $pdfdoc, float $black, float $white)",
            PDF_set_border_style: "(resource $pdfdoc, string $style, float $width)",
            PDF_setcolor: "(resource $p, string $fstype, string $colorspace, float $c1, float $c2, float $c3, float $c4)",
            PDF_setdashpattern: "(resource $pdfdoc, string $optlist)",
            PDF_setdash: "(resource $pdfdoc, float $b, float $w)",
            PDF_setflat: "(resource $pdfdoc, float $flatness)",
            PDF_setfont: "(resource $pdfdoc, int $font, float $fontsize)",
            PDF_setgray_fill: "(resource $p, float $g)",
            PDF_setgray: "(resource $p, float $g)",
            PDF_setgray_stroke: "(resource $p, float $g)",
            PDF_set_gstate: "(resource $pdfdoc, int $gstate)",
            PDF_set_info: "(resource $p, string $key, string $value)",
            PDF_set_layer_dependency: "(resource $pdfdoc, string $type, string $optlist)",
            PDF_setlinecap: "(resource $p, int $linecap)",
            PDF_setlinejoin: "(resource $p, int $value)",
            PDF_setlinewidth: "(resource $p, float $width)",
            PDF_setmatrix: "(resource $p, float $a, float $b, float $c, float $d, float $e, float $f)",
            PDF_setmiterlimit: "(resource $pdfdoc, float $miter)",
            PDF_set_parameter: "(resource $p, string $key, string $value)",
            PDF_setrgbcolor_fill: "(resource $p, float $red, float $green, float $blue)",
            PDF_setrgbcolor: "(resource $p, float $red, float $green, float $blue)",
            PDF_setrgbcolor_stroke: "(resource $p, float $red, float $green, float $blue)",
            PDF_set_text_pos: "(resource $p, float $x, float $y)",
            PDF_set_value: "(resource $p, string $key, float $value)",
            PDF_shading_pattern: "(resource $pdfdoc, int $shading, string $optlist)",
            PDF_shading: "(resource $pdfdoc, string $shtype, float $x0, float $y0, float $x1, float $y1, float $c1, float $c2, float $c3, float $c4, string $optlist)",
            PDF_shfill: "(resource $pdfdoc, int $shading)",
            PDF_show_boxed: "(resource $p, string $text, float $left, float $top, float $width, float $height, string $mode, string $feature)",
            PDF_show: "(resource $pdfdoc, string $text)",
            PDF_show_xy: "(resource $p, string $text, float $x, float $y)",
            PDF_skew: "(resource $p, float $alpha, float $beta)",
            PDF_stringwidth: "(resource $p, string $text, int $font, float $fontsize)",
            PDF_stroke: "(resource $p)",
            PDF_suspend_page: "(resource $pdfdoc, string $optlist)",
            PDF_translate: "(resource $p, float $tx, float $ty)",
            PDF_utf16_to_utf8: "(resource $pdfdoc, string $utf16string)",
            PDF_utf32_to_utf16: "(resource $pdfdoc, string $utf32string, string $ordering)",
            PDF_utf8_to_utf16: "(resource $pdfdoc, string $utf8string, string $ordering)",
            "PDO::pgsqlLOBCreate": "(void)",
            "PDO::pgsqlLOBOpen": "(string $oid [, string $mode])",
            "PDO::pgsqlLOBUnlink": "(string $oid)",
            peekAll: "(string $target [, array $properties])",
            peek: "(string $target [, array $properties])",
            pfsockopen: "(string $hostname [, int $port [, int& $errno [, string& $errstr [, float $timeout]]]])",
            pg_affected_rows: "(resource $result)",
            pg_cancel_query: "(resource $connection)",
            pg_client_encoding: "([resource $connection])",
            pg_close: "([resource $connection])",
            pg_connection_busy: "(resource $connection)",
            pg_connection_reset: "(resource $connection)",
            pg_connection_status: "(resource $connection)",
            pg_connect: "(string $connection_string [, int $connect_type])",
            pg_convert: "(resource $connection, string $table_name, array $assoc_array [, int $options])",
            pg_copy_from: "(resource $connection, string $table_name, array $rows [, string $delimiter [, string $null_as]])",
            pg_copy_to: "(resource $connection, string $table_name [, string $delimiter [, string $null_as]])",
            pg_dbname: "([resource $connection])",
            pg_delete: "(resource $connection, string $table_name, array $assoc_array [, int $options])",
            pg_end_copy: "([resource $connection])",
            pg_escape_bytea: "([resource $connection], string $data)",
            pg_escape_string: "([resource $connection], string $data)",
            pg_execute: "(resource $connection, string $stmtname, array $params)",
            pg_fetch_all_columns: "(resource $result [, int $column])",
            pg_fetch_all: "(resource $result)",
            pg_fetch_array: "(resource $result [, int $row [, int $result_type]])",
            pg_fetch_assoc: "(resource $result [, int $row])",
            pg_fetch_object: "(resource $result [, int $row [, int $result_type]])",
            pg_fetch_result: "(resource $result, int $row, mixed $field)",
            pg_fetch_row: "(resource $result [, int $row])",
            pg_field_is_null: "(resource $result, int $row, mixed $field)",
            pg_field_name: "(resource $result, int $field_number)",
            pg_field_num: "(resource $result, string $field_name)",
            pg_field_prtlen: "(resource $result, int $row_number, mixed $field_name_or_number)",
            pg_field_size: "(resource $result, int $field_number)",
            pg_field_table: "(resource $result, int $field_number [, bool $oid_only])",
            pg_field_type_oid: "(resource $result, int $field_number)",
            pg_field_type: "(resource $result, int $field_number)",
            pg_free_result: "(resource $result)",
            pg_get_notify: "(resource $connection [, int $result_type])",
            pg_get_pid: "(resource $connection)",
            pg_get_result: "([resource $connection])",
            pg_host: "([resource $connection])",
            pg_insert: "(resource $connection, string $table_name, array $assoc_array [, int $options])",
            pg_last_error: "([resource $connection])",
            pg_last_notice: "(resource $connection)",
            pg_last_oid: "(resource $result)",
            pg_lo_close: "(resource $large_object)",
            pg_lo_create: "([resource $connection [, mixed $object_id]])",
            pg_lo_export: "(resource $connection, int $oid, string $pathname)",
            pg_lo_import: "(resource $connection, string $pathname, mixed $object_id)",
            pg_lo_open: "(resource $connection, int $oid, string $mode)",
            pg_lo_read_all: "(resource $large_object)",
            pg_lo_read: "(resource $large_object [, int $len])",
            pg_lo_seek: "(resource $large_object, int $offset [, int $whence])",
            pg_lo_tell: "(resource $large_object)",
            pg_lo_unlink: "(resource $connection, int $oid)",
            pg_lo_write: "(resource $large_object, string $data [, int $len])",
            pg_meta_data: "(resource $connection, string $table_name)",
            pg_num_fields: "(resource $result)",
            pg_num_rows: "(resource $result)",
            pg_options: "([resource $connection])",
            pg_parameter_status: "(resource $connection, string $param_name)",
            pg_pconnect: "(string $connection_string [, int $connect_type])",
            pg_ping: "([resource $connection])",
            pg_port: "([resource $connection])",
            pg_prepare: "(resource $connection, string $stmtname, string $query)",
            pg_put_line: "(string $data)",
            pg_query_params: "(resource $connection, string $query, array $params)",
            pg_query: "(string $query)",
            pg_result_error_field: "(resource $result, int $fieldcode)",
            pg_result_error: "(resource $result)",
            pg_result_seek: "(resource $result, int $offset)",
            pg_result_status: "(resource $result [, int $type])",
            pg_select: "(resource $connection, string $table_name, array $assoc_array [, int $options])",
            pg_send_execute: "(resource $connection, string $stmtname, array $params)",
            pg_send_prepare: "(resource $connection, string $stmtname, string $query)",
            pg_send_query_params: "(resource $connection, string $query, array $params)",
            pg_send_query: "(resource $connection, string $query)",
            pg_set_client_encoding: "(string $encoding)",
            pg_set_error_verbosity: "(resource $connection, int $verbosity)",
            pg_trace: "(string $pathname [, string $mode [, resource $connection]])",
            pg_transaction_status: "(resource $connection)",
            pg_tty: "([resource $connection])",
            pg_unescape_bytea: "(string $data)",
            pg_untrace: "([resource $connection])",
            pg_update: "(resource $connection, string $table_name, array $data, array $condition [, int $options])",
            pg_version: "([resource $connection])",
            php_check_syntax: "(string $filename [, string& $error_message])",
            phpcredits: "([int $flag])",
            phpinfo: "([int $what])",
            php_ini_loaded_file: "(void)",
            php_ini_scanned_files: "(void)",
            php_logo_guid: "(void)",
            php_sapi_name: "(void)",
            php_strip_whitespace: "(string $filename)",
            php_uname: "([string $mode])",
            phpversion: "([string $extension])",
            pi: "(void)",
            png2wbmp: "(string $pngname, string $wbmpname, int $dest_height, int $dest_width, int $threshold)",
            popen: "(string $command, string $mode)",
            posix_access: "(string $file [, int $mode])",
            posix_ctermid: "(void)",
            posix_getcwd: "(void)",
            posix_getegid: "(void)",
            posix_geteuid: "(void)",
            posix_getgid: "(void)",
            posix_getgrgid: "(int $gid)",
            posix_getgrnam: "(string $name)",
            posix_getgroups: "(void)",
            posix_get_last_error: "(void)",
            posix_getlogin: "(void)",
            posix_getpgid: "(int $pid)",
            posix_getpgrp: "(void)",
            posix_getpid: "(void)",
            posix_getppid: "(void)",
            posix_getpwnam: "(string $username)",
            posix_getpwuid: "(int $uid)",
            posix_getrlimit: "(void)",
            posix_getsid: "(int $pid)",
            posix_getuid: "(void)",
            posix_initgroups: "(string $name, int $base_group_id)",
            posix_isatty: "(int $fd)",
            posix_kill: "(int $pid, int $sig)",
            posix_mkfifo: "(string $pathname, int $mode)",
            posix_mknod: "(string $pathname, int $mode [, int $major [, int $minor]])",
            posix_setegid: "(int $gid)",
            posix_seteuid: "(int $uid)",
            posix_setgid: "(int $gid)",
            posix_setpgid: "(int $pid, int $pgid)",
            posix_setsid: "(void)",
            posix_setuid: "(int $uid)",
            posix_strerror: "(int $errno)",
            posix_times: "(void)",
            posix_ttyname: "(int $fd)",
            posix_uname: "(void)",
            pow: "(number $base, number $exp)",
            preg_grep: "(string $pattern, array $input [, int $flags])",
            preg_last_error: "(void)",
            preg_match_all: "(string $pattern, string $subject, array& $matches [, int $flags [, int $offset]])",
            preg_match: "(string $pattern, string $subject [, array& $matches [, int $flags [, int $offset]]])",
            preg_quote: "(string $str [, string $delimiter])",
            preg_replace_callback: "(mixed $pattern, callback $callback, mixed $subject [, int $limit [, int& $count]])",
            preg_replace: "(mixed $pattern, mixed $replacement, mixed $subject [, int $limit [, int& $count]])",
            preg_split: "(string $pattern, string $subject [, int $limit [, int $flags]])",
            prev: "(array& $array)",
            printer_abort: "(resource $printer_handle)",
            printer_close: "(resource $printer_handle)",
            printer_create_brush: "(int $style, string $color)",
            printer_create_dc: "(resource $printer_handle)",
            printer_create_font: "(string $face, int $height, int $width, int $font_weight, bool $italic, bool $underline, bool $strikeout, int $orientation)",
            printer_create_pen: "(int $style, int $width, string $color)",
            printer_delete_brush: "(resource $brush_handle)",
            printer_delete_dc: "(resource $printer_handle)",
            printer_delete_font: "(resource $font_handle)",
            printer_delete_pen: "(resource $pen_handle)",
            printer_draw_bmp: "(resource $printer_handle, string $filename, int $x, int $y [, int $width], int $height)",
            printer_draw_chord: "(resource $printer_handle, int $rec_x, int $rec_y, int $rec_x1, int $rec_y1, int $rad_x, int $rad_y, int $rad_x1, int $rad_y1)",
            printer_draw_elipse: "(resource $printer_handle, int $ul_x, int $ul_y, int $lr_x, int $lr_y)",
            printer_draw_line: "(resource $printer_handle, int $from_x, int $from_y, int $to_x, int $to_y)",
            printer_draw_pie: "(resource $printer_handle, int $rec_x, int $rec_y, int $rec_x1, int $rec_y1, int $rad1_x, int $rad1_y, int $rad2_x, int $rad2_y)",
            printer_draw_rectangle: "(resource $printer_handle, int $ul_x, int $ul_y, int $lr_x, int $lr_y)",
            printer_draw_roundrect: "(resource $printer_handle, int $ul_x, int $ul_y, int $lr_x, int $lr_y, int $width, int $height)",
            printer_draw_text: "(resource $printer_handle, string $text, int $x, int $y)",
            printer_end_doc: "(resource $printer_handle)",
            printer_end_page: "(resource $printer_handle)",
            printer_get_option: "(resource $printer_handle, string $option)",
            printer_list: "(int $enumtype [, string $name [, int $level]])",
            printer_logical_fontheight: "(resource $printer_handle, int $height)",
            printer_open: "([string $printername])",
            printer_select_brush: "(resource $printer_handle, resource $brush_handle)",
            printer_select_font: "(resource $printer_handle, resource $font_handle)",
            printer_select_pen: "(resource $printer_handle, resource $pen_handle)",
            printer_set_option: "(resource $printer_handle, int $option, mixed $value)",
            printer_start_doc: "(resource $printer_handle [, string $document])",
            printer_start_page: "(resource $printer_handle)",
            printer_write: "(resource $printer_handle, string $content)",
            printf: "(string $format [, mixed $args [, mixed $...]])",
            print_r: "(mixed $expression [, bool $return])",
            print: "(string $arg)",
            proc_close: "(resource $process)",
            process: "(DomDocument $xml_doc [, array $xslt_params [, bool $is_xpath_param [, string $profile_filename]]])",
            proc_get_status: "(resource $process)",
            proc_nice: "(int $increment)",
            proc_open: "(string $cmd, array $descriptorspec, array& $pipes [, string $cwd [, array $env [, array $other_options]]])",
            proc_terminate: "(resource $process [, int $signal])",
            property_exists: "(mixed $class, string $property)",
            ps_add_bookmark: "(resource $psdoc, string $text [, int $parent [, int $open]])",
            ps_add_launchlink: "(resource $psdoc, float $llx, float $lly, float $urx, float $ury, string $filename)",
            ps_add_locallink: "(resource $psdoc, float $llx, float $lly, float $urx, float $ury, int $page, string $dest)",
            ps_add_note: "(resource $psdoc, float $llx, float $lly, float $urx, float $ury, string $contents, string $title, string $icon, int $open)",
            ps_add_pdflink: "(resource $psdoc, float $llx, float $lly, float $urx, float $ury, string $filename, int $page, string $dest)",
            ps_add_weblink: "(resource $psdoc, float $llx, float $lly, float $urx, float $ury, string $url)",
            ps_arcn: "(resource $psdoc, float $x, float $y, float $radius, float $alpha, float $beta)",
            ps_arc: "(resource $psdoc, float $x, float $y, float $radius, float $alpha, float $beta)",
            ps_begin_page: "(resource $psdoc, float $width, float $height)",
            ps_begin_pattern: "(resource $psdoc, float $width, float $height, float $xstep, float $ystep, int $painttype)",
            ps_begin_template: "(resource $psdoc, float $width, float $height)",
            ps_circle: "(resource $psdoc, float $x, float $y, float $radius)",
            ps_clip: "(resource $psdoc)",
            ps_close_image: "(resource $psdoc, int $imageid)",
            ps_closepath: "(resource $psdoc)",
            ps_closepath_stroke: "(resource $psdoc)",
            ps_close: "(resource $psdoc)",
            ps_continue_text: "(resource $psdoc, string $text)",
            ps_curveto: "(resource $psdoc, float $x1, float $y1, float $x2, float $y2, float $x3, float $y3)",
            ps_delete: "(resource $psdoc)",
            ps_end_page: "(resource $psdoc)",
            ps_end_pattern: "(resource $psdoc)",
            ps_end_template: "(resource $psdoc)",
            ps_fill: "(resource $psdoc)",
            ps_fill_stroke: "(resource $psdoc)",
            ps_findfont: "(resource $psdoc, string $fontname, string $encoding [, bool $embed])",
            ps_get_buffer: "(resource $psdoc)",
            ps_get_parameter: "(resource $psdoc, string $name [, float $modifier])",
            ps_get_value: "(resource $psdoc, string $name [, float $modifier])",
            ps_hyphenate: "(resource $psdoc, string $text)",
            ps_include_file: "(resource $psdoc, string $file)",
            ps_lineto: "(resource $psdoc, float $x, float $y)",
            ps_makespotcolor: "(resource $psdoc, string $name [, float $reserved])",
            ps_moveto: "(resource $psdoc, float $x, float $y)",
            ps_new: "(void)",
            ps_open_file: "(resource $psdoc [, string $filename])",
            ps_open_image_file: "(resource $psdoc, string $type, string $filename [, string $stringparam [, int $intparam]])",
            ps_open_image: "(resource $psdoc, string $type, string $source, string $data, int $lenght, int $width, int $height, int $components, int $bpc, string $params)",
            ps_open_memory_image: "(resource $psdoc, int $gd)",
            pspell_add_to_personal: "(int $dictionary_link, string $word)",
            pspell_add_to_session: "(int $dictionary_link, string $word)",
            pspell_check: "(int $dictionary_link, string $word)",
            pspell_clear_session: "(int $dictionary_link)",
            pspell_config_create: "(string $language [, string $spelling [, string $jargon [, string $encoding]]])",
            pspell_config_data_dir: "(int $conf, string $directory)",
            pspell_config_dict_dir: "(int $conf, string $directory)",
            pspell_config_ignore: "(int $dictionary_link, int $n)",
            pspell_config_mode: "(int $dictionary_link, int $mode)",
            pspell_config_personal: "(int $dictionary_link, string $file)",
            pspell_config_repl: "(int $dictionary_link, string $file)",
            pspell_config_runtogether: "(int $dictionary_link, bool $flag)",
            pspell_config_save_repl: "(int $dictionary_link, bool $flag)",
            pspell_new_config: "(int $config)",
            pspell_new_personal: "(string $personal, string $language [, string $spelling [, string $jargon [, string $encoding [, int $mode]]]])",
            pspell_new: "(string $language [, string $spelling [, string $jargon [, string $encoding [, int $mode]]]])",
            pspell_save_wordlist: "(int $dictionary_link)",
            pspell_store_replacement: "(int $dictionary_link, string $misspelled, string $correct)",
            pspell_suggest: "(int $dictionary_link, string $word)",
            ps_place_image: "(resource $psdoc, int $imageid, float $x, float $y, float $scale)",
            ps_rect: "(resource $psdoc, float $x, float $y, float $width, float $height)",
            ps_restore: "(resource $psdoc)",
            ps_rotate: "(resource $psdoc, float $rot)",
            ps_save: "(resource $psdoc)",
            ps_scale: "(resource $psdoc, float $x, float $y)",
            ps_set_border_color: "(resource $psdoc, float $red, float $green, float $blue)",
            ps_set_border_dash: "(resource $psdoc, float $black, float $white)",
            ps_set_border_style: "(resource $psdoc, string $style, float $width)",
            ps_setcolor: "(resource $psdoc, string $type, string $colorspace, float $c1, float $c2, float $c3, float $c4)",
            ps_setdash: "(resource $psdoc, float $on, float $off)",
            ps_setflat: "(resource $psdoc, float $value)",
            ps_setfont: "(resource $psdoc, int $fontid, float $size)",
            ps_setgray: "(resource $psdoc, float $gray)",
            ps_set_info: "(resource $p, string $key, string $val)",
            ps_setlinecap: "(resource $psdoc, int $type)",
            ps_setlinejoin: "(resource $psdoc, int $type)",
            ps_setlinewidth: "(resource $psdoc, float $width)",
            ps_setmiterlimit: "(resource $psdoc, float $value)",
            ps_setoverprintmode: "(resource $psdoc, int $mode)",
            ps_set_parameter: "(resource $psdoc, string $name, string $value)",
            ps_setpolydash: "(resource $psdoc, float $arr)",
            ps_set_text_pos: "(resource $psdoc, float $x, float $y)",
            ps_set_value: "(resource $psdoc, string $name, float $value)",
            ps_shading_pattern: "(resource $psdoc, int $shadingid, string $optlist)",
            ps_shading: "(resource $psdoc, string $type, float $x0, float $y0, float $x1, float $y1, float $c1, float $c2, float $c3, float $c4, string $optlist)",
            ps_shfill: "(resource $psdoc, int $shadingid)",
            ps_show2: "(resource $psdoc, string $text, int $len)",
            ps_show_boxed: "(resource $psdoc, string $text, float $left, float $bottom, float $width, float $height, string $hmode [, string $feature])",
            ps_show: "(resource $psdoc, string $text)",
            ps_show_xy2: "(resource $psdoc, string $text, int $len, float $xcoor, float $ycoor)",
            ps_show_xy: "(resource $psdoc, string $text, float $x, float $y)",
            ps_string_geometry: "(resource $psdoc, string $text [, int $fontid [, float $size]])",
            ps_stringwidth: "(resource $psdoc, string $text [, int $fontid [, float $size]])",
            ps_stroke: "(resource $psdoc)",
            ps_symbol_name: "(resource $psdoc, int $ord [, int $fontid])",
            ps_symbol: "(resource $psdoc, int $ord)",
            ps_symbol_width: "(resource $psdoc, int $ord [, int $fontid [, float $size]])",
            ps_translate: "(resource $psdoc, float $x, float $y)",
            public_id: "(void)",
            putenv: "(string $setting)",
            px_close: "(resource $pxdoc)",
            px_create_fp: "(resource $pxdoc, resource $file, array $fielddesc)",
            px_date2string: "(resource $pxdoc, int $value, string $format)",
            px_delete_record: "(resource $pxdoc, int $num)",
            px_delete: "(resource $pxdoc)",
            px_get_field: "(resource $pxdoc, int $fieldno)",
            px_get_info: "(resource $pxdoc)",
            px_get_parameter: "(resource $pxdoc, string $name)",
            px_get_record: "(resource $pxdoc, int $num [, int $mode])",
            px_get_schema: "(resource $pxdoc [, int $mode])",
            px_get_value: "(resource $pxdoc, string $name)",
            px_insert_record: "(resource $pxdoc, array $data)",
            px_new: "(void)",
            px_numfields: "(resource $pxdoc)",
            px_numrecords: "(resource $pxdoc)",
            px_open_fp: "(resource $pxdoc, resource $file)",
            px_put_record: "(resource $pxdoc, array $record [, int $recpos])",
            px_retrieve_record: "(resource $pxdoc, int $num [, int $mode])",
            px_set_blob_file: "(resource $pxdoc, string $filename)",
            px_set_parameter: "(resource $pxdoc, string $name, string $value)",
            px_set_tablename: "(resource $pxdoc, string $name)",
            px_set_targetencoding: "(resource $pxdoc, string $encoding)",
            px_set_value: "(resource $pxdoc, string $name, float $value)",
            px_timestamp2string: "(resource $pxdoc, float $value, string $format)",
            px_update_record: "(resource $pxdoc, array $data, int $num)",
            qdom_error: "(void)",
            qdom_tree: "(string $doc)",
            quoted_printable_decode: "(string $str)",
            quotemeta: "(string $str)",
            rad2deg: "(float $number)",
            radius_acct_open: "(void)",
            radius_add_server: "(resource $radius_handle, string $hostname, int $port, string $secret, int $timeout, int $max_tries)",
            radius_auth_open: "(void)",
            radius_close: "(resource $radius_handle)",
            radius_config: "(resource $radius_handle, string $file)",
            radius_create_request: "(resource $radius_handle, int $type)",
            radius_cvt_addr: "(string $data)",
            radius_cvt_int: "(string $data)",
            radius_cvt_string: "(string $data)",
            radius_demangle_mppe_key: "(resource $radius_handle, string $mangled)",
            radius_demangle: "(resource $radius_handle, string $mangled)",
            radius_get_attr: "(resource $radius_handle)",
            radius_get_vendor_attr: "(string $data)",
            radius_put_addr: "(resource $radius_handle, int $type, string $addr)",
            radius_put_attr: "(resource $radius_handle, int $type, string $value)",
            radius_put_int: "(resource $radius_handle, int $type, int $value)",
            radius_put_string: "(resource $radius_handle, int $type, string $value)",
            radius_put_vendor_addr: "(resource $radius_handle, int $vendor, int $type, string $addr)",
            radius_put_vendor_attr: "(resource $radius_handle, int $vendor, int $type, string $value)",
            radius_put_vendor_int: "(resource $radius_handle, int $vendor, int $type, int $value)",
            radius_put_vendor_string: "(resource $radius_handle, int $vendor, int $type, string $value)",
            radius_request_authenticator: "(resource $radius_handle)",
            radius_send_request: "(resource $radius_handle)",
            radius_server_secret: "(resource $radius_handle)",
            radius_strerror: "(resource $radius_handle)",
            rand: "(void)",
            range: "(mixed $low, mixed $high [, number $step])",
            rar_close: "(resource $rar_file)",
            rar_entry_get: "(resource $rar_file, string $entry_name)",
            rar_list: "(resource $rar_file)",
            rar_open: "(string $filename [, string $password])",
            rawurldecode: "(string $str)",
            rawurlencode: "(string $str)",
            readdir: "(resource $dir_handle)",
            readfile: "(string $filename [, bool $use_include_path [, resource $context]])",
            readgzfile: "(string $filename [, int $use_include_path])",
            read: "(int $length)|(string $buffer, int $len)",
            readline_add_history: "(string $line)",
            readline_callback_handler_install: "(string $prompt, callback $callback)",
            readline_callback_handler_remove: "(void)",
            readline_callback_read_char: "(void)",
            readline_clear_history: "(void)",
            readline_completion_function: "(callback $function)",
            readline_info: "([string $varname [, string $newvalue]])",
            readline_list_history: "(void)",
            readline_on_new_line: "(void)",
            readline_read_history: "([string $filename])",
            readline_redisplay: "(void)",
            readline: "([string $prompt])",
            readline_write_history: "([string $filename])",
            readlink: "(string $path)",
            realpath: "(string $path)",
            reason: "(void)",
            receive: "(string $target [, array $properties])",
            recode_file: "(string $request, resource $input, resource $output)",
            recode_string: "(string $request, string $string)",
            register_shutdown_function: "(callback $function [, mixed $parameter [, mixed $...]])",
            register_tick_function: "(callback $function [, mixed $arg [, mixed $...]])",
            registerXPathNamespace: "(string $prefix, string $ns)",
            remove_attribute: "(string $name)",
            remove: "(array $parameter)|(object $instance)|(string $name)|(string $target [, array $properties])|(void)",
            rename_function: "(string $original_name, string $new_name)",
            rename: "(string $oldname, string $newname [, resource $context])",
            replace: "(array $parameter)",
            reset: "(array& $array)",
            restore_error_handler: "(void)",
            restore_exception_handler: "(void)",
            restore_include_path: "(void)",
            result_dump_file: "(DomDocument $xmldoc, string $filename)",
            result_dump_mem: "(DomDocument $xmldoc)",
            rewinddir: "(resource $dir_handle)",
            rewind: "(resource $handle)",
            rmdir: "(string $dirname [, resource $context])",
            rollback: "(void)",
            rotate: "(float $angle)",
            rotateTo: "(float $angle)",
            round: "(float $val [, int $precision])",
            rpm_close: "(resource $rpmr)",
            rpm_get_tag: "(resource $rpmr, int $tagnum)",
            rpm_is_valid: "(string $filename)",
            rpm_open: "(string $filename)",
            rpm_version: "(void)",
            rsort: "(array& $array [, int $sort_flags])",
            rtrim: "(string $str [, string $charlist])",
            runkit_class_adopt: "(string $classname, string $parentname)",
            runkit_class_emancipate: "(string $classname)",
            runkit_constant_add: "(string $constname, mixed $value)",
            runkit_constant_redefine: "(string $constname, mixed $newvalue)",
            runkit_constant_remove: "(string $constname)",
            runkit_function_add: "(string $funcname, string $arglist, string $code)",
            runkit_function_copy: "(string $funcname, string $targetname)",
            runkit_function_redefine: "(string $funcname, string $arglist, string $code)",
            runkit_function_remove: "(string $funcname)",
            runkit_function_rename: "(string $funcname, string $newname)",
            runkit_import: "(string $filename [, int $flags])",
            runkit_lint_file: "(string $filename)",
            runkit_lint: "(string $code)",
            runkit_method_add: "(string $classname, string $methodname, string $args, string $code [, int $flags])",
            runkit_method_copy: "(string $dClass, string $dMethod, string $sClass [, string $sMethod])",
            runkit_method_redefine: "(string $classname, string $methodname, string $args, string $code [, int $flags])",
            runkit_method_remove: "(string $classname, string $methodname)",
            runkit_method_rename: "(string $classname, string $methodname, string $newname)",
            runkit_return_value_used: "(void)",
            runkit_sandbox_output_handler: "(object $sandbox [, mixed $callback])",
            runkit_superglobals: "(void)",
            save: "(string $data [, int $offset])|(string $filename [, int $compression])",
            saveToFile: "(stream $x [, int $compression])",
            "SCA::createDataObject": "(string $type_namespace_uri, string $type_name)",
            "SCA::getService": "(string $target [, string $binding [, array $config]])",
            scale: "(int $dx, int $dy)",
            scaleTo: "(int $x [, int $y])",
            "SCA_LocalProxy::createDataObject": "(string $type_namespace_uri, string $type_name)",
            scandir: "(string $directory [, int $sorting_order [, resource $context]])",
            "SCA_SoapProxy::createDataObject": "(string $type_namespace_uri, string $type_name)",
            "SDO_DAS_ChangeSummary::beginLogging": "(void)",
            "SDO_DAS_ChangeSummary::endLogging": "(void)",
            "SDO_DAS_ChangeSummary::getChangedDataObjects": "(void)",
            "SDO_DAS_ChangeSummary::getChangeType": "(SDO_DataObject $dataObject)",
            "SDO_DAS_ChangeSummary::getOldContainer": "(SDO_DataObject $data_object)",
            "SDO_DAS_ChangeSummary::getOldValues": "(SDO_DataObject $data_object)",
            "SDO_DAS_ChangeSummary::isLogging": "(void)",
            "SDO_DAS_DataFactory::addPropertyToType": "(string $parent_type_namespace_uri, string $parent_type_name, string $property_name, string $type_namespace_uri, string $type_name [, array $options])",
            "SDO_DAS_DataFactory::addType": "(string $type_namespace_uri, string $type_name [, array $options])",
            "SDO_DAS_DataFactory::getDataFactory": "(void)",
            "SDO_DAS_DataObject::getChangeSummary": "(void)",
            "SDO_DAS_Relational::applyChanges": "(PDO $database_handle, SDODataObject $root_data_object)",
            "SDO_DAS_Relational::__construct": "(array $database_metadata [, string $application_root_type [, array $SDO_containment_references_metadata]])",
            "SDO_DAS_Relational::createRootDataObject": "(void)",
            "SDO_DAS_Relational::executePreparedQuery": "(PDO $database_handle, PDOStatement $prepared_statement, array $value_list [, array $column_specifier])",
            "SDO_DAS_Relational::executeQuery": "(PDO $database_handle, string $SQL_statement [, array $column_specifier])",
            "SDO_DAS_Setting::getListIndex": "(void)",
            "SDO_DAS_Setting::getPropertyIndex": "(void)",
            "SDO_DAS_Setting::getPropertyName": "(void)",
            "SDO_DAS_Setting::getValue": "(void)",
            "SDO_DAS_Setting::isSet": "(void)",
            "SDO_DAS_XML::addTypes": "(string $xsd_file)",
            "SDO_DAS_XML::createDataObject": "(string $namespace_uri, string $type_name)",
            "SDO_DAS_XML::createDocument": "([string $document_element_name])",
            "SDO_DAS_XML::create": "([mixed $xsd_file [, string $key]])",
            "SDO_DAS_XML_Document::getRootDataObject": "(void)",
            "SDO_DAS_XML_Document::getRootElementName": "(void)",
            "SDO_DAS_XML_Document::getRootElementURI": "(void)",
            "SDO_DAS_XML_Document::setEncoding": "(string $encoding)",
            "SDO_DAS_XML_Document::setXMLDeclaration": "(bool $xmlDeclatation)",
            "SDO_DAS_XML_Document::setXMLVersion": "(string $xmlVersion)",
            "SDO_DAS_XML::loadFile": "(string $xml_file)",
            "SDO_DAS_XML::loadString": "(string $xml_string)",
            "SDO_DAS_XML::saveFile": "(SDO_XMLDocument $xdoc, string $xml_file [, int $indent])",
            "SDO_DAS_XML::saveString": "(SDO_XMLDocument $xdoc [, int $indent])",
            "SDO_DataFactory::create": "(string $type_namespace_uri, string $type_name)",
            "SDO_DataObject::clear": "(void)",
            "SDO_DataObject::createDataObject": "(mixed $identifier)",
            "SDO_DataObject::getContainer": "(void)",
            "SDO_DataObject::getSequence": "(void)",
            "SDO_DataObject::getTypeNamespaceURI": "(void)",
            "SDO_DataObject::getTypeName": "(void)",
            "SDO_Exception::getCause": "(void)",
            "SDO_List::insert": "(mixed $value [, int $index])",
            "SDO_Model_Property::getContainingType": "(void)",
            "SDO_Model_Property::getDefault": "(void)",
            "SDO_Model_Property::getName": "(void)",
            "SDO_Model_Property::getType": "(void)",
            "SDO_Model_Property::isContainment": "(void)",
            "SDO_Model_Property::isMany": "(void)",
            "SDO_Model_ReflectionDataObject::__construct": "(SDO_DataObject $data_object)",
            "SDO_Model_ReflectionDataObject::export": "(SDO_Model_ReflectionDataObject $rdo [, bool $return])",
            "SDO_Model_ReflectionDataObject::getContainmentProperty": "(void)",
            "SDO_Model_ReflectionDataObject::getInstanceProperties": "(void)",
            "SDO_Model_ReflectionDataObject::getType": "(void)",
            "SDO_Model_Type::getBaseType": "(void)",
            "SDO_Model_Type::getNamespaceURI": "(void)",
            "SDO_Model_Type::getName": "(void)",
            "SDO_Model_Type::getProperties": "(void)",
            "SDO_Model_Type::getProperty": "(mixed $identifier)",
            "SDO_Model_Type::isAbstractType": "(void)",
            "SDO_Model_Type::isDataType": "(void)",
            "SDO_Model_Type::isInstance": "(SDO_DataObject $data_object)",
            "SDO_Model_Type::isOpenType": "(void)",
            "SDO_Model_Type::isSequencedType": "(void)",
            "SDO_Sequence::getProperty": "(int $sequence_index)",
            "SDO_Sequence::insert": "(mixed $value [, int $sequenceIndex [, mixed $propertyIdentifier]])",
            "SDO_Sequence::move": "(int $toIndex, int $fromIndex)",
            seek: "(int $offset [, int $whence])",
            sem_acquire: "(resource $sem_identifier)",
            sem_get: "(int $key [, int $max_acquire [, int $perm [, int $auto_release]]])",
            sem_release: "(resource $sem_identifier)",
            sem_remove: "(resource $sem_identifier)",
            send: "(bool $switch)|(string $target, SAMMessage $msg [, array $properties])",
            serialize: "(mixed $value)",
            session_cache_expire: "([int $new_cache_expire])",
            session_cache_limiter: "([string $cache_limiter])",
            session_decode: "(string $data)",
            session_destroy: "(void)",
            session_encode: "(void)",
            session_get_cookie_params: "(void)",
            session_id: "([string $id])",
            session_is_registered: "(string $name)",
            session_module_name: "([string $module])",
            session_name: "([string $name])",
            session_pgsql_add_error: "(int $error_level [, string $error_message])",
            session_pgsql_get_error: "([bool $with_error_message])",
            session_pgsql_get_field: "(void)",
            session_pgsql_reset: "(void)",
            session_pgsql_set_field: "(string $value)",
            session_pgsql_status: "(void)",
            session_regenerate_id: "([bool $delete_old_session])",
            session_register: "(mixed $name [, mixed $...])",
            session_save_path: "([string $path])",
            session_set_cookie_params: "(int $lifetime [, string $path [, string $domain [, bool $secure [, bool $httponly]]]])",
            session_set_save_handler: "(callback $open, callback $close, callback $read, callback $write, callback $destroy, callback $gc)",
            session_start: "(void)",
            session_unregister: "(string $name)",
            session_unset: "(void)",
            session_write_close: "(void)",
            setAction: "(SWFAction $action)",
            set_attribute_node: "(DomNode $attr)",
            set_attribute: "(string $name, string $value)",
            setbackground: "(int $red, int $green, int $blue)",
            setBounds: "(int $width, int $height)",
            setBuffering: "(bool $on_off)",
            setClass: "(string $class_name [, mixed $args [, mixed $...]])",
            setColor: "(int $red, int $green, int $blue [, int $a])",
            setcommittedversion: "(array $parameter)",
            __setCookie: "(string $name [, string $value])",
            setcookie: "(string $name [, string $value [, int $expire [, string $path [, string $domain [, bool $secure [, bool $httponly]]]]]])",
            setDepth: "(float $depth)",
            setDimension: "(int $width, int $height)",
            setDown: "(SWFShape $shape)",
            set_error_handler: "(callback $error_handler [, int $error_types])",
            set_exception_handler: "(callback $exception_handler)",
            setFont: "(string $font)",
            setFrames: "(int $number)",
            setHeight: "(int $height)",
            setHit: "(SWFShape $shape)",
            set_include_path: "(string $new_include_path)",
            setIndentation: "(int $width)",
            setIndent: "(bool $indent)",
            setIndentString: "(string $indentString)",
            setLeftFill: "(SWFGradient $fill)",
            setLeftMargin: "(int $width)",
            setLineSpacing: "(int $height)",
            setLine: "(SWFShape $shape)",
            setlocale: "(int $category, string $locale [, string $...])",
            set_magic_quotes_runtime: "(int $new_setting)",
            setMargins: "(int $left, int $right)",
            setMaskLevel: "(int $level)",
            setMatrix: "(float $a, float $b, float $c, float $d, float $x, float $y)",
            setMenu: "(int $flag)",
            setName: "(string $name)",
            setOver: "(SWFShape $shape)",
            setPadding: "(float $padding)",
            setPersistence: "(int $mode)",
            setRate: "(int $rate)",
            setRatio: "(float $ratio)",
            setrawcookie: "(string $name [, string $value [, int $expire [, string $path [, string $domain [, bool $secure [, bool $httponly]]]]]])",
            setRightFill: "(SWFGradient $fill)",
            setRightMargin: "(int $width)",
            setSpacing: "(float $spacing)",
            set_time_limit: "(int $seconds)",
            settype: "(mixed& $var, string $type)",
            setUp: "(SWFShape $shape)",
            set_value: "(string $content)",
            sha1_file: "(string $filename [, bool $raw_output])",
            sha1: "(string $str [, bool $raw_output])",
            shell_exec: "(string $cmd)",
            shm_attach: "(int $key [, int $memsize [, int $perm]])",
            shm_detach: "(int $shm_identifier)",
            shm_get_var: "(int $shm_identifier, int $variable_key)",
            shmop_close: "(int $shmid)",
            shmop_delete: "(int $shmid)",
            shmop_open: "(int $key, string $flags, int $mode, int $size)",
            shmop_read: "(int $shmid, int $start, int $count)",
            shmop_size: "(int $shmid)",
            shmop_write: "(int $shmid, string $data, int $offset)",
            shm_put_var: "(int $shm_identifier, int $variable_key, mixed $variable)",
            shm_remove: "(int $shm_identifier)",
            shm_remove_var: "(int $shm_identifier, int $variable_key)",
            shuffle: "(array& $array)",
            similar_text: "(string $first, string $second [, float& $percent])",
            simplexml_import_dom: "(DOMNode $node [, string $class_name])",
            simplexml_load_file: "(string $filename [, string $class_name [, int $options [, string $ns [, bool $is_prefix]]]])",
            simplexml_load_string: "(string $data [, string $class_name [, int $options [, string $ns [, bool $is_prefix]]]])",
            sin: "(float $arg)",
            sinh: "(float $arg)",
            size: "(void)",
            skewX: "(float $ddegrees)",
            skewXTo: "(float $degrees)",
            skewY: "(float $ddegrees)",
            skewYTo: "(float $degrees)",
            sleep: "(int $seconds)",
            snmpgetnext: "(string $host, string $community, string $object_id [, int $timeout [, int $retries]])",
            snmp_get_quick_print: "(void)",
            snmpget: "(string $hostname, string $community, string $object_id [, int $timeout [, int $retries]])",
            snmp_get_valueretrieval: "(void)",
            snmp_read_mib: "(string $filename)",
            snmprealwalk: "(string $host, string $community, string $object_id [, int $timeout [, int $retries]])",
            snmp_set_enum_print: "(int $enum_print)",
            snmp_set_oid_numeric_print: "(int $oid_numeric_print)",
            snmp_set_oid_output_format: "(int $oid_format)",
            snmp_set_quick_print: "(bool $quick_print)",
            snmpset: "(string $hostname, string $community, string $object_id, string $type, mixed $value [, int $timeout [, int $retries]])",
            snmp_set_valueretrieval: "(int $method)",
            snmpwalkoid: "(string $hostname, string $community, string $object_id [, int $timeout [, int $retries]])",
            snmpwalk: "(string $hostname, string $community, string $object_id [, int $timeout [, int $retries]])",
            __soapCall: "(string $function_name, array $arguments [, array $options [, mixed $input_headers [, array& $output_headers]]])",
            socket_accept: "(resource $socket)",
            socket_bind: "(resource $socket, string $address [, int $port])",
            socket_clear_error: "([resource $socket])",
            socket_close: "(resource $socket)",
            socket_connect: "(resource $socket, string $address [, int $port])",
            socket_create: "(int $domain, int $type, int $protocol)",
            socket_create_listen: "(int $port [, int $backlog])",
            socket_create_pair: "(int $domain, int $type, int $protocol, array& $fd)",
            socket_get_option: "(resource $socket, int $level, int $optname)",
            socket_getpeername: "(resource $socket, string& $address [, int& $port])",
            socket_getsockname: "(resource $socket, string& $addr [, int& $port])",
            socket_last_error: "([resource $socket])",
            socket_listen: "(resource $socket [, int $backlog])",
            socket_read: "(resource $socket, int $length [, int $type])",
            socket_recvfrom: "(resource $socket, string& $buf, int $len, int $flags, string& $name [, int& $port])",
            socket_recv: "(resource $socket, string& $buf, int $len, int $flags)",
            socket_select: "(array& $read, array& $write, array& $except, int $tv_sec [, int $tv_usec])",
            socket_send: "(resource $socket, string $buf, int $len, int $flags)",
            socket_sendto: "(resource $socket, string $buf, int $len, int $flags, string $addr [, int $port])",
            socket_set_block: "(resource $socket)",
            socket_set_nonblock: "(resource $socket)",
            socket_set_option: "(resource $socket, int $level, int $optname, mixed $optval)",
            socket_shutdown: "(resource $socket [, int $how])",
            socket_strerror: "(int $errno)",
            socket_write: "(resource $socket, string $buffer [, int $length])",
            sort: "(array& $array [, int $sort_flags])",
            soundex: "(string $str)",
            specified: "(void)",
            spl_autoload_call: "(string $class_name)",
            spl_autoload_extensions: "([string $file_extensions])",
            spl_autoload_functions: "(void)",
            spl_autoload_register: "([callback $autoload_function])",
            spl_autoload: "(string $class_name [, string $file_extensions])",
            spl_autoload_unregister: "(mixed $autoload_function)",
            spl_classes: "(void)",
            spliti: "(string $pattern, string $string [, int $limit])",
            split: "(string $pattern, string $string [, int $limit])",
            spl_object_hash: "(object $obj)",
            sprintf: "(string $format [, mixed $args [, mixed $...]])",
            sqlite_array_query: "(resource $dbhandle, string $query [, int $result_type [, bool $decode_binary]])",
            sqlite_busy_timeout: "(resource $dbhandle, int $milliseconds)",
            sqlite_changes: "(resource $dbhandle)",
            sqlite_close: "(resource $dbhandle)",
            sqlite_column: "(resource $result, mixed $index_or_name [, bool $decode_binary])",
            sqlite_create_aggregate: "(resource $dbhandle, string $function_name, callback $step_func, callback $finalize_func [, int $num_args])",
            sqliteCreateAggregate: "(string $function_name, callback $step_func, callback $finalize_func [, int $num_args])",
            sqlite_create_function: "(resource $dbhandle, string $function_name, callback $callback [, int $num_args])",
            sqliteCreateFunction: "(string $function_name, callback $callback [, int $num_args])",
            sqlite_current: "(resource $result [, int $result_type [, bool $decode_binary]])",
            sqlite_error_string: "(int $error_code)",
            sqlite_escape_string: "(string $item)",
            sqlite_exec: "(resource $dbhandle, string $query [, string& $error_msg])",
            sqlite_factory: "(string $filename [, int $mode [, string& $error_message]])",
            sqlite_fetch_all: "(resource $result [, int $result_type [, bool $decode_binary]])",
            sqlite_fetch_array: "(resource $result [, int $result_type [, bool $decode_binary]])",
            sqlite_fetch_column_types: "(string $table_name, resource $dbhandle [, int $result_type])",
            sqlite_fetch_object: "(resource $result [, string $class_name [, array $ctor_params [, bool $decode_binary]]])",
            sqlite_fetch_single: "(resource $result [, bool $decode_binary])",
            sqlite_field_name: "(resource $result, int $field_index)",
            sqlite_has_more: "(resource $result)",
            sqlite_has_prev: "(resource $result)",
            sqlite_key: "(resource $result)",
            sqlite_last_error: "(resource $dbhandle)",
            sqlite_last_insert_rowid: "(resource $dbhandle)",
            sqlite_libencoding: "(void)",
            sqlite_libversion: "(void)",
            sqlite_next: "(resource $result)",
            sqlite_num_fields: "(resource $result)",
            sqlite_num_rows: "(resource $result)",
            sqlite_open: "(string $filename [, int $mode [, string& $error_message]])",
            sqlite_popen: "(string $filename [, int $mode [, string& $error_message]])",
            sqlite_prev: "(resource $result)",
            sqlite_query: "(resource $dbhandle, string $query [, int $result_type [, string& $error_msg]])",
            sqlite_rewind: "(resource $result)",
            sqlite_seek: "(resource $result, int $rownum)",
            sqlite_single_query: "(resource $db, string $query [, bool $first_row_only [, bool $decode_binary]])",
            sqlite_udf_decode_binary: "(string $data)",
            sqlite_udf_encode_binary: "(string $data)",
            sqlite_unbuffered_query: "(resource $dbhandle, string $query [, int $result_type [, string& $error_msg]])",
            sqlite_valid: "(resource $result)",
            sql_regcase: "(string $string)",
            sqrt: "(float $arg)",
            srand: "([int $seed])",
            srcanchors: "(array $parameter)",
            srcsofdst: "(array $parameter)",
            sscanf: "(string $str, string $format [, mixed& $...])",
            ssh2_auth_hostbased_file: "(resource $session, string $username, string $hostname, string $pubkeyfile, string $privkeyfile [, string $passphrase [, string $local_username]])",
            ssh2_auth_none: "(resource $session, string $username)",
            ssh2_auth_password: "(resource $session, string $username, string $password)",
            ssh2_auth_pubkey_file: "(resource $session, string $username, string $pubkeyfile, string $privkeyfile [, string $passphrase])",
            ssh2_connect: "(string $host [, int $port [, array $methods [, array $callbacks]]])",
            ssh2_exec: "(resource $session, string $command [, string $pty [, array $env [, int $width [, int $height [, int $width_height_type]]]]])",
            ssh2_fetch_stream: "(resource $channel, int $streamid)",
            ssh2_fingerprint: "(resource $session [, int $flags])",
            ssh2_methods_negotiated: "(resource $session)",
            ssh2_publickey_add: "(resource $pkey, string $algoname, string $blob [, bool $overwrite [, array $attributes]])",
            ssh2_publickey_init: "(resource $session)",
            ssh2_publickey_list: "(resource $pkey)",
            ssh2_publickey_remove: "(resource $pkey, string $algoname, string $blob)",
            ssh2_scp_recv: "(resource $session, string $remote_file, string $local_file)",
            ssh2_scp_send: "(resource $session, string $local_file, string $remote_file [, int $create_mode])",
            ssh2_sftp_lstat: "(resource $sftp, string $path)",
            ssh2_sftp_mkdir: "(resource $sftp, string $dirname [, int $mode [, bool $recursive]])",
            ssh2_sftp_readlink: "(resource $sftp, string $link)",
            ssh2_sftp_realpath: "(resource $sftp, string $filename)",
            ssh2_sftp_rename: "(resource $sftp, string $from, string $to)",
            ssh2_sftp: "(resource $session)",
            ssh2_sftp_rmdir: "(resource $sftp, string $dirname)",
            ssh2_sftp_stat: "(resource $sftp, string $path)",
            ssh2_sftp_symlink: "(resource $sftp, string $target, string $link)",
            ssh2_sftp_unlink: "(resource $sftp, string $filename)",
            ssh2_shell: "(resource $session [, string $term_type [, array $env [, int $width [, int $height [, int $width_height_type]]]]])",
            ssh2_tunnel: "(resource $session, string $host, int $port)",
            startAttributeNS: "(string $prefix, string $name, string $uri)",
            startAttribute: "(string $name)",
            startCData: "(void)",
            startComment: "(void)",
            startDocument: "([string $version [, string $encoding [, string $standalone]]])",
            startDTDAttlist: "(string $name)",
            startDTDElement: "(string $qualifiedName)",
            startDTDEntity: "(string $name, bool $isparam)",
            startDTD: "(string $qualifiedName [, string $publicId [, string $systemId]])",
            startElementNS: "(string $prefix, string $name, string $uri)",
            startElement: "(string $name)",
            startPI: "(string $target)",
            startSound: "(SWFSound $sound)",
            stats_absolute_deviation: "(array $a)",
            stats_cdf_beta: "(float $par1, float $par2, float $par3, int $which)",
            stats_cdf_binomial: "(float $par1, float $par2, float $par3, int $which)",
            stats_cdf_cauchy: "(float $par1, float $par2, float $par3, int $which)",
            stats_cdf_chisquare: "(float $par1, float $par2, int $which)",
            stats_cdf_exponential: "(float $par1, float $par2, int $which)",
            stats_cdf_f: "(float $par1, float $par2, float $par3, int $which)",
            stats_cdf_gamma: "(float $par1, float $par2, float $par3, int $which)",
            stats_cdf_laplace: "(float $par1, float $par2, float $par3, int $which)",
            stats_cdf_logistic: "(float $par1, float $par2, float $par3, int $which)",
            stats_cdf_negative_binomial: "(float $par1, float $par2, float $par3, int $which)",
            stats_cdf_noncentral_chisquare: "(float $par1, float $par2, float $par3, int $which)",
            stats_cdf_noncentral_f: "(float $par1, float $par2, float $par3, float $par4, int $which)",
            stats_cdf_poisson: "(float $par1, float $par2, int $which)",
            stats_cdf_t: "(float $par1, float $par2, int $which)",
            stats_cdf_uniform: "(float $par1, float $par2, float $par3, int $which)",
            stats_cdf_weibull: "(float $par1, float $par2, float $par3, int $which)",
            stats_covariance: "(array $a, array $b)",
            stats_dens_beta: "(float $x, float $a, float $b)",
            stats_dens_cauchy: "(float $x, float $ave, float $stdev)",
            stats_dens_chisquare: "(float $x, float $dfr)",
            stats_dens_exponential: "(float $x, float $scale)",
            stats_dens_f: "(float $x, float $dfr1, float $dfr2)",
            stats_dens_gamma: "(float $x, float $shape, float $scale)",
            stats_dens_laplace: "(float $x, float $ave, float $stdev)",
            stats_dens_logistic: "(float $x, float $ave, float $stdev)",
            stats_dens_negative_binomial: "(float $x, float $n, float $pi)",
            stats_dens_normal: "(float $x, float $ave, float $stdev)",
            stats_dens_pmf_binomial: "(float $x, float $n, float $pi)",
            stats_dens_pmf_hypergeometric: "(float $n1, float $n2, float $N1, float $N2)",
            stats_dens_pmf_poisson: "(float $x, float $lb)",
            stats_dens_t: "(float $x, float $dfr)",
            stats_dens_weibull: "(float $x, float $a, float $b)",
            stats_den_uniform: "(float $x, float $a, float $b)",
            stats_harmonic_mean: "(array $a)",
            stats_kurtosis: "(array $a)",
            stats_rand_gen_beta: "(float $a, float $b)",
            stats_rand_gen_chisquare: "(float $df)",
            stats_rand_gen_exponential: "(float $av)",
            stats_rand_gen_f: "(float $dfn, float $dfd)",
            stats_rand_gen_funiform: "(float $low, float $high)",
            stats_rand_gen_gamma: "(float $a, float $r)",
            stats_rand_gen_ibinomial: "(int $n, float $pp)",
            stats_rand_gen_ibinomial_negative: "(int $n, float $p)",
            stats_rand_gen_int: "(void)",
            stats_rand_gen_ipoisson: "(float $mu)",
            stats_rand_gen_iuniform: "(int $low, int $high)",
            stats_rand_gen_noncenral_chisquare: "(float $df, float $xnonc)",
            stats_rand_gen_noncentral_f: "(float $dfn, float $dfd, float $xnonc)",
            stats_rand_gen_noncentral_t: "(float $df, float $xnonc)",
            stats_rand_gen_normal: "(float $av, float $sd)",
            stats_rand_gen_t: "(float $df)",
            stats_rand_get_seeds: "(void)",
            stats_rand_phrase_to_seeds: "(string $phrase)",
            stats_rand_ranf: "(void)",
            stats_rand_setall: "(int $iseed1, int $iseed2)",
            stats_skew: "(array $a)",
            stats_standard_deviation: "(array $a [, bool $sample])",
            stats_stat_binomial_coef: "(int $x, int $n)",
            stats_stat_correlation: "(array $arr1, array $arr2)",
            stats_stat_gennch: "(int $n)",
            stats_stat_independent_t: "(array $arr1, array $arr2)",
            stats_stat_innerproduct: "(array $arr1, array $arr2)",
            stats_stat_noncentral_t: "(float $par1, float $par2, float $par3, int $which)",
            stats_stat_paired_t: "(array $arr1, array $arr2)",
            stats_stat_percentile: "(float $df, float $xnonc)",
            stats_stat_powersum: "(array $arr, float $power)",
            stat: "(string $filename)",
            stats_variance: "(array $a [, bool $sample])",
            stopSound: "(SWFSound $sound)",
            strcasecmp: "(string $str1, string $str2)",
            strcmp: "(string $str1, string $str2)",
            strcoll: "(string $str1, string $str2)",
            strcspn: "(string $str1, string $str2 [, int $start [, int $length]])",
            stream_bucket_append: "(resource $brigade, resource $bucket)",
            stream_bucket_make_writeable: "(resource $brigade)",
            stream_bucket_new: "(resource $stream, string $buffer)",
            stream_bucket_prepend: "(resource $brigade, resource $bucket)",
            stream_context_create: "([array $options [, array $params]])",
            stream_context_get_default: "([array $options])",
            stream_context_get_options: "(resource $stream_or_context)",
            stream_context_set_option: "(resource $stream_or_context, string $wrapper, string $option, mixed $value)",
            stream_context_set_params: "(resource $stream_or_context, array $params)",
            stream_copy_to_stream: "(resource $source, resource $dest [, int $maxlength [, int $offset]])",
            stream_encoding: "(resource $stream [, string $encoding])",
            stream_filter_append: "(resource $stream, string $filtername [, int $read_write [, mixed $params]])",
            stream_filter_prepend: "(resource $stream, string $filtername [, int $read_write [, mixed $params]])",
            stream_filter_register: "(string $filtername, string $classname)",
            stream_filter_remove: "(resource $stream_filter)",
            stream_get_contents: "(resource $handle [, int $maxlength [, int $offset]])",
            stream_get_filters: "(void)",
            stream_get_line: "(resource $handle, int $length [, string $ending])",
            stream_get_meta_data: "(resource $stream)",
            stream_get_transports: "(void)",
            stream_get_wrappers: "(void)",
            streamMP3: "(mixed $mp3file [, float $skip])",
            stream_notification_callback: "(int $notification_code, int $severity, string $message, int $message_code, int $bytes_transferred, int $bytes_max)",
            stream_resolve_include_path: "(string $filename [, resource $context])",
            stream_select: "(array& $read, array& $write, array& $except, int $tv_sec [, int $tv_usec])",
            stream_set_blocking: "(resource $stream, int $mode)",
            stream_set_timeout: "(resource $stream, int $seconds [, int $microseconds])",
            stream_set_write_buffer: "(resource $stream, int $buffer)",
            stream_socket_accept: "(resource $server_socket [, float $timeout [, string& $peername]])",
            stream_socket_client: "(string $remote_socket [, int& $errno [, string& $errstr [, float $timeout [, int $flags [, resource $context]]]]])",
            stream_socket_enable_crypto: "(resource $stream, bool $enable [, int $crypto_type [, resource $session_stream]])",
            stream_socket_get_name: "(resource $handle, bool $want_peer)",
            stream_socket_pair: "(int $domain, int $type, int $protocol)",
            stream_socket_recvfrom: "(resource $socket, int $length [, int $flags [, string& $address]])",
            stream_socket_sendto: "(resource $socket, string $data [, int $flags [, string $address]])",
            stream_socket_server: "(string $local_socket [, int& $errno [, string& $errstr [, int $flags [, resource $context]]]])",
            stream_socket_shutdown: "(resource $stream, int $how)",
            stream_wrapper_register: "(string $protocol, string $classname)",
            stream_wrapper_restore: "(string $protocol)",
            stream_wrapper_unregister: "(string $protocol)",
            strftime: "(string $format [, int $timestamp])",
            str_getcsv: "(string $input [, string $delimiter [, string $enclosure [, string $escape]]])",
            stripcslashes: "(string $str)",
            stripos: "(string $haystack, string $needle [, int $offset])",
            stripslashes: "(string $str)",
            strip_tags: "(string $str [, string $allowable_tags])",
            str_ireplace: "(mixed $search, mixed $replace, mixed $subject [, int& $count])",
            stristr: "(string $haystack, mixed $needle [, bool $before_needle])",
            strlen: "(string $string)",
            strnatcasecmp: "(string $str1, string $str2)",
            strnatcmp: "(string $str1, string $str2)",
            strncasecmp: "(string $str1, string $str2, int $len)",
            strncmp: "(string $str1, string $str2, int $len)",
            str_pad: "(string $input, int $pad_length [, string $pad_string [, int $pad_type]])",
            strpbrk: "(string $haystack, string $char_list)",
            strpos: "(string $haystack, mixed $needle [, int $offset])",
            strptime: "(string $date, string $format)",
            strrchr: "(string $haystack, mixed $needle)",
            str_repeat: "(string $input, int $multiplier)",
            str_replace: "(mixed $search, mixed $replace, mixed $subject [, int& $count])",
            strrev: "(string $string)",
            strripos: "(string $haystack, string $needle [, int $offset])",
            str_rot13: "(string $str)",
            strrpos: "(string $haystack, string $needle [, int $offset])",
            str_shuffle: "(string $str)",
            str_split: "(string $string [, int $split_length])",
            strspn: "(string $str1, string $str2 [, int $start [, int $length]])",
            strstr: "(string $haystack, mixed $needle [, bool $before_needle])",
            strtok: "(string $str, string $token)",
            strtolower: "(string $str)",
            strtotime: "(string $time [, int $now])",
            strtoupper: "(string $string)",
            strtr: "(string $str, string $from, string $to)",
            strval: "(mixed $var)",
            str_word_count: "(string $string [, int $format [, string $charlist]])",
            subscribe: "(string $targetTopic)",
            substr_compare: "(string $main_str, string $str, int $offset [, int $length [, bool $case_insensitivity]])",
            substr_count: "(string $haystack, string $needle [, int $offset [, int $length]])",
            substr_replace: "(mixed $string, string $replacement, int $start [, int $length])",
            substr: "(string $string, int $start [, int $length])",
            svn_add: "(string $path [, bool $recursive [, bool $force]])",
            svn_auth_get_parameter: "(string $key)",
            svn_auth_set_parameter: "(string $key, string $value)",
            svn_cat: "(string $repos_url [, int $revision_no])",
            svn_checkout: "(string $repos, string $targetpath [, int $revision [, int $flags]])",
            svn_cleanup: "(string $workingdir)",
            svn_client_version: "(void)",
            svn_commit: "(string $log, array $targets [, bool $dontrecurse])",
            svn_diff: "(string $path1, int $rev1, string $path2, int $rev2)",
            svn_fs_abort_txn: "(resource $txn)",
            svn_fs_apply_text: "(resource $root, string $path)",
            svn_fs_begin_txn2: "(resource $repos, int $rev)",
            svn_fs_change_node_prop: "(resource $root, string $path, string $name, string $value)",
            svn_fs_check_path: "(resource $fsroot, string $path)",
            svn_fs_contents_changed: "(resource $root1, string $path1, resource $root2, string $path2)",
            svn_fs_copy: "(resource $from_root, string $from_path, resource $to_root, string $to_path)",
            svn_fs_delete: "(resource $root, string $path)",
            svn_fs_dir_entries: "(resource $fsroot, string $path)",
            svn_fs_file_contents: "(resource $fsroot, string $path)",
            svn_fs_file_length: "(resource $fsroot, string $path)",
            svn_fs_is_dir: "(resource $root, string $path)",
            svn_fs_is_file: "(resource $root, string $path)",
            svn_fs_make_dir: "(resource $root, string $path)",
            svn_fs_make_file: "(resource $root, string $path)",
            svn_fs_node_created_rev: "(resource $fsroot, string $path)",
            svn_fs_node_prop: "(resource $fsroot, string $path, string $propname)",
            svn_fs_props_changed: "(resource $root1, string $path1, resource $root2, string $path2)",
            svn_fs_revision_prop: "(resource $fs, int $revnum, string $propname)",
            svn_fs_revision_root: "(resource $fs, int $revnum)",
            svn_fs_txn_root: "(resource $txn)",
            svn_fs_youngest_rev: "(resource $fs)",
            svn_import: "(string $path, string $url, bool $nonrecursive)",
            svn_log: "(string $repos_url [, int $start_revision [, int $end_revision [, int $limit [, int $flags]]]])",
            svn_ls: "(string $repos_url [, int $revision_no [, bool $recurse]])",
            svn_repos_create: "(string $path [, array $config [, array $fsconfig]])",
            svn_repos_fs_begin_txn_for_commit: "(resource $repos, int $rev, string $author, string $log_msg)",
            svn_repos_fs_commit_txn: "(resource $txn)",
            svn_repos_fs: "(resource $repos)",
            svn_repos_hotcopy: "(string $repospath, string $destpath, bool $cleanlogs)",
            svn_repos_open: "(string $path)",
            svn_repos_recover: "(string $path)",
            svn_status: "(string $path [, int $flags])",
            svn_update: "(string $path [, int $revno [, bool $recurse]])",
            swf_actiongeturl: "(string $url, string $target)",
            swf_actiongotoframe: "(int $framenumber)",
            swf_actiongotolabel: "(string $label)",
            swf_actionnextframe: "(void)",
            swf_actionplay: "(void)",
            swf_actionprevframe: "(void)",
            swf_actionsettarget: "(string $target)",
            swf_actionstop: "(void)",
            swf_actiontogglequality: "(void)",
            swf_actionwaitforframe: "(int $framenumber, int $skipcount)",
            swf_addbuttonrecord: "(int $states, int $shapeid, int $depth)",
            swf_addcolor: "(float $r, float $g, float $b, float $a)",
            swf_closefile: "([int $return_file])",
            swf_definebitmap: "(int $objid, string $image_name)",
            swf_definefont: "(int $fontid, string $fontname)",
            swf_defineline: "(int $objid, float $x1, float $y1, float $x2, float $y2, float $width)",
            swf_definepoly: "(int $objid, array $coords, int $npoints, float $width)",
            swf_definerect: "(int $objid, float $x1, float $y1, float $x2, float $y2, float $width)",
            swf_definetext: "(int $objid, string $str, int $docenter)",
            swf_endbutton: "(void)",
            swf_enddoaction: "(void)",
            swf_endshape: "(void)",
            swf_endsymbol: "(void)",
            swf_fontsize: "(float $size)",
            swf_fontslant: "(float $slant)",
            swf_fonttracking: "(float $tracking)",
            swf_getbitmapinfo: "(int $bitmapid)",
            swf_getfontinfo: "(void)",
            swf_getframe: "(void)",
            swf_labelframe: "(string $name)",
            swf_lookat: "(float $view_x, float $view_y, float $view_z, float $reference_x, float $reference_y, float $reference_z, float $twist)",
            swf_modifyobject: "(int $depth, int $how)",
            swf_mulcolor: "(float $r, float $g, float $b, float $a)",
            swf_nextid: "(void)",
            swf_oncondition: "(int $transition)",
            swf_openfile: "(string $filename, float $width, float $height, float $framerate, float $r, float $g, float $b)",
            swf_ortho2: "(float $xmin, float $xmax, float $ymin, float $ymax)",
            swf_ortho: "(float $xmin, float $xmax, float $ymin, float $ymax, float $zmin, float $zmax)",
            swf_perspective: "(float $fovy, float $aspect, float $near, float $far)",
            swf_placeobject: "(int $objid, int $depth)",
            swf_polarview: "(float $dist, float $azimuth, float $incidence, float $twist)",
            swf_popmatrix: "(void)",
            swf_posround: "(int $round)",
            swf_pushmatrix: "(void)",
            swf_removeobject: "(int $depth)",
            swf_rotate: "(float $angle, string $axis)",
            swf_scale: "(float $x, float $y, float $z)",
            swf_setfont: "(int $fontid)",
            swf_setframe: "(int $framenumber)",
            swf_shapearc: "(float $x, float $y, float $r, float $ang1, float $ang2)",
            swf_shapecurveto3: "(float $x1, float $y1, float $x2, float $y2, float $x3, float $y3)",
            swf_shapecurveto: "(float $x1, float $y1, float $x2, float $y2)",
            swf_shapefillbitmapclip: "(int $bitmapid)",
            swf_shapefillbitmaptile: "(int $bitmapid)",
            swf_shapefilloff: "(void)",
            swf_shapefillsolid: "(float $r, float $g, float $b, float $a)",
            swf_shapelinesolid: "(float $r, float $g, float $b, float $a, float $width)",
            swf_shapelineto: "(float $x, float $y)",
            swf_shapemoveto: "(float $x, float $y)",
            swf_showframe: "(void)",
            swf_startbutton: "(int $objid, int $type)",
            swf_startdoaction: "(void)",
            swf_startshape: "(int $objid)",
            swf_startsymbol: "(int $objid)",
            swf_textwidth: "(string $str)",
            swf_translate: "(float $x, float $y, float $z)",
            swf_viewport: "(float $xmin, float $xmax, float $ymin, float $ymax)",
            "Swish::__construct": "(string $index_names)",
            "Swish->getMetaList": "(string $index_name)",
            "Swish->getPropertyList": "(string $index_name)",
            "Swish->prepare": "([string $query])",
            "Swish->query": "(string $query)",
            "SwishResult->getMetaList": "(void)",
            "SwishResults->getParsedWords": "(string $index_name)",
            "SwishResults->getRemovedStopwords": "(string $index_name)",
            "SwishResults->nextResult": "(void)",
            "SwishResults->seekResult": "(int $position)",
            "SwishResult->stem": "(string $word)",
            "SwishSearch->execute": "([string $query])",
            "SwishSearch->resetLimit": "(void)",
            "SwishSearch->setLimit": "(string $property, string $low, string $high)",
            "SwishSearch->setPhraseDelimiter": "(string $delimiter)",
            "SwishSearch->setSort": "(string $sort)",
            "SwishSearch->setStructure": "(int $structure)",
            sybase_affected_rows: "([resource $link_identifier])",
            sybase_close: "([resource $link_identifier])",
            sybase_connect: "([string $servername [, string $username [, string $password [, string $charset [, string $appname]]]]])",
            sybase_data_seek: "(resource $result_identifier, int $row_number)",
            sybase_deadlock_retry_count: "(int $retry_count)",
            sybase_fetch_array: "(resource $result)",
            sybase_fetch_assoc: "(resource $result)",
            sybase_fetch_field: "(resource $result [, int $field_offset])",
            sybase_fetch_object: "(resource $result [, mixed $object])",
            sybase_fetch_row: "(resource $result)",
            sybase_field_seek: "(resource $result, int $field_offset)",
            sybase_free_result: "(resource $result)",
            sybase_get_last_message: "(void)",
            sybase_min_client_severity: "(int $severity)",
            sybase_min_error_severity: "(int $severity)",
            sybase_min_message_severity: "(int $severity)",
            sybase_min_server_severity: "(int $severity)",
            sybase_num_fields: "(resource $result)",
            sybase_num_rows: "(resource $result)",
            sybase_pconnect: "([string $servername [, string $username [, string $password [, string $charset [, string $appname]]]]])",
            sybase_query: "(string $query [, resource $link_identifier])",
            sybase_result: "(resource $result, int $row, mixed $field)",
            sybase_select_db: "(string $database_name [, resource $link_identifier])",
            sybase_set_message_handler: "(callback $handler [, resource $connection])",
            sybase_unbuffered_query: "(string $query, resource $link_identifier [, bool $store_result])",
            symlink: "(string $target, string $link)",
            sys_getloadavg: "(void)",
            sys_get_temp_dir: "(void)",
            syslog: "(int $priority, string $message)",
            system_id: "(void)",
            system: "(string $command [, int& $return_var])",
            tagname: "(void)",
            tan: "(float $arg)",
            tanh: "(float $arg)",
            target: "(void)",
            tcpwrap_check: "(string $daemon, string $address [, string $user [, bool $nodns]])",
            tell: "(void)",
            tempnam: "(string $dir, string $prefix)",
            textdomain: "(string $text_domain)",
            text: "(string $content)",
            tidy_access_count: "(tidy $object)",
            tidy_clean_repair: "(tidy $object)",
            tidy_config_count: "(tidy $object)",
            "tidy::__construct": "([string $filename [, mixed $config [, string $encoding [, bool $use_include_path]]]])",
            tidy_diagnose: "(tidy $object)",
            tidy_error_count: "(tidy $object)",
            tidy_get_body: "(tidy $object)",
            tidy_get_config: "(tidy $object)",
            tidy_get_error_buffer: "(tidy $object)",
            tidy_get_head: "(tidy $object)",
            tidy_get_html: "(tidy $object)",
            tidy_get_html_ver: "(tidy $object)",
            tidy_get_opt_doc: "(tidy $object, string $optname)",
            tidy_getopt: "(tidy $object, string $option)",
            tidy_get_output: "(tidy $object)",
            tidy_get_release: "(void)",
            tidy_get_root: "(tidy $object)",
            tidy_get_status: "(tidy $object)",
            tidy_is_xhtml: "(tidy $object)",
            tidy_is_xml: "(tidy $object)",
            tidy_load_config: "(string $filename, string $encoding)",
            "tidy_node->get_attr": "(int $attrib_id)",
            "tidy_node->get_nodes": "(int $node_id)",
            "tidyNode::getParent": "(void)",
            "tidyNode->hasChildren": "(void)",
            "tidyNode->hasSiblings": "(void)",
            "tidyNode->isAsp": "(void)",
            "tidyNode->isComment": "(void)",
            "tidyNode->isHtml": "(void)",
            "tidyNode->isJste": "(void)",
            "tidyNode->isPhp": "(void)",
            "tidyNode->isText": "(void)",
            "tidy_node->next": "(void)",
            "tidy_node->prev": "(void)",
            tidy_parse_file: "(string $filename [, mixed $config [, string $encoding [, bool $use_include_path]]])",
            tidy_parse_string: "(string $input [, mixed $config [, string $encoding]])",
            tidy_repair_file: "(string $filename [, mixed $config [, string $encoding [, bool $use_include_path]]])",
            tidy_repair_string: "(string $data [, mixed $config [, string $encoding]])",
            tidy_reset_config: "(void)",
            tidy_save_config: "(string $filename)",
            tidy_set_encoding: "(string $encoding)",
            tidy_setopt: "(string $option, mixed $value)",
            tidy_warning_count: "(tidy $object)",
            time_nanosleep: "(int $seconds, int $nanoseconds)",
            time_sleep_until: "(float $timestamp)",
            time: "(void)",
            timezone_abbreviations_list: "(void)",
            timezone_identifiers_list: "(void)",
            timezone_name_from_abbr: "(string $abbr [, int $gmtOffset [, int $isdst]])",
            timezone_name_get: "(DateTimeZone $object)",
            timezone_offset_get: "(DateTimeZone $object, DateTime $datetime)",
            timezone_open: "(string $timezone)",
            timezone_transitions_get: "(DateTimeZone $object)",
            title: "(array $parameter)",
            tmpfile: "(void)",
            token_get_all: "(string $source)",
            token_name: "(int $token)",
            touch: "(string $filename [, int $time [, int $atime]])",
            trigger_error: "(string $error_msg [, int $error_type])",
            trim: "(string $str [, string $charlist])",
            truncate: "([int $length])",
            type: "(void)",
            uasort: "(array& $array, callback $cmp_function)",
            ucfirst: "(string $str)",
            ucwords: "(string $str)",
            udm_add_search_limit: "(resource $agent, int $var, string $val)",
            udm_alloc_agent_array: "(array $databases)",
            udm_alloc_agent: "(string $dbaddr [, string $dbmode])",
            udm_api_version: "(void)",
            udm_cat_list: "(resource $agent, string $category)",
            udm_cat_path: "(resource $agent, string $category)",
            udm_check_charset: "(resource $agent, string $charset)",
            udm_check_stored: "(resource $agent, int $link, string $doc_id)",
            udm_clear_search_limits: "(resource $agent)",
            udm_close_stored: "(resource $agent, int $link)",
            udm_crc32: "(resource $agent, string $str)",
            udm_errno: "(resource $agent)",
            udm_error: "(resource $agent)",
            udm_find: "(resource $agent, string $query)",
            udm_free_agent: "(resource $agent)",
            udm_free_ispell_data: "(int $agent)",
            udm_free_res: "(resource $res)",
            udm_get_doc_count: "(resource $agent)",
            udm_get_res_field: "(resource $res, int $row, int $field)",
            udm_get_res_param: "(resource $res, int $param)",
            udm_hash32: "(resource $agent, string $str)",
            udm_load_ispell_data: "(resource $agent, int $var, string $val1, string $val2, int $flag)",
            udm_open_stored: "(resource $agent, string $storedaddr)",
            udm_set_agent_param: "(resource $agent, int $var, string $val)",
            uksort: "(array& $array, callback $cmp_function)",
            umask: "([int $mask])",
            unicode_decode: "(string $input, string $encoding [, int $errmode])",
            unicode_encode: "(unicode $input, string $encoding [, int $errmode])",
            unicode_get_error_mode: "(int $direction)",
            unicode_get_subst_char: "(void)",
            unicode_set_error_mode: "(int $direction, int $mode)",
            unicode_set_subst_char: "(unicode $character)",
            uniqid: "([string $prefix [, bool $more_entropy]])",
            unixtojd: "([int $timestamp])",
            unlink: "(string $filename [, resource $context])",
            unlock: "(array $parameter)",
            unpack: "(string $format, string $data)",
            unregister_tick_function: "(string $function_name)",
            unserialize: "(string $str)",
            unset: "(mixed $var [, mixed $var [, mixed $...]])",
            unsubscribe: "(string $subscriptionId [, string $targetTopic])",
            urldecode: "(string $str)",
            urlencode: "(string $str)",
            user: "(array $parameter)",
            userlist: "(array $parameter)",
            use_soap_error_handler: "([bool $handler])",
            usleep: "(int $micro_seconds)",
            usort: "(array& $array, callback $cmp_function)",
            utf8_decode: "(string $data)",
            utf8_encode: "(string $data)",
            value: "(string $name)|(void)",
            values: "(void)",
            var_dump: "(mixed $expression [, mixed $expression [,  $...]])",
            var_export: "(mixed $expression [, bool $return])",
            variant_abs: "(mixed $val)",
            variant_add: "(mixed $left, mixed $right)",
            variant_and: "(mixed $left, mixed $right)",
            variant_cast: "(variant $variant, int $type)",
            variant_cat: "(mixed $left, mixed $right)",
            variant_cmp: "(mixed $left, mixed $right [, int $lcid [, int $flags]])",
            variant_date_from_timestamp: "(int $timestamp)",
            variant_date_to_timestamp: "(variant $variant)",
            variant_div: "(mixed $left, mixed $right)",
            variant_eqv: "(mixed $left, mixed $right)",
            variant_fix: "(mixed $variant)",
            variant_get_type: "(variant $variant)",
            variant_idiv: "(mixed $left, mixed $right)",
            variant_imp: "(mixed $left, mixed $right)",
            variant_int: "(mixed $variant)",
            variant_mod: "(mixed $left, mixed $right)",
            variant_mul: "(mixed $left, mixed $right)",
            variant_neg: "(mixed $variant)",
            variant_not: "(mixed $variant)",
            variant_or: "(mixed $left, mixed $right)",
            variant_pow: "(mixed $left, mixed $right)",
            variant_round: "(mixed $variant, int $decimals)",
            variant_set_type: "(variant $variant, int $type)",
            variant_set: "(variant $variant, mixed $value)",
            variant_sub: "(mixed $left, mixed $right)",
            variant_xor: "(mixed $left, mixed $right)",
            version_compare: "(string $version1, string $version2 [, string $operator])",
            vfprintf: "(resource $handle, string $format, array $args)",
            virtual: "(string $filename)",
            vpopmail_add_alias_domain_ex: "(string $olddomain, string $newdomain)",
            vpopmail_add_alias_domain: "(string $domain, string $aliasdomain)",
            vpopmail_add_domain_ex: "(string $domain, string $passwd [, string $quota [, string $bounce [, bool $apop]]])",
            vpopmail_add_domain: "(string $domain, string $dir, int $uid, int $gid)",
            vpopmail_add_user: "(string $user, string $domain, string $password [, string $gecos [, bool $apop]])",
            vpopmail_alias_add: "(string $user, string $domain, string $alias)",
            vpopmail_alias_del_domain: "(string $domain)",
            vpopmail_alias_del: "(string $user, string $domain)",
            vpopmail_alias_get_all: "(string $domain)",
            vpopmail_alias_get: "(string $alias, string $domain)",
            vpopmail_auth_user: "(string $user, string $domain, string $password [, string $apop])",
            vpopmail_del_domain_ex: "(string $domain)",
            vpopmail_del_domain: "(string $domain)",
            vpopmail_del_user: "(string $user, string $domain)",
            vpopmail_error: "(void)",
            vpopmail_passwd: "(string $user, string $domain, string $password [, bool $apop])",
            vpopmail_set_user_quota: "(string $user, string $domain, string $quota)",
            vprintf: "(string $format, array $args)",
            vsprintf: "(string $format, array $args)",
            w32api_deftype: "(string $typename, string $member1_type, string $member1_name [, string $... [, string $...]])",
            w32api_init_dtype: "(string $typename, mixed $value [, mixed $...])",
            w32api_invoke_function: "(string $funcname, mixed $argument [, mixed $...])",
            w32api_register_function: "(string $library, string $function_name, string $return_type)",
            w32api_set_call_method: "(int $method)",
            wddx_add_vars: "(resource $packet_id, mixed $var_name [, mixed $...])",
            wddx_packet_end: "(resource $packet_id)",
            wddx_packet_start: "([string $comment])",
            wddx_serialize_value: "(mixed $var [, string $comment])",
            wddx_serialize_vars: "(mixed $var_name [, mixed $...])",
            wddx_unserialize: "(string $packet)",
            win32_create_service: "(array $details [, string $machine])",
            win32_delete_service: "(string $servicename [, string $machine])",
            win32_get_last_control_message: "(void)",
            win32_ps_list_procs: "(void)",
            win32_ps_stat_mem: "(void)",
            win32_ps_stat_proc: "([int $pid])",
            win32_query_service_status: "(string $servicename [, string $machine])",
            win32_set_service_status: "(int $status)",
            win32_start_service_ctrl_dispatcher: "(string $name)",
            win32_start_service: "(string $servicename [, string $machine])",
            win32_stop_service: "(string $servicename [, string $machine])",
            wordwrap: "(string $str [, int $width [, string $break [, bool $cut]]])",
            writeAttributeNS: "(string $prefix, string $name, string $uri, string $content)",
            writeAttribute: "(string $name, string $value)",
            writeCData: "(string $content)",
            writeComment: "(string $content)",
            writeDTDAttlist: "(string $name, string $content)",
            writeDTDElement: "(string $name, string $content)",
            writeDTDEntity: "(string $name, string $content)",
            writeDTD: "(string $name [, string $publicId [, string $systemId [, string $subset]]])",
            writeElementNS: "(string $prefix, string $name, string $uri [, string $content])",
            writeElement: "(string $name [, string $content])",
            writeExports: "(void)",
            writePI: "(string $target, string $content)",
            writeRaw: "(string $content)",
            write: "(string $data [, int $length])",
            writeTemporary: "(string $data [, int $lob_type])",
            xattr_get: "(string $filename, string $name [, int $flags])",
            xattr_list: "(string $filename [, int $flags])",
            xattr_remove: "(string $filename, string $name [, int $flags])",
            xattr_set: "(string $filename, string $name, string $value [, int $flags])",
            xattr_supported: "(string $filename [, int $flags])",
            xdiff_file_bdiff_size: "(string $file)",
            xdiff_file_bdiff: "(string $old_file, string $new_file, string $dest)",
            xdiff_file_bpatch: "(string $file, string $patch, string $dest)",
            xdiff_file_diff_binary: "(string $old_file, string $new_file, string $dest)",
            xdiff_file_diff: "(string $old_file, string $new_file, string $dest [, int $context [, bool $minimal]])",
            xdiff_file_merge3: "(string $old_file, string $new_file1, string $new_file2, string $dest)",
            xdiff_file_patch_binary: "(string $file, string $patch, string $dest)",
            xdiff_file_patch: "(string $file, string $patch, string $dest [, int $flags])",
            xdiff_file_rabdiff: "(string $old_file, string $new_file, string $dest)",
            xdiff_string_bdiff_size: "(string $patch)",
            xdiff_string_bdiff: "(string $old_data, string $new_data)",
            xdiff_string_bpatch: "(string $str, string $patch)",
            xdiff_string_diff: "(string $old_data, string $new_data [, int $context [, bool $minimal]])",
            xdiff_string_merge3: "(string $old_data, string $new_data1, string $new_data2 [, string& $error])",
            xdiff_string_patch_binary: "(string $str, string $patch)",
            xdiff_string_patch: "(string $str, string $patch [, int $flags [, string& $error]])",
            xml_error_string: "(int $code)",
            xml_get_current_byte_index: "(resource $parser)",
            xml_get_current_column_number: "(resource $parser)",
            xml_get_current_line_number: "(resource $parser)",
            xml_get_error_code: "(resource $parser)",
            xml_parse_into_struct: "(resource $parser, string $data, array& $values [, array& $index])",
            xml_parser_create_ns: "([string $encoding [, string $separator]])",
            xml_parser_create: "([string $encoding])",
            xml_parse: "(resource $parser, string $data [, bool $is_final])",
            xml_parser_free: "(resource $parser)",
            xml_parser_get_option: "(resource $parser, int $option)",
            xml_parser_set_option: "(resource $parser, int $option, mixed $value)",
            xmlrpc_decode_request: "(string $xml, string& $method [, string $encoding])",
            xmlrpc_decode: "(string $xml [, string $encoding])",
            xmlrpc_encode: "(mixed $value)",
            xmlrpc_encode_request: "(string $method, mixed $params [, array $output_options])",
            xmlrpc_get_type: "(mixed $value)",
            xmlrpc_is_fault: "(array $arg)",
            xmlrpc_parse_method_descriptions: "(string $xml)",
            xmlrpc_server_add_introspection_data: "(resource $server, array $desc)",
            xmlrpc_server_call_method: "(resource $server, string $xml, mixed $user_data [, array $output_options])",
            xmlrpc_server_create: "(void)",
            xmlrpc_server_destroy: "(resource $server)",
            xmlrpc_server_register_introspection_callback: "(resource $server, string $function)",
            xmlrpc_server_register_method: "(resource $server, string $method_name, string $function)",
            xmlrpc_set_type: "(string& $value, string $type)",
            xml_set_character_data_handler: "(resource $parser, callback $handler)",
            xml_set_default_handler: "(resource $parser, callback $handler)",
            xml_set_element_handler: "(resource $parser, callback $start_element_handler, callback $end_element_handler)",
            xml_set_end_namespace_decl_handler: "(resource $parser, callback $handler)",
            xml_set_external_entity_ref_handler: "(resource $parser, callback $handler)",
            xml_set_notation_decl_handler: "(resource $parser, callback $handler)",
            xml_set_object: "(resource $parser, object& $object)",
            xml_set_processing_instruction_handler: "(resource $parser, callback $handler)",
            xml_set_start_namespace_decl_handler: "(resource $parser, callback $handler)",
            xml_set_unparsed_entity_decl_handler: "(resource $parser, callback $handler)",
            xpath_eval_expression: "(string $expression [, domnode $contextnode])",
            xpath_eval: "(string $xpath_expression [, domnode $contextnode])",
            xpath_new_context: "(domdocument $dom_document)",
            xpath_register_ns_auto: "(XPathContext $xpath_context [, object $context_node])",
            xpath_register_ns: "(XPathContext $xpath_context, string $prefix, string $uri)",
            xpath: "(string $path)",
            xptr_eval: "(string $eval_str [, domnode $contextnode])",
            xptr_new_context: "(void)",
            xslt_backend_info: "(void)",
            xslt_backend_name: "(void)",
            xslt_backend_version: "(void)",
            xslt_create: "(void)",
            xslt_errno: "(resource $xh)",
            xslt_error: "(resource $xh)",
            xslt_free: "(resource $xh)",
            xslt_getopt: "(resource $processor)",
            xslt_process: "(resource $xh, string $xmlcontainer, string $xslcontainer [, string $resultcontainer [, array $arguments [, array $parameters]]])",
            xslt_set_base: "(resource $xh, string $uri)",
            xslt_set_encoding: "(resource $xh, string $encoding)",
            xslt_set_error_handler: "(resource $xh, mixed $handler)",
            xslt_set_log: "(resource $xh [, mixed $log])",
            xslt_set_object: "(resource $processor, object& $obj)",
            xslt_setopt: "(resource $processor, int $newmask)",
            xslt_set_sax_handler: "(resource $xh, array $handlers)",
            xslt_set_sax_handlers: "(resource $processor, array $handlers)",
            xslt_set_scheme_handler: "(resource $xh, array $handlers)",
            xslt_set_scheme_handlers: "(resource $xh, array $handlers)",
            yaz_addinfo: "(resource $id)",
            yaz_ccl_conf: "(resource $id, array $config)",
            yaz_ccl_parse: "(resource $id, string $query, array& $result)",
            yaz_close: "(resource $id)",
            yaz_connect: "(string $zurl [, mixed $options])",
            yaz_database: "(resource $id, string $databases)",
            yaz_element: "(resource $id, string $elementset)",
            yaz_errno: "(resource $id)",
            yaz_error: "(resource $id)",
            yaz_es: "(resource $id, string $type, array $args)",
            yaz_es_result: "(resource $id)",
            yaz_get_option: "(resource $id, string $name)",
            yaz_hits: "(resource $id [, array& $searchresult])",
            yaz_itemorder: "(resource $id, array $args)",
            yaz_present: "(resource $id)",
            yaz_range: "(resource $id, int $start, int $number)",
            yaz_record: "(resource $id, int $pos, string $type)",
            yaz_scan: "(resource $id, string $type, string $startterm [, array $flags])",
            yaz_scan_result: "(resource $id [, array& $result])",
            yaz_schema: "(resource $id, string $schema)",
            yaz_search: "(resource $id, string $type, string $query)",
            yaz_set_option: "(resource $id, string $name, string $value)",
            yaz_sort: "(resource $id, string $criteria)",
            yaz_syntax: "(resource $id, string $syntax)",
            yaz_wait: "([array& $options])",
            yp_all: "(string $domain, string $map, string $callback)",
            yp_cat: "(string $domain, string $map)",
            yp_errno: "(void)",
            yp_err_string: "(int $errorcode)",
            yp_first: "(string $domain, string $map)",
            yp_get_default_domain: "(void)",
            yp_master: "(string $domain, string $map)",
            yp_match: "(string $domain, string $map, string $key)",
            yp_next: "(string $domain, string $map, string $key)",
            yp_order: "(string $domain, string $map)",
            zend_logo_guid: "(void)",
            zend_thread_id: "(void)",
            zend_version: "(void)",
            "ZipArchive::addEmptyDir": "(string $dirname)",
            "ZipArchive::addFile": "(string $filename [, string $localname])",
            "ZipArchive::addFromString": "(string $localname, string $contents)",
            "ZipArchive::close": "(void)",
            "ZipArchive::deleteIndex": "(int $index)",
            "ZipArchive::deleteName": "(string $name)",
            "ZipArchive::extractTo": "(string $destination [, mixed $entries])",
            "ZipArchive::getArchiveComment": "(void)",
            "ZipArchive::getCommentIndex": "(int $index [, int $flags])",
            "ZipArchive::getCommentName": "(string $name [, int $flags])",
            "ZipArchive::getFromIndex": "(int $index [, int $flags])",
            "ZipArchive::getFromName": "(string $name [, int $flags])",
            "ZipArchive::getNameIndex": "(int $index)",
            "ZipArchive::getStream": "(string $name)",
            "ZipArchive::locateName": "(string $name [, int $flags])",
            "ZipArchive::open": "(string $filename [, int $flags])",
            "ZipArchive::renameIndex": "(int $index, string $newname)",
            "ZipArchive::renameName": "(string $name, string $newname)",
            "ZipArchive::setArchiveComment": "(string $comment)",
            "ZipArchive::setCommentIndex": "(int $index, string $comment)",
            "ZipArchive::setCommentName": "(string $name, string $comment)",
            "ZipArchive::statIndex": "(int $index [, int $flags])",
            "ZipArchive::statName": "(name $name [, int $flags])",
            "ZipArchive::unchangeAll": "(void)",
            "ZipArchive::unchangeArchive": "(void)",
            "ZipArchive::unchangeIndex": "(int $index)",
            "ZipArchive::unchangeName": "(string $name)",
            zip_close: "(resource $zip)",
            zip_entry_close: "(resource $zip_entry)",
            zip_entry_compressedsize: "(resource $zip_entry)",
            zip_entry_compressionmethod: "(resource $zip_entry)",
            zip_entry_filesize: "(resource $zip_entry)",
            zip_entry_name: "(resource $zip_entry)",
            zip_entry_open: "(resource $zip, resource $zip_entry [, string $mode])",
            zip_entry_read: "(resource $zip_entry [, int $length])",
            zip_open: "(string $filename)",
            zip_read: "(resource $zip)",
            'zlib_get_coding_type': "(void)"
        };

        for (var k in _phpFunctionDictionary) {
            phpFunctionDictionary.push({name: k, desc: phpFunctionDictionary[k]});
        }

    }

    cssDictionary = [];

    function initCssDict () {
        var _cssDictionary = {
            background: {
                "#|": 2
            },
            "background-color": {
                "#|": 2,
                transparent: 2,
                fixed: 2
            },
            "background-image": {
                "url('|')": 2
            },
            "background-repeat": {
                repeat: 2,
                "repeat-x": 2,
                "repeat-y": 2,
                "no-repeat": 2,
                inherit: 2
            },
            "background-position": {
                bottom: 2,
                center: 2,
                left: 2,
                right: 2,
                top: 2,
                inherit: 2
            },
            "background-attachment": {
                scroll: 2,
                fixed: 2
            },
            border: {
                "solid": 2,
                "dashed": 2,
                "dotted": 2,
                "#|": 2
            },
            "border-top": 1,
            "border-right": 1,
            "border-bottom": 1,
            "border-left": 1,
            "border-color": {
                "#|": 2
            },
            "border-width": 1,
            "border-style": {
                solid: 2,
                dashed: 2,
                dotted: 2,
                "double": 2,
                groove: 2,
                hidden: 2,
                inherit: 2,
                inset: 2,
                none: 2,
                outset: 2,
                ridged: 2
            },
            "border-spacing": 1,
            "border-collapse": {
                collapse: 2,
                separate: 2
            },
            bottom: {
                px: 2,
                em: 2,
                "%": 2
            },
            clear: {
                left: 2,
                right: 2,
                both: 2,
                none: 2
            },
            clip: 1,
            color: {
                "#|": 2,
                "rgb(#|0,0,0)": 2
            },
            content: 1,
            cursor: {
                "default": 2,
                pointer: 2,
                move: 2,
                text: 2,
                wait: 2,
                help: 2,
                progress: 2,
                "n-resize": 2,
                "ne-resize": 2,
                "e-resize": 2,
                "se-resize": 2,
                "s-resize": 2,
                "sw-resize": 2,
                "w-resize": 2,
                "nw-resize": 2
            },
            display: {
                none: 2,
                block: 2,
                inline: 2,
                "inline-block": 2,
                "table-cell": 2
            },
            "empty-cells": {
                show: 2,
                hide: 2
            },
            "float": {
                left: 2,
                right: 2,
                none: 2
            },
            "font-family": {
                Arial: 2,
                "Comic Sans MS": 2,
                Consolas: 2,
                "Courier New": 2,
                Courier: 2,
                Georgia: 2,
                Monospace: 2,
                "Sans-Serif": 2,
                "Segoe UI": 2,
                Tahoma: 2,
                "Times New Roman": 2,
                "Trebuchet MS": 2,
                Verdana: 2
            },
            "font-size": {
                px: 2,
                em: 2,
                "%": 2
            },
            "font-weight": {
                bold: 2,
                normal: 2
            },
            "font-style": {
                italic: 2,
                normal: 2
            },
            "font-variant": {
                normal: 2,
                "small-caps": 2
            },
            font: 1,
            height: {
                px: 2,
                em: 2,
                "%": 2
            },
            left: {
                px: 2,
                em: 2,
                "%": 2
            },
            "letter-spacing": {
                normal: 2
            },
            "line-height": {
                normal: 2
            },
            "list-style": 1,
            "list-style-image": 1,
            "list-style-position": 1,
            "list-style-type": {
                none: 2,
                disc: 2,
                circle: 2,
                square: 2,
                decimal: 2,
                "decimal-leading-zero": 2,
                "lower-roman": 2,
                "upper-roman": 2,
                "lower-greek": 2,
                "lower-latin": 2,
                "upper-latin": 2,
                georgian: 2,
                "lower-alpha": 2,
                "upper-alpha": 2
            },
            margin: {
                px: 2,
                em: 2,
                "%": 2
            },
            "margin-right": {
                px: 2,
                em: 2,
                "%": 2
            },
            "margin-left": {
                px: 2,
                em: 2,
                "%": 2
            },
            "margin-top": {
                px: 2,
                em: 2,
                "%": 2
            },
            "margin-bottom": {
                px: 2,
                em: 2,
                "%": 2
            },
            "max-height": {
                px: 2,
                em: 2,
                "%": 2
            },
            "max-width": {
                px: 2,
                em: 2,
                "%": 2
            },
            "min-height": {
                px: 2,
                em: 2,
                "%": 2
            },
            "min-width": {
                px: 2,
                em: 2,
                "%": 2
            },
            outline: 1,
            "outline-color": 1,
            "outline-style": 1,
            "outline-width": 1,
            overflow: {
                hidden: 2,
                visible: 2,
                auto: 2,
                scroll: 2
            },
            "overflow-x": {
                hidden: 2,
                visible: 2,
                auto: 2,
                scroll: 2
            },
            "overflow-y": {
                hidden: 2,
                visible: 2,
                auto: 2,
                scroll: 2
            },
            padding: {
                px: 2,
                em: 2,
                "%": 2
            },
            "padding-top": {
                px: 2,
                em: 2,
                "%": 2
            },
            "padding-right": {
                px: 2,
                em: 2,
                "%": 2
            },
            "padding-bottom": {
                px: 2,
                em: 2,
                "%": 2
            },
            "padding-left": {
                px: 2,
                em: 2,
                "%": 2
            },
            "page-break-after": {
                auto: 2,
                always: 2,
                avoid: 2,
                left: 2,
                right: 2
            },
            "page-break-before": {
                auto: 2,
                always: 2,
                avoid: 2,
                left: 2,
                right: 2
            },
            "page-break-inside": 1,
            position: {
                absolute: 2,
                relative: 2,
                fixed: 2,
                "static": 2
            },
            right: {
                px: 2,
                em: 2,
                "%": 2
            },
            "table-layout": {
                fixed: 2,
                auto: 2
            },
            "text-decoration": {
                none: 2,
                underline: 2,
                "line-through": 2,
                blink: 2
            },
            "text-align": {
                left: 2,
                right: 2,
                center: 2,
                justify: 2
            },
            "text-indent": 1,
            "text-transform": {
                capitalize: 2,
                uppercase: 2,
                lowercase: 2,
                none: 2
            },
            top: {
                px: 2,
                em: 2,
                "%": 2
            },
            "vertical-align": {
                top: 2,
                bottom: 2
            },
            visibility: {
                hidden: 2,
                visible: 2
            },
            "white-space": {
                nowrap: 2,
                normal: 2,
                pre: 2,
                "pre-line": 2,
                "pre-wrap": 2
            },
            width: {
                px: 2,
                em: 2,
                "%": 2
            },
            "word-spacing": {
                normal: 2
            },
            "z-index": 1,
            opacity: 1,
            filter: {
                "alpha(|opacity=100)": 2
            },
            "text-shadow": {
                "|2px 2px 2px #777": 2
            },
            "text-overflow": {
                "ellipsis-word": 2,
                clip: 2,
                ellipsis: 2
            },
            "border-radius": 1,
            "-moz-border-radius": 1,
            "-moz-border-radius-topright": 1,
            "-moz-border-radius-bottomright": 1,
            "-moz-border-radius-topleft": 1,
            "-moz-border-radius-bottomleft": 1,
            "-webkit-border-radius": 1,
            "-webkit-border-top-right-radius": 1,
            "-webkit-border-top-left-radius": 1,
            "-webkit-border-bottom-right-radius": 1,
            "-webkit-border-bottom-left-radius": 1,
            "-moz-box-shadow": 1,
            "-webkit-box-shadow": 1,
            transform: {
                "rotate": 2,
                "skew": 2
            },
            "-moz-transform": {
                "rotate": 2,
                "skew": 2
            },
            "-webkit-transform": {
                "rotate": 2,
                "skew": 2
            }
        }

        for (var k in _cssDictionary) {
            cssDictionary.push({name: k.toLowerCase(), desc: '', attributes: _cssDictionary[k]});
        }


    }












    function getAllMethods (object) {
        return Object.getOwnPropertyNames(object).filter(function (property) {
            return typeof object[property] == 'function';
        });
    }

    var jsFunctionDictionary = {}, jsObjectDictionary = {};

    var jsBasics = "Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|" + // Constructors
            "Namespace|QName|XML|XMLList|" + // E4X
            "ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|" +
            "Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|" +
            "Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|" + // Errors
            "SyntaxError|TypeError|URIError|" +
            "decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|isFinite|" + // Non-constructor functions
            "isNaN|parseFloat|parseInt|" +
            "JSON|Math|" + // Other
            "this|arguments|prototype|window|document|const|yield|import|get|set|" +
            "break|case|catch|continue|default|delete|do|else|finally|for|function|" +
            "if|in|instanceof|new|return|switch|throw|try|typeof|let|var|while|with|debugger|" +
            "__parent__|__count__|escape|unescape|with|__proto__|" +
            "class|enum|extends|super|export|implements|private|public|interface|package|protected|static|const|let|var|function|null|Infinity|NaN|undefined|alert|true|false";

    function initJavascriptDict () {
        if (typeof jsBasics === 'string') {
            var base = jsBasics.split('|');

            jsBasics = {};

            for (var x = 0; x < base.length; ++x) {
                if (base[x]) {

                    var description = '';
                    try {
                        var n = eval(base[x]);
                        description = typeof n;
                    }
                    catch (e) {

                    }

                    jsBasics[base[x]] = {desc: description};
                }
            }
        }

        var js = window;
        if (window.jQuery != null && typeof window.jQuery == 'function') {
            window._jQuery = window.jQuery();
        }



        for (var obj in window) {
            if (obj && obj != 'top' && obj != 'parent') {

                if (typeof window[obj] == 'function')
                {
                    jsFunctionDictionary[obj.toString()] = {desc: 'function'};
                }


                if (typeof window[obj] === 'object' || typeof window[obj] === obj.toString())
                {
                    jsObjectDictionary[obj.toString()] = {desc: 'object'};
                    for (var o in window[obj]) {

                        if (o && o != 'top' && o != 'parent')
                        {
                            if (typeof window[obj][o] == 'function')
                            {
                                jsFunctionDictionary[o.toString()] = {desc: 'function'};
                            }
                        }
                    }
                }
            }
        }
    }

    function hasType (e, t) {

        if (!e || !e.type)
            return !1;
        if (typeof e.type === 'undefined')
            return !1;

        var n = !0,
                r = e.type.split("."),
                i = t.split(".");
        return i.forEach(function (e) {
            if (r.indexOf(e) == -1)
                return n = !1, !1
        }), n
    }

    function findTagName (session, pos) {
        var i = ace.require("ace/token_iterator").TokenIterator,
                iterator = new i(session, pos.row, pos.column);
        var token = iterator.getCurrentToken();
        if (!token || !hasType(token, 'meta.tag') && !(hasType(token, 'text') && token.value.match('/'))) {
            do {
                token = iterator.stepBackward();
            } while (token &&
                    (
                            hasType(token, 'string') ||
                            hasType(token, 'cpconstante') || // for cms tags
                            hasType(token, 'cpfunction') || // for cms tags
                            hasType(token, 'cpvariable') || // for cms tags
                            hasType(token, 'cpconditions') || // for cms tags
                            hasType(token, 'keyword.operator') ||
                            hasType(token, 'entity.attribute-name') ||
                            hasType(token, 'text')
                            )
                    );
        }

        var back = iterator.stepBackward();

        if (token && (hasType(token, 'meta.tag') || hasType(token, 'meta.tag.name')) && !token.value.match(/\/?>$/) && (back && !back.value.match(/\/?>$/))) {
            return token.value;
        }
    }

    function findTagAttributName (session, pos) {
        var i = ace.require("ace/token_iterator").TokenIterator,
                iterator = new i(session, pos.row, pos.column);
        var token = iterator.getCurrentToken();
        if (!token || !hasType(token, 'entity.attribute-name') && !(hasType(token, 'text') && token.value.match('/'))) {
            do {
                token = iterator.stepBackward();
            } while (token && (
                    hasType(token, 'string') ||
                    hasType(token, 'cpconstante') || // for cms tags
                    hasType(token, 'cpfunction') || // for cms tags
                    hasType(token, 'cpvariable') || // for cms tags
                    hasType(token, 'cpconditions') || // for cms tags
                    hasType(token, 'keyword.operator') ||
                    hasType(token, 'text')) &&
                    !hasType(token, 'entity.attribute-name')
                    );
        }


        var back = iterator.stepBackward();

        if (token && hasType(token, 'entity.attribute-name') && (back && !back.value.match('/')))
        {
            return token.value;
        }
        return '';
    }

    function findTagAttributes (session, pos) {
        var attr = [], x = 0;
        var i = ace.require("ace/token_iterator").TokenIterator,
                iterator = new i(session, pos.row, pos.column);
        var token = iterator.getCurrentToken();
        if (!token || !hasType(token, 'meta.tag') && !(hasType(token, 'text') && token.value.match('/'))) {
            do {
                token = iterator.stepBackward();
                if (hasType(token, 'entity.attribute-name') && token.value)
                {
                    // var kk = [];
                    // kk[token.value] = true;
                    attr.push(token.value);
                }

            } while (token && (hasType(token, 'string') ||
                    hasType(token, 'cpconstante') || // for cms tags
                    hasType(token, 'cpfunction') || // for cms tags
                    hasType(token, 'cpvariable') || // for cms tags
                    hasType(token, 'cpconditions') || // for cms tags
                    hasType(token, 'keyword.operator') || hasType(token, 'entity.attribute-name') || hasType(token, 'text')));
        }

        var back = iterator.stepBackward();
        if (token && (hasType(token, 'meta.tag') || hasType(token, 'meta.tag.name')) && (back && !back.value.match('/')))
            return attr;
        else
            return [];
    }


    function isInAttribut (session, pos) {
        var i = ace.require("ace/token_iterator").TokenIterator,
                iterator = new i(session, pos.row, pos.column);
        var token = iterator.getCurrentToken();
        if (!token || !hasType(token, 'entity.attribute-name') && !hasType(token, 'keyword.operator') && !hasType(token, 'meta.tag') && !(hasType(token, 'text') && token.value.match('/'))) {
            do {
                token = iterator.stepBackward();
            } while (token && (
                    hasType(token, 'cpconstante') || // for cms tags
                    hasType(token, 'cpfunction') || // for cms tags
                    hasType(token, 'cpvariable') || // for cms tags
                    hasType(token, 'cpconditions') || // for cms tags
                    hasType(token, 'string') ||
                    hasType(token, 'text')
                    ) && !hasType(token, 'keyword.operator'));
        }

        var back = iterator.stepBackward();
        if (token && hasType(token, 'keyword.operator') && (back && !back.value.match('/')))
            return true;
        return false;
    }

    function isSpecialChar (str) {
        return str.substr(0, 1) === '&' ? true : false;
    }


    // var t;
    var Intellisense = function (editor, sourceEditor) {
        if (editor.Intellisense)
            return;
        editor.Intellisense = this;
        this.editor = editor;
        this.sourceEditor = sourceEditor;
        this.currentEvent = null;


        this.jsDictInited = false;
        this.phpDictInited = false;
        this.htmlDictInited = false;
        this.cssDictInited = false;

        this.editorMode = ace.sourceEditor.mode;


        var delay = 200, t;

        if (ace.sourceEditor.mode === 'html' || ace.sourceEditor.mode === 'xml') {
            initXML();
            initJavascriptDict();
            this.dictMode = 'html';

            this.jsDictInited = true;
            this.htmlDictInited = true;
        }
        else if (ace.sourceEditor.mode === 'js' || ace.sourceEditor.mode === 'javascript') {
            initJavascriptDict();
            this.dictMode = 'javascript';
            this.jsDictInited = true;
        }
        else if (ace.sourceEditor.mode === 'php') {
            initPhpDict();
            this.dictMode = 'php';
            delay = 300;
            this.phpDictInited = true;
        }
        else if (ace.sourceEditor.mode === 'css') {
            initCssDict();
            this.dictMode = 'css';
            this.cssDictInited = true;
        }
        else {
            this.dictMode = ace.sourceEditor.mode;
        }

        if (this.dictMode !== 'html' && this.dictMode !== 'javascript' && this.dictMode !== 'php')
        {
            return;
        }

        this.intellisenseNode || this.$init();
        //   this.update = this.update.bind(this);
        //   this.insert = this.insert.bind(this);

        //   this.insert = this.insert.bind(this);
        this.keyboardHandler = this._keyboardHandler();

        //     this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);


        /*
         var xself = this;
         
         editor.getSession().on('change', function () {
         if (ace.sourceEditor.EnableIntellisense) {
         var e = xself.currentEvent;
         
         if (e !== null)
         {
         var k = e.keyCode;
         
         if (xself.isVisible && (k === 13 || k === 9))
         {
         clearTimeout(t);
         intellisenseNode.display = 'none';
         xself.isVisible = false;
         return;
         }
         else if ((k === 13 || k === 9)) {
         clearTimeout(t);
         intellisenseNode.display = 'none';
         xself.isVisible = false;
         return;
         }
         clearTimeout(t);
         xself.refreshPosition();
         xself.refreshDictMode();
         
         
         t = setTimeout(function () {
         xself.update();
         }, delay);
         }
         }
         });
         */
    };

    (function () {

        this.tagname = '';
        this.attributeName = '';
        this.isInAttribute = false;
        this.dictMode = 'html';
        this.token = null;
        this.isAttribute = false;
        this.isVisible = false;
        this.isStartTag = false;

        this.replaceText = false;
        this.token = null;
        this.pos = null;
        this.basePos = null;
        this.session = null;

        this.hide = function () {
            this.isVisible = false;
            intellisenseNode.style.display = 'none';
            this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
        };

        this.getCompletions = function (tokenState, session, pos, prefix, basePos, bt) {
            var token = session.getTokenAt(pos.row, pos.column);

            if (!token) {
                if (this.isVisible) {
                    this.refreshPosition();
                }
                return false;
            }
            else {

                if (this.isVisible) {
                    this.refreshPosition();
                }

                this.refreshDictMode();

                var self = this, dictMode = this.dictMode;

                if (dictMode) {

                    var mode = session.getMode();
                    var found = false;
                    var replaceText = '';
                    var i = ace.require("ace/token_iterator").TokenIterator,
                            iterator = new i(session, pos.row, pos.column);
                    var backToken = iterator.stepBackward();

                    if (dictMode == 'html') {

                        if (bt.type == 'text' && (hasType(backToken, 'string') || backToken && backToken.type == 'string') ) {
                            return false;
                        }

                        if (hasType(backToken, 'meta.tag.punctuation.end') && (!hasType(token, 'invalid.illegal') && token.value != '&')) {
                            if (this.isVisible) {
                                this.refreshPosition();
                            }
                            return false;
                        }

                        var tagName = findTagName(session, pos), isAttributValue = false, specialChar = false;


                        if (tagName && (hasType(backToken, 'keyword.operator.separator') && hasType(token, 'string')) ||
                            (
                                hasType(backToken, 'string') &&
                                !backToken.value.match(/("|')$/g) &&
                                backToken.value.match(/^("|')/g) &&
                                hasType(token, 'text')
                                )
                            ) {
                            isAttributValue = true;
                        }

                        if ((hasType(token, 'invalid.illegal') && token.value == '&') || (hasType(backToken, 'invalid.illegal') && hasType(token, "text") && backToken.value == '&') ||
                                hasType(token, "tag-name") ||
                                hasType(token, 'meta.tag') ||
                                hasType(token, 'meta.tag.name') ||
                                (token.value == '<' && hasType(token, "text"))) {

                            found = this.getXmlTagCompletions(tokenState, session, pos, prefix, token, basePos, backToken);

                            if ((token.value == '<' && hasType(token, "text"))) {

                            }
                            else {

								if (hasType(backToken, 'invalid.illegal') && backToken.value == '&' ) {
									replaceText = '&' + token.value;
									specialChar = true;
								}
								else {
									if (
										( hasType(token, 'invalid.illegal') && token.value == '&' ) || (token.value != '<' && hasType(token, "meta.tag.name"))) {
										replaceText = token.value;
									}
								}
                            }
                        }

                        if (!specialChar && !isAttributValue && (hasType(token, 'text') || hasType(token, 'attribute-name') || hasType(token, 'entity.attribute-name'))) {
                            found = this.getXmlAttributeCompetions(tokenState, session, pos, prefix, token, basePos, tagName);
                            if (found !== false && !token.value.match(/\s{1,}$/g)) {
                                replaceText = token.value;
                            }
                        }

                        if (!specialChar && isAttributValue) {
                            found = this.getXmlAttributeValueCompetions(tokenState, session, pos, prefix, token, basePos, tagName);
                            if (found !== false) {
                                var currentVal = token.value;

                                if (currentVal.substr(0, 1) == '"' || currentVal.substr(0, 1) == "'") {
                                    currentVal = currentVal.substr(1);
                                }

                                if (currentVal.substr(-1) == '"' || currentVal.substr(-1) == "'") {
                                    currentVal = currentVal.substr(0, currentVal.length - 1);
                                }


                                replaceText = currentVal;
                            }
                        }


                    }

                    if (dictMode == 'css') {

                        found = this.senseCSS();
                        if (found && found !== false) {

                            if (/:[^;]*;$/.test(token.value)) {
                                replaceText = '';
                            }
                            else {
                                replaceText = token.value.replace(/^\s*([\w:]*)$/g, '$1');
                            }
                        }
                    }

                    if (dictMode == 'javascript') {
                        found = this.senseJavascript();

                        if (found && found !== false) {
                            if (!/\{\s*$/.test(token.value)) {
                                replaceText = token.value.replace(/^\s*([\w\-_\.:]*)$/g, '$1');

                                // do not remove object delimiter
                                if (replaceText === '.') {
                                    replaceText = '';
                                }
                            }
                        }
                    }


                    if (dictMode == 'php') {
                        found = this.sensePHP();
                        if (found && found !== false) {
                            if (!/\{\s*$/.test(token.value)) {
                                replaceText = token.value.replace(/^\s*([\w\-_\.:]*)$/g, '$1');

                                // do not remove object delimiter
                                if (replaceText === '$') {
                                    replaceText = '';
                                }
                            }
                        }


                    }


                    this.replaceText = replaceText;
                    this.token = token;
                    this.session = session;
                    this.pos = pos;
                    this.basePos = basePos;

                    if (found && found.length) {

                        intellisenseUL.innerHTML = '';
                        var tmp = '', x = 0;

                        var byName = found.slice(0);
                        byName.sort(function (a, b) {
                            var x = a.name.toLowerCase();
                            var y = b.name.toLowerCase();
                            return x < y ? -1 : x > y ? 1 : 0;
                        });

                        for (var index in byName) {
                            if (typeof byName[index] == 'object')
                            {
                                var item = byName[index];
                                var str = item.name;
                                if (this.editorMode === 'html' && item.type == 'html_specialchar') {
                                    str = str.replace('&', '&#38;');

                                }
                                str = str.replace('|', ' ');


                                if (item.type == 'html_specialchar') {
                                    tmp += '<li class="' + item.type + (x === 0 ? ' selected"' : '"') + (item.snipped ? ' snipped="' + item.snipped.replace(/"/g, '*q*') + '"' : '') + ' type="' + item.type + '" rel="' + item.name.replace('&', '&#38;') + '"><span class="label">' + str + '</span><span class="char">' + item.name + '</span><span class="desc">' + item.desc + '</span></li>';
                                }
                                else {
                                    tmp += '<li class="' + item.type + (x === 0 ? ' selected"' : '"') + (item.snipped ? ' snipped="' + item.snipped.replace(/"/g, '*q*') + '"' : '') + ' type="' + item.type + '" rel="' + item.name + '"><span class="label">' + str + '</span><span class="char"></span><span class="desc">' + item.desc + '</span></li>';
                                }
                                x++;
                            }
                        }

                        intellisenseUL.innerHTML = tmp;
                        this.tooltipWidth = intellisenseNode.offsetWidth;
                        this.tooltipHeight = intellisenseNode.offsetHeight;


                        $(intellisenseNode).find('li').on('dblclick', function (e) {

                            intellisenseNode.style.display = 'none';

                            self.pickComplete($(this).attr('rel'), $(this), replaceText, session, token, pos);
                            self.editor.keyBinding.removeKeyboardHandler(self.keyboardHandler);
                            self.editor.focus();
                            return false;
                        });


						this.isVisible = true;


						//       self.editor.keyBinding.removeKeyboardHandler(self.keyboardHandler);
						this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
						this.editor.focus();



						intellisenseNode.style.display = '';
						intellisenseNode.scrollTop = 0; // reset scrollpos

						this.refreshPosition();



                        return true;
                    }
                    else
                    {
                        intellisenseNode.style.display = 'none';
                        this.isVisible = false;
                        this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);

                        return false;
                    }
                }


                return false;
            }
        };


        this.getXmlTagCompletions = function (tokenState, session, pos, prefix, token, basePos, backToken) {

            var escape = false, self = this;
            var allElements = Object.keys(xmlDictionary);

            var elements = allElements, tagname = '';

            if ((token.value == '<' && hasType(token, "text"))) {

            }
            else {
                if (token.value != '<' && hasType(token, "meta.tag.name")) {
                    tagname = token.value;
                }
                else if (token.value == '&' && hasType(token, "invalid.illegal")) {
                    tagname = token.value;
                    escape = true;
                }
				else if (backToken.value == '&' && hasType(backToken, "invalid.illegal") && hasType(token, "text")) {
					tagname = backToken.value + token.value;
					escape = true;
				}
            }

            if (tagname) {
                elements = elements.filter(function (element) {
                    return element.indexOf(tagname) === 0;
                });
            }

            return elements.map(function (element) {
                return {
                    name: element,
                    desc: (isSpecialChar(element) ? 'specialchar' : 'tag'),
                    type: (isSpecialChar(element) ? 'html_specialchar' : 'html_tag')
                };
            });
        };

        this.getXmlAttributeCompetions = function (tokenState, session, pos, prefix, token, basePos, tagName) {
            if (!this.htmlDictInited)
            {
                initXML();
                this.htmlDictInited = true;
            }



            if ((typeof tagName == 'string' && !tagName.match(/^([a-zA-Z0-9_:\-]*)$/)) && hasType(token, 'text') && token.value.match(/^\s{1,}$/g)) {
                return false;
            }


            var attributes = [];
            if (tagName) {
                if (typeof xmlDictionary[tagName] == 'object') {
                    attributes = xmlDictionary[tagName];
                }
            }
            else {
                return false;
            }

            var elements = Object.keys(attributes);

            // remove existing attributes
            var existing = findTagAttributes(session, pos);
            for (var e in elements) {
                for (var k in existing) {
                    if (existing[k] == elements[e]) {
                        delete elements[e];
                    }
                }
            }


            if (token.value && (hasType(token, "entity.other.attribute-name") || hasType(token, 'entity.attribute-name'))) {
                elements = elements.filter(function (element) {
                    return (element.indexOf(token.value) === 0 && typeof existing[token.value] == 'undefined');
                });
            }


            return elements.map(function (attribut) {
                return {
                    name: attribut,
                    desc: 'attribut',
                    type: 'html_attribut',
                    snipped: attribut + '=""',
                };
            });

        };



        this.getXmlAttributeValueCompetions = function (tokenState, session, pos, prefix, token, basePos, tagName) {
            if (!this.htmlDictInited)
            {
                initXML();
                this.htmlDictInited = true;
            }

            if (typeof xmlDictionary[tagName] != 'object') {
                return false;
            }
            else {
                var attributes = xmlDictionary[tagName];
            }

            var attributName = findTagAttributName(session, pos);

            if (attributName)
            {
                if (typeof attributes[attributName] == 'object')
                {
                    var values = attributes[attributName], currentVal = token.value;

                    if (currentVal.substr(0, 1) == '"' || currentVal.substr(0, 1) == "'") {
                        currentVal = currentVal.substr(1);
                    }

                    if (currentVal.substr(-1) == '"' || currentVal.substr(-1) == "'") {
                        currentVal = currentVal.substr(0, currentVal.length - 1);
                    }

                    values = Object.keys(values);

                    if (currentVal) {
                        values = values.filter(function (value) {
                            return (value.indexOf(currentVal) === 0);
                        });
                    }



                    return values.map(function (value) {
                        return {
                            name: value,
                            desc: 'value',
                            type: 'html_value'
                        };
                    });
                }

                return false;
            }
            else {

				var attributesKeys = Object.keys(attributes);
				return attributesKeys.map(function (value) {
					return {
						name: value,
						desc: 'value',
						type: 'html_value'
					};
				});
                return false;
            }
        };

        this.pickComplete = function (name, li, replaceText, session, token, pos) {
            var self = this;

            if (replaceText.length) {
                var range, ranges = this.editor.selection.getAllRanges();
                for (var i = 0; range = ranges[i]; i++) {
                    range.start.column -= replaceText.length;
                    session.remove(range);
                }
            }

            this.editor.focus();

            if (li.attr('snipped')) {
                var snipped = li.attr('snipped');
                if (snipped.length) {

                    if (this.dictMode == 'html' && li.attr('type') == 'html_attribut') {

                        snipped = snipped.replace(/\*q\*/g, '"');
                        this.editor.execCommand("insertstring", snipped);

                        var pos = this.editor.getCursorPosition();
                        pos.column -= 1; // will go into value of yourtag="[here is the cursor]"
                        this.editor.moveCursorToPosition(pos);

                    }

                } else {
                    this.editor.execCommand("insertstring", name);
                }
            }
            else {


                if (this.dictMode == 'html' && li.attr('type') == 'html_value') {
                    this.editor.execCommand("insertstring", name);
                    var pos = this.editor.getCursorPosition();
                    pos.column += 1; // will go to yourtag="value is insert"[here is the cursor]
                    this.editor.moveCursorToPosition(pos);
                }
                else if (this.dictMode == 'html' && li.attr('type') == 'html_specialchar') {
                    this.editor.execCommand("insertstring", name);
                }
                else if (this.dictMode == 'css') {
                    if (name.match(/\|/)) {

                        var line = this.sourceEditor.getLine(pos.row).substr(0, pos.column);
                        var o, s, i = this.sourceEditor.getSelectionRange();
                        var length = name.length;
                        var index = name.indexOf('|');

                        if (/:[^;]+$/.test(line)) {
                            /([\w\-]+):[^:]*$/.test(line);
                            var st = RegExp.$1;
                            /\s+(\w*)$/.test(line), o = RegExp.$1;
                        }
                        else {
                            /([\w\-]*)$/.test(line), o = RegExp.$1;
                        }

                        if (index != -1) {
                            name = name.replace(/\|/, '');
                            var cursorpos = this.sourceEditor.getCursorPosition();
                            this.editor.execCommand("insertstring", name);
                            cursorpos.column = i.start.column + index;
                            this.sourceEditor.setCursorPosition(cursorpos);
                        }
                        else {
                            this.editor.execCommand("insertstring", name);
                        }


                    }
                    else {
							this.editor.execCommand("insertstring", name);
                    }
                }
                else {
                    this.editor.execCommand("insertstring", name);
                }
            }





        };


        this._keyboardHandler = function (e) {

            var self = this, keyboardHandler = new HashHandler();
            keyboardHandler.bindKeys({
                "Up": function (ed) {
                    if (self.isVisible) {
                        self.prev();
                        return true;
                    }
                },
                "Down": function (ed) {

                    if (self.isVisible) {
                        self.next();
                        return true;
                    }
                },
                "Esc": function (ed) {
                    if (self.isVisible) {
                        intellisenseNode.style.display = 'none';

                        self.editor.keyBinding.removeKeyboardHandler(self.keyboardHandler);
                        return false;
                    }
                },
                "Return": function (ed) {

                    if (self.isVisible) {
                        intellisenseNode.style.display = 'none';
                        var li = $(intellisenseUL).find('li.selected');
                        if (li.length == 1) {
                            self.pickComplete(li.attr('rel'), li, self.replaceText, self.session, self.token, self.pos);
                        }
                        self.editor.keyBinding.removeKeyboardHandler(self.keyboardHandler);
                        self.editor.focus();

						if (li.length == 1 && self.dictMode == 'html' && li.attr('type') == 'html_attribut') {
							intellisenseNode.style.display = 'block';
							var session = self.editor.getSession();
							var pos = self.editor.getCursorPosition();
							self.getCompletions(null, session, pos, '', pos);
						}
                        return true;
                    }
                }
            });

            return keyboardHandler;
        };

        this.prev = function () {
            var ul = $(intellisenseUL);
            if (ul.find('li.selected').prev().is('li')) {
                ul.find('li.selected').removeClass('selected').prev().addClass('selected');
                intellisenseNode.scrollTop -= ul.find('li.selected').height();
            }
        };

        this.next = function () {
            var ul = $(intellisenseUL);
            if (ul.find('li.selected').next().is('li')) {
                ul.find('li.selected').removeClass('selected').next().addClass('selected');
                intellisenseNode.scrollTop += ul.find('li.selected').height();
            }
        };





        this.setMode = function (mode) {
            this.dictMode = '';
            this.editorMode = mode;
        };


        this.refreshPosition = function () {
            var pos = pos = this.editor.getCursorPosition();
            var _pos = this.editor.renderer.$cursorLayer.getPixelPosition(pos, true);
            var rect = this.editor.container.getBoundingClientRect();
            var lineHeight = this.editor.renderer.layerConfig.lineHeight;
            _pos.top += rect.top - this.editor.renderer.layerConfig.offset;
            _pos.top += lineHeight;
            _pos.left += rect.left;
            _pos.left += this.editor.renderer.$gutterLayer.gutterWidth;
            _pos.left += 4;
            intellisenseNode.style.left = _pos.left + 'px';
            intellisenseNode.style.top = _pos.top + 'px';
        };


        this.refreshDictMode = function () {

            var range = this.editor.getSelectionRange();
            var session = this.editor.getSession();
            var v = range.start, y = session.getLine(v.row).substr(0, v.column);
            var w = v.row > 0 ? v.row - 1 : 0;
            var EditorState = session.getState(w, v.column);
            var mode = session.getMode(), x = mode.getTokenizer();
            var token = x.getLineTokens(y, EditorState, v.row);
            var tokenState = typeof token.state == "object" ? token.state[0] : token.state;
            var currentMode = this.dictMode !== "php" ? this.dictMode : "html";
            C = this.editorMode;

            if (tokenState != 'start') {
                var C = (tokenState.match(/(php|js|css)\-/i) || ["", currentMode])[1].toLowerCase(), C2 = C;
                var pos = this.editor.getCursorPosition();
                if (C !== 'html' && this.isHtmlTag(session, pos)) {
                    C = 'html';
                }
            }
            else {
                C = this.editorMode;
            }

            if (C === "html") {

                if (!this.htmlDictInited)
                {
                    initXML();
                    this.htmlDictInited = true;
                }

                this.dictMode = 'html';
            }
            else if (C == "css") {
                if (!this.jsDictInited)
                {
                    initCssDict();
                    this.cssDictInited = true;
                }
                this.dictMode = 'css';
            }
            else if (C == "js" || C == "javascript") {
                if (!this.jsDictInited)
                {
                    initJavascriptDict();
                    this.jsDictInited = true;
                }
                this.dictMode = 'javascript';
            }
            else if (C == "php") {

                if (!this.phpDictInited)
                {
                    initPhpDict();
                    this.phpDictInited = true;
                }

                this.dictMode = 'php';
            }


        };

        this.hide = function () {
            intellisenseNode.style.display = 'none';
            this.isVisible = false;
            this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
            return false;
        };

        this.findNames = function (tagname, attributename, str, dictionary, mode, attributes, forceUseTag) {
            var found = [], count = 0;
            if (dictionary && typeof dictionary == "object") {


                var dict = dictionary;

                if (mode === 'attribute' && tagname && typeof dictionary[tagname] != 'undefined') {
                    // Attributes only

                    dict = dictionary[tagname];
                    this.isInAttribute = false;
                }
                else if (tagname && attributename && mode === 'attribute_value' && typeof dictionary[tagname] != 'undefined' && typeof dictionary[tagname][attributename] != 'undefined') {
                    // Attribut values only
                    dict = dictionary[tagname][attributename];
                    str = str.replace(/(["'])/g, '');
                    this.isInAttribute = true;
                }
                else if (tagname && typeof dictionary[tagname] != 'undefined' && !forceUseTag) {
                    // html tag and attributes

                    if (this.isAttribute) {
                        dict = dictionary[tagname];
                        this.isInAttribute = false;

                    }
                    else {
                        // if (tagname.length) 
                    }

                    str = str.replace(' ', '').replace("    ", '');
                }


                if (str != '' && !str.match(/^\s*$/)) {
                    for (var name in dict) {
                        if (typeof name == 'string' && name.toLowerCase().indexOf(str.toLowerCase()) == 0) {


                            if (typeof attributes === 'object') {
                                // is html tag attribute
                                if (typeof attributes[name] === 'undefined' || !attributes[name]) {
                                    found[name] = {
                                        name: name,
                                        desc: (isSpecialChar(name) ? 'specialchar' : (this.isAttribute ? 'attribut' : (this.isInAttribute ? 'default value' : 'tag'))),
                                        type: (isSpecialChar(name) ? 'html_specialchar' : (this.isAttribute ? 'html_attribut' : (this.isInAttribute ? 'html_attribut_value' : 'html_tag')))
                                    };
                                    count++;
                                }
                            }
                            else {
                                // is html tag
                                found[name] = {
                                    name: name,
                                    desc: (isSpecialChar(name) ? 'specialchar' : (this.isAttribute ? 'attribut' : (this.isInAttribute ? 'default value' : 'tag'))),
                                    type: (this.isAttribute ? 'html_attribut' : (this.isInAttribute ? 'html_attribut_value' : 'html_tag'))
                                };
                                count++;
                            }
                        }
                    }
                }
                else {
                    for (var name in dict) {

                        if (this.isAttribute) {
                            if (typeof attributes === 'object') {
                                if (typeof attributes[name] == 'undefined' || !attributes[name]) {
                                    found[name] = {
                                        name: name,
                                        desc: (isSpecialChar(name) ? 'specialchar' : (this.isAttribute ? 'attribut' : (this.isInAttribute ? 'default value' : 'tag'))),
                                        type: (isSpecialChar(name) ? 'html_specialchar' : (this.isAttribute ? 'html_attribut' : (this.isInAttribute ? 'html_attribut_value' : 'html_tag')))
                                    };
                                    count++;

                                }
                            }
                            else {
                                found[name] = {
                                    name: name,
                                    desc: (isSpecialChar(name) ? 'specialchar' : (this.isAttribute ? 'attribut' : (this.isInAttribute ? 'default value' : 'tag'))),
                                    type: (this.isAttribute ? 'html_attribut' : (this.isInAttribute ? 'html_attribut_value' : 'html_tag'))
                                };
                                count++;
                            }
                        }
                        else {

                            if ((typeof attributes !== 'undefined' && attributes[name] !== true) || typeof attributes === 'undefined' || this.isInAttribute) {
                                if (this.isStartTag) {
                                    if (!isSpecialChar(name)) {
                                        found[name] = {
                                            name: name,
                                            desc: (this.isAttribute ? 'attribut' : (this.isInAttribute ? 'default value' : 'tag')),
                                            type: (this.isAttribute ? 'html_attribut' : (this.isInAttribute ? 'html_attribut_value' : 'html_tag'))
                                        };
                                        count++;
                                    }
                                }
                                else {
                                    found[name] = {
                                        name: name,
                                        desc: (isSpecialChar(name) ? 'specialchar' : (this.isAttribute ? 'attribut' : (this.isInAttribute ? 'default value' : 'tag'))),
                                        type: (isSpecialChar(name) ? 'html_specialchar' : (this.isAttribute ? 'html_attribut' : (this.isInAttribute ? 'html_attribut_value' : 'html_tag')))
                                    };
                                    count++;
                                }
                            }
                            else {
                                if (tagname == '' && str == '') {
                                    found[name] = {
                                        name: name,
                                        desc: (isSpecialChar(name) ? 'specialchar' : (this.isAttribute ? 'attribut' : (this.isInAttribute ? 'default value' : 'tag'))),
                                        type: (isSpecialChar(name) ? 'html_specialchar' : (this.isAttribute ? 'html_attribut' : (this.isInAttribute ? 'html_attribut_value' : 'html_tag')))
                                    };
                                    count++;
                                }
                            }
                        }
                    }
                }
            }
            found.length = count;
            found.sort();
            return found;
        };




        this.isHtmlTag = function (session, pos) {
            var i = ace.require("ace/token_iterator").TokenIterator,
                    iterator = new i(session, pos.row, pos.column);
            var token = iterator.getCurrentToken();
            if (!token || !hasType(token, 'meta.tag') && !(hasType(token, 'text') && token.value.match('/'))) {
                do {
                    token = iterator.stepBackward();
                } while (token && (
                        hasType(token, 'string') ||
                        hasType(token, 'cpconstante') || // for cms tags
                        hasType(token, 'cpfunction') || // for cms tags
                        hasType(token, 'cpvariable') || // for cms tags
                        hasType(token, 'cpconditions') || // for cms tags
                        hasType(token, 'keyword.operator') ||
                        hasType(token, 'entity.attribute-name') ||
                        hasType(token, 'text')
                        ));
            }

            var back = iterator.stepBackward();

            if (token && (hasType(token, 'meta.tag') || hasType(token, 'meta.tag.name')) && hasType(back, 'meta.tag.punctuation.begin')) {
                return token.value;
            }
            return false;
        };



        this.senseHtml = function () {
            var self = this, ev = event, r = this.editor.renderer;
            var mode, pos = this.editor.getCursorPosition();
            var session = this.editor.session;
            var token = session.getTokenAt(pos.row, pos.column), r = session.getState(pos.row, pos.column);
            var line = session.getLine(pos.row);
            var i = ace.require("ace/token_iterator").TokenIterator,
                    iterator = new i(session, pos.row, pos.column);
            var backToken = iterator.stepBackward(), isTag = false;


            if ((isTag = this.isHtmlTag(session, pos))) {
                isTag = true;
            }
            var isInAttribute = isInAttribut(this.editor.session, pos);


            if (!token || typeof token.value == 'undefined' ||
                    (typeof token.value != 'undefined' && (!isInAttribute && token.type === 'string' && !token.value.match(/^""$/))/*(token.value.match(/"$/) && token.type === 'string' && !token.value.match(/^""$/))*/ || token.value.match(/>$/))) {
                return [];
            }

            //      isTag = this.isHtmlTag(session, pos);


            if (!isTag && hasType(token, 'text') && hasType(backToken, 'meta.tag.name')) {
                var b = iterator.stepBackward();
                if (hasType(b, 'meta.tag.punctuation.begin')) {
                    isTag = true;
                }
            }
            else if (!isTag && hasType(token, 'text') && token.value.match(/<$/))
            {
                isTag = true;
            }
            else if (!isTag && (hasType(backToken, 'meta.tag.name') || hasType(backToken, 'keyword.operator.separator'))) {
                isTag = true;
            }

            if (((!token.value.match(/<$/) && token.type === 'text') || (backToken && !backToken.value.match(/<$/))) && !isTag) {
                return [];
            }




            /*
             
             if (r.indexOf('js-') !== -1)
             {
             return this.senseJavascript();
             }
             else {
             
             */
            this.dictMode = 'html';

            var tagname = findTagName(this.editor.session, pos);

            if (typeof tagname !== 'string' || tagname.match(/(<\/?|\/?>)/g))
            {
                if (r !== 'start' || hasType(token, 'meta.tag.punctuation.end') || (hasType(token, 'text') && line.replace(/\s*\t*/g, '') === '')) {
                    intellisenseNode.style.display = 'none';
                    this.isVisible = false;
                    this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
                    return false;
                }
            }

            this.isStartTag = false;
            this.isInAttribute = false;
            this.isAttribute = false;
            this.token = token;




            var forceUse = false, str = (!this.isStartTag ? token.value : '');


            if (isTag && tagname) {

            }




            if (hasType(backToken, 'string')) {
                this.isStartTag = false;
            }
            else if (!hasType(token, 'meta.tag.name') && (hasType(backToken, 'meta.tag.punctuation.begin') || hasType(token, 'meta.tag.punctuation.begin'))) {

                // return if exists the current Tag
                if (tagname && typeof xmlDictionary[tagname.toLowerCase()] != 'undefined') {
                    return [];
                }

                this.isStartTag = true;
                attributeName = '';
                tagname = '';
                str = token.value;
                forceUse = true;
                insertReplace = str;
            }
            else if (!hasType(token, 'meta.tag.name') && hasType(token, 'text') && token.value.match(/<$/)) {
                this.isStartTag = true;
                forceUse = false;
                tagname = '';
                attributeName = '';
            }

            if (str === '<' || this.isStartTag) {
                str = '';
            }




            if (!this.isStartTag)
            {
                var isAttribute = (hasType(token, 'entity.attribute-name') ? true : false);
                var attributes = findTagAttributes(this.editor.session, pos);
                var attributeName = findTagAttributName(this.editor.session, pos);


                mode = 'tagname';

                if ((token.type == 'text' && attributeName) || hasType(backToken, 'string')) {
                    attributeName = '';
                    isInAttribute = false;
                    isAttribute = true;
                }

                if (hasType(backToken, 'meta.tag.name')) {
                    mode = 'attribute';
                    this.isAttribute = true;
                }


                if (!isAttribute && !isInAttribute && (r !== "start_tag_stuff" && r !== 'start' && !isTag) && !this.isStartTag)
                {
                    intellisenseNode.style.display = 'none';
                    this.isVisible = false;
                    this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
                    return false;
                }

                insertReplace = str;
            }

            this.tagname = tagname;
            this.attributeName = attributeName;

            if (isAttribute && !isInAttribute && (token.type == 'text' || (attributeName && str.match(/\s$/)))) {
                mode = 'attribute';
                this.isAttribute = true;
            }


            if (!isAttribute && isInAttribute && attributeName) {
                mode = 'attribute_value';
                this.isInAttribute = true;
            }


            // specialchars
            if (hasType(token, 'invalid.illegal') && token.value === '&') {
                str = token.value;
                this.isStartTag = this.isStartTag ? false : true;
                insertReplace = str;
            }
            else if (backToken && hasType(backToken, 'invalid.illegal') && backToken.value === '&') {
                str = backToken.value + token.value;
                this.isStartTag = this.isStartTag ? false : true;
                insertReplace = str;
            }

            if (!forceUse && !isTag && this.isStartTag && !token.value.match(/<$/) && (backToken && !backToken.value.match(/<$/) && !backToken.value.match(/&$/)))
            {
                return [];
            }

            return this.findNames(tagname, attributeName, str, xmlDictionary, mode, attributes, forceUse);
            // }
        };


        var lastCharLen = 0;
        var insertReplace = '';
        var jsCache = null;

        this.findJsDict = function (currentStr) {

            try {
                var n = eval(currentStr);
                if (typeof n === 'object') {

                    var tmp = [], count = 0;
                    for (var o in n) {
                        if (typeof n[o] !== 'undefined')
                        {
                            var t = typeof n[o];

                            tmp[currentStr + '.' + o.toString()] = {name: o, desc: t, full: currentStr + '.' + o.toString(), type: 'js_' + t};
                            count++;
                        }
                    }
                    tmp.length = count;
                    return tmp;
                }
            }
            catch (e) {
                console.log([e]);
            }


            return {};
        };


        this.senseJavascript = function () {
            var found = [], count = 0, self = this, ev = event, r = this.editor.renderer;
            var mode, pos = this.editor.getCursorPosition();
            var session = this.editor.session;
            var token = session.getTokenAt(pos.row, pos.column), r = session.getState(pos.row, pos.column);
            var line = session.getLine(pos.row);

            if (!token || typeof token !== 'object') {
                return found;
            }

            var str = token.value.toLowerCase();
            insertReplace = str;

            this.token = token;

            var i = ace.require("ace/token_iterator").TokenIterator,
                    iterator = new i(session, pos.row, pos.column);


            var isClass = false, backToken = iterator.stepBackward(), useObjectDict = false;


            var isJquery = /\s*(jQuery|\$|\}?\s*\))\.?.*/.test(line);

            if (isJquery) {

                if (hasType(token, 'punctuation.operator') && hasType(backToken, 'paren.rparen')) {
                    useObjectDict = this.findJsDict('_jQuery');
                }
                else if (hasType(token, 'punctuation.operator') && !hasType(backToken, 'paren.rparen')) {
                    useObjectDict = this.findJsDict('_jQuery');
                }

                // 
                if (!useObjectDict)
                {
                    for (var k in jsFunctionDictionary) {
                        if (k && str !== k.substr(0, str.length).toLowerCase())
                            continue;

                        found.push({name: k, desc: jsFunctionDictionary[k].desc, type: 'js_function'});
                        count++;
                    }

                    for (var k in jsObjectDictionary) {
                        if (k && str !== k.substr(0, str.length).toLowerCase())
                            continue;

                        found.push({name: k, desc: jsObjectDictionary[k].desc, type: 'js_object'});
                        count++;
                    }

                    jsCache = found;
                    lastCharLen = str.length;

                }
                else {

                    if (insertReplace === '.')
                    {
                        insertReplace = '';
                    }

                    for (var k in useObjectDict) {
                        if (k && insertReplace !== k.substr(0, insertReplace.length).toLowerCase())
                            continue;

                        found.push({
                            full: typeof useObjectDict[k].full === 'string' ? useObjectDict[k].full : '',
                            name: useObjectDict[k].name,
                            desc: useObjectDict[k].desc,
                            type: useObjectDict[k].type
                        });
                        count++;
                    }

                    jsCache = found;
                    lastCharLen = insertReplace.length;
                }

                if (count) {
                    found.length = count;
                    found.sort();
                    return found;
                }
                else {
                    found = [];
                    jsCache = [];
                    lastCharLen = 0;
                }
            }



            if (hasType(token, 'identifier') || hasType(token, 'keyword.operator') || hasType(token, 'punctuation.operator') || hasType(token, 'storage.type') || hasType(backToken, 'storage.type')) {

                this.isStartTag = false;
                this.isInAttribute = false;

                // eg: this.
                if (hasType(token, 'punctuation.operator')) {
                    if (hasType(backToken, 'identifier') || hasType(backToken, 'variable.language') || hasType(backToken, 'support.constant'))
                    {

                        var s1 = '', arr = [], xtoken = token;

                        do {
                            xtoken = iterator.stepBackward();

                            if (xtoken.value && !hasType(xtoken, 'text') && !hasType(xtoken, 'punctuation.operator')) {
                                //s1 += '.' + xtoken.value;
                                arr.push(xtoken.value);
                            }

                        } while (xtoken && !hasType(xtoken, 'text') && (hasType(xtoken, 'identifier') || hasType(xtoken, 'support.constant') || hasType(xtoken, 'variable.language') || hasType(xtoken, 'keyword.operator') || hasType(xtoken, 'punctuation.operator')));

                        arr.reverse();
                        s1 = arr.join('.');

                        if (s1) {
                            s1 += (s1.substr(-1) !== '.' ? '.' : '') + backToken.value;
                        }
                        else {
                            s1 = backToken.value;
                        }

                        if (s1.substr(-1) == '.') {
                            s1 = s1.substr(0, -1);
                        }

                        insertReplace = s1.toLowerCase() + str;

                        useObjectDict = this.findJsDict(s1);
                        //insertReplace = backToken.value.toLowerCase() + str;
                    }
                }

                if (hasType(backToken, 'punctuation.operator')) {
                    if (hasType(token, 'identifier'))
                    {
                        var s = '', arr = [], xtoken = token;

                        do {
                            xtoken = iterator.stepBackward();

                            if (xtoken.value && !hasType(xtoken, 'text') && !hasType(xtoken, 'punctuation.operator')) {
                                //s += '.' + xtoken.value;
                                arr.push(xtoken.value);
                            }

                        } while (xtoken && !hasType(xtoken, 'text') && (hasType(xtoken, 'identifier') || hasType(xtoken, 'support.constant') || hasType(xtoken, 'variable.language') || hasType(xtoken, 'keyword.operator') || hasType(xtoken, 'punctuation.operator')));

                        arr.reverse();
                        s = arr.join('.');

                        if (s.substr(0, 1) === '.') {
                            s = s.substr(1);
                        }

                        insertReplace = s.toLowerCase() + '.' + str;
                        useObjectDict = this.findJsDict(s);

                    }
                }

                if (isJquery && hasType(token, 'punctuation.operator') && hasType(backToken, 'paren.rparen')) {
                    useObjectDict = this.findJsDict('_jQuery');
                }
                else if (isJquery && hasType(token, 'punctuation.operator') && !hasType(backToken, 'paren.rparen')) {
                    useObjectDict = this.findJsDict('_jQuery');
                }

                // 
                if (!useObjectDict)
                {
                    for (var k in jsFunctionDictionary) {
                        if (k && str !== k.substr(0, str.length).toLowerCase())
                            continue;

                        found.push({name: k, desc: jsFunctionDictionary[k].desc, type: 'js_function'});
                        count++;
                    }

                    for (var k in jsObjectDictionary) {
                        if (k && str !== k.substr(0, str.length).toLowerCase())
                            continue;

                        found.push({name: k, desc: jsObjectDictionary[k].desc, type: 'js_object'});
                        count++;
                    }

                    jsCache = found;
                    lastCharLen = str.length;

                }
                else {

                    for (var k in useObjectDict) {
                        if (k && insertReplace !== k.substr(0, insertReplace.length).toLowerCase())
                            continue;

                        found.push({
                            full: typeof useObjectDict[k].full === 'string' ? useObjectDict[k].full : '',
                            name: useObjectDict[k].name,
                            desc: useObjectDict[k].desc,
                            type: useObjectDict[k].type
                        });
                        count++;
                    }

                    jsCache = found;
                    lastCharLen = insertReplace.length;
                }
            }

            found.length = count;
            found.sort();
            return found;
        };


        this.sensePHP = function () {
            var found = [], count = 0, self = this, ev = event, r = this.editor.renderer;
            var mode, pos = this.editor.getCursorPosition();
            var session = this.editor.session;
            var token = session.getTokenAt(pos.row, pos.column), r = session.getState(pos.row, pos.column);
            //var line = session.getLine(pos.row);

            if (!token || typeof token !== 'object') {
                return found;
            }

            var str = token.value.toLowerCase();
            insertReplace = str;
            var i = ace.require("ace/token_iterator").TokenIterator,
                    iterator = new i(session, pos.row, pos.column);

            var isClass = false, backToken = iterator.stepBackward();
            this.token = token;


            if (hasType(token, 'identifier') || hasType(token, 'variable') || hasType(token, 'keyword') || hasType(token, 'keyword.operator') || (hasType(backToken, 'support.function') && str == ':' || str == '::'))
            {
                if (hasType(token, 'identifier') || hasType(token, 'keyword') || hasType(token, 'keyword.operator') || hasType(backToken, 'support.function') || str == ':' || str == '::')
                {
                    if (hasType(backToken, 'support.class') || (hasType(backToken, 'support.function') && (str == ':' || str == '::'))) {
                        str = backToken.value.toLowerCase() + str;

                        insertReplace = str;
                        isClass = true;
                    }
                    else if (hasType(backToken, 'keyword.operator')) {
                        var backToken2 = iterator.stepBackward()
                        if (hasType(backToken2, 'support.class')) {

                            str = backToken2.value.toLowerCase() + backToken.value.toLowerCase() + str;

                            insertReplace = str;
                            isClass = true;
                        }
                    }
                }
                /*
                 
                 // is in cache?
                 if (phpCache !== null && str.length > lastCharLen)
                 {
                 var x = -1, l = phpCache.length;
                 
                 var f = phpCache;
                 
                 if (token.value && hasType(token, "keyword") ) {
                 f = f.filter(function (element) {
                 return (element.name.indexOf(token.value) === 0 && element.name.type == 'php_keyword');
                 });
                 }
                 else if (token.value && ( hasType(token, "function") || hasType(backToken, 'support.function') ) ) {
                 f = f.filter(function (element) {
                 return (element.name.indexOf(token.value) === 0 && element.name.type == 'php_function' );
                 });
                 }
                 
                 
                 while (x++ != l) {
                 if (typeof phpCache[x] === 'undefined' || typeof phpCache[x].name === 'undefined' )
                 continue;
                 
                 if (token.value != phpCache[x].name.substr(0, token.value.length).toLowerCase())
                 continue;
                 
                 if (hasType(token, "function") || hasType(token, 'support.function') || hasType(token, "keyword") || hasType(token, 'identifier')) {
                 var t = token.type.replace('support.', '');
                 
                 if (phpCache[x].type != 'php_'+t) {
                 continue;
                 }
                 
                 
                 }
                 
                 
                 found.push({name: phpCache[x].name, desc: phpCache[x].desc, type: phpCache[x].type});
                 count++;
                 }
                 
                 found.length = count;
                 
                 
                 if (found.length)
                 {
                 found.sort();
                 lastCharLen = str.length;
                 phpCache = found;
                 return found;
                 }
                 }
                 else {
                 phpCache = null;
                 }
                 
                 */


                if (hasType(token, 'keyword.operator') && !isClass || (hasType(token, 'identifier') && !isClass && hasType(backToken, 'keyword.operator') && str != ':' && str != '::')) {
                    for (var k in phpVarDictionary) {
                        if (k && str != k.substr(0, str.length).toLowerCase())
                            continue;

                        found.push({name: k, desc: 'variable', type: 'php_var'});
                        count++;
                    }
                }
                else if (hasType(token, 'identifier') || hasType(token, 'variable')) {
                    for (var k in phpVarDictionary) {
                        if (k && str != k.substr(0, str.length).toLowerCase())
                            continue;

                        found.push({name: k, desc: 'variable', type: 'php_var'});
                        count++;
                    }
                    for (var k in phpKeywordDictionary) {

                        if (k && str != k.substr(0, str.length).toLowerCase())
                            continue;

                        found.push({name: k, desc: 'keyword', type: 'php_keyword'});
                        count++;
                    }
                    


                    var i = -1, l = phpFunctionDictionary.length - 1;
                    while (i++ != l) {
                        if (phpFunctionDictionary[i]) {
                            var k = phpFunctionDictionary[i].name;
                            if (k && str != k.substr(0, str.length).toLowerCase())
                                continue;
                            found.push({name: k, desc: 'function', type: 'php_function'});
                            count++;
                        }
                    }

                }
                else if (hasType(token, 'keyword')) {
                    for (var k in phpKeywordDictionary) {

                        if (k && str != k.substr(0, str.length).toLowerCase())
                            continue;

                        found.push({name: k, desc: 'keyword', type: 'php_keyword'});
                        count++;
                    }

                    if (str.length) {

                        var i = -1, l = phpFunctionDictionary.length - 1;
                        while (i++ != l) {
                            if (phpFunctionDictionary[i]) {
                                var k = phpFunctionDictionary[i].name;
                                if (k && str != k.substr(0, str.length).toLowerCase())
                                    continue;
                                found.push({name: k, desc: 'function', type: 'php_function'});
                                count++;
                            }
                        }
                    }
                }
                else
                {
                    if (hasType(token, 'identifier')) {
                        for (var k in phpKeywordDictionary) {
                            if (k && str != k.substr(0, str.length).toLowerCase())
                                continue;

                            found.push({name: k, desc: 'keyword', type: 'php_keyword'});
                            count++;
                        }

                        for (var k in phpConstructsDictionary) {
                            if (k && str !== k.substr(0, str.length).toLowerCase())
                                continue;

                            found.push({name: k, desc: 'construct', type: 'php_construct'});
                            count++;
                        }

                        if (str.length) {
                            var i = -1, l = phpFunctionDictionary.length - 1;
                            while (i++ != l) {
                                if (phpFunctionDictionary[i]) {
                                    var k = phpFunctionDictionary[i].name;
                                    if (k && str != k.substr(0, str.length).toLowerCase())
                                        continue;
                                    found.push({name: k, desc: 'function', type: 'php_function'});
                                    count++;
                                }
                            }
                        }
                    }
                    else if (isClass) {

                        if (str.length) {
                            var i = -1, l = phpFunctionDictionary.length - 1;
                            while (i++ != l) {
                                if (phpFunctionDictionary[i]) {
                                    var k = phpFunctionDictionary[i].name;
                                    if (k && str != k.substr(0, str.length).toLowerCase())
                                        continue;
                                    found.push({name: k, desc: 'class function', type: 'php_class_function'});
                                    count++;
                                }
                            }
                        }
                    }
                }

                found.sort();
            }
            found.length = count;
            lastCharLen = str.length;
            // phpCache = found.length > 0 ? found : null;
            return found;
        };


        this.findCssVariable = function (session, pos) {
            var i = ace.require("ace/token_iterator").TokenIterator,
                    iterator = new i(session, pos.row, pos.column);
            var token = iterator.getCurrentToken();
            if (!token || !hasType(token, 'support.type') && !(hasType(token, 'text') && token.value.match('\{'))) {
                do {
                    token = iterator.stepBackward();
                } while (token && !token.value.match('\{') && (hasType(token, 'string') || hasType(token, 'keyword.operator') || hasType(token, 'text') || hasType(token, 'support.constant')));
            }

            var back = iterator.stepBackward();
            var next = iterator.stepForward();

            if (token && (hasType(token, 'support.type'))) {
                return token.value;
            }

            return false;
        };


        this.senseCSS = function () {
            var found = [], count = 0, self = this, ev = event, r = this.editor.renderer;
            var mode, pos = this.editor.getCursorPosition();
            var session = this.editor.session;
            var token = session.getTokenAt(pos.row, pos.column), r = session.getState(pos.row, pos.column);
            var line = session.getLine(pos.row);

            if (!token || typeof token !== 'object') {
                return found;
            }


            var str = token.value.toLowerCase();
            insertReplace = token.value;

            var i = ace.require("ace/token_iterator").TokenIterator,
                    iterator = new i(session, pos.row, pos.column);


            var isValid = false;

            if (token && !(hasType(token, 'paren.lparen') && !token.value.match(/\{\s*$/))) {
                var sToken = token;

                while (sToken) {

                    if (hasType(sToken, 'paren.lparen') || sToken.value.match(/\{\s*$/)) {
                        isValid = true;
                        sToken = false;
                        break;
                    }
                    sToken = iterator.stepBackward();
                }
            }

            if (hasType(token, 'paren.lparen') || token.value.match(/\{\s*$/)) {
                isValid = true;
            }

            if (!isValid) {
                return [];
            }

            var isClass = false, backToken = iterator.stepBackward();

            this.token = token;

            var lineBeforeCursorStr = line.substr(0, pos.column);
            var lineStartStr = line.substr(pos.column);
            var variable = this.findCssVariable(session, pos);






            var m = token.value.match(/^\s*\t*([a-z0-9\-]+)\s*\t*:?$/ig), isValue = false, isVarname = false, varname = '', valueStr = '';



            if (hasType(token, 'paren.rparen') && variable || lineBeforeCursorStr.match(/\s*}\s*$/) && variable) {
                variable = '';
                insertReplace = lineBeforeCursorStr.replace(/\s*}/, '');
                isValue = false;
                isVarname = false;
            }

            if (!variable)
            {
                if (line.match(/^\s*\t*-([a-z\-]*):?\s*$/ig)) {
                    variable = line.replace(/^\s*\t*-([a-z][a-z\-]*):?\s*$/ig, '-$1');
                }

                if (line.match(/^\s*\t*([a-z\-]*):?\s*$/ig)) {
                    variable = line.replace(/^\s*\t*([a-z][a-z\-]*):?\s*$/ig, '$1');
                    variable = variable.replace(/\s*\t*/, '');
                    insertReplace = variable;    // for insert
                    isValue = false;
                    isVarname = true;
                }

                if (lineStartStr != '' && lineStartStr.match(/^\s*\t*([a-z\-]*):?\s*$/ig)) {
                    variable = lineStartStr.replace(/^\s*\t*([^;]*)?\s*\t*$/ig, '$1');
                    variable = variable.replace(/\s*\t*/, '');

                    if (variable) {
                        isValue = false;
                        isVarname = true;
                    }

                    if (token.value.match(/\s*;\s\s*/) && isVarname)
                    {
                        insertReplace = ' ';    // for insert
                    }
                }
            }




            if (variable || (backToken && hasType(backToken, 'paren.lparen'))) {
                if (backToken && hasType(backToken, 'paren.lparen') && !variable) {
                    isValue = false;
                    isVarname = true;
                    insertReplace = '';    // for insert
                }
                else if (variable) {

                    // is in variable
                    if (lineStartStr.match(/^\s*:/)) {
                        isValue = false;
                        isVarname = true;
                        insertReplace = variable;    // for insert
                    }

                    // cursor is in css value
                    if (lineBeforeCursorStr.match(/([a-z0-9\-]+)\s*:\s*$/i)) {
                        isValue = true;
                        isVarname = false;


                        var matchValue = lineStartStr.match(/^([^;]*)/);
                        if (matchValue) {
                            if (matchValue[1])
                            {
                                valueStr = matchValue[1];
                                insertReplace = valueStr;    // for insert

                                valueStr = valueStr.replace(/\s*/, '');
                            }
                        }
                    }

                    if (lineBeforeCursorStr.match(/^\s*\t*([a-z0-9\-][a-z0-9\-]*)\s*$/i)) {

                        valueStr = lineBeforeCursorStr.replace(/^\s*\t*([a-z0-9\-]*)\s*$/i, '$1');
                        valueStr = variable.replace(/\s*\t*/, '');
                        insertReplace = variable;    // for insert
                        isVarname = true;
                        isValue = false;
                    }
                }
            }
            else if (!variable && !lineBeforeCursorStr.match(/([a-z0-9\-][a-z0-9\-]*)\s*$/i) && backToken && (hasType(backToken, 'paren.lparen') || backToken.value.match(/\s*/)))
            {
                isVarname = true;
                isValue = false;
            }
            else if (!variable && lineBeforeCursorStr.match(/([a-z0-9\-][a-z0-9\-]*)\s*$/i)) {

                variable = lineBeforeCursorStr.replace(/([a-z0-9\-]*)\s*$/i, '$1');
                variable = variable.replace(/\s*\t*/, '');
                insertReplace = variable;    // for insert
                isVarname = true;
                isValue = false;
            }

            // is new variable
            if (lineBeforeCursorStr.match(/;\s*$/)) {
                isValue = false;
                isVarname = true;
                variable = '';
                insertReplace = '';    // for insert
            }


            if (backToken && (hasType(backToken, 'paren.rparen') || backToken.value.match(/}\s*$/))) {
                isValue = false;
                isVarname = false;
            }




            /*
             
             
             if ((hasType(token, 'text') && (!backToken || backToken && !hasType(backToken, 'support.constant') && !hasType(backToken, 'paren.lparen') && !backToken.value.match(/;\s*$/) && !hasType(backToken, 'support.type'))) || hasType(token, 'variable') || hasType(token, 'paren.lparen'))
             {
             if ((hasType(token, 'text') && (token.value.match(/\s*$/) || token.value == '.' || token.value == '@' || token.value == '#'))) {
             return [];
             }
             if (hasType(token, 'variable') || line.match(/\.\w+$/) || line.match(/{$/) || line.match(/^}$/))
             {
             return [];
             }
             if (hasType(token, 'paren.lparen')) {
             return [];
             }
             }
             
             
             
             if (hasType(backToken, 'support.type') && backToken && backToken.value.match(/^([a-z0-9\-]+)$/i)) {
             isValue = true;
             varname = backToken.value;
             }
             else if (token.value.match(/^\s*\t*-$/ig) || token.value.match(/^\s*\t*-([a-z0-9\-]+)\s*\t*$/ig)) {
             isValue = false;
             }
             else if (token.value.match(/^\s*\t*([a-z0-9\-]+)\s*\t*:?$/ig)) {
             m = token.value.replace(/^\s*\t*([a-z0-9\-]+)\s*\t*:?$/ig, '$1');
             if (typeof m === 'string' && m.length) {
             isValue = true;
             varname = m;
              }
             }
             else if (hasType(backToken, 'support.constant') && token.match(/^\s*$/)) {
             
             }
             */

            if (token && isVarname || isValue) {

                var str = token.value.replace(/\s*/g, '').toLowerCase();

                if (isVarname) {
                    str = typeof variable === 'string' ? variable.toLowerCase() : '';
                }


                if (isValue) {
                    str = typeof variable === 'string' ? variable.toLowerCase() : '';
                }


                if (!cssDictionary.length) {
                    initCssDict();
                    this.cssDictInited = true;
                }

                if (cssDictionary.length && str.length) {

                    var i = -1, l = cssDictionary.length - 1;
                    while (i++ != l) {
                        if (cssDictionary[i]) {
                            var k = cssDictionary[i].name;
                            if (k && str !== k.substr(0, str.length).toLowerCase())
                            {
                                continue;
                            }

                            if (isValue && k.toLowerCase() === variable) {
                                var strClean = valueStr.replace(/^\s*$/, '');
                                if (typeof cssDictionary[i].attributes === 'object') {
                                    for (var v in cssDictionary[i].attributes) {
                                        if (strClean && v && strClean !== v.substr(0, strClean.length).toLowerCase())
                                        {
                                            continue;
                                        }
                                        found.push({name: v, desc: 'value', type: 'css_value'});
                                        count++;
                                    }
                                }
                            }
                            else {
                                if (!isValue) {
                                    found.push({name: k, desc: 'function', type: 'css_var'});
                                    count++;
                                }
                            }
                        }
                    }

                    found.length = count;
                    found.sort();



                    return found;

                }
            }



        };


        this.update = function () {

            var l, self = this, ev = event, r = this.editor.renderer;
            var found;
            $('body').css({cursor: 'wait'});
            insertReplace = '';

            if (this.dictMode === 'html') {
                found = this.senseHtml();
            }
            else if (this.dictMode === 'javascript')
            {
                found = this.senseJavascript();
            }
            else if (this.dictMode === 'php')
            {
                found = this.sensePHP();
            }
            else if (this.dictMode === 'css')
            {
                found = this.senseCSS();
            }
            else {

                if (this.editorMode === 'html') {
                    found = this.senseHtml();
                }
                else if (this.editorMode === 'javascript') {
                    found = this.senseJavascript();
                }
                else if (this.editorMode === 'php') {
                    found = this.sensePHP();
                }
                else if (this.editorMode === 'css') {
                    found = this.senseCSS();
                }
            }


            if (found && found.length) {

                //    this.refreshPosition();

                intellisenseUL.innerHTML = '';

                var i = -1, tmp = '';
                //  l = found.length - 1;


                for (var k in found) {
                    if (typeof found[k] == 'object')
                    {
                        var str = found[k].name;
                        if (this.editorMode === 'html') {
                            if (str.substr(0, 1) === '&') {
                                str = str.replace('&', '&amp;');
                            }
                        }
                        str = str.replace('|', ' ');
                        i++;
                        tmp += '<li class="' + found[k].type + (i === 0 ? ' selected"' : '"') + ' type="' + found[k].type + '" rel="' + k + '"><span>' + str + '</span><span>' + found[k].desc + '</span></li>';
                    }
                }
                intellisenseUL.innerHTML = tmp;

                this.tooltipWidth = intellisenseNode.offsetWidth;
                this.tooltipHeight = intellisenseNode.offsetHeight;


                $(intellisenseNode).find('li').on('click', function (e) {
                    // self.editor.jqEvent = e;
                }).on('dblclick', function (e) {
                    // self.editor.jqEvent = e;
                    self.insert($(this).attr('rel'), $(this));
                    intellisenseNode.style.display = 'none';
                });

                intellisenseNode.style.display = '';
                intellisenseNode.scrollTop = 0; // reset scrollpos

                this.isVisible = true;
                this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
                this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
                this.editor.focus();
                //    $('body').css({cursor: ''});
            }
            else {
                //    $('body').css({cursor: ''});

                intellisenseNode.style.display = 'none';
                this.isVisible = false;
                this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
            }
        };


        this.setLine = function (e, t) {
            return this.editor.gotoLine(e), this.editor.selection.selectLineEnd(), this.insert(t);
        };

        this.setSelectionRange = function (e) {
            var t = ace.require("ace/range").Range;
            return this.editor.selection.setSelectionRange(new t(e.start.row, e.start.column, e.end.row, e.end.column))
        };

        this.insert = function (e, t) {
            if (t)
                var n = this.editor.getSelectionRange(this.editor);
            this.editor.insert(e);
            if (t) {
                var r = this.editor.getSelectionRange(this.editor);
                this.setSelectionRange({
                    start: n.start,
                    end: r.end
                })
            }
        };

        this.insert = function (name, jqLi) {
            if (this.token && this.token.value) {

                var pos = this.editor.getCursorPosition();
                var line = this.editor.session.getLine(pos.row);
                var lineAfter = line.substr(pos.column), linebefore = line.substr(0, pos.column);
                var className = jqLi.attr('type').split('_');




                if (!this.isInAttribute && !this.isStartTag || (insertReplace && insertReplace !== '""' && insertReplace !== "''")) {


                    if (!this.isInAttribute && (this.editorMode === 'html' || this.editorMode === 'xml')) {
                        if (insertReplace && insertReplace !== this.token.value && insertReplace.match(/^([\$\.a-z0-9_-]+)$/i)) {
                            var ranges = this.editor.selection.getAllRanges();
                            for (var i = 0, range; range = ranges[i]; i++) {
                                range.start.column -= (this.editorMode === 'php' || insertReplace ? insertReplace.length : this.token.value.length);
                                this.editor.session.remove(range);
                            }
                        }
                        else if (this.token.value && this.token.value.match(/^([\$\.a-z0-9_-]+)$/i)) {
                            var ranges = this.editor.selection.getAllRanges();
                            for (var i = 0, range; range = ranges[i]; i++) {
                                range.start.column -= (this.editorMode === 'php' || insertReplace ? insertReplace.length : this.token.value.length);
                                this.editor.session.remove(range);
                            }
                        }
                        else if (insertReplace && insertReplace == this.token.value && (!insertReplace.match(/^\s*$/) || !this.token.value.match(/^\s*$/))) {
                            var ranges = this.editor.selection.getAllRanges();
                            for (var i = 0, range; range = ranges[i]; i++) {
                                range.start.column -= (this.editorMode === 'php' || insertReplace ? insertReplace.length : this.token.value.length);
                                this.editor.session.remove(range);
                            }
                        }
                    }
                    else {

                    }
                }

                if (this.isInAttribute && (this.editorMode === 'html' || this.editorMode === 'xml') && this.token.value !== '""' && this.token.value !== "''")
                {
                    var ranges = this.editor.selection.getAllRanges();
                    for (var i = 0, range; range = ranges[i]; i++) {
                        range.start.column -= this.token.value.length - 2;
                        this.editor.session.remove(range);
                    }
                }


                var moveCursorForward = 0, str = name + (!this.isAttribute && !this.isInAttribute && this.editorMode === 'html' && className[0] !== 'php' && className[0] !== 'js' ? '' : '');



                if (className[0] == 'css' && className[1] != 'value') {
                    if (lineAfter.match(/^\s*\t*:/)) {
                        lineAfter = lineAfter.replace(/^(\s*\t*:)/, '$1');
                        str = str.replace(/:$/, '');
                        moveCursorForward = parseInt(lineAfter.length);
                    }
                }



                if (!this.isInAttribute && this.isAttribute && this.dictMode === 'html') {
                    str = (this.token.value.match(/^\s\s*$/) ? '' : ' ') + name + '=""';
                }

                /*
                 if (className[0] == 'js' && className[1] == 'object' || this.dictMode === 'javascript') {
                 str += '.';
                 }
                 */
                if (className[0] == 'css') {

                    var p = str.indexOf('|');

                    if (str.indexOf('|') !== -1 && p > 1) {
                        p += 2;
                    }

                    if (str.match(/^#/)) {
                        p = 1;
                    }

                    str = str.replace('|', ' ');

                }


                this.editor.execCommand("insertstring", str);

                if (className[0] == 'css') {
                    if (className[1] == 'value')
                    {
                        var pos = this.editor.getCursorPosition();
                        pos.column -= p;
                        this.editor.moveCursorToPosition(pos);
                    }

                    if (moveCursorForward) {
                        var pos = this.editor.getCursorPosition();
                        pos.column += moveCursorForward;
                        this.editor.moveCursorToPosition(pos);
                    }

                    this.isStartTag = false;
                    this.isInAttribute = false;
                    this.isAttribute = false;

                    this.editor.focus();
                    insertReplace = '';
                    return;
                }





                if (this.isStartTag) {
                    this.isStartTag = false;
                    this.isInAttribute = false;
                    this.isAttribute = false;
                    insertReplace = '';
                    this.editor.focus();
                    return;
                }


                if (this.isInAttribute && (this.dictMode === 'html' || this.dictMode === 'xml')) {

                    var pos = this.editor.getCursorPosition();
                    pos.column += 1;
                    this.editor.moveCursorToPosition(pos);
                    this.editor.execCommand("insertstring", ' ');
                }

                if (!this.isInAttribute && this.isAttribute && (this.dictMode === 'html' || this.dictMode === 'xml')) {
                    var pos = this.editor.getCursorPosition();
                    pos.column -= 1;
                    this.editor.moveCursorToPosition(pos);
                }

                this.isStartTag = false;
                this.isInAttribute = false;
                this.isAttribute = false;

                this.editor.focus();
                insertReplace = '';
            }
        };


        this.$init = function () {


			var node = $('<div style="position:fixed;display: none;z-index: 1000"></div>');
			node.appendTo($('#'+ Config.get('fullscreenContainerId') ));
			intellisenseNode = node.get(0);




			//	intellisenseNode = document.documentElement.appendChild(dom.createElement("div"));
            var st = intellisenseNode.style;
            intellisenseNode.className = 'ace-intellisense';
            st.position = "fixed";
            st.display = "none";
            st.zIndex = 1000;
            intellisenseContainer = dom.createElement("div");
            intellisenseUL = dom.createElement("ul");
            intellisenseContainer.appendChild(intellisenseUL);
            intellisenseNode.appendChild(intellisenseContainer);
            return intellisenseNode;
        };

        this.destroy = function () {
            intellisenseNode.style.display = 'none';
            this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
            delete this.editor.Intellisense;
        };
    }).call(Intellisense.prototype);

    exports.Intellisense = Intellisense;
});