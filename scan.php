<?php
	$hostdir = 'publish/';
	$filesnames = scandir($hostdir);
	$json = array();
	$array = array();
	foreach($filesnames as $key => $val) {
		if ($val == "." || $val == "..") {
			
		} else {
			$array[$key] = $val;
		}
	}
	if (count($array) > 0) {
		$json['success'] = true;
		$json['data'] = $array;
	} else {
		$json['success'] = false;
		$json['data'] = '';
	}
	echo json_encode($json);
?>