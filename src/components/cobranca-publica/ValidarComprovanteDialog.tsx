import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ValidarComprovanteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comprovanteFiles: File[];
  onComprovanteChange: (files: File[]) => void;
  validandoComprovante: boolean;
  onValidar: () => void;
}

export const ValidarComprovanteDialog = ({
  open,
  onOpenChange,
  comprovanteFiles,
  onComprovanteChange,
  validandoComprovante,
  onValidar,
}: ValidarComprovanteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            Faça upload de até 2 comprovantes de pagamento para validação automática.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comprovante">Comprovantes (imagem ou PDF - máximo 2)</Label>
            <Input
              id="comprovante"
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 2);
                onComprovanteChange(files);
              }}
              disabled={validandoComprovante}
            />
            {comprovanteFiles.length > 0 && (
              <div className="text-sm text-muted-foreground space-y-1">
                {comprovanteFiles.map((file, index) => (
                  <p key={index}>✓ {file.name}</p>
                ))}
              </div>
            )}
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">O sistema validará automaticamente:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Valor do pagamento (tolerância de R$ 0,50)</li>
              <li>Chave PIX do destinatário</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={validandoComprovante}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
            onClick={onValidar}
            disabled={validandoComprovante || comprovanteFiles.length === 0}
          >
            {validandoComprovante ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Validar e Confirmar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
