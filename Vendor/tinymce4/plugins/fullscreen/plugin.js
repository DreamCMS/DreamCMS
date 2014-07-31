/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('fullscreen', function(editor) {
	var fullscreenState = false, DOM = tinymce.DOM, iframeWidth, iframeHeight, resizeHandler, fullscreenContainer, editorContain, tb, realContainer;
	var containerWidth, containerHeight;

	if (editor.settings.inline) {
		// return;
	}

	function getWindowSize() {
		var w, h, win = window, doc = document;
		var body = doc.body;

		// Old IE
		if (body.offsetWidth) {
			w = body.offsetWidth;
			h = body.offsetHeight;
		}

		// Modern browsers
		if (win.innerWidth && win.innerHeight) {
			w = win.innerWidth;
			h = win.innerHeight;
		}

		return {w: w, h: h};
	}

	function toggleFullscreen() {
		var body = document.body, documentElement = document.documentElement, editorContainerStyle;
		var editorContainer, iframe, iframeStyle;

		function resize() {
			DOM.setStyle(iframe, 'height', getWindowSize().h - (editorContainer.clientHeight - iframe.clientHeight));
		}

		function resizeInline()
		{
			if ( typeof editor.settings.onFullscreenResize === 'function')
			{
				editor.settings.onFullscreenResize(editor, tb, editorContain, realContainer, fullscreenContainer);
			}
		}

		fullscreenState = !fullscreenState;

		if ( editor.settings.inline ) {
			if (fullscreenState) {

				fullscreenContainer = $('<div></div>' ).attr('id', 'mcefullscreen' ).css({
					position: 'fixed',
					zIndex: 9999,
					top: 0,
					overflow: 'hidden'
				});
				fullscreenContainer.appendTo($('body'));
				tb = $('<div></div>');
				editorContain = $('<div></div>' );

				fullscreenContainer.append(tb);
				fullscreenContainer.append(editorContain);

				$('#'+ editor.theme.panel._id).appendTo(tb);
				realContainer = $(editor.bodyElement ).parents('div.resize_mce:first');

				var size = realContainer.height();
				realContainer.data('size', size).appendTo(editorContain);
				var h = $(window ).height() - tb.outerHeight(true);
				editorContain.height(h);
				if ( typeof editor.settings.onFullscreen === 'function')
				{
					editor.settings.onFullscreen(editor, true, tb, editorContain, realContainer, fullscreenContainer);
				}

				$(window ).trigger('resize');

				DOM.addClass(body, 'mce-fullscreen');
				DOM.addClass(documentElement, 'mce-fullscreen');
			//	DOM.addClass(editorContainer, 'mce-fullscreen');
				DOM.bind(window, 'resize', resizeInline);
				resizeHandler = resizeInline;
			}
			else
			{

				$('#'+ editor.theme.panel._id ).appendTo( $(editor.settings.fixed_toolbar_container) );

				var r = $(editor.bodyElement ).parents('div.resize_mce:first');
				r.find('.nano' ).height( r.data('size') );
				r.removeData('size');
				r.insertAfter($('#'+ editor.id.replace('inline-', '') ));

				if ( typeof editor.settings.onFullscreen === 'function')
				{
					editor.settings.onFullscreen(editor, false, tb, editorContain, realContainer, fullscreenContainer);
				}



				fullscreenContainer.remove();
				DOM.removeClass(body, 'mce-fullscreen');
				DOM.removeClass(documentElement, 'mce-fullscreen');
		//		DOM.removeClass(editorContainer, 'mce-fullscreen');

				realContainer.filter('ui-resizable' ).resizable('enable');
				fullscreenContainer = tb = editorContain = realContainer = null;
				DOM.unbind(window, 'resize', resizeHandler);
			}

		}
		else {

			editorContainer = editor.getContainer();
			editorContainerStyle = editorContainer.style;



			iframe = editor.getContentAreaContainer().firstChild;
			iframeStyle = iframe.style;

			if (fullscreenState) {
				iframeWidth = iframeStyle.width;
				iframeHeight = iframeStyle.height;
				iframeStyle.width = iframeStyle.height = '100%';
				containerWidth = editorContainerStyle.width;
				containerHeight = editorContainerStyle.height;
				editorContainerStyle.width = editorContainerStyle.height = '';

				DOM.addClass(body, 'mce-fullscreen');
				DOM.addClass(documentElement, 'mce-fullscreen');
				DOM.addClass(editorContainer, 'mce-fullscreen');

				DOM.bind(window, 'resize', resize);
				resize();
				resizeHandler = resize;
			} else {
				iframeStyle.width = iframeWidth;
				iframeStyle.height = iframeHeight;

				if (containerWidth) {
					editorContainerStyle.width = containerWidth;
				}

				if (containerHeight) {
					editorContainerStyle.height = containerHeight;
				}

				DOM.removeClass(body, 'mce-fullscreen');
				DOM.removeClass(documentElement, 'mce-fullscreen');
				DOM.removeClass(editorContainer, 'mce-fullscreen');
				DOM.unbind(window, 'resize', resizeHandler);
			}

		}




		editor.fire('FullscreenStateChanged', {state: fullscreenState});
	}

	editor.on('init', function() {
		editor.addShortcut('Ctrl+Alt+F', '', toggleFullscreen);
	});

	editor.on('remove', function() {
		if (resizeHandler) {
			DOM.unbind(window, 'resize', resizeHandler);
		}
	});

	editor.addCommand('mceFullScreen', toggleFullscreen);

	editor.addMenuItem('fullscreen', {
		text: 'Fullscreen',
		shortcut: 'Ctrl+Alt+F',
		selectable: true,
		onClick: toggleFullscreen,
		onPostRender: function() {
			var self = this;

			editor.on('FullscreenStateChanged', function(e) {
				self.active(e.state);
			});
		},
		context: 'view'
	});

	editor.addButton('fullscreen', {
		tooltip: 'Fullscreen',
		shortcut: 'Ctrl+Alt+F',
		onClick: toggleFullscreen,
		onPostRender: function() {
			var self = this;

			editor.on('FullscreenStateChanged', function(e) {
				self.active(e.state);
			});
		}
	});

	return {
		isFullscreen: function() {
			return fullscreenState;
		}
	};
});