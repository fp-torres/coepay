import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { gerarPayloadPIXManual, gerarQRCodePIXManual } from '@/utils/pix';
import { CobrancaHeader } from "@/components/cobranca-publica/CobrancaHeader";
import { CobrancaSaudacao } from "@/components/cobranca-publica/CobrancaSaudacao";
import { CobrancaInfoCard } from "@/components/cobranca-publica/CobrancaInfoCard";
import { CobrancaPixCard } from "@/components/cobranca-publica/CobrancaPixCard";
import { CobrancaFooter } from "@/components/cobranca-publica/CobrancaFooter";
import { ValidarComprovanteDialog } from "@/components/cobranca-publica/ValidarComprovanteDialog";
import { Badge } from "@/components/ui/badge";



interface CobrancaData {
  id: string;
  nomeDevedor: string;
  valor: number;
  valorAtual: number;
  dataVencimento: string;
  diasVencido: number;
  pixCobranca: string;
  pixCopiaECola: string;
  recebedorNome?: string;
  recebedorEmail?: string;
  status: 'no prazo' | 'vencida' | 'paga'; // adiciona "paga"
  pago?: boolean; // true se já foi pago
  pagoEm?: string; // timestamp do pagamento
  taxaJuros?: number;
  tipoJuros?: string;
  metodoCalculo?: string;
  descricao?: string;
  comprovanteUrl?: string;
}






const CobrancaPublica = () => {
  const { hash } = useParams();
  const [cobranca, setCobranca] = useState<CobrancaData | null>(null);
  const [qrCodeURL, setQrCodeURL] = useState<string>('');
  const [mensagemAtual, setMensagemAtual] = useState(0);
  const [mensagemPositiva, setMensagemPositiva] = useState<React.ReactNode>('');
  const [comprovanteFiles, setComprovanteFiles] = useState<File[]>([]);
  const [validandoComprovante, setValidandoComprovante] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Pegando usuário logado do localStorage
  const userData = localStorage.getItem('user');
  const currentUser = userData ? JSON.parse(userData) : null;

const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications, addNotification } = useNotifications(currentUser?.id);


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


  // Carrega cobrança
    const carregarCobranca = async () => {
      if (!hash) return;
      try {
        const response = await fetch(`http://localhost:3000/devedores/hash/${hash}`);
        if (!response.ok) return;

        const cobrancaData = await response.json();

        // Backend já retorna valor_atual calculado
        const valorAtual = parseFloat(cobrancaData.valor_atual || cobrancaData.valor);

        // Calcula dias vencido e status
        const hoje = new Date();
        const vencimento = new Date(cobrancaData.data_vencimento);
        const diffTime = hoje.getTime() - vencimento.getTime();
        const diasVencido = hoje > vencimento ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;
        const status = (hoje > vencimento ? 'vencida' : 'no prazo') as 'vencida' | 'no prazo';

        // Busca dados do usuário para pegar o PIX padrão
        const userResponse = await fetch(`http://localhost:3000/auth/getUser/${cobrancaData.user_id}`);
        const userData = userResponse.ok ? await userResponse.json() : { pix: '', name: '', email: '' };

        // Usa o PIX específico da cobrança, se existir, senão usa o PIX padrão do usuário
        const pixFinal = cobrancaData.pix_cobranca || userData.pix || '';

      const pixCopiaECola = pixFinal
        ? gerarPayloadPIXManual(pixFinal, valorAtual, userData.name || cobrancaData.nome)
        : "";

      const cobrancaObj: CobrancaData = {
        id: cobrancaData.id.toString(),
        nomeDevedor: cobrancaData.nome,
        valor: parseFloat(cobrancaData.valor),
        valorAtual,
        dataVencimento: cobrancaData.data_vencimento,
        diasVencido,
        pixCobranca: pixFinal,
        pixCopiaECola,
        recebedorNome: userData.name || '',
        recebedorEmail: userData.email || '',
        status: cobrancaData.pago ? 'paga' : status,
        pago: cobrancaData.pago,
        pagoEm: cobrancaData.pago_em,
        taxaJuros: cobrancaData.taxa_juros ? parseFloat(cobrancaData.taxa_juros) : undefined,
        tipoJuros: cobrancaData.tipo_juros,
        metodoCalculo: cobrancaData.metodo_calculo,
        descricao: cobrancaData.descricao || '',
        comprovanteUrl: cobrancaData.comprovante_url
      };


      setCobranca(cobrancaObj);

        // Gera QR Code PIX
        if (cobrancaObj.pixCobranca && cobrancaObj.valorAtual) {
          const qrCode = await gerarQRCodePIXManual(
            cobrancaObj.pixCobranca,
            cobrancaObj.valorAtual,
            cobrancaObj.recebedorNome || cobrancaObj.nomeDevedor
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

const validarEMarcarComoPago = async () => {
  if (!cobranca) return;
  
  if (comprovanteFiles.length === 0) {
    toast({
      title: "Comprovante obrigatório",
      description: "Por favor, faça upload de pelo menos um comprovante de pagamento.",
      variant: "destructive",
    });
    return;
  }

  setValidandoComprovante(true);

  try {
    // Upload dos comprovantes para o backend
    const formData = new FormData();
    comprovanteFiles.forEach((file) => {
      formData.append('comprovantes', file);
    });

    const uploadResponse = await fetch('http://localhost:3000/upload/comprovante', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) throw new Error("Erro ao fazer upload dos comprovantes");

    const uploadData = await uploadResponse.json();
    const comprovanteUrls = uploadData.urls.join(',');

    // Marca como pago com as URLs dos comprovantes
    const resp = await fetch(`http://localhost:3000/devedores/${cobranca.id}/pagar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comprovante_url: comprovanteUrls }),
    });
    
    if (!resp.ok) throw new Error("Erro ao atualizar cobrança");

    setCobranca({
      ...cobranca,
      pago: true,
      pagoEm: new Date().toISOString(),
      status: "paga",
      comprovanteUrl: comprovanteUrls,
    });

    const novaNotificacao: Notification = {
      id: `${cobranca.id}-${Date.now()}`,
      cobrancaId: cobranca.id,
      nomeDevedor: cobranca.nomeDevedor,
      valor: Number(cobranca.valor),
      timestamp: new Date(),
      read: false,
      type: 'payment_confirmed',
    };

    addNotification(novaNotificacao);

    toast({
      title: "Pagamento enviado para verificação ✅",
      description: "Comprovante(s) recebido(s)! Aguarde a validação manual.",
    });

    setDialogOpen(false);
    setComprovanteFiles([]);

  } catch (err) {
    console.error(err);
    toast({
      title: "Erro",
      description: "Não foi possível enviar o comprovante",
      variant: "destructive",
    });
  } finally {
    setValidandoComprovante(false);
  }
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
          ? 'bg-gradient-to-br from-emerald-50 via-white to-green-100'
          : cobranca.status === 'vencida'
          ? 'bg-gradient-to-br from-red-50 via-white to-orange-100'
          : 'bg-gradient-to-br from-orange-50 via-white to-amber-100'
      }`}
    >
      <CobrancaHeader
        isPago={!!cobranca?.pago}
        mensagem={cobranca?.pago ? mensagemPositiva : mensagensMotivacionais[mensagemAtual]}
      />

      <div className="container mx-auto p-4 py-8 max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <CobrancaSaudacao
              nomeDevedor={cobranca.nomeDevedor}
              isPago={!!cobranca.pago}
            />
          </div>
          <Badge
            className={`w-fit text-sm px-3 py-1 ${
              cobranca.status === "paga"
                ? "bg-green-600 hover:bg-green-600"
                : cobranca.status === "vencida"
                ? "bg-red-600 hover:bg-red-600"
                : "bg-orange-600 hover:bg-orange-600"
            }`}
          >
            {cobranca.status === "paga"
              ? "Pagamento confirmado"
              : cobranca.status === "vencida"
              ? "Cobrança vencida"
              : "Aguardando pagamento"}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <CobrancaInfoCard
            pago={!!cobranca.pago}
            status={cobranca.status}
            valorAtual={cobranca.valorAtual}
            valor={cobranca.valor}
            descricao={cobranca.descricao}
            dataVencimento={cobranca.dataVencimento}
            diasVencido={cobranca.diasVencido}
            taxaJuros={cobranca.taxaJuros}
            tipoJuros={cobranca.tipoJuros}
            metodoCalculo={cobranca.metodoCalculo}
          />

          <CobrancaPixCard
            pago={!!cobranca.pago}
            pagoEm={cobranca.pagoEm}
            qrCodeURL={qrCodeURL}
            pixCobranca={cobranca.pixCobranca}
            pixCopiaECola={cobranca.pixCopiaECola}
            recebedorNome={cobranca.recebedorNome}
            recebedorEmail={cobranca.recebedorEmail}
            comprovanteUrl={cobranca.comprovanteUrl}
            onConfirmarPagamento={() => setDialogOpen(true)}
            renderValidarDialog={() => (
              <ValidarComprovanteDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                comprovanteFiles={comprovanteFiles}
                onComprovanteChange={setComprovanteFiles}
                validandoComprovante={validandoComprovante}
                onValidar={validarEMarcarComoPago}
              />
            )}
          />
        </div>

        <CobrancaFooter />
      </div>
    </div>
  );
};

export default CobrancaPublica;
