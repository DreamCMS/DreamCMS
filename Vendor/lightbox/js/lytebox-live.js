Array.prototype.removeDuplicates=function(){for(var a=1;
a<this.length;
a++){if(this[a][0]==this[a-1][0]){this.splice(a,1)
}}};
Array.prototype.empty=function(){for(var a=0;
a<=this.length;
a++){this.shift()
}};
String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")
};
var myLytebox=null;
function LyteBox(){this.theme="grey";
this.hideFlash=true;
this.outerBorder=false;
this.resizeSpeed=8;
this.maxOpacity=70;
this.navType=1;
this.autoResize=true;
this.doAnimations=true;
this.borderSize=10;
this.slideInterval=4000;
this.showNavigation=true;
this.showClose=true;
this.showDetails=true;
this.showPlayPause=true;
this.autoEnd=true;
this.pauseOnNextClick=false;
this.pauseOnPrevClick=true;
if(this.resizeSpeed>10){this.resizeSpeed=10
}if(this.resizeSpeed<1){resizeSpeed=1
}this.resizeDuration=(11-this.resizeSpeed)*0.15;
this.resizeWTimerArray=new Array();
this.resizeWTimerCount=0;
this.resizeHTimerArray=new Array();
this.resizeHTimerCount=0;
this.showContentTimerArray=new Array();
this.showContentTimerCount=0;
this.overlayTimerArray=new Array();
this.overlayTimerCount=0;
this.imageTimerArray=new Array();
this.imageTimerCount=0;
this.timerIDArray=new Array();
this.timerIDCount=0;
this.slideshowIDArray=new Array();
this.slideshowIDCount=0;
this.imageArray=new Array();
this.activeImage=null;
this.slideArray=new Array();
this.activeSlide=null;
this.frameArray=new Array();
this.activeFrame=null;
this.checkFrame();
this.isSlideshow=false;
this.isLyteframe=false;
/*@cc_on
		/*@if (@_jscript)
			this.ie = (document.all && !window.opera) ? true : false;
		/*@else @*/
this.ie=false;
/*@end
	@*/
this.ie7=(this.ie&&window.XMLHttpRequest);
this.initialize()
}LyteBox.prototype.initialize=function(){this.updateLyteboxItems();
var v=this.doc.getElementsByTagName("body").item(0);
if(this.doc.getElementById("lbOverlay")){v.removeChild(this.doc.getElementById("lbOverlay"));
v.removeChild(this.doc.getElementById("lbMain"))
}var i=this.doc.createElement("div");
i.setAttribute("id","lbOverlay");
i.setAttribute((this.ie?"className":"class"),this.theme);
if((this.ie&&!this.ie7)||(this.ie7&&this.doc.compatMode=="BackCompat")){i.style.position="absolute"
}i.style.display="none";
v.appendChild(i);
var a=this.doc.createElement("div");
a.setAttribute("id","lbMain");
a.style.display="none";
v.appendChild(a);
var p=this.doc.createElement("div");
p.setAttribute("id","lbOuterContainer");
p.setAttribute((this.ie?"className":"class"),this.theme);
a.appendChild(p);
var g=this.doc.createElement("div");
g.setAttribute("id","lbIframeContainer");
g.style.display="none";
p.appendChild(g);
var t=this.doc.createElement("iframe");
t.setAttribute("id","lbIframe");
t.setAttribute("name","lbIframe");
t.style.display="none";
g.appendChild(t);
var n=this.doc.createElement("div");
n.setAttribute("id","lbImageContainer");
p.appendChild(n);
var e=this.doc.createElement("img");
e.setAttribute("id","lbImage");
n.appendChild(e);
var s=this.doc.createElement("div");
s.setAttribute("id","lbLoading");
p.appendChild(s);
var m=this.doc.createElement("div");
m.setAttribute("id","lbDetailsContainer");
m.setAttribute((this.ie?"className":"class"),this.theme);
a.appendChild(m);
var l=this.doc.createElement("div");
l.setAttribute("id","lbDetailsData");
l.setAttribute((this.ie?"className":"class"),this.theme);
m.appendChild(l);
var j=this.doc.createElement("div");
j.setAttribute("id","lbDetails");
l.appendChild(j);
var k=this.doc.createElement("span");
k.setAttribute("id","lbCaption");
j.appendChild(k);
var r=this.doc.createElement("div");
r.setAttribute("id","lbHoverNav");
n.appendChild(r);
var q=this.doc.createElement("div");
q.setAttribute("id","lbBottomNav");
l.appendChild(q);
var b=this.doc.createElement("a");
b.setAttribute("id","lbPrev");
b.setAttribute((this.ie?"className":"class"),this.theme);
b.setAttribute("href","#");
r.appendChild(b);
var c=this.doc.createElement("a");
c.setAttribute("id","lbNext");
c.setAttribute((this.ie?"className":"class"),this.theme);
c.setAttribute("href","#");
r.appendChild(c);
var d=this.doc.createElement("span");
d.setAttribute("id","lbNumberDisplay");
j.appendChild(d);
var f=this.doc.createElement("span");
f.setAttribute("id","lbNavDisplay");
f.style.display="none";
j.appendChild(f);
var u=this.doc.createElement("a");
u.setAttribute("id","lbClose");
u.setAttribute((this.ie?"className":"class"),this.theme);
u.setAttribute("href","#");
q.appendChild(u);
var o=this.doc.createElement("a");
o.setAttribute("id","lbPause");
o.setAttribute((this.ie?"className":"class"),this.theme);
o.setAttribute("href","#");
o.style.display="none";
q.appendChild(o);
var h=this.doc.createElement("a");
h.setAttribute("id","lbPlay");
h.setAttribute((this.ie?"className":"class"),this.theme);
h.setAttribute("href","#");
h.style.display="none";
q.appendChild(h)
};
LyteBox.prototype.updateLyteboxItems=function(){var c=(this.isFrame)?window.parent.frames[window.name].document.getElementsByTagName("a"):document.getElementsByTagName("a");
for(var b=0;
b<c.length;
b++){var a=c[b];
var d=String(a.getAttribute("rel"));
if(a.getAttribute("href")){if(d.toLowerCase().match("lytebox")){a.onclick=function(){myLytebox.start(this,false,false);
return false
}
}else{if(d.toLowerCase().match("lyteshow")){a.onclick=function(){myLytebox.start(this,true,false);
return false
}
}else{if(d.toLowerCase().match("lyteframe")){a.onclick=function(){myLytebox.start(this,false,true);
return false
}
}}}}}};
LyteBox.prototype.start=function(d,g,b){if(this.ie&&!this.ie7){this.toggleSelects("hide")
}if(this.hideFlash){this.toggleFlash("hide")
}this.isLyteframe=(b?true:false);
var j=this.getPageSize();
var k=this.doc.getElementById("lbOverlay");
var l=this.doc.getElementsByTagName("body").item(0);
k.style.height=j[1]+"px";
k.style.display="";
this.appear("lbOverlay",(this.doAnimations?0:this.maxOpacity));
var a=(this.isFrame)?window.parent.frames[window.name].document.getElementsByTagName("a"):document.getElementsByTagName("a");
if(this.isLyteframe){this.frameArray=[];
this.frameNum=0;
if((d.getAttribute("rel")=="lyteframe")){var h=d.getAttribute("rev");
this.frameArray.push(new Array(d.getAttribute("href"),d.getAttribute("title"),(h==null||h==""?"width: 400px; height: 400px; scrolling: auto;":h)))
}else{if(d.getAttribute("rel").indexOf("lyteframe")!=-1){for(var f=0;
f<a.length;
f++){var e=a[f];
if(e.getAttribute("href")&&(e.getAttribute("rel")==d.getAttribute("rel"))){var h=e.getAttribute("rev");
this.frameArray.push(new Array(e.getAttribute("href"),e.getAttribute("title"),(h==null||h==""?"width: 400px; height: 400px; scrolling: auto;":h)))
}}this.frameArray.removeDuplicates();
while(this.frameArray[this.frameNum][0]!=d.getAttribute("href")){this.frameNum++
}}}}else{this.imageArray=[];
this.imageNum=0;
this.slideArray=[];
this.slideNum=0;
if((d.getAttribute("rel")=="lytebox")){this.imageArray.push(new Array(d.getAttribute("href"),d.getAttribute("title")))
}else{if(d.getAttribute("rel").indexOf("lytebox")!=-1){for(var f=0;
f<a.length;
f++){var e=a[f];
if(e.getAttribute("href")&&(e.getAttribute("rel")==d.getAttribute("rel"))){this.imageArray.push(new Array(e.getAttribute("href"),e.getAttribute("title")))
}}this.imageArray.removeDuplicates();
while(this.imageArray[this.imageNum][0]!=d.getAttribute("href")){this.imageNum++
}}if(d.getAttribute("rel").indexOf("lyteshow")!=-1){for(var f=0;
f<a.length;
f++){var e=a[f];
if(e.getAttribute("href")&&(e.getAttribute("rel")==d.getAttribute("rel"))){this.slideArray.push(new Array(e.getAttribute("href"),e.getAttribute("title")))
}}this.slideArray.removeDuplicates();
while(this.slideArray[this.slideNum][0]!=d.getAttribute("href")){this.slideNum++
}}}}var c=this.doc.getElementById("lbMain");
c.style.top=(this.getPageScroll()+(j[3]/15))+"px";
c.style.display="";
if(!this.outerBorder){this.doc.getElementById("lbOuterContainer").style.border="none";
this.doc.getElementById("lbDetailsContainer").style.border="none"
}else{this.doc.getElementById("lbOuterContainer").style.borderBottom="";
this.doc.getElementById("lbOuterContainer").setAttribute((this.ie?"className":"class"),this.theme)
}this.doc.getElementById("lbOverlay").onclick=function(){myLytebox.end();
return false
};
this.doc.getElementById("lbMain").onclick=function(i){var i=i;
if(!i){if(window.parent.frames[window.name]&&(parent.document.getElementsByTagName("frameset").length<=0)){i=window.parent.window.event
}else{i=window.event
}}var m=(i.target?i.target.id:i.srcElement.id);
if(m=="lbMain"){myLytebox.end();
return false
}};
this.doc.getElementById("lbClose").onclick=function(){myLytebox.end();
return false
};
this.doc.getElementById("lbPause").onclick=function(){myLytebox.togglePlayPause("lbPause","lbPlay");
return false
};
this.doc.getElementById("lbPlay").onclick=function(){myLytebox.togglePlayPause("lbPlay","lbPause");
return false
};
this.isSlideshow=g;
this.isPaused=(this.slideNum!=0?true:false);
if(this.isSlideshow&&this.showPlayPause&&this.isPaused){this.doc.getElementById("lbPlay").style.display="";
this.doc.getElementById("lbPause").style.display="none"
}if(this.isLyteframe){this.changeContent(this.frameNum)
}else{if(this.isSlideshow){this.changeContent(this.slideNum)
}else{this.changeContent(this.imageNum)
}}};
LyteBox.prototype.changeContent=function(b){if(this.isSlideshow){for(var d=0;
d<this.slideshowIDCount;
d++){window.clearTimeout(this.slideshowIDArray[d])
}}this.activeImage=this.activeSlide=this.activeFrame=b;
if(!this.outerBorder){this.doc.getElementById("lbOuterContainer").style.border="none";
this.doc.getElementById("lbDetailsContainer").style.border="none"
}else{this.doc.getElementById("lbOuterContainer").style.borderBottom="";
this.doc.getElementById("lbOuterContainer").setAttribute((this.ie?"className":"class"),this.theme)
}this.doc.getElementById("lbLoading").style.display="";
this.doc.getElementById("lbImage").style.display="none";
this.doc.getElementById("lbIframe").style.display="none";
this.doc.getElementById("lbPrev").style.display="none";
this.doc.getElementById("lbNext").style.display="none";
this.doc.getElementById("lbIframeContainer").style.display="none";
this.doc.getElementById("lbDetailsContainer").style.display="none";
this.doc.getElementById("lbNumberDisplay").style.display="none";
if(this.navType==2||this.isLyteframe){object=this.doc.getElementById("lbNavDisplay");
object.innerHTML='&nbsp;&nbsp;&nbsp;<span id="lbPrev2_Off" style="display: none;" class="'+this.theme+'">&laquo; prev</span><a href="#" id="lbPrev2" class="'+this.theme+'" style="display: none;">&laquo; prev</a> <b id="lbSpacer" class="'+this.theme+'">||</b> <span id="lbNext2_Off" style="display: none;" class="'+this.theme+'">next &raquo;</span><a href="#" id="lbNext2" class="'+this.theme+'" style="display: none;">next &raquo;</a>';
object.style.display="none"
}if(this.isLyteframe){var g=myLytebox.doc.getElementById("lbIframe");
var j=this.frameArray[this.activeFrame][2];
var c=j.split(";");
for(var d=0;
d<c.length;
d++){if(c[d].indexOf("width:")>=0){var a=c[d].replace("width:","");
g.width=a.trim()
}else{if(c[d].indexOf("height:")>=0){var f=c[d].replace("height:","");
g.height=f.trim()
}else{if(c[d].indexOf("scrolling:")>=0){var e=c[d].replace("scrolling:","");
g.scrolling=e.trim()
}else{if(c[d].indexOf("border:")>=0){}}}}}this.resizeContainer(parseInt(g.width),parseInt(g.height))
}else{imgPreloader=new Image();
imgPreloader.onload=function(){var l=imgPreloader.width;
var i=imgPreloader.height;
if(myLytebox.autoResize){var m=myLytebox.getPageSize();
var h=m[2]-150;
var n=m[3]-150;
if(l>h){i=Math.round(i*(h/l));
l=h;
if(i>n){l=Math.round(l*(n/i));
i=n
}}else{if(i>n){l=Math.round(l*(n/i));
i=n;
if(l>h){i=Math.round(i*(h/l));
l=h
}}}}var k=myLytebox.doc.getElementById("lbImage");
k.src=(myLytebox.isSlideshow?myLytebox.slideArray[myLytebox.activeSlide][0]:myLytebox.imageArray[myLytebox.activeImage][0]);
k.width=l;
k.height=i;
myLytebox.resizeContainer(l,i);
imgPreloader.onload=function(){}
};
imgPreloader.src=(this.isSlideshow?this.slideArray[this.activeSlide][0]:this.imageArray[this.activeImage][0])
}};
LyteBox.prototype.resizeContainer=function(c,a){this.wCur=this.doc.getElementById("lbOuterContainer").offsetWidth;
this.hCur=this.doc.getElementById("lbOuterContainer").offsetHeight;
this.xScale=((c+(this.borderSize*2))/this.wCur)*100;
this.yScale=((a+(this.borderSize*2))/this.hCur)*100;
var d=(this.wCur-this.borderSize*2)-c;
var b=(this.hCur-this.borderSize*2)-a;
if(!(b==0)){this.hDone=false;
this.resizeH("lbOuterContainer",this.hCur,a+this.borderSize*2,this.getPixelRate(this.hCur,a))
}else{this.hDone=true
}if(!(d==0)){this.wDone=false;
this.resizeW("lbOuterContainer",this.wCur,c+this.borderSize*2,this.getPixelRate(this.wCur,c))
}else{this.wDone=true
}if((b==0)&&(d==0)){if(this.ie){this.pause(250)
}else{this.pause(100)
}}this.doc.getElementById("lbPrev").style.height=a+"px";
this.doc.getElementById("lbNext").style.height=a+"px";
this.doc.getElementById("lbDetailsContainer").style.width=(c+(this.borderSize*2)+(this.ie&&this.doc.compatMode=="BackCompat"&&this.outerBorder?2:0))+"px";
this.showContent()
};
LyteBox.prototype.showContent=function(){if(this.wDone&&this.hDone){for(var a=0;
a<this.showContentTimerCount;
a++){window.clearTimeout(this.showContentTimerArray[a])
}if(this.outerBorder){this.doc.getElementById("lbOuterContainer").style.borderBottom="none"
}this.doc.getElementById("lbLoading").style.display="none";
if(this.isLyteframe){this.doc.getElementById("lbIframe").style.display="";
this.appear("lbIframe",(this.doAnimations?0:100))
}else{this.doc.getElementById("lbImage").style.display="";
this.appear("lbImage",(this.doAnimations?0:100));
this.preloadNeighborImages()
}if(this.isSlideshow){if(this.activeSlide==(this.slideArray.length-1)){if(this.autoEnd){this.slideshowIDArray[this.slideshowIDCount++]=setTimeout("myLytebox.end('slideshow')",this.slideInterval)
}}else{if(!this.isPaused){this.slideshowIDArray[this.slideshowIDCount++]=setTimeout("myLytebox.changeContent("+(this.activeSlide+1)+")",this.slideInterval)
}}this.doc.getElementById("lbHoverNav").style.display=(this.showNavigation&&this.navType==1?"":"none");
this.doc.getElementById("lbClose").style.display=(this.showClose?"":"none");
this.doc.getElementById("lbDetails").style.display=(this.showDetails?"":"none");
this.doc.getElementById("lbPause").style.display=(this.showPlayPause&&!this.isPaused?"":"none");
this.doc.getElementById("lbPlay").style.display=(this.showPlayPause&&!this.isPaused?"none":"");
this.doc.getElementById("lbNavDisplay").style.display=(this.showNavigation&&this.navType==2?"":"none")
}else{this.doc.getElementById("lbHoverNav").style.display=(this.navType==1&&!this.isLyteframe?"":"none");
if((this.navType==2&&!this.isLyteframe&&this.imageArray.length>1)||(this.frameArray.length>1&&this.isLyteframe)){this.doc.getElementById("lbNavDisplay").style.display=""
}else{this.doc.getElementById("lbNavDisplay").style.display="none"
}this.doc.getElementById("lbClose").style.display="";
this.doc.getElementById("lbDetails").style.display="";
this.doc.getElementById("lbPause").style.display="none";
this.doc.getElementById("lbPlay").style.display="none"
}this.doc.getElementById("lbImageContainer").style.display=(this.isLyteframe?"none":"");
this.doc.getElementById("lbIframeContainer").style.display=(this.isLyteframe?"":"none");
try{this.doc.getElementById("lbIframe").src=this.frameArray[this.activeFrame][0]
}catch(b){}}else{this.showContentTimerArray[this.showContentTimerCount++]=setTimeout("myLytebox.showContent()",200)
}};
LyteBox.prototype.updateDetails=function(){var object=this.doc.getElementById("lbCaption");
var sTitle=(this.isSlideshow?this.slideArray[this.activeSlide][1]:(this.isLyteframe?this.frameArray[this.activeFrame][1]:this.imageArray[this.activeImage][1]));
object.style.display="";
object.innerHTML=(sTitle==null?"":sTitle);
this.updateNav();
this.doc.getElementById("lbDetailsContainer").style.display="";
object=this.doc.getElementById("lbNumberDisplay");
if(this.isSlideshow&&this.slideArray.length>1){object.style.display="";
object.innerHTML="Image "+eval(this.activeSlide+1)+" of "+this.slideArray.length;
this.doc.getElementById("lbNavDisplay").style.display=(this.navType==2&&this.showNavigation?"":"none")
}else{if(this.imageArray.length>1&&!this.isLyteframe){object.style.display="";
object.innerHTML="Image "+eval(this.activeImage+1)+" of "+this.imageArray.length;
this.doc.getElementById("lbNavDisplay").style.display=(this.navType==2?"":"none")
}else{if(this.frameArray.length>1&&this.isLyteframe){object.style.display="";
object.innerHTML="Page "+eval(this.activeFrame+1)+" of "+this.frameArray.length;
this.doc.getElementById("lbNavDisplay").style.display=""
}else{this.doc.getElementById("lbNavDisplay").style.display="none"
}}}this.appear("lbDetailsContainer",(this.doAnimations?0:100))
};
LyteBox.prototype.updateNav=function(){if(this.isSlideshow){if(this.activeSlide!=0){var a=(this.navType==2?this.doc.getElementById("lbPrev2"):this.doc.getElementById("lbPrev"));
a.style.display="";
a.onclick=function(){if(myLytebox.pauseOnPrevClick){myLytebox.togglePlayPause("lbPause","lbPlay")
}myLytebox.changeContent(myLytebox.activeSlide-1);
return false
}
}else{if(this.navType==2){this.doc.getElementById("lbPrev2_Off").style.display=""
}}if(this.activeSlide!=(this.slideArray.length-1)){var a=(this.navType==2?this.doc.getElementById("lbNext2"):this.doc.getElementById("lbNext"));
a.style.display="";
a.onclick=function(){if(myLytebox.pauseOnNextClick){myLytebox.togglePlayPause("lbPause","lbPlay")
}myLytebox.changeContent(myLytebox.activeSlide+1);
return false
}
}else{if(this.navType==2){this.doc.getElementById("lbNext2_Off").style.display=""
}}}else{if(this.isLyteframe){if(this.activeFrame!=0){var a=this.doc.getElementById("lbPrev2");
a.style.display="";
a.onclick=function(){myLytebox.changeContent(myLytebox.activeFrame-1);
return false
}
}else{this.doc.getElementById("lbPrev2_Off").style.display=""
}if(this.activeFrame!=(this.frameArray.length-1)){var a=this.doc.getElementById("lbNext2");
a.style.display="";
a.onclick=function(){myLytebox.changeContent(myLytebox.activeFrame+1);
return false
}
}else{this.doc.getElementById("lbNext2_Off").style.display=""
}}else{if(this.activeImage!=0){var a=(this.navType==2?this.doc.getElementById("lbPrev2"):this.doc.getElementById("lbPrev"));
a.style.display="";
a.onclick=function(){myLytebox.changeContent(myLytebox.activeImage-1);
return false
}
}else{if(this.navType==2){this.doc.getElementById("lbPrev2_Off").style.display=""
}}if(this.activeImage!=(this.imageArray.length-1)){var a=(this.navType==2?this.doc.getElementById("lbNext2"):this.doc.getElementById("lbNext"));
a.style.display="";
a.onclick=function(){myLytebox.changeContent(myLytebox.activeImage+1);
return false
}
}else{if(this.navType==2){this.doc.getElementById("lbNext2_Off").style.display=""
}}}}this.enableKeyboardNav()
};
LyteBox.prototype.enableKeyboardNav=function(){document.onkeydown=this.keyboardAction
};
LyteBox.prototype.disableKeyboardNav=function(){document.onkeydown=""
};
LyteBox.prototype.keyboardAction=function(b){var a=key=escape=null;
a=(b==null)?event.keyCode:b.which;
key=String.fromCharCode(a).toLowerCase();
escape=(b==null)?27:b.DOM_VK_ESCAPE;
if((key=="x")||(key=="c")||(a==escape)){myLytebox.end()
}else{if((key=="p")||(a==37)){if(myLytebox.isSlideshow){if(myLytebox.activeSlide!=0){myLytebox.disableKeyboardNav();
myLytebox.changeContent(myLytebox.activeSlide-1)
}}else{if(myLytebox.isLyteframe){if(myLytebox.activeFrame!=0){myLytebox.disableKeyboardNav();
myLytebox.changeContent(myLytebox.activeFrame-1)
}}else{if(myLytebox.activeImage!=0){myLytebox.disableKeyboardNav();
myLytebox.changeContent(myLytebox.activeImage-1)
}}}}else{if((key=="n")||(a==39)){if(myLytebox.isSlideshow){if(myLytebox.activeSlide!=(myLytebox.slideArray.length-1)){myLytebox.disableKeyboardNav();
myLytebox.changeContent(myLytebox.activeSlide+1)
}}else{if(myLytebox.isLyteframe){if(myLytebox.activeFrame!=(myLytebox.frameArray.length-1)){myLytebox.disableKeyboardNav();
myLytebox.changeContent(myLytebox.activeFrame+1)
}}else{if(myLytebox.activeImage!=(myLytebox.imageArray.length-1)){myLytebox.disableKeyboardNav();
myLytebox.changeContent(myLytebox.activeImage+1)
}}}}}}};
LyteBox.prototype.preloadNeighborImages=function(){if(this.isSlideshow){if((this.slideArray.length-1)>this.activeSlide){preloadNextImage=new Image();
preloadNextImage.src=this.slideArray[this.activeSlide+1][0]
}if(this.activeSlide>0){preloadPrevImage=new Image();
preloadPrevImage.src=this.slideArray[this.activeSlide-1][0]
}}else{if((this.imageArray.length-1)>this.activeImage){preloadNextImage=new Image();
preloadNextImage.src=this.imageArray[this.activeImage+1][0]
}if(this.activeImage>0){preloadPrevImage=new Image();
preloadPrevImage.src=this.imageArray[this.activeImage-1][0]
}}};
LyteBox.prototype.togglePlayPause=function(a,c){if(this.isSlideshow&&a=="lbPause"){for(var b=0;
b<this.slideshowIDCount;
b++){window.clearTimeout(this.slideshowIDArray[b])
}}this.doc.getElementById(a).style.display="none";
this.doc.getElementById(c).style.display="";
if(a=="lbPlay"){this.isPaused=false;
if(this.activeSlide==(this.slideArray.length-1)){this.end()
}else{this.changeContent(this.activeSlide+1)
}}else{this.isPaused=true
}};
LyteBox.prototype.end=function(a){var c=(a=="slideshow"?false:true);
if(this.isSlideshow&&this.isPaused&&!c){return
}this.disableKeyboardNav();
this.doc.getElementById("lbMain").style.display="none";
this.fade("lbOverlay",(this.doAnimations?this.maxOpacity:0));
this.toggleSelects("visible");
if(this.hideFlash){this.toggleFlash("visible")
}if(this.isSlideshow){for(var b=0;
b<this.slideshowIDCount;
b++){window.clearTimeout(this.slideshowIDArray[b])
}}if(this.isLyteframe){this.initialize()
}};
LyteBox.prototype.checkFrame=function(){if(window.parent.frames[window.name]&&(parent.document.getElementsByTagName("frameset").length<=0)){this.isFrame=true;
this.lytebox="window.parent."+window.name+".myLytebox";
this.doc=parent.document
}else{this.isFrame=false;
this.lytebox="myLytebox";
this.doc=document
}};
LyteBox.prototype.getPixelRate=function(c,a){var b=(a>c)?a-c:c-a;
if(b>=0&&b<=100){return 10
}if(b>100&&b<=200){return 15
}if(b>200&&b<=300){return 20
}if(b>300&&b<=400){return 25
}if(b>400&&b<=500){return 30
}if(b>500&&b<=600){return 35
}if(b>600&&b<=700){return 40
}if(b>700){return 45
}};
LyteBox.prototype.appear=function(f,b){var a=this.doc.getElementById(f).style;
a.opacity=(b/100);
a.MozOpacity=(b/100);
a.KhtmlOpacity=(b/100);
a.filter="alpha(opacity="+(b+10)+")";
if(b==100&&(f=="lbImage"||f=="lbIframe")){try{a.removeAttribute("filter")
}catch(d){}this.updateDetails()
}else{if(b>=this.maxOpacity&&f=="lbOverlay"){for(var c=0;
c<this.overlayTimerCount;
c++){window.clearTimeout(this.overlayTimerArray[c])
}return
}else{if(b>=100&&f=="lbDetailsContainer"){try{a.removeAttribute("filter")
}catch(d){}for(var c=0;
c<this.imageTimerCount;
c++){window.clearTimeout(this.imageTimerArray[c])
}this.doc.getElementById("lbOverlay").style.height=this.getPageSize()[1]+"px"
}else{if(f=="lbOverlay"){this.overlayTimerArray[this.overlayTimerCount++]=setTimeout("myLytebox.appear('"+f+"', "+(b+20)+")",1)
}else{this.imageTimerArray[this.imageTimerCount++]=setTimeout("myLytebox.appear('"+f+"', "+(b+10)+")",1)
}}}}};
LyteBox.prototype.fade=function(d,b){var a=this.doc.getElementById(d).style;
a.opacity=(b/100);
a.MozOpacity=(b/100);
a.KhtmlOpacity=(b/100);
a.filter="alpha(opacity="+b+")";
if(b<=0){try{a.display="none"
}catch(c){}}else{if(d=="lbOverlay"){this.overlayTimerArray[this.overlayTimerCount++]=setTimeout("myLytebox.fade('"+d+"', "+(b-20)+")",1)
}else{this.timerIDArray[this.timerIDCount++]=setTimeout("myLytebox.fade('"+d+"', "+(b-10)+")",1)
}}};
LyteBox.prototype.resizeW=function(b,e,d,j,f){if(!this.hDone){this.resizeWTimerArray[this.resizeWTimerCount++]=setTimeout("myLytebox.resizeW('"+b+"', "+e+", "+d+", "+j+")",100);
return
}var g=this.doc.getElementById(b);
var c=f?f:(this.resizeDuration/2);
var a=(this.doAnimations?e:d);
g.style.width=(a)+"px";
if(a<d){a+=(a+j>=d)?(d-a):j
}else{if(a>d){a-=(a-j<=d)?(a-d):j
}}this.resizeWTimerArray[this.resizeWTimerCount++]=setTimeout("myLytebox.resizeW('"+b+"', "+a+", "+d+", "+j+", "+(c+0.02)+")",c+0.02);
if(parseInt(g.style.width)==d){this.wDone=true;
for(var h=0;
h<this.resizeWTimerCount;
h++){window.clearTimeout(this.resizeWTimerArray[h])
}}};
LyteBox.prototype.resizeH=function(a,j,h,g,c){var b=c?c:(this.resizeDuration/2);
var d=this.doc.getElementById(a);
var f=(this.doAnimations?j:h);
d.style.height=(f)+"px";
if(f<h){f+=(f+g>=h)?(h-f):g
}else{if(f>h){f-=(f-g<=h)?(f-h):g
}}this.resizeHTimerArray[this.resizeHTimerCount++]=setTimeout("myLytebox.resizeH('"+a+"', "+f+", "+h+", "+g+", "+(b+0.02)+")",b+0.02);
if(parseInt(d.style.height)==h){this.hDone=true;
for(var e=0;
e<this.resizeHTimerCount;
e++){window.clearTimeout(this.resizeHTimerArray[e])
}}};
LyteBox.prototype.getPageScroll=function(){if(self.pageYOffset){return this.isFrame?parent.pageYOffset:self.pageYOffset
}else{if(this.doc.documentElement&&this.doc.documentElement.scrollTop){return this.doc.documentElement.scrollTop
}else{if(document.body){return this.doc.body.scrollTop
}}}};
LyteBox.prototype.getPageSize=function(){var e,a,c,f;
if(window.innerHeight&&window.scrollMaxY){e=this.doc.scrollWidth;
a=(this.isFrame?parent.innerHeight:self.innerHeight)+(this.isFrame?parent.scrollMaxY:self.scrollMaxY)
}else{if(this.doc.body.scrollHeight>this.doc.body.offsetHeight){e=this.doc.body.scrollWidth;
a=this.doc.body.scrollHeight
}else{e=this.doc.getElementsByTagName("html").item(0).offsetWidth;
a=this.doc.getElementsByTagName("html").item(0).offsetHeight;
e=(e<this.doc.body.offsetWidth)?this.doc.body.offsetWidth:e;
a=(a<this.doc.body.offsetHeight)?this.doc.body.offsetHeight:a
}}if(self.innerHeight){c=(this.isFrame)?parent.innerWidth:self.innerWidth;
f=(this.isFrame)?parent.innerHeight:self.innerHeight
}else{if(document.documentElement&&document.documentElement.clientHeight){c=this.doc.documentElement.clientWidth;
f=this.doc.documentElement.clientHeight
}else{if(document.body){c=this.doc.getElementsByTagName("html").item(0).clientWidth;
f=this.doc.getElementsByTagName("html").item(0).clientHeight;
c=(c==0)?this.doc.body.clientWidth:c;
f=(f==0)?this.doc.body.clientHeight:f
}}}var d=(a<f)?f:a;
var b=(e<c)?c:e;
return new Array(b,d,c,f)
};
LyteBox.prototype.toggleFlash=function(f){var d=this.doc.getElementsByTagName("object");
for(var b=0;
b<d.length;
b++){d[b].style.visibility=(f=="hide")?"hidden":"visible"
}var c=this.doc.getElementsByTagName("embed");
for(var b=0;
b<c.length;
b++){c[b].style.visibility=(f=="hide")?"hidden":"visible"
}if(this.isFrame){for(var b=0;
b<parent.frames.length;
b++){try{d=parent.frames[b].window.document.getElementsByTagName("object");
for(var a=0;
a<d.length;
a++){d[a].style.visibility=(f=="hide")?"hidden":"visible"
}}catch(g){}try{c=parent.frames[b].window.document.getElementsByTagName("embed");
for(var a=0;
a<c.length;
a++){c[a].style.visibility=(f=="hide")?"hidden":"visible"
}}catch(g){}}}};
LyteBox.prototype.toggleSelects=function(d){var c=this.doc.getElementsByTagName("select");
for(var b=0;
b<c.length;
b++){c[b].style.visibility=(d=="hide")?"hidden":"visible"
}if(this.isFrame){for(var b=0;
b<parent.frames.length;
b++){try{c=parent.frames[b].window.document.getElementsByTagName("select");
for(var a=0;
a<c.length;
a++){c[a].style.visibility=(d=="hide")?"hidden":"visible"
}}catch(f){}}}};
LyteBox.prototype.pause=function(b){var a=new Date();
var c=a.getTime()+b;
while(true){a=new Date();
if(a.getTime()>c){return
}}};
if(window.addEventListener){window.addEventListener("load",initLytebox,false)
}else{if(window.attachEvent){window.attachEvent("onload",initLytebox)
}else{window.onload=function(){initLytebox()
}
}}function initLytebox(){myLytebox=new LyteBox()
};