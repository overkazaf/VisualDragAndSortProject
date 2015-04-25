/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 17:15:40
 * @version $Id$
 */

	// A tiny seed id generator
	var generatorId = function (len, radix, prefix, subfix){
		var targetId = '';
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	    var uuid = [], i;
	    len = len || 32;
			radix = radix || chars.length;
			prefix = prefix || '';
			prefix = prefix == '' ? '' : prefix + '_';
			subfix = subfix || '';
			subfix = subfix == '' ? '' : '_' + subfix;
	 
	    if (len) {
	      // Compact form
	      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
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
	          r = 0 | Math.random()*16;
	          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
	        }
	      }
	    }
	 
	  		targetId = uuid.join('');
			return prefix+targetId+subfix;
		};
	/**
	 * [initModules description]
	 * @param  {[type]} entry [If not null, redicect to a existed template that has been already generated]
	 * @return {[type]}       [description]
	 */
	function initModules(entry){
		if (arguments.length >= 1) {
			$.ajax({
				url : entry,
				type : "GET",
				dataType : "html",
				success : function (data){
					$('.wrapper').html(data);
				}
			}).done(function (){
				initHeader();
				initMainWrapper();
				initDragWidgets();
			});
		} else {
			initHeader();
			initMainWrapper();
			initDragWidgets();
		}
	}

	function initHeader(){
		var oHeader = $('.header');
		var oTool = oHeader.find('.tool-part');
		var oToolMenu = oTool.find('ul.tool-menu');
		var oToolMenuItems = oToolMenu.find(".tool-menu-item");
		var oTooleMenuContainers = oTool.find("div.tool-container");

		initPublish();
		oToolMenu.on('click', 'li', function (index,value){
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				$('.toggle-container').slideUp();
				$(window).scrollTop(0);
				$('.wrapper').css({
					'margin':'105px auto'
				});
			} else {
				var index = $(this).index();
				$(this).addClass('selected').siblings().removeClass('selected');
				$('.toggle-container').slideDown();
				$('.wrapper').css({
					'margin':'270px auto'
				});
				oTooleMenuContainers.hide().eq(index).fadeIn();
			}
		});
		//oToolMenuItems.eq(0).trigger('click');
		oTooleMenuContainers.hide();
		$('.toggle-container').slideUp();
		$('.wrapper').css({'margin':'105px auto'});
		

		// Init Layout Element
		initLayout();

		// Init radio btns
		initWidgetRadioButton();

		// Init Theme Elemnet
		initTheme();

		initBackground();
		initWrapperDraggable();
	}

	/**
	 * [initLayout description]
	 * @return {[type]} [description]
	 *
	 * comment : 
	 * 			Binding click events in layout part
	 */
	function initLayout(){
		//init layout events
		var layoutList = $('.header').find('ul.layout-list');
		var layoutItems = layoutList.children('li.layout-list-item');
		layoutList.on('click', 'li', function (){
			//$.ajax();
			var template = $(this).attr('data-layout-template');
			var url = "http://localhost:8080/drag/bj/"+template+".html?t="+new Date();
			$.ajax({
				async : true,
				cache : false,
				url : url,
				type : "GET",
				dataType : "html",
				success : function (html){
					var oDrag = $('<li class="drag-part" data-source-code="layout"></li>');
					var $dom = $(html);
					var layoutId = generatorId(null, null, 'Layout', 'Generated');
					$dom.attr('id', layoutId).attr('data-layout-id', layoutId);
					oDrag.append($dom);
					//oDrag.smartMenu(menuData);
					$('#dragged-list').append(oDrag);
					oDrag.smartMenu(menuData);
					oDrag.find('*[operable]').smartMenu(menuData);
					oDrag.find('*[data-type=layout-template]').smartMenu(menuData);
				},
				error : function (XMLHttpRequest, textStatus, errorThrown){
					throw new Error(textStatus);
				}
			});
		});
	}

	function initTheme(){
		var themeList = $('.theme-list');

		//Theme items use event delegation
		themeList.on('click', 'li', function (){
			var url = 'publish/'+$(this).attr('data-theme-template')+".html";
			$.get(url, '', function (data){
				$('#dragged-list').dragsort('destroy');
				$('.wrapper').html(data);
				$('.wrapper').find('.layout-template').each(function (){
					$(this).smartMenu(menuData);
				});
				$('.wrapper').find('*[operable]').each(function (){
					$(this).smartMenu(menuData);
				});
				$('#dragged-list').dragsort();
				resetDragWidgets();
			});
		});

		//This will get all the generated themes that have already been published
		$.ajax({
			url : "scan.php",
			cache : false,
			type : "GET",
			dataType : "JSON",
			success : function (d){
				if (d['success'] == true) {
					var fragment = '';
					var data = d['data'];
					$.each(data, function (i){
						var shortName = this.substring(0,this.indexOf('.html'));
						fragment += '<li class="theme-list-item" data-theme-template="'+shortName+'">主题'+(i)+'</li>';
					});
					themeList.html(fragment);
				}
			}
		});
	}


	function initBackground () {
		// $('#rbg').ColorPicker({
		// 	onSubmit : function (hsb, hex, rgb, el){
		// 		$(el).val(hex);
		// 		$(el).ColorPickerHide();
		// 	},
		// 	onBeforeShow : function (){
		// 		$(this).ColorPickerSetColor(this.value);
		// 	}
		// }).bind('keyup', function (){
		// 	$(this).ColorPickerSetColor(this.value);
		// });

		$("#bgUpload").uploadify({
	        height        : 30,
	        buttonText    :'<div class="row-fluid"><button class="btn btn-block btn-default">选择图片</button></div>',
	        swf           : './uploadify/uploadify.swf',
	        uploader      : './uploadify/uploadify.php',
	        width         : 120,
	        'onUploadSuccess' : function(file, data, response) {
	            //alert('The file ' + file.name + ' was successfully uploaded with a response of ' + response + ':' + data);
	            var res = $.parseJSON(data);
	            $('#conf-url').val(res.url);
	        }
	    });

	    $('#bg-upload-btn').on('click', function (){
	    	var img = $('#bgUpload').val();
	    	if (img) {
	    		var re = new RegExp("(.jpg|.png|.jpeg|.gif|.bmg)$");
	    		if (!re.text(img.toLowerCase())) {
	    			alert('上传的图片格式不正确');
	    			return;
	    		}
	    	}
	    	$('#bg-upload-form').form('submit', {
	    		url : getContextPath() + "/attachmentController/uploadReturnUrl.do",
	    		onSubmit : function (){
	    			return $(this).form('validate');
	    		},
	    		success : function (result){
	    			var res = $.parseJSON(result);
	    			if (res.success) {
	    				$('#bg-url').val(getUrl() + "/" + res.url);
	    				alert('上传成功');
	    			} else {
	    				alert(res.error);
	    			}
	    		}
	    	});
	    });



	    $('#confirm-bg-btn').on('click', function (){

	    });
	}

	function initWrapperDraggable(){
		var oWrapper = $('.wrapper');
		var aFlash = oWrapper.find('*[operable]');
		aFlash.each(function (){
			$(this).johnDraggable();
		});
	}

	function doPublish(html){
		// Test case
		var str = "width=12;height=232;href=123123.123123.12;git=hub;";
		log(parseKV2Json(str));
		return;
		$.ajax({
			url : 'publish.php',
			data : {"html":html},
			type : "POST",
			dataType : "JSON",
			success : function (d){
				if (d['success'] == true) {
					$('#dragged-list').dragsort("destroy");
					alert('发布成功');
					// return to previous page;
				}
			}
		});
		//step1. Directlly return editable wrapper html
		// $.ajax({
		// 	url : url,
		// 	type : "POST",
		// 	data : {},
		// 	success : function (){
		// 		var returnValue = [];
		// 		//step2.
		// 		var htmlShow = cleanHTMLTags(html);

		// 		//step3.
		// 		var htmlCleaned = cleanHTMLTags(html);


		// 		returnValue.push(htmlShow);
		// 		returnValue.push(htmlCleaned);

		// 		window.returnValue = returnValue;
		// 	}
		// });
	}

	/**
	 * [cleanHTMLTags description]
	 * @param  {[type]}
	 * @return {[HTML string]} 
	 *
	 * comment : Replace '<' and '>' flag so can review source code in previous edit panel
	 */
	function cleanHTMLTags (html){
		while (html.indexOf('<') != -1){
			html = html.replace('<', '[[');
		}
		while (html.indexOf('>') != -1){
			html = html.replace('>', ']]');
		}
		return html;
	}

	/**
	 * [generatePreviewHTML description]
	 * @param  {[type]} html [description]
	 * @return {[type]}      [Return a preview HTML, need to packed and unpacked some codes]
	 */
	function generatePreviewHTML(html){
		var $dom = $(html);
		//======================================================================================
		//  There are some cases should be well handled
		//  
		//  Case 1: Prepend base.css file into the wrapper header
		//  Case 2: Flash plugins should do some reconstruction and resize jobs
		//  Case 3: Include jQuery library if needed
		//  Case 4: Append injected JS scripts at the bottom
		//  Case 5: Wrap the img element when it has 'link' attribute in data-history config
		//  Case 6: Replace the 'contentShow' area of 'desc_ext' area
		//
		//=======================================================================================
		
		//  Case 1: Prepend base.css file into the wrapper header
		$('<link>',{
			type : "text/css",
			href : getContextPath() + "/cmskj/css/base.css"
		}).prependTo($dom);


		//  Case 2: Widget should do some reconstruction handles
		var aOperables = $dom.find('*[operable]');
		aOperables.each(function (){
			var o = $(this).attr('operable');
			var oArray = o.split(',');

			if (oArray.length == 1) {
				var operType = oArray[0];
				log('operType:'+operType);
				if (operType == 'flash') {
					var	iW = 200,
						iH = 80,
						sLink = '',
						flashId = '',
						flashHTML = '',
						configString = $(this).data('history-config');


					if (configString) {
						var config = parseKV2Json(configString);
						for (var attr in config) {
							if (attr == 'width') {
								iW = config[attr];
							} else if (attr == 'height'){
								iH = config[attr];
							} else if (attr == 'link') {
								sLink = config[attr];
								flashId = sLink.substring(0, url.lastIndesOf('.'));
							}
						}
					}

					flashHTML += '<object width="' + iW + '" height=' + iH + '" type="application/x-shockwave-flash" ';
					flashHTML += 'data="/' + sLink + '" id="flash_' + flashId + '" style="visibility:visible;">';
					flashHTML += '<param name="movie" value="/ '+ sLink +'" />';
					flashHTML += '<param name="allowScriptAccess" value="always" />';
					flashHTML += '<param name="wmode" value="transparent" />';
					flashHTML += '<param name="allowFullscreen" value="true" />';
					flashHTML += '<param name="quality" value="high" />';
					flashHTML += '</object>';
					
					log($(this).html());
					$(this).replaceWith(flashHTML);
				} else if (operType == 'upload') {
					// For pictures
					var configString = $(this).data('history-config');
					if (configString) {
						var config = parseKV2Json(configString);
						
					}
				}
			}
			
		});


		
		var aDependencies = $dom.find('*[data-widget-dependency]');
		aDependencies.each(function (){
			var d = $(this).data('widget-dependency').toLowerCase();
			//  Case 3: Include jQuery library if needed
			if(d.indexOf('hasjq') >= 0){
				if (!$dom.data('jquery-included')) {
					var sPath = getContextPath() + "/cmskj/js/jquery-1.11.1.min.js";
					var oJQ = $('<script>', {
						type : "text/javascript",
						src : sPath
					});
					$dom.prepend(oJQ);
					$dom.data('jquery-included', true);
				}
			}
			//  Case 4: Append injected JS scripts at the bottom
			if (d.indexOf('jsinjected') >= 0) {
				if (!$dom.data('jsinjected')) {
					$.ajax({
						dataType : "text",
						url : getContextPath() + "/cmskj/js/injectedJS.txt"
					}).done(function (res){
						var oInj = $('<script>', {
							type : "text/javascript",
							src : sPath
						});
						$dom.append(oInj);
						$dom.data('jsinjected', true);
					});
				}
			}
		});
		// After case 3,4 , clean the cache flags
		$dom.removeData('jquery-included');
		$dom.removeData('jsinjected');


		var contentSource = $dom.find('*[desc_ext]'),
			contentSourceArray = [],
			contentShowArray = [];

		contentSource.each(function (){
			var content = $(this).attr('desc_ext');
			var ctShow = $(this).find('*[desc=contentShow]');
			contentShowArray.push(ctShow.html());
			contentSourceArray.push(content);
			$(this).removeAttr('desc_ext');
		});




		// Construct a brand new template
		var aTemplates = $dom.find('.layout-template');
		aTemplates.each(function (){
			$(this).removeAttr('style').removeAttr('class').removeAttr('data-type');
		});

		var aOperables = $dom.find('*[operable]');
		aOperables.each(function (){

			$(this).removeAttr('operable');
		});

		// Need to do the clean job after tackle all the corner cases
		var aDels = $dom.find('*[del]');
		aDels.each(function (){

		});

		var htmlSouce = '';
		var htmlShow = '';


		var aLi = $dom.find('li.drag-part');
		

		var fragment = '';
		aLi.each(function (){
			var html = $(this).html();
			var oRow = '<div class="row">' + html + "</div>";
			fragment += oRow;
		});
		fragment += '<link href="bootstrap.min.css" href="stylesheet">';
		fragment = '<div class="container">'+fragment+'</div>';
		return fragment;
	}

	/**
	 * [initPublish Binding publish event to Publish Button]
	 * @return {[void]}
	 * 	
	 * comment: As the publish action will take 3 steps, so to devide and conquer it
	 */
	function initPublish(){
		$('#btn-publish').on('click', function (){
			var html = trimEmptyDivs();
			doPublish(generatePreviewHTML(html));
		});
	}

	function trimEmptyDivs () {
		var html = $('.wrapper').html();
		var $dom = $(html);
		$dom.find('div[data-emptydiv=true]').remove();
		return $dom.prop('outerHTML');
	}
	/**
	 * [initWidgetRadioButton description]
	 * @return {[type]}
	 *
	 * comment : Change widget's contents automatically when user click the radio buttons under widget menu
	 */
	function initWidgetRadioButton(){
		var oTab = $('.widget-items-tab');
		var oWidget = oTab.parent();
		var aRadios = oTab.find('input[type=radio]');
		var aWidgetContents = oWidget.find('.widget-content');
		oTab.on('click', 'li', function (){
			var index = $(this).index();
			aRadios.removeAttr('checked');
			aRadios.eq(index).prop('checked', 'checked');
			aWidgetContents.hide();
			aWidgetContents.eq(index).fadeIn();
		});
		oTab.children('li').eq(0).trigger('click');
	}

	/**
	 * [displayConfigPanel description]
	 * @param  {[string]}
	 * @return {[type]}
	 *
	 * comment : 
	 */
	function displayConfigPanel(html){
		var oModal = $('#configModal');
		var oBody = oModal.find('.modal-body');
		var oFooter = oModal.find('.modal-footer');
		oBody.html(html['body']);
		oFooter.html(html['footer']);
		
		// Has render event
		if (typeof html['onRenderReady'] != 'undefined') {
			if ($.isFunction(html['onRenderReady']))
				html['onRenderReady']();
			oBody.find('button.upload').on('click', html['buttonFn']['fnUpload']);
		}
		
		oFooter.find('.btn-primary').on('click',html['buttonFn']['fnOK']);
		oFooter.find('.btn-default').on('click',html['buttonFn']['fnCancel']);
		oModal.modal('show');
	}


	//This panel is shown for layout configuration

	function displayLayoutConfigPanel(html){
		var oModal = $('#configModal');
		var oBody = oModal.find('.modal-body');
		var oFooter = oModal.find('.modal-footer');
		oBody.html(html['body']);
		oFooter.html(html['footer']);
		oFooter.find('.btn-primary').on('click',html['buttonFn']['fnOK']);
		oFooter.find('.btn-default').on('click',html['buttonFn']['fnCancel']);
		oModal.modal('show');
	}

	/**
	 * [initMainWrapper description]
	 * @return {[type]} [description]
	 *
	 * comment : 
	 * 			After Ajaxing template from remote server, 
	 * 			init all the widget and layout events
	 */
	function initMainWrapper(){
		var draggedList = $('#dragged-list');
		draggedList.dragsort();
		draggedList.find('.layout-template').each(function (){
			$(this).smartMenu(menuData);
			$(this).find('*[operable]').each(function (){
				$(this).smartMenu(menuData);
			});
		});

		$(document).on('click', function (){
			$.smartMenu.hide();
		});
		$(window).on('scroll', function (){
			$.smartMenu.hide();
		});
	}


	//=================================================================
	//
	// Mask Controll Start
	// 
	// comment : This part is a tiny mask util for simulate a static 
	// 			 modal, witch should be combined with some DIY windows.
	//
	//
	//
	//=================================================================
	function mask (){
		var $doc = $(document);
		var $body = $(document.body);
		var $win = $(window);
		if (!$body.find('.mask').length) {
			$body.append($('<div class="mask"></div>'));
		}
		var m = maxMask();
		if (!m.data('data-resize')) {
			$(window).on('resize', function (){
				throttle(m.get(0),maxMask());
			});
			m.data('data-resize', true);
		}
	}

	function maxMask(){
		var $doc = $(document);
		var $body = $(document.body);
		var oMask = $body.find('.mask');
		oMask.css({
			"z-index" : 9999,
			"background-color" : '#000',
			"position" : "absolute",
			"left" : 0, "top" : 0,
			"width" : $doc.width(),
			"height" : $doc.height()
		}).fadeIn();

		var oPanel = $('#sourceCodePanel');
		if (oPanel.length) {
			var w = ($(window).width() - oPanel.width())/2;
			var h = ($(window).height() - oPanel.height())/2;

			w = w>10 ? w : 10;
			h = h>10 ? h : 10;
			oPanel.css({
				left : w,
				top : h
			})
		}
		return oMask;
	}

	function unmask(){
		var $doc = $(document);
		var $win = $(window);
		var oMask = $doc.find('.mask');
		if (oMask.length) {
			oMask.css({
				'z-index' : -1
			}).hide();
		}
	}

	function throttle (obj, fn){
		clearTimeout(obj.timeoutId);
		obj.timeoutId = setTimeout(function (){
			if ($.isFunction(fn)) {
				fn();
			}
		},50);
	}

	//=================================================================
	//
	// Mask Controll End
	// 
	//=================================================================

	/*
	*
	*	This allows user to drag and drop an explicit widget into layout-template,
	*	The callback function (fnDragEnd) points to a target widget witch has alreay been drop into a layout container	
	*
	*/
	function initDragWidgets(){
		var ctx = $('.widget-container');
		var aWidgets = ctx.find('.widget-list-item');
		aWidgets.each(function (){
			$(this).johnDraggable({
				context : 'body',
				targetWrapperClass : '.wrapper',
				targetClass : '.layout-template',
				fnDragEnd : function (oTargetWidget){
					//request html and append;
					//var html = $(this).html();

				}
			});
		});
	};

	function resetDragWidgets(){
		var ctx = $('.widget-container');
		var aWidgets = ctx.find('.widget-list-item');
		aWidgets.each(function (){
			$(this).johnDraggable('destroy');
		});
		initDragWidgets();
		initWrapperDraggable();
	}



	//=================================================================================
	//
	//	There are some util functions
	//
	//==================================================================================

	
	function toCamelCase(str){
		return str.replace(/\-(\w)/g, function(all, letter){
　　　　　return letter.toUpperCase();
　　　　});
	}

	function camel2HB(str){
		return str.replace(/([A-Z])/g,"-$1").toLowerCase();
	}


	window.debug = true;
	
	function log(k,v){
		if (window.debug && console && console.log) {
			k && (v ? console.log(k, v) : console.log(k));
		}
	}

	 function dir(o){
		if (window.debug && console && console.dir) {
			console.dir(o);
		}
	}


	/**
	 * [description]
	 * @param  {[type]} ){		initModules();	} [description]
	 * @return {[type]}                        [description]
	 *
	 * comment : 
	 * 			Global Main Entry
	 */
	// $.holdReady(false);
	$(function (){
		initModules();
	});

