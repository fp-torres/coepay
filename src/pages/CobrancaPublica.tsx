import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CobrancaData {
  id: string;
  nomeDevedor: string;
  valor: number;
  dataInicio: string;
  diasAtraso: number;
  pixCobranca: string;
  status: 'ativa' | 'atrasada';
}

const mensagensMotivacionais = [
  "💸 Que tal quitar essa e ficar livre? Sua tranquilidade vale mais!",
  "🚀 Pagamento em dia = nome limpo na praça! Bora resolver isso?",
  "😎 Seja o herói da própria história: pague e seja admirado!"
];

const CobrancaPublica = () => {
  const { id } = useParams();
  const [cobranca, setCobranca] = useState<CobrancaData | null>(null);
  const [mensagemAtual, setMensagemAtual] = useState(0);

  useEffect(() => {
  const storedCobrancas = localStorage.getItem("cobrancas");
  const cobrancasObj = storedCobrancas ? JSON.parse(storedCobrancas) : [];

  const cobrancaData = cobrancasObj.find((c: any) => c.id === id);
  if (cobrancaData) {
    setCobranca({
      id: cobrancaData.id,
      nomeDevedor: cobrancaData.nomeDevedor,
      valor: cobrancaData.valorAtual || cobrancaData.valor,
      dataInicio: cobrancaData.dataInicio,
      diasAtraso: cobrancaData.status === 'atrasada'
        ? Math.ceil((new Date().getTime() - new Date(cobrancaData.dataInicio).getTime()) / (1000*60*60*24))
        : 0,
      pixCobranca: JSON.parse(localStorage.getItem("user") || "{}").pix,
      status: cobrancaData.status
    });
  }
}, [id]);


useEffect(() => {
  const storedCobrancas = localStorage.getItem("cobrancas");
  const cobrancasObj = storedCobrancas ? JSON.parse(storedCobrancas) : [];

  const cobrancaData = cobrancasObj.find((c: any) => c.id === id);
  if (cobrancaData) {
    setCobranca({
      id: cobrancaData.id,
      nomeDevedor: cobrancaData.nomeDevedor,
      valor: cobrancaData.valorAtual || cobrancaData.valor,
      dataInicio: cobrancaData.dataInicio,
      diasAtraso: cobrancaData.status === 'atrasada' ? Math.ceil((new Date().getTime() - new Date(cobrancaData.dataInicio).getTime()) / (1000*60*60*24)) : 0,
      pixCobranca: JSON.parse(localStorage.getItem("user") || "{}").pix,
      status: cobrancaData.status
    });
  }
}, [id]);
;

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
        <Card className="mb-6 border-l-4 border-l-orange-500">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {cobranca.status === 'atrasada' ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <Clock className="w-5 h-5 text-orange-500" />
              )}
              Valor da Dívida
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-red-600">
              R$ {cobranca.valor.toFixed(2).replace('.', ',')}
            </div>
            
            {cobranca.status === 'atrasada' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Badge variant="destructive" className="mb-2">
                  Cobrança Atrasada
                </Badge>
                <p className="text-sm text-red-700">
                  Data de vencimento: {new Date(cobranca.dataInicio).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm font-semibold text-red-700">
                  {cobranca.diasAtraso} dia(s) em atraso
                </p>
              </div>
            )}

            {cobranca.status === 'ativa' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Badge variant="default" className="mb-2">
                  Cobrança Ativa
                </Badge>
                <p className="text-sm text-blue-700">
                  Data de vencimento: {new Date(cobranca.dataInicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code PIX */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Pague com PIX</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <img
                src={gerarQRCode(cobranca.pixCobranca, cobranca.valor, cobranca.nomeDevedor)}
                alt="QR Code PIX"
                className="w-48 h-48 border rounded-lg"
              />
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Chave PIX:</p>
              <div className="flex items-center justify-between bg-background p-2 rounded border">
                <span className="font-mono text-sm break-all">{cobranca.pixCobranca}</span>
                <Button size="sm" variant="outline" onClick={cobrancaData => {
                  navigator.clipboard.writeText(cobranca.pixCobranca);
                  toast({
                    title: "Chave PIX copiada!",
                    description: "Você pode colar onde precisar.",
                  });
                }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Escaneie o QR Code ou copie a chave PIX para fazer o pagamento
            </div>
          </CardContent>
        </Card>

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