/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 17:32:49
 * @version $Id$
 */

 /* Draggable plugin for widget dragging in TrueCMS2.0*/
 (function ($){
 	$.fn.johnDraggable = function (options){
 		var items = [];
 		var opts = $.extend({}, $.fn.johnDraggable.defaluts, options);
 		var ctx = opts.context;
 		var wrapper = $(ctx).find(opts.targetWrapperClass);
 		var targetClass = opts.targetClass;
 		var targetElements = wrapper.find(targetClass);


 		//Operate with placeholder
 		var placeholderController = {
 			_get : function (){
 				return $(wrapper).find(opts.placeholder);
 			},
 			_create : function (){
 				var temp = this._get();
	 			if (temp.size() == 0) {
	 				var className = opts.placeholder.substring(1);
	 				var placeholder = $('<div class="'+ className +'"></div>').attr({
	 					style : 'background-color:#FF4400;height:20px;width:100%;border:1px solid #000;'
	 				});
	 				return placeholder;
	 			} else {
	 				return temp;
	 			}
 			},
 			_hasPlaceHodler : function (){
 				return wrapper.find('.placeholder').length > 0;
 			},
 			_destroy : function (callback){
 				var temp = this._get();
 				if (temp.size() > 0) {
 					temp.fadeOut("slow");
 					setTimeout(function (){
 						temp.remove();
 						if (callback && $.isFunction(callback)) {
 							callback();
 						}
 					}, 1000);
 				}
 			}
 		}

 		var buildPosArray = function (){
 			var posArray = new Array();
 			(function (){
 				var targetElements = wrapper.find(targetClass);
		 		$.each(targetElements, function (i){
					var elemDesc = {
						elemIndex : 1 + i,
						left : this.offsetLeft,
						top : this.offsetTop,
						right : this.offsetLeft + $(this).outerWidth(),
						bottom : this.offsetTop + $(this).outerHeight()
					};
					posArray.push(elemDesc);
				});
 			})();
 			return posArray;
 		}
 		var positionHelper = {
 			_getAbsPosition : function (elem){
 				elem = $(elem).get(0);
 				var r = {
 					x : elem.offsetLeft, 
 					y : elem.offsetTop
 				};

 				if (elem.offsetParent) {
 					var op = elem.offsetParent;
 					var t = {
	 					x : op.offsetLeft, 
	 					y : op.offsetTop
	 				};

	 				r.x += t.x;
	 				r.y += t.y;
 				}

 				return r;
 			},
 			_getMousePosition : function (e){
 				return {
 					x : e.pageX, y : e.pageY
 				};
 			},
 			_checkMouseOver : function (e){
 				var r = this._getMousePosition(e);
 				var posArray = buildPosArray();
 				var p = -1;
 				for (var i=0,len=posArray.length; i<len; i++) {
 					var elem = posArray[i];
 					if (r.x > elem.left && r.x < elem.right && r.y > elem.top && r.y < elem.bottom) {
 						p = i;break;
 					}
 				}
 				return p;
 			}
 		};

 		this.each(function (i, cont){
 			var _this = cont;
 			this.onstart = function (){
 				var that = this;
 				$(that).on('mousedown', function (){
 					var p = positionHelper._getAbsPosition(_this);
 					var k = -1;
 					var content = $(this).html();
 					$(document).on('mousemove', function (ev){
 						//append placeholder
 						k = positionHelper._checkMouseOver(ev);
 						if (k > -1 && !placeholderController._hasPlaceHodler()) {
 							var holder = placeholderController._create();
							var targetElem = wrapper.find(targetClass).eq(k);
							holder.appendTo(targetElem);
 						}

 						
 						
 					});

 					$(document).on('mouseup', function (ev){
						
				 		k = positionHelper._checkMouseOver(ev);
					 	if (k > -1) {
					 		var targetElem = wrapper.find(targetClass).eq(k);
							//calling ajax and replace this contents;
							var html = $('<div operable="text,href"> Widget_'+content+'</div>');
								targetElem.append(html);
								html.smartMenu(menuData);
							placeholderController._destroy();
							//targetElements.eq(k).append('<div style="border:1px dashed #000;background:#FFAA00;width:100px;height:20px;"></div>');
						}
					});

					return false;
 				});
 			}
 			this.onstart();
 		});

 		return this;
 	};

 	$.fn.johnDraggable.defaluts = {
 		context : 'body',
 		placeholder : '.placeholder',
 		targetWrapperClass : '.wrapper',
		targetClass : '.layout-template'
 	};


 	function throttle (obj, callback){
 		clearTimeout(obj.timeoutId);
 		obj.timeoutId = setInterval(function(){
 			if ($.isFunction(callback)) {
 				callback();
 			}
 		},50);
 	}
 })(jQuery);

