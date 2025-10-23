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
    const { imagesBase64, valor, chavePix } = await req.json();
    
    if (!imagesBase64 || !Array.isArray(imagesBase64) || imagesBase64.length === 0) {
      throw new Error("Array de imagens não fornecido");
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Processando ${imagesBase64.length} comprovante(s) com AI...`);
    
    // Processa cada comprovante e verifica se pelo menos um é válido
    const resultados = [];
    
    for (let i = 0; i < imagesBase64.length; i++) {
      console.log(`Processando comprovante ${i + 1}/${imagesBase64.length}`);
      
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
                    url: imagesBase64[i]
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
        console.error(`Erro na API AI para comprovante ${i + 1}:`, response.status, errorText);
        resultados.push({ 
          valido: false, 
          motivo: "Erro ao processar comprovante com AI",
          indice: i + 1
        });
        continue;
      }

      const data = await response.json();
      console.log(`Resposta da AI para comprovante ${i + 1}:`, JSON.stringify(data));

      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        resultados.push({ 
          valido: false, 
          motivo: "AI não retornou dados estruturados",
          indice: i + 1
        });
        continue;
      }

      const dadosExtraidos = JSON.parse(toolCall.function.arguments);
      console.log(`Dados extraídos do comprovante ${i + 1}:`, dadosExtraidos);

      if (!dadosExtraidos.sucesso) {
        resultados.push({ 
          valido: false, 
          motivo: "Não foi possível ler o comprovante",
          indice: i + 1
        });
        continue;
      }

      // Verifica se é realmente um comprovante
      if (!dadosExtraidos.contemComprovante) {
        resultados.push({ 
          valido: false, 
          motivo: "Documento não parece ser um comprovante PIX",
          indice: i + 1
        });
        continue;
      }

      // Validação do valor (tolerância de R$ 0.50)
      const valorComprovante = parseFloat(dadosExtraidos.valor);
      const valorEsperado = parseFloat(valor);
      const diferencaValor = Math.abs(valorComprovante - valorEsperado);
      
      if (diferencaValor > 0.50) {
        resultados.push({ 
          valido: false, 
          motivo: `Valor do comprovante ${i + 1} (R$ ${valorComprovante.toFixed(2)}) não corresponde ao valor da cobrança (R$ ${valorEsperado.toFixed(2)})`,
          indice: i + 1,
          dadosExtraidos
        });
        continue;
      }

      // Validação da chave PIX
      const chaveComprovanteNorm = dadosExtraidos.chavePix.replace(/\D/g, '');
      const chaveEsperadaNorm = chavePix.replace(/\D/g, '');
      
      const isChaveIgual = chaveComprovanteNorm === chaveEsperadaNorm || 
                           dadosExtraidos.chavePix.toLowerCase() === chavePix.toLowerCase();
      
      if (!isChaveIgual) {
        resultados.push({ 
          valido: false, 
          motivo: `Chave PIX do comprovante ${i + 1} (${dadosExtraidos.chavePix}) não corresponde à chave esperada`,
          indice: i + 1,
          dadosExtraidos
        });
        continue;
      }

      // Comprovante válido!
      resultados.push({ 
        valido: true, 
        motivo: `Comprovante ${i + 1} validado com sucesso!`,
        indice: i + 1,
        dadosExtraidos
      });
    }

    // Verifica se pelo menos um comprovante é válido
    const algumValido = resultados.some(r => r.valido);
    
    if (algumValido) {
      const comprovantesValidos = resultados.filter(r => r.valido);
      return new Response(
        JSON.stringify({ 
          valido: true, 
          motivo: `${comprovantesValidos.length} comprovante(s) validado(s) com sucesso!`,
          resultados
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Nenhum comprovante válido
    return new Response(
      JSON.stringify({ 
        valido: false, 
        motivo: "Nenhum dos comprovantes foi validado com sucesso",
        resultados
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
