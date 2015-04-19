/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 11:52:45
 * @version $Id$
 */
//smartMenu-ext.js
//Define some utils to combine with smartMenu plugin

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
	   		if (type) {
	   			var html = constructConfigPanelHtml(type);
	   			displayConfigPanel(html);
	   		} else{
	   			var layout = $(this).attr('data-type');
	   			if (layout == 'layout-template') {
	   				var id = $(this).parent().attr('id');
	   				var params = $(this).parent().attr('data-param');
	   				var html = constructLayoutConfigPanelHtml(id, params);
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
	   				var html = constructConfigPanelHtml(type);
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
	   		alert($(this).html());
	   		if (confirm('真的要删除这个部件?')){
	   			$(this).remove();
	   		}
	   	}
   }],
   [{
	   	text : '编辑源代码',
	   	func : function (){
	   		var source = $(this).attr('data-source-code');
   			if (source == 'widget' || source == 'layout') {
   				alert($(this).html());
   			} else {
   				alert('This component dosent allow to edit source-code');
   			}
	   	}
   }],
];

/*
*	This function is used to generate a layout configurable template
*/
function constructLayoutConfigPanelHtml(layoutid, params){
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


							aLayout.eq(i).attr({
								style : 'float:left;min-height:100px;height:auto;background-color:pink;width:' + targetScaleValue + ';'
							}).css({
								'margin-top': marginInputs.eq(i*4 + 0).val() + 'px',
								'margin-bottom': marginInputs.eq(i*4 + 1).val() + 'px',
								'margin-left': marginInputs.eq(i*4 + 2).val() + 'px',
								'margin-right': marginInputs.eq(i*4 + 3).val() + 'px',
							}).html(targetScaleValue);
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


/*
* This function is used to generate a widget configurable template,
* 
*/
function constructConfigPanelHtml(type){
	var html = '<div class="row">';
		html += '<div class="span3">';

	var operable = type.split(",");

	if (operable.length == 2) {
		html += '<div class="row-fluid">';
		html += '<div class="offset3 span4 text-right">链接地址：</div>';
		html += '<div class="span4"><input type="text" class="form-control"></div>';
		html += '</div>';
	} else if (operable.length == 1) {
		if (operable[0] == 'flash') {
			html += '<div class="row-fluid">';
			html += '<div class="offset4 span3"><input type="file" id="upload" name="attr" class="form-control"></div>';
			html += '</div><br>';
			html += '<div class="row">';
			html += '<div class="span3 offset1 text-center"><button class="btn upload btn-block btn-default">上传Flash</button></div>';
			html += '</div><br>';
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
	}


	html += '</div>';//end for col-md-12 class
	html += '</div>';//end for row class


	//confirg footer

	var footer = '<button class="btn btn-primary" data-dismiss="modal">确定</button><button class="btn btn-default" data-dismiss="modal">取消</button>';
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
			fnOK = function (){
				$("#upload").uploadify('destroy');
				log('Destroy');
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
		setupUpload : setupUpload,
		buttonFn : {
			fnUpload : fnUpload,
			fnOK : fnOK,
			fnCancel : fnCancel
		}
	};
}
