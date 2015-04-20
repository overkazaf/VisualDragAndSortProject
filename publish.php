<?php
	$html = $_POST['html'];
	$json = array();
	
	if (file_put_contents("publish/".mktime().".html", $html) > 0) {
		$json['success'] = true;
	} else {
		$json['success'] = false;
	}
	echo json_encode($json);
?>