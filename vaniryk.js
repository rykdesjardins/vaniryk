var _vanirykDOMObject = function(oObj) {
    this.oObj = oObj;
    this.originalDisplay = oObj.style.display;
    this.type = "_vanirykDOMObject";
    
    this.addClass = function(str) {
        oObj.classList.add(str);
        return this;
    };  
    
    this.removeClass = function(str) {
        oObj.classList.remove(str);   
        return this;
    };
    
    this.hasClass = function(str) {
        return oObj.classList.contains(str);  
    };
    
    this.parent = function() {
        return new _vanirykDOMObject(oObj.parentElement);  
    }
    
    this.empty = function() {
        this.html("");
        return this;
    }
    
    this.style = function(prop_Arr, val) {
        if (val) {
            if (typeof prop_Arr === "string") {
                oObj.style[prop_Arr] = val;   
            } else {
                for (var prop in prop_Arr) {
                    oObj.style[prop] = prop_Arr[prop];   
                }
            }
            return this;   
        } else {
            return oObj.style[prop_Arr];
        }
    };
    
    this.hide = function() {
        oObj.style.display = "none";   
        return this;
    };
    
    this.show = function() {
        if (this.originalDisplay && this.originalDisplay != 'none') {
            oObj.style.display = this.originalDisplay;
        } else {
            oObj.style.display = "block";
        }
        return this;
    };
    
    this.bind = function(ev, cb, once) {
        var clickev = function(e) {
            cb(_v(this), e);

            if (once) {
                oObj.removeEventListener(ev, clickev, false);
            }
        };
        
        if (oObj.addEventListener) {
            oObj.addEventListener(ev, clickev, false);  
        } else if (oObj.attachEvent) {
            oObj.attachEvent('on'+ev ,clickev, false);  
        }
        
        return once ? clickev : this;
    };
    
    this.unbind = function(ev, cb) {
        if (oObj.removeEventListener) {
            typeof ev == 'string' ? 
                oObj.removeEventListener(ev, cb) :
                oObj.removeEventListener(ev);
        } else if (oObj.detachEvent) {
            oObj.detachEvent('on'+ev, cb); 
        }
        
        return this;
    };
    
    this.value = function(val) {
        if (val) {
            oObj.value = val;
            return this;
        } else {
            return oObj.value;
        }
    }
    
    this.data = function(prop, val) {
        if (val) {
            oObj.dataset[prop] = val;
            return this;
        } else {
            return oObj.dataset[prop];   
        }
    };
    
    this.find = function(sel, onlyone) {
        return _v(sel, onlyone, oObj);
    };  
    
    this.attr = function(attr, val) {
        if (val) {
            oObj.setAttribute(attr, val);
            return this;
        } else {
            return oObj.getAttribute(attr);   
        }
    }
    
    this.html = function(val) {
        if (val) {
            oObj.innerHTML = val;
            return this;
        } else {
            return oObj.innerHTML;
        }
    };
    
    this.original = function() {
        return oObj;
    };
}
var _v = function(sel, onlyone, parent) {
    if (typeof sel.nodeType !== 'undefined'){
        return new _vanirykDOMObject(sel);
    } else if (typeof sel.type !== 'undefined' && sel.type == "_vanirykDOMObject") {
        return sel;
    } else {
        var domObjects = parent ? 
            parent.querySelectorAll(sel) : 
            document.querySelectorAll(sel);
        
        var len = domObjects.length;
        var _vObj = new Object();
        _vObj.length = len;
        _vObj.all = function(cb) {
            for (var i = 0; i < len; i++) {
                cb(_vObj[i]); 
            }        
        };
        _vObj.do = function(cb) {
            cb(_vObj[0]);   
        }

        for (var i = 0; i < len; i++) {
            _vObj[i] = new _vanirykDOMObject(domObjects[i]);   
        }

        if (onlyone) {
            return _vObj[0];
        } else {
            return _vObj;
        }
    }
}

var _a = new function() {
    // id : function(json)
    this.jsonpCallbacks = {};
    
    this.get = function(action, params, callback, withCreds, headers) {
        var req = new XMLHttpRequest();
        withCreds = typeof withCreds == 'undefined' ? true : withCreds;
        
        function formatParams( params ){
              return params ? "?" + Object
                    .keys(params)
                    .map(function(key){
                      return key+"="+params[key]
                    })
                    .join("&") : "";
        }

        req.open('GET', action + formatParams(params), true);
        req.responseType = "json";
        req.withCredentials = withCreds;
        
        if (headers) {
            for (var header in headers) {
                req.setRequestHeader(header, headers[header]);
            }
        }
        
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                callback(req.response);
            }
        };

        req.send(JSON.stringify(params));
    };
    this.getJsonp = function(url, callback, hasParams) {
        var s = "";
        var x = 10;
        while(s.length<x&&x>0){
            v = Math.random()<0.5?32:0;
            s += String.fromCharCode(Math.round(Math.random()*((122-v)-(97-v))+(97-v)));
        }
        
        var script = document.createElement('script');
        
        (function(script, s) {
            _a.jsonpCallbacks[s] = function(json, err) {
                callback(json, err);
                document.getElementsByTagName('head')[0].removeChild(script);
                
                delete _a.jsonpCallbacks[s];
            };
            
            setTimeout(function() {
                if (_a.jsonpCallbacks[s]) {
                    _a.jsonpCallbacks[s]({}, true);
                }
            }, 5000);
        })(script, s);
            

        script.src = url + (hasParams?"&":"?") + 'callback=_a.jsonpCallbacks.'+s

        document.getElementsByTagName('head')[0].appendChild(script);    
    };
    this.post = function(action, params, callback) {
        var req = new XMLHttpRequest();

        req.open('POST', action, true);
        req.responseType = "json";
        req.withCredentials = true;
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                callback(req.response);
            }
        };

        req.send(JSON.stringify(params));            
    };
    this.load = function(filename, filetype) {
        var node = undefined;
        if(filetype == "js") {
            node = document.createElement('script');
            node.setAttribute("type", "text/javascript");
            node.setAttribute("src", filename);
        } else if(filetype == "css") {
            node = document.createElement("link");
            node.setAttribute("rel", "stylesheet");
            node.setAttribute("type", "text/css");
            node.setAttribute("href", filename);
        }
        if(typeof node != "undefined")
            document.getElementsByTagName("head")[0].appendChild(node);
    };
};