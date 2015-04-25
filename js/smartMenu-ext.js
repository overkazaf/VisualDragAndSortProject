/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 11:52:45
 * @version $Id$
 */
//smartMenu-ext.js
//		Define some utils to combine with smartMenu plugin,
//		This part will implement some operation logic for operable elements to make changes 


/**
	 * [parseKV2Json description]
	 * @param  {[type]} str [A ';' and '=' separated string that need to be parsed ] 
	 * @return {[type]}     [An json object that formats well in key-value form]
	 */
	function parseKV2Json(str){
		var obj = {};
		if (str.indexOf(';') >= 0 ) {
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


/* 
* Smart Menu configurations 
* This is a global var
*
*/
var menuData = [
   [{
	   	text : '编辑',
	   	func : function (){
	   		var type = $(this).attr('operable');
	   		
	   		var elemId = $(this).attr('data-widget-id');
	   		if (type) {
	   			var html = constructConfigPanelTemplate(type,elemId);
	   			displayConfigPanel(html);
	   		} else{
	   			var layout = $(this).attr('data-type');
	   			if (layout == 'layout-template') {
	   				var id = $(this).parent().attr('data-layout-id');
	   				var params = $(this).parent().attr('data-layout-param');
	   				var html = constructLayoutConfigPanelTemplate(id, params);
	   				displayLayoutConfigPanel(html);
	   				
	   			}
	   		}
	   	}
   }],
   [{
	   	text : '添加',
	   	func : function (){
	   		var type = $(this).attr('operable');
	   		if (type) {
	   			if (type == 'link-panel') {
	   				var html = constructConfigPanelTemplate(type);
	   				displayConfigPanel(html);
	   			} else {
	   				alert('这一部件暂时不支持编辑功能');
	   			}
	   			
	   		} else {
	   			
	   		}
	   	}
   }],
   [{
	   	text : '删除',
	   	func : function (){
	   		var type  = $(this).attr('operable');
	   		if (confirm('真的要删除这个'+type+'部件?')){
	   			$(this).remove();
	   		}
	   	}
   }],
   [{
	   	text : '编辑源代码',
	   	func : function (){
	   		var source = $(this).attr('data-source-code');
   			if (source == 'widget' || source == 'layout') {
   				// alert($(this).html());
   				mask();
   			} else {
   				//alert('This component dosent allow to edit source-code');
   				mask();
   				var _this = $(this);
   				initSourceCodePanel($(this).prop('outerHTML'));
   			}
	   	}
   }],
];

/*
*	This function is used to generate a layout configurable template
*/
function constructLayoutConfigPanelTemplate(layoutid, params){
	var html     = '', 
		footer   = '',
		fnOK     = null,
		fnCancel = null;

	if (params) {
		params = params.split('$');
		var oTemplate = $('#'+layoutid);
		var aLayout = oTemplate.find('.layout-template');
		var scaleParam = params[0].split(",");
		var marginParamGroup = params[1].split("^");
		
		if (scaleParam.length > 0 && scaleParam.length == aLayout.length) {
			var reVal = /(\d+)/g;
			var reUnit = /(\D+)/g;
			var pre = scaleParam[0].match(reVal);
			var unit = scaleParam[0].match(reUnit);
			html += '<div class="row">';
			html += '<div class="span3">';
			for (var i=0,len=scaleParam.length; i<len; i++) {
				var val = parseInt(scaleParam[i]);
				var marginParam = marginParamGroup[i].split(",");
				html += '<div class="row-fluid">';
				html += '<div class="offset3 span4 text-right">列'+(i+1)+'('+unit+'):</div>';
				html += '<div class="span4"><input type="text" name="scale" class="form-control" value="'+val+'"></div>';
				html += '</div>';
				if (marginParam.length == 4) {
					html += '<div class="inp-mg-group">';
					html += '<div class="row-fluid">';
					html += '<div class="offset3 span6">边距设置(px):</div>';
					html += '</div>';
					html += '<div class="offset1 span5">';
					html += '上：<input type="text" name="inp-mg" class="inp-mg" value="' + marginParam[0] + '">';
					html += '下：<input type="text" name="inp-mg" class="inp-mg" value="' + marginParam[1] + '">';
					html += '左：<input type="text" name="inp-mg" class="inp-mg" value="' + marginParam[2] + '">';
					html += '右：<input type="text" name="inp-mg" class="inp-mg" value="' + marginParam[3] + '">';
					html += '</div>';
					html += '</div>';
					html += '<div class="offset1 span5"><hr></div>';
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
					html += '<div class="offset1 span5"><hr></div>';
				}
			}
			html += '</div>';
			html += '</div>';

			footer = '<button class="btn btn-primary">确定</button><button class="btn btn-default" data-dismiss="modal">取消</button>';
			fnOK = function (){
				var $body = $('.modal-body');
				var scaleInputs = $body.find('input[name=scale]');
				var marginInputs = $body.find('input[name=inp-mg]');
				//precheck
				var flag = false;
				if (unit == '%') {
					var sum = 0;
					$.each(scaleInputs, function (i){
						if (!this.value){
							this.value = 0;
						} else if (isNaN(this.value)) {
							alert('参数非法，请检查');
							return false;
						} else if (this.value < 0){
							alert('参数非法，请检查');
							return false;
						}
						sum += parseInt(this.value);
						if (sum > 100){
							flag = true;
							return false;
						}
					});

					$.each(marginInputs, function (i){
						if (!this.value){
							this.value = 0;
						} else if (isNaN(this.value)) {
							alert('参数非法，请检查');
							flag = true;
							return false;
						} else if (this.value < 0){
							alert('参数非法，请检查');
							flag = true;
							return false;
						}
					});

					if (flag) {
						alert("参数非法，请检查");
						return false;
					} else {
						var targetScaleParam = '',
							targetMaginParam = '';
						$.each(scaleInputs, function (i){
							var targetScaleValue = this.value + unit;
							if (targetScaleParam != '')targetScaleParam += ',';
							targetScaleParam += targetScaleValue;

							var targetMarginValue = '';
							for (var j=0;j<4;j++) {
								var val = marginInputs.eq(i*4 + j).val();
								if(j)val = ',' + val;
								targetMarginValue += val;
							}
							if(targetMaginParam != '')targetMaginParam += '^';
							targetMaginParam += targetMarginValue;

							var targetLayout = aLayout.eq(i);
							var originStyle = targetLayout.attr('style');
							var targetStyle = "";
							var styleArray = originStyle.split(";");
							for (var i=0,len=styleArray.length; i<len; i++){
								var p = styleArray[i].split(":");
								if (p.length == 2) {
									var attr = p[0], val = p[1];
									if (attr != 'width') {
										targetStyle += attr + ":" + val + ";";
									} else {
										targetStyle += attr + ":" + targetScaleValue + ";";
									}
								}
							}
							targetLayout.attr({
								style : targetStyle
							}).css({
								'margin-top': marginInputs.eq(i*4 + 0).val() + 'px',
								'margin-bottom': marginInputs.eq(i*4 + 1).val() + 'px',
								'margin-left': marginInputs.eq(i*4 + 2).val() + 'px',
								'margin-right': marginInputs.eq(i*4 + 3).val() + 'px',
							});
						});
						oTemplate.attr('data-param', targetScaleParam + "$" + targetMaginParam);
						$('#configModal').modal('hide');
					}
				}
				
			};

			fnCancel = function (){
				
			};
		}

	}

	return {
		body : html,
		footer : footer,
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
 * @return {[type]}        [description]
 */
function constructConfigPanelTemplate(type, elemId){
	var html = '<div class="row">';
		//html += '<div class="span3">';
	var elem = $('#'+elemId);
	var ext = elem.attr('data-widget-param');
	var operable = type.split(",");
	var ctxUrl = getContextPath();

	if (operable.length == 2) {
		html += '<div class="row-fluid">';
		html += '<div class="offset1 span2 text-right">链接地址：</div>';
		html += '<div class="span2"><input type="text" class="form-control"></div>';
		html += '</div>';
	} else if (operable.length == 1) {
		var operType = operable[0];
		if (operType == 'flash') {
			html += '<div class="row-fluid">';
			html += '<div class="offset3 span3"><input type="file" id="upload" name="attr" class="form-control"></div>';
			html += '<div><input type="hidden" id="conf-url" name="url" class="form-control"></div>';
			html += '<div class="span3 text-center"><button class="btn upload btn-block btn-primary">上传Flash</button></div>';
			html += '</div><br>';
		} else if (operType == 'upload') {
			// Pictures
			html += '<div class="row-fluid">';
			html += '<div class="offset3 span3"><input type="file" id="upload" name="attr" class="form-control"></div>';
			html += '<div><input type="hidden" id="conf-url" name="url" class="form-control"></div>';
			html += '<div class="span3 text-center"><button class="btn upload btn-block btn-primary">上传图片</button></div>';
			html += '</div><br>';
		} else if (operType == 'powerpoint') {


		} else if (operType == 'navbar') {
			$.ajax({
				url : ctxUrl + '/siteColumnController/getSite.do',
				cache : false,
				async : false,
				type : "POST",
				data : {'siteId' : $('#site').val()},
				success : function (result){
					var res = $.parseJSON(result);
					html += '<div class="row-fluid">';
					html += '<form id="form1">';
					html += '<div class="span2 text-right">站点：</div>';
					html += '<div class="span3"><select id="site" name="site" onchange="changeSite()">';
					for (var i = 0, len = res.length; i < len; i++) {
						html += '<option value="' + res[i]['siteId'] + ' ">' + res[i]['siteName'] + '</option>';
					}
					html += '</select>';
					html += '</div><br>';

					html += '<div class="row-fluid">';
					html += '<div class="span2 text-right">栏目：</div>';
					$.ajax({
						url : ctxUrl + '/siteColumnController/getSiteColumn.do',
						cache : false,
						async : false,
						type : 'POST',
						data : {'siteId': res[0]['siteId']},
						success : function (d){
							var data = $.parseJSON(d);
							html += '<select id="siteColumn" name="siteColumn">';
							for (var i = 0, len = data.length; i < len; i++) {
								html += '<option value="' + data[i]['columnId'] + ' ">' + data[i]['columnName'] + '</option>';
							}
							html += '</select>';
							html += '</div><br>';


							html += '</form>';
							html += '</div>';
						}
					});
				}
			});
		} else if (operType == 'chunk') {
			$.ajax({
				url : ctxUrl + '/siteColumnController/getSite.do',
				cache : false,
				async : false,
				type : "POST",
				data : {'siteId' : $('#site').val()},
				success : function (result){
					var res = $.parseJSON(result);
					html += '<div class="row-fluid">';
					html += '<form id="form1">';
					html += '<div class="span2 text-right">站点：</div>';
					html += '<div class="span3"><select id="site" name="site" onchange="changeSite()">';
					for (var i = 0, len = res.length; i < len; i++) {
						html += '<option value="' + res[i]['siteId'] + ' ">' + res[i]['siteName'] + '</option>';
					}
					html += '</select>';
					html += '</div><br>';

					html += '<div class="row-fluid">';
					html += '<div class="span1 text-right">栏目：</div>';
					$.ajax({
						url : ctxUrl + '/siteColumnController/getSiteColumn.do',
						cache : false,
						async : false,
						type : 'POST',
						data : {'siteId': res[0]['siteId']},
						success : function (d){
							var data = $.parseJSON(d);
							html += '<select id="siteColumn" name="siteColumn">';
							for (var i = 0, len = data.length; i < len; i++) {
								html += '<option value="' + data[i]['columnId'] + ' ">' + data[i]['columnName'] + '</option>';
							}
							html += '</select>';
							html += '</div><br>';


							html += '<div class="row-fluid">';
							html += '<div class="span2 text-right">条数：</div>';
							html += '<div class="span3"><input type="text" class="form-control"></div>';
							html += '</div><br>';

							html += '<div class="row-fluid">';
							html += '<div class="span2 text-right">长度：</div>';
							html += '<div class="span3"><input type="text" class="form-control"></div>';
							html += '</div><br>';

							html += '<div class="row-fluid">';
							html += '<div class="span2 text-right">时间：</div>';
							html += '<div class="span3"><select name="date">';
							html += '<option value=""></option>';
							html += '<option value="yyyy-MM-dd">2014-01-01</option>';
							html += '<option value="MM-dd">01-01</option>';
							html += '<option value="yyyy年MM月dd日">2014年01月01日</option>';
							html += '<option value="yyyyMMdd">20140101</option>';
							html += '</select></div>';
							html += '</div><br>';
							html += '</form>';
							html += '</div>';
						}
					});
				}
			});
		} else {
			// default template
			html += '<div class="row-fluid">';
			html += '<div class="offset1 span2 text-right">配置参数：</div>';
			html += '<div class="span1"><input type="text" class="form-control"></div>';
			html += '</div><br>';

			html += '<div class="row-fluid">';
			html += '<div class="offset1 span2 text-right">配置参数：</div>';
			html += '<div class="span1"><input type="text" class="form-control"></div>';
			html += '</div><br>';

			html += '<div class="row-fluid">';
			html += '<div class="offset1 span2 text-right">配置参数：</div>';
			html += '<div class="span1"><input type="text" class="form-control"></div>';
			html += '</div><br>';

			html += '<div class="row-fluid">';
			html += '<div class="offset1 span2 text-right">配置参数：</div>';
			html += '<div class="span1"><input type="text" class="form-control"></div>';
			html += '</div><br>';
		}



		// Some basic params is allowed to be reset
		if (ext) {
			// w --> width, h --> height, bc --> background-color, bi --> background-image
			var params = ext.split(';');

			//history configurations
			var historyConfig = elem.attr('data-history-config');
			var configJson = parseKV2Json(historyConfig);
			for (var i=0,len=params.length; i<len; i++) {
				var param = params[i];
				if (param) {
					// row started
					html += '<div class="row-fluid">';
					if ('link' === param) {
						html += '<div class="offset1 span2 text-right">链接:</div>';
						html += '<div class="span3"><input type="text" id="conf-link" class="form-control" value="'+configJson['link']+'"></div>';
					} else if ('width' === param) {
						html += '<div class="offset1 span2 text-right">宽度:</div>';
						html += '<div class="span3"><input type="text" id="conf-width" class="form-control" value="'+configJson['width']+'"></div>';
					} else if ('height' === param) {
						html += '<div class="offset1 span2 text-right">高度:</div>';
						html += '<div class="span3"><input type="text" id="conf-height" class="form-control" value="'+configJson['height']+'"></div>';
					} else if ('bc' === param) {
						html += '<div class="offset1 span2 text-right">背景色:</div>';
						html += '<div class="span3"><input type="text" id="conf-bc" class="form-control" value="'+configJson['bc']+'"></div>';
					} else if ('bi' === param) {
						html += '<div class="offset1 span2 text-right">背景图:</div>';
						html += '<div class="span1"><input type="hidden" id="conf-bi" class="form-control" value="'+configJson['bi']+'"></div>';
						html += '<div class="span3"><input type="file" id="upload" name="attr" class="form-control"></div><br><br>';
						html += '<div class="offset3 span5"><button class="btn upload btn-block btn-default">上传图片</button></div>';
					} else {
						// Unknown parameter
						html += '<div class="offset1 span2 text-right">配置参数:</div>';
						html += '<div class="span3"><input type="text" class="form-control"></div>';
					}

					// row ended
					html += '</div><br>';
				} else {
					// The last senmicolon, need to do nothing 
				}
			}
		}
	}


	html += '</div>';//end for row class


	//confirg footer, especially for the button events
	var footer = '<button class="btn btn-primary">确定</button><button class="btn btn-default" data-dismiss="modal">取消</button>';
	var setupUpload = null, uploadDestroy = null;
	var fnOK = null, fnCancel = null, fnUpload = null;
	if (operable.length == 2) {
 		
	} else if (operable.length == 1) {
		var operType = operable[0];
		if (operType == 'flash') {
			setupUpload = function (){
				$("#upload").uploadify({
			        height        : 30,
			        buttonText    :'<div class="row-fluid"><button class="btn btn-block btn-default">选择Flash</button></div>',
			        swf           : './uploadify/uploadify.swf',
			        uploader      : './uploadify/uploadify.php',
			        width         : 120,
			        'onUploadSuccess' : function(file, data, response) {
			            //alert('The file ' + file.name + ' was successfully uploaded with a response of ' + response + ':' + data);
			            var res = $.parseJSON(data);
			            $('#conf-url').val(res.url);
			        }
			    });
			},
			fnUpload = function (){
				$("#upload").uploadify("upload", '*');
			},
			fnOK = function (e){
				$("#upload").uploadify('destroy');
				if (ext) {
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

					if ($('#conf-bi').length) 
						bgimage = $.trim($('#conf-bi').val());
					
					//validate parameters
					(function (a,b,c,d,e){
						var are = /([\w-]+\.)+[\w-]+([\w-.?\%\&\=]*)?/gi;
						var bre = /\d+/gi;
						var cre = /\d+/gi;
						var dre = /\#[0-9a-fA-F]{6}/gi;
						var ere = /\.(bmp|jpg|gif|jpeg)$/gi;
						var errorMessage = '参数非法，请检查';
						if(a && !are.test(a)){
							alert(errorMessage);
							flag = true;
						}

						
					})(link, width, height, bgcolor, bgimage);


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
						history += 'bi='+bgimage+";";
					
					elem.attr('data-history-config', history);
				}
				alert('上传中');
				$('#configModal').modal('hide');
			};

			fnCancel = function (){
				$("#upload").uploadify('destroy');
				log('Destroy');
			};
		} else if (operType == 'upload') {
			setupUpload = function (){
				$("#upload").uploadify({
			        height        : 30,
			        buttonText    :'<div class="row-fluid"><button class="btn btn-block btn-default">选择图片</button></div>',
			        swf           : './uploadify/uploadify.swf',
			        uploader      : './uploadify/uploadify.php',
			        width         : 120,
			        'onUploadSuccess' : function(file, data, response) {
			            //alert('The file ' + file.name + ' was successfully uploaded with a response of ' + response + ':' + data);
			            var res = $.parseJSON(data);
			            alert(res);
			            $('#conf-url').val(res.url);
			        }
			    });
			},
			fnUpload = function (){
				$("#upload").uploadify("upload", '*');
			},
			fnOK = function (e){
				$("#upload").uploadify('destroy');
				if (ext) {
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

					if ($('#conf-bi').length) 
						bgimage = $.trim($('#conf-bi').val());


					//validate parameters
					(function (a,b,c,d){
						var are = /([\w-]+\.)+[\w-]+([\w-.?\%\&\=]*)?/gi;
						var bre = /\d+/gi;
						var cre = /\d+/gi;
						var dre = /\#[0-9a-fA-F]{6}/gi;
						var ere = /\.(bmp|jpg|gif|jpeg)$/gi;
						var errorMessage = '参数非法，请检查';
						if(a && !are.test(a)){
							alert(errorMessage);
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
						history += 'bi='+bgimage+";";
					
					elem.attr('data-history-config', history);

					//Change image bi and size
					var imgUrl = $('#conf-url').val();
					if (imgUrl){
						elem.css('background-image', 'url(/' + imgUrl + ')');
					}

					if (width && height) {
						var oW = elem.width();
						var oH = elem.height();
						if (oW < parseInt(width) || oH < parseInt(height)) {
							alert('提示：设置的图片大小超出原部件，将改变原部件尺寸');
							elem.css({
								width : Math.max(oW, parseInt(width)) + 'px',
								height : Math.max(oH, parseInt(height)) + 'px'
							});
						}
						elem.css('background-size', width + 'px ' + height + 'px');	
					}

				}
				alert('上传中');
				$('#configModal').modal('hide');
			};

			fnCancel = function (){
				$("#upload").uploadify('destroy');
				log('Destroy');
			};
		} else if (operType == 'chunk'){
			fnOK = function (){
				$('#form1').form('submit',{
					url : ctxUrl + '/modelController/getColumnHtml.do',
					onSubmit : function (){
						return $(this).form('validate');
					},
					success : function (data){
						var res = $.parseJSON(data)[0];
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
										$(target).attr('desc_ext', HTMLUnescape(res[n]));
									}
								}
							}
						}

						$('#configModal').modal('hide');
					}
				});
			};

			fnCancel = function (){
				log('Default cancel');
			};
		} else if (operType == 'navbar') {
			$('#form1').form('submit',{
					url : ctxUrl + '/modelController/getNavBarHtml.do',
					onSubmit : function (){
						return $(this).form('validate');
					},
					success : function (data){
						var res = $.parseJSON(data)[0];
						var target = elem;
						for (var n in res) {
							if (n == 'more') {
								$(target).attr('href', res[n]);
							} else {
								//Title
								$(target).html(res[n]);
							}
						}
						$('#configModal').modal('hide');
					}
				});
		}
	};

	return {
		body : html,
		footer : footer,
		onRenderReady : setupUpload ,
		buttonFn : {
			fnUpload : fnUpload,
			fnOK : fnOK,
			fnCancel : fnCancel
		}
	};
}


/**
 * [initSourceCodePanel description]
 * @return {[type]}
 */
function initSourceCodePanel(htmlCode, callback){
	var oPanel =  $('#sourceCodePanel');
	var w = ($(window).width() - oPanel.width())/2;
	var h = ($(window).height() - oPanel.height())/2;

	w = w>10 ? w : 10;
	h = h>10 ? h : 10;
	oPanel.css({
		display : "block",
		left : w,
		top : h
	}).appendTo($('.mask')).show();
	$(window).scrollTop(0);
	var oCode = oPanel.find(".well>pre");
	oCode.text(htmlCode);
	if (!oPanel.data('button-binding')) {
		var aBtn = oPanel.find(".panel-footer>button");
		aBtn.each(function (index){
			$(this).on('click', function (){
				if (index === 1) {
				} else if (index === 0) {
					if (callback && $.isFunction(callback)){
						callback(oCode.html());
					}
				}
				oPanel.hide();
				unmask();
			});
		});
		oPanel.data('button-binding',true);
	}
}