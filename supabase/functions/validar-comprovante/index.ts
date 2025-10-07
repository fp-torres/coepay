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
    const { imageBase64, valor, chavePix } = await req.json();
    
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
                text: `Analise este documento de pagamento PIX e extraia as seguintes informações:
1. Verifique se o documento contém as palavras "comprovante", "pix" ou termos relacionados a pagamento
2. Valor pago (em reais)
3. Chave PIX do destinatário/beneficiário (pode ser CPF, CNPJ, e-mail, telefone ou chave aleatória)

IMPORTANTE: Este documento pode ser uma imagem ou PDF. Analise todo o conteúdo disponível.

Retorne APENAS um JSON válido no seguinte formato:
{
  "valor": número sem símbolos,
  "chavePix": "chave pix encontrada no comprovante",
  "contemComprovante": true/false (se contém palavras como comprovante, pix, pagamento),
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
              description: "Extrai dados estruturados de um comprovante de pagamento PIX",
              parameters: {
                type: "object",
                properties: {
                  valor: {
                    type: "number",
                    description: "Valor do pagamento em reais"
                  },
                  chavePix: {
                    type: "string",
                    description: "Chave PIX do destinatário (CPF, CNPJ, email, telefone ou chave aleatória)"
                  },
                  contemComprovante: {
                    type: "boolean",
                    description: "Se o documento contém palavras relacionadas a comprovante/pix/pagamento"
                  },
                  sucesso: {
                    type: "boolean",
                    description: "Se foi possível extrair as informações"
                  }
                },
                required: ["valor", "chavePix", "contemComprovante", "sucesso"],
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
          motivo: "Não foi possível ler o comprovante. Por favor, tente com uma imagem ou PDF mais nítido." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verifica se é realmente um comprovante
    if (!dadosExtraidos.contemComprovante) {
      return new Response(
        JSON.stringify({ 
          valido: false, 
          motivo: "O documento não parece ser um comprovante de pagamento PIX. Por favor, envie um comprovante válido." 
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

    // Validação da chave PIX
    const chaveComprovanteNorm = dadosExtraidos.chavePix.replace(/\D/g, ''); // Remove formatação
    const chaveEsperadaNorm = chavePix.replace(/\D/g, '');
    
    // Verifica se as chaves são iguais (ignorando formatação)
    // Para email e chave aleatória, compara diretamente
    const isChaveIgual = chaveComprovanteNorm === chaveEsperadaNorm || 
                         dadosExtraidos.chavePix.toLowerCase() === chavePix.toLowerCase();
    
    if (!isChaveIgual) {
      return new Response(
        JSON.stringify({ 
          valido: false, 
          motivo: `Chave PIX do comprovante (${dadosExtraidos.chavePix}) não corresponde à chave esperada`,
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
