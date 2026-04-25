module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},92455,e=>{"use strict";var t=e.i(26747),r=e.i(90406),a=e.i(44898),o=e.i(62950),i=e.i(90490),s=e.i(17010),n=e.i(20485);async function u(e,t){if("GET"!==e.method)return t.status(405).json({message:"Method not allowed"});let{page:r,pageSize:a,search:o,from:i,to:n}=e.query,u=Math.max(parseInt(Array.isArray(r)?r[0]:r||"1",10)||1,1),d=Math.min(Math.max(parseInt(Array.isArray(a)?a[0]:a||"10",10)||10,1),100),l=(u-1)*d,p=(Array.isArray(o)?o[0]:o||"").trim(),m=(Array.isArray(i)?i[0]:i||"").trim(),c=(Array.isArray(n)?n[0]:n||"").trim(),h=['(o.status = "refunded" OR o.status = "refund_pending")'],_=[];if(p){h.push("(o.reference LIKE ? OR o.customer_first_name LIKE ? OR o.customer_last_name LIKE ? OR o.customer_email LIKE ?)");let e=`%${p}%`;_.push(e,e,e,e)}m&&(h.push("o.created_at >= ?"),_.push(`${m} 00:00:00`)),c&&(h.push("o.created_at <= ?"),_.push(`${c} 23:59:59`));let f=h.length>0?`WHERE ${h.join(" AND ")}`:"",y=await (0,s.safeQuery)(`SELECT COUNT(*) AS total FROM orders o ${f}`,_.length>0?_:void 0),g=y?.[0]?.total??0,v=[..._],E=await (0,s.safeQuery)(`SELECT 
      o.id,
      o.reference,
      o.chip_payment_id,
      o.customer_first_name,
      o.customer_last_name,
      o.customer_email,
      o.customer_phone,
      o.customer_address,
      o.customer_city,
      o.customer_state,
      o.customer_postcode,
      o.customer_country,
      o.customer_bank_account,
      o.customer_bank_code,
      o.customer_bank_holder_name,
      o.total_amount,
      o.refund_amount,
      o.currency,
      o.payment_method,
      o.status,
      o.created_at,
      o.paid_at,
      o.updated_at,
      o.notes
    FROM orders o
    ${f}
    ORDER BY o.updated_at DESC
    LIMIT ? OFFSET ?`,v.length>0?[...v,d,l]:[d,l]);return t.status(200).json({success:!0,refunds:E,pagination:{page:u,pageSize:d,total:g,totalPages:Math.ceil(g/d)}})}let d=(0,e.i(27975).withDefaultCompression)((0,n.withTimeout)((0,i.withErrorHandling)(u)));e.s(["default",0,d],56273);var l=e.i(56273),p=e.i(7031),m=e.i(81927),c=e.i(46432);let h=(0,o.hoist)(l,"default"),_=(0,o.hoist)(l,"config"),f=new a.PagesAPIRouteModule({definition:{kind:r.RouteKind.PAGES_API,page:"/api/admin/refunds",pathname:"/api/admin/refunds",bundlePath:"",filename:""},userland:l,distDir:".next",relativeProjectDir:""});async function y(e,r,a){a.requestMeta&&(0,c.setRequestMeta)(e,a.requestMeta),f.isDev&&(0,c.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let o="/api/admin/refunds";o=o.replace(/\/index$/,"")||"/";let i=await f.prepare(e,r,{srcPage:o});if(!i){r.statusCode=400,r.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve());return}let{query:s,params:n,prerenderManifest:u,routerServerContext:d}=i;try{let t,a=e.method||"GET",i=(0,p.getTracer)(),l=i.getActiveScopeSpan(),c=!!(null==d?void 0:d.isWrappedByNextServer),h=f.instrumentationOnRequestError.bind(f),_=async l=>f.render(e,r,{query:{...s,...n},params:n,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:u.preview,propagateError:!1,dev:f.isDev,page:"/api/admin/refunds",internalRevalidate:null==d?void 0:d.revalidate,onError:(...t)=>h(e,...t)}).finally(()=>{if(!l)return;l.setAttributes({"http.status_code":r.statusCode,"next.rsc":!1});let e=i.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=e.get("next.route");if(s){let e=`${a} ${s}`;l.setAttributes({"next.route":s,"http.route":s,"next.span_name":e}),l.updateName(e),t&&t!==l&&(t.setAttribute("http.route",s),t.updateName(e))}else l.updateName(`${a} ${o}`)});c&&l?await _(l):(t=i.getActiveScopeSpan(),await i.withPropagatedContext(e.headers,()=>i.trace(m.BaseServerSpan.handleRequest,{spanName:`${a} ${o}`,kind:p.SpanKind.SERVER,attributes:{"http.method":a,"http.target":e.url}},_),void 0,!c))}catch(e){if(f.isDev)throw e;(0,t.sendError)(r,500,"Internal Server Error")}finally{null==a.waitUntil||a.waitUntil.call(a,Promise.resolve())}}e.s(["config",0,_,"default",0,h,"handler",0,y],92455)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__07k7rr9._.js.map