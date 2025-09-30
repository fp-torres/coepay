import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { payload } from 'pix-payload';
import QRCode from 'qrcode';
import { gerarQRCodePIXManual } from '@/utils/pix';



interface CobrancaData {
  id: string;
  nomeDevedor: string;
  valor: number;
  valorAtual: number;
  dataVencimento: string;
  diasVencido: number;
  pixCobranca: string;
  status: 'ativa' | 'vencida' | 'paga'; // adiciona "paga"
  pago?: boolean; // true se já foi pago
  pagoEm?: string; // timestamp do pagamento
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
  status: cobrancaData.pago ? 'paga' : status, // muda para paga se já estiver pago
  pago: cobrancaData.pago,
  pagoEm: cobrancaData.pago_em,
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
    carregarCobranca(); // carrega inicialmente

    // 🚀 Auto-refresh a cada 5 segundos
    const interval = setInterval(() => {
      carregarCobranca();
    }, 5000);

    return () => clearInterval(interval); // limpa intervalo quando o componente desmonta
  }
}, [hash]);

const marcarComoPago = async () => {
  if (!cobranca) return;
  try {
    const resp = await fetch(`http://localhost:5000/devedores/${cobranca.id}/pagar`, {
      method: "PUT",
    });
    if (!resp.ok) throw new Error("Erro ao atualizar cobrança");

    toast({
      title: "Cobrança atualizada",
      description: "Pagamento marcado como pago ✅",
      className: "bg-green-50 text-green-700 border-green-400", // cores personalizadas

    });

    setCobranca({
      ...cobranca,
      pago: true,
      pagoEm: new Date().toISOString(),
      status: "paga",
    });
  } catch (err) {
    console.error(err);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar o status",
      variant: "destructive",
    });
  }
};


  const gerarQRCode = (pix: string, valor: number, nome: string) => {
    // Em um caso real, aqui seria gerado um QR Code PIX válido
    // Para o mock, vamos usar um placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX:${pix}:${valor}:${nome}`;
  };

  if (!cobranca) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Navbar com mensagens motivacionais */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3">
        <div className="text-center animate-pulse">
          <p className="font-medium">{mensagensMotivacionais[mensagemAtual]}</p>
        </div>
      </div>

      <div className="container mx-auto p-4 py-8 max-w-md">
        {/* Saudação */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">
            Olá, {cobranca.nomeDevedor}! 👋
          </h1>
          <p className="text-muted-foreground">
            Você possui uma cobrança pendente
          </p>
        </div>
         {/* Card Principal da Cobrança */}
<Card className={`mb-6 border-l-4 shadow-sm ${
  cobranca.pago ? 'border-l-green-500 bg-green-50' : cobranca.status === 'vencida' ? 'border-l-red-500 bg-white' : 'border-l-orange-500 bg-white'
}`}>
  <CardHeader className="text-center">
    <CardTitle className="flex items-center justify-center gap-2">
      {cobranca.pago ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : cobranca.status === 'vencida' ? (
        <AlertTriangle className="w-5 h-5 text-red-500" />
      ) : (
        <Clock className="w-5 h-5 text-orange-500" />
      )}
      Valor da Dívida
    </CardTitle>
  </CardHeader>
  <CardContent className="text-center space-y-4">
    <div className={`text-4xl font-bold ${
      cobranca.pago ? 'text-green-700' : 'text-red-600'
    }`}>
      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cobranca.valorAtual)}
    </div>

 {cobranca.pago && (
  <p className="text-sm mt-1 text-green-700">
    🚀 Conheça o <a href="https://coepay.com.br" className="underline font-semibold">CoéPay</a> – seu jeito prático de gerenciar cobranças e pagamentos!
  </p>
)}


    {cobranca.descricao && (
      <p className="text-sm text-muted-foreground italic">
        {cobranca.descricao}
      </p>
    )}

    {cobranca.valorAtual !== cobranca.valor && !cobranca.pago && (
      <div className="text-sm text-muted-foreground">
        Valor original: <span className="line-through">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cobranca.valor)}</span>
      </div>
    )}

    {!cobranca.pago && cobranca.status === 'vencida' && (
      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
        {cobranca.taxaJuros
          ? `Juros aplicados: ${cobranca.taxaJuros}% ${cobranca.tipoJuros === 'diario' ? 'ao dia' : 'ao mês'}`
          : "Sem juros"}
      </div>
    )}

    {!cobranca.pago && cobranca.status === 'vencida' && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <Badge variant="destructive" className="mb-2">
          Cobrança Vencida
        </Badge>
        <p className="text-sm text-red-700">
          Data de vencimento: {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}
        </p>
        <p className="text-sm font-semibold text-red-700">
          {cobranca.diasVencido} dia(s) vencido(s)
        </p>
      </div>
    )}

    {!cobranca.pago && cobranca.status === 'ativa' && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <Badge variant="default" className="mb-2">
          No Prazo
        </Badge>
        <p className="text-sm text-blue-700">
          Data de vencimento: {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}
        </p>
      </div>
    )}
  </CardContent>
</Card>

{/* Card PIX */}
{cobranca ? (
  <Card className={`mb-6 border-l-4 ${cobranca.pago ? 'border-l-green-500' : 'border-l-amber-1000'} shadow-sm`}>
    <CardHeader className="text-center">
      <CardTitle>Pague com PIX</CardTitle>
    </CardHeader>
    <CardContent className="text-center space-y-4">

      {/* QR Code */}
      <div className="flex justify-center">
        {qrCodeURL ? (
          <img
            src={qrCodeURL}
            alt="QR Code PIX"
            className="w-48 h-48 border rounded-lg"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
        )}
      </div>

      {/* Chave PIX */}
      <div className="bg-gray-100 p-3 rounded-md">
        <p className="text-xs text-gray-500 mb-1">Chave PIX</p>
        <div className="flex items-center justify-between bg-white p-2 rounded border">
          <span className="font-mono text-sm break-all">{cobranca.pixCobranca}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(cobranca.pixCobranca);
              toast({
                title: "Chave PIX copiada",
                description: "Você pode colar onde precisar.",
              });
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status de pagamento */}
      <div className={`p-2 rounded-md font-medium ${cobranca.pago ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
        {cobranca.pago ? (
          <>✅ Pago em {new Date(cobranca.pagoEm!).toLocaleString()}</>
        ) : (
          <>⏳ Aguardando pagamento</>
        )}
      </div>

      {/* Botão manual para marcar como pago */}
      {!cobranca.pago && (
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => {
            toast({
              title: "Confirmar pagamento?",
              description: "Clique em confirmar para marcar esta cobrança como paga.",
              action: (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    marcarComoPago();
                    toast({
                      title: "Cobrança marcada como paga",
                      description: `Pagamento registrado com sucesso!`,
                    });
                  }}
                >
                  Confirmar
                </Button>
              ),
            });
          }}
        >
          Marcar como pago
        </Button>
      )}

      <p className="text-xs text-gray-400 mt-1">
        Escaneie o QR Code ou copie a chave PIX para realizar o pagamento
      </p>
    </CardContent>
  </Card>
) : (
  <Card className="mb-6 border-l-4 border-l-gray-300 shadow-sm">
    <CardContent className="text-center">
      <p className="text-sm text-gray-500">Carregando cobrança...</p>
    </CardContent>
  </Card>
)}




        {/* Footer motivacional */}
        <div className="text-center mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 Pagamento realizado? Entre em contato para confirmar!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CobrancaPublica;