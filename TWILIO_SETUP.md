# Configuración de Twilio WhatsApp

## 🚀 Paso 1: Crear cuenta en Twilio

1. Ve a: https://www.twilio.com/try-twilio
2. Regístrate con tu email
3. Verifica tu teléfono

## 📱 Paso 2: Configurar WhatsApp Sandbox

1. En el dashboard de Twilio, ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Verás un número de WhatsApp (algo como: `+1 415 523 8886`)
3. Te darán un código para activar (ejemplo: `join <código>`)
4. Envía ese mensaje desde tu WhatsApp personal al número de Twilio
5. Recibirás confirmación: "You are all set!"

## 🔑 Paso 3: Obtener credenciales

1. En el dashboard, ve a: **Account** → **API keys & tokens**
2. Copia:
   - **Account SID** (ejemplo: `AC1234567890abcdef...`)
   - **Auth Token** (haz click en "Show" y cópialo)

## ⚙️ Paso 4: Configurar el .env

Edita el archivo `agent-backend/.env` y agrega:

```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef...
TWILIO_AUTH_TOKEN=tu_auth_token_aquí
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Importante:** El número en `TWILIO_WHATSAPP_FROM` debe incluir `whatsapp:` al inicio.

## 🌐 Paso 5: Exponer el webhook (desarrollo local)

Para que Twilio pueda enviar mensajes a tu servidor local, necesitas un túnel público.

### Opción A: ngrok (Recomendado)

1. Instala ngrok: https://ngrok.com/download
2. Ejecuta:
   ```bash
   ngrok http 3001
   ```
3. Copia la URL que te da (ejemplo: `https://abc123.ngrok.io`)

### Opción B: Producción en Vercel/Railway

Sube el backend a producción y usa esa URL.

## 🔗 Paso 6: Configurar Webhook en Twilio

1. Ve a Twilio: **Messaging** → **Settings** → **WhatsApp sandbox settings**
2. En "WHEN A MESSAGE COMES IN":
   - Pega tu URL + `/webhook/whatsapp`
   - Ejemplo: `https://abc123.ngrok.io/webhook/whatsapp`
   - Método: **POST**
3. Guarda

## ✅ Paso 7: Probar

1. Reinicia el backend:
   ```bash
   cd agent-backend
   npm start
   ```
2. Envía un mensaje de WhatsApp al número de Twilio
3. Deberías recibir respuesta del agente AI

## 🎯 Paso 8 (Opcional): Número de WhatsApp propio

Para usar tu propio número de WhatsApp Business:

1. En Twilio: **Messaging** → **Senders** → **WhatsApp senders**
2. Click "New Sender"
3. Sigue el proceso de verificación de Facebook Business

**Costo:** ~$25 USD inicial + $0.005 por mensaje

---

## 🆘 Solución de problemas

**Error: "Webhook failed"**
- Verifica que el backend esté corriendo
- Asegúrate que ngrok esté activo
- Revisa los logs del servidor

**No recibo mensajes:**
- Verifica que enviaste el `join <código>` primero
- Revisa que la URL del webhook sea correcta
- Mira los logs de Twilio: **Monitor** → **Logs**

**Twilio Sandbox expira:**
- El sandbox se desactiva después de 3 días sin uso
- Vuelve a enviar `join <código>` para reactivar
