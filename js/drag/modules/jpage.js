$(function(){
    var initData = '<datastore><totalrecord>${nr.totalRecord?c}</totalrecord><recordset>';
    $('#initData ul').each(function(){
        initData += '<record><![CDATA[' + $(this).html().replace(/(\n)+|(\r\n)+/g, '') + ']]></record>';
    });
    initData += '</recordset></datastore>';
    
    $('#msgList').jpage({
        cache:false,
        openCookies:false,
        dataStore:initData,
        totalRecord:${nr.totalRecord?c},
        dataBefore:'<ul id="content" class="content">',
        dataAfter:'</ul>',
        contentTemplate:'<datastore><totalrecord>${r"${nr.totalRecord?c}"}</totalrecord><recordset>${r"<#list nr.msgAllList as msgAll>"}<record><![CDATA[<li class="change" style="line-height: 30px;background: url(/resouce/btqzf/images/news_ico.gif) no-repeat 15px center;padding: 0px 20px 0px 30px;border-bottom: 1px dashed #DDD;margin: 0px 10px;text-align: right;"  onMouseOver="show(this)" onMouseOut="noshow(this)"><span style="float:left;"><a href="${r"${(msgAll.htmlPath)!}"}" target="_blank">${r"<#if (msgAll.msgTitle!)?length lt 55> ${msgAll.msgTitle!}<#else> ${(msgAll.msgTitle!)?substring(0,55)}...</#if>"}</a></span>${r"${(msgAll.releaseTime)?string(\'yyyy-MM-dd\')}"}</li>]]></record>${r"</#list>"}</recordset></datastore>',
        proxyUrl:'${nr.site.siteUrl}/TrueCMS/messageController/getMessage.do',
        perPage:10,
        groupSize:3,
        barPosition:'bottom',
        ajaxParam:{
            columnId:'${nr.columnId}'
        }
    });
    
    var arrayli = document.getElementById('content').getElementsByTagName('li');
        var bool = true; //奇数行为true
        var oldStyle; //保存原有样式
        for(var i = 0;i<arrayli.length;i++){
            //各行变色
            if(bool === true){
                arrayli[i].className = "change";
                bool = false;
            } else {
                arrayli[i].className = "";
                bool = true;    
            }
            
            //划过变色
            arrayli[i].onmouseover = function() {
                oldStyle = this.className;
                this.className = "current"
                } 
            arrayli[i].onmouseout = function() {
                this.className = oldStyle;
            } 
        } 
    
});

var yccccccccccc = null;

function show(obj) {
    yccccccccccc = obj.style.backgroundColor;
    obj.style.backgroundColor = "rgb(235,189,183)";
}

function noshow(obj) {
    obj.style.backgroundColor = yccccccccccc;
}