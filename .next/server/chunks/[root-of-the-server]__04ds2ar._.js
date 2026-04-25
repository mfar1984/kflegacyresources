module.exports=[70406,(e,t,i)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},24361,(e,t,i)=>{t.exports=e.x("util",()=>require("util"))},16079,e=>{"use strict";var t=e.i(26747),i=e.i(90406),r=e.i(44898),o=e.i(62950),a=e.i(90490),s=e.i(17010),n=e.i(20485);async function d(e,t){let i;if("GET"!==e.method)return t.status(405).json({message:"Method not allowed"});let{email:r,reference:o}=e.query;if(!r&&!o)return t.status(400).json({success:!1,message:"Email or reference parameter is required"});o?i=await (0,s.safeQuery)(`SELECT 
        o.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_price', oi.product_price,
            'quantity', oi.quantity,
            'selected_options', oi.selected_options,
            'subtotal', oi.subtotal
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.reference = ?
      GROUP BY o.id`,[o]):r&&(i=await (0,s.safeQuery)(`SELECT 
        o.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_price', oi.product_price,
            'quantity', oi.quantity,
            'selected_options', oi.selected_options,
            'subtotal', oi.subtotal
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_email = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC`,[r]));let a=i.map(e=>({...e,items:"string"==typeof e.items?JSON.parse(e.items):e.items}));return t.status(200).json({success:!0,orders:a})}let u=(0,e.i(27975).withDefaultCompression)((0,n.withTimeout)((0,a.withErrorHandling)(d)));e.s(["default",0,u],56922);var l=e.i(56922),p=e.i(7031),c=e.i(81927),m=e.i(46432);let _=(0,o.hoist)(l,"default"),h=(0,o.hoist)(l,"config"),E=new r.PagesAPIRouteModule({definition:{kind:i.RouteKind.PAGES_API,page:"/api/orders",pathname:"/api/orders",bundlePath:"",filename:""},userland:l,distDir:".next",relativeProjectDir:""});async function f(e,i,r){r.requestMeta&&(0,m.setRequestMeta)(e,r.requestMeta),E.isDev&&(0,m.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let o="/api/orders";o=o.replace(/\/index$/,"")||"/";let a=await E.prepare(e,i,{srcPage:o});if(!a){i.statusCode=400,i.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve());return}let{query:s,params:n,prerenderManifest:d,routerServerContext:u}=a;try{let t,r=e.method||"GET",a=(0,p.getTracer)(),l=a.getActiveScopeSpan(),m=!!(null==u?void 0:u.isWrappedByNextServer),_=E.instrumentationOnRequestError.bind(E),h=async l=>E.render(e,i,{query:{...s,...n},params:n,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:d.preview,propagateError:!1,dev:E.isDev,page:"/api/orders",internalRevalidate:null==u?void 0:u.revalidate,onError:(...t)=>_(e,...t)}).finally(()=>{if(!l)return;l.setAttributes({"http.status_code":i.statusCode,"next.rsc":!1});let e=a.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=e.get("next.route");if(s){let e=`${r} ${s}`;l.setAttributes({"next.route":s,"http.route":s,"next.span_name":e}),l.updateName(e),t&&t!==l&&(t.setAttribute("http.route",s),t.updateName(e))}else l.updateName(`${r} ${o}`)});m&&l?await h(l):(t=a.getActiveScopeSpan(),await a.withPropagatedContext(e.headers,()=>a.trace(c.BaseServerSpan.handleRequest,{spanName:`${r} ${o}`,kind:p.SpanKind.SERVER,attributes:{"http.method":r,"http.target":e.url}},h),void 0,!m))}catch(e){if(E.isDev)throw e;(0,t.sendError)(i,500,"Internal Server Error")}finally{null==r.waitUntil||r.waitUntil.call(r,Promise.resolve())}}e.s(["config",0,h,"default",0,_,"handler",0,f],16079)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__04ds2ar._.js.map