/**
 * [generatorId generate a ]
 * @param  {[type]} len    [description]
 * @param  {[type]} radix  [description]
 * @param  {[type]} prefix [description]
 * @param  {[type]} subfix [description]
 * @return {[type]}        [description]
 */
var generatorId = function (len, radix, prefix, subfix){
	var targetId = '';
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    len = len || 32;
		radix = radix || chars.length;
		prefix = prefix || '';
		prefix = prefix == '' ? '' : prefix + '_';
		subfix = subfix || '';
		subfix = subfix == '' ? '' : '_' + subfix;
 
    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;
 
      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
 
      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }
 
		targetId = uuid.join('');
	return prefix+targetId+subfix;
};
