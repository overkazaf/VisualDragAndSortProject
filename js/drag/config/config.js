/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-10-17 17:15:40
 * @version 1.1
 *
 * update logs : 
 * 		2015/10/12    new module for variables configuration
 */
define(['jquery', 'jqSmartMenu'], function ($, jQuery.fn.SmartMenu){

	/* 
	 * Smart Menu configurations
	 * This is a global var in this js file
	 *
	 */
	var menuData = [
		[{
			text: '编辑',
			func: function() {
				//removeHighlightListener();
				removeHighlightListener();
				var type = $(this).attr('operable'); // type
				var elemId = $(this).data('widget-id'); // element id
				var _self = $(this); // 当前命中的对象

				//过滤未支持的容器类
				if (type) {
					if (type != 'undefined' && type != 'layout' && (type in widgetDict)) {
						$('.widgetHighLight').removeClass('widgetHighLight');
						$(this).addClass('widgetHighLight');

						//由于部件参数的生成需要ajax请求后台数据，因此这里用异步回调构建配置面板
						//也可换成发布者/订阅者模式进行事件的订阅，此时调用关系会更加清晰　
						constructConfigPanelTemplate(type, elemId, _self, null, null, function(html) {
							renderConfigPanel(html);
						});

					} else {
						if ($(this).attr('data-type') === 'drag-layout') {
							//动态布局类, 允许其进行编辑操作
							var id = $(this).attr('data-layout-id');
							$('.layout-cell').removeClass('highlight');
							$(this).children('.layout-row').children('.layout-cell').addClass('highlight');


							//提取布局参数信息
							var params = $(this).attr('data-history-config');
							var html = constructLayoutConfigPanelTemplate(id, params);
							renderLayoutConfigPanel(html);
						}
					}
				} else {
					alert('不存在布局或部件');
				}
			}
		}],
		[{
			text: '添加',
			func: function(ev) {
				//removeHighlightListener();

				ev = ev || window.event;
				var type = $(this).attr('operable');
				var elemId = $(this).data('widget-id');
				var _self = $(this); // 当前焦点对象，主要用于修正无id的杂碎部件

				if (type) {
					$('.widgetHighLight').removeClass('widgetHighLight');
					$(this).addClass('widgetHighLight');

					//目前只支持以下几种部件的添加功能，对于一些多列表的部件，需要先定位其相对索引再进行添加操作
					// if(type in appendableWidgetDict)

					if (type in appendableWidgetDict) {
						if (type === 'link-panel') {
							var targetIndex = Utils.targetCurrentElement(ev, $(this).find('ul.link-list'));
							constructConfigPanelTemplate(type, elemId, _self, 'append', targetIndex, function(html) {
								renderConfigPanel(html);
							});

						} else if (type === 'imgchunk') {
							var targetIndex = Utils.targetCurrentElement(ev, $(this).find('ul'));
							constructConfigPanelTemplate(type, elemId, _self, 'append', targetIndex, function(html) {
								renderConfigPanel(html);
							});
						} else if (type === 'navbar-list') {
							constructConfigPanelTemplate(type, elemId, _self, 'append', targetIndex, function(html) {
								renderConfigPanel(html);
							});
						} else if (type === 'panel-list') {
							constructConfigPanelTemplate(type, elemId, _self, 'append', targetIndex, function(html) {
								renderConfigPanel(html);
							});
						} else if (type === 'tab-menu') {
							constructConfigPanelTemplate(type, elemId, _self, 'append', targetIndex, function(html) {
								renderConfigPanel(html);
							});
						} else if (type === 'tab-panel') {
							constructConfigPanelTemplate(type, elemId, _self, 'append', targetIndex, function(html) {
								renderConfigPanel(html);
							});
						} else if (type === 'asidenav') {
							constructConfigPanelTemplate(type, elemId, _self, 'append', targetIndex, function(html) {
								renderConfigPanel(html);
							});
						}
					} else {
						// corner case
						if (_self.closest('.widget-chunk').length) {
							var fixTarget = _self.closest('.widget-chunk');
							var linkPanel = fixTarget.find('.link-panel');
							if (linkPanel.length) {
								constructConfigPanelTemplate('link-panel', null, linkPanel, 'append', -1, function(html) {
									renderConfigPanel(html);
								});
							} else {
								alert('该部件暂时不支持添加功能');
							}
						} else {
							alert('该部件暂时不支持添加功能');
						}
					}
				}
			}
		}],
		[{
			text: '删除',
			func: function() {
				//removeHighlightListener();

				var type = $(this).attr('operable');
				if (type) {
					if (type === 'layout') {
						//alert('此元素不支持删除操作');
						$('.layout-cell').removeClass('highlight');
						$(this).children('.layout-row').children('.layout-cell').addClass('highlight');
						if (confirm("确认要删除这个布局?")) {
							if ($(this).find('[class*=widget]').length) {
								if (!confirm('确认移除该布局上的所有部件？')) {
									return;
								}
							}
							if ($(this).closest('.layout-container').length) {
								var container = $(this).closest('.layout-container');
								// check if it is the last layout element
								var oTop = container.closest('[data-layer=0]');
								if (container.attr('data-layer') == 1) {
									oTop.css({
										'height': 120
									}); // fix the topper level
								}
								container.remove();
							}

						}
					} else {
						$('.widgetHighLight').removeClass('widgetHighLight');
						$(this).addClass('widgetHighLight');

						//删除操作较为繁琐，需对只剩下一个子部件的情况作销毁整个部件的处理
						//We will come back soon
						var operArray = type.split(',');
						if (operArray.length == 1 && operArray[0] == 'link-item') {
							if (confirm('确认要删除这个快速通道子链接部件?')) {
								if ($(this).closest('li[operable=chunk]').length) {
									$(this).closest('li[operable=chunk]').remove();
								} else {
									$(this).remove();
								}
							}
						} else if (operArray.length == 2 && operArray[0] == 'text' && operArray[1] == 'href') {
							if (confirm("确认要删除这个" + widgetDict[type] + "部件?")) {
									if (this.parentNode && this.parentNode.tagName.toLowerCase() == 'li') {
										$(this.parentNode).remove();
									} else {
										$(this).remove();
									}
								/*
								if ($(this).closest('.link-list-item').length) {
									$(this).closest('.link-list-item').remove();
								} else if ($(this).closest('.navlist-item').length) {
									$(this).closest('.navlist-item').remove();
								} else if ($(this).closest('.friend-link-item').length){
									$(this).closest('.friend-link-item').remove();
								} else {}
								*/
							}
						} else {
							// alert('此元素不支持删除操作');
							// Ca, no time to refactor, holy crap
							if (type == "upload") {
								if ($(this).closest('.topic-slider').length) {
									if (confirm("确认要删除这个专题栏部件?")) {
										$(this).closest('.topic-slider').remove();
									}
								} else if ($(this).closest('.widget-chunk').length) {
									if (confirm("确认要删除这个块部件?")) {
										$(this).closest('.widget-chunk').remove();
									}
								} else if ($(this).closest('.widget-upload').length) {
									if (confirm("确认要删除这个图片部件?")) {
										$(this).closest('.widget-upload').remove();
									}
								} else if ($(this).closest('.widget-imgchunk').length) {
									if (confirm("确认要删除这个专题图片部件?")) {
										$(this).remove();
									}
								}
								return;
							}

							if (type == "link-panel" || type == "panel" || type == 'site-list' || type == 'panel-list-item') {
								if ($(this).closest('.widget-chunk').length && !$(this).closest('.multi-panel').length) {
									if (confirm("确认要删除这个" + widgetDict[type] + "部件?")) {
										$(this).closest('.widget-chunk').remove();
									}
								} else if ($(this).closest('.multi-panel').length) {
									if (confirm("确认要删除这个" + widgetDict[type] + "部件?")) {
										var index = $(this).index();
										var ctx = $(this).closest('.multi-panel');
										var tabContents = ctx.find('.tab-contents').children('.contents');
										tabContents.length && tabContents.eq(index).remove();
										$(this).remove();
									}
								} else {
									if (confirm("确认要删除这个" + widgetDict[type] + "部件?")) {
										if ($(this).closest('.widget-upload').length) {
											$(this).closest('.widget-upload').remove();
										} else {
											$(this).remove();
										}
									}
								}
								return;
							}

							if (confirm("确认要删除这个" + widgetDict[type] + "部件?")) {
								if (type === 'upload') {
									$(this).closest('.widget-upload').remove();
								} else if (type === 'navbar') {
									if ($(this).closest('dd').length) {
										$(this).closest('dd').remove();
									} else {
										$(this).remove();
									}
								} else if ((type == 'text' && $(this).hasClass('tab-item')) || type === 'tab-panel') {
									var $oP = $(this).closest('.widget-tab');
									var index = $(this).index();
									var $contents = $oP.find('.tab-content');
									var $menu = $oP.find('.tab-item');

									if (type === 'tab-panel') {
										$menu.eq(index).remove();
										$(this).remove();
									} else {
										$contents.eq(index).remove();
										$(this).remove();
									}
									$oP.find('.tab-item').first().trigger('mouseover');
								} else {
									$(this).remove();
								}
								return;
							}
						}
					}
				} else {
					alert('不存在布局或部件,请先添加');
				}
			}
		}],
		[{
			text: '编辑源代码',
			func: function() {
				//removeHighlightListener();

				var source = $(this).attr('data-source-code');
				if (source == 'widget' || source == 'layout') {
					// alert($(this).html());
					//mask();
				} else {
					//mask();
					var self = $(this);
					initSourceCodePanel($(this).prop('outerHTML'), function(html) {
						var $dom = $(Utils.HTMLUnescape(html));
						$(self).replaceWith($dom);
						$dom.smartMenu(menuData);
						$dom.find('*[operable]').smartMenu(menuData);
					});
				}
			}
		}],
	];

	var
	ftlCache = {}, // 数据缓存，用于生成FreeMarker标签时取值
	ftlDict = {
		'getSite': 'site',
		'getSiteColumn': 'siteColumn'
	},
	ftlTypes = [ // 按优先级排序的ftl类型
		'asidenav', // 侧边导航
		'navbox', // 竖向导航
		'img-scroll-h', // 水平滚动图片
		'attrlist', // 附件列表
		'article', // 正文（带标题）
		'article-title', // 正文标题
		'article-author', // 正文作者
		'article-share', // 正文分享
		'article-date', // 文章发布时间
		'article-contents', // 文章内容
		'scroll-h', // 水平滚动
		'scroll-v', // 垂直滚动
		'location', // 当前位置
		'digest', // 摘要
		'bot_ppt', // 底部带缩略图的幻灯
		'slidetop', // 幻灯(上下滑动)
		'slidenormal', // 带文字标题幻灯
		'easyslides', // 简易幻灯
		'img-list', // 图片列表
		'img-news', // 图文信息（普通）
		'img-news-h', // 图文信息（水平）
		'img-news-v', // 图文信息（垂直）
		'panel-pic-v', // 图片+信息列表，单栏目双图片，多行
		'panel-pic', // 图片+信息列表，单栏目，单行
		'panel-type0',
		'panel-type1',
		'panel-type2',
		'panel-type3',
		'panel-type4',
		'panel-type5',
		'panel-type6',
		'panel-type7',
		'panel-type8',
		'panel-type9',
		'panel-typea',
		'panel-typeb',
		'panel-typec',
		'panel-typed',
		'panel-typee',
		'panel-typef',
		'panel-unsorted',
		'cont-tpl',
		'cont-tpl1',
		'cont-tpl2',
		'cont-tpl3'
	],
	// 定义不同类型的部件数组，以区分其渲染策略
	homeWidgetTypes = [], // 这个类型的部件，站点简称和栏目简称需要手动配置
	listWidgetTypes = [], // 这个类型的部件，站点简称和栏目简称是自动获取的
	topicWidgetTypes = [], // 这个类型的部件，站点简称和栏目简称是自动获取的
	contentWidgetType = [], // 这个类型的部件，站点简称和栏目简称是自动获取的
	ftlHandler = {
		/**
		 * [writeFtlCache 为ftl别名映射写缓存]
		 * @param  {[String]} type  [缓存类型]
		 * @param  {[Object Array]} data  [缓存数据]
		 * @param  {[Boolean]} force [是否强行写]
		 * @return {[void]}       [description]
		 */
		writeFtlCache: function(type, data, force) {
			if (!type) {
				ftlCache[type] = {};
				//throw new Error('This ftlCache type is not specified!');
			}

			if (force) {
				// 强行写
				ftlCache[type] = data;
			} else {
				if (!ftlCache[type]) {
					ftlCache[type] = data;
				}
			}
		},
		/**
		 * [judgeFtlType 判断类型是否需要存入ftlCache中]
		 * @param  {[type]} type [description]
		 * @return {[type]}      [String]
		 */
		judgeFtlType: function(type) {
			if (type in ftlDict) {
				return ftlDict[type];
			}
			return undefined;
		},
		fetchType: function(dom) {
			var fetched;
			$.each(ftlTypes, function(i, className) {
				if (dom.hasClass(className)) {
					fetched = className;
				}
			});
			return fetched;
		},
		/**
		 * [getFtlType 获取一个ftl缓存的所有数据]
		 * @param  {[type]} type [description]
		 * @return {[type]}      [description]
		 */
		getFtlType: function(type) {
			return ftlCache[type];
		},
		/**
		 * [fetchKey 通过给定的k-v对，获取指定的key对应value值]
		 * @param  {[String]} type      [ftl缓存类型]
		 * @param  {[String]} key       [缓存键]
		 * @param  {[String]} val       [缓存值]
		 * @param  {[String]} targetKey [目标键]
		 * @return {[String]}           [目标值]
		 */
		fetchKey: function(type, key, val, targetKey) {
			var cache = ftlCache[type];
			if (cache && cache.length) {
				for (var i = 0, elem; elem = cache[i++];) {
					if (key in elem) {
						if (elem[key] === val) {
							return elem[targetKey];
						}
					}
				}
			}
			return undefined;
		}
	},
	
	widgetDict = {
		/**
		 * [widgetDict 部件字典，主要用于提示信息展示]
		 * @type {Object}
		 */
		'text': '文字',
		'vote': '投票',
		'link-panel': '快速通道',
		'flash': 'FLASH',
		'powerpoint': '幻灯片',
		'upload': '图片上传',
		'navbar': '站点栏目',
		'panel': '新闻面板',
		'panel-list': '内容选项卡',
		'panel-list-item': '选项卡标签',
		'footer': '站点底部',
		'imgchunk': '专题图片',
		'img-list': '图片列表',
		'navbar-list': '导航栏',
		'text,href': '文字链接',
		'chunk': '块',
		'news-group': '列表组',
		'img-news': '图文信息（普通）',
		'img-news-h': '图文信息（水平）',
		'img-news-v': '图文信息（垂直）',
		'site-list': '栏目列表',
		'site-list-item': '栏目列表项',
		'dropdown': '下拉菜单',
		'visitors': '访问量',
		'querybar': '搜索框',
		'login': '登陆框',
		'tab': '选项卡',
		'tab-menu': '选项卡菜单',
		'tab-panel': '选项卡面板',
		'float': '悬浮部件',
		'date': '时间插件',
		'weather': '天气预报',
		'countdown': '倒计时',
		'bot_ppt': '幻灯片（底部缩略图）',
		'easyslides': '简易幻灯片',
		'slidetop': '幻灯片（上下滑动）',
		'slidenormal': '幻灯片（带文字说明）',
		'digest': '正文摘要',
		'location': '当前位置',
		'scroll-h': '水平滚动',
		'scroll-v': '垂直滚动',
		'article': '正文（标题）',
		'attrlist': '附件列表',
		'img-scroll-h': '水平滚动图片',
		'asidenav': '侧边导航',
		'navbox': '竖向导航',
		'article-title': '正文标题',
		'article-author': '正文作者',
		'article-share': '正文分享',
		'article-date': '发布时间',
		'article-visitors': '正文访问量',
		'article-contents': '正文内容',
		'cont-tpl': '内容页模板',
		'cont-tpl1': '内容页模板一',
		'cont-tpl2': '内容页模板二',
		'cont-tpl3': '内容页模板三',
		'undefined': '未知'
	},
	appendableWidgetDict = {
		/**
		 * [appendableWidgetDict 允许进行添加操作的部件字典]
		 * @type {Object}
		 */
		'site-list': '栏目列表',
		'navbar-list': '导航栏',
		'panel-list': '内容选项卡',
		'imgchunk': '专题块',
		'link-panel': '快速通道',
		'tab-menu': '选项卡菜单',
		'tab-panel': '选项卡面板',
		'asidenav': '侧边导航'
	};

	// 页面需要加载的模块，升级版本会移动到模块加载器里统一管理调度
	var 
		hasJQ = !1, // jquery, 和应用的版本一致
	    jsInjected = !1, // 用户自定义注入的脚本
	    hasPPT = !1, // 幻灯插件
	    hasShortcutPPT = !1, // 带缩略图的幻灯片插件
	    hasVOTE = !1, // 投票模块
	    hasMultiNav = !1, // 多级导航条
	    hasTPSlider = !1, // 无缝轮轮播
		hasMultiPanel = !1, // 切换面板
		hasMarquee = !1, // 走马灯
		hasTab = !1; // 选项卡
		hasDropdown = !1, // 下拉框
		hasShowtime = !1, // 时间插件
		hasWeather = !1, // 天气预报
		hasBotPPT = !1, // 底部缩略PPT
		hasEasySlides = !1, // 简易PPT
		hasSlideTop = !1, // 上下滑动PPT
		hasCountdown = !1, // 倒计时插件
		hasSlideNormal = !1, // PPT带文字说明
		hasScrollText = !1, // 上下滚动
		hasScrollLeft = !1, // 水平滚动图片
		hasNavBox = !1, // 手风琴导航
		hasHotList = !1; // 最新或热点新闻

	var 
		counterMapping = { // 用于统计的脚本映射字典
			'text' 			: '<script>这里是需要嵌入的站点脚本<script>', 
			'table' 		: 'textUrl', 
			'picture' 		: 'textUrl', 
			'undefined' 	: 'textUrl' 
		};

	return {
		menuData : menuData
	};
});