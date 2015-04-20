/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 11:52:45
 * @version $Id$
 */
//smartMenu-ext.js
//		Define some utils to combine with smartMenu plugin,
//		This part will implement some operation logic for operable elements to make changes 

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
		html += '<div class="span3">';
	var elem = $('#'+elemId);
	var ext = elem.attr('data-widget-param');
	var operable = type.split(",");

	if (operable.length == 2) {
		html += '<div class="row-fluid">';
		html += '<div class="offset3 span4 text-right">链接地址：</div>';
		html += '<div class="span4"><input type="text" class="form-control"></div>';
		html += '</div>';
	} else if (operable.length == 1) {
		if (operable[0] == 'flash') {
			// html += '<div class="row-fluid">';
			// html += '<div class="offset4 span3"><input type="file" id="upload" name="attr" class="form-control"></div>';
			// html += '</div><br>';
			// html += '<div class="row">';
			// html += '<div class="span3 offset1 text-center"><button class="btn upload btn-block btn-default">上传Flash</button></div>';
			// html += '</div><br>';
		} else {
			// default template
			html += '<div class="row-fluid">';
			html += '<div class="span1 text-right">配置参数：</div>';
			html += '<div class="span3"><input type="text" class="form-control"></div>';
			html += '</div><br>';

			html += '<div class="row-fluid">';
			html += '<div class="span1 text-right">配置参数：</div>';
			html += '<div class="span3"><input type="text" class="form-control"></div>';
			html += '</div><br>';

			html += '<div class="row-fluid">';
			html += '<div class="span1 text-right">配置参数：</div>';
			html += '<div class="span3"><input type="text" class="form-control"></div>';
			html += '</div><br>';

			html += '<div class="row-fluid">';
			html += '<div class="span1 text-right">配置参数：</div>';
			html += '<div class="span3"><input type="text" class="form-control"></div>';
			html += '</div><br>';
		}



		if (ext) {
			// Some basic params is allowed to be reset
			// w --> width, h --> height, bc --> background-color, bi --> background-image
			var params = ext.split(';');

			//history configurations
			var historyConfig = elem.attr('data-history-config');
			var configJson = {};
			(function (config){
				if (config && config.indexOf(';') >= 0) {
					var p = config.split(';');
					for (var i=0,len=p.length; i<len; i++) {
						if (p[i].indexOf('=') >= 0) {
							var prop = p[i].split('=');
							if (prop.length == 2) {
								var k = prop[0];
								var v = prop[1];
								configJson[k] = v;
							}
						}
					}
				}
			})(historyConfig);
			
			log(configJson);
			for (var i=0,len=params.length; i<len; i++) {
				var param = params[i];
				if (param) {
					// row started
					html += '<div class="row-fluid">';
					if ('l' === param) {
						html += '<div class="offset2 span4 text-right">链接:</div>';
						html += '<div class="span3"><input type="text" id="conf-l" class="form-control" value="'+configJson['link']+'"></div>';
					} else if ('w' === param) {
						html += '<div class="offset2 span4 text-right">宽度:</div>';
						html += '<div class="span3"><input type="text" id="conf-w" class="form-control" value="'+configJson['width']+'"></div>';
					} else if ('h' === param) {
						html += '<div class="offset2 span4 text-right">高度:</div>';
						html += '<div class="span3"><input type="text" id="conf-h" class="form-control" value="'+configJson['height']+'"></div>';
					} else if ('bc' === param) {
						html += '<div class="offset2 span4 text-right">背景色:</div>';
						html += '<div class="span3"><input type="text" id="conf-bc" class="form-control" value="'+configJson['bc']+'"></div>';
					} else if ('bi' === param) {
						html += '<div class="offset2 span4 text-right">背景图:</div>';
						html += '<div class="span1"><input type="hidden" id="conf-bi" class="form-control" value="'+configJson['bi']+'"></div>';
						html += '<div class="offset1 span3"><input type="file" id="upload" name="attr" class="form-control"></div><br><br>';
						html += '<div class="offset4"><button class="btn upload btn-block btn-default">上传图片</button></div>';
					} else {
						// Unknown parameter
						html += '<div class="offset3 span4 text-right">配置参数:</div>';
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


	html += '</div>';//end for col-md-12 class
	html += '</div>';//end for row class


	//confirg footer

	var footer = '<button class="btn btn-primary">确定</button><button class="btn btn-default" data-dismiss="modal">取消</button>';
	var setupUpload = null, uploadDestroy = null;
	var fnOK = null, fnCancel = null, fnUpload = null;
	if (operable.length == 2) {
 		
	} else if (operable.length == 1) {
		if (operable[0] == 'flash') {
			setupUpload = function (){
				$("#upload").uploadify({
			        height        : 30,
			        buttonText    :'<div class="row-fluid"><button class="btn btn-block btn-primary offset1">选择Flash</button></div>',
			        swf           : './uploadify/uploadify.swf',
			        uploader      : './uploadify/uploadify.php',
			        width         : 120,
			        'onUploadSuccess' : function(file, data, response) {
			            alert('The file ' + file.name + ' was successfully uploaded with a response of ' + response + ':' + data);
			        }
			    });
			},
			fnUpload = function (){
				$("#upload").uploadify("upload", '*');
			},
			fnOK = function (e){
				$("#upload").uploadify('destroy');
				if (ext) {
					var history = '';
					var link = $('#conf-l').val() || '';
					var width = $('#conf-w').val() || '';
					var height = $('#conf-h').val() || '';
					var bgcolor = $('#conf-bc').val() || '';
					var bgimage = $('#conf-bi').val() || '';
					var flag = !1;
					//validate parameters
					(function (a,b,c,d,e){
						var are = /([\w-]+\.)+[\w-]+([\w-.?\%\&\=]*)?/gi;
						var bre = /\d+/gi;
						var cre = /\d+/gi;
						var dre = /\#[0-9a-fA-F]{6}/gi;
						var ere = /\.(jpg|gif|jpeg)$/gi;
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
		} else {
			
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