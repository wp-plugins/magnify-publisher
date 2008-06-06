(function() {
	tinymce.PluginManager.requireLangPack('magnify_publisher');
	
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
	
	tinymce.create('tinymce.plugins.MagnifyPublisher', {
	
		init : function(ed, mce_publisher_url) {
			var t = this;

			t.editor = ed;
		
			ed.addCommand('mceMagnifyPublisher', function() {
				makeOpaque(true, mce_publisher_url);
				var prefix = window.location.protocol + '//' + window.location.hostname;
				var host_regex = new RegExp(prefix, "i");
				if ( host_regex.test(mce_publisher_url) ) {
					prefix = "";
				}
				
				ed.windowManager.open({
					file : mce_publisher_url + '/publisher.html',
					width : 650 + parseInt(ed.getLang('magnify_publisher.delta_width', 0)),
					height : 550 + parseInt(ed.getLang('magnify_publisher.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : mce_publisher_url,
					magnify_publisher_url : ed.getParam('magnify_publisher_url'),
					magnify_publisher_target : ed.getParam('magnify_publisher_target', 'tinymce3'),
					magnify_publisher_iframe : '<iframe width="650" height="550" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" id="mvp_publisher_iframe" src="' + ed.getParam('magnify_publisher_url') + '/embed/publisher?application=' + ed.getParam('magnify_publisher_target', 'tinymce3') + '&callback_type=GetFrame&amp;callback=' + prefix + mce_publisher_url + '/embed.html' + '"></iframe>'
				});
			});
		
			// Register button
			ed.addButton('magnify_publisher', {
				title : 'magnify_publisher.desc',
				cmd : 'mceMagnifyPublisher',
				image : mce_publisher_url + '/img/publisher_icon.gif'
			});

			ed.onBeforeSetContent.add(function(ed, o) {
				var iframeRegex = /(<iframe [^>]*?)\brel="([^">]*?img[^">]+?)"([^>]*?(?:\/>|>\s*<\/iframe>))/ig;
				o.content = o.content.replace(iframeRegex, t._convert_to_img);
			});

			ed.onPostProcess.add(function(ed, o) {
				if (o.get)
					var imgRegex = /(<img [^>]*?)\brel="([^">]*?iframe[^">]+?)"([^>]*?>)/ig;
					o.content = o.content.replace(imgRegex, t._convert_to_iframe);
			});
		},
					
		getInfo : function() {
			return {
				longname : 'Magnify Publisher plugin',
				author : 'Magnify.net',
				authorurl : 'http://www.magnify.net',
				infourl : 'http://www.magnify.net',
				version : "1.0"
			};
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
		
	});

	// Register plugin
	tinymce.PluginManager.add('magnify_publisher', tinymce.plugins.MagnifyPublisher);
})();