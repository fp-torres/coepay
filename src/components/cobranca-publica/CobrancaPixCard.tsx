import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ComprovanteViewer } from "./ComprovanteViewer";

interface CobrancaPixCardProps {
  pago: boolean;
  pagoEm?: string;
  qrCodeURL: string;
  pixCobranca: string;
  pixCopiaECola: string;
  recebedorNome?: string;
  recebedorEmail?: string;
  comprovanteUrl?: string;
  onConfirmarPagamento: () => void;
  renderValidarDialog: () => React.ReactNode;
}

export const CobrancaPixCard = ({
  pago,
  pagoEm,
  qrCodeURL,
  pixCobranca,
  pixCopiaECola,
  recebedorNome,
  recebedorEmail,
  comprovanteUrl,
  onConfirmarPagamento,
  renderValidarDialog,
}: CobrancaPixCardProps) => {
  return (
    <Card
      className={`mb-6 shadow-lg overflow-hidden relative ${
        pago ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-white'
      }`}
    >
      <div
        className={`absolute top-0 bottom-0 left-0 w-1 ${
          pago
            ? 'bg-gradient-to-b from-green-400 via-green-500 to-green-600'
            : 'bg-gradient-to-b from-orange-400 via-amber-500 to-orange-600'
        }`}
      />

      <CardHeader className="text-center relative z-10">
        <CardTitle className="text-lg">{pago ? 'Pagamento Realizado' : 'Pague com PIX'}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4 relative z-10">
        {pago ? (
          <div className="flex flex-col items-center space-y-4 py-4">
            <CheckCircle className="w-20 h-20 text-green-500" />
            <div>
              <p className="text-lg font-semibold text-green-800">Pagamento confirmado</p>
              <p className="text-sm text-green-700">Esta cobrança já foi marcada como paga.</p>
            </div>
            <div className="w-full max-w-md">
              <ComprovanteViewer comprovanteUrls={comprovanteUrl} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            {qrCodeURL ? (
              <div className="p-4 bg-white rounded-xl border border-orange-200 shadow-xl">
                <img
                  src={qrCodeURL}
                  alt="QR Code PIX"
                  className="w-56 h-56 rounded-lg"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
            )}
          </div>
        )}

        {!pago && (
          <div className="text-center space-y-3">
            {(recebedorNome || recebedorEmail) && (
              <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-left">
                <p className="text-xs uppercase tracking-wide text-orange-700 font-semibold">Recebedor</p>
                {recebedorNome && <p className="text-sm font-medium text-gray-900">{recebedorNome}</p>}
                {recebedorEmail && <p className="text-xs text-gray-600 break-all">{recebedorEmail}</p>}
              </div>
            )}

            <p className="text-xs text-gray-500 mb-2">Chave PIX</p>

            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
              <span className="font-mono text-sm text-gray-800 break-all select-all">
                {pixCobranca}
              </span>

              <Button
                size="icon"
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
                onClick={() => {
                  navigator.clipboard.writeText(pixCobranca);
                  toast({
                    title: "Chave PIX copiada ✅",
                    className: "bg-green-50 text-green-700 border-green-200",
                  });
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {pixCopiaECola && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-left">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Código copia e cola
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(pixCopiaECola);
                      toast({
                        title: "Código PIX copiado ✅",
                        className: "bg-green-50 text-green-700 border-green-200",
                      });
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <p className="font-mono text-xs text-gray-700 break-all select-all max-h-24 overflow-y-auto">
                  {pixCopiaECola}
                </p>
              </div>
            )}
          </div>
        )}

        {!pago && renderValidarDialog()}

        <div className="flex justify-center">
          {pago ? (
            <Badge variant="outline">
              ✅ Pago em {new Date(pagoEm!).toLocaleString()}
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

        {!pago && (
          <p className="text-xs text-gray-400 mt-1">
            Escaneie o QR Code ou copie a chave PIX para realizar o pagamento
          </p>
        )}
      </CardContent>
    </Card>
  );
};
