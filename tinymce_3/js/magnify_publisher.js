var ed;

function init() {
	ed = tinyMCEPopup.editor;
	document.body.innerHTML = tinyMCEPopup.getWindowArg('magnify_publisher_iframe');
	if ( tinymce ) {
		var activeEditor = window.parent.tinyMCE.activeEditor;
		var windowManager = activeEditor.windowManager;
		var windowId = windowManager.params.mce_window_id;		
		var DOM = tinymce.DOM, Element = tinymce.dom.Element, Event = tinymce.dom.Event, each = tinymce.each, is = tinymce.is;	
		

		if ( !windowManager.oldClose ) {	
			windowManager.oldClose = windowManager.close;
		}
	
		windowManager.close = function(win, id) {
			// this prevents the active webcam Microphone from 
			// causing a segfault in OS X
			if ( document ) {
				var iframe = document.getElementById('mvp_publisher_iframe');
				iframe.src = "";
			}
			
			this.oldClose(win, id);			
		};
	}
}

function closeTinyMCEPopup() {
	tinyMCEPopup.close();
}

function mvp_add_to_text_editor( text_to_add ) {
	ed = tinyMCEPopup.editor;
	var content = ed.getContent();
	ed.setContent( content + text_to_add );
		if ( window.parent.ed ) {
			window.parent.closeTinyMCEPopup();
		}
}

function mvp_publisher_embed( embed_info ) {	
	var embed_code = "\n" + embed_info.placeholder + "\n";		
	mvp_add_to_text_editor( embed_code );
}

function mvp_publisher_mce_publisher_window () {
	tinyMCEPopup.onInit.add(init);
}