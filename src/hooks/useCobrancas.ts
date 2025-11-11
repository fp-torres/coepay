import { useState, useEffect } from "react";

export interface Cobranca {
  id: string;
  nomeDevedor: string;
  valor: number;
  valorAtual?: number;
  dataVencimento: string;
  status: "ativa" | "vencida" | "paga";
  link: string;
  taxaJuros?: number;
  tipoJuros?: "mensal" | "diario" | "anual";
  metodoCalculo?: "simples" | "composto";
}

export const useCobrancas = (userId: number | undefined) => {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchCobrancas = async () => {
      try {
        const resp = await fetch(`http://localhost:3000/devedores?user_id=${userId}`);
        const data = await resp.json();

        // Mapeia snake_case do backend para camelCase do frontend
        const cobrancasFormatadas = data.map((c: any) => ({
          id: c.id?.toString(),
          nomeDevedor: c.nome,
          valor: parseFloat(c.valor),
          valorAtual: c.valor_atual ? parseFloat(c.valor_atual) : parseFloat(c.valor),
          dataVencimento: c.data_vencimento,
          status: c.status,
          link: c.link,
          taxaJuros: c.taxa_juros ? parseFloat(c.taxa_juros) : undefined,
          tipoJuros: c.tipo_juros,
          metodoCalculo: c.metodo_calculo
        }));

        setCobrancas(cobrancasFormatadas);
      } catch (err) {
        console.error("Erro ao buscar cobranças:", err);
      }
    };

    // Primeiro fetch imediato
    fetchCobrancas();

    // Atualiza a cada 10 segundos
    const interval = setInterval(fetchCobrancas, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  return { cobrancas, setCobrancas };
};
