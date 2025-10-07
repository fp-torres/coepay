import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CobrancaPixCardProps {
  pago: boolean;
  pagoEm?: string;
  qrCodeURL: string;
  pixCobranca: string;
  comprovanteUrl?: string;
  onConfirmarPagamento: () => void;
  renderValidarDialog: () => React.ReactNode;
}

export const CobrancaPixCard = ({
  pago,
  pagoEm,
  qrCodeURL,
  pixCobranca,
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
            
            {comprovanteUrl && (
              <div className="w-full max-w-md p-4 border rounded-lg bg-white shadow-sm space-y-3">
                <p className="text-sm font-semibold text-left">Comprovante(s) de Pagamento:</p>
                {comprovanteUrl.split(',').map((url, index) => (
                  <div key={index}>
                    {url.trim().endsWith('.pdf') ? (
                      <a 
                        href={`http://localhost:5000${url.trim()}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <FileText className="h-8 w-8 text-blue-600" />
                        <span className="text-blue-600 font-medium">Abrir Comprovante PDF {comprovanteUrl.split(',').length > 1 ? `#${index + 1}` : ''}</span>
                      </a>
                    ) : (
                      <img 
                        src={`http://localhost:5000${url.trim()}`} 
                        alt={`Comprovante de Pagamento ${comprovanteUrl.split(',').length > 1 ? `#${index + 1}` : ''}`}
                        className="w-full h-auto rounded-lg border shadow-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
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

        {!pago && (
          <div className="text-center">
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
