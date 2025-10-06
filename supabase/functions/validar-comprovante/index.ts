import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, valor, nomeBeneficiario, dataVencimento } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Processando comprovante com AI...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em análise de comprovantes de pagamento PIX. Extraia informações precisas de comprovantes."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise este comprovante de pagamento e extraia as seguintes informações:
1. Valor pago (em reais)
2. Nome do beneficiário/destinatário
3. Data e hora do pagamento

Retorne APENAS um JSON válido no seguinte formato:
{
  "valor": número sem símbolos,
  "beneficiario": "nome completo",
  "data": "DD/MM/YYYY",
  "hora": "HH:MM",
  "sucesso": true/false
}`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extrair_dados_comprovante",
              description: "Extrai dados estruturados de um comprovante de pagamento",
              parameters: {
                type: "object",
                properties: {
                  valor: {
                    type: "number",
                    description: "Valor do pagamento em reais"
                  },
                  beneficiario: {
                    type: "string",
                    description: "Nome do beneficiário/destinatário"
                  },
                  data: {
                    type: "string",
                    description: "Data do pagamento no formato DD/MM/YYYY"
                  },
                  hora: {
                    type: "string",
                    description: "Hora do pagamento no formato HH:MM"
                  },
                  sucesso: {
                    type: "boolean",
                    description: "Se foi possível extrair as informações"
                  }
                },
                required: ["valor", "beneficiario", "data", "sucesso"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extrair_dados_comprovante" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API AI:", response.status, errorText);
      throw new Error("Erro ao processar comprovante com AI");
    }

    const data = await response.json();
    console.log("Resposta da AI:", JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("AI não retornou dados estruturados");
    }

    const dadosExtraidos = JSON.parse(toolCall.function.arguments);
    console.log("Dados extraídos:", dadosExtraidos);

    if (!dadosExtraidos.sucesso) {
      return new Response(
        JSON.stringify({ 
          valido: false, 
          motivo: "Não foi possível ler o comprovante. Por favor, tente com uma imagem mais nítida." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validação do valor (tolerância de R$ 0.50)
    const valorComprovante = parseFloat(dadosExtraidos.valor);
    const valorEsperado = parseFloat(valor);
    const diferencaValor = Math.abs(valorComprovante - valorEsperado);
    
    if (diferencaValor > 0.50) {
      return new Response(
        JSON.stringify({ 
          valido: false, 
          motivo: `Valor do comprovante (R$ ${valorComprovante.toFixed(2)}) não corresponde ao valor da cobrança (R$ ${valorEsperado.toFixed(2)})`,
          dadosExtraidos
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validação do nome (similaridade básica)
    const nomeComprovanteNorm = dadosExtraidos.beneficiario.toLowerCase().trim();
    const nomeEsperadoNorm = nomeBeneficiario.toLowerCase().trim();
    
    if (!nomeComprovanteNorm.includes(nomeEsperadoNorm.split(' ')[0]) && 
        !nomeEsperadoNorm.includes(nomeComprovanteNorm.split(' ')[0])) {
      return new Response(
        JSON.stringify({ 
          valido: false, 
          motivo: `Nome do beneficiário no comprovante (${dadosExtraidos.beneficiario}) não corresponde ao esperado (${nomeBeneficiario})`,
          dadosExtraidos
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validação da data (deve ser hoje ou nos últimos 7 dias)
    const [dia, mes, ano] = dadosExtraidos.data.split('/');
    const dataComprovante = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 7);
    
    if (dataComprovante > hoje || dataComprovante < seteDiasAtras) {
      return new Response(
        JSON.stringify({ 
          valido: false, 
          motivo: `Data do comprovante (${dadosExtraidos.data}) está fora do período válido (últimos 7 dias)`,
          dadosExtraidos
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        valido: true, 
        motivo: "Comprovante validado com sucesso!",
        dadosExtraidos
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro ao validar comprovante:", error);
    return new Response(
      JSON.stringify({ 
        valido: false, 
        motivo: error instanceof Error ? error.message : "Erro ao processar comprovante" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
