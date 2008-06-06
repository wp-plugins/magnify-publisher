function init() {
	document.body.innerHTML = tinyMCEPopup.getWindowArg('magnify_publisher_iframe');
}

function closeTinyMCEPopup() {
	tinyMCEPopup.close();
}

function mvp_add_to_text_editor( text_to_add ) {
	var content = tinyMCE.getContent(tinyMCEPopup.getWindowArg('editor_id'));
	tinyMCE.setContent( content + text_to_add );
		if ( window.parent ) {
			window.parent.closeTinyMCEPopup();
		}
}

function mvp_publisher_embed( embed_info ) {
	var embed_code = "\n" + embed_info.placeholder + "\n";		
	mvp_add_to_text_editor( embed_code );
}

function mvp_publisher_mce_publisher_window () {
	tinyMCEPopup.onLoad = init();
}