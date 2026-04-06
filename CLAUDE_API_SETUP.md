# Configuración de Claude API (Anthropic)

## 🧠 ¿Qué es Claude API?

Claude es el modelo de IA de Anthropic que hace las respuestas del agente mucho más inteligentes y naturales.

**Sin Claude API:** Respuestas básicas preprogramadas  
**Con Claude API:** Respuestas contextuales, inteligentes y personalizadas

## 🔑 Obtener API Key

### Paso 1: Crear cuenta en Anthropic

1. Ve a: https://console.anthropic.com/
2. Haz click en **Sign Up**
3. Regístrate con tu email (o usa Google)

### Paso 2: Agregar créditos

1. Ve a: **Settings** → **Billing**
2. Agrega un método de pago
3. Compra créditos (mínimo $5 USD)

**Costos aprox:**
- Claude 3.5 Sonnet: ~$0.003 por mensaje
- Con $5 USD ≈ 1,600 mensajes

### Paso 3: Generar API Key

1. Ve a: **Settings** → **API Keys**
2. Click en **Create Key**
3. Dale un nombre (ejemplo: "CRM WhatsApp Agent")
4. Copia la key (empieza con `sk-ant-api03-...`)

⚠️ **IMPORTANTE:** Guarda esta key en un lugar seguro. Solo se muestra una vez.

### Paso 4: Configurar en el backend

Edita `agent-backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
```

### Paso 5: Reiniciar el backend

```bash
cd agent-backend
npm start
```

Deberías ver en los logs:
```
🧠 Claude API: ✅ Enabled
```

## 🎯 Probar que funciona

1. Ve al simulador: http://localhost:3000/agente/simulador
2. Escribe algo complejo como:
   ```
   Quiero comprar una parcela de 8000m2 en Chicureo, 
   que esté cerca de colegios y tenga vista a la cordillera. 
   ¿Qué me recomiendas?
   ```
3. Con Claude API, la respuesta será mucho más contextual y útil

## 💰 Monitoreo de uso

1. Ve a: https://console.anthropic.com/settings/usage
2. Verás cuántos tokens/mensajes has usado
3. Puedes configurar alertas de presupuesto

## 🆓 Alternativa sin costo

Si no quieres usar Claude API por ahora:

- El agente funcionará con respuestas básicas preprogramadas
- Es funcional pero menos inteligente
- Perfecto para pruebas iniciales
- Puedes agregar Claude API después

## 📊 Comparación

| Característica | Sin Claude API | Con Claude API |
|---|---|---|
| Costo | Gratis | ~$0.003/msg |
| Inteligencia | Básica | Avanzada |
| Contexto | Simple | Completo |
| Personalización | Limitada | Alta |
| Multiidioma | Básico | Excelente |

## 🔒 Seguridad

- **Nunca** compartas tu API key públicamente
- **Nunca** la subas a GitHub (ya está en .gitignore)
- Rótala si crees que fue comprometida
- Usa variables de entorno siempre

---

## ✅ Checklist

- [ ] Cuenta en Anthropic creada
- [ ] Créditos agregados
- [ ] API Key generada
- [ ] .env configurado
- [ ] Backend reiniciado
- [ ] Probado en el simulador
