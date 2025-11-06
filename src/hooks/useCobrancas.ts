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
  tipoJuros?: "mensal" | "diario";
}

export const useCobrancas = (userId: number | undefined) => {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchCobrancas = async () => {
      try {
        const resp = await fetch(`http://localhost:5000/devedores?user_id=${userId}`);
        const data = await resp.json();

        // Backend já retorna valor_atual calculado
        const cobrancasComValorAtual = data.map((c: any) => ({
          ...c,
          valorAtual: c.valor_atual || c.valor
        }));

        setCobrancas(cobrancasComValorAtual);
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
