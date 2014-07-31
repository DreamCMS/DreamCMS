(function($){var textarea,staticOffset;var iLastMousePos=0;var iMin=50;var iMax=500;var grip;$.fn.TextAreaResizer=function(){return this.each(function(){
textarea=$(this).addClass('processed'),staticOffset=null;
var w = $(textarea).outerWidth();$(this).wrap('<div class="resizable-textarea"></div>').parent().append(
	$('<div class="grippie"></div>').attr('title', 'Resize Textfield').bind("mousedown",{el:this},startDrag)
);
var grippie=$('div.grippie',$(this).parent())[0];grippie.style.marginRight = (grippie.offsetWidth-$(this)[0].offsetWidth) - 4 +'px'; })};
function startDrag(e){textarea=$(e.data.el);textarea.blur();iLastMousePos=mousePosition(e).y;staticOffset=textarea.height()-iLastMousePos;textarea.css('opacity',0.5);$(document).mousemove(performDrag).mouseup(endDrag);return false}
function performDrag(e){
var iThisMousePos=mousePosition(e).y;
var iMousePos=staticOffset+iThisMousePos;
if(iLastMousePos>=(iThisMousePos)){iMousePos-=5}
if (textarea.height() >= iMax && staticOffset+iLastMousePos < iMousePos ){iLastMousePos=iThisMousePos; endDrag(e); return false; }
iLastMousePos=iThisMousePos;
iMousePos=Math.max(iMin,iMousePos);
textarea.height(iMousePos+'px');
if(iMousePos<iMin){endDrag(e)}

return false
}function endDrag(e){$(document).unbind('mousemove',performDrag).unbind('mouseup',endDrag);textarea.css('opacity',1);textarea.focus();GUI.updateScrollSize(); textarea=null;staticOffset=null;iLastMousePos=0}function mousePosition(e){return{x:e.clientX+document.documentElement.scrollLeft,y:e.clientY+document.documentElement.scrollTop}}})(jQuery);