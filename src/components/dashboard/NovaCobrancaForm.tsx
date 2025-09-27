import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

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
}

interface NovaCobrancaFormProps {
  user: User;
  novaCobranca: NovaCobrancaData;
  setNovaCobranca: (data: NovaCobrancaData) => void;
  setUser: (user: User) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const NovaCobrancaForm = ({ user, novaCobranca, setNovaCobranca, setUser, onSubmit }: NovaCobrancaFormProps) => {
  // Formatar input como moeda (R$)
  const formatarMoeda = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = parseFloat(apenasNumeros) / 100;

    if (isNaN(numero)) return '';
    
    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

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
              required
            />

          </div>
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
          
          {/* Campos de Juros Compostos - Premium */}
          <div className="space-y-2">
            <Label htmlFor="taxa-juros" className="flex items-center gap-2">
              Taxa de Juros
              {!user?.isPremium && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">💎 Premium</span>
              )}
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
              {!user?.isPremium && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">💎 Premium</span>}
            </Label>
            <select 
              id="tipo-juros"
              value={novaCobranca.tipoJuros}
              onChange={(e) => setNovaCobranca({ ...novaCobranca, tipoJuros: e.target.value as 'mensal' | 'diario' })}
              // disabled={!user?.isPremium}
              disabled={false}

              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="mensal">Ao mês</option>
              <option value="diario">Ao dia</option>
            </select>
          </div>
          
          {!user?.isPremium && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              💎 <strong>Premium:</strong> Upgrade para adicionar juros compostos às suas cobranças e criar cobranças ilimitadas!
              <br />
              <span className="text-xs">Exemplo: R$ 100,00 em 01/01/2025 com 2% ao mês = R$ 102,00 após 1 mês</span>
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