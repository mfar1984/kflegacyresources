module.exports=[14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},115,(e,t,r)=>{t.exports=e.x("mysql2-3d80281e5ed34ca6/promise",()=>require("mysql2-3d80281e5ed34ca6/promise"))},54948,e=>{"use strict";let t=e.i(115).default.createPool({host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"root",database:process.env.DB_NAME||"kflr",waitForConnections:!0,connectionLimit:20,queueLimit:50,connectTimeout:1e4,enableKeepAlive:!0,keepAliveInitialDelay:0});async function r(e,r){let[o]=r&&r.length>0?await t.query(e,r):await t.query(e);return o}async function o(){try{return await t.query("SELECT 1"),!0}catch(e){return console.error("Database connection test failed:",e),!1}}e.s(["default",0,t,"getPoolMetrics",0,function(){let e=t.pool;return{totalConnections:e._allConnections?.length||0,activeConnections:e._acquiringConnections?.length||0,idleConnections:e._freeConnections?.length||0,queuedRequests:e._connectionQueue?.length||0}},"query",0,r,"testConnection",0,o])},95765,e=>e.a(async(t,r)=>{try{let t=await e.y("formidable-f7b7456c24eef66c");e.n(t),r()}catch(e){r(e)}},!0),84423,(e,t,r)=>{t.exports=e.x("nodemailer-9c35dd349a8aaa9f",()=>require("nodemailer-9c35dd349a8aaa9f"))},96927,e=>{"use strict";var t=e.i(84423),r=e.i(54948);let o=null,s=null,a=0;async function i(){let e=Date.now();if(s&&e-a<3e5)return s;try{let t=await (0,r.query)("SELECT setting_key, setting_value FROM site_settings WHERE setting_type = ?",["email"]),o={};t.forEach(e=>{o[e.setting_key]=e.setting_value});let i={smtp_host:o.smtp_host||process.env.SMTP_HOST||"indigo.herosite.pro",smtp_port:o.smtp_port||process.env.SMTP_PORT||"587",smtp_username:o.smtp_username||process.env.SMTP_USER||"enquiry@kflegacyresources.com",smtp_password:o.smtp_password||process.env.SMTP_PASSWORD||"F@iz@n!984",smtp_encryption:o.smtp_encryption||"tls",smtp_from_name:o.smtp_from_name||"KF Legacy Resources",smtp_from_email:o.smtp_from_email||process.env.SMTP_FROM||"enquiry@kflegacyresources.com",smtp_reply_to:o.smtp_reply_to||"enquiry@kflegacyresources.com"};return s=i,a=e,i}catch(r){console.error("Failed to fetch email settings from database:",r);let t={smtp_host:process.env.SMTP_HOST||"indigo.herosite.pro",smtp_port:process.env.SMTP_PORT||"587",smtp_username:process.env.SMTP_USER||"enquiry@kflegacyresources.com",smtp_password:process.env.SMTP_PASSWORD||"F@iz@n!984",smtp_encryption:"tls",smtp_from_name:"KF Legacy Resources",smtp_from_email:process.env.SMTP_FROM||"enquiry@kflegacyresources.com",smtp_reply_to:"enquiry@kflegacyresources.com"};return s=t,a=e,t}}async function n(){let e=await i();if(o)try{return await o.verify(),o}catch(e){console.log("[Email] Transporter verification failed, recreating..."),o.close(),o=null}return console.log("[Email] Creating new transporter with connection pooling"),o=t.default.createTransport({host:e.smtp_host,port:parseInt(e.smtp_port),secure:"ssl"===e.smtp_encryption,auth:{user:e.smtp_username,pass:e.smtp_password},tls:{rejectUnauthorized:!1},pool:!0,maxConnections:5,maxMessages:100,connectionTimeout:1e4,greetingTimeout:1e4})}async function l(e){let t=await n(),r=await i(),o={from:`"${r.smtp_from_name}" <${r.smtp_from_email}>`,to:r.smtp_username,replyTo:r.smtp_reply_to,subject:`New Quotation Request from ${e.firstName} ${e.lastName}`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #012970; border-bottom: 2px solid #4154f1; padding-bottom: 10px;">New Quotation Request</h2>
        
        <h3 style="color: #444; margin-top: 20px;">Personal Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Title:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.firstName} ${e.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>HP Number:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.hpNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.email}</td>
          </tr>
        </table>

        <h3 style="color: #444; margin-top: 20px;">Company Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Company Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Address:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.companyAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Office Tel:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.officeTel}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Office Fax:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.officeFax}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Website:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.website}</td>
          </tr>
        </table>

        <h3 style="color: #444; margin-top: 20px;">Question/Request</h3>
        <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #4154f1; margin-top: 10px;">
          ${e.question.replace(/\n/g,"<br>")}
        </div>

        <p style="margin-top: 30px; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
          This email was sent from the KF Legacy Resources website quotation form.
        </p>
      </div>
    `,attachments:e.attachmentPath?[{filename:e.attachmentName||"attachment",path:e.attachmentPath}]:[]},s={from:`"${r.smtp_from_name}" <${r.smtp_from_email}>`,to:e.email,replyTo:r.smtp_reply_to,subject:"Thank you for your Quotation Request - KF Legacy Resources",html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #012970; border-bottom: 2px solid #4154f1; padding-bottom: 10px;">Thank You for Your Request</h2>
        
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Dear ${e.title} ${e.firstName} ${e.lastName},</p>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Thank you for submitting your quotation request to KF Legacy Resources. We have received your inquiry and our team will review it shortly.
        </p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #012970; margin-top: 0;">What happens next?</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Our team will review your request within 24 hours</li>
            <li>We will prepare a detailed quotation based on your requirements</li>
            <li>You will receive our response via email or phone call</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          If you have any urgent questions, please feel free to contact us:
        </p>

        <table style="width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 5px;"><strong>Email:</strong></td>
            <td style="padding: 5px;">enquiry@kflegacyresources.com</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>Phone:</strong></td>
            <td style="padding: 5px;">+60 3-9132 2122</td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Best regards,<br>
          <strong>KF Legacy Resources Team</strong>
        </p>

        <p style="margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
          This is an automated confirmation email. Please do not reply to this email.
        </p>
      </div>
    `};await t.sendMail(o),await t.sendMail(s)}async function p(e){let t=await n(),r=await i();await t.sendMail({from:`${r.smtp_from_email}`,to:r.smtp_username,replyTo:r.smtp_reply_to,subject:"New Newsletter Subscriber – KF Legacy Resources",text:`New subscriber: ${e.email}`});let o=process.env.SITE_URL||"https://www.kflegacyresources.com",s=`${o}/assets/img/logo.png`,a=`
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f9fc;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;">
          <tr>
            <td style="background:#0d6efd;padding:18px 24px;" align="left">
              <img src="${s}" alt="KF Legacy Resources" height="32" style="display:block;border:0;outline:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px 28px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;line-height:28px;color:#0b1220;">Thank you for subscribing</h1>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#334155;">Hi there,</p>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#334155;">You're now subscribed to updates from <strong>KF Legacy Resources</strong>. We'll occasionally share product updates, case studies and useful tips.</p>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:22px;color:#334155;">In the meantime, feel free to visit our website.</p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;" bgcolor="#0d6efd">
                    <a href="${o}" style="display:inline-block;padding:10px 16px;font-size:14px;color:#ffffff;text-decoration:none;border-radius:8px;">Visit Website</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 28px 28px;border-top:1px solid #eef2f7;">
              <p style="margin:0;font-size:12px;color:#64748b;">You're receiving this email because you subscribed on our site. If this wasn't you, simply ignore this email.</p>
              <p style="margin:8px 0 0 0;font-size:12px;color:#94a3b8;">\xa9 ${new Date().getFullYear()} KF Legacy Resources</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;await t.sendMail({from:`${r.smtp_from_email}`,to:e.email,replyTo:r.smtp_reply_to,subject:"Thank you for subscribing – KF Legacy Resources",html:a,text:`Thank you for subscribing to KF Legacy Resources. Visit ${o}`})}e.s(["sendQuotationEmail",0,l,"sendSubscriptionEmails",0,p])},24868,(e,t,r)=>{t.exports=e.x("fs/promises",()=>require("fs/promises"))},62164,e=>e.a(async(t,r)=>{try{var o=e.i(95765),s=e.i(24868),a=e.i(14747),i=e.i(54948),n=e.i(96927),l=t([o]);async function p(e,t){if("POST"!==e.method)return t.status(405).json({error:"Method not allowed"});try{let r,l,p,d=new o.IncomingForm({uploadDir:a.default.join(process.cwd(),"public","uploads"),keepExtensions:!0,maxFileSize:0x1e00000,filter:function({mimetype:e}){return"application/pdf"===e||"image/png"===e||"image/jpeg"===e||"image/jpg"===e}}),c=a.default.join(process.cwd(),"public","uploads");try{await s.default.access(c)}catch{await s.default.mkdir(c,{recursive:!0})}let[m,u]=await new Promise((t,r)=>{d.parse(e,(e,o,s)=>{e&&r(e),t([o,s])})}),y={title:Array.isArray(m.title)?m.title[0]:m.title||"",firstName:Array.isArray(m.firstName)?m.firstName[0]:m.firstName||"",lastName:Array.isArray(m.lastName)?m.lastName[0]:m.lastName||"",hpNumber:Array.isArray(m.hpNumber)?m.hpNumber[0]:m.hpNumber||"",email:Array.isArray(m.email)?m.email[0]:m.email||"",companyName:Array.isArray(m.companyName)?m.companyName[0]:m.companyName||"",companyAddress:Array.isArray(m.companyAddress)?m.companyAddress[0]:m.companyAddress||"",officeTel:Array.isArray(m.officeTel)?m.officeTel[0]:m.officeTel||"",officeFax:Array.isArray(m.officeFax)?m.officeFax[0]:m.officeFax||"",website:Array.isArray(m.website)?m.website[0]:m.website||"",question:Array.isArray(m.question)?m.question[0]:m.question||""};if(u.document){let e=Array.isArray(u.document)?u.document[0]:u.document;e&&"filepath"in e&&(r=e.filepath,l=e.originalFilename||"document",p=e.size)}let f=await i.default.getConnection();try{return await f.execute(`INSERT INTO quotation_requests 
        (title, first_name, last_name, hp_number, email, company_name, company_address, 
         office_tel, office_fax, website, question, attachment_name, attachment_size, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,[y.title,y.firstName,y.lastName,y.hpNumber,y.email,y.companyName,y.companyAddress,y.officeTel,y.officeFax,y.website,y.question,l||null,p||null]),await (0,n.sendQuotationEmail)({...y,attachmentPath:r,attachmentName:l}),f.release(),t.status(200).json({success:!0,message:"Quotation request submitted successfully"})}catch(e){throw f.release(),console.error("Database error:",e),e}}catch(e){return console.error("Error processing quotation request:",e),t.status(500).json({error:"Failed to process request",details:e instanceof Error?e.message:"Unknown error"})}}[o]=l.then?(await l)():l,e.s(["config",0,{api:{bodyParser:!1}},"default",0,p]),r()}catch(e){r(e)}},!1),24649,e=>e.a(async(t,r)=>{try{var o=e.i(26747),s=e.i(90406),a=e.i(44898),i=e.i(62950),n=e.i(62164),l=e.i(7031),p=e.i(81927),d=e.i(46432),c=t([n]);[n]=c.then?(await c)():c;let u=(0,i.hoist)(n,"default"),y=(0,i.hoist)(n,"config"),f=new a.PagesAPIRouteModule({definition:{kind:s.RouteKind.PAGES_API,page:"/api/quotation",pathname:"/api/quotation",bundlePath:"",filename:""},userland:n,distDir:".next",relativeProjectDir:""});async function m(e,t,r){r.requestMeta&&(0,d.setRequestMeta)(e,r.requestMeta),f.isDev&&(0,d.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let s="/api/quotation";s=s.replace(/\/index$/,"")||"/";let a=await f.prepare(e,t,{srcPage:s});if(!a){t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve());return}let{query:i,params:n,prerenderManifest:c,routerServerContext:m}=a;try{let r,o=e.method||"GET",a=(0,l.getTracer)(),d=a.getActiveScopeSpan(),u=!!(null==m?void 0:m.isWrappedByNextServer),y=f.instrumentationOnRequestError.bind(f),g=async l=>f.render(e,t,{query:{...i,...n},params:n,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:c.preview,propagateError:!1,dev:f.isDev,page:"/api/quotation",internalRevalidate:null==m?void 0:m.revalidate,onError:(...t)=>y(e,...t)}).finally(()=>{if(!l)return;l.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let e=a.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=e.get("next.route");if(i){let e=`${o} ${i}`;l.setAttributes({"next.route":i,"http.route":i,"next.span_name":e}),l.updateName(e),r&&r!==l&&(r.setAttribute("http.route",i),r.updateName(e))}else l.updateName(`${o} ${s}`)});u&&d?await g(d):(r=a.getActiveScopeSpan(),await a.withPropagatedContext(e.headers,()=>a.trace(p.BaseServerSpan.handleRequest,{spanName:`${o} ${s}`,kind:l.SpanKind.SERVER,attributes:{"http.method":o,"http.target":e.url}},g),void 0,!u))}catch(e){if(f.isDev)throw e;(0,o.sendError)(t,500,"Internal Server Error")}finally{null==r.waitUntil||r.waitUntil.call(r,Promise.resolve())}}e.s(["config",0,y,"default",0,u,"handler",0,m]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0jz27vy._.js.map