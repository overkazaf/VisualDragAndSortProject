(function ($){
    var initData = '<datastore><totalrecord>${nr.totalRecord}</totalrecord><recordset>';
    $('#initData ul').each(function(){
        initData += '<record><![CDATA[' + $(this).html().replace(/(\n)+|(\r\n)+/g, '') + ']]></record>';
    });
    initData += '</recordset></datastore>';

    $('#msgList').jpage({
        cache:false,
        openCookies:false,
        dataStore:initData,
        totalRecord:"${nr.totalRecord}",
        dataBefore:'<ul>',
        dataAfter:'</ul>',
        contentTemplate:'<datastore><totalrecord>${r"${totalRecord}"}</totalrecord><recordset>${r"<#list msgAllList as msgAll>"}<record><![CDATA[<li><span>[${r"${(msgAll.releaseTime)!}"}]</span><a href="${r"${(msgAll.htmlPath)!}"}" title="${r"${(msgAll.msgTitle)!}"}">${r"${(msgAll.msgTitle)!}"}</a></li>]]></record>${r"</#list>"}</recordset></datastore>',
        proxyUrl:'http://210.29.65.177:8001/TrueCMS/messageController/getMessage.do',
        perPage:20,
        groupSize:3,
        barPosition:'bottom',
        ajaxParam:{
            columnId:'${nr.columnId}'
        }
    });
})(jQuery);
