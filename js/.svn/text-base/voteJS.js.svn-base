(function ($){
    var forms = $('.vote-form');
    if (forms.length) {
        forms.each(function (){
            var formId = $(this).attr('id');
            //bind events;
            var aRadios = $(this).find('div.rd');
            if (aRadios.length) {
                aRadios.on('click', 'input[type=radio]', function (){
                    if ($(this).prop('checked')) {
                        $(this).siblings().prop('checked', false);
                    }
                });
            }
            $(this).find('button.btn-primary').on('click', function (){
                saveResult(formId);
            });
        });
    }
    
    
    function saveResult(formId, uriPrefix){
        uriPrefix = uriPrefix || "";
        var myform = $("#" + formId),
            singleArray = [],
            aSingleIds = myform.find('input[name=aa]'),
            oQuestions = myform.find('input[name=cc]');
        
        aSingleIds.each(function (){
            singleArray.push($(this).val());
        });
        oQuestions.val(singleArray.join(','));

        if (myform.attr('uriPrefix')) {
            uriPrefix = myform.attr('uriPrefix');
        }
        $('#' + formId).form('submit',{
            url: uriPrefix + "/interactiveController/saveInteractiveResult.do",
            onSubmit: function(){
                return $(this).form('validate');
            },success: function(result){
                var res = $.parseJSON(result);
                if(res.success){
                    alert('提交成功');
                }else{
                    var data = res.error;
                    if(data == "nochoose"){
                        alert('对不起，您未作任何操作！');
                    } else if(data == "ipnotin"){
                        alert('对不起，您的IP不在参与范围中！');
                    } else if(data == "gologin"){
                        alert('对不起，请登录！');
                    } else if(data == "already"){
                        alert('对不起，你已经参与调查，无法重复提交！');
                    } else if(data == "success"){
                        alert('操作成功，感谢您的参与！');
                    } else{
                        alert('操作失败！');
                    }
                }
            }
        });
    };
})(jQuery);