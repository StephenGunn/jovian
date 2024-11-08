import{a as f,t as u}from"../chunks/disclose-version.CaJuVmJL.js";import{p as K,c as s,r as t,s as o,t as m,v as c,m as w,a as N,ao as B,f as Q}from"../chunks/index-client.COie2tS9.js";import{e as L,i as M,t as C,S as T,f as E}from"../chunks/StarField.CrZEkz3F.js";import{d as U,e as F,s as h}from"../chunks/render.3nspZuyd.js";import{i as H}from"../chunks/props.epLwnScn.js";import{s as P,S as V}from"../chunks/SEO.B-PPfbc-.js";import{p as J}from"../chunks/proxy.CH_KK1PD.js";import{b as W}from"../chunks/this.IklShQAO.js";import{b as Z,a as $,c as ee}from"../chunks/dates.DZAEJcgk.js";const te=(_,a,d,v,r)=>{if(!c(a)||!Z||!c(d))return;const e=c(a).getBoundingClientRect();v.x=_.clientX-e.left,v.y=_.clientY-e.top,r.x=`${v.x/e.width*100}%`,r.y=`${v.y/e.height*100}%`};var ae=u("<span> </span>"),se=u('<div class="glow svelte-tkclz6"></div>'),re=u('<div class="glow_border svelte-tkclz6"></div>'),ie=u('<a class="svelte-tkclz6"><div class="background svelte-tkclz6"><div class="content svelte-tkclz6"><div class="title svelte-tkclz6"> </div> <div class="date svelte-tkclz6"><span> </span> <span> </span></div> <div class="desc svelte-tkclz6"> </div> <div class="categories svelte-tkclz6"><span class="cat-title svelte-tkclz6">Project categories:</span> <!></div></div> <!> <!></div> <!></a>');function oe(_,a){K(a,!0);let d=B(void 0),v=J({x:0,y:0}),r=B(!1),e=J({x:"50%",y:"20%"});var i=ie();i.__mousemove=[te,d,r,v,e];var g=s(i),j=s(g),n=s(j),x=s(n,!0);t(n);var k=o(n,2),b=s(k),O=s(b,!0);m(()=>h(O,$(a.project.date))),t(b);var S=o(b,2),R=s(S,!0);m(()=>h(R,ee(a.project.date))),t(S),t(k);var y=o(k,2),X=s(y,!0);t(y);var I=o(y,2),Y=o(s(I),2);L(Y,17,()=>a.project.categories,M,(p,l)=>{var z=ae(),G=s(z,!0);t(z),m(()=>h(G,c(l))),f(p,z)}),t(I),t(j);var A=o(j,2);H(A,()=>c(r),p=>{var l=se();m(()=>P(l,"style",`
    background-image: radial-gradient(
      circle at
      ${e.x??""}
      ${e.y??""},
      #ffffff0f,
      #00000000
    )
      `)),C(3,l,()=>E,()=>({duration:200})),f(p,l)});var q=o(A,2);T(q,{}),t(g);var D=o(g,2);H(D,()=>c(r),p=>{var l=re();m(()=>P(l,"style",`
    background-image: radial-gradient(
      circle at
      ${e.x??""} 
      ${e.y??""},
      var(--accent),
      #00000000
    )
      `)),C(3,l,()=>E,()=>({duration:200})),f(p,l)}),t(i),W(i,p=>w(d,p),()=>c(d)),m(()=>{P(i,"href",`/projects/${a.project.slug??""}`),h(x,a.project.title),h(X,a.project.description)}),F("mouseenter",i,()=>w(r,!0)),F("mouseleave",i,()=>w(r,!1)),f(_,i),N()}U(["mousemove"]);var ve=u('<li class="svelte-gjeujv"><!></li>'),le=u('<!> <div class="column"><h1 class="svelte-gjeujv">Projects</h1> <p class="desc svelte-gjeujv">Here are some of the projects I actively maintain.</p> <ul class="svelte-gjeujv"></ul></div>',1);function je(_,a){let{projects:d}=a.data;var v=le(),r=Q(v);V(r,{title:"Projects - JovianMoon.io",description:"A list of projects I maintain and want to highlight."});var e=o(r,2),i=o(s(e),4);L(i,21,()=>d,M,(g,j)=>{var n=ve(),x=s(n);oe(x,{get project(){return c(j)}}),t(n),f(g,n)}),t(i),t(e),f(_,v)}export{je as component};
