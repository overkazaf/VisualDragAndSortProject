/**
 *拖拽页面主页面操作
 */
var showShop = false;
var flash_url = "";
var url_theme = "";
function getIframeDoc(name){
    return window.frames[name].document;
}
function showCover(){
    var doc_h = $(document).height();
    $("#cover").height(doc_h);
    $("#cover").show();
}
function hideCover(){
    $("#cover").hide();
}
function HTMLUnescape(str){
    return String(str)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
function showBag(){
    $("#bag").show();
    var win_h = $(window).height();
    var h = $("#bag").height();
    $("#bag").css("top",(win_h-h)/2+"px");
}
function hideBag(){
    $("#bag").hide();
}
function GetChildLoading() {
    var frameId = "themeframe";

    if (document.all) {
        var frm =  window.frames[frameId];
        return frm.CreateLoading();
    }
    else {
        return document.getElementById(frameId).contentWindow.CreateLoading();
    }
}
var frameName = "themeframe";
$(function(){
    //右侧导航绑定accordion效果，active设置为NaN保证一开始是关闭状态。
$(".right_menu_ul>li").accordion({
    "header":".accordion-head",
    "collapsible": true,
    "active":NaN,
    "activate":function(event,ui){
        
        var currentObj = ui.newHeader.html() !== undefined ? ui.newHeader : ui.oldHeader;
        var htmlType = currentObj.find(".title").html();
        if(htmlType=="主题"){
    		$(".main").css("display","none");
    		//$(".main-body").css("overflow","hidden");
    		//$("#theme_div").css("overflow-y","scroll");
        }else if(htmlType=="部件工具箱"){
    		$(".main").css("display","block");
    		//$(".main-body").css("overflow","hidden");
    		//$(".main").css("overflow-y","scroll");
        }
        if(currentObj.find(".switch").hasClass("switch_open")){
            currentObj.find(".switch").removeClass("switch_open").addClass("switch_close");
            currentObj.find(".search").show();
            currentObj.find(".refresh").show();
        }else{
            currentObj.find(".switch").removeClass("switch_close").addClass("switch_open");
            currentObj.find(".search").hide();
            currentObj.find(".refresh").hide();
        }
    },
    "beforeActivate":function(event,ui){
//        var ao = event.target ? event.target :event.srcElement;
//        alert(ao.className?);
        //fix resize bugs
        $(this).siblings().toggle(300);
    }
});

    //refresh click stop propagation,avoid accordtion work.
    $("div.refresh").click(function(e){
        var e = e || window.event;
        if(e.stopPropagation){
            e.stopPropagation();
        }else{
            e.cancelBubble = true;
        }
        /******refresh action*******/
        /*********end**************/
        return false;
    });
    //部件绑定accordion效果
    function Accordion(element){
            element.next().hide();
        element.each(function(index){
            $(this).click(function(){
                var oParent = $(this).parent();
                var _this = $(this);
                var aH3 = oParent.children("h3");
                $.each(aH3, function (){
                    var flag = $(this).html() != _this.html();
                    if (flag) {
                        $(this).toggle(300);
                    } else {
                        $(this).next().toggle(300);
                    }
                });
                
            });
        });
    }
    Accordion($(".layout_div h3"));
    //部件和布局的切换
    $(".tabswitch").click(function(){
        var index = $(this).index();
        $(".tabitem").hide().eq(index).show();
    });
    //拖动绑定
    var dd = new DragNewWidget({ add: function (event, ui) {
            var loading = GetChildLoading();
            var item = ui.item;
            var nextid = $(ui.placeholder).next(".RadDock").attr("controlid");
            var target = $(ui.placeholder).parent(".RadDockZone").attr("controlid");
            
            /*布局添加修改*/
            var Layout = {
                add: function(id, path, target, nextid, success) {
                    $.ajax(
                        {
                            async: true,
                            type: "GET",
                            url: "bj/"+path,
                            dataType: "html",
                            error: function() { alert("创建布局出错啦!");},
                            success: function(html) {
                                //回调函数
                                if (success && jQuery.isFunction(success)) {
                                    success(html);
                                }
                            }
                        });
                }
            };

            if (!nextid || nextid == "undefined") {
                nextid = "";
            }
            if (!target || target == "undefined") {
                target = "body";
            }
            $(ui.placeholder).replaceWith(loading);
            if ($(item).hasClass("bj-widget")) {
                //添加布局
                var id = generatorId("zwlayout");
                var data = $(item).attr("data");
                Layout.add(id, data, target, nextid, function (html) {
                    //替换对象
                    writeCapture.replaceWith(loading, html);
                    document.getElementById("themeframe").contentWindow.refresh();
                });
            }
            if ($(item).hasClass("layout-widget") || $(item).hasClass("widget-item")) {
                var data = $(item).attr("data");
                data = unescape(data);
                var Me = this;
                var params = stringToJSON(data);
                var _self = window.theme;
                if (!_self.op){
                    _self.op = {
                        iframe:'themeframe',
                        page:'theme/moban1/index.html'
                    };
                }
                doc = getIframeDoc(_self.op.iframe);
                $(doc).on("mousemove",function(e){
                    e=e||window.event;
                    cx=e.clientX;
                    cy=e.clientY-$("#theme_div").scrollTop();                            
                });
                var MenuData = [[{
                    text:"编辑",
                    func:function(){
                     _self.op.targetElement = $(this);
                     var operable = $(this).attr("operable").split(",");
                     var div = $("<div id='temp-edit'></div>");
                     var div_chunk = $("<div id='temp-chunk'></div>");
                     var div_upload = $("<div id='temp-upload'></div>");
                     if(operable.length==1 && operable[0] == "chunk"){
                        $.ajax({   
                            url : ctxUrl+'/siteController/getSite.do?t='+Math.random()*1000,
                            type : 'POST',   
                            cache : false,
                            async : false,
                            error : function() {
                                alert('提示：链接异常，请检查网络！');
                            },
                            success : function(result) {  
                                var res = eval("("+result+")");
                                 var str_chunk ='';
                                 str_chunk ='<div style="width: 100%;float: left;background-color:  #0D679E;height: 25px;padding-top:5px"><span style="color: white;padding-left: 10px;font-size: 12px;font-family: Arial, sans-serif;float: left;">修改信息</span></div><br/><br/>';
                                  str_chunk+='<form id="form1">';
                                 str_chunk+='<div class="row_chunk">';
                                  str_chunk+='站点:';
                                  str_chunk+='<select id="site" name="site" onchange="changeSite()" >';
                                  for(var i=0;i<res.length;i++){
                                     str_chunk+='<option value="'+res[i].siteId+'">'+res[i].siteName+'</option>';
                                  }
                                  str_chunk+='</select>';
                                  str_chunk+='</div>';
                                  str_chunk+='<div class="row_chunk">';
                                  str_chunk+='栏目:';
                                  $.ajax({   
                                    url : ctxUrl+'/siteColumnController/getSiteColumn.do?t='+Math.random()*1000,
                                    type : 'POST',   
                                    cache : false,
                                    async : false,
                                    error : function() {  
                                        alert('提示：链接异常，请检查网络！');
                                    },
                                    data:{
                                        'siteId':res[0].siteId
                                    },
                                    success : function(date) {
                                        var dates = eval("("+date+")");
                                        str_chunk+='<select  id="siteColumn" name="siteColumn">';
                                        for(var i=0;i<dates.length;i++){
                                            str_chunk+='<option value="'+dates[i].columnId+'">'+dates[i].columnName+'</option>';
                                        }
                                         str_chunk+='</select>';
                                         str_chunk+='</div>';
                                         str_chunk+='<div class="row_chunk">';
                                         str_chunk+='条数:';
                                         str_chunk+='<input type="text" style="width:220px" name="count" />';
                                         str_chunk+='</div>';
                                         str_chunk+='<div class="row_chunk">';
                                         str_chunk+='长度:';
                                         str_chunk+='<input type="text" style="width:220px" name="length" />';
                                         str_chunk+='</div>';
                                         str_chunk+='<div class="row_chunk">时间:<select  name="date">'; 
                                         str_chunk+='<option value="yyyy-MM-dd">年-月-日</option>';
                                         str_chunk+='<option value="MM-dd">月-日</option>';
                                         str_chunk+='<option value="yyyy年MM月日">*年*月*日</option>';
                                         str_chunk+='</select></div>';
                                         str_chunk+='<a href="javascript:void(0);"  class="btn btn-success" id="chunk_submit">确定</a>&nbsp;&nbsp;';
                                         str_chunk+='&nbsp;&nbsp;<a href="javascript:void(0);"  class="btn btn-default" id="close_submit">关闭</a>';
                                         str_chunk+="</form>";
                                         div_chunk.html(str_chunk);
                                         $("#bag").html(div_chunk);
                                    }
                                  });
                                 
                            }
                        });
                     }else  if(operable.length==1 && operable[0] == "navbar"){
                         // add nav bar
                         $.ajax({   
                             url : ctxUrl+'/siteController/getSite.do?t='+Math.random()*1000,
                             type : 'POST',   
                             cache : false,
                             async : false,
                             error : function() {  
                                 alert('提示：链接异常，请检查网络！');
                             },
                             success : function(result) {
                                 var res = eval("("+result+")");
                                  var str_chunk ='';
                                 str_chunk ='<div style="width: 100%;float: left;background-color:  #0D679E;height: 25px;padding-top:5px"><span style="color: white;padding-left: 10px;font-size: 12px;font-family: Arial, sans-serif;float: left;">修改信息</span></div><br/><br/>';
                                   str_chunk+='<form id="form1">';
                                  str_chunk+='<div class="row_chunk">';
                                   str_chunk+='站点:';
                                   str_chunk+='<select id="site" name="site" onchange="changeSite()" >';
                                   for(var i=0;i<res.length;i++){
                                      str_chunk+='<option value="'+res[i].siteId+'">'+res[i].siteName+'</option>';
                                   }
                                   str_chunk+='</select>';
                                   str_chunk+='</div>';
                                   str_chunk+='<div class="row_chunk">';
                                   str_chunk+='栏目:';
                                   $.ajax({   
                                     url : ctxUrl+'/siteColumnController/getSiteColumn.do?t='+Math.random()*1000,
                                     type : 'POST',   
                                     cache : false,
                                     async : false,
                                     error : function() {  
                                         alert('提示：链接异常，请检查网络！');
                                     },
                                     data:{
                                         'siteId':res[0].siteId
                                     },
                                     success : function(date) {
                                         var dates = eval("("+date+")");
                                         str_chunk+='<select  id="siteColumn" name="siteColumn">';
                                         for(var i=0;i<dates.length;i++){
                                             str_chunk+='<option value="'+dates[i].columnId+'">'+dates[i].columnName+'</option>';
                                         }
                                          str_chunk+='</select>';
                                          str_chunk+='</div>';
                                          str_chunk+='<a href="javascript:void(0);"  class="btn btn-success" id="navbar_submit">确定</a>&nbsp;&nbsp;';
                                          str_chunk+='&nbsp;&nbsp;<a href="javascript:void(0);"  class="btn btn-default" id="close_submit">关闭</a>';
                                          str_chunk+="</form>";
                                          div_chunk.html(str_chunk);
                                          $("#bag").html(div_chunk);
                                     }
                                   });
                                  
                             }
                         });
                     }else  if(operable.length==1 && operable[0] == "imgchuck"){
                        $.ajax({   
                            url : ctxUrl+'/siteController/getSite.do?t='+Math.random()*1000,
                            type : 'POST',   
                            cache : false,
                            async : false,
                            error : function() {  
                                alert('提示：链接异常，请检查网络！');
                            },
                            success : function(result) {
                                var res = eval("("+result+")");
                                 var str_chunk ='';
                                str_chunk ='<div style="width: 100%;float: left;background-color:  #0D679E;height: 25px;padding-top:5px"><span style="color: white;padding-left: 10px;font-size: 12px;font-family: Arial, sans-serif;float: left;">修改信息</span></div><br/><br/>';
                                  str_chunk+='<form id="form1">';
                                 str_chunk+='<div class="row_chunk">';
                                  str_chunk+='站点:';
                                  str_chunk+='<select id="site" name="site" onchange="changeSite()" >';
                                  for(var i=0;i<res.length;i++){
                                     str_chunk+='<option value="'+res[i].siteId+'">'+res[i].siteName+'</option>';
                                  }
                                  str_chunk+='</select>';
                                  str_chunk+='</div>';
                                  str_chunk+='<div class="row_chunk">';
                                  str_chunk+='栏目:';
                                  $.ajax({   
                                    url : ctxUrl+'/siteColumnController/getSiteColumn.do?t='+Math.random()*1000,
                                    type : 'POST',   
                                    cache : false,
                                    async : false,
                                    error : function() {  
                                        alert('提示：链接异常，请检查网络！');
                                    },
                                    data:{
                                        'siteId':res[0].siteId
                                    },
                                    success : function(date) {
                                        var dates = eval("("+date+")");
                                        str_chunk+='<select  id="siteColumn" name="siteColumn">';
                                        for(var i=0;i<dates.length;i++){
                                            str_chunk+='<option value="'+dates[i].columnId+'">'+dates[i].columnName+'</option>';
                                        }
                                         str_chunk+='</select>';
                                         str_chunk+='</div>';
                                         str_chunk+='<div class="row_chunk">';
                                         str_chunk+='条数:';
                                         str_chunk+='<input type="text" style="width:220px" name="count" />';
                                         str_chunk+='</div>';
                                        str_chunk+='<div class="row_chunk">';
                                         str_chunk+='长度:';
                                         str_chunk+='<input type="text" style="width:220px" name="length" />';
                                         str_chunk+='</div>';
                                         str_chunk+='<a href="javascript:void(0);"  class="btn btn-success" id="imgchunk_submit">确定</a>&nbsp;&nbsp;';
                                         str_chunk+='&nbsp;&nbsp;<a href="javascript:void(0);"  class="btn btn-default" id="close_submit">关闭</a>';
                                         str_chunk+="</form>";
                                         div_chunk.html(str_chunk);
                                         $("#bag").html(div_chunk);
                                    }
                                  });
                                 
                            }
                        });
                     } else if(operable.length==1 && operable[0] == "flash"){
                         var flash_upload ='<div style="width: 100%;float: left;background-color:  #0D679E;height: 25px;padding-top:5px"><span style="color: white;padding-left: 10px;font-size: 12px;font-family: Arial, sans-serif;float: left;">修改信息</span></div><br/><br/>';
                         flash_upload += '<input type="file" name="attr" id="file_upload" />';
                         flash_upload+='<a href="javascript:void(0);" id="upload_link" >上传</a>';
                         flash_upload+='<br>宽度 (px):<input class="inp-config" type="text" id="flashWidth" />';
                         flash_upload+='<br>高度 (px):<input class="inp-config" type="text" id="flashHeight" />';
                         flash_upload+='<br><a href="javascript:void(0);"  class="btn btn-success" id="flash_upload">确定</a>&nbsp;&nbsp;';
                         flash_upload+='&nbsp;&nbsp;<a href="javascript:void(0);"  class="btn btn-default" id="close_submit">关闭</a>';
                         div_upload.html(flash_upload);
                         $("#bag").empty().append(div_upload);
                          
                         setTimeout(function (){
                             $("#upload_link").on('click',function(){
                                 $("#file_upload").uploadify('upload','*');
                             });
                             $('#file_upload').uploadify({
                                 'auto':false,
                                 'removeCompleted':false,
                                 'swf':ctxUrl+'/cmskj/js/uploadify/uploadify.swf',
                                 'buttonText': '<div>选择FLASH</div>',
                                 'uploader':ctxUrl+'/attachmentController/uploadReturnUrl.do',
                                 'onUploadSuccess': function(file,data,respone){
                                   /*  alert( 'id: ' + file.id
                                                   + ' - 索引: ' + file.index
                                                   + ' - 文件名: ' + file.name
                                                   + ' - 文件大小: ' + file.size
                                                   + ' - 类型: ' + file.type
                                                   + ' - 创建日期: ' + file.creationdate
                                                   + ' - 修改日期: ' + file.modificationdate
                                                   + ' - 文件状态: ' + file.filestatus
                                                   + ' - 服务器端消息: ' + data
                                                  );*/
                                     var res = eval("("+data+")");
                                     flash_url = res["url"];
                                 }
                             });
                         }, 500);
                     } else if(operable.length==1 && operable[0] == "upload"){
                    	 var str_upload ='<div style="width: 100%;float: left;background-color:  #0D679E;height: 25px;padding-top:5px"><span style="color: white;padding-left: 10px;font-size: 12px;font-family: Arial, sans-serif;float: left;">修改信息</span></div><br/><br/>';
	                         str_upload += '<input type="file" name="attr" id="file_upload" />';
	                         str_upload+='<a href="javascript:void(0);" id="upload_link" >上传</a>';
	                         str_upload+='<br>链接地址:<input class="inp-config" type="text" id="imgHref" />';
	                         str_upload+='<br>宽度 (px):<input class="inp-config" type="text" id="imgWidth" />';
	                         str_upload+='<br>高度 (px):<input class="inp-config" type="text" id="imgHeight" />';
	                         str_upload+='<a href="javascript:void(0);"  class="btn btn-success" id="str_upload">确定</a>&nbsp;&nbsp;';
	                         str_upload+='&nbsp;&nbsp;<a href="javascript:void(0);"  class="btn btn-default" id="close_submit">关闭</a>';
	                         div_upload.html(str_upload);
	                         $("#bag").html(div_upload);
                             setTimeout(function(){
                                 $("#upload_link").on('click',function(){
                                     $("#file_upload").uploadify('upload','*');
                                 });
                                 $('#file_upload').uploadify({
                                     'auto':false,
                                     'removeCompleted':false,
                                     'swf':ctxUrl+'/cmskj/js/uploadify/uploadify.swf',
                                     'buttonText': '<div>选择图片</div>',
                                     'uploader':ctxUrl+'/attachmentController/uploadReturnUrl.do',
                                     'onUploadSuccess': function(file,data,respone){
                                       /*  alert( 'id: ' + file.id
                                                       + ' - 索引: ' + file.index
                                                       + ' - 文件名: ' + file.name
                                                       + ' - 文件大小: ' + file.size
                                                       + ' - 类型: ' + file.type
                                                       + ' - 创建日期: ' + file.creationdate
                                                       + ' - 修改日期: ' + file.modificationdate
                                                       + ' - 文件状态: ' + file.filestatus
                                                       + ' - 服务器端消息: ' + data
                                                      );*/
                                         var res = eval("("+data+")");
                                         url_theme=res.url;
                                     }
                                 });
                             }, 500);
                        } else {
                         var str = "";
                         str ='<div style="width: 100%;float: left;background-color:  #0D679E;height: 25px;padding-top:5px"><span style="color: white;padding-left: 10px;font-size: 12px;font-family: Arial, sans-serif;float: left;">修改信息</span></div><br/><br/>';
                         for(var i =0;i<operable.length;i++){
                             if(operable[i] == "chunk"){
                                 continue;
                             }
                             str+="<div class='op-row'>";
                             str+="<label style='float:left;padding-left:5px' op_item="+operable[i]+">"+operable[i]+":</label>";
                             if(operable[i] == "text"){
                                 str+="<input type='text' class='normal-ipt' value='"+$(this).html()+"' />";
                             }else{
                                 str+="<input type='text' class='normal-ipt' value='"+$(this).attr(operable[i])+"' />";
                             }
                             str+="</div>";
                         }
                         str+="<a href='javascript:void(0);' class='btn btn-success' id='sure-btn'>确定</a>&nbsp;&nbsp;";
                         str+="&nbsp;&nbsp;<a href='javascript:void(0);' class='btn btn-default' id='close-btn'>关闭</a>";
                         div.html(str);
                         $("#bag").html(div);
                     }
                     if (operable.length==1 && operable[0] == "link_panel") {
                    	 alert("此元素不支持编辑操作");
                      	return false;
                     } else {
                    	 showBag();
                         showCover();
                     }
                     
                     function destroyUploadElement(){
                         alert('inDestroy main');
                         var oUpload = $('#file_upload');
                         if (oUpload) {
                             alert('hasUploadElement');
                             oUpload.uploadify('destroy');
                         } else {
                             alert('not upload');
                         }
                     }
                     $("#sure-btn").on("click",function(){
                         $("#temp-edit").find(".op-row").each(function(){
                             var attr = $(this).find("label").attr("op_item"),
                                 val = $(this).find("input").val();
                             if(attr == "text"){
                                 _self.op.targetElement.html(val);
                             }else{
                                 _self.op.targetElement.attr(attr,val);
                             }
                         });
                         hideBag();
                         hideCover();
                         return false;
                     });
                     $("#close-btn").on("click",function(){
                         hideBag();
                         hideCover();
                         return false;
                     });
                     $("#flash_upload").on("click",function(){
                         var oW = $('#flashWidth').val();
                         var oH = $('#flashHeight').val();
                         if(flash_url){
                             _self.op.targetElement.attr("flash_url", flash_url);
                         }
                         if (!isNaN(oW) && !isNaN(oH)) {
                             var subfix = 'width:'+oW + 'px;height:' + oH + 'px;line-height:' + oH + 'px';
                             _self.op.targetElement.attr({
                                 style : "background:#FFAA00;text-align:center;" + subfix
                             });
                         }
                         destroyUploadElement();
                         hideBag();
                         hideCover();
                         return false;
                     });
                     
                     $("#str_upload").on("click",function(){
                         var oW = $('#imgWidth').val();
                         var oH = $('#imgHeight').val();
                         var sHref = $('#imgHref').val();
                         if (url_theme) {
                        	 _self.op.targetElement.css("background-image","url(/"+url_theme+")");
                         }
                         if (oW && oH) {
                        	 _self.op.targetElement.css({
                                 'background-size' : oW + 'px ' + oH + 'px'
                             });
                         }
                         
                         if (sHref) {
							  var srcElem = _self.op.targetElement.parent().html();
							  var oA = $("<a operable='imguri' href="+sHref+"></a>");
							  oA.append(srcElem);
							  _self.op.targetElement.replaceWith(oA);
                         }
                         destroyUploadElement();
                         hideBag();
                         hideCover();
                         return false;
                     });
                     $("#close_submit").on("click",function(){
                         destroyUploadElement();
                         hideBag();
                         hideCover();
                         return false;
                     });
                     $("#chunk_submit").on("click",function(){
                        $('#form1').form('submit',{
                            url:ctxUrl+'/modelController/getColumnHtml.do?t='+Math.random()*1000,
                            onSubmit: function(){
                                return $(this).form('validate');
                            },success: function(data){
                                var res = eval("("+data+")");
                                var target = $(_self.op.targetElement);
                                var k = [];
                                for(var n in res){
                                    if(res[n]==""){
                                        alert("不能为空");
                                    }else{
                                        if(n=='more'){
                                            $("[desc="+n+"]",target).attr('href',res[n]);
                                        }else{
                                            if (n == "content" || n == "contentShow") {
                                               if (n == "content") {
                                                   $("[desc="+n+"]",target).html(HTMLUnescape(res[n]));
                                                   $(target).attr("desc_ext",HTMLUnescape(res[n]));
                                               } else {
                                                   $("[desc="+n+"]",target).html(HTMLUnescape(res[n]));
                                               }
                                            } else {
                                                //title
                                                $("[desc="+n+"]",target).html(HTMLUnescape(res[n]));
                                            }
                                            
                                        }                                       
                                    }
                                }
                                // _self.op.targetElement.html(data);
                                 hideBag();
                                 hideCover();
                                 return false;
                            }
                        });
                     });
                     $("#navbar_submit").on("click",function(){
                         $('#form1').form('submit',{
                             url:ctxUrl+'/modelController/getNavBarHtml.do?t='+Math.random()*1000,
                             onSubmit: function(){
                                 return $(this).form('validate');
                             },success: function(data){
                                 var res = eval("("+data+")")[0];
                                 var target = $(_self.op.targetElement);
                                 for(var n in res){
                                     if(n=='more'){
                                         $(target).attr('href',res[n]);
                                     }else{
                                    	 //title
                                    	 $(target).html(res[n]);
                                     }
                                 }
                                  // _self.op.targetElement.html(data);
                                   hideBag();
                                   hideCover();
                                     $("[desc=content]",target).attr('style',"");
                                   return false;
                             }
                         });
                       });
                     $("#imgchunk_submit").on("click",function(){
                        $('#form1').form('submit',{
                            url:ctxUrl+'/modelController/getColumnImgHtml.do?t='+Math.random()*1000,
                            onSubmit: function(){
                                return $(this).form('validate');
                            },success: function(data){
                                var res = eval("("+data+")");
                                var target = $(_self.op.targetElement);
                                $("#ft-buttons-gallery",target).remove();
                                
                                for(var n in res){
                                    if(n=='more'){
                                        $("[desc="+n+"]",target).attr('href',res[n]);
                                    }else{
                                        $("[desc="+n+"]",target).html(res[n]);
                                    }
                                }
                                 // _self.op.targetElement.html(data);
                                  hideBag();
                                  hideCover();
                                    $("[desc=content]",target).attr('style',"");
                                  return false;
                            }
                        });
                      });
                     return false;
                }},{
            	 text : '添加',
            	 func : function (){
                	_self.op.targetElement = $(this);
                    var operable = $(this).attr("operable").split(",");
                    var div = $("<div id='temp-edit'></div>");
                    //目前只支持link_panel的添加操作
                    
                    if (operable.length == 1 && operable[0] == 'link_panel') {
                    	var str = "";
                        str ='<div style="width: 100%;float: left;background-color:  #0D679E;height: 25px;padding-top:5px"><span style="color: white;padding-left: 10px;font-size: 12px;font-family: Arial, sans-serif;float: left;">修改信息</span></div><br/><br/>';
                        str+="<h5>添加链接</h5>";
                        str+="<div class='op-row'>";
                        str+="<label style='float:left;padding-left:5px' op_item='text'>text:</label>";
                        str+="<input type='text' class='normal-ipt' value='' />";
                        str+="</div>";
                        str+="<div class='op-row'>";
                        str+="<label style='float:left;padding-left:5px' op_item='href'>link:</label>";
                        str+="<input type='text' class='normal-ipt' value='' />";
                        str+="</div>";
                        str+="<a href='javascript:void(0);' class='btn btn-success' id='append-link-btn'>确定</a>&nbsp;&nbsp;";
                        str+="&nbsp;&nbsp;<a href='javascript:void(0);' class='btn btn-default' id='close-btn'>关闭</a>";
                        div.html(str);
                        $("#bag").html(div);
                        showBag();
                        showCover();
                    } else {
                    	alert('此元素不支持添加操作');
                    	$.smartMenu.hide();
                    }
                    
                    $("#append-link-btn").on("click",function(){
                    	var oA = $("<a operable='text,href'></a>");
                        $("#temp-edit").find(".op-row").each(function(){
                            var attr = $(this).find("label").attr("op_item"),
                                val = $(this).find("input").val()
                            if(attr == "text"){
                            	oA.text(val);
                            }else{
                                oA.attr(attr,val);
                            }
                        });
                        var oSpan = $("<span class='link_item' operable='link_item'></span>");
                        oSpan.append(oA);
                        _self.op.targetElement.append(oSpan);
                        oA.smartMenu(MenuData,{
                            offsetX:10,
                            offsetY:10
                        });
                        hideBag();
                        hideCover();
                        return false;
                    });
                    
                    $("#close-btn").on("click",function(){
                        hideBag();
                        hideCover();
                        return false;
                    });
             	}
             },{
            	 text : '删除',
            	 func : function (ev){
                	_self.op.targetElement = $(this);
                    var operable = $(this).attr("operable").split(",");
                    //目前只支持link_item的删除操作
                    if (operable.length == 1 && operable[0] == 'link_item') {
                    	_self.op.targetElement.remove();
                    } else if(operable.length == 2 && operable[0] == 'text' && operable[1] == 'href'){
                    	if (confirm("确认要删除这个元素?")) {
                    		_self.op.targetElement.parent().remove();
                    	}
                    } else {
                    	alert('此元素不支持删除操作');
                    	console.log("inMain");
                    	console.log(operable);
                    }
             	}
             }]];
                
                params.id = generatorId(params.control);
                WidgetController.add(target, nextid, params, function (json) {
                    document.getElementById("themeframe").contentWindow.Replace(loading, json);
                    loading.remove();
                    
                    var bd = $("#themeframe").contents().find("body");
                    bd.find("a").each(function (){
                        var txt = $(this).html();
                        if (txt == "编辑" || txt == '删除') {
                            // do nothing
                        } else {
                            $(this).bind('click', function(event){
                                event.preventDefault();
                            });
                        }
                    });
                    bd.find("*[operable]").each(function (){
                        $(this).smartMenu(MenuData,{
                            offsetX:10,
                            offsetY:10
                        });
                    });
                    
                    $(doc).on('click', function (){
                        $.smartMenu.hide();
                    });
                    
                    document.getElementById("themeframe").contentWindow.refresh();
                }, function (XMLHttpRequest, textStatus, errorThrown) {
                    //错误处理
                    loading.remove();
                    alert(textStatus);
                });
            }
        }
    });
});
//iframe 自适应高度

function resizeContent() {
//   $("#themeframe").height($("#themeframe").contents().height() + 20);
}

/**部件添加修改***/
var WidgetController = {
    /**
     **添加
     */
    add: function (target, nextid, params, callback, error) {
        var attributes = jsonToString(params);
        attributes = StringUtil.Base64Encode(attributes);
        $.ajax(
            {
                async: true,
                type: "POST",
                url:params.filename,
                dataType: "json",
                data: { "params": attributes },
                error: function (XMLHttpRequest, textStatus, errorThrown) { error(XMLHttpRequest, textStatus, errorThrown); },
                success: function (json) {
                    var css = json.css;
                    //获取当前iframe下的link和script
                    var head = document.getElementById("themeframe").contentWindow.document.getElementsByTagName('head').item(0);
                    var link = head.getElementsByTagName("link");
                    var script = head.getElementsByTagName("script");
                    if(css!=null){
                        var csses = css.split(",");
                        
                        for(var i=0,len=csses.length;i<len;i++){
                            if(csses[i].substring(csses[i].length-3,csses[i].length)==".js"){
                                //判断是不是js文件的引用
                                for (var j in script) {
                                    if (script[j].getAttribute) {
                                        if (script[j].getAttribute("src") == csses[i]) {
                                            head.removeChild(script[j]);
                                            break;
                                        }
                                    }
                                }
                              //引用外部script, 过滤jquery
                              var jqReg = /\/jquery(-\d*)+\S*js$/g;
                              if (!jqReg.test(csses[i])) {
                                  var scripts = document.createElement('script');
                                  scripts.src = csses[i];
                                  scripts.type = 'text/javascript';
                                  head.appendChild(scripts);
                              }
                            }else{
                              
                              //css样式表
                              for (var j in link) {
                                    if (link[j].getAttribute) {
                                        if (link[j].getAttribute("href") == csses[i]) {
                                            head.removeChild(link[j]);
                                            break;
                                        }
                                    }
                                }
                              var csss = document.createElement('link');
                                csss.href = csses[i];
                                csss.rel = 'stylesheet';
                                csss.type = 'text/css';
                                head.appendChild(csss);
                            }
                        }
                    }
                    //进行处理
                	callback(json.html);
                }
            });
    }
    , edit: function (data) {
     /*   tempControlid = data.atts.id;

        builder.showBuilder(data.atts.filename, file, folder, data.atts);*/
    },
    editapp: function (data) {
      /*  tempControlid = data.id;
        console.log(data);
        var div = AddMask($("#pageframe").contents().find("#" + tempControlid + "_widget"));
        var attributes = StringUtil.Base64Encode(jsonToString(data));
        $.ajax(
            {
                async: true,
                error: function (XMLHttpRequest, textStatus, errorThrown) { alert(textStatus); div.remove(); },
                type: "POST",
                url: "/Admin/VisualTemplate/RenderWidget.aspx?action=edit&file=" + file + "&original=" + tempControlid + "&folder=" + folder + "&virtualdata=" + virtualdata + "&state=design1", //&params=" + attributes,
                data: { "params": attributes },
                dataType: "text",
                success: function (json) {
                    var cssClass = data.filename.substr(data.filename.lastIndexOf("/") + 1);
                    cssClass = cssClass.substr(0, cssClass.lastIndexOf("."));
                    var style = data.filename.substr(0, data.filename.lastIndexOf("/")) + "/Style/" + cssClass + ".css";
                    var head = document.getElementById("pageframe").contentWindow.document.getElementsByTagName('head').item(0);
                    var link = head.getElementsByTagName("link");
                    for (var i in link) {
                        if (link[i].getAttribute) {
                            if (link[i].getAttribute("href") == style) {
                                head.removeChild(link[i]);
                                break;
                            }
                        }
                    }
                    var css = document.createElement('link');
                    css.href = style + "?" + Math.random();
                    css.rel = 'stylesheet';
                    css.type = 'text/css';
                    head.appendChild(css);
                    //进行处理
                    document.getElementById("pageframe").contentWindow.Replace($("#pageframe").contents().find("#" + tempControlid + "_widget"), json);
                    console.log("tempControlid:" + tempControlid);
                    document.getElementById("pageframe").contentWindow.refresh();
                    div.remove();
                }
            });*/
    },
    previewapp: function (data) {
      /*  tempControlid = data.id;
        var div = AddMask($("#pageframe").contents().find("#" + tempControlid + "_widget"));
        var attributes = StringUtil.Base64Encode(jsonToString(data));
        data.filename=data.filename.replace("tempwidget", "");
        $.ajax(
            {
                async: true,
                error: function (XMLHttpRequest, textStatus, errorThrown) { alert(textStatus); div.remove(); },
                type: "POST",
                url: "/Admin/VisualTemplate/RenderWidget.aspx?action=preview&file=" + file + "&original=" + tempControlid + "&folder=" + folder + "&virtualdata=" + virtualdata + "&state=design1", //&params=" + attributes,
                data: { "params": attributes },
                dataType: "text",
                success: function (json) {
                    var cssClass = data.filename.substr(data.filename.lastIndexOf("/") + 1);
                    cssClass = cssClass.substr(0, cssClass.lastIndexOf("."));
                    var style = data.filename.substr(0, data.filename.lastIndexOf("/")) + "/Style/" + cssClass + ".css";
                    var head = document.getElementById("pageframe").contentWindow.document.getElementsByTagName('head').item(0);
                    var link = head.getElementsByTagName("link");
                    for (var i in link) {
                        if (link[i].getAttribute) {
                            if (link[i].getAttribute("href") == style) {
                                head.removeChild(link[i]);
                                break;
                            }
                        }
                    }
                    var css = document.createElement('link');
                    css.href = style + "?" + Math.random();
                    css.rel = 'stylesheet';
                    css.type = 'text/css';
                    head.appendChild(css);
                    //进行处理
                    document.getElementById("pageframe").contentWindow.Replace($("#pageframe").contents().find("#" + tempControlid + "_widget"), json);
                    console.log("tempControlid:" + tempControlid);
                    document.getElementById("pageframe").contentWindow.refresh();

                    div.remove();
                }
            });*/
    },
    editwrapper: function (data) {
      /*  tempControlid = data.data.atts.id;
        var div = AddMask($("#pageframe").contents().find("#" + tempControlid + "_widget"));

        var attributes = StringUtil.Base64Encode(jsonToString(data.data.atts));
        $.ajax(
            {
                async: true,
                error: function (XMLHttpRequest, textStatus, errorThrown) { alert(textStatus); div.remove(); },
                type: "POST",
                url: "/Admin/VisualTemplate/RenderWidget.aspx?action=edit&file=" + file + "&original=" + tempControlid + "&folder=" + folder + "&virtualdata=" + virtualdata + "&state=design1", //&params=" + attributes,
                data: { "params": attributes },
                dataType: "text",
                success: function (json) {
                    //进行处理

                    document.getElementById("pageframe").contentWindow.Replace($("#pageframe").contents().find("#" + tempControlid + "_widget"), json);

                    document.getElementById("pageframe").contentWindow.refresh();

                    div.remove();
                }
            });*/
    }
};
function MoveWidget(target, id, nextid) {
//    $.ajax(
//        {
//            async: true,
//            type: "POST",
//            url: "/Admin/VisualTemplate/WidgetAjaxService.ashx?action=move&target=" + target + "&nextid=" + nextid + "&file=" + file + "&folder=" + folder + "&id=" + id,
//            dataType: "json",
//            success: function (json) {
//                if (json.Success) {
//                }
//                else {
//                    alert(json.Message);
//                }
//            }
//        });
}
//删除Wideget以及layout
function DeleteWidget(id) {
    maskShow();
    var c = confirm("你确定要删除么?");
    if (!c) {
    	maskHide();
        return;
    }
    //添加遮罩
    $("#" + frameName).contents().find("#" + id + "_widget").remove();
    var win = document.getElementById("themeframe").contentWindow;
    win.refresh();
    maskHide();
}

function EditWidgetCode(id) {
    var iframe = window.parent.document.getElementById("editorFrame");
    //dialog= show_by_url('新增站点','widgetEditor.do?id='+id+'_widget&t='+Math.random()*1000,'500','300');
    iframe.src = "../modelController/widgetEditor.do?id="+id+"_widget";
    window.parent.maskShow();
    $(iframe).parents("#editorwrap").show();
}
function maskShow(){
    var doc_H = $(document).height();
    var doc_W = $(document).width();
    $("#mask").height(doc_H);
    $("#mask").height(doc_W);
    $("#mask").show();
}
function maskHide(){
    $("#mask").hide();
    scrollTo(0,0);
}
//关闭编辑框
$(document).on("click","#editor-close",function(){
    $(this).parents("#editorwrap").hide();
    $(this).parents("#editorwrap").find("iframe").attr("src","");
})

function pageEdit (frameId) {
    if (!frameId)frameId = "themeframe";
    $("#" + frameId).contents().find("body").removeClass("zeLayoutMode").addClass("zeContentMode");
}

function layoutEdit (frameId) {
    if (!frameId)frameId = "themeframe";
    $("#" + frameId).contents().find("body").removeClass("zeContentMode").addClass("zeLayoutMode");
}


function DragNewWidget(options) {

    var Me = this,
        _default = {
            placeholder:"placehodler" ,     //占位符CLASS
            frame:"themeframe",       //frame的id
            dragWidget:".badge",
            helper:function(){return $('<div class="helper" style="height:20px; width:150px; z-index:100000;background-color:#A00;color:Yellow; border:solid 1px Yellow; text-align:center">请拖动到指定区域</div>');},
            columns: ".RadDockZone",         //可拖拽的列
            items: ">.RadDock",
            fixDragArea : "bodyplaceholder"
        };
    //合并参数
    //this.options = $.extend({}, this.defaultOptions, options);
    this.options = $.extend({}, _default, options);
    this.frame = this.options.frame;
    this.columns = this.options.columns;
    this.items = this.options.items;
    //操作placeholder
    var _createPlaceholder = function () {
        $("#" + Me.frame).contents().find("body").append('<div style="border:dashed 1px gray;background-color:#FFFF00;width:100%;height:20px;" class="' + Me.options.placeholder + '"></div>');
    };

    var _getPlaceholder = function () { return $("#" + Me.frame).contents().find("." + Me.options.placeholder); };

    var _deletePlaceholder = function () { $("#" + Me.frame).contents().find("." + Me.options.placeholder).remove(); };

    //计算鼠标是否在iframe中
    var _hoverFrame = function (event) {
        var pageX = event.pageX;
        var pageY = event.pageY;
        var left = $("#" + Me.frame).offset().left;
        var top = $("#" + Me.frame).offset().top;
        var width = $("#" + Me.frame).outerWidth();
        var height = $("#" + Me.frame).outerHeight();

        if (pageX >= left && pageX <= left + width && pageY >= top && pageY <= top + height) {
            return true;
        }
        else {
            return false;
        }
    };
    //计算鼠标是否在中容器中
    var checkMouseOver = function (event, column) {

        var pageX = event.pageX - $("#" + Me.frame).offset().left;
        var pageY = event.pageY - $("#" + Me.frame).offset().top;
        var left = $(column).offset().left;
        var top = $(column).offset().top;
        var width = $(column).outerWidth();
        var height = $(column).outerHeight();

        if (pageX >= left && pageX <= left + width && pageY >= top && pageY <= top + height) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     *检查鼠标在DOM元素的上半还是下半还是不在
     *@返回1表示在上，2在下，0则不在
     */
    var getAbsolutePosition = function (element) {
        element = $(element).get(0);
        var r = { x: element.offsetLeft, y: element.offsetTop };

        if (element.offsetParent) {
            var tmp = getAbsolutePosition(element.offsetParent);
            r.x += tmp.x;
            r.y += tmp.y;
        }
        return r;
    };
    var checkElement = function (event, element) {

        var pageY = event.pageY-$("#"+Me.frame).offset().top;
        var height = $(element).outerHeight();
        var top = $(element).offset().top;

        if (pageY >= top && pageY <= top + height) {

            if (pageY <= top + (height / 2)) {
                return 1;
            }
            else {
                return 2;
            }
        } else {
            if (pageY < top) {
                return -1;
            }
            else {
                return 0;
            }
        }
    }

    this.refresh = function() {
        $(Me.options.dragWidget).draggable({
            iframeFix: true,
            revert: 'invalid',
            cursor: "move",
            //containment:"document",
            appendTo: "body",
            helper: Me.options.helper,
            start: function(event, ui) {

            },
            drag: function(event, ui) {

                ui.item = this;
                //1.判断鼠标是否在iframe中,如果在则添加占位符
                if (_hoverFrame(event)) {

                    //2.计算在哪个列中
                    //1.遍历所有容器,查看鼠标中心位于哪个column中,可以为套嵌

                    var cols = $("#" + Me.frame).contents().find(Me.columns);
                    var overCols = [];
                    var hoverCol = null;
                    //获取鼠标
                    for (var i = 0, len = cols.length; i < len; i++) {
                        if ($(cols[i]).attr("id") == Me.options.fixDragArea) {
                            continue;
                        }
                        var hover = checkMouseOver(event, cols[i]);
                        if (hover) {
                            //在容器中
                            overCols.push(cols[i]);
                        }
                    }
                    //2.可能为套嵌容器,判断最终在哪个容器:哪个比较高度比较低就在该上
                    var tempHeight = 1000000; //一个比较大的值 用于初始比较

                    for (var i = 0, len = overCols.length; i < len; i++) {
                        //比较
                        if ($(overCols[i]).outerHeight() < tempHeight) {
                            hoverCol = overCols[i];
                            tempHeight = $(overCols[i]).outerHeight();
                        }
                    }

                    if (hoverCol != null) {

                        //4.判断在哪个节点
                        var currentNode = null;
                        var postion = 0;
                        var children = $(Me.items, hoverCol);
                        for (var i = 0, len = children.length; i < len; i++) {
                            var p = checkElement(event, children[i]);
                            if (p > 0) {
                                currentNode = children[i];
                                postion = p;
                                break;
                            }
                        }

                        if (_getPlaceholder().size() == 0) {
                            //创建
                            _createPlaceholder();
                        }
                        
                        var placeholder = _getPlaceholder();
                        if (currentNode != null) {
                            if (postion == 1) {
                                $(placeholder).insertBefore(currentNode);
                            } else if (postion == 2) {
                                $(placeholder).insertAfter(currentNode);
                            } else {
                                $(placeholder).insertAfter(currentNode);
                            }
                        } else {
                            placeholder.appendTo(hoverCol);
                        }
                    }
                } else {
                    //不在区域内则删除占位符
                    $(_getPlaceholder()).remove();//.remove();
                }
            },
            stop: function(event, ui) {
                ui.item = this;

                if ($(_getPlaceholder()).size() > 0) {

                    //                    //存在占位符
                    ui.placeholder = $(_getPlaceholder());
                    Me.options.add(event, ui);
                    
                }
            }
        });
    };
    this.refresh();
    return this;
}
//动态增加站点的栏目xinxi
function changeSite() {
    $.ajax({
        url : ctxUrl+'/siteColumnController/getSiteColumn.do?t='
                + Math.random() * 1000,
        type : 'POST',
        cache : false,
        async : false,
        error : function() {
            alert('提示：链接异常，请检查网络！');
        },
        data : {
            'siteId' : $("#site").val()
        },
        success : function(date) {
            var dates = eval("(" + date + ")");
            var selectColumn = document.getElementById("siteColumn");
            selectColumn.options.length = 0;
            for ( var i = 0; i < dates.length; i++) {
                selectColumn.add(new Option(dates[i].columnName,
                        dates[i].columnId));
            }
        }
    });
}
function throttle (obj, fn) {
    clearTimeout(obj.tId);
    obj.tId = setTimeout(function (){
        fn && fn();
    }, 2000);
}