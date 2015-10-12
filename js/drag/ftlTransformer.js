/**
 *
 * @authors John Nong (overkazaf@gmail.com)
 * @qq      289202839
 * @date    2015-04-17 11:52:45
 *          第一波重构开始, 废弃了iframe的实现, 采用一个容器进行dom的操作, 关联的东西太多, 未优化资源加载及dom操作
 *          
 * @update  2015-09-07 13：43：00
 *          增加了内容页的模板，可自动绑定内站点和栏目，抓取数据
 * 
 * @version 1.2
 */
/***************************************************************************************************************************************
	Delete/SourceCode
	Edit/Add -> constructConfigPanel 
					-> EditableWidget
									  panelStrategies[async]	-> readCache
					-> AddiableWidget
											-> renderPanel 					
												-> panelReadyFn 
																	 			     -> extraFn
												-> panelAddiableReadyFn		-> fnOK  -> ftlTransformer   -> ftlStrategies  -> HTMLUnescape
																				     -> updateDOM        -> bindEvents/delegateEvents
																				     -> writeAttr
																				
																			-> fnCancel  -> GC


			 -> extraFn
	-> fnOK  -> ftlTransformer   -> ftlStrategies  -> HTMLUnescape
	         -> updateDOM        -> bindEvents/delegateEvents
	         -> writeAttr
***************************************************************************************************************************************/
function HTMLUnescape(str) {
    // need to refactor
    return str;
}

/**
 * [repeat 以子串生成完全字符串]
 * @param  {[String]} target [基本串]
 * @param  {[Number]} n      [重复次数]
 * @return {[String]}        [最终生成的串]
 */
function repeat(target, n) {
    var s = target,
        total = "";
    while (n > 0) {
        if (n % 2 == 1) {
            total += s;
        }
        if (n == 1) {
            break;
        }
        s += s;
        n = n >> 1;
    }
    return total;
}

function HTMLEscape(str) {
    return String(str).replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function ftlTransformer(json) {
    var html = ftlStrategies[json['type']](json);
    return HTMLUnescape(html);
}

function contentTransformer(json) {
    return contentStrategies[json['type']](json);
}

/* 构建FreeMarker模板 */
/*  CSS参考类

	.underline-solid {border-bottom:1px solid #000;}
	.underline-dashed {border-bottom:1px dashed #000;}
	.underline-dotted {border-bottom:1px dotted #000;}
	.underline-double {border-bottom:3px double  #000;}

	.liststyle-disc {list-style: disc;}
	.liststyle-circle {list-style: circle;}
	.liststyle-square {list-style: square;}
	.liststyle-decimal {list-style: decimal;}
	.liststyle-decimalLz {list-style: decimal-leading-zero;}

*/

/* 样式类字典 */
var
    baseCSS = {
        'underlineType': {
            'undefined': 'underline-none',
            'solid': 'underline-solid',
            'dashed': 'underline-dashed',
            'dotted': 'underline-dotted',
            'double': 'underline-double'
        },
        'listStyleType': {
            //'undefined' : 'liststyle-none',
            'disc': 'liststyle-disc',
            'circle': 'liststyle-circle',
            'square': 'liststyle-square',
            'decimal': 'liststyle-decimal',
            'decimalLz': 'liststyle-decimalLz'
        },
        'dateType': {
            'undefined': 'date',
            'date-normal': 'date',
            'date-fr': 'date',
            'date-fl': 'date'
        }
    },
    classDict = {
        'undefined': baseCSS,
        'panel': baseCSS,
        'panel-type0': baseCSS,
        'panel-type1': baseCSS,
        'panel-type2': baseCSS,
        'panel-type3': baseCSS,
        'panel-type4': baseCSS,
        'panel-type5': baseCSS,
        'panel-type6': baseCSS,
        'panel-unsorted': baseCSS,
        'panel-pic-v': baseCSS,
        'panel-pic': baseCSS,
        'panel-download': baseCSS,
        'img-list': baseCSS,
        'img-news': baseCSS,
        'img-news-h': baseCSS,
        'img-news-v': baseCSS,
        'easyslides': baseCSS,
        'slidenormal': baseCSS,
        'bot_ppt': baseCSS,
        'digest': baseCSS,
        'scroll-v': baseCSS,
        'img-scroll-h': baseCSS,
        'article': baseCSS,
        'article-title': baseCSS,
        'article-author': baseCSS,
        'article-share': baseCSS,
        'article-date': baseCSS,
        'article-contents': baseCSS,
        'attrlist': baseCSS
    },
    date2sample = {
        'yyyy-MM-dd': '2014-01-01',
        'MM-dd': '01-01',
        'yyyy年MM月dd日': '2014年01月01日',
        'yyyyMMdd': '20140101',
        '': undefined
    };

/* 默认ftl参数值，预防空参数错误 */
var
    panelDefaults = {
        'siteSimpleName': '${nr.site.siteSimpleName}', // 站点简称
        'columnSimpleName': '${nr.siteColumn.columnSimpleName}', // 栏目简称
        'siteCount': 1, // 新闻条数
        'siteLength': 15 // 链接文字长度
    },
    imgNewsDefaults = {
        'siteSimpleName': '${nr.site.siteSimpleName}', // 站点名称
        'columnSimpleName': '${nr.siteColumn.columnSimpleName}', // 栏目名称
        'siteCount': 5, // 条数
        'btLength': 15, // 标题长度
        'nrLength': 100 // 内容长度
    },
    imgScrollHDefaults = {
        'siteSimpleName': '${nr.site.siteSimpleName}', // 站点名称
        'columnSimpleName': '${nr.siteColumn.columnSimpleName}', // 栏目名称
        'count': 5, // 每行图片数
        'siteCount': 20 // 总条数
    },
    pptDefaults = {
        'siteSimpleName': '${nr.site.siteSimpleName}', // 站点名称
        'columnSimpleName': '${nr.siteColumn.columnSimpleName}', // 栏目名称
        'siteCount': 4, // 长度
        'siteLength': 15 // 长度
    },
    digestDefaults = {
        'siteSimpleName': '${nr.site.siteSimpleName}', // 站点名称
        'columnSimpleName': '${nr.siteColumn.columnSimpleName}', // 栏目名称
        'nrLength': 50 // 正文长度
    },
    articleDefaults = {
        'siteSimpleName': '${nr.site.siteSimpleName}', // 站点名称
        'columnSimpleName': '${nr.siteColumn.columnSimpleName}', // 栏目名称
        'btLength': 10, // 标题长度
        'nrLength': 50 // 正文长度
    },
    attrlistDefaults = {
        'siteSimpleName': '${nr.site.siteSimpleName}', // 站点名称
        'columnSimpleName': '${nr.siteColumn.columnSimpleName}', // 栏目名称
        'siteCount': 10 // 标题长度
    },
    contTplDefaults = {
        'contTitle': '${nr.msgAll.msgTitle!""}',
        'contAuthor': '${nr.msgAll.author!""}',
        'contReleaseTime': '${nr.msgAll.releaseTime!string("yyyy-MM-dd")}',
        'contVisitors': '${nr.msgAll.visitors!""}',
        'contContents': '${nr.msgAllMap.msgcontent!""}'
    },
    ftlDefaults = {
        'panel': panelDefaults,
        'panel-type0': panelDefaults,
        'panel-type1': panelDefaults,
        'panel-type2': panelDefaults,
        'panel-type3': panelDefaults,
        'panel-type4': panelDefaults,
        'panel-type5': panelDefaults,
        'panel-type6': panelDefaults,
        'panel-unsorted': panelDefaults,
        'panel-pic-v': panelDefaults,
        'panel-pic': panelDefaults,
        'panel-download': panelDefaults,
        'powerpoint': pptDefaults,
        'img-list': {
            'siteSimpleName': '${nr.site.siteSimpleName}', // 站点名称
            'columnSimpleName': '${nr.siteColumn.columnSimpleName}', // 栏目名称
            'count': 8, // 图片条数
            'siteCount': 4, // 每行图片
            'btLength': 15 // 标题长度
        },
        'img-news': {
            'siteSimpleName': '${nr.site.siteSimpleName}', // 站点名称
            'columnSimpleName': '${nr.siteColumn.columnSimpleName}', // 栏目名称
            'nrLength': 100 // 内容长度
        },
        'img-news-h': imgNewsDefaults,
        'img-news-v': imgNewsDefaults,
        'easyslides': pptDefaults,
        'slidenormal': pptDefaults,
        'slidetop': pptDefaults,
        'bot_ppt': pptDefaults,
        'digest': digestDefaults,
        'scroll-v': panelDefaults,
        'img-scroll-h': imgScrollHDefaults,
        'article': articleDefaults,
        'article-title': articleDefaults,
        'article-author': articleDefaults,
        'article-share': articleDefaults,
        'article-date': articleDefaults,
        'article-contens': articleDefaults,
        'attrlist': attrlistDefaults,
        'cont-tpl': contTplDefaults,
        'cont-tpl1': contTplDefaults,
        'cont-tpl2': contTplDefaults,
        'cont-tpl3': contTplDefaults
    };


/**
 * [ftlStrategies FreeMarker 的标签生成策略]
 * @type {String} 返回标签html，未进行HTML字符转义
 *
 * json = {
 * 	type : 'panel',
 * 	siteName : 'ntdx',
 * 	siteColumn : 'zxdt',
 * 	titleIconType : 'flag',
 * 	dateType : 'date',
 * 	listStyleType : 'triangle',
 * 	underlineType : 'dashed'
 * 
 * };
 */

var ftlStrategies = {
    'panel': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

        html += '<span class="' + dict['dateType'][json['dateType']] + '">';
        html += timeFormat ? '${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}' : '';
        html += '</span>';

        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'img-scroll-h': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['count'] + '" order="">';
        html += '<#list messageMap as nr>';

        html += '<li>';

        html += '<a href=\"/${nr.msgAll.htmlPath!""}\">';
        html += '<img src="/${nr.msgAll.headImg}" />';
        html += '</a>';

        html += '</li>';

        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'scroll-v': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';

        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';

        html += '<span class="' + dict['dateType'][json['dateType']] + '">';
        html += timeFormat ? '${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}' : '';
        html += '</span>';
        html += '</li>';

        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'panel-type0': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';
        html += '<p>[专业建设]</p>';
        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '<span class="' + dict['dateType'][json['dateType']] + '">';
        html += timeFormat ? '[${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}]' : '';
        html += '</span>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'panel-type1': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';
        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '<span class="' + dict['dateType'][json['dateType']] + '">' + (timeFormat ? '[${nr.msgAll.releaseTime?string("' + json["timeFormat"] + '")}]' : '') + '</span>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'panel-type2': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['count'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';
        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '<span class="' + dict['dateType'][json['dateType']] + '">' + (timeFormat ? '[${nr.msgAll.releaseTime?string("' + json["timeFormat"] + '")}]' : '') + '</span>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'panel-type3': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';

        html += '<table width="100%">';
        html += '<tbody>';

        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';

        html += '<tr>';
        html += '<td height="24" width="10%"><img src="http://210.29.65.177:8001/ntdxcszz/ntdx-by-base/ancor1.jpg"></td>';
        html += '<td style="color:#560;" width="45%"><span style="display:inline-block;">' + json['columnName'] + '</span></td>';
        html += '<td style="color:#560;" width="45%"><span>';
        html += timeFormat ? '${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}' : '';
        html += '</span><span>第三期</span></td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td style="border-bottom:1px dashed gray;" height="26" colspan="3">';
        html += '<a href="${nr.msgAll.htmlPath}" title="<#if (nr.msgAll.msgTitle!"")?length lt ' + json['siteLength'] + '> ${nr.msgAll.msgTitle!""}<#else>${(nr.msgAll.msgTitle!"")?substring(0,' + json['count'] + ')}...</#if> ">';
        html += '<#if (nr.msgAll.msgTitle!"")?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle!"")?substring(0,' + json['siteLength'] + ')}...';
        html += '</#if>';
        html += '</a>';
        html += '</td>';
        html += '</tr>';

        html += '</#list>';
        html += '</@cmslist>';

        html += '</tbody>';
        html += '</table>';


        return html;
    },
    'panel-type4': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + (dict['listStyleType'][json['listStyleType']] || 'liststyle-decimal') + '">';
        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '<span class="' + dict['dateType'][json['dateType']] + '">';
        html += timeFormat ? '${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}' : '';
        html += '</span>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'panel-type5': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';
        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '<span class="' + dict['dateType'][json['dateType']] + '">';
        html += timeFormat ? '[${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}]' : '';
        html += '</span>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'panel-type6': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li class="panel-list-item ' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';
        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '<span class="' + dict['dateType'][json['dateType']] + '">';
        html += timeFormat ? '${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}' : '';
        html += '</span>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'panel-unsorted': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

        html += '<span class="' + dict['dateType'][json['dateType']] + '">';
        html += timeFormat ? '${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}' : '';
        html += '</span>';

        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';

        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'panel-pic': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<div class="lb7_con" desc="contentShow">';
        html += '<div class="lb7_pic">';
        html += '<img src="/../${nr.msgAll.headImg}" width="140" height="106">';
        html += '</div>';


        html += '<div class="lb7_c">';
        html += '<ul>';
        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';
        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '<span class="' + dict['dateType'][json['dateType']] + '">';
        html += timeFormat ? '[${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}]' : '';
        html += '</span>';
        html += '</li>';
        html += '</ul>';

        html += '</div>';

        html += '</div>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'panel-pic-v': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        // 固定抓取的两个图片
        html += '<div class="lb8_pic">';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="2" order="">';
        html += '<#list messageMap as nr>';
        html += '<div class="pic">';
        html += '<img src="/../../${nr.msgAll.headImg}" width="140" height="106">';
        html += '<p desc="img-title" class="lbtitle">';

        html += '<#if nr.msgAll.msgTitle?length lt 8>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0, 8)}..';
        html += '</#if>';

        html += '</p>';
        html += '</div>';
        html += '</#list>';
        html += '</@cmslist>';
        html += '</div>';

        html += '<ul class="clearfix">';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';
        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';

        html += '</ul>';

        html += '</div>';
        return html;
    },
    'panel-download': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        // todo here
        return html;
    },
    'powerpoint': function(json) {

    },
    'easyslides': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li>';
        html += '<img src="/${nr.msgAll.headImg}" />';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'slidenormal': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});

        var html = '';

        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li style="background:#4198ce;">';
        html += '<img src="../../${nr.msgAll.headImg}" />';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';

        return html;
    },
    'slidetop': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});

        var html = '';

        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li>';

        html += '<div class="pic">';
        html += '<a href="/${nr.msgAll.headImg}" target="_blank">';
        html += '<img src="/${nr.msgAll.headImg}" />';
        html += '</a>';
        html += '</div>';

        html += '<div class="title">';
        html += '图片标题';
        html += '</div>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';

        return html;
    },
    'bot_ppt': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});

        var html = '',
            smHtml = '';

        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li>';
        html += '<a target="_blank" href="/${nr.msgAll.headImg}">';
        html += '<img src="/${nr.msgAll.headImg}" alt="" border="0" height="100%">';
        html += '</a>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';


        smHtml += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        smHtml += '<#list messageMap as nr>';
        smHtml += '<li>';
        smHtml += '<img src="${nr.msgAll.headImg}" alt="" border="0" height="100%">';
        smHtml += '</li>';
        smHtml += '</#list>';
        smHtml += '</@cmslist>';

        return {
            'html': html,
            'smHtml': smHtml
        };
    },
    'digest': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        html += '<p class="digest" desc="contentShow">';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="1" order="">';
        html += '<#list messageMap as nr>';


        html += '<a href="${nr.msgAll.htmlPath}">';

        html += '<#if ((nr.msgAllMap.summary)?length lt ' + json['nrLength'] + ')>';
        html += '${nr.msgAllMap.summary}';
        html += '<#else>';
        html += '${(nr.msgAllMap.summary)?substring(0,' + json['nrLength'] + ')}..';
        html += '</#if>';
        html += '</a>';

        html += '</#list>';
        html += '</@cmslist>';
        html += '</p>';
        return html;
    },
    'article': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="1" order="">';
        html += '<#list messageMap as nr>';

        html += '<center>';
        html += '<h2 class="title" operable="text">';
        html += '<#if ((nr.msgAllMap.msgtitle)?length lt ' + json['btLength'] + ')>';
        html += '${nr.msgAllMap.msgtitle}';
        html += '<#else>';
        html += '${(nr.msgAllMap.msgtitle)?substring(0,' + json['btLength'] + ')}..';
        html += '</#if>';
        html += '</h2>';
        html += '</center>';

        html += '<p class="digest" desc="contentShow">';


        html += '<a href="${nr.msgAll.htmlPath}">';

        html += '<#if ((nr.msgAllMap.summary)?length lt ' + json['nrLength'] + ')>';
        html += '${nr.msgAllMap.summary}';
        html += '<#else>';
        html += '${(nr.msgAllMap.summary)?substring(0,' + json['nrLength'] + ')}..';
        html += '</#if>';
        html += '</a>';

        html += '</p>';

        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'article-title': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        html += '<div desc="contentShow">';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="1" order="">';
        html += '<#list messageMap as nr>';

        html += '<center>';
        html += '<h2 class="title">';
        html += '${nr.msgAllMap.msgtitle}';
        html += '</h2>';
        html += '</center>';

        html += '</#list>';
        html += '</@cmslist>';
        html += '</div>';
        return html;
    },
    'article-author': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        html += '<div class="clearfix" desc="contentShow">';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="1" order="">';
        html += '<#list messageMap as nr>';

        html += '<span class="author" style="width:160px;float:left;">';
        html += '文章作者：${nr.msgAll.author!""}';
        html += '</span>';

        html += '</#list>';
        html += '</@cmslist>';
        html += '</div>';
        return html;
    },
    'article-share': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        html += '<div desc="contentShow">';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="1" order="">';
        html += '<#list messageMap as nr>';

        html += '<span>';
        html += '${nr.msgAllMap.msgtitle}';
        html += '</span>';

        html += '</#list>';
        html += '</@cmslist>';
        html += '</div>';
        return html;
    },
    'article-date': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';

        html += '<div class="clearfix" desc="contentShow">';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="1" order="">';
        html += '<#list messageMap as nr>';

        html += '<span class="releaseTime" style="float:left;">发布时间：';
        html += timeFormat ? '${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}' : '';
        html += '</span>';

        html += '</#list>';
        html += '</@cmslist>';
        html += '</div>';
        return html;
    },
    'article-contents': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="1" order="">';
        html += '<#list messageMap as nr>';

        html += '<div desc="contentShow">';
        html += '<p class="digest">';

        html += '${nr.msgAllMap.msgcontent}';

        html += '</p>';
        html += '</div>';

        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'attrlist': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        html += '<table width="100%"cellspacing="0" cellpadding="0" style="border:solid 1px #fff;" desc="contentShow">';
        html += '<thead>';
        html += '<tr bgcolor="#9ac2db" height="30" style="color:#fff;"align="center">';
        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;width:55%">文件名称</td>';
        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;width:15%">文件大小</td>';
        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;width:15%">更新时间</td>';
        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;width:15%">下载次数</td>';
        html += '</tr>';
        html += '</thead>';

        html += '<tbody>';
        html += '<@cmsAttList lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<tr height="30"bgcolor="#d8fccc" align="center">';

        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;">';
        html += '<a href="${nr.att_path}">';
        html += '<#if ((nr.msgAllMap.msgTitle)?length lt ' + json['siteLength'] + ')>';
        html += '${nr.msgAllMap.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAllMap.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '</td>';

        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;"></td>';

        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;">';
        html += '${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}';
        html += '</td>';

        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;">90</td>';
        html += '</tr>';

        html += '</#list>';
        html += '</@cmsAttList>';
        html += '</tbody>';
        html += '</table>';
        return html;
    },
    'img-list': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';

        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';

        html += '<li>';
        html += '<div class="imgdiv">';
        html += '<a href="/../../${nr.msgAll.headImg}">';
        html += '<img src="/../../${nr.msgAll.headImg}" />';
        html += '</a>';
        html += '</div>';

        html += '<p>';
        html += '<a href="${nr.msgAll.htmlPath}">';

        html += '<#if ((nr.msgAll.msgTitle)?length lt ' + json['btLength'] + ')>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['btLength'] + ')}..';
        html += '</#if>';

        html += '</a>';
        html += '</p>';

        html += '</li>';

        html += '</#list>';
        html += '</@cmslist>';
        return html;
    },
    'img-news': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';

        html += '<div class="bd" desc="contentShow">'
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="1" order="">';
        html += '<#list messageMap as nr>';

        html += '<div class="pic">';
        html += '<img desc="image" src="/../../${nr.msgAll.headImg}">';
        html += '</div>';

        html += '<div class="con">';
        html += '<p>';


        html += '<a href="${nr.msgAll.htmlPath}">';
        html += '<#if ((nr.msgAllMap.summary)?length lt ' + json['nrLength'] + ')>';
        html += '${nr.msgAllMap.summary}';
        html += '<#else>';
        html += '${(nr.msgAllMap.summary)?substring(0,' + json['nrLength'] + ')}..';
        html += '</#if>';
        html += '</a>';

        html += '</p>';
        html += '</div>';

        html += '</#list>';
        html += '</@cmslist>';

        html += '</div>';
        return html;
    },
    'img-news-h': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        html += '<li class="img-news-list">';

        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="1" order="">';
        html += '<#list messageMap as nr>';

        html += '<div class="img-news">';

        html += '<div class="entry-img" style="background-color:transparent;">';
        html += '<img src="/../${nr.msgAll.headImg}">';
        html += '</div>';

        html += '<div class="news-main">';

        html += '<div class="news-title">';
        html += '<h3><a href="#">';
        html += '<#if ((nr.msgAll.msgTitle)?length lt ' + json['btLength'] + ')>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['btLength'] + ')}..';
        html += '</#if>';
        html += '</a></h3>'
        html += '</div>'



        html += '<div class="news-content">';
        html += '<p>';
        html += '<a href="${nr.msgAll.htmlPath}">';

        html += '<#if ((nr.msgAllMap.summary)?length lt ' + json['nrLength'] + ')>';
        html += '${nr.msgAllMap.summary}';
        html += '<#else>';
        html += '${(nr.msgAllMap.summary)?substring(0,' + json['nrLength'] + ')}..';
        html += '</#if>';

        html += '</a>';
        html += '</p>';

        html += '<p class="news-more"><a href="${nr.msgAll.htmlPath}">更多</a></p>'
        html += '</div>';

        html += '</div>';
        html += '</div>';

        html += '</#list>';
        html += '</@cmslist>';
        html += '</li>';
        return html;
    },
    'img-news-v': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        html += '<li>';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="1" order="">';
        html += '<#list messageMap as nr>';

        html += '<div class="intro_img">';
        html += '<img src="/../${nr.msgAll.headImg}">';
        html += '</div>';

        html += '<div class="intro_div">';
        html += '<h3><a href="#">';
        html += '<#if ((nr.msgAll.msgTitle)?length lt ' + json['btLength'] + ')>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['btLength'] + ')}..';
        html += '</#if>';
        html += '</a></h3>'

        html += '<p>';
        html += '<a href="${nr.msgAll.htmlPath}#">';


        html += '<#if ((nr.msgAllMap.summary)?length lt ' + json['nrLength'] + ')>';
        html += '${nr.msgAllMap.summary}';
        html += '<#else>';
        html += '${(nr.msgAllMap.summary)?substring(0,' + json['nrLength'] + ')}..';
        html += '</#if>';


        html += '</a>';
        html += '</p>';
        html += '</div>';

        html += '</div>';

        html += '</#list>';
        html += '</@cmslist>';
        html += '</li>';
        return html;
    },
    'cont-tpl': function(json) {
        var html = '';
        html += '<div desc="contentShow">';
        html += '<div class="cont-header">';
        html += '<h1 class="cont-title" desc="contTitle">';
        html += '${nr.msgAll.msgTitle!""}';
        html += '</h1>';
        html += '<div class="cont-info">';
        html += '<span class="cont-author" desc="contAuthor">作者:<strong>${nr.msgAll.author!""}</strong></span>';
        html += '<span class="cont-date" desc="contReleaseTime">发布时间:<strong>${nr.msgAll.releaseTime?string("yyyy-MM-dd")}</strong></span>';
        html += '<span class="cont-visitors" desc="contVisitors">浏览量:<strong>${nr.msgAll.visitors!""}</strong></span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="cont-body" desc="contBody">';
        html += '<p>';
        html += "${nr.msgAllMap.msgcontent!''}";
        html += '</p>';
        html += '</div>';
        html += '<div class="cont-footer" desc="contFooter">';
        html += '<span class="cont-visitors"></span>';
        html += '</div>';
        html += '</div>';
        return html;
    },
    'cont-tpl1': function(json) {
        var html = '';
        html += '<div desc="contentShow">';
        html += '<div class="cont-header">';
        html += '<h1 class="cont-title" desc="contTitle">';
        html += '${nr.msgAll.msgTitle!""}';
        html += '</h1>';
        html += '</div>';
        html += '<div class="cont-body" desc="contBody">';
        html += '<p>';
        html += "${nr.msgAllMap.msgcontent!''}";
        html += '</p>';
        html += '</div>';
        html += '<div class="cont-footer" desc="contFooter">';
        html += '<span class="cont-visitors">浏览量:<strong>${nr.msgAll.visitors!""}</strong></span>';
        html += '<span class="cont-date">加入时间:<strong>${nr.msgAll.releaseTime?string("yyyy-MM-dd hh:mm:ss")}</strong></span>';
        html += '<span class="cont-author">作者:<strong>${nr.msgAll.author!""}</strong></span>';
        html += '</div>';
        html += '</div>';

        return html;
    },
    'undefined': function(json) {
        // exception/default case
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];
        var html = '';
        html += '<@cmslist lmxx="' + json['siteSimpleName'] + ',' + json['columnSimpleName'] + '" count="' + json['siteCount'] + '" order="">';
        html += '<#list messageMap as nr>';
        html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';
        html += '<p>[专业建设]</p>';
        html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
        html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
        html += ' title=\"${nr.msgAll.msgTitle!""}\">';
        html += '<#if nr.msgAll.msgTitle?length lt ' + json['siteLength'] + '>';
        html += '${nr.msgAll.msgTitle}';
        html += '<#else>';
        html += '${(nr.msgAll.msgTitle)?substring(0,' + json['siteLength'] + ')}..';
        html += '</#if>';
        html += '</a>';
        html += '<span class="' + dict['dateType'][json['dateType']] + '">';
        html += timeFormat ? '[${nr.msgAll.releaseTime?string("' + json['timeFormat'] + '")}]' : '';
        html += '</span>';
        html += '</li>';
        html += '</#list>';
        html += '</@cmslist>';
        return html;
    }
};

/**
 * [contentStrategies 生成静态html的transformer strategies,LOL]
 * @type {Object}
 */
var contentStrategies = {
    'scroll-v': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            html += '<ul id="breakNewsList" desc="contentShow" class="list6">';
            var sampleTitle = '新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题';
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                // if (!(i % 4)) {
                // 	html += '<span class="hot-news">New!</span>'; // hotflag
                // }
                html += '</a>';

                html += '<span class="' + dict['dateType'][json['dateType']] + '">';
                html += timeFormat ? timeFormat : '';
                html += '</span>';
                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'img-scroll-h': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        var percent = parseFloat(1 / (json['siteCount'] || 1)) * 100;
        if (+json['siteCount']) {
            html += '<ul class="scroll-list" desc="contentShow" >';
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li style="width:' + percent + '% !important;">';
                html += '<div class="placeholder"></div>';
                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'panel': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            html += '<ul desc="contentShow">';
            var sampleTitle = '新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题';
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';
                html += '<span class="' + dict['dateType'][json['dateType']] + '">';
                html += (timeFormat ? timeFormat : '');
                html += '</span>';
                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                // if (!(i % 4)) {
                // 	html += '<span class="hot-news">New!</span>'; // hotflag
                // }
                html += '</a>';
                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'panel-type0': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            html += '<ul desc="contentShow">';
            var sampleTitle = '新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题';
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {

                html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

                html += '<p>[专业建设]</p>';

                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                html += '</a>';

                html += '<span class="' + dict['dateType'][json['dateType']] + '">';
                html += timeFormat ? '[' + timeFormat + ']' : '';
                html += '</span>';

                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'panel-type1': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            html += '<ul desc="contentShow">';
            var sampleTitle = '新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题新闻标题';
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                html += '</a>';

                html += '<span class="' + dict['dateType'][json['dateType']] + '">';
                html += timeFormat ? '[' + timeFormat + ']' : '';
                html += '</span>';

                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'panel-type2': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            html += '<ul desc="contentShow">';
            var sampleTitle = repeat('新闻标题', 20);
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                html += '</a>';

                html += '<span class="' + dict['dateType'][json['dateType']] + '">';
                html += timeFormat ? '[' + timeFormat + ']' : '';
                html += '</span>';

                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'panel-type3': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {

            html += '<table desc="contentShow" width="100%">';
            html += '<tbody>';
            var sampleTitle = repeat('新闻标题', 20);
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<tr>';

                html += '<td height="24" width="10%"><img src="http://210.29.65.177:8001/ntdxcszz/ntdx-by-base/ancor1.jpg"></td>';
                html += '<td style="color:#560;" width="45%"><span style="display:inline-block;">' + json['columnName'] + '</span></td>';
                html += '<td style="color:#560;" width="45%"><span>';
                html += timeFormat ? '[' + timeFormat + ']' : '';
                html += '</span><span>第三期</span></td>';

                html += '</tr>';

                html += '<tr>';
                html += '<td style="border-bottom:1px dotted gray;" colspan="3" height="26">';
                html += '<a href="#" title="' + sampleTitle + '">' + sampleTitle + '</a>';
                html += '</td>'
                html += '</tr>';
            }

            html += '</tbody>'
            html += '</table>';
        }
        return html;
    },
    'panel-type4': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            html += '<ul desc="contentShow">';
            var sampleTitle = repeat('新闻标题', 20);
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + (dict['listStyleType'][json['listStyleType']] || 'liststyle-decimal') + '">';

                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                html += '</a>';

                html += '<span class="' + dict['dateType'][json['dateType']] + '">';
                html += timeFormat ? '[' + timeFormat + ']' : '';
                html += '</span>';

                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'panel-type5': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            html += '<ul desc="contentShow">';
            var sampleTitle = repeat('新闻标题', 20);
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                html += '</a>';

                html += '<span class="' + dict['dateType'][json['dateType']] + '">';
                html += timeFormat ? '[' + timeFormat + ']' : '';
                html += '</span>';

                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'panel-type6': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {

            html += '<ul class="panel-list contents" desc="contentShow">';
            var sampleTitle = repeat('新闻标题', 20);
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="panel-list-item ' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                html += '</a>';

                html += '<span class="' + dict['dateType'][json['dateType']] + '">';
                html += timeFormat ? timeFormat : '';
                html += '</span>';

                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'panel-unsorted': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            html += '<ul class="newslist" desc="contentShow">';
            var sampleTitle = repeat('新闻标题', 20);
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="panel-list-item ' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

                html += '<span class="' + dict['dateType'][json['dateType']] + '">';
                html += timeFormat ? timeFormat : '';
                html += '</span>';

                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                html += '</a>';

                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'digest': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        var dict = classDict[json['type']];

        var sampleContent = repeat('正文摘要', 100);
        sampleContent = String(sampleContent).substr(0, json['nrLength']) + '...';

        html += '<p class="digest" desc="contentShow">';
        html += '<a href="${nr.msgAll.htmlPath}">';

        html += sampleContent;

        html += '</a>';
        html += '</p>';

        return html;
    },
    'article': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        var dict = classDict[json['type']];

        var sampleTitle = repeat('正文标题', 20);
        var sampleContent = repeat('正文摘要', 100);
        sampleTitle = String(sampleTitle).substr(0, json['btLength']) + '...';
        sampleContent = String(sampleContent).substr(0, json['nrLength']) + '...';

        html += '<div desc="contentShow">';

        html += '<center>';
        html += '<h2>';
        html += sampleTitle;
        html += '</h2>';

        html += '<p class="digest">';
        html += '<a href="${nr.msgAll.htmlPath}">';

        html += sampleContent;

        html += '</a>';
        html += '</p>';
        html += '</div>';

        return html;
    },
    'article-title': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        var dict = classDict[json['type']];

        var sampleTitle = repeat('正文标题', 20);
        sampleTitle = String(sampleTitle).substr(0, 8) + '...';

        html += '<div desc="contentShow">';
        html += '<center>';
        html += '<h2 class="title">';
        html += '正文标题正文标题正文标题正文标题正文标题...';
        html += '</h2>';
        html += '</center>';
        html += '</div>';

        return html;
    },
    'article-author': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        var dict = classDict[json['type']];

        html += '<div class="clearfix" desc="contentShow">';
        html += '<span class="author" style="width:160px;float:left;">';
        html += '文章作者：作者姓名';
        html += '</span>';
        html += '</div>';

        return html;
    },
    'article-date': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        var dict = classDict[json['type']];
        var timeFormat = date2sample[json['timeFormat']];

        html += '<div class="clearfix" desc="contentShow">';

        html += '<span class="releaseTime" style="float:left;">发布时间：';
        html += timeFormat ? timeFormat : '';
        html += '</span>';
        html += '</div>';

        return html;
    },
    'article-contents': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var html = '';
        var dict = classDict[json['type']];

        var sampleContent = repeat('正文摘要', 400);
        sampleContent = String(sampleContent).substr(0, 325) + '...';

        html += '<div desc="contentShow">';
        html += '<p class="digest">';
        html += sampleContent;
        html += '</p>';
        html += '</div>';

        return html;
    },
    'panel-pic': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {

            html += '<div class="lb7_con" desc="contentShow">';
            html += '<div class="lb7_pic">';
            html += '<img desc="image" src="/../../${nr.msgAll.headImg}" width="140" height="106"/>';
            html += '</div>';
            html += '<div class="lb7_c">';

            html += '<ul>';
            var sampleTitle = repeat('新闻标题', 20);
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var timeFormat = date2sample[json['timeFormat']];
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                html += '</a>';

                html += '<span class="' + dict['dateType'][json['dateType']] + '">';
                html += timeFormat ? '[' + timeFormat + ']' : '';
                html += '</span>';

                html += '</li>';
            }

            html += '</ul>';
            html += '</div>';
            html += '</div>';
        }
        return html;
    },
    'panel-pic-v': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            var sampleTitle = repeat('新闻标题', 20);
            var sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';
            var shortTitle = String(sampleTitle).substr(0, 8) + '...';

            html += '<div class="lb8_con" desc="contentShow">';
            html += '<div class="lb8_pic">';
            html += '<div class="pic">';
            html += '<img src="http://210.29.65.177:8001/ntdxcszz/ntdx-by-base/20156884735546.jpg" width="140"height="106"/>';
            html += '<p>' + shortTitle + '</p>';
            html += '</div>';
            html += '<div class="pic">';
            html += '<img src="http://210.29.65.177:8001/ntdxcszz/ntdx-by-base/20156884735546.jpg" width="140"height="106"/>';
            html += '<p>' + shortTitle + '</p>';
            html += '</div>';
            html += '</div>';


            html += '<ul class="clearfix">';

            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="' + dict['underlineType'][json['underlineType']] + ' ' + dict['listStyleType'][json['listStyleType']] + '">';

                html += '<a href=\"#\" title=\"新闻标题\">';
                html += sampleTitle;
                html += '</a>';

                html += '</li>';
            }

            html += '</ul>';
            html += '</div>';
        }
        return html;
    },
    'img-list': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        var sampleTitle = repeat('新闻标题', 65);
        sampleTitle = String(sampleTitle).substr(0, json['btLength']) + '...';
        var percent = parseFloat(1 / (json['siteCount'] || 1)) * 100;
        html += '<ul class="clearfix" desc="contentShow">';
        for (var i = 0, l = json['count']; i < l; i++) {
            html += '<li style="width:' + percent + '% !important;">';
            html += '<div class="imgdiv">';
            html += '<a href="#">';
            html += '<img src="http://210.29.65.177:8001/ntdxcszz/ntdx-by-base/colorimg.png">';
            html += '</a>';
            html += '</div>';
            html += '<p>' + sampleTitle + '</p>';
            html += '</li>'
        }
        html += '</ul>';

        return html;
    },
    'attrlist': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var sampleTitle = repeat('新闻标题', 65);
        var timeFormat = date2sample[json['timeFormat']];
        sampleTitle = String(sampleTitle).substr(0, json['siteLength']) + '...';

        var html = '';

        html += '<table width="100%"cellspacing="0" cellpadding="0" style="border:solid 1px #fff;" desc="contentShow">';
        html += '<thead>';
        html += '<tr bgcolor="#9ac2db" height="30" style="color:#fff;"align="center">';
        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;width:55%">文件名称</td>';
        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;width:15%">文件大小</td>';
        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;width:15%">更新时间</td>';
        html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;width:15%">下载次数</td>';
        html += '</tr>';
        html += '</thead>';

        if (+json['siteCount']) {
            html += '<tbody>';
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<tr height="30"bgcolor="#d8fccc" align="center">';

                html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;">';
                html += sampleTitle;
                html += '</td>';

                html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;"></td>';

                html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;">';
                html += timeFormat ? '[' + timeFormat + ']' : '';
                html += '</td>';

                html += '<td style="border-bottom:solid 1px #fff;border-right:solid 1px #fff;">90</td>';
                html += '</tr>';
            }
            html += '</tbody>';
        }

        html += '</table>';
        return html;
    },
    'img-news': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        var sampleContent = repeat('正文摘要', 65);
        sampleContent = String(sampleContent).substr(0, json['nrLength']) + '...';


        html += '<div class="bd" desc="contentShow">';
        html += '<div class="pic"><img desc="image" src="http://210.29.65.177:8001/ntdxcszz/ntdx-by-base/kkk.jpg"></div>';
        html += '<div class="con">';

        html += '<p>';
        html += '<a href="#">';
        html += sampleContent;
        html += '</a>';
        html += '</p>';

        html += '</div>';
        html += '</div>';
        html += '</div>';

        return html;
    },
    'img-news-h': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        var sampleTitle = repeat('新闻标题', 20),
            sampleContent = repeat('正文摘要', 65);

        sampleTitle = String(sampleTitle).substr(0, json['btLength']) + '...';
        sampleContent = String(sampleContent).substr(0, json['nrLength']) + '...';

        if (+json['siteCount']) {
            html += '<ul class="news-group" desc="contentShow">';
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li class="img-news-list">';
                html += '<div class="img-news">';
                html += '<div class="entry-img">';
                html += '<p>图片</p>';
                html += '</div>';
                html += '<div class="news-main">';
                html += '<div class="news-title">';
                html += '<h3><a href="#">' + sampleTitle + '</a></h3>';
                html += '</div>';
                html += '<div class="news-content">';
                html += '<p>' + sampleContent + '</p>';
                html += '<p class="news-more"><a href="#">更多</a></p>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
                html += '</li>';
            }

            html += '</ul>';
        }


        return html;
    },
    'img-news-v': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        var sampleTitle = repeat('新闻标题', 20),
            sampleContent = repeat('正文摘要', 65);

        sampleTitle = String(sampleTitle).substr(0, json['btLength']) + '...';
        sampleContent = String(sampleContent).substr(0, json['nrLength']) + '...';

        if (+json['siteCount']) {
            html += '<ul desc="contentShow">';
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<div class="intro_img">';
                html += '<img src="http://210.29.65.177:8001/ntdxcszz/ntdx-by-base/intro_img.jpg" border="0" alt="">';
                html += '</div>';

                html += '<div class="intro_div">';
                html += '<h3><a href="#">' + sampleTitle + '</a></h3>';
                html += '<p>' + sampleContent + '</p>';
                html += '</div>';
            }

            html += '</ul>';
        }


        return html;
    },
    'easyslides': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            html += '<ul style="margin:0;height:100%;" class="rslides clearfix" id="slider" desc="contentShow">';
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li style="background-color:#4198ce;width:100%;height:100%;padding:0px;">';
                html += '<img src="images/1.jpg" alt="">';
                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'slidenormal': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {

            html += '<ul class="slider_list" id="slider_list" desc="contentShow">';
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li style="background-color:#4198ce;width:100%;height:100%;padding:0px;">';
                html += '<img src="images/1.jpg" alt="">';
                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'slidetop': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {
            html += '<ul class="picList" desc="contentShow">';
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li style="width:100%;height:100%;padding:0px;">';
                html += '<div class="pic">';
                html += '<a href="#" target="_blank"><img src=""></a>';
                html += '</div>';
                html += '<div class="title">';
                html += '<a href="#" target="_blank">效果图' + (i + 1) + '</a>';
                html += '</div>';
                html += '</li>';
            }

            html += '</ul>';
        }
        return html;
    },
    'bot_ppt': function(json) {
        json = $.extend({}, ftlDefaults[json['type']], json || {});
        var dict = classDict[json['type']];
        var html = '';
        if (+json['siteCount']) {

            html += '<ul id="tFocus-pic" class="zoom" desc="contentShow">';
            for (var i = 0, l = json['siteCount']; i < l; i++) {
                html += '<li style="background:#4198ce;opacity:1;">';
                html += '<a href="#">';
                html += '<img src="" alt="icon" height=100%;>';
                html += '</a>';
                html += '</li>';
            }
            html += '</ul>';
        }
        return html;
    },
    'cont-tpl': function(json) {
        var html = '';
        html += '<div desc="contentShow">';
        html += '<div class="cont-header">';
        html += '<h1 class="cont-title" desc="contTitle">';
        html += '这是一个内容页的测试标题';
        html += '</h1>';
        html += '<div class="cont-info">';
        html += '<span class="cont-author" desc="contAuthor">作者:<strong>管理员</strong></span>';
        html += '<span class="cont-date" desc="contReleaseTime">发布时间:<strong>yyyy-MM-dd</strong></span>';
        html += '<span class="cont-visitors" desc="contVisitors">浏览量:<strong>123</strong></span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="cont-body" desc="contBody">';
        html += '<p>测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容</p>';
        html += '<p>测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容</p>';
        html += '<p>测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容</p>';
        html += '<p>测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容</p>';
        html += '<p>测试的正文内容测试的正文内容测试的正文内容测试的正文内容测试的正文内容测试的正文内容</p>';
        html += '</div>';
        html += '<div class="cont-footer" desc="contFooter">';
        html += '<span class="cont-visitors"></span>';
        html += '</div>';
        html += '</div>';

        return html;
    },
    'cont-tpl1': function(json) {
        var html = '';
        html += '<div desc="contentShow">';
        html += '<div class="cont-header">';
        html += '<h1 class="cont-title" desc="contTitle">';
        html += '这是一个内容页的测试标题';
        html += '</h1>';
        html += '</div>';
        html += '<div class="cont-body" desc="contBody">';
        html += '<p>测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容</p>';
        html += '<p>测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容</p>';
        html += '<p>测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容</p>';
        html += '<p>测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容测试正文内容</p>';
        html += '<p>测试的正文内容测试的正文内容测试的正文内容测试的正文内容测试的正文内容测试的正文内容</p>';
        html += '</div>';
        html += '<div class="cont-footer" desc="contFooter">';
        html += '<span class="cont-visitors" desc="contVisitors">浏览量:<strong>123</strong></span>';
        html += '<span class="cont-date" desc="contReleaseTime">发布时间:<strong>yyyy-MM-dd hh:mm:ss</strong></span>';
        html += '<span class="cont-author" desc="contAuthor">作者:<strong>管理员</strong></span>';
        html += '</div>';
        html += '</div>';

        return html;
    },
    'undefined': function() {
        // exception case
        return '';
    }
};

function writeAttr($obj, attr_name, attr_val) {
    attr_val = attr_val || '';
    $obj.attr(attr_name, attr_val);
}

function writeCache($obj, json) {
    writeAttr($obj, 'data-cache', JSON.stringify(json));
};
