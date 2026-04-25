module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},115,(e,t,r)=>{t.exports=e.x("mysql2-3d80281e5ed34ca6/promise",()=>require("mysql2-3d80281e5ed34ca6/promise"))},54948,e=>{"use strict";let t=e.i(115).default.createPool({host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"root",database:process.env.DB_NAME||"kflr",waitForConnections:!0,connectionLimit:20,queueLimit:50,connectTimeout:1e4,enableKeepAlive:!0,keepAliveInitialDelay:0});async function r(e,r){let[a]=r&&r.length>0?await t.query(e,r):await t.query(e);return a}async function a(){try{return await t.query("SELECT 1"),!0}catch(e){return console.error("Database connection test failed:",e),!1}}e.s(["default",0,t,"getPoolMetrics",0,function(){let e=t.pool;return{totalConnections:e._allConnections?.length||0,activeConnections:e._acquiringConnections?.length||0,idleConnections:e._freeConnections?.length||0,queuedRequests:e._connectionQueue?.length||0}},"query",0,r,"testConnection",0,a])},73212,e=>{"use strict";var t=e.i(26747),r=e.i(90406),a=e.i(44898),s=e.i(62950),i=e.i(54948);async function n(e,t){if("GET"!==e.method)return t.status(405).json({message:"Method not allowed"});try{let{category:r,search:a,status:s="active",sort:n="newest",limit:o="12",offset:c="0"}=e.query,p=parseInt(o),u=parseInt(c),l=`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description,
        p.price,
        p.compare_price,
        p.currency,
        p.sku,
        p.stock_quantity,
        p.track_inventory,
        p.images,
        p.featured_image,
        p.tags,
        p.status,
        p.brand,
        p.vendor,
        p.created_at,
        GROUP_CONCAT(c.name SEPARATOR ', ') as category_names,
        GROUP_CONCAT(c.slug SEPARATOR ',') as category_slugs
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.status = ?
    `,d=[s];if(r&&"all"!==r&&(l+=" AND c.slug = ?",d.push(r)),a){l+=" AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)";let e=`%${a}%`;d.push(e,e,e)}switch(l+=" GROUP BY p.id",n){case"price_asc":l+=" ORDER BY p.price ASC";break;case"price_desc":l+=" ORDER BY p.price DESC";break;case"name_asc":l+=" ORDER BY p.name ASC";break;case"name_desc":l+=" ORDER BY p.name DESC";break;default:l+=" ORDER BY p.created_at DESC"}l+=" LIMIT ? OFFSET ?",d.push(p,u);let g=await (0,i.query)(l,d),m=`
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.status = ?
    `,h=[s];if(r&&"all"!==r&&(m+=" AND c.slug = ?",h.push(r)),a){m+=" AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)";let e=`%${a}%`;h.push(e,e,e)}let E=await (0,i.query)(m,h),R=E[0]?.total||0,f=g.map(e=>{let t=[],r=[];try{t=e.images?JSON.parse(e.images):[]}catch(r){console.error(`Invalid JSON in images for product ${e.id}:`,e.images),t=[]}try{r=e.tags?JSON.parse(e.tags):[]}catch(t){console.error(`Invalid JSON in tags for product ${e.id}:`,e.tags),r="string"==typeof e.tags&&e.tags.trim()?e.tags.split(",").map(e=>e.trim()).filter(e=>e):[]}return{...e,images:t,tags:r,category_slugs:e.category_slugs?e.category_slugs.split(","):[]}});return t.status(200).json({success:!0,products:f,pagination:{total:R,limit:p,offset:u,pages:Math.ceil(R/p),currentPage:Math.floor(u/p)+1}})}catch(e){return console.error("Error fetching products:",e),t.status(500).json({success:!1,message:"Failed to fetch products",error:e instanceof Error?e.message:"Unknown error"})}}e.s(["default",0,n],73648);var o=e.i(73648),c=e.i(7031),p=e.i(81927),u=e.i(46432);let l=(0,s.hoist)(o,"default"),d=(0,s.hoist)(o,"config"),g=new a.PagesAPIRouteModule({definition:{kind:r.RouteKind.PAGES_API,page:"/api/products",pathname:"/api/products",bundlePath:"",filename:""},userland:o,distDir:".next",relativeProjectDir:""});async function m(e,r,a){a.requestMeta&&(0,u.setRequestMeta)(e,a.requestMeta),g.isDev&&(0,u.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let s="/api/products";s=s.replace(/\/index$/,"")||"/";let i=await g.prepare(e,r,{srcPage:s});if(!i){r.statusCode=400,r.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve());return}let{query:n,params:o,prerenderManifest:l,routerServerContext:d}=i;try{let t,a=e.method||"GET",i=(0,c.getTracer)(),u=i.getActiveScopeSpan(),m=!!(null==d?void 0:d.isWrappedByNextServer),h=g.instrumentationOnRequestError.bind(g),E=async c=>g.render(e,r,{query:{...n,...o},params:o,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:l.preview,propagateError:!1,dev:g.isDev,page:"/api/products",internalRevalidate:null==d?void 0:d.revalidate,onError:(...t)=>h(e,...t)}).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":r.statusCode,"next.rsc":!1});let e=i.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=e.get("next.route");if(n){let e=`${a} ${n}`;c.setAttributes({"next.route":n,"http.route":n,"next.span_name":e}),c.updateName(e),t&&t!==c&&(t.setAttribute("http.route",n),t.updateName(e))}else c.updateName(`${a} ${s}`)});m&&u?await E(u):(t=i.getActiveScopeSpan(),await i.withPropagatedContext(e.headers,()=>i.trace(p.BaseServerSpan.handleRequest,{spanName:`${a} ${s}`,kind:c.SpanKind.SERVER,attributes:{"http.method":a,"http.target":e.url}},E),void 0,!m))}catch(e){if(g.isDev)throw e;(0,t.sendError)(r,500,"Internal Server Error")}finally{null==a.waitUntil||a.waitUntil.call(a,Promise.resolve())}}e.s(["config",0,d,"default",0,l,"handler",0,m],73212)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0hfrw1_._.js.map