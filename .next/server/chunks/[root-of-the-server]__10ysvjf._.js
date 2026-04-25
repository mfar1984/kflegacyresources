module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},115,(e,t,r)=>{t.exports=e.x("mysql2-3d80281e5ed34ca6/promise",()=>require("mysql2-3d80281e5ed34ca6/promise"))},54948,e=>{"use strict";let t=e.i(115).default.createPool({host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"root",database:process.env.DB_NAME||"kflr",waitForConnections:!0,connectionLimit:20,queueLimit:50,connectTimeout:1e4,enableKeepAlive:!0,keepAliveInitialDelay:0});async function r(e,r){let[s]=r&&r.length>0?await t.query(e,r):await t.query(e);return s}async function s(){try{return await t.query("SELECT 1"),!0}catch(e){return console.error("Database connection test failed:",e),!1}}e.s(["default",0,t,"getPoolMetrics",0,function(){let e=t.pool;return{totalConnections:e._allConnections?.length||0,activeConnections:e._acquiringConnections?.length||0,idleConnections:e._freeConnections?.length||0,queuedRequests:e._connectionQueue?.length||0}},"query",0,r,"testConnection",0,s])},5729,e=>{"use strict";var t=e.i(26747),r=e.i(90406),s=e.i(44898),a=e.i(62950),o=e.i(54948);async function n(e,t){let{email:r}=e.query,s=Array.isArray(r)?r[0]:r;if(!s)return t.status(400).json({success:!1,message:"Email is required"});if("GET"===e.method)try{let e=await (0,o.query)(`SELECT 
          customer_email AS email,
          customer_first_name AS first_name,
          customer_last_name AS last_name,
          customer_phone AS phone,
          customer_address AS address,
          customer_city AS city,
          customer_state AS state,
          customer_postcode AS postcode,
          customer_country AS country,
          COUNT(*) AS total_orders,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_orders,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_orders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
          SUM(CASE WHEN status = 'viewed' THEN 1 ELSE 0 END) AS viewed_orders,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) AS total_spent,
          MIN(created_at) AS first_order_date,
          MAX(created_at) AS last_order_date
        FROM orders
        WHERE customer_email = ?
        GROUP BY customer_email, customer_first_name, customer_last_name, customer_phone,
                 customer_address, customer_city, customer_state, customer_postcode, customer_country
        LIMIT 1`,[s]);if(0===e.length)return t.status(404).json({success:!1,message:"Customer not found"});let r=e[0],a=await (0,o.query)(`SELECT 
          id,
          reference,
          chip_payment_id,
          status,
          total_amount,
          currency,
          payment_method,
          created_at,
          paid_at
        FROM orders
        WHERE customer_email = ?
        ORDER BY created_at DESC
        LIMIT 10`,[s]);return t.status(200).json({success:!0,customer:r,orders:a})}catch(e){return console.error("Failed to fetch customer details:",e),t.status(500).json({success:!1,message:"Failed to fetch customer details",error:e instanceof Error?e.message:"Unknown error"})}return t.status(405).json({success:!1,message:"Method not allowed"})}e.s(["default",0,n],37907);var i=e.i(37907),u=e.i(7031),c=e.i(81927),l=e.i(46432);let d=(0,a.hoist)(i,"default"),m=(0,a.hoist)(i,"config"),p=new s.PagesAPIRouteModule({definition:{kind:r.RouteKind.PAGES_API,page:"/api/admin/customers/[email]",pathname:"/api/admin/customers/[email]",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function E(e,r,s){s.requestMeta&&(0,l.setRequestMeta)(e,s.requestMeta),p.isDev&&(0,l.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let a="/api/admin/customers/[email]";a=a.replace(/\/index$/,"")||"/";let o=await p.prepare(e,r,{srcPage:a});if(!o){r.statusCode=400,r.end("Bad Request"),null==s.waitUntil||s.waitUntil.call(s,Promise.resolve());return}let{query:n,params:i,prerenderManifest:d,routerServerContext:m}=o;try{let t,s=e.method||"GET",o=(0,u.getTracer)(),l=o.getActiveScopeSpan(),E=!!(null==m?void 0:m.isWrappedByNextServer),_=p.instrumentationOnRequestError.bind(p),S=async u=>p.render(e,r,{query:{...n,...i},params:i,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:d.preview,propagateError:!1,dev:p.isDev,page:"/api/admin/customers/[email]",internalRevalidate:null==m?void 0:m.revalidate,onError:(...t)=>_(e,...t)}).finally(()=>{if(!u)return;u.setAttributes({"http.status_code":r.statusCode,"next.rsc":!1});let e=o.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=e.get("next.route");if(n){let e=`${s} ${n}`;u.setAttributes({"next.route":n,"http.route":n,"next.span_name":e}),u.updateName(e),t&&t!==u&&(t.setAttribute("http.route",n),t.updateName(e))}else u.updateName(`${s} ${a}`)});E&&l?await S(l):(t=o.getActiveScopeSpan(),await o.withPropagatedContext(e.headers,()=>o.trace(c.BaseServerSpan.handleRequest,{spanName:`${s} ${a}`,kind:u.SpanKind.SERVER,attributes:{"http.method":s,"http.target":e.url}},S),void 0,!E))}catch(e){if(p.isDev)throw e;(0,t.sendError)(r,500,"Internal Server Error")}finally{null==s.waitUntil||s.waitUntil.call(s,Promise.resolve())}}e.s(["config",0,m,"default",0,d,"handler",0,E],5729)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__10ysvjf._.js.map