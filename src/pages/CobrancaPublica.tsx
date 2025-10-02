import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { gerarQRCodePIXManual } from '@/utils/pix';
import { MotivationalBanner } from "@/components/cobranca/MotivationalBanner";
import { CobrancaHeader } from "@/components/cobranca/CobrancaHeader";
import { CobrancaCard } from "@/components/cobranca/CobrancaCard";
import { PixPaymentCard } from "@/components/cobranca/PixPaymentCard";
import { PaymentFooter } from "@/components/cobranca/PaymentFooter";



interface CobrancaData {
  id: string;
  nomeDevedor: string;
  valor: number;
  valorAtual: number;
  dataVencimento: string;
  diasVencido: number;
  pixCobranca: string;
  status: 'ativa' | 'vencida';
  taxaJuros?: number;
  tipoJuros?: string;
  descricao?: string; 
}

const mensagensMotivacionais = [
  "💸 Que tal quitar essa e ficar livre? Sua tranquilidade vale mais!",
  "🚀 Pagamento em dia = nome limpo na praça! Bora resolver isso?",
  "😎 Seja o herói da própria história: pague e seja admirado!",
  "⚡ Aproveite e resolva agora! Nada como ficar sem dívidas!",
  "💡 Quitar hoje é investir na sua paz de amanhã!",
  "🔥 Não deixe para depois: cada dia conta para ficar tranquilo!",
  "🏆 Pague agora e sinta a vitória de estar em dia!",
  "💰 Dinheiro em dia é felicidade garantida!",
  "🌟 Resolver suas cobranças é um passo para a liberdade financeira!",
  "🎯 Foque no que importa: pagar e se livrar do estresse!",
  "💌 Um lembrete amigável: pagar cedo é sempre melhor!",
  "📅 Não adie! Um pequeno passo hoje evita dor de cabeça amanhã!",
  "💎 Sua reputação agradece: pagamento em dia é sinal de responsabilidade!",
  "🚀 Transforme essa cobrança em uma conquista pessoal!",
  "✨ Liberte-se da preocupação e quite sua cobrança agora!"
];





const CobrancaPublica = () => {
  const { hash } = useParams();
  const [cobranca, setCobranca] = useState<CobrancaData | null>(null);
  const [qrCodeURL, setQrCodeURL] = useState<string>('');
  const [mensagemAtual, setMensagemAtual] = useState(0);

  
  // Faz as mensagens mudarem automaticamente
  useEffect(() => {
    const intervalo = setInterval(() => {
      setMensagemAtual(prev => (prev + 1) % mensagensMotivacionais.length);
    }, 5000); // troca a cada 5 segundos

    return () => clearInterval(intervalo);
  }, []);

  // Função precisa estar aqui, dentro do componente
  const calcularJurosCompostos = (valorInicial: number, taxa: number, tipo: 'mensal' | 'diario', dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    
    if (hoje <= vencimento) return valorInicial;
    
    const diffTime = hoje.getTime() - vencimento.getTime();
    let periodos: number;
    
    if (tipo === 'diario') {
      periodos = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      periodos = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Média de dias por mês
    }
    
    return valorInicial * Math.pow(1 + (taxa / 100), periodos);
  };

  
  // Carrega cobrança
  useEffect(() => {
    const carregarCobranca = async () => {
      if (!hash) return;
      try {
        const response = await fetch(`http://localhost:5000/cobranca/${hash}`);
        if (!response.ok) return;

        const cobrancaData = await response.json();

        let valorAtual = parseFloat(cobrancaData.valor);
        if (cobrancaData.taxa_juros && cobrancaData.tipo_juros) {
          valorAtual = calcularJurosCompostos(
            parseFloat(cobrancaData.valor),
            parseFloat(cobrancaData.taxa_juros),
            cobrancaData.tipo_juros,
            cobrancaData.data_vencimento
          );
        }

      // Calcula dias vencido e status
      const hoje = new Date();
      const vencimento = new Date(cobrancaData.data_vencimento);
      const diffTime = hoje.getTime() - vencimento.getTime();
      const diasVencido = hoje > vencimento ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;
      const status = (hoje > vencimento ? 'vencida' : 'ativa') as 'vencida' | 'ativa';

      // Busca dados do usuário para pegar o PIX
      const userResponse = await fetch(`http://localhost:5000/users/${cobrancaData.user_id}`);
      const userData = userResponse.ok ? await userResponse.json() : { pix: '' };

      const cobrancaObj: CobrancaData = {
        id: cobrancaData.id.toString(),
        nomeDevedor: cobrancaData.nome,
        valor: parseFloat(cobrancaData.valor),
        valorAtual,
        dataVencimento: cobrancaData.data_vencimento,
        diasVencido,
        pixCobranca: userData.pix || '',
        status,
        taxaJuros: cobrancaData.taxa_juros ? parseFloat(cobrancaData.taxa_juros) : undefined,
        tipoJuros: cobrancaData.tipo_juros,
        descricao: cobrancaData.descricao || ''
      };

      setCobranca(cobrancaObj);

      // Gera QR Code PIX
      if (cobrancaObj.pixCobranca && cobrancaObj.valorAtual) {
          const qrCode = await gerarQRCodePIXManual(
            cobrancaObj.pixCobranca,
            cobrancaObj.valorAtual,
            cobrancaObj.nomeDevedor
          );

        setQrCodeURL(qrCode);
      }

    } catch (err) {
      console.error(err);
    }
  };

  if (hash) {
    carregarCobranca();
  }
}, [hash]);

  if (!cobranca) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <MotivationalBanner message={mensagensMotivacionais[mensagemAtual]} />

      <div className="container mx-auto p-4 py-8 max-w-md">
        <CobrancaHeader nomeDevedor={cobranca.nomeDevedor} />
        
        <CobrancaCard
          valorAtual={cobranca.valorAtual}
          valorOriginal={cobranca.valor}
          descricao={cobranca.descricao}
          status={cobranca.status}
          dataVencimento={cobranca.dataVencimento}
          diasVencido={cobranca.diasVencido}
          taxaJuros={cobranca.taxaJuros}
          tipoJuros={cobranca.tipoJuros}
        />

        {cobranca.pixCobranca && (
          <PixPaymentCard
            qrCodeURL={qrCodeURL}
            pixKey={cobranca.pixCobranca}
          />
        )}

        <PaymentFooter />
      </div>
    </div>
  );
};

export default CobrancaPublica;