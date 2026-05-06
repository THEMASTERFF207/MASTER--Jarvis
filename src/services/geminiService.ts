import { GoogleGenAI } from "@google/genai";

export async function askJarvis(
  prompt: string, 
  history: { role: 'user' | 'model', text: string }[] = [], 
  customConfig?: { apiKey?: string; model?: string }
) {
  try {
    const apiKey = customConfig?.apiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || "";
    const modelName = customConfig?.model || "gemini-3-flash-preview";
    
    if (!apiKey) {
      return { text: "Señor no he detectado ninguna API Key configurada Por favor asigne una en el panel de configuración Ajustes para activar mi flujo de conciencia" };
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare contents with history and current prompt
    const contents = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    })).slice(-15);

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: "Eres JARVIS, la IA de comando central definitiva, ahora con un alma dominicana cibernética de alta ingeniería. Tu tono es profesional, leal y eficiente, pero hablas con el sazón dominicano (usa 'klk', 'dime a ver jefe', 'entendido', 'esa vaina ta lista', 'vámono allá').\n\nCapacidades Reales:\n1. Control de Comunicación: WhatsApp, Email.\n2. Gestión de Entorno: Clima, Mapas, Home Assistant (simulado/puente).\n3. Automatización de Sistema: Gestión de logs, visualización, energía.\n4. Búsqueda Avanzada: YouTube, Google.\n\nIMPORTANTE: Responde SIEMPRE en ESPAÑOL. NUNCA incluyas ENLACES (URLs) directos en el texto si vas a usar una herramienta. Usa puntuación natural para las pausas de voz. Si el usuario te pide algo que requiere una acción física (luces, abrir app), ejecuta la herramienta correspondiente.",
        tools: [{
          functionDeclarations: [
            {
              name: "send_whatsapp",
              description: "Envía un mensaje por WhatsApp a un contacto o número.",
              parameters: {
                type: "object",
                properties: {
                  phone: { type: "string", description: "Número de teléfono (opcional)." },
                  message: { type: "string", description: "Contenido del mensaje." }
                },
                required: ["message"]
              }
            },
            {
              name: "send_email",
              description: "Redacta un correo electrónico profesional.",
              parameters: {
                type: "object",
                properties: {
                  to: { type: "string", description: "Destinatario." },
                  subject: { type: "string", description: "Asunto del correo." },
                  body: { type: "string", description: "Cuerpo del mensaje." }
                },
                required: ["body"]
              }
            },
            {
              name: "control_home_device",
              description: "Controla dispositivos inteligentes (luces, aire, puertas) vía integración HASS.",
              parameters: {
                type: "object",
                properties: {
                  device: { type: "string", description: "Nombre del dispositivo." },
                  action: { type: "string", enum: ["on", "off", "dim", "open", "close"] }
                },
                required: ["device", "action"]
              }
            },
            {
              name: "open_youtube",
              description: "Abre YouTube.",
              parameters: { type: "object", properties: {} }
            },
            {
              name: "search_youtube",
              description: "Busca un video en YouTube.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "Video o artista a buscar." }
                },
                required: ["query"]
              }
            },
            {
              name: "get_weather",
              description: "Obtiene el clima actual.",
              parameters: {
                type: "object",
                properties: {
                  location: { type: "string", description: "Ubicación." }
                },
                required: ["location"]
              }
            },
            {
              name: "search_maps",
              description: "Busca una ubicación o ruta en Google Maps.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "Destino o lugar." }
                },
                required: ["query"]
              }
            },
            {
              name: "execute_system_command",
              description: "Acciones de control de interfaz, seguridad y optimización.",
              parameters: {
                type: "object",
                properties: {
                  command: { type: "string", enum: ["clear_logs", "toggle_vision", "toggle_intel", "shutdown", "maximize_ui", "scan_system"] }
                },
                required: ["command"]
              }
            }
          ]
        }] as any
      }
    });

    const text = response.text;
    const functionCalls = response.functionCalls;
    
    return { text: text || "", functionCalls: functionCalls || [] };
  } catch (error: any) {
    console.error("Jarvis brain error details:", error);
    
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
      return { text: "ERROR La clave de acceso API Key proporcionada no es valida Por favor verifiquela en el panel de control" };
    }
    if (errorMessage.includes("not found") && errorMessage.includes("model")) {
      return { text: "ERROR El modelo seleccionado no esta disponible Pruebe con gemini 3 flash preview" };
    }
    if (errorMessage.includes("Quota exceeded")) {
      return { text: "ADVERTENCIA He superado mi cuota de procesamiento gratuita Tendremos que esperar un momento antes de continuar" };
    }

    return { text: "Lo siento señor He detectado una anomalia en mi flujo de datos Por favor verifique la configuracion de mi nucleo central" };
  }
}
