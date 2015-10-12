/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-28 14:06:20
 * @version $Id$
 */

var LayoutMapping = {
	lz0 : ['layout-decoration layout-cell'],
	template1 : ['lz1'],// 1
	template2 : ['lz3', 'lz4'],// 1:3
	template3 : ['lz4', 'lz3'],// 3:1
	template4 : ['lz5', 'lz5'], // 1:1
	template5 : ['lz3', 'lz3', 'lz5'], // 1:1:2
	template6 : ['lz6', 'lz6', 'lz6'], // 1:1:1
	template7 : ['lz3', 'lz3', 'lz3', 'lz3'], // 1:1:1:1
	template8 : ['lz2', 'lz2', 'lz2', 'lz2', 'lz2'], // 1:1:1:1:1
    template9 : ['lzh1', 'lzh1'] // horizental
};

/**
 * [buildDraggableLayout description]
 * @param  {[type]} layoutType [description]
 * @return {[type]}            [description]
 */
function buildDraggableLayout(layoutType){
	var fragment = '';
	var defaultConfig = generateDefaultLayoutConfig(layoutType);
	var layoutId = generatorId(null, null ,'Layout', 'Generated');
	fragment += '<div operable="layout" data-layer="0" data-layout-type="dynamic" data-layout-template="'+layoutType+'" data-type="drag-layout" class="layout-container" id="'+layoutId+'" data-history-config="'+ defaultConfig +'" data-layout-id="'+layoutId+'" class="layout-template-container layout-template" data-type="layout-template" data-layer="0">';
	fragment += '<div class="layout-row">';
	var arr = LayoutMapping[layoutType],
		defaultClass = LayoutMapping['lz0'];
	for (var i=0,l=arr.length; i<l; i++) {
		fragment += '<div data-layout-param="bc;bgi;" class="' + defaultClass + ' ' + arr[i] + '" del="layout-decoration"></div>';
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
			config = '50%,50%$0,0,0,0^0,0,0,0';
			break;
		case 'template5' : 
			config = '25%,25,50%%$0,0,0,0^0,0,0,0^0,0,0,0';
			break;
		case 'template6' : 
            config = '33%,33%,33%$0,0,0,0^0,0,0,0^0,0,0,0';
            break;
        case 'template7' : 
            config = '25%,25%,25%,25%$0,0,0,0^0,0,0,0^0,0,0,0^0,0,0,0';
            break;
        case 'template8' : 
            config = '20%,20%,20%,20%,20%$0,0,0,0^0,0,0,0^0,0,0,0^0,0,0,0^0,0,0,0';
            break;
        case 'template9' : 
            config = '50%,50%$0,0,0,0^0,0,0,0';
            break;
	}

	return config;
}