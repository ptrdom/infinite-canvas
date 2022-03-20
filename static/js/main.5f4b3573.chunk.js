(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{16:function(e,t,n){e.exports=n(17)},17:function(e,t,n){"use strict";n.r(t);var r=n(6),a=n(12),o=n(5),u=n(3),c=n(1),i=n(2),l=n.n(i),d=n(14),s=n(8),f=n(24),m=function e(t){Object(c.a)(this,e),this.name=t};m.Mouse=new m("mouse"),m.Trackpad=new m("trackpad");var b=function e(t,n,r,a,o){Object(c.a)(this,e),this.id=t,this.x=n,this.y=r,this.text=a,this.dragging=o},p=function e(t){Object(c.a)(this,e),this.name=t};p.Up=new p("up"),p.Down=new p("down"),p.Hold=new p("hold");var g=function(){function e(t,n){Object(c.a)(this,e),this.previous=t,this.current=n}return Object(u.a)(e,[{key:"enqueue",value:function(t){return new e(this.current,t)}}]),e}();g.Initial=new g(null,p.Up);var v=function e(t,n,r){Object(c.a)(this,e),this.downEventListenerType=t,this.upEventListenerType=n,this.buttonCode=r};function h(e){var t=Object(i.useState)(g.Initial),n=Object(o.a)(t,2),r=n[0],a=n[1],u=l.a.useRef(null);return Object(i.useEffect)(function(){var t=function(t){t.button===e.buttonCode&&(a(function(e){return e.enqueue(p.Down)}),u.current||(u.current=setInterval(function(){a(function(e){return e.enqueue(p.Hold)})},100)))};return document.addEventListener(e.downEventListenerType,t),function(){return document.removeEventListener(e.downEventListenerType,t)}},[]),Object(i.useEffect)(function(){var t=function(t){t.button===e.buttonCode&&(u.current&&(clearInterval(u.current),u.current=null),a(function(e){return e.enqueue(p.Up)}))};return document.addEventListener(e.upEventListenerType,t),function(){return document.removeEventListener(e.upEventListenerType,t)}},[]),r}v.MouseLeft=new v("mousedown","mouseup",0),v.MouseRight=new v("mousedown","mouseup",2);var w=function(){var e=Object(i.useState)(function(){try{var e=localStorage.getItem("shapes");return e?JSON.parse(e).map(function(e){return Object.assign(new b,e)}):[]}catch(t){return console.warn("Failed to get shapes from localStorage, falling back to default",t),[]}}),t=Object(o.a)(e,2),n=t[0],u=t[1],c=Object(i.useState)(null),d=Object(o.a)(c,2),g=d[0],w=d[1],E=Object(i.useState)(function(){try{var e=localStorage.getItem("viewportCoordinates");return e?JSON.parse(e):{x:0,y:0}}catch(t){return console.warn("Failed to get viewportCoordinates from localStorage, falling back to default",t),{x:0,y:0}}}),y=Object(o.a)(E,2),x=y[0],O=y[1],j=h(v.MouseRight),k=Object(i.useState)(!1),S=Object(o.a)(k,2),C=S[0],L=S[1],I=Object(i.useState)(function(){try{var e=localStorage.getItem("controlMode");return e?m[Object.keys(m).find(function(t){return t.toLowerCase()===e})]:m.Mouse}catch(t){return console.warn("Failed to get controlMode from localStorage, falling back to default",t),m.Mouse}}),M=Object(o.a)(I,2),T=M[0],N=M[1];Object(i.useEffect)(function(){if(T===m.Trackpad){var e=function(e){O(function(t){return{x:t.x+-e.deltaX,y:t.y+-e.deltaY}})};return document.addEventListener("wheel",e),function(){return document.removeEventListener("wheel",e)}}},[T]),Object(i.useEffect)(function(){var e=function(e){e.preventDefault()};return document.addEventListener("contextmenu",e),function(){return document.removeEventListener("contextmenu",e)}},[]),Object(i.useEffect)(function(){L(j.current===p.Hold)},[j]),Object(i.useEffect)(function(){if(C){var e=function(e){O(function(t){return{x:t.x+e.movementX,y:t.y+e.movementY}})};return document.addEventListener("mousemove",e),function(){return document.removeEventListener("mousemove",e)}}},[C]);Object(i.useEffect)(function(){localStorage.setItem("viewportCoordinates",JSON.stringify(x))},[x]),Object(i.useEffect)(function(){localStorage.setItem("controlMode",T.name)},[T]);Object(i.useEffect)(function(){localStorage.setItem("shapes",JSON.stringify(n))},[n]);return l.a.createElement(l.a.Fragment,null,l.a.createElement("div",{style:{position:"absolute",border:"1px solid black",padding:"10px",zIndex:1,backgroundColor:"white"}},"DEBUG",l.a.createElement("br",null),"Viewport x:",x.x," y:",x.y,l.a.createElement("br",null),"Mouse right:",j.current.name,l.a.createElement("br",null),"Canvas pan enabled:",C?"true":"false",l.a.createElement("br",null),"Selected shape: ",g?g.id:"null"),l.a.createElement("div",{style:{position:"absolute",border:"1px solid black",padding:"10px",zIndex:1,right:"5px",backgroundColor:"white"}},"Control mode:",l.a.createElement("div",null,l.a.createElement("input",{type:"radio",value:m.Mouse.name,name:"control-mode",checked:T===m.Mouse,onChange:function(){return N(m.Mouse)}})," ",m.Mouse.name,l.a.createElement("input",{type:"radio",value:m.Trackpad.name,name:"control-mode",checked:T===m.Trackpad,onChange:function(){return N(m.Trackpad)}})," ",m.Trackpad.name),"Focus shape:",l.a.createElement("select",{value:"",onChange:function(e){var t=n.find(function(t){return t.id.toString()===e.target.value});if(!t)throw new Error("Failed to find shape by id.");O({x:-t.x-50+window.innerWidth/2,y:-t.y-50+window.innerHeight/2})}},l.a.createElement("option",{value:""}),n.map(function(e){return l.a.createElement("option",{key:e.id,value:e.id},e.id)}))),l.a.createElement("div",{style:{position:"absolute",border:"1px solid black",padding:"10px",zIndex:1,top:"50%",backgroundColor:"white"}},l.a.createElement("button",{onClick:function(){return function(){var e=new b(Object(f.a)(),-x.x+window.innerWidth/2,-x.y+window.innerHeight/2,"",!1);u(function(t){return[].concat(Object(a.a)(t),[e])})}()}},"Add Rect")),g?l.a.createElement(l.a.Fragment,null,l.a.createElement("div",{style:{position:"absolute",border:"1px solid black",padding:"10px",zIndex:1,top:"50%",right:"5px",backgroundColor:"white"}},"Shape",l.a.createElement("br",null),"ID: ",g.id,l.a.createElement("br",null),"Text:",l.a.createElement("input",{type:"text",onChange:function(e){var t=e.target.value;w(function(e){return Object(r.a)({},e,{text:t})}),u(function(e){return e.map(function(e){return e.id===g.id?Object(r.a)({},e,{text:t}):e})})},value:g.text||""}),"X:",l.a.createElement("input",{type:"number",onChange:function(e){var t;t=isNaN(e.target.valueAsNumber)?0:e.target.valueAsNumber,w(function(e){return Object(r.a)({},e,{x:t})}),u(function(e){return e.map(function(e){return e.id===g.id?Object(r.a)({},e,{x:t}):e})})},value:g.x}),"Y:",l.a.createElement("input",{type:"number",onChange:function(e){var t;t=isNaN(e.target.valueAsNumber)?0:e.target.valueAsNumber,w(function(e){return Object(r.a)({},e,{y:t})}),u(function(e){return e.map(function(e){return e.id===g.id?Object(r.a)({},e,{y:t}):e})})},value:g.y}))):null,l.a.createElement(s.d,{width:window.innerWidth-20,height:window.innerHeight-20,onClick:function(e){e.target===e.target.getStage()&&w(null)}},l.a.createElement(s.b,null,n.map(function(e){return l.a.createElement(s.a,{key:e.id,x:e.x+x.x,y:e.y+x.y,draggable:!0,onDragStart:function(){u(function(t){return t.map(function(t){return t.id===e.id?Object(r.a)({},t,{dragging:!0}):t})})},onDragEnd:function(t){u(function(n){return n.map(function(n){return n.id===e.id?Object(r.a)({},n,{dragging:!1,x:t.target.x()-x.x,y:t.target.y()-x.y}):n})})},onClick:function(){w(e)}},l.a.createElement(s.c,{width:100,height:100,fill:e.dragging?"black":"green"}),l.a.createElement(s.e,{x:25,y:100/6,text:e.text,fill:e.dragging?"green":"black",wrap:"char",width:50}))}))))};Object(d.render)(l.a.createElement(w,null),document.getElementById("root"))}},[[16,2,1]]]);
//# sourceMappingURL=main.5f4b3573.chunk.js.map