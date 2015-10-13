define([], function() {
    /**
     * [generatorId A tiny seed id generator  ]
     * @param  {[type]} len    [description]
     * @param  {[type]} radix  [description]
     * @param  {[type]} prefix [description]
     * @param  {[type]} subfix [description]
     * @return {[type]}        [description]
     */
    var generatorId = function(len, radix, prefix, subfix) {
        var targetId = '';
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [],
            i;
        len = len || 32;
        radix = radix || chars.length;
        prefix = prefix || '';
        prefix = prefix == '' ? '' : prefix + '_';
        subfix = subfix || '';
        subfix = subfix == '' ? '' : '_' + subfix;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        targetId = uuid.join('');
        return prefix + targetId + subfix;
    };

    // add en easy DOM2 function for highlight function
    var EventUtils = {
		add : function (obj, type, fn){
			if(obj.addEventListener){
				addEvent = obj.addEventListener(type, fn, false);
			} else if (window.attachEvent){
				addEvent = obj.attachEvent('on' + type, fn);
			} else {
				obj['on' + type] = fn;
			}
		},
		remove : function (obj, type, fn){
			if(obj.removeEventListener){
				addEvent = obj.removeEventListener(type, fn);
			} else if (obj.detachEvent){
				addEvent = obj.detachEvent('on' + type, fn);
			} else {
				obj['on' + type] = null;
			}
		}
	};

	var toCamelCase = function(str){
		return str.replace(/\-(\w)/g, function(all, letter){return letter.toUpperCase();});
	};

	var camel2HB = function (str){
		return str.replace(/([A-Z])/g,"-$1").toLowerCase();
	};

	/**
	 * [HTMLUnescape html code stripping]
	 * @param {[String]} str [stripped string]
	 */
	var HTMLUnescape = function(str) {
		return String(str)
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>');
	};

	/**
	 * [rgb2hex Change color format from rbg to hex]
	 * @param  {[type]} rgb [description]
	 * @return {[type]}     [description]
	 */
	var rgb2hex = function(rgb) {
		rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

		function hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
		}
		return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	};

	/**
	 * [parseKV2Json description]
	 * @param  {[type]} str [A ';' and '=' separated string that need to be parsed ]
	 * @return {[type]}     [An json object that formats well in key-value form]
	 */
	var parseKV2Json = function(str) {
		var obj = {};
		if (str && str.indexOf(';') >= 0) {
			var array = str.split(';'),
				i,
				len = array.length;

			for (i = 0; i < len; i++) {
				if (array[i].indexOf('=') >= 0) {
					var p = array[i].split('=');
					if (p.length == 2) {
						// Valid format
						obj[p[0]] = p[1];
					} else {
						continue;
					}
				}
			}
		}
		return obj;
	};
	

	var Utils = {
		
		
	};


    return {
        generatorId: generatorId,
        EventUtils : EventUtils,
        toCamelCase : toCamelCase,
        camel2HB  : camel2HB
    };
});
