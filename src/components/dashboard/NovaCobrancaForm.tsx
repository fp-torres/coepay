import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Novo import
import { Plus } from "lucide-react";
import { useRef } from "react";
import { toast } from "@/components/ui/use-toast";


interface User {
  id: number;
  name: string;
  email: string;
  pix: string;
  isPremium?: boolean;
}

interface NovaCobrancaData {
  nomeDevedor: string;
  valor: string;
  dataVencimento: string;
  taxaJuros: string;
  tipoJuros: "mensal" | "diario";
  whatsappDevedor?: string; // Novo campo
  descricao?: string;        // Novo campo
}

interface NovaCobrancaFormProps {
  user: User;
  novaCobranca: NovaCobrancaData;
  setNovaCobranca: React.Dispatch<React.SetStateAction<NovaCobrancaData>>;
  setUser: (user: User) => void;
  onSubmit: (e: React.FormEvent) => void;
}

// Componente PremiumBadge atualizado
const PremiumBadge = () => (
  <span className="text-xs text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 rounded-md font-semibold shadow-sm">
    💎 Premium
  </span>
);


export const NovaCobrancaForm = ({ user, novaCobranca, setNovaCobranca, setUser, onSubmit }: NovaCobrancaFormProps) => {
  // Formatar input como moeda (R$)
  const formatarMoeda = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = parseFloat(apenasNumeros) / 100;
    if (isNaN(numero)) return '';
    return numero.toLocaleString('pt-BR', {
       style: 'currency',
       currency: 'BRL'
    });
  };
const descricaoRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Nova Cobrança
        </CardTitle>
        <CardDescription>Preencha os dados do devedor</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nome do Devedor */}
          <div className="space-y-2">
            <Label htmlFor="nome-devedor">Nome do Devedor</Label>
            <Input
              id="nome-devedor"
              value={novaCobranca.nomeDevedor}
              onChange={(e) => {
                const apenasLetras = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                setNovaCobranca({ ...novaCobranca, nomeDevedor: apenasLetras });
              }}
              required
            />
          </div>

          {/* Valor da Dívida */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor da Dívida (R$)</Label>
            <Input
              id="valor"
              type="text"
              inputMode="numeric"
              value={novaCobranca.valor}
              onChange={(e) => {
                const valorFormatado = formatarMoeda(e.target.value);
                setNovaCobranca({ ...novaCobranca, valor: valorFormatado });
              }}
              onBlur={() => {
                // Remove tudo que não seja dígito ou vírgula/ponto
                const apenasNumeros = novaCobranca.valor.replace(/[^\d]/g, "");
                const valorNumerico = apenasNumeros ? parseInt(apenasNumeros, 10) / 100 : 0;

                if (valorNumerico <= 0) {
                  toast({
                    title: "Valor inválido",
                    description: "O valor da dívida deve ser maior que R$ 0,00",
                    variant: "destructive",
                  });
                  setNovaCobranca({ ...novaCobranca, valor: "" });
                }
              }}
              required
            />
          </div>

          {/* Data de Vencimento */}
          <div className="space-y-2">
            <Label htmlFor="data-vencimento">Data de Vencimento</Label>
            <Input
              id="data-vencimento"
              type="date"
              value={novaCobranca.dataVencimento}
              onChange={(e) => setNovaCobranca({ ...novaCobranca, dataVencimento: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              A partir desta data os juros começam a contar
            </p>
          </div>

          {/* PIX */}
          <div className="space-y-2">
            <Label>Sua Chave PIX</Label>
            <Input 
              value={user.pix} 
              onChange={(e) => {
                const updatedUser = { ...user, pix: e.target.value };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
              }}
            />
          </div>

          {/* Juros Compostos - Premium */}
          <div className="space-y-2">
            <Label htmlFor="taxa-juros" className="flex items-center gap-2">
              Taxa de Juros
              {!user?.isPremium && <PremiumBadge />}
            </Label>
            <div className="relative">
              <Input
                id="taxa-juros"
                type="text"
                value={novaCobranca.taxaJuros}
                onChange={(e) => {
                  const somenteNumeros = e.target.value.replace(/\D/g, '');
                  const formatado = somenteNumeros ? (parseInt(somenteNumeros) / 10).toFixed(1) : '';
                  setNovaCobranca({ ...novaCobranca, taxaJuros: formatado });
                }}
                placeholder="Ex: 2.5"
                className="pr-8" // espaço para o %
                disabled={false}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                %
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo-juros" className="flex items-center gap-2">
              Período dos Juros
              {!user?.isPremium && <PremiumBadge />}
            </Label>
            <select 
              id="tipo-juros"
              value={novaCobranca.tipoJuros}
              onChange={(e) => setNovaCobranca({ ...novaCobranca, tipoJuros: e.target.value as 'mensal' | 'diario' })}
              disabled={false}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="mensal">Ao mês</option>
              <option value="diario">Ao dia</option>
            </select>
          </div>

        {/* Novo: WhatsApp do Devedor - Premium */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp-devedor" className="flex items-center gap-2">
              WhatsApp do Devedor
              {!user?.isPremium && <PremiumBadge />}
            </Label>
            <Input
              id="whatsapp-devedor"
              type="text"
              value={novaCobranca.whatsappDevedor || ''}
              onChange={(e) => {
                // Remove tudo que não é número
                let numeros = e.target.value.replace(/\D/g, '');
                // Limita a 11 dígitos (DD + 9 + 8 números)
                if (numeros.length > 11) numeros = numeros.slice(0, 11);
                // Formata como (99) 99999-9999
                let formatado = numeros;
                if (numeros.length > 2) formatado = `(${numeros.slice(0,2)}) ${numeros.slice(2)}`;
                if (numeros.length > 7) formatado = `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
                setNovaCobranca({ ...novaCobranca, whatsappDevedor: formatado });
              }}
              placeholder="Ex: (99) 99999-9999"
              //disabled={!user?.isPremium}
            />
            <p className="text-xs text-muted-foreground">
              WhatsApp para envio automático do link da cobrança
            </p>
          </div>


         {/* Novo: Descrição da Cobrança - Premium */}
          <div className="space-y-2">
            <Label htmlFor="descricao-cobranca" className="flex items-center gap-2">
              Descrição da Cobrança
              {!user?.isPremium && <PremiumBadge />}  
            </Label>
            <Textarea
              id="descricao-cobranca"
              ref={descricaoRef}
              value={novaCobranca.descricao || ''}
              onChange={(e) => {
                // Limita a 50 caracteres
                const textoLimitado = e.target.value.slice(0, 80);
                setNovaCobranca({ ...novaCobranca, descricao: textoLimitado });

                // Ajusta a altura do textarea dinamicamente
                const textarea = descricaoRef.current;
                if (textarea) {
                  textarea.style.height = "auto"; // Reseta altura
                  textarea.style.height = `${textarea.scrollHeight}px`;
                }
              }}
              placeholder="Pagamento referente à..."
              rows={3} // altura inicial
              className="resize-none overflow-hidden"
              //disabled={!user?.isPremium}
            />
            <p className="text-xs text-muted-foreground">Máximo de 80 caracteres</p>
          </div>


          {!user?.isPremium && (
            <div className="text-sm text-gray-800 bg-gray-100 p-3 rounded-md shadow-sm">
              💎 <strong>Premium:</strong> Upgrade para adicionar juros compostos, mensagem automática no WhatsApp, descrição e cobranças ilimitadas!
            </div>
          )}


          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-coepay-primary to-coepay-secondary text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:opacity-90 transition"
          >
            Criar Cobrança
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
