(function (window, $){
	var HotList = function(iconName,hotDate) {
		this.hotClass = iconName;
		this.hotDate = hotDate;
	};

	HotList.prototype.render = function(container) {
		var $container = $(container);
		var items= $container.find('li');
		if(items.length > 0) {
			for(var i =0; i < items.length; i++) {
				this.setHot(items[i]);
			}
		}
	};

	HotList.prototype.setHot = function(item) {
		var $ele = $(item);
		var time = $ele.find('span').text();
		if(time && this.isHot(time)) {
			$ele.addClass(this.hotClass); 
			$ele.find('a').append('<img src="http://210.29.65.177:8001/ntdxcszz/ntdx-by-base/'+this.hotClass+'.gif" style="position:absolute;z-index:1001;margin-left:5px;margin-top:3px;_margin-top:0px;border:0px;">');
		}
	};

	HotList.prototype.isHot =function(time) {
		var now = new Date();
		var itemDate,r;
		var year = now.getFullYear();
		var month = now.getMonth() + 1;
		var day = now.getDate();
		var nowDate = this.getDateTime(year, month, day);
		r = time.match(/^(\d{1,4})(-|\/)(\d{1,2})(-|\/)(\d{1,2})$/);
		if(r!=null){
		itemDate= new Date(r[1], r[3]-1, r[5]);
			}
		r = time.match(/^(\d{1,2})(-|\/)(\d{1,2})$/);
		if(r!=null){
		itemDate= new Date(year,r[1]-1, r[3]);	
			}
		r = time.match(/^(\d{1,4})(年|\/)(\d{1,2})(月|\/)(\d{1,2})(日|\/)$/);
		if(r!=null){
		itemDate= new Date(r[1], r[3]-1, r[5]);
			}
		r = time.match(/^(\d{1,4})(\d{1,2})(\d{1,2})$/);
		if(r!=null){
		itemDate= new Date(r[1], r[2]-1, r[3]);
			}
	return nowDate - itemDate <= 86400000 * this.hotDate;		
	};

	HotList.prototype.getDateTime = function(year, month, day) {
		var now = new Date();
		now.setFullYear(year, month - 1, day);
		now.setHours(0);
		now.setMinutes(0);
		now.setSeconds(0);
		now.setMilliseconds(0);
		return now.getTime();
	};
	
	window.HotList = HotList;
})(window, jQuery);