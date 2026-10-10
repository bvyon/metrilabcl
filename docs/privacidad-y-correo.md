# Privacidad y correo de MetrilabCL

Actualización: 10 de octubre de 2026.

## Datos confirmados por el propietario

Responsable: Bastian Vega Yon. Ubicación comercial pública: Iquique, Chile. No se publica su dirección particular. Web personal: https://bvyon-marketing.cl. Perfil profesional: https://www.linkedin.com/in/bvyon/.

Conservación de consultas sin contratación: un máximo de 12 meses desde la última interacción. Correo activo: contacto@metrilab.cl, con recepción y respuestas en Zoho Mail gratuito. Los mensajes anteriores permanecen en metrilabcl@gmail.com.

## Alcance implementado

La política se encuentra en `src/data/privacy.ts`. Describe datos, finalidades, consentimiento, conservación, proveedores, derechos, funcionamiento local del preparador y HTTPS. El consentimiento del preparador queda sin marcar y se incluye en el mensaje escrito que el visitante decide enviar. No se guarda en el servidor ni activa envíos automáticos.

La política cubre visitas y consultas; el tratamiento de datos de clientes y sus usuarios durante un servicio debe definirse en el acuerdo correspondiente. No se declara que el proveedor borre inmediatamente sus copias técnicas ni que todos los registros estén en Chile.

## Aplicación del plazo y atención de solicitudes

El plazo de 12 meses requiere revisar los mensajes conservados en Zoho y los históricos de Gmail; el sitio no puede borrar correos. Conviene separar consultas sin contratación de documentos de servicios contratados y revisar regularmente la fecha de la última interacción. No basta con archivar un mensaje para eliminarlo. Las obligaciones legales de conservar ciertos documentos deben justificarse por separado.

Las solicitudes de privacidad llegan al correo de contacto con asunto «Privacidad». Deben atenderse conforme al plazo legal aplicable; la Ley 19.628 vigente contempla vías de reclamación ante la falta de respuesta dentro de dos días hábiles. Verificar la identidad con la información mínima necesaria y registrar la respuesta. No solicitar documentos de identidad como requisito automático.

Para mensajes enviados directamente, obtener autorización expresa por escrito antes de incorporar información a un seguimiento comercial. No añadir contactos a campañas de publicidad sin una autorización específica.

## Activación inicial de Cloudflare — histórico del 10 de octubre de 2026

Antes del cambio a Zoho, Cloudflare Email Routing reenviaba contacto@metrilab.cl a Gmail. No proporcionaba una bandeja ni envío como contacto@metrilab.cl; las respuestas iniciales salían desde metrilabcl@gmail.com. Esta configuración ya está desactivada.

La activación exige verificar el destino de Gmail, crear la regla exacta de contacto y agregar los registros de correo exigidos por Cloudflare. El token de publicación inicial no tiene permisos de correo. Permisos adicionales: Account / Email Routing Addresses / Edit; Zone / Email Routing Rules / Edit; Zone / Zone Settings / Edit; Zone / DNS / Read. Mantener la restricción a la cuenta del propietario y a metrilab.cl. No guardar credenciales en Git.

Activación del 10 de octubre de 2026: el destino Gmail ya estaba verificado; se creó la regla `bd19670cc70b4b238ed8c1488dc309e1` para contacto@metrilab.cl y Cloudflare informa Email Routing habilitado, estado `ready`. No había registros MX de otro proveedor. La web utiliza desde esta actualización la dirección del dominio. Se verificaron públicamente MX, SPF y DKIM.

Prueba real autorizada: se envió un único mensaje desde el Gmail del perfil Bastian a contacto@metrilab.cl, asunto «Prueba de recepción MetrilabCL — 10-10-2026». Se comprobó su llegada a la bandeja de entrada de metrilabcl@gmail.com a las 13:00, hora de Chile. No se envió una respuesta ni un segundo mensaje.

## Fuentes y revisión

- [Ley 19.628 vigente](https://www.bcn.cl/leychile/navegar?i=141599): consentimiento, finalidades y derechos.
- [Ley 21.719](https://www.bcn.cl/leychile/navegar?i=1209272): nuevo régimen desde el 1 de diciembre de 2026. Revisar política, procedimientos, seguridad y condiciones de transferencias para su entrada en vigencia.
- [Cloudflare: privacidad](https://www.cloudflare.com/privacypolicy/).
- [Zoho: privacidad](https://www.zoho.com/privacy.html).
- [Zoho: configuración de DNS con Cloudflare](https://www.zoho.com/mail/help/adminconsole/cloudflare.html).
- [Google: privacidad](https://policies.google.com/privacy?hl=es).
- [Cloudflare: gestión de direcciones y verificación](https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/).
- [Cloudflare: limitación de respuestas con Email Routing](https://developers.cloudflare.com/email-service/reference/postmaster/).
- [Cloudflare: permisos de API](https://developers.cloudflare.com/fundamentals/api/reference/permissions/).

La redacción utiliza los datos y la configuración confirmados, y no constituye una certificación de cumplimiento legal de toda la operación de la agencia.

## Zoho activo — 10 de octubre de 2026

El propietario confirmó cambiar la recepción y las respuestas a Zoho Mail gratuito. Dominio metrilab.cl verificado por TXT y buzón contacto@metrilab.cl creado. Zoho confirmó todos los registros y mostró «Su configuración ha finalizado».

Configuración actual:

- MX: mx.zoho.com / prioridad 10, mx2.zoho.com / 20 y mx3.zoho.com / 50. Son los únicos MX del dominio.
- SPF: `v=spf1 include:zohomail.com ~all`.
- DKIM: selector `zmail._domainkey`, verificado por Zoho y publicado en DNS.
- DMARC: `_dmarc` con `v=DMARC1; p=none; adkim=r; aspf=r`, publicado y comprobado en DNS público. No solicita rechazar ni enviar a cuarentena los mensajes que fallen.
- Cloudflare Email Routing desactivado. Los tres MX antiguos de route1, route2 y route3.mx.cloudflare.net se eliminaron tras la confirmación explícita del propietario. Los registros web no se modificaron.

Prueba real autorizada, exactamente dos mensajes: Gmail metrilabcl@gmail.com envió «Prueba Zoho MetrilabCL — 10-10-2026» a contacto@metrilab.cl, recibido en Zoho a las 14:11, hora de Chile; se respondió una vez desde contacto@metrilab.cl y Gmail recibió la respuesta a las 14:12. Gmail confirmó SPF PASS, DKIM PASS para metrilab.cl y cifrado TLS. La prueba inicial mostraba DMARC FAIL porque no existía el registro; se agregó después y se verificó su publicación. No se envió una tercera prueba ni se afirma haber verificado DMARC PASS en un mensaje posterior.

Uso diario: abrir https://mail.zoho.com/ con la cuenta Zoho del propietario para recibir y responder como contacto@metrilab.cl. Los mensajes anteriores permanecen en Gmail; no se importaron. El plazo de conservación debe aplicarse en ambos buzones.

La política publicada incorpora Zoho como proveedor del correo y Gmail para las consultas históricas. Versión de Cloudflare Workers: `8cda37dc-693d-4842-85a1-4d8836ac0968`. Privacidad en metrilab.cl y www, contacto y portada respondieron HTTPS 200 y coinciden con la compilación local; no se inserta analítica y continúa noindex.
