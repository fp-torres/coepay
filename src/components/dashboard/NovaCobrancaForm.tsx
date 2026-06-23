import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Novo import
import { Plus } from "lucide-react";
import { useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { Crown } from "lucide-react";


interface User {
  id: number;
  name: string;
  email: string;
  pix: string;
  isPremium?: boolean;
}

interface NovaCobrancaData {
  nomeDevedor: string;
  debtorEmail: string;
  valor: string;
  dataVencimento: string;
  taxaJuros: string;
  tipoJuros: "mensal" | "diario" | "anual";
  metodoCalculo: "simples" | "composto";
  contactPhone?: string;
  descricao?: string;
  pixCobranca?: string;
  recorrenciaTipo?: "unica" | "semanal" | "mensal" | "anual" | "data_personalizada" | "intervalo_personalizado";
  recorrenciaIntervalo?: string;
  recorrenciaUnidade?: "dias" | "semanas" | "meses";
  recorrenciaDataPersonalizada?: string;
  recorrenciaAte?: string;
  recorrenciaQuantidade?: string;
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
  <span className="text-xs text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 rounded-md font-semibold shadow-sm flex items-center gap-1">
    <Crown className="w-3 h-3 text-white" />
    Premium
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
                const apenasLetras = e.target.value.replace(/[^\p{L}\s'-]/gu, '');
                setNovaCobranca({ ...novaCobranca, nomeDevedor: apenasLetras });
              }}
              required
            />
          </div>

          {/* E-mail do Devedor */}
          <div className="space-y-2">
            <Label htmlFor="email-devedor">E-mail do Devedor</Label>
            <Input
              id="email-devedor"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={novaCobranca.debtorEmail}
              onChange={(e) => setNovaCobranca({ ...novaCobranca, debtorEmail: e.target.value })}
              placeholder="nome@email.com"
            />
            <p className="text-xs text-muted-foreground">
              Necessário para lembretes automáticos e envio manual da cobrança.
            </p>
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

          <div className="space-y-2">
            <Label htmlFor="recorrencia-tipo">Repetição da cobrança</Label>
            <select
              id="recorrencia-tipo"
              value={novaCobranca.recorrenciaTipo || "unica"}
              onChange={(e) =>
                setNovaCobranca({
                  ...novaCobranca,
                  recorrenciaTipo: e.target.value as NovaCobrancaData["recorrenciaTipo"],
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="unica">Única</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
              <option value="data_personalizada">Em uma data personalizada</option>
              <option value="intervalo_personalizado">Intervalo personalizado</option>
            </select>
          </div>

          {novaCobranca.recorrenciaTipo && novaCobranca.recorrenciaTipo !== "unica" && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              {novaCobranca.recorrenciaTipo === "intervalo_personalizado" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="recorrencia-intervalo">A cada</Label>
                    <Input
                      id="recorrencia-intervalo"
                      type="number"
                      min="1"
                      value={novaCobranca.recorrenciaIntervalo || "1"}
                      onChange={(e) =>
                        setNovaCobranca({ ...novaCobranca, recorrenciaIntervalo: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recorrencia-unidade">Unidade</Label>
                    <select
                      id="recorrencia-unidade"
                      value={novaCobranca.recorrenciaUnidade || "dias"}
                      onChange={(e) =>
                        setNovaCobranca({
                          ...novaCobranca,
                          recorrenciaUnidade: e.target.value as NovaCobrancaData["recorrenciaUnidade"],
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="dias">Dias</option>
                      <option value="semanas">Semanas</option>
                      <option value="meses">Meses</option>
                    </select>
                  </div>
                </div>
              )}

              {novaCobranca.recorrenciaTipo === "data_personalizada" ? (
                <div className="space-y-2">
                  <Label htmlFor="recorrencia-data">Próxima data</Label>
                  <Input
                    id="recorrencia-data"
                    type="date"
                    value={novaCobranca.recorrenciaDataPersonalizada || ""}
                    onChange={(e) =>
                      setNovaCobranca({ ...novaCobranca, recorrenciaDataPersonalizada: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="recorrencia-quantidade">Próximas cobranças</Label>
                    <Input
                      id="recorrencia-quantidade"
                      type="number"
                      min="1"
                      max="24"
                      value={novaCobranca.recorrenciaQuantidade || "6"}
                      onChange={(e) =>
                        setNovaCobranca({ ...novaCobranca, recorrenciaQuantidade: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recorrencia-ate">Gerar até</Label>
                    <Input
                      id="recorrencia-ate"
                      type="date"
                      value={novaCobranca.recorrenciaAte || ""}
                      onChange={(e) =>
                        setNovaCobranca({ ...novaCobranca, recorrenciaAte: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                As próximas cobranças são geradas automaticamente com os mesmos dados e podem ser pausadas ou canceladas pelo grupo de recorrência.
              </p>
            </div>
          )}

          {/* PIX para esta cobrança específica */}
          <div className="space-y-2">
            <Label htmlFor="pixCobranca">Chave PIX para esta cobrança (opcional)</Label>
            <Input
              id="pixCobranca"
              value={novaCobranca.pixCobranca || ""}
              onChange={(e) => setNovaCobranca({ ...novaCobranca, pixCobranca: e.target.value })}
              placeholder={`PIX padrão: ${user.pix}`}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar seu PIX padrão. Para alterar o PIX padrão permanentemente, acesse Configurações.
            </p>
          </div>

          {/* Juros - Premium */}
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
            <Label htmlFor="metodo-calculo" className="flex items-center gap-2">
              Método de Cálculo
              {!user?.isPremium && <PremiumBadge />}
            </Label>
            <select 
              id="metodo-calculo"
              value={novaCobranca.metodoCalculo}
              onChange={(e) => setNovaCobranca({ ...novaCobranca, metodoCalculo: e.target.value as 'simples' | 'composto' })}
              disabled={false}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="composto">Juros Compostos</option>
              <option value="simples">Juros Simples</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo-juros" className="flex items-center gap-2">
              Período dos Juros
              {!user?.isPremium && <PremiumBadge />}
            </Label>
            <select 
              id="tipo-juros"
              value={novaCobranca.tipoJuros}
              onChange={(e) => setNovaCobranca({ ...novaCobranca, tipoJuros: e.target.value as 'mensal' | 'diario' | 'anual' })}
              disabled={false}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="diario">Ao dia</option>
              <option value="mensal">Ao mês</option>
              <option value="anual">Ao ano</option>
            </select>
          </div>

        {/* Telefone de contato */}
          <div className="space-y-2">
            <Label htmlFor="telefone-contato" className="flex items-center gap-2">
              Telefone de Contato
            </Label>
            <Input
              id="telefone-contato"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={novaCobranca.contactPhone || ''}
              onChange={(e) => {
                // Remove tudo que não é número
                let numeros = e.target.value.replace(/\D/g, '');
                // Limita a 11 dígitos (DD + 9 + 8 números)
                if (numeros.length > 11) numeros = numeros.slice(0, 11);
                // Formata como (99) 99999-9999
                let formatado = numeros;
                if (numeros.length > 2) formatado = `(${numeros.slice(0,2)}) ${numeros.slice(2)}`;
                if (numeros.length > 7) formatado = `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
                setNovaCobranca({ ...novaCobranca, contactPhone: formatado });
              }}
              placeholder="Ex: (99) 99999-9999"
            />
            <p className="text-xs text-muted-foreground">
              Número salvo como contato de apoio, sem integração automática com WhatsApp/Meta.
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
            <Card className="border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm mt-4">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md">
                    <Crown className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-800 leading-snug">
                    <strong className="text-amber-600 font-semibold">Seja Premium:</strong>{" "}
                    desbloqueie <span className="font-medium">juros compostos</span>,{" "}
                    <span className="font-medium">futuras implementações na plataforma</span>,{" "}
                    <span className="font-medium">descrição personalizada</span> e{" "}
                    <span className="font-medium">cobranças ilimitadas</span>!
                  </p>
                </div>
              </CardContent>
            </Card>
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
