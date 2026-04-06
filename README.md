# 🤖 Agente WhatsApp AI - Inmobiliaria Chicureo

Este es el backend del agente de WhatsApp que responde automáticamente a tus clientes.

## 🎯 ¿Qué hace?

El agente responde automáticamente a los mensajes de WhatsApp que llegan a tu número corporativo con información sobre:

- ✅ Proyectos disponibles (lee desde tu base de datos)
- ✅ Precios y características de parcelas
- ✅ Estado de construcción y avances
- ✅ Agendar visitas
- ✅ Información de contacto
- ✅ Stock disponible
- ✅ Estado de pagos (si el cliente lo solicita)

## 📊 Estado Actual

```
🧠 Claude API: ❌ No configurado (usando respuestas básicas)
📱 Twilio: ❌ No configurado (solo simulador disponible)
✅ Base de datos: Conectado a Supabase
✅ Simulador: Funcionando en http://localhost:3000/agente/simulador
```

## 🚀 Inicio Rápido (Simulador)

El simulador ya está funcionando. Para probarlo:

1. Asegúrate que el backend esté corriendo:
   ```bash
   cd agent-backend
   npm start
   ```

2. Abre el navegador en:
   ```
   http://localhost:3000/agente/simulador
   ```

3. Escribe mensajes y el agente responderá automáticamente

## 📱 Conectar WhatsApp Corporativo (Producción)

Para que el agente responda a clientes reales en tu WhatsApp corporativo:

### Opción 1: Twilio (Recomendado - Más rápido)

1. **Crea cuenta en Twilio** (5 minutos)
   - Ve a: https://www.twilio.com/try-twilio
   - Regístrate gratis
   - Sigue la guía: [TWILIO_SETUP.md](./TWILIO_SETUP.md)

2. **Costo aproximado:**
   - Setup inicial: Gratis con créditos de prueba
   - Producción: ~$25 USD inicial + $0.005 por mensaje

### Opción 2: WhatsApp Business API (Oficial)

1. Requiere verificación de Facebook Business
2. Proceso más largo (1-2 semanas)
3. Más costoso pero es el método oficial
4. Te puedo ayudar con esto después si lo prefieres

## 🧠 Habilitar IA Avanzada (Opcional)

Para respuestas más inteligentes y contextuales:

1. **Obtén API Key de Claude:**
   - Sigue la guía: [CLAUDE_API_SETUP.md](./CLAUDE_API_SETUP.md)
   - Costo: ~$0.003 por mensaje (muy económico)
   - Con $5 USD ≈ 1,600 mensajes

2. **Agrega al .env:**
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```

3. **Reinicia el backend**

**Comparación:**

| Sin Claude API | Con Claude API |
|---|---|
| Respuestas básicas | Conversaciones naturales |
| Solo info directa | Entiende contexto complejo |
| Gratis | ~$0.003/mensaje |

## 📂 Archivos importantes

```
agent-backend/
├── server.js              ← Servidor principal
├── .env                   ← Configuración (credenciales)
├── .env.example          ← Template de configuración
├── package.json          ← Dependencias
├── README.md             ← Este archivo
├── TWILIO_SETUP.md       ← Guía de WhatsApp
└── CLAUDE_API_SETUP.md   ← Guía de IA
```

## ⚙️ Variables de entorno (.env)

```env
# Básico (ya configurado)
PORT=3001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Opcional - Claude API
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Opcional - Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## 🔄 Flujo de trabajo recomendado

1. **Fase 1: Pruebas (AHORA)** ✅
   - Usa el simulador
   - Prueba respuestas
   - Ajusta comportamiento
   - Carga proyectos reales en BBDD

2. **Fase 2: IA Avanzada (Opcional)**
   - Configura Claude API
   - Mejora respuestas
   - Prueba casos complejos

3. **Fase 3: WhatsApp Real**
   - Configura Twilio
   - Conecta tu número corporativo
   - Empieza a responder clientes

## 🎯 Próximos pasos recomendados

1. ✅ **Probar el simulador** (ya disponible)
2. 📊 **Cargar proyectos reales** en BBDD → Proyectos
3. 🤖 **Configurar Claude API** para IA avanzada
4. 📱 **Conectar Twilio** para WhatsApp real

## 🆘 Ayuda

Si tienes dudas sobre:
- ❓ Cómo configurar Twilio → Ver [TWILIO_SETUP.md](./TWILIO_SETUP.md)
- ❓ Cómo activar Claude API → Ver [CLAUDE_API_SETUP.md](./CLAUDE_API_SETUP.md)
- ❓ Cómo funciona el agente → Prueba el simulador
- ❓ Cómo personalizar respuestas → Edita `server.js`

## 📝 Notas

- El agente lee datos en tiempo real de tu base de datos
- Las conversaciones se guardan en memoria (se reinician al reiniciar servidor)
- Para producción, se puede agregar persistencia en Supabase
- El agente funciona 24/7 sin necesidad de intervención

---

**¿Listo para empezar?** 🚀

Prueba el simulador y luego sigue con Twilio para conectar tu WhatsApp corporativo.
