/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 17:15:40
 * @version $Id$
 */
 window.debug = true;
 function log(k,v){
	if (window.debug && console && console.log) {
		k && (v ? console.log(k, v) : console.log(k));
	}
}


	/**
	* Global dispatcher for intializing every modules
	*/
	function initModules(){
		initHeader();
		initMainWrapper();

		//initialize the widget dragging event
		initDragWidgets();
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
		//init layout events
		var layoutList = oHeader.find('ul.layout-list');
		var draggedList = $('#dragged-list');
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
					console.log(html);
					var oDrag = $('<li class="drag-part" data-source-code="layout"></li>');
					var $dom = $(html);
					
					oDrag.append($dom);
					//oDrag.smartMenu(menuData);
					draggedList.append(oDrag);
					oDrag.smartMenu(menuData);
					oDrag.find('*[operable]').smartMenu(menuData);
					oDrag.find('*[data-type=layout-template]').smartMenu(menuData);
				},
				error : function (XMLHttpRequest, textStatus, errorThrown){
					throw new Error(textStatus);
				}
			});
			
		});

		//init radio btns
		initWidgetRadioButton();
	}

	function doPublish(html){
		
		//step1. return edit html
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
	function cleanHTMLTags (html){
		while (html.indexOf('<') != -1){
			html = html.replace('<', '[[');
		}
		while (html.indexOf('>') != -1){
			html = html.replace('>', ']]');
		}
		return html;
	}

	function preFixPublishHtml(html){

	}

	function initPublish(){
		$('#btn-publish').on('click', function (){
			var html = $('.wrapper').html();
			html = preFixPublishHtml(html);
			doPublish(html);
		});
	}


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

	// This panel is shown for widget configuration
	function displayConfigPanel(html){
		var oModal = $('#configModal');
		var oBody = oModal.find('.modal-body');
		var oFooter = oModal.find('.modal-footer');
		oBody.html(html['body']);
		//has upload Element
		if (typeof html['setupUpload'] != 'undefined') {
			if ($.isFunction(html['setupUpload']))
				html['setupUpload']();
			oBody.find('button.upload').on('click', html['buttonFn']['fnUpload']);
		}
		oFooter.html(html['footer']);
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


	function initMainWrapper(){
		var draggedList = $('#dragged-list');
		draggedList.dragsort();
		draggedList.find('.drag-part').each(function (){
			$(this).smartMenu(menuData);
		});
	}

	function initDragWidgets(){
		var ctx = $('.widget-container');
		var aWidgets = ctx.find('.widget-list-item');
		aWidgets.each(function (){
			$(this).johnDraggable({
				context : 'body',
				targetWrapperClass : '.wrapper',
				targetClass : '.layout-template',
			});
		});
	};

	$(function (){
		initModules();
	});

