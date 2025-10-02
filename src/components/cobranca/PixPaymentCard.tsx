import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PixPaymentCardProps {
  qrCodeURL: string;
  pixKey: string;
}

export const PixPaymentCard = ({ qrCodeURL, pixKey }: PixPaymentCardProps) => {
  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    toast({
      title: "Chave PIX copiada!",
      description: "Você pode colar onde precisar.",
    });
  };

  return (
    <Card className="mb-6 border-l-4 border-l-green-500">
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
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Chave PIX:</p>
          <div className="flex items-center justify-between bg-background p-2 rounded border">
            <span className="font-mono text-sm break-all">{pixKey}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyPix}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Escaneie o QR Code ou copie a chave PIX para realizar o pagamento
        </p>
      </CardContent>
    </Card>
  );
};
