tinyMCE.importPluginLanguagePack('magnify_publisher');

function makeOpaque(bool, url) {	
	var hh = document.getElementsByTagName('head')[0];
	var removeOpacity = document.getElementById('removeOpacity');
	if ( bool ) {
		var ss = document.createElement('style');
		ss.id = "removeOpacity";
		var def = 'html, body, div, span, applet, object, iframe, ' +
		'h1, h2, h3, h4, h5, h6, p, blockquote, pre, ' +
		'a, abbr, acronym, address, big, cite, code, ' +
		'del, dfn, em, font, img, ins, kbd, q, s, samp, ' +
		'small, strike, strong, sub, sup, tt, var, ' +
		'dl, dt, dd, ol, ul, li, ' +
		'fieldset, form, label, legend, ' +
		'table, caption, tbody, tfoot, thead, tr, th, td, ' +
		'.defaultSkin .mceButtonDisabled .icon, .wp_themeSkin .mceButtonDisabled .mceIcon { opacity: 1.0; filter: alpha(opacity=100); } ';
		
		
		// Mac Firefox won't display Flash objects if they intersect an
		// object with partial transparancy, so we fake it with a fully-
		// visible object whose background is a partially-transparent PNG.
		// Note that this *doesn't* work in Internet Explorer 6/7, so
		// this has to be restricted to Firefox-family browsers.
		if ( navigator.product == 'Gecko' ) {
			def = def + 'div.clearlooks2_modalBlocker { background: url(' + url + '/img/white_alpha_60.png); opacity: 1.0; filter: alpha(opacity=100); }';
		}
		
		ss.setAttribute("type", "text/css");
		if (ss.styleSheet) {   // IE
			ss.styleSheet.cssText = def;
		} else {                // the world
			var tt = document.createTextNode(def);
			ss.appendChild(tt);
		}
		hh.appendChild(ss);
	} else {
		if ( removeOpacity ) {
			hh.removeChild(removeOpacity);
		}
	}
}

var TinyMCE_MagnifyPublisher = {
	getInfo : function() {
		return {
			longname : 'Magnify Publisher plugin for tinyMCE 2.*',
			author : 'Magnify.net',
			authorurl : 'http://www.magnify.net',
			infourl : 'http://www.magnify.net',
			version : "1.0"
		};
	},

	/**
	 * Returns the HTML code for a specific control or empty string if this plugin doesn't have that control.
	 * A control can be a button, select list or any other HTML item to present in the TinyMCE user interface.
	 * The variable {$editor_id} will be replaced with the current editor instance id and {$pluginurl} will be replaced
	 * with the URL of the plugin. Language variables such as {$lang_somekey} will also be replaced with contents from
	 * the language packs.
	 *
	 * @param {string} cn Editor control/button name to get HTML for.
	 * @return HTML code for a specific control or empty string.
	 * @type string
	 */
	getControlHTML : function(cn) {
		switch (cn) {
			case "magnify_publisher":			
				return tinyMCE.getButtonHTML(cn, 'lang_magnify_publisher_desc', '{$pluginurl}/images/publisher_icon.gif', 'mceMagnifyPublisher', true, '{$pluginurl}');
		}

		return "";
	},

	/**
	 * Executes a specific command, this function handles plugin commands.
	 *
	 * @param {string} editor_id TinyMCE editor instance id that issued the command.
	 * @param {HTMLElement} element Body or root element for the editor instance.
	 * @param {string} command Command name to be executed.
	 * @param {string} user_interface True/false if a user interface should be presented.
	 * @param {mixed} value Custom value argument, can be anything.
	 * @return true/false if the command was executed by this plugin or not.
	 * @type
	 */
	execCommand : function(editor_id, element, command, user_interface, value) {	
		var mce_publisher_url = value;
		makeOpaque(true, mce_publisher_url);
		var prefix = window.location.protocol + '//' + window.location.hostname;
		var host_regex = new RegExp(prefix, "i");
		if ( host_regex.test(mce_publisher_url) ) {
			prefix = "";
		}
	
		// Handle commands
		switch (command) {
			// Remember to have the "mce" prefix for commands so they don't intersect with built in ones in the browser.
			case "mceMagnifyPublisher":
				// Show UI/Popup
				if (user_interface) {
					// Open a popup window and send in some custom data in a window argument
					var magnify_publisher = new Array();

					magnify_publisher['file'] = mce_publisher_url + '/publisher.html', // Relative to theme
					magnify_publisher['width'] = 650;
					magnify_publisher['height'] = 550;

					tinyMCE.openWindow(magnify_publisher, {
						editor_id : editor_id, 
						plugin_url : mce_publisher_url,
						magnify_publisher_url : tinyMCE.getParam('magnify_publisher_url'),
						magnify_publisher_target : tinyMCE.getParam('magnify_publisher_target', 'tinymce2'),
						magnify_publisher_iframe : '<iframe width="650" height="550" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" id="mvp_publisher_iframe" src="' + tinyMCE.getParam('magnify_publisher_url') + '/embed/publisher?application=' + tinyMCE.getParam('magnify_publisher_target', 'tinymce2') + '&callback_type=GetFrame&amp;callback=' + prefix + mce_publisher_url + '/embed.html' + '"></iframe>'
					});

					// Let TinyMCE know that something was modified
					tinyMCE.triggerNodeChange(false);
				} 

				return true;
		}

		// Pass to next handler in chain
		return false;
	},
	
	cleanup : function(type, content, inst) {
		var t = this;
		var newContent;
		switch (type) {
			case "get_from_editor":
				var imgRegex = /(<img [^>]*?)\brel="([^">]*?iframe[^">]+?)"([^>]*?>)/ig;
				if ( content ) {
					newContent = content.replace(imgRegex, t._convert_to_iframe);
					content = newContent;
				}
				break;

			case "insert_to_editor":
				var iframeRegex = /(<iframe [^>]*?)\brel="([^">]*?img[^">]+?)"([^>]*?(?:\/>|>\s*<\/iframe>))/ig;
				if ( content ) {
					newContent = content.replace(iframeRegex, t._convert_to_img);
					content = newContent;
				}
				
				break;
		}

		return content;
	},
		
	_convert_to_iframe : function(input, m1, m2, m3) {
		var iframe = decodeURIComponent(m2);
		var placeholder = encodeURIComponent(m1 + m3);
		var newIframe = iframe.replace(/(<iframe)/i, "$1" + " rel=\"" + placeholder + "\"" );
		return newIframe;
	},
	
	_convert_to_img : function(input, m1, m2, m3) {
		var image = decodeURIComponent(m2);
		var placeholder = encodeURIComponent(m1 + m3);
		var newImg = image.replace(/([<]img)/i, "$1" + " rel=\"" + placeholder + "\"" );
		return newImg;
	}

};

// Adds the plugin class to the list of available TinyMCE plugins
tinyMCE.addPlugin("magnify_publisher", TinyMCE_MagnifyPublisher);
