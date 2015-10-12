/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 11:52:45
 * @version $Id$
 */
//smartMenu-ext.js
//		Define some utils to combine with smartMenu plugin,
//		This part will implement some operation logic for operable elements to make changes 

	function HTMLUnescape(str){
	    return String(str)
	    .replace(/&lt;/g, '<')
	    .replace(/&gt;/g, '>');
	}
    /**
	 * [parseKV2Json description]
	 * @param  {[type]} str [A ';' and '=' separated string that need to be parsed ] 
	 * @return {[type]}     [An json object that formats well in key-value form]
	 */
	function parseKV2Json(str){
		var obj = {};
		if (str && str.indexOf(';') >= 0 ) {
			var array = str.split(';'),
				i,
				len = array.length;

			for (i=0;i<len;i++) {
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
	}

	/**
     * [changeSite description]
     * @return {[type]}     [While the top dropdown has been changed, change the mapping dropdown below]
     */
	 function changeSite() {
	     var data = {'siteId':$.trim($("#site").val())};
         $.ajax({
             url : ctxUrl + '/siteColumnController/getSiteColumn.do',
             cache : false,
             async : true,
             type : 'POST',
             data : data,
             success : function (d){
                 var data = $.parseJSON(d);
                 var selectColumn = document.getElementById("siteColumn");
                 selectColumn.options.length = 0;
                 for ( var i = 0, len = data.length; i < len; i++) {
                     var di = data[i];
                     selectColumn.add(new Option(di.columnName, di.columnId));
                 }
             }
         });
     }
	 
	 
var widgetDict = {
   'vote' : '简单投票',
   'link-panel' : '链接面板',
   'flash' : 'FLASH',
   'powerpoint' : '幻灯片',
   'upload' : '图片',
   'navbar' : '站点绑定',
   'panel' : '新闻面板',
   'footer' : '站点底部',
   'image-chunk' : 'image-chunk',
   'navbar-list' : '导航栏',
   'text,href' : '导航项',
   'chunk' : '块部件',
   'undefined' : '未知'
};
/* 
* Smart Menu configurations 
* This is a global var in this js file
*
*/
var menuData = [
   [{
	   	text : '编辑',
	   	func : function (){
	   		var type = $(this).attr('operable');
	   		var elemId = $(this).data('widget-id');
	   		var _self = $(this);
	   		
	   		//过滤未支持的容器类
	   		if (type) {
	   			if (type != 'layout') {
	   			    $('.widgetHighLight').removeClass('widgetHighLight');
	   			    $(this).addClass('widgetHighLight');
	   			    
	   			    var html = constructConfigPanelTemplate(type,elemId, _self);
	                renderConfigPanel(html);
	   			} else {
    	   			 if ($(this).attr('data-type') == 'drag-layout') {
        	   			  var id = $(this).attr('data-layout-id');
        	   			  $('.layout-cell').removeClass('highlight');
        	   			  $(this).children('.layout-row').children('.layout-cell').addClass('highlight');
                          var params = $(this).attr('data-history-config');
                          var html = constructLayoutConfigPanelTemplate(id, params);
                          renderLayoutConfigPanel(html);
    	   			 }
	   			}
	   		} else{
	   			alert('不存在布局或部件');
	   		}
	   	}
   }],
   [{
	   	text : '添加',
	   	func : function (){
	   		var type = $(this).attr('operable');
	   		var elemId = $(this).data('widget-id');
	   		var _self = $(this); // No id exists
	   		if (type) {
	   		    $('.widgetHighLight').removeClass('widgetHighLight');
                $(this).addClass('widgetHighLight');
	   			if (type == 'link-panel' || type == 'navbar-list') {
	   				var html = constructConfigPanelTemplate(type, elemId, _self, 'append');
	   				displayConfigPanel(html);
	   			} else {
	   			}
	   			
	   		} else {
	   			
	   		}
	   	}
   }],
   [{
	   	text : '删除',
	   	func : function (){
	   		var type  = $(this).attr('operable');
	   		if (type) {
	   		    if (type == 'layout') {
	   		        //alert('此元素不支持删除操作');
    	   		     $('.layout-cell').removeClass('highlight');
                     $(this).children('.layout-row').children('.layout-cell').addClass('highlight');
                    if (confirm("确认要删除这个布局?")) {
                        $(this).closest('.layout-container').remove();
                    }
	   		    } else {
	   		        $('.widgetHighLight').removeClass('widgetHighLight');
	   		        $(this).addClass('widgetHighLight');
	   		        var operArray = type.split(',');
	                if (operArray.length == 1 && operArray[0] == 'link-item') {
	                    $(this).remove();
	                } else if(operArray.length == 2 && operArray[0] == 'text' && operArray[1] == 'href'){
	                     if (confirm("确认要删除这个" + widgetDict[type] +"部件?")) {
	                         if ($(this).closest('.link-list-item').length) {
	                             $(this).closest('.link-list-item').remove();
	                         } else if ($(this).closest('.nav-list-item').length){
	                             $(this).closest('.nav-list-item').remove();
	                         }
	                     }
	                } else {
	                     //alert('此元素不支持删除操作');
	                     if (confirm("确认要删除这个" + widgetDict[type] +"部件?")) {
	                         if (type == 'upload') {
	                        	 $(this).closest('.widget-upload').remove();
	                         } else {
	                        	 $(this).remove();
	                         }
	                     }
	                }
	   		    }
	   		} else{
	   		  alert('不存在布局或部件,请先添加');
	   		}
	   	}
   }],
   [{
	   	text : '编辑源代码',
	   	func : function (){
	   		var source = $(this).attr('data-source-code');
   			if (source == 'widget' || source == 'layout') {
   				// alert($(this).html());
   				//mask();
   			} else {
   				//alert('This component dosent allow to edit source-code');
   				//mask();
   			    var self = $(this);
   				initSourceCodePanel($(this).prop('outerHTML'), function (html){
   				    $(self).replaceWith($(html));
   				});
   			}
	   	}
   }],
];


//采用策略模式分发不同的右击请求

/**
* /
* @param  {[type]} mode [编辑或添加]
* @param  {[type]} el   [当前元素]
* @param  {[type]} elemId   [当前元素id或父容器id]
* @return {[type]}      [返回一个供 ModalDialog 渲染的 json]
*/
function constructConfigPanel(mode, el, elemId){
  return constructStrategies[mode](el, elemId);
}

//参数配置面板构建的策略
var constructStrategies = {
  'edit' : function (el, elId){
      var target = el, // 右击对象
          obj = $('#' + elId); // 父容器或当前对象
          
          
      
      return {
          body : constructWidgetConfigBody(el, elId),
          footer : '<button class="btn btn-primary">确定</button><button class="btn btn-default" data-dismiss="modal">取消</button>',
          onRenderReady : bindWidgetRenderEvents(el, elId),
          btnEvents : bindWidgetButtonEvents(el, elId)
      }

  },

  'add' : function (el, elId){

      return {
          body : '',
          footer : '<button class="btn btn-primary">确定</button><button class="btn btn-default" data-dismiss="modal">取消</button>',
          btnEvents : {

          }
      };
  }
};

// 部件配置生成分为两部分: 特性部分和基础部分
function constructWidgetConfigBody (el, elId) {
    var fragment = '',
        obj = $('#' + elId),
        param = obj.attr('data-widget-param'),
        history = obj.attr('data-history-config'),
        configData = history ? parseKV2Json(history) : {};
    
    if (elId in widgetCachedData) {
        fragment += widgetAttrStrategyFn(el, elId, widgetCachedData[elId]);
    } else {
        fragment += widgetAttrStrategyFn(el, elId, null);
    }
    
    if (param) {
        fragment += widgetBaseStrategyFn(el, elId, configData);
    } else {
        fragment += widgetBaseStrategyFn(el, elId, null);
    }
    
    return fragment;
}

function widgetAttrStrategyFn (el, elId, cache) {
    var type = getOperableType(el, elId);
    return widgetAttrStrategies[type](el, elId, cache);
}

var widgetAttrStrategies = {
    'text,href' : function (el, elId){
        var html = '<div class="row">',
            operable = 'text,href'.split(',');
        
        for(var i =0;i<operable.length;i++){
            if(operable[i] == "panel"){
                continue;
            }
            html += '<div class="row-fluid">';
            html += '<div class="offset1 span2 text-right">'+operable[i]+'：</div>';
            if(operable[i] == "text"){
                html += '<div class="span2"><input type="text" class="form-control" value="'+$(el).html()+'"></div>';
            }else{
                html += '<div class="span2"><input type="text" class="form-control" value="'+$(el).attr(operable[i])+'"></div>';
            }
            html += '</div>';
        }
        return html;
    },
    
    'flash' : function (el, elId, cache){
        var html = '<div class="row">';
            html += '<div class="row-fluid">';
            html += '<div class="offset3 span3"><input type="file" id="upload" name="attr" class="form-control"></div>';
            html += '<div><input type="hidden" id="conf-url" name="url" class="form-control"></div>';
            html += '</div><br>';
        return html;
    }
};

function getOperableType (el, elId) {
    var type = el.attr('operable');
    if (!type) {
        var target = $("#" + elId);
        type = target.attr('operable');
    }
    return type;
}

function widgetBaseStrategyFn (el, elId, cache) {
    var param = el.attr('data-widget-param');
    if (param) {
        var type = getOperableType(el, elId);
        return widgetBaseStrategies[type](el, elId, cache);
    } else{
        return '';
    }
}
var widgetBaseStrategies = {
    'flash' : function (el, elId, cache){
        if (cache) {
            for (var attr in cache) {
                // row started
                html += '<div class="row">';
                html += '<div class="row-fluid">';
                if ('link' === attr) {
                    html += '<div class="offset2 span2 text-right">链接:</div>';
                    html += '<div class="span3"><input type="text" id="conf-link" class="form-control" value="'+cache['link']+'"></div>';
                } else if ('width' === attr) {
                    html += '<div class="offset2 span2 text-right">宽度:</div>';
                    html += '<div class="span3"><input type="text" id="conf-width" class="form-control" value="'+cache['width']+'"></div>';
                } else if ('height' === attr) {
                    html += '<div class="offset2 span2 text-right">高度:</div>';
                    html += '<div class="span3"><input type="text" id="conf-height" class="form-control" value="'+cache['height']+'"></div>';
                } else if ('bc' === attr) {
                    html += '<div class="offset2 span2 text-right">背景色:</div>';
                    html += '<div class="span3"><input type="text" id="conf-bc" class="form-control" value="'+cache['bc']+'"></div>';
                } else if ('bgi' === attr) {
                    html += '<div class="row-fluid">';
                    html += '<div class="offset4 span3"><input type="file" id="upload" name="attr" class="form-control" value="'+cache['bgi']+'"></div>';
                    html += '<div><input type="hidden" id="conf-bgi" name="inp-bgi" class="form-control"></div>';
                    html += '</div>';
                } else if ('nb' === attr) {
                    $.ajax({
                        url : ctxUrl + '/siteController/getSite.do?t='+Math.random(),
                        cache : false,
                        async : false,
                        type : "POST",
                        data : {'siteId' : $.trim($('#site').val())},
                        success : function (result){
                            var res = $.parseJSON(result);
                            html += '<form id="form1">';
                            html += '<div class="row-fluid">';
                            html += '<div class="offset2 span2 text-right">站点:</div>';
                            html += '<div class="span3"><select id="site" name="site" onchange="changeSite()">';
                            for (var i = 0, len = res.length; i < len; i++) {
                                html += '<option value="' + res[i]['siteId'] + '">' + res[i]['siteName'] + '</option>';
                            }
                            html += '</select>';
                            html += '</div></div>';

                            html += '<div class="row-fluid">';
                            html += '<div class="offset2 span2 text-right">栏目:</div>';
                            $.ajax({
                                url : ctxUrl + '/siteColumnController/getSiteColumn.do',
                                cache : false,
                                async : false,
                                type : 'POST',
                                data : {'siteId': res[0]['siteId']},
                                success : function (d){
                                    var data = $.parseJSON(d);
                                    html += '<div class="span3"><select id="siteColumn" name="siteColumn">';
                                    for (var i = 0, len = data.length; i < len; i++) {
                                        html += '<option value="' + data[i]['columnId'] + '">' + data[i]['columnName'] + '</option>';
                                    }
                                    html += '</select>';
                                    html += '</div></div>';

                                    html += '</form>';
                                    html += '</div>';
                                }
                            });
                        }
                    });
                }

                html += '</div>';
                html += '</div>';
            }
        }
    }
};

function bindWidgetRenderEvents(el, elId){
    var type = getOperableType(el, elId);
    return widgetRenderEventsStrategies[type](el, elId);
}



var widgetRenderEventsStrategies = {
    'flash' : function (el, elId) {
        setupUpload = function (){
            $("#upload").uploadify({
                height        : 30,
                buttonText    :'<div class="row-fluid"><button class="btn btn-block btn-default">选择Flash</button></div>',
                swf           : ctxUrl+'/cmskj/js/uploadify/uploadify.swf',
                uploader      : ctxUrl+'/attachmentController/uploadReturnUrl.do?type=2',
                width         : 120,
                'onUploadSuccess' : function(file, data, response) {
                    //alert('The file ' + file.name + ' was successfully uploaded with a response of ' + response + ':' + data);
                    var res = $.parseJSON(data);
                    $('#conf-url').val(res.url);
                    $('#conf-height').val(res.height);
                    $('#conf-width').val(res.width);
                }
            });
        },
        fnUpload = function (){
            $("#upload").uploadify("upload", '*');
        },
        fnOK = function (e){
            try {
                $("#upload").uploadify('destroy');
            }catch(e){};
            
            extraFn('flash');
            $('#configModal').modal('hide');
        };

        fnCancel = function (){
            modalCleanUp();
        };
        
        return {
            'setupUpload' : setupUpload,
            'fnUpload' : fnUpload,
            'fnOK' : fnOK,
            'fnCancel' : fnCancel
        };
    }
};




function bindWidgetButtonEvents(el, elId){
    var type = getOperableType(el, elId);
    return widgetButtonEventsStrategies[type](el, elId);
}
var widgetButtonEventsStrategies = {
    'flash' : function (el, elId){
        var baseConfig = widgetBaseFn(el, elId, 'flash');
        
    }
};

function writeCache ($obj, cachedObj) {
  return $obj.attr('data-cache', JSON.stringify(cachedObj));
}


function widgetBaseFn (el, elId, fnType) {
    fnType = fnType || getOperableType(el, elId);
    
    var elem = $('#' + elId) || el;
    var history = '',
        link = '',
        width = '',
        height = '',
        bgcolor = '',
        bgimage = '';
    var flag = !1;

    if ($('#conf-link').length) 
        link = $.trim($('#conf-link').val());
    
    if ($('#conf-width').length) 
        width = $.trim($('#conf-width').val());

    if ($('#conf-height').length) 
        height = $.trim($('#conf-height').val());

    if ($('#conf-bc').length) 
        bgcolor = $.trim($('#conf-bc').val());

    if ($('#conf-bgi').length) 
        bgimage = $.trim($('#conf-bgi').val());


    //validate parameters
    (function (a,b,c,d){
        var are = /([\w-]+\.)+[\w-]+([\w-.?\%\&\=]*)?/gi;
        var bre = /\d+/gi;
        var cre = /\d+/gi;
        var dre = /\#[0-9a-fA-F]{6}/gi;
        var ere = /\.(bmp|jpg|gif|jpeg)$/gi;
        var errorMessage = '参数非法，请检查';
        if(a && !are.test(a)){
//            /alert(errorMessage);
            flag = true;
        }

        
    })(link, width, height, bgimage);


    if (flag){
        return false;
    }

    if(link)
        history += 'link='+link+";";

    if(width)
        history += 'width='+width+";";
    
    if(height)
        history += 'height='+height+";";
    
    if(bgcolor)
        history += 'bc='+bgcolor+";";
    
    if(bgimage)
        history += 'bgi='+bgimage+";";
    
    elem.attr('data-history-config', history);

    if (width && height) {
        var oW = elem.width();
        var oH = elem.height();
        if (width.indexOf('%') == -1 && height.indexOf('%') == -1) {
            if (oW < parseInt(width) || oH < parseInt(height)) {
                alert('提示：设置的图片大小超出原部件，将改变原部件尺寸');
                if (oW < parseInt(width) && oH < parseInt(height)) {
                    elem.attr({
                        "style" : 'width:'+ parseInt(width) + 'px;height:' + parseInt(height) +'px;!improtant;'
                    });
                } else if (oW < parseInt(width)) {
                    elem.attr({
                        "style" : 'width:'+ parseInt(width) + 'px;height:'+ oH +'px;!improtant;'
                    });
                } else {
                    elem.attr({
                        "style" : 'width:'+ oW + 'px;height:'+ parseInt(height) +'px;!improtant;'
                    });
                }
            } else {
                elem.attr({
                    "style" : 'width:'+ parseInt(width) + 'px;height:'+ parseInt(height) +'px;!improtant;'
                });
            }
            elem.css('background-size', width + 'px ' + height + 'px');   
        } else {
            // for the percentage
            var tarW = parseInt(width),
                tarH = parseInt(height);
            if (width.indexOf('%') >= 0) {
                tarW += '%';
            } else {
                tarW += 'px';
            }
            
            if (height.indexOf('%') >= 0) {
                tarH += '%';
            } else {
                tarH += 'px';
            }
            
            if (fnType && fnType.indexOf('panel') >= 0){
                elem.find('[class$=body]').attr({
                    "style" : 'width:'+ tarW + ';height:'+ tarH + ';!improtant;'
                });
            }
            elem.attr({
                "style" : 'width:'+ tarW + ';height:'+ tarH + ';!improtant;'
            });
            elem.css('background-size', elem.width() + 'px ' + elem.height() + 'px');  
        }
    }
    //Change image bi and size
    var imgUrl = $('#conf-url').val();
    if (imgUrl){
        if (fnType == 'upload') {
            var bg = 'background:url(/'+ imgUrl + ') 0 0 no-repeat;background-size:' + elem.width() + 'px ' + elem.height() + 'px;';
            var originStyle = elem.attr('style');
            elem.empty().attr({
                style : originStyle + ";" + bg
            });
        } else if (fnType == 'flash') {
            var config = elem.data('history-config');
            if (config) {
                elem.attr("data-history-config",config + ";" + "link="+imgUrl);
            } else {
                elem.attr("data-history-config", "link="+imgUrl);
            }
        }
    } else {
        var bgiUrl = $('#conf-bgi').val();
        if (fnType == 'footer' || fnType == 'vote') {
            var bg = 'background:url(/'+ bgiUrl + ') 0 0 no-repeat;background-size:' + elem.width() + 'px ' + elem.height() + 'px;';
            var originStyle = elem.attr('style');
            elem.attr({
                style : originStyle + ";" + bg
            });
        }
    }
    
    
    if (bgcolor){
        if(bgcolor.indexOf('#') < 0){
            bgcolor = '#' + bgcolor;
        }
        
        if (fnType && fnType.indexOf('panel') >= 0){
            elem.find('[class$=body]').css('background-color', bgcolor); 
        } else {
            elem.css('background-color', bgcolor); 
        }
    }
    
    
    return {
        link : link,
        width : width,
        height : height,
        bgcolor : bgcolor,
        bgimage : bgimage
    };
}

// Utils
function modalCleanUp () {
    try {
        $("#upload").uploadify('destroy');
    }catch(e){};
    
    var oModal = $('#configModal');
    var $modalBody = oModal.find('.modal-body');
    oModal.modal('hide');
    $modalBody.empty();
}















function constructLayoutConfigPanelTemplate(layoutid, params){
	var html          = '', 
		footer        = '',
		setupUpload   = null,
		fnOK          = null,
		fnCancel      = null;
	
	if (params) {
		params = params.split('$');
		var oTemplate = $('#'+layoutid);
		var aLayout = oTemplate.children('.layout-row').children(".layout-cell");
		var scaleParam = params[0].split(",");
		var marginParamGroup = params[1].split("^");
		
		if (scaleParam.length > 0 && scaleParam.length == aLayout.length) {
			var reUnit = /(\D+)/g;
			var unit = scaleParam[0].match(reUnit);
			html += '<div class="row">';
			html += '<div class="span4">';
			html += '<div class="row-fluid">';
            html += '<div class="offset3 span4 text-right">选择单位:</div>';
            html += '<div class="offset1 span2">px <input type="radio" value="px" name="unit" '+(unit=='px'?'checked="checked"':'')+'></div>';
            html += '<div class="span2">% <input type="radio" name="unit" value="%" '+(unit=='%'?'checked="checked"':'')+'></div>';
            html += '</div>';
			for (var i=0,len=scaleParam.length; i<len; i++) {
				var val = parseInt(scaleParam[i]);
				var marginParam = marginParamGroup[i].split(",");
				var lcd = null, cell = null, oMargin = null, oBackground = null;
				if (layoutid in layoutCachedData) {
					lcd = layoutCachedData[layoutid];
					cell = lcd['cells'][i];
					oMargin = cell['margin'];
					oBackground = cell['background'];
				}
				html += '<div class="row-fluid">';
				html += '<div class="offset3 span4 text-right">列'+(i+1)+'(<span class="unit">'+unit+'</span>):</div>';
				html += '<div class="span4"><input type="text" name="scale" class="form-control" value="'+val+'"></div>';
				html += '</div>';
				if (marginParam.length == 4) {
					html += '<div class="inp-mg-group">';
					html += '<div class="row-fluid">';
					html += '<div class="offset3 span6">边距设置(px):</div>';
					html += '</div>';
					html += '<div class="offset1 span5">';
					html += '上：<input type="text" name="inp-mg" class="inp-mg" value="' + (!lcd ? "0" : oMargin['top']) + '">';
					html += '下：<input type="text" name="inp-mg" class="inp-mg" value="' + (!lcd ? "0" : oMargin['bottom']) + '">';
					html += '左：<input type="text" name="inp-mg" class="inp-mg" value="' + (!lcd ? "0" : oMargin['left']) + '">';
					html += '右：<input type="text" name="inp-mg" class="inp-mg" value="' + (!lcd ? "0" : oMargin['right']) + '">';
					html += '</div>';
					html += '</div>';
				} else if (marginParam.length == 2) {
					html += '<div class="inp-mg-group">';
					html += '<div class="row-fluid">';
					html += '<div class="offset3 span6">边距设置(px):</div>';
					html += '</div>';
					html += '<div class="offset1 span5">';
					html += '上：<input type="text" name="inp-mg" class="inp-mg" value="0">';
					html += '下：<input type="text" name="inp-mg" class="inp-mg" value="0">';
					html += '左：<input type="text" name="inp-mg" class="inp-mg" value="0">';
					html += '右：<input type="text" name="inp-mg" class="inp-mg" value="0">';
					html += '</div>';
					html += '</div>';
				}
				var flag = aLayout.eq(i).attr('data-layout-param');
				if (flag) {
				    if (flag.indexOf('bc') >= 0) {
	                    html += '<div class="row-fluid">';
	                    html += '<div class="offset3 span4 text-right">背景色:</div>';
	                    html += '<div class="span4"><input type="text" name="inp-bc" class="inp-bc" value="'+(!lcd ? '' : oBackground['color'])+'">';
	                    html += '</div>';
	                    html += '</div>';
	                }
	                
	                if (flag.indexOf('bgi') >= 0) {
	                    html += '<div class="row-fluid">';
	                    html += '<div class="offset6 span3">背景图：<input type="file" id="upload_'+i+'" name="attr" class="form-control"></div>';
	                    html += '<div><input type="hidden" name="inp-bgi" class="form-control" value="'+(!lcd ? '' : oBackground['image'])+'"></div>';
	                    html += '</div>';
	                }
	                
	                html += '<div class="offset1 span4"><hr></div>';
				}
			}
			
			html += '</div>';
            html += '</div>';
            
            
			footer = '<button class="btn btn-primary">确定</button><button class="btn btn-default" data-dismiss="modal">取消</button>';
			fnOK = function (){
				var oTemplate = $('#'+layoutid);
				var aLayout = oTemplate.children('.layout-row').children(".layout-cell");
				var oModal = $('#configModal');
				var $body = oModal.find('.modal-body');
				var scaleInputs = $body.find('input[name=scale]');
				var marginInputs = $body.find('input[name=inp-mg]');
				var bcInputs = $body.find('input[name=inp-bc]');
				var bgiInputs = $body.find('input[name=inp-bgi]');
				var inputUnit = $body.find('input[name=unit]');
				var unit = inputUnit.filter(':checked').val();
				
				var cellsConfig = [], elemData = {};
				//precheck
				var flag = false;
				if (unit == '%' || unit == 'px') {
					var sum = 0;
					$.each(scaleInputs, function (i){
						if (!this.value){
							this.value = 0;
						} else if (isNaN(this.value)) {
							alert('参数非法，请检查');
							flag = true;
							return;
						} else if (this.value < 0){
							alert('参数非法，请检查');
							flag = true;
							return;
						}
						sum += parseInt(this.value);
						if (sum > 100){
						    if (unit == '%') {
						        flag = true;
	                            return;
						    } else if (unit == 'px' && sum > 1920) {
						        flag = true;
	                            return;
						    }
							
						}
					});

					   
					$.each(marginInputs, function (i){
						if (!this.value){
							this.value = 0;
						} else if (isNaN(this.value)) {
							alert('参数非法，请检查');
							flag = true;
							return;
						} else if (this.value < 0){
							alert('参数非法，请检查');
							flag = true;
							return;
						}
					});

					if (flag) {
						alert("参数非法，请检查");
						return;
					} else {
						var targetScaleParam = '',
							targetMaginParam = '';
						scaleInputs.each(function (index){
							var config = {};
							var targetScaleValue = $(this).val() + unit;
							if (targetScaleParam != '')targetScaleParam += ',';
							targetScaleParam += targetScaleValue;

							var targetMarginValue = '';
							for (var j=0;j<4;j++) {
								var val = marginInputs.eq(index*4 + j).val();
								if(j)val = ',' + val;
								targetMarginValue += val;
							}
							if(targetMaginParam != '')targetMaginParam += '^';
							targetMaginParam += targetMarginValue;

							var targetLayout = aLayout.eq(index);
							var originStyle = targetLayout.attr('style');
							var targetStyle = "";
							var styleArray = originStyle && originStyle.split(";");
							var test = {};
							if (styleArray) {
							    for (var i=0,len=styleArray.length; i<len; i++){
	                                var p = styleArray[i].split(":");
	                                if (p.length == 2) {
	                                    var attr = p[0], val = p[1];
	                                    if (attr in test) {
	                                    	// do nothing
	                                    } else {
	                                    	if (attr == 'min-height') {
	                                    		if (targetLayout.hasClass('lzh1')) {
	            							    	var minH = 240;
	            							    	if (!targetLayout.data('origin-minheight')) {
	            							    		targetLayout.data('origin-minheight', '240px');
	            							    	}
	            							    	var tarH = 120;
	            							    	if (targetScaleValue.indexOf('%') >= 0) {
	            							    		tarH = minH * parseInt(targetScaleValue)/100;
	            							    	} else {
	            							    		tarH = parseInt(targetScaleValue);
	            							    	}
	            							    	targetStyle += "min-height:" + tarH + "px;";
	            							    	
	            							    }
		                                    } else if(attr == 'width'){
		                                    	targetStyle += "width:" + targetScaleValue + ";";
		                                    } else {
		                                    	//targetStyle += attr + ":" + val + ";";
		                                        //targetStyle += attr + ":" + targetScaleValue + ";";
		                                    }
		                                    test[attr] = val;
	                                    }
	                                    
	                                }
	                            }
							} else {
							    // Conner case
							    if (targetLayout.hasClass('lzh1')) {
							    	var minH = 240;
							    	if (!targetLayout.data('origin-minheight')) {
							    		targetLayout.data('origin-minheight', '240px');
							    	}
							    	var tarH = 120;
							    	if (targetScaleValue.indexOf('%') >= 0) {
							    		tarH = minH * parseInt(targetScaleValue)/100;
							    	} else {
							    		tarH = parseInt(targetScaleValue);
							    	}
							    	targetStyle += "min-height:" + tarH + "px;";
							    	
							    } else {
							    	targetStyle += "width:" + targetScaleValue + ";";
							    }
							}
							
							var marginTop = marginInputs.eq(index*4 + 0).val();
							var marginBottom = marginInputs.eq(index*4 + 1).val();
							var marginLeft = marginInputs.eq(index*4 + 2).val();
							var marginRight = marginInputs.eq(index*4 + 3).val();
							targetStyle += 'margin-top:' + marginTop + 'px;';
							targetStyle += 'margin-bottom:' + marginBottom + 'px;';
							targetStyle += 'margin-left:' + marginLeft +'px;';
							targetStyle += 'margin-right:' + marginRight +'px';
							targetStyle += '!important;';
							targetLayout.attr('style' ,targetStyle);
							var bcVal = bcInputs.eq(index).val();
							if (bcVal && bcVal != null) {
							    if (bcVal != 'transparent') {
							    	targetLayout.css({
		                                'background-color' : '#' + bcVal
		                            });
							    } else {
							    	targetLayout.css({
		                                'background-color' : 'transparent'
		                            });
							    }
							}
							
							var bgiVal = bgiInputs.eq(index).val(),
								tlWidth = targetLayout.width(),
								tlHeight = targetLayout.height();
							if (bgiVal && bgiVal != null) {
							    targetLayout.css({
                                    'background' : 'url(/'+bgiVal+') 0 0 no-repeat',
                                    'background-size' : tlWidth + 'px ' + tlHeight + 'px'
                                });
                            }
							
							config = {
								margin : {
									left : marginLeft,
									top : marginTop,
									right : marginRight,
									bottom : marginBottom
								},
								background : {
									color : bcVal,
									image : bgiVal,
									position : '0 0',
									repeat : 'no-repeat',
									size : tlWidth + 'px ' + tlHeight + 'px',
								}
							};
							cellsConfig.push(config);
							//log(targetLayout.attr('style'));
						});
						
						oTemplate.attr('data-history-config', targetScaleParam + "$" + targetMaginParam);
						
						elemData = {cells : cellsConfig};
						layoutCachedData[layoutid] = elemData;
						
						var cachedObj = {'id' : layoutid, 'data' : elemData};
						oTemplate.attr('data-cache', JSON.stringify(cachedObj));
						
						//log(layoutCachedData);
						// setting background color;
						$('#configModal').modal('hide');
					}
				}
				
			};
			setupUpload = function () {
			  var oModal = $('#configModal');
			  var $modalBody = oModal.find('.modal-body');
			  var $inputUnit = $modalBody.find('input[name=unit]');
			  var $inputScale = $modalBody.find('input[name=scale]');
			  var $inputBGColor = $modalBody.find('input[name=inp-bc]');
			  var $inputBGImage = $modalBody.find('input[name=attr]');
			  var $inputBGImageUrl = $modalBody.find('input[name=inp-bgi]');
			  
			  // Automatically calculate the scale in layout
			  $inputUnit.each(function (index){
			      $(this).click(function (){
			          var val = $(this).val();
			          $inputUnit.eq(1-index).removeAttr('checked');
			          $('.unit').text(val);
			          
			          var sum4Layout = 0;
			          $inputScale.each(function (){
			              sum4Layout += parseInt($(this).val());
			          });
			          
			          if (sum4Layout > 0) {
			              if (val == '%') {
	                          $inputScale.each(function (){
	                              var pxVal = $(this).val();
	                              var target = Math.round((pxVal / sum4Layout) * 100);
	                              $(this).val(target);
	                          });
	                      } else if (val == 'px'){
	                          $inputScale.each(function (index){
	                              var v = aLayout.eq(index).width();
	                              $(this).val(v);
	                          });
	                      }
			          }
			          
			      });
			  });
			  
			  $inputBGColor.each(function (){
			      $(this).ColorPicker({
			            onSubmit : function(hsb, hex, rgb, el) {
			                $(el).val(hex);
			                $(el).ColorPickerHide();
			            },
			            onBeforeShow : function() {
			                $(this).ColorPickerSetColor(this.value);
			            }
			        }).on('keyup', function() {
			            $(this).ColorPickerSetColor(this.value);
			        });
			  });
			  
			  var $cb = $.Callbacks();
			  $inputBGImage.each(function (index){
			      var fn = function(){
			          var id = '#upload_'+index;
			          
			          if ($(id).length) {
			              try{
			                  $(id).uploadify('destroy');
			              }catch(e){
			                  log(e);
			              }finally{
			                  $(id).uploadify({
		                          height        : 30,
		                          buttonText    :'<div class="row-fluid"><button class="btn btn-block btn-primary">上传背景图片</button></div>',
		                          swf           : ctxUrl+'/cmskj/js/uploadify/uploadify.swf',
		                          uploader      : ctxUrl+'/attachmentController/uploadReturnUrl.do?type=1',
		                          width         : 200,
		                          'onUploadSuccess' : function(file, data, response) {
		                              var res = $.parseJSON(data);
		                              $inputBGImageUrl.eq(index).val(res.url);
		                          },
		                          'onDestroy' : function (){
		                              log('destroying');
		                          }
		                      });
			              }
			          }
			      };
			      $cb.add(fn);
			  });
			  
			  $cb.fire();
			},
			fnCancel = function (){
			    var oModal = $('#configModal');
                oModal.modal('hide');
			};
		}

	}

	return {
		body : html,
		footer : footer,
		onRenderReady : setupUpload ,
		buttonFn : {
			fnOK : fnOK,
			fnCancel : fnCancel
		}
	};
}


/**
 * [constructConfigPanelTemplate description]
 * @param  {[type]} type   [Operable type that indicates a specific widget]
 * @param  {[type]} ext    [Extra params that need to be configured]
 * @param  {[type]} elemId [Source Element that need to be configured, 
 *                          will pass the parameters to the panel and then pass it back when legally finished]
 * @param  {[type]} self    [If not specify an element id, pass the self reference inside]
 * @param  {[type]} todo    [Indicates which command to do]
 * @return {[type]}        [description]
 */
function constructConfigPanelTemplate(type, elemId, self, todo){
	var html = '<div class="row">';
		//html += '<div class="span3">';
	var elem;
	if (self) {
	    elem = self;
	} else {
	    elem = $('#'+elemId);
	}
	var ext = elem.attr('data-widget-param');
	var operable = type.split(",");

	if (operable.length == 2) {
	    elem = self;
	    for(var i =0;i<operable.length;i++){
            if(operable[i] == "panel"){
                continue;
            }
            html += '<div class="row-fluid">';
            html += '<div class="offset1 span2 text-right">'+operable[i]+'：</div>';
            if(operable[i] == "text"){
                html += '<div class="span2"><input type="text" class="form-control" value="'+$(elem).html()+'"></div>';
            }else{
                html += '<div class="span2"><input type="text" class="form-control" value="'+$(elem).attr(operable[i])+'"></div>';
            }
            html += '</div>';
        }
		
	} else if (operable.length == 1) {
		var operType = operable[0];
		if (operType == 'flash') {
			html += '<div class="row-fluid">';
			html += '<div class="offset3 span3"><input type="file" id="upload" name="attr" class="form-control"></div>';
			html += '<div><input type="hidden" id="conf-url" name="url" class="form-control"></div>';
			html += '</div><br>';
		} else if (operType == 'navbar-list') {
		    
		    if (todo && todo == 'append') {
		        // for appending new navitem
		        if(elem.hasClass('widget-navbar')) {
		         // normal navbar
                    $.ajax({
                        url : ctxUrl + '/siteController/getSite.do?t='+Math.random(),
                        cache : false,
                        async : false,
                        type : "POST",
                        data : {'siteId' : $.trim($('#site').val())},
                        success : function (result){
                            var res = $.parseJSON(result);
                            html += '<form id="form1">';
                            html += '<div class="row-fluid">';
                            html += '<div class="offset2 span2 text-right">站点:</div>';
                            html += '<div class="span3"><select id="site" name="site" onchange="changeSite()">';
                            for (var i = 0, len = res.length; i < len; i++) {
                                var siteId = res[i]['siteId'];
                                html += '<option value="' + siteId + '" >' + res[i]['siteName'] + '</option>';
                            }
                            html += '</select>';
                            html += '</div></div>';

                            html += '<div class="row-fluid">';
                            html += '<div class="offset2 span2 text-right">栏目:</div>';
                            $.ajax({
                                url : ctxUrl + '/siteColumnController/getSiteColumn.do',
                                cache : false,
                                async : false,
                                type : 'POST',
                                data : {'siteId': res[0]['siteId']},
                                success : function (d){
                                    var data = $.parseJSON(d);
                                    html += '<div class="span3"><select id="siteColumn" name="siteColumn">';
                                    for (var i = 0, len = data.length; i < len; i++) {
                                        var columnId = data[i]['columnId'];
                                        html += '<option value="' + columnId + '" >' + data[i]['columnName'] + '</option>';
                                    }
                                    html += '</select>';
                                    html += '</div></div><br>';

                                    html += '</form>';
                                    html += '</div>';
                                }
                            });
                        }
                    });
                    
                } else{

                    html += '<div class="row">';
                    html += '<div class="row-fluid">';
                    html += '<div class="offset2 span2 text-right op_item" op_item="text">链接文字:</div>';
                    html += '<div class="span1"><input type="text" class="form-control"></div>';
                    html += '</div>';
                    html += '</div>';

                    html += '<div class="row">';
                    html += '<div class="row-fluid">';
                    html += '<div class="offset2 span2 text-right op_item" op_item="href">链接地址:</div>';
                    html += '<div class="span1"><input type="text" class="form-control"></div>';
                    html += '</div>';
                    html += '</div>';
                }
            } else {
             // do nothing, but maybe construct a bc/bgi configurable panel
            }
		} else if (operType == 'footer') {
		 // do nothing, but maybe construct a bc/bgi configurable panel
		} else if (operType == 'upload') {
			// Pictures
			html += '<div class="row-fluid">';
			html += '<div class="offset3 span3"><input type="file" id="upload" name="attr" class="form-control"></div>';
			html += '<div><input type="hidden" id="conf-url" name="url" class="form-control"></div>';
			html += '</div><br>';
		} else if (operType == 'link-panel') {
		    // Not allow to edit the contents
		    if (todo && todo == 'append') {
		        html += '<div class="row">';
	            html += '<div class="row-fluid">';
	            html += '<div class="offset2 span2 text-right op_item" op_item="text">链接文字:</div>';
	            html += '<div class="span1"><input type="text" class="form-control"></div>';
	            html += '</div>';
	            html += '</div>';

	            html += '<div class="row">';
	            html += '<div class="row-fluid">';
	            html += '<div class="offset2 span2 text-right op_item" op_item="href">链接地址:</div>';
	            html += '<div class="span1"><input type="text" class="form-control"></div>';
	            html += '</div>';
	            html += '</div>';
		    }
		} else if (operType == 'powerpoint') {
		    $.ajax({
                url : ctxUrl + '/siteController/getSite.do?t='+Math.random(),
                cache : false,
                async : false,
                type : "POST",
                data : {'siteId' : $.trim($('#site').val())},
                success : function (result){
                    var res = $.parseJSON(result),
                    	wcd = null, data = null, widget = null;
                    if (elemId in widgetCachedData){
                    	wcd = widgetCachedData[elemId];
                    	data = wcd['data'],
                    	widget = data['widget'];
                    };
                    
                    
                    html += '<form id="form1">';
                    html += '<div class="row-fluid">';
                    html += '<div class="offset2 span2 text-right">站点:</div>';
                    html += '<div class="span3"><select id="site" name="site" onchange="changeSite()">';
                    for (var i = 0, len = res.length; i < len; i++) {
                    	var siteId = res[i]['siteId'];
                    	var selectedString = !wcd ? '' : (widget['siteId'] == siteId ? 'selected' : '');
                        html += '<option value="' + siteId + '" '+ selectedString +'>' + res[i]['siteName'] + '</option>';
                    }
                    html += '</select>';
                    html += '</div></div>';

                    html += '<div class="row-fluid">';
                    html += '<div class="offset2 span2 text-right">栏目:</div>';
                    $.ajax({
                        url : ctxUrl + '/siteColumnController/getSiteColumn.do',
                        cache : false,
                        async : false,
                        type : 'POST',
                        data : {'siteId': res[0]['siteId']},
                        success : function (d){
                            var data = $.parseJSON(d);
                            html += '<div class="span3"><select id="siteColumn" name="siteColumn">';
                            for (var i = 0, len = data.length; i < len; i++) {
                            	var columnId = data[i]['columnId'];
                            	var selectedString = !wcd ? '' : (!widget['siteColumnId'] ? '' : (widget['siteColumnId'] == columnId ? 'selected' : ''));
                                html += '<option value="' + columnId + '" '+selectedString+'>' + data[i]['columnName'] + '</option>';
                            }
                            html += '</select>';
                            html += '</div></div>';

                            html += '<div class="row-fluid">';
                            html += '<div class="offset2 span2 text-right">条数:</div>';
                            html += '<div class="span3"><input type="text" id="siteCount" name="count" class="form-control" value="'+(!wcd ? '' : widget['siteCount'])+'"></div>';
                            html += '</div>';

                            html += '<div class="row-fluid">';
                            html += '<div class="offset2 span2 text-right">长度:</div>';
                            html += '<div class="span3"><input type="text" id="siteLength" name="length" class="form-control" value="'+(!wcd ? '' : widget['siteLength'])+'"></div>';
                            html += '</div>';

                            html += '</form>';
                            html += '</div>';
                        }
                    });
                }
            });
		} else if (operType == 'navbar') {
			$.ajax({
				url : ctxUrl + '/siteController/getSite.do?t='+Math.random(),
				cache : false,
				async : false,
				type : "POST",
				data : {'siteId' : $.trim($('#site').val())},
				success : function (result){
					var res = $.parseJSON(result);
                		wcd = null, 
                		data = null, 
                		widget = null, 
                		widgetData = null,
                		target = self,
                		dataIndex = -1;
                	if (elemId in widgetCachedData){
	                	wcd = widgetCachedData[elemId];
	                	data = wcd['data'],
	                	widget = data['widget'],
	                	dataIndex = target.attr('data-index');
	                	if (dataIndex && dataIndex != -1){
	                	    widgetData = widget[dataIndex];
	                	}
	                }
					html += '<form id="form1">';
					html += '<div class="row-fluid">';
					html += '<div class="offset2 span2 text-right">站点:</div>';
					html += '<div class="span3"><select id="site" name="site" onchange="changeSite()">';
					for (var i = 0, len = res.length; i < len; i++) {
						var siteId = res[i]['siteId'];
                    	var selectedString = !widgetData ? '' : (widgetData['siteId'] == siteId ? 'selected' : '');
                        html += '<option value="' + siteId + '" '+ selectedString +'>' + res[i]['siteName'] + '</option>';
					}
					html += '</select>';
					html += '</div></div>';

					html += '<div class="row-fluid">';
					html += '<div class="offset2 span2 text-right">栏目:</div>';
					$.ajax({
						url : ctxUrl + '/siteColumnController/getSiteColumn.do',
						cache : false,
						async : false,
						type : 'POST',
						data : {'siteId': res[0]['siteId']},
						success : function (d){
							var data = $.parseJSON(d);
							html += '<div class="span3"><select id="siteColumn" name="siteColumn">';
							for (var i = 0, len = data.length; i < len; i++) {
								var columnId = data[i]['columnId'];
                            	var selectedString = !widgetData ? '' : (!widgetData['siteColumnId'] ? '' : (widgetData['siteColumnId'] == columnId ? 'selected' : ''));
                                html += '<option value="' + columnId + '" '+selectedString+'>' + data[i]['columnName'] + '</option>';
							}
							html += '</select>';
							html += '</div></div><br>';

							html += '</form>';
							html += '</div>';
						}
					});
				}
			});
		} else if (operType == 'panel') {
			$.ajax({
				url : ctxUrl + '/siteController/getSite.do?t='+Math.random(),
				cache : false,
				async : false,
				type : "POST",
				data : {'siteId' : $.trim($('#site').val())},
				success : function (result){
					var res = $.parseJSON(result),
						wcd = null, data = null, widget = null;
                    if (elemId in widgetCachedData){
                    	wcd = widgetCachedData[elemId];
                    	data = wcd['data'],
                    	widget = data['widget'];
                    };
					html += '<form id="form1">';
					html += '<div class="row-fluid">';
					html += '<div class="offset2 span2 text-right">站点:</div>';
					html += '<div class="span3"><select id="site" name="site" onchange="changeSite()">';
					for (var i = 0, len = res.length; i < len; i++) {
						var siteId = res[i]['siteId'];
                    	var selectedString = !wcd ? '' : (widget['siteId'] == siteId ? 'selected' : '');
                        html += '<option value="' + siteId + '" '+ selectedString +'>' + res[i]['siteName'] + '</option>';
					}
					html += '</select>';
					html += '</div></div>';

					html += '<div class="row-fluid">';
					html += '<div class="offset2 span2 text-right">栏目:</div>';
					$.ajax({
						url : ctxUrl + '/siteColumnController/getSiteColumn.do',
						cache : false,
						async : false,
						type : 'POST',
						data : {'siteId': res[0]['siteId']},
						success : function (d){
							var data = $.parseJSON(d);
							html += '<div class="span3"><select id="siteColumn" name="siteColumn">';
							for (var i = 0, len = data.length; i < len; i++) {
								var columnId = data[i]['columnId'];
                            	var selectedString = !wcd ? '' : (!widget['siteColumnId'] ? '' : (widget['siteColumnId'] == columnId ? 'selected' : ''));
                                html += '<option value="' + columnId + '" '+selectedString+'>' + data[i]['columnName'] + '</option>';
							}
							html += '</select>';
							html += '</div></div>';

							html += '<div class="row-fluid">';
                            html += '<div class="offset2 span2 text-right">条数:</div>';
                            html += '<div class="span3"><input type="text" id="siteCount" name="count" class="form-control" value="'+(!wcd ? '' : widget['siteCount'])+'"></div>';
                            html += '</div>';

                            html += '<div class="row-fluid">';
                            html += '<div class="offset2 span2 text-right">长度:</div>';
                            html += '<div class="span3"><input type="text" id="siteLength" name="length" class="form-control" value="'+(!wcd ? '' : widget['siteLength'])+'"></div>';
                            html += '</div>';

							html += '<div class="row-fluid">';
							html += '<div class="offset2 span2 text-right">时间:</div>';
							html += '<div class="span3"><select name="date" id="siteTime">';
							html += '<option value="yyyy-MM-dd" '+(!wcd ? "" : (!widget['siteTime'] ? "" : (widget['siteTime'] == "yyyy-MM-dd" ? "selected" : "")))+'>2014-01-01</option>';
							html += '<option value="MM-dd" '+(!wcd ? "selected" : (widget['siteTime'] == "MM-dd" ? "selected" : ""))+'>01-01</option>';
							html += '<option value="yyyy年MM月dd日" '+(!wcd ? "" : (!widget['siteTime'] ? "" : (widget['siteTime'] == "yyyy年MM月dd日" ? "selected" : "")))+'>2014年01月01日</option>';
							html += '<option value="yyyyMMdd" '+(!wcd ? "" : (!widget['siteTime'] ? "" : (widget['siteTime'] == "yyyyMMdd" ? "selected" : "")))+'>20140101</option>';
							html += '</select></div>';
							html += '</div><br>';
							html += '</form>';
							html += '</div>';
						}
					});
				}
			});
		} else if (operType == 'text') {
		    html += '<div class="row-fluid">';
            html += '<div class="offset2 span2 text-right">text：</div>';
            html += '<div class="span1"><input type="text" class="form-control" value="'+$(elem).html()+'"></div>';
            html += '</div>';
		} else if (operType == 'vote') {
		    //投票部件
		    
		}



		// Some basic params is allowed to be reset
		if (ext && !todo) {
			// w --> width, h --> height, bc --> background-color, bgi --> background-image
			var params = ext.split(';');

			//history configurations
			var historyConfig = elem.attr('data-history-config');
			var configJson = parseKV2Json(historyConfig);
			for (var i=0,len=params.length; i<len; i++) {
				var param = params[i];
				if (param) {
					// row started
				    html += '<div class="row">';
					html += '<div class="row-fluid">';
					if ('link' === param) {
						html += '<div class="offset2 span2 text-right">链接:</div>';
						html += '<div class="span3"><input type="text" id="conf-link" class="form-control" value="'+configJson['link']+'"></div>';
					} else if ('width' === param) {
						html += '<div class="offset2 span2 text-right">宽度:</div>';
						html += '<div class="span3"><input type="text" id="conf-width" class="form-control" value="'+configJson['width']+'"></div>';
					} else if ('height' === param) {
						html += '<div class="offset2 span2 text-right">高度:</div>';
						html += '<div class="span3"><input type="text" id="conf-height" class="form-control" value="'+configJson['height']+'"></div>';
					} else if ('bc' === param) {
						html += '<div class="offset2 span2 text-right">背景色:</div>';
						html += '<div class="span3"><input type="text" id="conf-bc" class="form-control" value="'+configJson['bc']+'"></div>';
					} else if ('bgi' === param) {
					    html += '<div class="row-fluid">';
                        html += '<div class="offset4 span3"><input type="file" id="upload" name="attr" class="form-control" value="'+configJson['bgi']+'"></div>';
                        html += '<div><input type="hidden" id="conf-bgi" name="inp-bgi" class="form-control"></div>';
                        html += '</div>';
					} else if ('nb' === param) {
					    $.ajax({
			                url : ctxUrl + '/siteController/getSite.do?t='+Math.random(),
			                cache : false,
			                async : false,
			                type : "POST",
			                data : {'siteId' : $.trim($('#site').val())},
			                success : function (result){
			                    var res = $.parseJSON(result);
			                    html += '<form id="form1">';
			                    html += '<div class="row-fluid">';
			                    html += '<div class="offset2 span2 text-right">站点:</div>';
			                    html += '<div class="span3"><select id="site" name="site" onchange="changeSite()">';
			                    for (var i = 0, len = res.length; i < len; i++) {
			                        html += '<option value="' + res[i]['siteId'] + '">' + res[i]['siteName'] + '</option>';
			                    }
			                    html += '</select>';
			                    html += '</div></div>';

			                    html += '<div class="row-fluid">';
			                    html += '<div class="offset2 span2 text-right">栏目:</div>';
			                    $.ajax({
			                        url : ctxUrl + '/siteColumnController/getSiteColumn.do',
			                        cache : false,
			                        async : false,
			                        type : 'POST',
			                        data : {'siteId': res[0]['siteId']},
			                        success : function (d){
			                            var data = $.parseJSON(d);
			                            html += '<div class="span3"><select id="siteColumn" name="siteColumn">';
			                            for (var i = 0, len = data.length; i < len; i++) {
			                                html += '<option value="' + data[i]['columnId'] + '">' + data[i]['columnName'] + '</option>';
			                            }
			                            html += '</select>';
			                            html += '</div></div>';

			                            html += '</form>';
			                            html += '</div>';
			                        }
			                    });
			                }
			            });
					} else {
						// Unknown parameter
//						html += '<div class="offset1 span2 text-right">配置参数:</div>';
//						html += '<div class="span3"><input type="text" class="form-control"></div>';
					}

					// row ended
					html += '</div>';
					html += '</div>';
				} else {
					// The last senmicolon, need to do nothing 
				}
			}
		}
	}


	html += '</div>';//end for row class

	
	

	//confirg footer, especially for the button events
	var footer = '<button class="btn btn-primary">确定</button><button class="btn btn-default" data-dismiss="modal">取消</button>',
		widgetConfig = {},
		extraConfig = {},
		elemData = {},
		setupUpload = null,
		fnOK = null, fnCancel = null, fnUpload = null;
	
	function modalCleanUp(){
	    try {
	        $("#upload").uploadify('destroy');
	    }catch(e){};
	    
        var oModal = $('#configModal');
        var $modalBody = oModal.find('.modal-body');
        oModal.modal('hide');
        $modalBody.empty();
	}
	
	function extraFn (fnType) {
	    var history = '',
            link = '',
            width = '',
            height = '',
            bgcolor = '',
            bgimage = '';
        var flag = !1;
    
        if ($('#conf-link').length) 
            link = $.trim($('#conf-link').val());
        
        if ($('#conf-width').length) 
            width = $.trim($('#conf-width').val());
    
        if ($('#conf-height').length) 
            height = $.trim($('#conf-height').val());
    
        if ($('#conf-bc').length) 
            bgcolor = $.trim($('#conf-bc').val());
    
        if ($('#conf-bgi').length) 
            bgimage = $.trim($('#conf-bgi').val());
    
    
        //validate parameters
        (function (a,b,c,d){
            var are = /([\w-]+\.)+[\w-]+([\w-.?\%\&\=]*)?/gi;
            var bre = /\d+/gi;
            var cre = /\d+/gi;
            var dre = /\#[0-9a-fA-F]{6}/gi;
            var ere = /\.(bmp|jpg|gif|jpeg)$/gi;
            var errorMessage = '参数非法，请检查';
            if(a && !are.test(a)){
//                /alert(errorMessage);
                flag = true;
            }
    
            
        })(link, width, height, bgimage);
    
    
        if (flag){
            return false;
        }
    
        if(link)
            history += 'link='+link+";";
    
        if(width)
            history += 'width='+width+";";
        
        if(height)
            history += 'height='+height+";";
        
        if(bgcolor)
            history += 'bc='+bgcolor+";";
        
        if(bgimage)
            history += 'bgi='+bgimage+";";
        
        elem.attr('data-history-config', history);
    
        if (width && height) {
            var oW = elem.width();
            var oH = elem.height();
            if (width.indexOf('%') == -1 && height.indexOf('%') == -1) {
                if (oW < parseInt(width) || oH < parseInt(height)) {
                    alert('提示：设置的图片大小超出原部件，将改变原部件尺寸');
                    if (oW < parseInt(width) && oH < parseInt(height)) {
                        elem.attr({
                            "style" : 'width:'+ parseInt(width) + 'px;height:' + parseInt(height) +'px;!improtant;'
                        });
                    } else if (oW < parseInt(width)) {
                        elem.attr({
                            "style" : 'width:'+ parseInt(width) + 'px;height:'+ oH +'px;!improtant;'
                        });
                    } else {
                        elem.attr({
                            "style" : 'width:'+ oW + 'px;height:'+ parseInt(height) +'px;!improtant;'
                        });
                    }
                } else {
                    elem.attr({
                        "style" : 'width:'+ parseInt(width) + 'px;height:'+ parseInt(height) +'px;!improtant;'
                    });
                }
                elem.css('background-size', width + 'px ' + height + 'px');   
            } else {
                // for the percentage
                var tarW = parseInt(width),
                    tarH = parseInt(height);
                if (width.indexOf('%') >= 0) {
                    tarW += '%';
                } else {
                    tarW += 'px';
                }
                
                if (height.indexOf('%') >= 0) {
                    tarH += '%';
                } else {
                    tarH += 'px';
                }
                
                if (fnType && fnType.indexOf('panel') >= 0){
                    elem.find('[class$=body]').attr({
                        "style" : 'width:'+ tarW + ';height:'+ tarH + ';!improtant;'
                    });
                }
                elem.attr({
                    "style" : 'width:'+ tarW + ';height:'+ tarH + ';!improtant;'
                });
                elem.css('background-size', elem.width() + 'px ' + elem.height() + 'px');  
            }
        }
        //Change image bi and size
        var imgUrl = $('#conf-url').val();
        if (imgUrl){
            if (fnType == 'upload') {
                var bg = 'background:url(/'+ imgUrl + ') 0 0 no-repeat;background-size:' + elem.width() + 'px ' + elem.height() + 'px;';
                var originStyle = elem.attr('style');
                elem.empty().attr({
                    style : originStyle + ";" + bg
                });
            } else if (fnType == 'flash') {
                var config = elem.data('history-config');
                if (config) {
                    elem.attr("data-history-config",config + ";" + "link="+imgUrl);
                } else {
                    elem.attr("data-history-config", "link="+imgUrl);
                }
            }
        } else {
            var bgiUrl = $('#conf-bgi').val();
            if (fnType == 'footer' || fnType == 'vote') {
                var bg = 'background:url(/'+ bgiUrl + ') 0 0 no-repeat;background-size:' + elem.width() + 'px ' + elem.height() + 'px;';
                var originStyle = elem.attr('style');
                elem.attr({
                    style : originStyle + ";" + bg
                });
            }
        }
        
        
        if (bgcolor){
            if(bgcolor.indexOf('#') < 0){
                bgcolor = '#' + bgcolor;
            }
            
            if (fnType && fnType.indexOf('panel') >= 0){
                elem.find('[class$=body]').css('background-color', bgcolor); 
            } else {
                elem.css('background-color', bgcolor); 
            }
        }
        
        
        return {
        	link : link,
            width : width,
            height : height,
            bgcolor : bgcolor,
            bgimage : bgimage
        };
	}
	
	var operType = '';
	if (operable.length == 2) {
		operType = 'text,href';
 		fnOK = function (){
 		    var oModal  = $('#configModal');
 		    var $modalBody = oModal.find('.modal-body');
 		    var aInputs = $modalBody.find('input[type=text]');
 		    var title = aInputs.eq(0).val();
 		    elem.html(title);
 		    elem.attr('title', title);
 		    elem.attr('href', aInputs.eq(1).val());
 		    oModal.modal('hide');
 		};
	} else if (operable.length == 1) {
		operType = operable[0];
		if (operType == 'flash') {
			setupUpload = function (){
				$("#upload").uploadify({
			        height        : 30,
			        buttonText    :'<div class="row-fluid"><button class="btn btn-block btn-default">选择Flash</button></div>',
			        swf           : ctxUrl+'/cmskj/js/uploadify/uploadify.swf',
			        uploader      : ctxUrl+'/attachmentController/uploadReturnUrl.do?type=2',
			        width         : 120,
			        'onUploadSuccess' : function(file, data, response) {
			            //alert('The file ' + file.name + ' was successfully uploaded with a response of ' + response + ':' + data);
			            var res = $.parseJSON(data);
			            $('#conf-url').val(res.url);
			            $('#conf-height').val(res.height);
			            $('#conf-width').val(res.width);
			        }
			    });
			},
			fnUpload = function (){
				$("#upload").uploadify("upload", '*');
			},
			fnOK = function (e){
				try {
				    $("#upload").uploadify('destroy');
				}catch(e){};
				
				extraFn('flash');
				$('#configModal').modal('hide');
			};

			fnCancel = function (){
			    modalCleanUp();
			};
		} else if (operType == 'upload') {
			setupUpload = function (){
			    if ($("#upload").length) {
			        try{
			            $("#upload").uploadify('destroy');
			        }catch(e){};
			    }
			    
				$("#upload").uploadify({
			        height        : 30,
			        width         : 120,
			        buttonText    :'<div class="row-fluid"><button class="btn btn-block btn-default">选择图片</button></div>',
			        swf           : ctxUrl+'/cmskj/js/uploadify/uploadify.swf',
			        uploader      : ctxUrl+'/attachmentController/uploadReturnUrl.do?type=1',
			        'onUploadSuccess' : function(file, data, response) {
			            //alert('The file ' + file.name + ' was successfully uploaded with a response of ' + response + ':' + data);
			            var res = $.parseJSON(data);
			            $('#conf-url').val(res.url);
			            $('#conf-height').val(res.height);
                        $('#conf-width').val(res.width);
			        }
			    });
			},
			fnOK = function (e){
			    try {
		            $("#upload").uploadify('destroy');
		        }catch(e){};
		        
		        extraFn('upload');
				$('#configModal').modal('hide');
			};

			fnCancel = function (){
			    modalCleanUp();
			};
		} else if (operType == 'panel'){
			fnOK = function (){
				extraConfig = extraFn('panel');
		    	
				$('#form1').form('submit',{
					url : ctxUrl + '/modelController/getColumnHtml.do',
					onSubmit : function (){
						return $(this).form('validate');
					},
					success : function (data){
						var res = $.parseJSON(unescape(data))[0];
						var target = elem;
						for (var n in res) {
							if (res[n] == '') {
								alert('不能为空');
							} else {
								if (n == 'more') {
								    $('[desc="more"]', target).attr('href', res['more']);
								} else {
									$('[desc="'+n+'"]', target).html(HTMLUnescape(res[n]));
									if (n == 'content') {
										target.attr('desc_ext', HTMLUnescape(res[n]));
									}
								}
							}
						}
						
						widgetConfig = {
		                    'siteId' : $('#site').val(),
		                    'siteColumnId' : $('#siteColumn').val(),
		                    'siteCount' : $('#siteCount').val(),
		                    'siteLength' : $('#siteLength').val(),
		                    'siteTime' : $('#siteTime').val()
		                };
		                elemData = {
		                    'type' : operType,
		                    'data' : {
		                        'widget' : widgetConfig,
		                        'extra' : extraConfig
		                    }
		                };
		                widgetCachedData[elemId] = elemData;
		                
						var cachedObj = {'id':elemId, 'data': elemData};
						target.attr('data-cache', JSON.stringify(cachedObj));
						$('#configModal').modal('hide');
					}
				});
			};

			fnCancel = function (){
				log('Default cancel');
			};
		} else if (operType == 'link-panel') {
		    if (todo && todo == 'append') {
		        fnOK = function () {
	                var target = elem;
	                var oModal = $("#configModal");
	                var $modalBody = oModal.find('.modal-body');
	                var $rows = $modalBody.find(".row-fluid");
	                var oA = $("<a operable='text,href'></a>");
	                $rows.each(function(){
	                    var attr = $(this).find(".op_item").attr("op_item"),
	                        val = $(this).find("input[type='text']").val();
	                    if(attr == "text"){
	                        oA.text(val || 'error');
	                        oA.attr('title', val || 'error');
	                    }else{
	                        oA.attr(attr,val || 'error');
	                    }
	                });
	                var oSpan = $("<span class='link-item' operable='link-item'></span>");
	                var oLi = $('<li class="link-list-item"></li>');
	                oSpan.append(oA).appendTo(oLi);
	                target.find('ul.link-list').append(oLi);
	                oA.on('click', function (ev){
	                    ev.preventDefault();
	                });
	                oA.smartMenu(menuData);
	                
	                //extraFn(operType);
	                $('#configModal').modal('hide');
	            };
		    } else {
		        fnOK = function (){
		            var target = elem;
		            extraConfig = extraFn(operType);
                    var dhc = "";
                        dhc += 'width=' + extraConfig['width'] + ';';
                        dhc += 'height=' + extraConfig['height'] + ';';
                        dhc += 'bc=' + extraConfig['bgcolor'] + ';';
                        dhc += 'bgi=' + extraConfig['bgimage'] + ';';
                    target.attr({
                        'data-history-config' : dhc
                    });
                    $('#configModal').modal('hide');
		        }
		    }
		} else if (operType == 'navbar-list' || operType == 'footer') {
		    if (todo && todo == 'append') {
		        // append new navbar item
		        fnOK = function () {
	                var target = elem;
	                var oModal = $("#configModal");
	                var $modalBody = oModal.find('.modal-body');
	                if (target.hasClass('widget-navbar')) {
	                    // for site binding
	                    var aLi = target.find('ul.navbar-list').children('li');
	                    var last = null,
	                        lastIndex = -1;
	                    if (aLi.length) {
	                        last = aLi.last().children('a');
	                        lastIndex = last.attr('data-index');
	                    }
	                    var oA = $('<a>').attr({
	                        'data-index' : +lastIndex + 1,
	                        'operable' : 'navbar'
	                    });
	                    var oLi = $('<li>');
	                    oA.appendTo(oLi);
	                    target.find('ul.navbar-list').append(oLi);
	                    
	                    // submit and add to cache
	                    $('#form1').form('submit',{
	                        url : ctxUrl + '/modelController/getColumnHtml.do',
	                        onSubmit : function (){
	                            return $(this).form('validate');
	                        },
	                        success : function (data){
	                            var res = $.parseJSON(data)[0];
	                            for (var n in res) {
	                                if (res[n] == '') {
	                                    alert('不能为空');
	                                } else {
	                                    if (n == 'more') {
	                                        oA.attr('href', res['more']);
	                                    } else if(n == 'title'){
	                                        oA.html(unescape(res[n]));
	                                    }
	                                }
	                            }
	                            var dataIndex = oA.attr('data-index');
	                            widgetConfig = {
	                                'siteId' : $('#site').val(),
	                                'siteColumnId' : $('#siteColumn').val()
	                            };
	                            
	                            if (elemId in widgetCachedData) {
	                                elemData = widgetCachedData[elemId];
	                            } else {
	                                widgetCachedData[elemId] = {};
	                                elemData = {
                                        'type' : operType,
                                        'data' : {
                                            'extra' : extraConfig
                                        }
                                    };
                                    if(!elemData['data']['widget'])elemData['data']['widget'] = {};
	                            }
	                            
	                            elemData['data']['widget'][dataIndex] = widgetConfig;
	                            widgetCachedData[elemId] = elemData;
	                            
	                            var cachedObj = {'id':elemId, 'data': elemData};
	                            oA.closest('.widget-navbar').attr('data-cache', JSON.stringify(cachedObj));
	                            oA.smartMenu(menuData);
	                            modalCleanUp();
	                        }
	                    });
	                    
	                } else {
	                    var $rows = $modalBody.find(".row-fluid");
	                    var oA = $("<a operable='text,href'></a>");
	                    $rows.each(function(){
	                        var attr = $(this).find(".op_item").attr("op_item"),
	                            val = $(this).find("input[type='text']").val();
	                        if(attr == "text"){
	                            oA.text(val || 'error');
	                            oA.attr('title', val || 'error');
	                        }else{
	                            oA.attr(attr,val || 'error');
	                        }
	                    });
	                    var oLi = $('<li class="nav-list-item"></li>');
	                    oA.appendTo(oLi);
	                    
	                    if (target.hasClass('nav-list-item')) {
	                        // find a place to insert
	                        var targetUl = target.children('ul.nav-list');
	                        if (!targetUl.length) {
	                            var newUl = '<ul class="nav-list" operable="navbar-list"></ul>';
	                            target.append(newUl);
	                            
	                            newUl.smartMenu(menuData);
	                        }
	                        target.children('ul.nav-list').append(oLi);
	                    } else {
	                        target.children('ul.nav-list').append(oLi);
	                        oLi.attr({'operable' : 'navbar-list'});
	                        var hintDom = '<ul class="nav-list" data-level="1" style="width: 100%; display: none;">';
	                            hintDom += '<li class="nav-list-item">二级导航</li></ul>';
	                        var $hintDom = $(hintDom);
	                        oLi.append($hintDom).smartMenu(menuData);
	                    }
	                    
	                    oA.smartMenu(menuData);
	                }
	                
	                $('#configModal').modal('hide');
	            };
		    } else {
		        fnOK = function (){
	                try {
	                    $("#upload").uploadify('destroy');
	                }catch(e){};
	                
	                extraFn('footer');
	                $('#configModal').modal('hide');
	            };

		    }
		    
		    fnCancel = function (){
                modalCleanUp();
            };
		} else if (operType == 'navbar') {
			fnOK = function (){
			    $('#form1').form('submit',{
                    url : ctxUrl + '/modelController/getColumnHtml.do',
                    onSubmit : function (){
                        return $(this).form('validate');
                    },
                    success : function (data){
                        var res = $.parseJSON(data)[0];
                        var target = elem || self;
                        for (var n in res) {
                            if (res[n] == '') {
                                alert('不能为空');
                            } else {
                                if (n == 'more') {
                                    $(target).attr('href', res['more']);
                                } else if(n == 'title'){
                                    $(target).html(unescape(res[n]));
                                }
                            }
                        }
                        var dataIndex = target.attr('data-index');
                        widgetConfig = {
                            'siteId' : $('#site').val(),
                            'siteColumnId' : $('#siteColumn').val()
                        };
                        
                        if (widgetCachedData[elemId]) {
                            elemData = widgetCachedData[elemId];
                        } else {
                            elemData = {
                                'type' : operType,
                                'data' : {
                                    'extra' : extraConfig
                                }
                            };
                            if(!elemData['data']['widget'])elemData['data']['widget'] = {};
                        }
                        
                        elemData['data']['widget'][dataIndex] = widgetConfig;
                        widgetCachedData[elemId] = elemData;
                        var cachedObj = {'id':elemId, 'data': elemData};
                        target.closest('.widget-navbar').attr('data-cache', JSON.stringify(cachedObj));
                        
                        $("[desc=content]",target).attr('style',"");
                        modalCleanUp();
                    }
                });
			    
			};
		} else if (operType == 'powerpoint') {
		    fnOK = function (){
		    	extraConfig = extraFn();
		        $('#form1').form('submit',{
                    url : ctxUrl + '/modelController/getColumnImgHtml.do',
                    onSubmit : function (){
                        return $(this).form('validate');
                    },
                    success : function (data){
                        var res = $.parseJSON(data)[0];
                        log(res);
                        var target = elem || self;
                        for (var n in res) {
                            if (res[n] == '') {
                                alert('不能为空');
                            } else {
                                if (n == 'more') {
                                    $('[desc="more"]', target).attr('href', res['more']);
                                } else {
                                    $('[desc="'+n+'"]', target).html(HTMLUnescape(res[n]));
                                    if (n == 'content') {
                                        target.attr('desc_ext', HTMLUnescape(res[n]));
                                    }
                                }
                            }
                        }
                        $("[desc=content]",target).attr('style',"");
                        
                        
                        widgetConfig = {
                            'siteId' : $('#site').val(),
                            'siteColumnId' : $('#siteColumn').val(),
                            'siteCount' : $('#siteCount').val(),
                            'siteLength' : $('#siteLength').val()
                        };
                        elemData = {
                            'type' : operType,
                            'data' : {
                                'widget' : widgetConfig,
                                'extra' : extraConfig
                            }
                        };
                        widgetCachedData[elemId] = elemData;
                        // fix the pager li
                        var oPager = elem.find('ul.btn-list');
                        var aLi = oPager.children('li');
                        var tot = parseInt(widgetConfig['siteCount']);
                        
                        if (tot>aLi.length) {
                            var dis = tot - aLi.length;
                            for (var i=1; i<=dis; i++) {
                                var idx = aLi.length + i;
                                var pagerLi = $('<li>').attr({
                                    'class' : 'page-btn'
                                }).html(idx);
                                oPager.append(pagerLi);
                            }
                        } else if (tot < aLi.length) {
                            while (oPager.children('li').length && tot < oPager.children('li').length) {
                                oPager.children('li').last().remove();   
                            }
                        }
                        
                        if (elem.hasClass('multi-ppt')) {
                            var aaLi = oPager.children('li');
                            aaLi.text('').removeClass('active');
                            aaLi.first().addClass('active');
                        }
                        var cachedObj = {'id':elemId, 'data': elemData};
                        target.attr('data-cache',JSON.stringify(cachedObj));
                        modalCleanUp();
                    }
                });
		    };
		} else if (operType == 'imgchunk') {
		    fnOK = function (){
		    	extraConfig = extraFn();
		        $('#form1').form('submit',{
                    url : ctxUrl + '/modelController/getColumnHtml.do',
                    onSubmit : function (){
                        return $(this).form('validate');
                    },
                    success : function (data){
                        var res = $.parseJSON(data)[0];
                        var target = elem || self;
                        for (var n in res) {
                            if (res[n] == '') {
                                alert('不能为空');
                            } else {
                                log(n+"::"+res[n]);
                                if (n == 'more') {
                                    $(target).attr('href', res['more']);
                                } else if(n == 'title'){
                                    $(target).html(unescape(res[n]));
                                }
                            }
                        }
                        $("[desc=content]",target).attr('style',"");
                        $('#configModal').modal('hide');
                    }
                });
		    };
		    
		} else if (operType == 'text') {
		    fnOK = function (){
		        var oModal  = $('#configModal');
	            var $modalBody = oModal.find('.modal-body');
	            var aInputs = $modalBody.find('input[type=text]');
	            var title = aInputs.eq(0).val();
	            elem.html(title);
	            oModal.modal('hide');
		    };
		} else if (operType == 'vote') {
		    setupUpload = function (){
		        //binding onchange event
		    };
		    
		    fnOK = function (){
		        var id = $('#voteSelect').find('option:selected').val(),
		            id = $.trim(id),
		        	title = $('#voteSelect').find('option:selected').html();
		        widgetConfig = {
		        	'voteId' : id
		        };
		        $.ajax({
		            url : '../suffrageController/getOptionList.do?id=' + id,
		            type : "POST",
		            cache : false,
		            async : false,
		            dataType : 'JSON',
		            success : function (res){
		                //Write in cache
		                var template = buildVoteTemplate(title ,res);
		                elem.find('.vote-body').html(template);
		                extraConfig = extraFn('vote');
		                elemData = {
		                	type : operType,
		                	data : {
		                		'widget' : widgetConfig,
			    				'extra' : extraConfig
		                	}
		                };
		                
		                var cachedObj = {'id' : elemId, 'data' : elemData};
		                elem.attr('data-cache',JSON.stringify(cachedObj));
		                widgetCachedData[elemId] = elemData;
		                modalCleanUp();
		            }
		        });
		    };
		}
	};

	return {
		body : html,
		footer : footer,
		onRenderReady : function (){
		    if (setupUpload && $.isFunction(setupUpload)){
		        setupUpload();
		    }
		    
		    if ($('#conf-bc').length) {
		        $('#conf-bc').ColorPicker({
		            onSubmit : function(hsb, hex, rgb, el) {
		                $(el).val(hex);
		                $(el).ColorPickerHide();
		            },
		            onBeforeShow : function() {
		                $(this).ColorPickerSetColor(this.value);
		            }
		        }).on('keyup', function() {
		            $(this).ColorPickerSetColor(this.value);
		        });
		    }
		    
		    
		    if ($('#conf-bgi').length) {
		        if ($("#upload").length) {
                    try{
                        $("#upload").uploadify('destroy');
                    }catch(e){};
                }
                
                $("#upload").uploadify({
                    height        : 30,
                    width         : 120,
                    buttonText    :'<div class="row-fluid"><button class="btn btn-block btn-default">选择背景图片</button></div>',
                    swf           : ctxUrl+'/cmskj/js/uploadify/uploadify.swf',
                    uploader      : ctxUrl+'/attachmentController/uploadReturnUrl.do?type=1',
                    'onUploadSuccess' : function(file, data, response) {
                        //alert('The file ' + file.name + ' was successfully uploaded with a response of ' + response + ':' + data);
                        var res = $.parseJSON(data);
                        $('#conf-bgi').val(res.url);
                    }
                });
            }
		},
		buttonFn : {
			fnUpload : fnUpload,
			fnOK : fnOK,
			fnCancel : fnCancel
		}
	};
}

/**
 * [initSourceCodeEditor description]
 * @return {[type]}
 */
function initSourceCodeEditor (html) {
    var oPanel =  $('#sourceCodePanel');
    var w = ($(window).width() - oPanel.width())/2;
    var h = ($(window).height() - oPanel.height())/2;
    $('#sourceCodeWrapper').html(html);
    
    w = w>10 ? w : 10;
    h = h>10 ? h : 10;
    oPanel.css({
        display : "block",
        left : w,
        top : h
    }).appendTo($('.mask')).show();
    $(window).scrollTop(0);
    
}

/**
 * [initSourceCodePanel description]
 * @return {[type]}
 */
function initSourceCodePanel(htmlCode, callback){
    var oModal = $('#configModal');
    var fragment = "<div class='container'>";
    fragment += '<pre class="pre-scrollable" contentEditable></pre>';
    fragment += '</div>';
    oModal.find('.modal-body').html($(fragment).find('pre').text(htmlCode));
    oModal.modal('show');
    
    oModal.find('.modal-footer').find('.btn-primary').on('click', function (){
        oModal.modal('hide');
        if (callback && $.isFunction(callback)) {
            callback(oModal.find('pre').html());
        }
    });
}

/**
 * [buildVoteTemplate This function will return a well format vote for later use]
 * @return {[String]}
 */
function buildVoteTemplate (title, questions) {
    var l = 0,
        genId = generatorId(4, 16, '', 'gen'),
        fragment = '<form id="voteForm_'+ genId +'" class="vote-form" method="POST" uriPrefix="'+absUrl+'" >';
    if (l = questions.length) {
    	fragment += '<div class="row"><div class="offset1 span6"><h4>'+ title +'</h4></div></div>';
    	fragment += '<input type="hidden" name="cc">';
        for (var i=l-1; i>=0; i-- ){
            var currentQ = questions[i];
            fragment += '<div class="row">';
            fragment += '<div class="span6">';
            
            // Question contents
            var optType = parseInt(currentQ['QUESTION_TYPE']),//问卷类型
                id      = currentQ['ID'],//问卷ID
                opts    = currentQ['interactiveOption'],//问卷选项
                //seq     = currentQ['SEQUENCE'],//序列号
                ques    = currentQ['QUESTION'],//问题
                intID   = currentQ['INTERACTIVE_ID'],//interative_id   选项id
                ol      = 0;
            fragment += '<input type="hidden" name="interactiveId" value="'+intID+'" />';
            fragment += '<input type="hidden" name="aa" value="'+id+'">';
            if (optType == 1) {
                //Single option
                if (ol = opts.length) {
                    //title
                    fragment += '<div class="row"><div class="rd">';
                    if (ol <= 5) {
                    	fragment += '<div class="offset1 span6">';
                        fragment += '<input type="hidden" name="'+id+'" value="'+intID+'"><b>'+ ques +':</b>&nbsp;&nbsp;';
                    } else {
                    	fragment += '<div class="offset1 span6">';
                        fragment += '<input type="hidden" name="'+id+'" value="'+intID+'"><b>'+ ques +'</b>:&nbsp;&nbsp;';
                        fragment += '</div>';
                        fragment += '<div class="row">';
                    	fragment += '<div class="offset1 span6">';
                    }
                    
                    for (;--ol >= 0;){
                        var opt = opts[ol];
                        fragment += '<input type="radio" value="'+opt["id"]+'">';
                        fragment += opt["optionValue"];
                        fragment += '&nbsp;&nbsp;';
                        
                        if ((opts.length - ol) % 5 == 0 && ol) {
                        	log(opts.length - ol);
                        	fragment += '</div>';
                        	fragment += '</div>';
                        	fragment += '<div class="row">';
                        	fragment += '<div class="offset1 span6">';
                        }
                    }
                    
                    
                    fragment += '</div>';
                    fragment += '</div>'; // radio end
                    fragment += '</div>'; // row end

                }
            } else if (optType == 2) {
                //Multiple option
                if (ol = opts.length) {
                    //title
                    fragment += '<div class="row"><div class="multi">';
                    if (ol <= 5) {
                    	fragment += '<div class="offset1 span6">';
                        fragment += '<input type="hidden" name="'+id+'" value="'+intID+'"><b>'+ques+':</b>&nbsp;&nbsp;';
                    } else {
                    	fragment += '<div class="offset1 span6">';
                        fragment += '<input type="hidden" name="'+id+'" value="'+intID+'"><b>'+ques+':</b>&nbsp;&nbsp;';
                        fragment += '</div>';
                        fragment += '<div class="row">';
                    	fragment += '<div class="offset1 span6">';
                    }
                    
                    for (;--ol >= 0;){
                        var opt = opts[ol];
                        fragment += '<input type="checkbox" name='+id+' value="'+opt["id"]+'">';
                        fragment += opt["optionValue"];
                        fragment += '&nbsp;&nbsp';
                        
                        if ((opts.length - ol) % 5 == 0 && ol) {
                        	fragment += '</div>';
                        	fragment += '<div class="row">';
                        	fragment += '<div class="offset1 span6">';
                        }
                    }
                    fragment += '</div>';
                    fragment += '</div>'; // multi end
                    fragment += '</div>'; // row end
                    
                }
            } else if (optType == 3) {
                // Mix type
                if (ol = opts.length) {
                    //title
                    fragment += '<div class="row"><div class="multi">';
                    if (ol <= 5) {
                    	fragment += '<div class="offset1 span6">';
                        fragment += '<input type="hidden" name="'+id+'" value="'+intID+'"><b>'+ques+':</b>&nbsp;&nbsp;';
                    } else {
                    	fragment += '<div class="offset1 span6">';
                        fragment += '<input type="hidden" name="'+id+'" value="'+intID+'"><b>'+ques+':</b>&nbsp;&nbsp;';
                        fragment += '</div>';
                        fragment += '<div class="row">';
                    	fragment += '<div class="offset1 span6">';
                    }
                    for (;--ol >= 0;){
                        var opt = opts[ol];
                        fragment += '<input type="checkbox" name='+id+' value="'+opt["id"]+'">';
                        fragment += opt["optionValue"];
                        fragment += '&nbsp;&nbsp;';
                        if ((opts.length - ol) % 5 == 0 && ol) {
                        	log(opts.length - ol);
                        	fragment += '</div>';
                        	fragment += '</div>';
                        	fragment += '<div class="row">';
                        	fragment += '<div class="offset1 span6">';
                        }
                    }
                    fragment += '</div>';
                    fragment += '</div>'; // multi end
                    fragment += '</div>'; // row end
                }
            } else if (optType == 4) {
                
              fragment += '<div class="row">';
              //title
              fragment += '<div class="offset1 span6"><b>简述题:</b>&nbsp;&nbsp;</div>';
              fragment += '</div>';
              
              fragment += '<div class="row">';
              fragment += '<div class="offset1 span6"><div class="tx">';
              fragment += '<textarea style="width:500px;" name="'+id+'1"></textarea>';
              fragment += '</div>';
              fragment += '</div>'; // textarea end
              fragment += '</div>'; // row end
              
            } else {
                // Undefined
            }
            
            fragment += '</div>';
            fragment += '</div>';
        }
        

        fragment += '<div class="row">';
        fragment += '<div class="offset2 span4">';
        fragment += '<button type="submit" class="btn btn-primary">确定</button>';
        fragment += '</div>';
        fragment += '</div>';
        
    } else {
        alert('无问卷数据');
    }
    fragment += '</form>';
    return fragment;
}