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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";



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






const CobrancaPublica = () => {
  const { hash } = useParams();
  const [cobranca, setCobranca] = useState<CobrancaData | null>(null);
  const [qrCodeURL, setQrCodeURL] = useState<string>('');
  const [mensagemAtual, setMensagemAtual] = useState(0);
  const [mensagemPositiva, setMensagemPositiva] = useState<React.ReactNode>('');

  // Mensagens motivacionais e positivas
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

  const mensagensPositivas = [
    <>🎉 Que legal, você está em dia com suas cobranças!</>,
    <>✅ Pagamento confirmado! Sinta-se leve e tranquilo.</>,
    <>👏 Muito bem! Cobranças resolvidas = mente tranquila.</>,
    <>🌟 Que vitória! Pagou e garantiu sua paz financeira.</>,
    <>💡 Pagamento concluído com sucesso. Continue assim!</>,
    <>🚀 Tá em dia! Que tal explorar o <a href="https://coepay.com.br" className="underline font-semibold">CoéPay</a> e ver como gerenciar suas cobranças com facilidade?</>,
  ];
  const TEMPO_TROCA = 5000; // tempo global em ms (5 segundos)

    // Rotaciona mensagens motivacionais
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (cobranca?.pago) {
        // escolhe mensagem positiva aleatória a cada TEMPO_TROCA
        const index = Math.floor(Math.random() * mensagensPositivas.length);
        setMensagemPositiva(mensagensPositivas[index]);
      } else {
        // rotaciona mensagens motivacionais
        setMensagemAtual(prev => (prev + 1) % mensagensMotivacionais.length);
      }
    }, TEMPO_TROCA);

    return () => clearInterval(intervalo);
  }, [cobranca]);

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

   useEffect(() => {
  if (hash) {
    carregarCobranca();

    const interval = setInterval(() => {
      carregarCobranca();
    }, 5000);

    return () => clearInterval(interval);
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
        title: "Pagamento confirmado ✅",
        description: "O responsável será notificado.",
        className: "bg-green-50 text-green-700 border-green-400", // opcional
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
      <div
          className={`min-h-screen ${
            cobranca?.pago
              ? 'bg-gradient-to-br from-green-50 to-green-200'
              : 'bg-gradient-to-br from-orange-50 to-red-50'
          }`}
        >
          {/* Navbar com mensagens */}
          <div
            className={`text-white py-3 ${
              cobranca?.pago
                ? 'bg-gradient-to-r from-green-500 to-green-700'
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            }`}
          >
            <div className="text-center animate-pulse">
              <p className="font-medium">
        {cobranca?.pago ? mensagemPositiva : mensagensMotivacionais[mensagemAtual]}
              </p>
            </div>
          </div>

            <div className="container mx-auto p-4 py-8 max-w-md">
              {/* Saudação */}
      <div className="text-center mb-6">
        <h1
          className={`text-3xl font-bold mb-2 ${
            cobranca?.pago ? 'text-green-600' : 'text-orange-600'
          }`}
        >
          Olá, {cobranca?.nomeDevedor}! 👋
        </h1>
        <p className={`font-medium ${
          cobranca?.pago ? 'text-green-700' : 'text-muted-foreground'
        }`}>
          {cobranca?.pago
            ? 'Você está em dia com suas cobranças!'
            : 'Você possui uma cobrança pendente'}
        </p>
      </div>

         {/* Card Principal da Cobrança */}
<Card className={`mb-6 shadow-lg overflow-hidden ${
  cobranca.pago 
    ? 'bg-gradient-to-br from-green-50 to-green-100' 
    : 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent'
}`}>
  { !cobranca.pago && (
    // Barra esquerda laranja só quando não pago
    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l"></div>
  )}

  <CardContent className={`p-6 text-center space-y-4 ${cobranca.pago ? '' : 'relative'}`}>
    {!cobranca.pago ? (
      <>
        {/* Badge no canto superior direito */}
        <div className="flex justify-end mb-4">
          <Badge variant={cobranca.status === 'vencida' ? 'destructive' : 'default'}>
            {cobranca.status === 'vencida' ? 'Vencida' : 'Ativa'}
          </Badge>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Valor Atual</p>
          <p className="text-5xl font-bold text-orange-600 mb-2">
            R$ {cobranca.valorAtual.toFixed(2)}
          </p>
          {cobranca.valorAtual !== cobranca.valor && (
            <p className="text-sm text-muted-foreground">
              Valor original: R$ {cobranca.valor.toFixed(2)}
            </p>
          )}
        </div>

        {cobranca.descricao && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Descrição:</p>
            <p className="text-sm text-muted-foreground">{cobranca.descricao}</p>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vencimento:</span>
            <span className="font-medium">
              {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {cobranca.status === 'vencida' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dias vencidos:</span>
              <span className="font-medium text-red-600">{cobranca.diasVencido} dias</span>
            </div>
          )}

          {cobranca.taxaJuros && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de juros:</span>
              <span className="font-medium">
                {cobranca.taxaJuros}% {cobranca.tipoJuros === 'mensal' ? 'ao mês' : 'ao dia'}
              </span>
            </div>
          )}
        </div>
      </>
    ) : (
      <>
        {/* Quando pago: texto verde, ícone e mensagem CoéPay */}
        <div className="text-5xl font-bold tracking-tight text-green-700">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cobranca.valorAtual)}
        </div>

        <div className="flex flex-col items-center space-y-2 py-4">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <p className="text-sm mt-1 text-green-700 max-w-prose mx-auto">
          👋 Coé, conheça o <a href="https://coepay.com.br" target="_blank" rel="noreferrer" className="underline font-semibold">CoéPay</a> – 
          um sistema de cobrança rápido, fácil e seguro. Controle juros, veja relatórios diários e mensais, acompanhe histórico de pagamentos e receba notificações automáticas.
        </p>
      </>
    )}
  </CardContent>
</Card>

{/* Card PIX */}
{cobranca ? (
  <Card
    className={`mb-6 shadow-lg overflow-hidden relative ${
      cobranca.pago ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-white'
    }`}
  >
    {/* Linha lateral esquerda colorida */}
    <div
      className={`absolute top-0 bottom-0 left-0 w-1 ${
        cobranca.pago
          ? 'bg-gradient-to-b from-green-400 via-green-500 to-green-600'
          : 'bg-gradient-to-b from-orange-400 via-amber-500 to-orange-600'
      }`}
    />

    <CardHeader className="text-center relative z-10">
      <CardTitle className="text-lg">{cobranca.pago ? 'Pagamento Realizado' : 'Pague com PIX'}</CardTitle>
    </CardHeader>
    <CardContent className="text-center space-y-4 relative z-10">

      {cobranca.pago ? (
        <div className="flex flex-col items-center space-y-2 py-4">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
      ) : (
        <div className="flex justify-center py-2">
          {qrCodeURL ? (
            <div className="p-3 bg-white rounded-xl border-4 border-orange-400 shadow-md">
              <img
                src={qrCodeURL}
                alt="QR Code PIX"
                className="w-48 h-48 rounded-lg"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
          )}
        </div>
      )}

      {/* Chave PIX */}
      {!cobranca.pago && (
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Chave PIX</p>

          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
            <span className="font-mono text-sm text-gray-800 break-all select-all">
              {cobranca.pixCobranca}
            </span>

            <Button
              size="icon"
              variant="ghost"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
              onClick={() => {
                navigator.clipboard.writeText(cobranca.pixCobranca);
                toast({
                  title: "Chave PIX copiada ✅",
                  className: "bg-green-50 text-green-700 border-green-200",
                });
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}






      {/* Botão manual para marcar como pago */}
      {!cobranca.pago && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="mt-4 w-full font-semibold bg-green-600 text-white px-4 py-2 rounded
                    hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700
                    transition flex items-center justify-center"
            >
              <CheckCircle className="mr-2 h-4 w-4 text-white" />
              Confirmar pagamento
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar pagamento</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja marcar esta cobrança como <b>PAGA</b>? <br />
                O responsável pela cobrança será notificado.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancelar</Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded
                          transition"
                onClick={() => marcarComoPago()}
              >
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Status de pagamento */}
      <div className="flex justify-center">
        {cobranca.pago ? (
          <Badge variant="outline">
            ✅ Pago em {new Date(cobranca.pagoEm!).toLocaleString()}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-300 
                       hover:bg-yellow-100 hover:text-yellow-800 cursor-default"
          >
            ⏳ Aguardando pagamento
          </Badge>
        )}
      </div>

      {/* Texto de instrução só aparece se ainda não foi pago */}
      {!cobranca.pago && (
        <p className="text-xs text-gray-400 mt-1">
          Escaneie o QR Code ou copie a chave PIX para realizar o pagamento
        </p>
      )}
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
