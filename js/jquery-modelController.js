/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-18 09:43:12
 * @version $Id$
 */
 /*
 * This controller is used for adding widget into layout wrapper
 */
 var WidgetController = {
 	add : function (target, nextid, params, callback, error){
 		var attributes = jsonToString(params);
 		attributes = StringUtil.Base64Encode(attributes);
 		$.ajax({
 			async : true,
 			type : "POST",
 			url : params.filename, 
 			dataType : "JSON",
 			data : {"params": attributes},
 			error : function (XMLHttpRequest, textStatus, errorThrown){
 				if (error && $.isFunction(error)) {
 					error(XMLHttpRequest, textStatus, errorThrown);
 				}
 			},
 			success : function (json){
 				if (typeof json != 'undefined') {
 					// Fix styles and scripts
 					// Not implement yet 2015/4/19

 					if (callback && $.isFunction(callback)) {
	 					callback(json.html);
	 				}
 				}
 			}
 		});
 	}
 };
 var LayoutController = {};

