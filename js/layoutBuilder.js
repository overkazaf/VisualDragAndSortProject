/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-28 14:06:20
 * @version $Id$
 */

var LayoutMapping = {
	lz0 : ['layout-zone'],
	template1 : ['lz1'],// 1
	template2 : ['lz3', 'lz4'],// 1:3
	template3 : ['lz4', 'lz3'],// 3:1
	template4 : ['lz3', 'lz3', 'lz5'], // 1:1:2
	template5 : ['lz3', 'lz5', 'lz3'], // 1:2:1
	template6 : ['lz5', 'lz5'], // 1:1
	template7 : ['lz6', 'lz6', 'lz6'], // 1:1:1
	template8 : ['lz2', 'lz2', 'lz2', 'lz2', 'lz2'] // 1:1:1:1:1
};

/**
 * [buildDraggableLayout description]
 * @param  {[type]} layoutType [description]
 * @return {[type]}            [description]
 */
function buildDraggableLayout(layoutType){
	var fragment = '';
	var defaultConfig = generateDefaultLayoutConfig(layoutType);
	fragment += '<div operable="layout" class="layout-template" '+ defaultConfig +'>';
	fragment += '<div class="layout-template-container" data-layer="0">';

	var arr = LayoutMapping[layoutType],
		defaultClass = LayoutMapping['lz0'];
	for (var i=0,l=arr.length; i<l; i++) {
		fragment += '<div class="' + defaultClass + ' ' + arr[i] + '"></div>';
	}

	fragment += '</div>';
	fragment += '</div>';

	return fragment;
}




function generateDefaultLayoutConfig(layoutType){
	var config = '';
	switch (layoutType) {
		case 'template1' : 
			config = '100%$0,auto;';
			break;
		case 'template2' : 
			config = '25%,75%$0,0,0,0^0,0,0,0';
			break;
		case 'template3' : 
			config = '75%,25%$0,0,0,0^0,0,0,0';
			break;
		case 'template4' : 
			config = '25%,25%,50%$0,0,0,0^0,0,0,0^0,0,0,0';
			break;
		case 'template5' : 
			config = '25%,50%,25%$0,0,0,0^0,0,0,0^0,0,0,0';
			break;
	}

	return config;
}