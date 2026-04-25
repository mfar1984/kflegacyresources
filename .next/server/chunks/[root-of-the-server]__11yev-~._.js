module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},84423,(e,t,r)=>{t.exports=e.x("nodemailer-9c35dd349a8aaa9f",()=>require("nodemailer-9c35dd349a8aaa9f"))},40281,e=>{"use strict";var t=e.i(26747),r=e.i(90406),s=e.i(44898),a=e.i(62950),i=e.i(84423);async function o(e,t){if("POST"!==e.method)return t.status(405).json({success:!1,message:"Method not allowed"});try{let{testEmail:r,smtpSettings:s}=e.body;if(!r)return t.status(400).json({success:!1,message:"Test email address is required"});if(!s||!s.smtp_host||!s.smtp_username||!s.smtp_password)return t.status(400).json({success:!1,message:"SMTP settings are incomplete. Please configure SMTP settings first."});let a=i.default.createTransport({host:s.smtp_host,port:parseInt(s.smtp_port)||587,secure:"ssl"===s.smtp_encryption,auth:{user:s.smtp_username,pass:s.smtp_password},tls:{rejectUnauthorized:!1}});try{await a.verify()}catch(e){return t.status(200).json({success:!1,message:`SMTP connection failed: ${e.message}

Please check your SMTP settings.`})}let o={from:`"${s.smtp_from_name}" <${s.smtp_from_email}>`,to:r,replyTo:s.smtp_reply_to,subject:"Test Email from KF Legacy Resources",html:`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                        ✅ Test Email Successful
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Congratulations! Your SMTP email configuration is working correctly.
                      </p>
                      
                      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                          <strong>📧 Email Details:</strong><br>
                          <strong>From:</strong> ${s.smtp_from_name} &lt;${s.smtp_from_email}&gt;<br>
                          <strong>To:</strong> ${r}<br>
                          <strong>SMTP Host:</strong> ${s.smtp_host}<br>
                          <strong>SMTP Port:</strong> ${s.smtp_port}<br>
                          <strong>Encryption:</strong> ${s.smtp_encryption.toUpperCase()}
                        </p>
                      </div>
                      
                      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        This is a test email sent from your KF Legacy Resources admin panel to verify your email configuration.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        \xa9 ${new Date().getFullYear()} KF Legacy Resources. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                        This is an automated test email. Please do not reply.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,text:`
Test Email Successful

Congratulations! Your SMTP email configuration is working correctly.

Email Details:
- From: ${s.smtp_from_name} <${s.smtp_from_email}>
- To: ${r}
- SMTP Host: ${s.smtp_host}
- SMTP Port: ${s.smtp_port}
- Encryption: ${s.smtp_encryption.toUpperCase()}

This is a test email sent from your KF Legacy Resources admin panel to verify your email configuration.

\xa9 ${new Date().getFullYear()} KF Legacy Resources. All rights reserved.
This is an automated test email. Please do not reply.
      `};return await a.sendMail(o),t.status(200).json({success:!0,message:"Test email sent successfully"})}catch(e){return console.error("Test email error:",e),t.status(200).json({success:!1,message:`Failed to send test email: ${e.message}`})}}e.s(["default",0,o],67478);var n=e.i(67478),l=e.i(7031),p=e.i(81927),d=e.i(46432);let m=(0,a.hoist)(n,"default"),u=(0,a.hoist)(n,"config"),c=new s.PagesAPIRouteModule({definition:{kind:r.RouteKind.PAGES_API,page:"/api/admin/email/test",pathname:"/api/admin/email/test",bundlePath:"",filename:""},userland:n,distDir:".next",relativeProjectDir:""});async function g(e,r,s){s.requestMeta&&(0,d.setRequestMeta)(e,s.requestMeta),c.isDev&&(0,d.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let a="/api/admin/email/test";a=a.replace(/\/index$/,"")||"/";let i=await c.prepare(e,r,{srcPage:a});if(!i){r.statusCode=400,r.end("Bad Request"),null==s.waitUntil||s.waitUntil.call(s,Promise.resolve());return}let{query:o,params:n,prerenderManifest:m,routerServerContext:u}=i;try{let t,s=e.method||"GET",i=(0,l.getTracer)(),d=i.getActiveScopeSpan(),g=!!(null==u?void 0:u.isWrappedByNextServer),f=c.instrumentationOnRequestError.bind(c),h=async l=>c.render(e,r,{query:{...o,...n},params:n,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:m.preview,propagateError:!1,dev:c.isDev,page:"/api/admin/email/test",internalRevalidate:null==u?void 0:u.revalidate,onError:(...t)=>f(e,...t)}).finally(()=>{if(!l)return;l.setAttributes({"http.status_code":r.statusCode,"next.rsc":!1});let e=i.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=e.get("next.route");if(o){let e=`${s} ${o}`;l.setAttributes({"next.route":o,"http.route":o,"next.span_name":e}),l.updateName(e),t&&t!==l&&(t.setAttribute("http.route",o),t.updateName(e))}else l.updateName(`${s} ${a}`)});g&&d?await h(d):(t=i.getActiveScopeSpan(),await i.withPropagatedContext(e.headers,()=>i.trace(p.BaseServerSpan.handleRequest,{spanName:`${s} ${a}`,kind:l.SpanKind.SERVER,attributes:{"http.method":s,"http.target":e.url}},h),void 0,!g))}catch(e){if(c.isDev)throw e;(0,t.sendError)(r,500,"Internal Server Error")}finally{null==s.waitUntil||s.waitUntil.call(s,Promise.resolve())}}e.s(["config",0,u,"default",0,m,"handler",0,g],40281)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__11yev-~._.js.map