module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},115,(e,t,r)=>{t.exports=e.x("mysql2-3d80281e5ed34ca6/promise",()=>require("mysql2-3d80281e5ed34ca6/promise"))},54948,e=>{"use strict";let t=e.i(115).default.createPool({host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"root",database:process.env.DB_NAME||"kflr",waitForConnections:!0,connectionLimit:20,queueLimit:50,connectTimeout:1e4,enableKeepAlive:!0,keepAliveInitialDelay:0});async function r(e,r){let[o]=r&&r.length>0?await t.query(e,r):await t.query(e);return o}async function o(){try{return await t.query("SELECT 1"),!0}catch(e){return console.error("Database connection test failed:",e),!1}}e.s(["default",0,t,"getPoolMetrics",0,function(){let e=t.pool;return{totalConnections:e._allConnections?.length||0,activeConnections:e._acquiringConnections?.length||0,idleConnections:e._freeConnections?.length||0,queuedRequests:e._connectionQueue?.length||0}},"query",0,r,"testConnection",0,o])},84423,(e,t,r)=>{t.exports=e.x("nodemailer-9c35dd349a8aaa9f",()=>require("nodemailer-9c35dd349a8aaa9f"))},96927,e=>{"use strict";var t=e.i(84423),r=e.i(54948);let o=null,s=null,i=0;async function a(){let e=Date.now();if(s&&e-i<3e5)return s;try{let t=await (0,r.query)("SELECT setting_key, setting_value FROM site_settings WHERE setting_type = ?",["email"]),o={};t.forEach(e=>{o[e.setting_key]=e.setting_value});let a={smtp_host:o.smtp_host||process.env.SMTP_HOST||"indigo.herosite.pro",smtp_port:o.smtp_port||process.env.SMTP_PORT||"587",smtp_username:o.smtp_username||process.env.SMTP_USER||"enquiry@kflegacyresources.com",smtp_password:o.smtp_password||process.env.SMTP_PASSWORD||"F@iz@n!984",smtp_encryption:o.smtp_encryption||"tls",smtp_from_name:o.smtp_from_name||"KF Legacy Resources",smtp_from_email:o.smtp_from_email||process.env.SMTP_FROM||"enquiry@kflegacyresources.com",smtp_reply_to:o.smtp_reply_to||"enquiry@kflegacyresources.com"};return s=a,i=e,a}catch(r){console.error("Failed to fetch email settings from database:",r);let t={smtp_host:process.env.SMTP_HOST||"indigo.herosite.pro",smtp_port:process.env.SMTP_PORT||"587",smtp_username:process.env.SMTP_USER||"enquiry@kflegacyresources.com",smtp_password:process.env.SMTP_PASSWORD||"F@iz@n!984",smtp_encryption:"tls",smtp_from_name:"KF Legacy Resources",smtp_from_email:process.env.SMTP_FROM||"enquiry@kflegacyresources.com",smtp_reply_to:"enquiry@kflegacyresources.com"};return s=t,i=e,t}}async function n(){let e=await a();if(o)try{return await o.verify(),o}catch(e){console.log("[Email] Transporter verification failed, recreating..."),o.close(),o=null}return console.log("[Email] Creating new transporter with connection pooling"),o=t.default.createTransport({host:e.smtp_host,port:parseInt(e.smtp_port),secure:"ssl"===e.smtp_encryption,auth:{user:e.smtp_username,pass:e.smtp_password},tls:{rejectUnauthorized:!1},pool:!0,maxConnections:5,maxMessages:100,connectionTimeout:1e4,greetingTimeout:1e4})}async function l(e){let t=await n(),r=await a(),o={from:`"${r.smtp_from_name}" <${r.smtp_from_email}>`,to:r.smtp_username,replyTo:r.smtp_reply_to,subject:`New Quotation Request from ${e.firstName} ${e.lastName}`,html:`
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
    `};await t.sendMail(o),await t.sendMail(s)}async function p(e){let t=await n(),r=await a();await t.sendMail({from:`${r.smtp_from_email}`,to:r.smtp_username,replyTo:r.smtp_reply_to,subject:"New Newsletter Subscriber – KF Legacy Resources",text:`New subscriber: ${e.email}`});let o=process.env.SITE_URL||"https://www.kflegacyresources.com",s=`${o}/assets/img/logo.png`,i=`
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
  </table>`;await t.sendMail({from:`${r.smtp_from_email}`,to:e.email,replyTo:r.smtp_reply_to,subject:"Thank you for subscribing – KF Legacy Resources",html:i,text:`Thank you for subscribing to KF Legacy Resources. Visit ${o}`})}e.s(["sendQuotationEmail",0,l,"sendSubscriptionEmails",0,p])},83722,e=>{"use strict";var t=e.i(26747),r=e.i(90406),o=e.i(44898),s=e.i(62950),i=e.i(54948),a=e.i(96927);async function n(e,t){if("POST"!==e.method)return t.status(405).json({error:"Method not allowed"});try{let{email:r}=e.body??{};if("string"!=typeof r||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r))return t.status(400).json({error:"Invalid email"});let o=await i.default.getConnection();try{await o.execute(`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);let[e]=await o.execute("INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)",[r]);await (0,a.sendSubscriptionEmails)({email:r});let s=e?.affectedRows,i="number"==typeof s&&s>0;return t.status(200).json({success:!0,inserted:i,message:i?"Subscribed":"Already subscribed"})}finally{o.release()}}catch(e){return console.error("Subscribe error:",e),t.status(500).json({error:"Failed to subscribe"})}}e.s(["default",0,n],28070);var l=e.i(28070),p=e.i(7031),d=e.i(81927),c=e.i(46432);let u=(0,s.hoist)(l,"default"),m=(0,s.hoist)(l,"config"),g=new o.PagesAPIRouteModule({definition:{kind:r.RouteKind.PAGES_API,page:"/api/subscribe",pathname:"/api/subscribe",bundlePath:"",filename:""},userland:l,distDir:".next",relativeProjectDir:""});async function y(e,r,o){o.requestMeta&&(0,c.setRequestMeta)(e,o.requestMeta),g.isDev&&(0,c.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let s="/api/subscribe";s=s.replace(/\/index$/,"")||"/";let i=await g.prepare(e,r,{srcPage:s});if(!i){r.statusCode=400,r.end("Bad Request"),null==o.waitUntil||o.waitUntil.call(o,Promise.resolve());return}let{query:a,params:n,prerenderManifest:l,routerServerContext:u}=i;try{let t,o=e.method||"GET",i=(0,p.getTracer)(),c=i.getActiveScopeSpan(),m=!!(null==u?void 0:u.isWrappedByNextServer),y=g.instrumentationOnRequestError.bind(g),f=async p=>g.render(e,r,{query:{...a,...n},params:n,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:l.preview,propagateError:!1,dev:g.isDev,page:"/api/subscribe",internalRevalidate:null==u?void 0:u.revalidate,onError:(...t)=>y(e,...t)}).finally(()=>{if(!p)return;p.setAttributes({"http.status_code":r.statusCode,"next.rsc":!1});let e=i.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=e.get("next.route");if(a){let e=`${o} ${a}`;p.setAttributes({"next.route":a,"http.route":a,"next.span_name":e}),p.updateName(e),t&&t!==p&&(t.setAttribute("http.route",a),t.updateName(e))}else p.updateName(`${o} ${s}`)});m&&c?await f(c):(t=i.getActiveScopeSpan(),await i.withPropagatedContext(e.headers,()=>i.trace(d.BaseServerSpan.handleRequest,{spanName:`${o} ${s}`,kind:p.SpanKind.SERVER,attributes:{"http.method":o,"http.target":e.url}},f),void 0,!m))}catch(e){if(g.isDev)throw e;(0,t.sendError)(r,500,"Internal Server Error")}finally{null==o.waitUntil||o.waitUntil.call(o,Promise.resolve())}}e.s(["config",0,m,"default",0,u,"handler",0,y],83722)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0yl9rxm._.js.map