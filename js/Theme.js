/**
 * Created by Administrator on 14-10-23.
 */
(function(root,$){
    function Theme(){
        return new _Theme().init(arguments[0]);
    }
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
     function createIframe (url, type) {
         var themeDiv = document.getElementById('theme_div');
         themeDiv.innerHTML = "";
         var ii = document.createElement("iframe");
         themeDiv.appendChild(ii);
         ii.id = "themeframe";
         ii.src = url;
         ii.width = "100%";
         ii.height = "100%";
         ii.frameborder = "0";
         ii.scrolling = "yes";
         ii.style.padding = "0 0 40px 0";
         
         var win_h = $(document).height();
         $(".main").css("min-height", win_h - 51);
         $("#theme_div").css("height", win_h - 51);
         maskShow();
         var IframeOnload = function(){
             doc = $(document.getElementById('themeframe')).contents().find("body").parent();
             cx=cy=0;
             $(doc).on("mousemove",function(e){
                 e=e||window.event;
                 cx=e.clientX;
                 cy=e.clientY-$("#theme_div").scrollTop();                            
             });
             var smart = {};
             var MenuData = [[{
                 text:"编辑",
                 func:function(){
                  smart.targetElement = $(this);
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
                                      str_chunk+='<option value=""></option>';
                                      str_chunk+='<option value="yyyy-MM-dd">2014-01-01</option>';
                                      str_chunk+='<option value="MM-dd">01-01</option>';
                                      str_chunk+='<option value="yyyy年MM月dd日">2014年01月01日</option>';
                                      str_chunk+='<option value="yyyyMMdd">20140101</option>';
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
                  } else  if(operable.length==1 && operable[0] == "navbar"){
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
                              
                              var res = JSON.parse(result);
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
                	  var flash_upload ='<div style="width: 100%;float: left;background-color:#0D679E;height: 25px;padding-top:5px"><span style="color: white;padding-left: 10px;font-size: 12px;font-family: Arial, sans-serif;float: left;">修改信息</span></div><br/><br/>';
                      flash_upload += '<input type="file" name="attr" id="file_upload" />';
                      flash_upload+='<a href="javascript:void(0);" id="upload_link" >上传</a>';
                      flash_upload+='<br>宽度 (px):<input type="text" class="inp-config" id="flashWidth" />';
                      flash_upload+='<br>高度 (px):<input type="text" class="inp-config" id="flashHeight" />';
                      flash_upload+='<br><a href="javascript:void(0);"  class="btn btn-success" id="flash_upload">确定</a>&nbsp;&nbsp;';
                      flash_upload+='&nbsp;&nbsp;<a href="javascript:void(0);"  class="btn btn-default" id="close_submit">关闭</a>';
                      div_upload.html(flash_upload);
                      $("#bag").html(div_upload);
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
                  } else if(operable.length==1 && operable[0] == "upload"){
                         var str_upload ='<div style="width: 100%;float: left;background-color:  #0D679E;height: 25px;padding-top:5px"><span style="color: white;padding-left: 10px;font-size: 12px;font-family: Arial, sans-serif;float: left;">修改信息</span></div><br/><br/>';
                         str_upload += '<input type="file" name="attr" id="file_upload" />';
                         str_upload+='<a href="javascript:void(0);" id="upload_link" >上传</a>';
                         str_upload+='<br>链接地址:<input class="inp-config" type="text" id="imgHref" />';
                         str_upload+='<br>宽度 (px):<input class="inp-config" type="text" id="imgWidth" />';
                         str_upload+='<br>高度 (px):<input class="inp-config" type="text" id="imgHeight" />';
                         str_upload+='<br><a href="javascript:void(0);"  class="btn btn-success" id="str_upload">确定</a>&nbsp;&nbsp;';
                         str_upload+='&nbsp;&nbsp;<a href="javascript:void(0);"  class="btn btn-default" id="close_submit">关闭</a>';
                         div_upload.html(str_upload);
                         $("#bag").html(div_upload);
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
                     } else{
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
                      alert('inDestroy theme');
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
                              smart.targetElement.html(val);
                          }else{
                              smart.targetElement.attr(attr,val);
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
                      if (flash_url) {
                          smart.targetElement.attr("flash_url", flash_url);
                      }
                      if (!isNaN(oW) && !isNaN(oH)) {
                          var subfix = 'width:'+oW + 'px;height:' + oH + 'px;line-height:' + oH + 'px';
                          smart.targetElement.attr({
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
                    	  smart.targetElement.css("background-image","url(/"+url_theme+")");
                      }
                      if (oW && oH) {
                          smart.targetElement.css({
                              'background-size' : oW + 'px ' + oH + 'px'
                          });
                      }
                      if (sHref) {
                    	  var srcElem = smart.targetElement.parent().html();
                    	  var oA = $("<a operable='imguri' href="+sHref+"></a>");
                    	  oA.append(srcElem);
                    	  smart.targetElement.replaceWith(oA);
                      }
                      destroyUploadElement();
                      hideBag();
                      hideCover();
                      return false;
                  });
                  $("#close_upload").on("click",function(){
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
                             var res = eval("("+data+")")[0];
                             var target = $(smart.targetElement);
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
                              var target = $(smart.targetElement);
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
                             var target = $(smart.targetElement);
                             $("#ft-buttons-gallery",target).remove();
                             for(var n in res){
                                 if(n=='more'){
                                     $("[desc="+n+"]",target).attr('href',res[n]);
                                 }else{
                                     $("[desc="+n+"]",target).html(res[n]);
                                 }
                             }
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
            	 	smart.targetElement = $(this);
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
                        smart.targetElement.append(oSpan);
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
            	 func : function (){
            	 	smart.targetElement = $(this);
                    var operable = $(this).attr("operable").split(",");
                    //目前只支持link_item的删除操作
                    if (operable.length == 1 && operable[0] == 'link_item') {
                    	smart.targetElement.remove();
                    } else if(operable.length == 2 && operable[0] == 'text' && operable[1] == 'href'){
                    	if (confirm("确认要删除这个元素?")) {
                    		smart.targetElement.parent().remove();
                    	}
                    } else {
                    	alert('此元素不支持删除操作');
                    	console.log("Theme");
                    	console.log(operable);
                    }
             	}
             }]];
             $(doc).find("a").each(function (){
                 var txt = $(this).html();
                 if (txt == "编辑" || txt == '删除') {
                     // do nothing
                 } else {
                     $(this).on('click', function(event){
                         event.preventDefault();
                     });
                 }
             });
             
             $(doc).find("*[operable]").each(function (){
            	 $(this).smartMenu(MenuData,{
                     offsetX:10,
                     offsetY:10
                 });
             });
             $(doc).on('click', function (){
                 $.smartMenu.hide();
             });
             
             maskHide();
         }
         
         
         
         //maskShow();
         if (ii.attachEvent) {
             //IE
             ii.attachEvent("onload", IframeOnload);
         } else if (ii.addEventListener){
             ii.addEventListener("load", IframeOnload);
         } else {
             ii.onload = IframeOnload;
         }
     }
    
    var url_theme="";
    var flash_url = "";
    function _Theme(me){
        return me={
            init:function(opt){
                var _default = {
                    iframe:'themeframe',
                    page:'theme/moban1/index.html',
                    type: 2
                };
                this.op = _.extend({},_default,opt);
                this.bindIframe();
            },
            bindIframe:function(){
                createIframe(this.op.page, this.op.type);
            }
        };
    }
    root.Theme = Theme;
    
    
    function parseTxt(str){
        return str.replace(/\\/g, "\\\\")
                  .replace(/\r/g, "\\r")
                  .replace(/\n/g, "\\n");
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
        document.getElementById("themeframe").contentWindow.refresh();
        maskHide();
    }
    
    function EditWidgetCode(id) {
            var iframe = window.parent.document.getElementById("editorFrame");
            //dialog= show_by_url('新增站点','widgetEditor.do?id='+id+'_widget&t='+Math.random()*1000,'500','300');
            iframe.setAttribute("src","../modelController/widgetEditor.do?id="+id+"_widget");
            window.parent.maskShow();
            $(iframe).parents("#editorwrap").show();
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
}(window,jQuery));