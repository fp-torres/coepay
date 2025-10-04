import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { gerarQRCodePIXManual } from '@/utils/pix';

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
  const [copiado, setCopiado] = useState(false);

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

  const copiarChavePix = () => {
    if (cobranca?.pixCobranca) {
      navigator.clipboard.writeText(cobranca.pixCobranca);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Banner Motivacional */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3">
        <div className="text-center animate-pulse">
          <p className="font-medium">{mensagensMotivacionais[mensagemAtual]}</p>
        </div>
      </div>

      <div className="container mx-auto p-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">
            Olá, {cobranca.nomeDevedor}! 👋
          </h1>
          <p className="text-muted-foreground">
            Você possui uma cobrança pendente
          </p>
        </div>

        {/* Card de Cobrança */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor Atual</p>
                <p className="text-3xl font-bold text-orange-600">
                  R$ {cobranca.valorAtual.toFixed(2)}
                </p>
                {cobranca.valorAtual !== cobranca.valor && (
                  <p className="text-sm text-muted-foreground">
                    Valor original: R$ {cobranca.valor.toFixed(2)}
                  </p>
                )}
              </div>
              <Badge variant={cobranca.status === 'vencida' ? 'destructive' : 'default'}>
                {cobranca.status === 'vencida' ? 'Vencida' : 'Ativa'}
              </Badge>
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
          </CardContent>
        </Card>

        {/* Card de Pagamento PIX */}
        {cobranca.pixCobranca && (
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-center mb-4">
                Pague com PIX
              </h2>

              {qrCodeURL && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={qrCodeURL} 
                    alt="QR Code PIX" 
                    className="w-64 h-64 border-4 border-orange-500 rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                  Ou copie a chave PIX abaixo:
                </p>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cobranca.pixCobranca}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                  />
                  <Button 
                    onClick={copiarChavePix}
                    variant="outline"
                    size="icon"
                  >
                    {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                {copiado && (
                  <p className="text-sm text-center text-green-600">
                    ✓ Chave copiada!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
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
