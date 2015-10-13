/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-24 11:15:10
 * @version $Id$
 */
(function (){
    $.fn.dragModal = function (options){
        var opts = $.extend({}, $.fn.dragModal.defaults, options);
        var dmList = [];
        this.each(function (i, cont){
            var DM = {
               handler : null,
               modal : null,
               init : function (){
                   var handler = DM.handler = $(opts.handler);
                   DM.modal = $(opts.modalId);
                   handler.on('mousedown', DM.start);
               },
               uninit : function (){
                   //Drag.end();
               },
               start : function (ev){
                   var handler = DM.handler;
                   var modal = DM.modal;
                   var mouseX = ev.pageX;
                   var mouseY = ev.pageY;
                   
                   var fixW = modal.width()/2;
                   var disX = mouseX - modal.offset().left - fixW;
                   var disY = mouseY - modal.offset().top;
                   $(modal).css({
                       position : "absolute"
                   });
                   $(handler).data('disX', disX);
                   $(handler).data('disY', disY);
                   $(document).on('mousemove', DM.drag);
                   $(document).on('mouseup', DM.end);
                   return false;
               },
               drag : function (ev){
                   var handler = DM.handler;
                   var modal = DM.modal;
                   var currentX = ev.pageX;
                   var currentY = ev.pageY;
                   var incX = currentX - handler.data('disX');
                   var incY = currentY - handler.data('disY');
                   if (incY < 0)
                       incY = 0;
                   modal.css({
                       top : incY + 'px',
                       left : incX + 'px'
                   });
                   return false;
               },
               end : function (ev){
                   $(document).off('mousemove');
                   $(document).off('mouseup');
                   return false;
               }
            };
            
            DM.init.call(this);
            dmList.push(DM);
        });
        return this;
    };
    
    $.fn.dragModal.defaults = {
         handler : ".dragModal-ui-header",
         modalId : "#configModal"
    };
})(jQuery);