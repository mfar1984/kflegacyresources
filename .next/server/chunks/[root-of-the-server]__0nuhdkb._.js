module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},115,(e,t,r)=>{t.exports=e.x("mysql2-3d80281e5ed34ca6/promise",()=>require("mysql2-3d80281e5ed34ca6/promise"))},54948,e=>{"use strict";let t=e.i(115).default.createPool({host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"root",database:process.env.DB_NAME||"kflr",waitForConnections:!0,connectionLimit:20,queueLimit:50,connectTimeout:1e4,enableKeepAlive:!0,keepAliveInitialDelay:0});async function r(e,r){let[a]=r&&r.length>0?await t.query(e,r):await t.query(e);return a}async function a(){try{return await t.query("SELECT 1"),!0}catch(e){return console.error("Database connection test failed:",e),!1}}e.s(["default",0,t,"getPoolMetrics",0,function(){let e=t.pool;return{totalConnections:e._allConnections?.length||0,activeConnections:e._acquiringConnections?.length||0,idleConnections:e._freeConnections?.length||0,queuedRequests:e._connectionQueue?.length||0}},"query",0,r,"testConnection",0,a])},50489,e=>{"use strict";var t=e.i(26747),r=e.i(90406),a=e.i(44898),o=e.i(62950),n=e.i(54948);async function s(e,t){if("GET"!==e.method)return t.status(405).json({message:"Method not allowed"});try{let{page:r,pageSize:a,search:o,status:s,from:i,to:c}=e.query,u=Math.max(parseInt(Array.isArray(r)?r[0]:r||"1",10)||1,1),l=Math.min(Math.max(parseInt(Array.isArray(a)?a[0]:a||"10",10)||10,1),100),p=(u-1)*l,d=(Array.isArray(o)?o[0]:o||"").trim(),m=(Array.isArray(s)?s[0]:s||"").trim(),h=(Array.isArray(i)?i[0]:i||"").trim(),_=(Array.isArray(c)?c[0]:c||"").trim(),y=["o.chip_payment_id IS NOT NULL",'o.chip_payment_id != ""'],f=[];if(d){y.push("(o.chip_payment_id LIKE ? OR o.reference LIKE ? OR o.customer_email LIKE ?)");let e=`%${d}%`;f.push(e,e,e)}m&&(y.push("o.status = ?"),f.push(m)),h&&(y.push("o.created_at >= ?"),f.push(`${h} 00:00:00`)),_&&(y.push("o.created_at <= ?"),f.push(`${_} 23:59:59`));let g=y.length>0?`WHERE ${y.join(" AND ")}`:"",v=await (0,n.query)(`SELECT COUNT(*) AS total FROM orders o ${g}`,f),A=v?.[0]?.total??0,E=[...f],S=await (0,n.query)(`SELECT 
        o.id,
        o.reference,
        o.chip_payment_id AS transaction_id,
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
        o.status,
        o.total_amount,
        o.refund_amount,
        o.currency,
        o.payment_method,
        o.created_at,
        o.paid_at,
        o.updated_at,
        o.notes
      FROM orders o
      ${g}
      ORDER BY o.created_at DESC
      LIMIT ${l} OFFSET ${p}`,E);return t.status(200).json({success:!0,transactions:S,pagination:{page:u,pageSize:l,total:A,totalPages:Math.ceil(A/l)}})}catch(e){return console.error("Failed to fetch CHIP transactions:",e),t.status(500).json({success:!1,message:"Failed to fetch transactions",error:e instanceof Error?e.message:"Unknown error"})}}e.s(["default",0,s],32300);var i=e.i(32300),c=e.i(7031),u=e.i(81927),l=e.i(46432);let p=(0,o.hoist)(i,"default"),d=(0,o.hoist)(i,"config"),m=new a.PagesAPIRouteModule({definition:{kind:r.RouteKind.PAGES_API,page:"/api/chip-asia/transactions",pathname:"/api/chip-asia/transactions",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function h(e,r,a){a.requestMeta&&(0,l.setRequestMeta)(e,a.requestMeta),m.isDev&&(0,l.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let o="/api/chip-asia/transactions";o=o.replace(/\/index$/,"")||"/";let n=await m.prepare(e,r,{srcPage:o});if(!n){r.statusCode=400,r.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve());return}let{query:s,params:i,prerenderManifest:p,routerServerContext:d}=n;try{let t,a=e.method||"GET",n=(0,c.getTracer)(),l=n.getActiveScopeSpan(),h=!!(null==d?void 0:d.isWrappedByNextServer),_=m.instrumentationOnRequestError.bind(m),y=async c=>m.render(e,r,{query:{...s,...i},params:i,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:p.preview,propagateError:!1,dev:m.isDev,page:"/api/chip-asia/transactions",internalRevalidate:null==d?void 0:d.revalidate,onError:(...t)=>_(e,...t)}).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":r.statusCode,"next.rsc":!1});let e=n.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=e.get("next.route");if(s){let e=`${a} ${s}`;c.setAttributes({"next.route":s,"http.route":s,"next.span_name":e}),c.updateName(e),t&&t!==c&&(t.setAttribute("http.route",s),t.updateName(e))}else c.updateName(`${a} ${o}`)});h&&l?await y(l):(t=n.getActiveScopeSpan(),await n.withPropagatedContext(e.headers,()=>n.trace(u.BaseServerSpan.handleRequest,{spanName:`${a} ${o}`,kind:c.SpanKind.SERVER,attributes:{"http.method":a,"http.target":e.url}},y),void 0,!h))}catch(e){if(m.isDev)throw e;(0,t.sendError)(r,500,"Internal Server Error")}finally{null==a.waitUntil||a.waitUntil.call(a,Promise.resolve())}}e.s(["config",0,d,"default",0,p,"handler",0,h],50489)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0nuhdkb._.js.map