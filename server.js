const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { createClient } = require('@supabase/supabase-js')
const Anthropic = require('@anthropic-ai/sdk')
const twilio = require('twilio')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Claude AI Client (opcional - funciona sin API key con respuestas básicas)
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// Twilio Client (opcional)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

// In-memory storage
const conversations = {}
const contacts = {}

// ========================================
// AGENTE IA - Claude API Integration
// ========================================
async function getClaudeResponse(userMessage, phone, conversationHistory) {
  if (!anthropic) {
    // Fallback a respuestas básicas si no hay API key
    return getBasicResponse(userMessage, phone)
  }

  try {
    // Cargar contexto de la base de datos
    const { data: projects } = await supabase.from('projects').select('*, project_milestones(*)')
    const { data: stock } = await supabase.from('stock').select('*').eq('estado', 'Disponible')
    const { data: cobranza } = await supabase.from('cobranza').select('*')

    // Construir contexto para Claude
    const context = `Eres un asistente virtual de Inmobiliaria Chicureo. Tu nombre es "Asistente Chicureo".

INFORMACIÓN DE PROYECTOS DISPONIBLES:
${projects?.map(p => `
- ${p.nombre}:
  * Ubicación: ${p.ubicacion_comuna}, ${p.ubicacion_sector}
  * Parcelas: ${p.cantidad_parcelas} unidades
  * Superficies: ${p.superficie_minima}m² a ${p.superficie_maxima}m²
  * Precio desde: $${(p.precio_desde / 1000000).toFixed(1)}M
  * Estado: ${p.project_milestones?.[0]?.estado_actual || 'En planificación'}
  * Avance: ${p.project_milestones?.[0]?.porcentaje_avance || 0}%
  * Subdivisión aprobada: ${p.project_milestones?.[0]?.subdivision_aprobada || 'En trámite'}
  * Contacto: ${p.contacto_comercial || 'Equipo comercial'} - ${p.telefono_contacto || '+56 2 2345 6789'}
`).join('\n') || 'No hay proyectos disponibles actualmente.'}

STOCK DISPONIBLE:
${stock?.length || 0} parcelas disponibles inmediatamente.

INSTRUCCIONES:
- Sé amable, profesional y conversacional
- Usa emojis moderadamente (1-2 por mensaje)
- Responde de forma concreta y directa
- Si preguntan por precios, menciona los valores reales
- Si preguntan por avances, usa los porcentajes reales
- Si no sabes algo, sugiere contactar a un ejecutivo
- Ofrece agendar visitas cuando sea relevante
- Si mencionan problemas de cobranza o reclamos, deriva al área correspondiente
- Mantén respuestas cortas (máximo 4-5 líneas)`

    // Construir historial de mensajes para Claude
    const messages = conversationHistory.map(msg => ({
      role: msg.from === 'user' ? 'user' : 'assistant',
      content: msg.text
    }))

    // Agregar mensaje actual
    messages.push({
      role: 'user',
      content: userMessage
    })

    // Llamar a Claude API (Claude Haiku 4.5 - más económico)
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: context,
      messages: messages
    })

    return response.content[0].text
  } catch (error) {
    console.error('Claude API error:', error.message)
    // Fallback a respuestas básicas si Claude falla
    return getBasicResponse(userMessage, phone)
  }
}

// Respuestas básicas (fallback sin Claude API)
async function getBasicResponse(userMessage, phone) {
  const message = userMessage.toLowerCase()

  const { data: projects } = await supabase.from('projects').select('*, project_milestones(*)')
  const { data: stock } = await supabase.from('stock').select('*').eq('estado', 'Disponible')

  if (message.includes('hola') || message.includes('buenos días') || message.includes('buenas tardes')) {
    return `¡Hola! 👋 Soy el asistente virtual de Inmobiliaria Chicureo. ¿En qué puedo ayudarte hoy?\n\nPuedo darte información sobre:\n• Proyectos disponibles\n• Precios y características\n• Estado de construcción\n• Agendar visitas`
  }

  if (message.includes('proyecto') || message.includes('proyectos')) {
    if (!projects || projects.length === 0) {
      return 'Actualmente no tenemos proyectos disponibles en el sistema.'
    }
    let response = `Tenemos ${projects.length} proyecto(s) disponible(s):\n\n`
    projects.slice(0, 3).forEach((p, i) => {
      response += `${i + 1}. *${p.nombre}*\n`
      response += `   📍 ${p.ubicacion_comuna}, ${p.ubicacion_sector}\n`
      response += `   🏡 ${p.cantidad_parcelas} parcelas\n`
      response += `   💰 Desde $${(p.precio_desde / 1000000).toFixed(0)}M\n\n`
    })
    response += '¿Sobre cuál te gustaría saber más?'
    return response
  }

  if (message.includes('precio') || message.includes('cuanto cuesta') || message.includes('valor')) {
    if (projects && projects.length > 0) {
      const project = projects[0]
      return `El proyecto *${project.nombre}* tiene parcelas desde $${(project.precio_desde / 1000000).toFixed(0)} millones.\n\nSuperficies desde ${project.superficie_minima}m² hasta ${project.superficie_maxima}m².\n\n¿Te gustaría agendar una visita?`
    }
    return 'Por favor, indícame sobre qué proyecto quieres saber el precio.'
  }

  if (message.includes('disponible') || message.includes('stock')) {
    return `Tenemos ${stock?.length || 0} parcela(s) disponible(s) en este momento.\n\n¿Te gustaría conocer los detalles?`
  }

  if (message.includes('avance') || message.includes('construcción') || message.includes('obra')) {
    if (projects && projects.length > 0 && projects[0].project_milestones?.[0]) {
      const milestone = projects[0].project_milestones[0]
      let response = `Estado de *${projects[0].nombre}*:\n\n`
      response += `📊 Avance: ${milestone.porcentaje_avance || 0}%\n`
      response += `🏗️ Estado: ${milestone.estado_actual || 'En planificación'}\n\n`
      if (milestone.subdivision_aprobada) response += `✅ Subdivisión aprobada: ${milestone.subdivision_aprobada}\n`
      if (milestone.inicio_obras) response += `🔨 Inicio de obras: ${milestone.inicio_obras}\n`
      return response
    }
    return 'No tengo información sobre el avance de construcción en este momento.'
  }

  if (message.includes('visita') || message.includes('agendar')) {
    return `¡Excelente! 📅 Para agendar una visita, contáctanos:\n\n📞 +56 2 2345 6789\n📧 ventas@ichicureo.cl\n\nO déjame tu nombre y te contactaremos pronto.`
  }

  if (message.includes('gracias')) {
    return `¡De nada! 😊 Estamos para ayudarte. ¿Algo más en qué pueda asistirte?`
  }

  return `Entiendo que preguntas sobre "${userMessage}".\n\nPuedo ayudarte con:\n• Información de proyectos\n• Precios y disponibilidad\n• Estado de construcción\n• Agendar visitas\n\n¿Qué necesitas?`
}

// ========================================
// WEBHOOK - Twilio WhatsApp
// ========================================
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const phone = req.body.From || req.body.phone
    const message = req.body.Body || req.body.message

    if (!phone || !message) {
      return res.status(400).json({ error: 'Missing phone or message' })
    }

    // Crear o recuperar conversación
    if (!conversations[phone]) {
      conversations[phone] = {
        phone,
        messages: [],
        created_at: new Date().toISOString(),
      }
      contacts[phone] = {
        phone,
        last_contact: new Date().toISOString(),
        message_count: 0,
      }
    }

    // Agregar mensaje del usuario
    conversations[phone].messages.push({
      from: 'user',
      text: message,
      timestamp: new Date().toISOString(),
    })

    // Obtener respuesta (con Claude API o básica)
    const agentResponse = await getClaudeResponse(
      message,
      phone,
      conversations[phone].messages.slice(-10) // Últimos 10 mensajes de contexto
    )

    // Agregar respuesta del agente
    conversations[phone].messages.push({
      from: 'agent',
      text: agentResponse,
      timestamp: new Date().toISOString(),
    })

    // Actualizar contacto
    contacts[phone].last_contact = new Date().toISOString()
    contacts[phone].message_count = conversations[phone].messages.length
    contacts[phone].last_message = message

    // Enviar respuesta por WhatsApp si Twilio está configurado
    if (twilioClient && process.env.TWILIO_WHATSAPP_FROM) {
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: phone,
          body: agentResponse
        })
      } catch (twilioError) {
        console.error('Twilio send error:', twilioError.message)
      }
    }

    // Detectar si es petición desde el simulador o desde Twilio
    const isSimulator = req.headers['content-type']?.includes('application/json')

    if (isSimulator) {
      // Respuesta JSON para el simulador
      res.json({ success: true, response: agentResponse })
    } else {
      // Respuesta XML para Twilio webhook
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${agentResponse}</Message>
</Response>`
      res.type('text/xml')
      res.send(twiml)
    }
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Error processing message' })
  }
})

// ========================================
// ADMIN ENDPOINTS
// ========================================
app.get('/admin/conversations', (req, res) => {
  const conversationsList = Object.values(conversations).map(conv => ({
    phone: conv.phone,
    message_count: conv.messages.length,
    last_message: conv.messages[conv.messages.length - 1]?.text || '',
    last_activity: conv.messages[conv.messages.length - 1]?.timestamp || conv.created_at,
  }))
  res.json(conversationsList)
})

app.get('/admin/conversations/:phone', (req, res) => {
  const conversation = conversations[decodeURIComponent(req.params.phone)]
  if (!conversation) return res.status(404).json({ error: 'Not found' })
  res.json(conversation)
})

app.post('/admin/conversations/:phone/reset', (req, res) => {
  const phoneDecoded = decodeURIComponent(req.params.phone)
  if (conversations[phoneDecoded]) conversations[phoneDecoded].messages = []
  res.json({ success: true })
})

app.get('/admin/contacts', async (req, res) => {
  const contactsList = Object.values(contacts).map(contact => ({
    ...contact,
    name: contact.name || 'Cliente WhatsApp',
    project: 'Sin asignar',
    etapa: 'Contacto inicial',
    estado: 'Activo',
    nps: 0,
    riesgo: 'Bajo',
  }))
  res.json(contactsList)
})

app.get('/admin/analytics', (req, res) => {
  res.json({
    conversaciones_activas: Object.keys(conversations).length,
    mensajes_totales: Object.values(conversations).reduce((acc, conv) => acc + conv.messages.length, 0),
    escalamientos: 0,
    nps_promedio: '4.6',
  })
})

app.get('/admin/tickets', (req, res) => res.json([]))
app.get('/admin/reports/monthly', (req, res) => {
  res.json({
    conversaciones_totales: Object.keys(conversations).length,
    mensajes_enviados: Object.values(conversations).reduce((acc, conv) =>
      acc + conv.messages.filter(m => m.from === 'agent').length, 0),
    mensajes_recibidos: Object.values(conversations).reduce((acc, conv) =>
      acc + conv.messages.filter(m => m.from === 'user').length, 0),
    tiempo_respuesta_promedio: '2.3 min',
    tasa_resolucion: '87%',
  })
})

app.get('/admin/knowledge', async (req, res) => {
  const { data: projects } = await supabase.from('projects').select('*')
  res.json({
    empresa: { nombre: 'Inmobiliaria Chicureo', descripcion: 'Desarrolladora de proyectos inmobiliarios' },
    proyectos: projects || [],
    faq: [],
  })
})

app.get('/admin/config', (req, res) => {
  res.json({
    agent_name: 'Asistente Chicureo',
    escalation_phone: '+56912345678',
    respond_out_of_hours: true,
    notify_escalations: true,
    claude_enabled: !!anthropic,
    twilio_enabled: !!twilioClient,
  })
})

// ========================================
// START SERVER
// ========================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🤖 WhatsApp Agent Backend running on http://localhost:${PORT}`)
    console.log(`📊 Admin panel: http://localhost:3000/agente/dashboard`)
    console.log(`🧠 Claude API: ${anthropic ? '✅ Enabled' : '❌ Disabled (using basic responses)'}`)
    console.log(`📱 Twilio: ${twilioClient ? '✅ Enabled' : '❌ Disabled (simulator only)'}`)
  })
}

// Export for Vercel
module.exports = app
