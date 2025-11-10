import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Search, ArrowUpDown, Calendar, User, DollarSign, FileText } from "lucide-react";
import { useCobrancas } from "@/hooks/useCobrancas";

interface User {
  id: number;
  name: string;
  email: string;
  pix: string;
  isPremium?: boolean;
}

const CobrancasPagas = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<"data" | "valor" | "nome">("data");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 9;

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const { cobrancas } = useCobrancas(user?.id);
  const cobrancasPagas = cobrancas.filter((c) => c.status === "paga");

  // Filtro por busca
  const cobrancasFiltradas = cobrancasPagas.filter((c) =>
    c.nomeDevedor.toLowerCase().includes(busca.toLowerCase())
  );

  // Ordenação
  const cobrancasOrdenadas = [...cobrancasFiltradas].sort((a, b) => {
    if (ordenacao === "data") {
      return new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime();
    } else if (ordenacao === "valor") {
      return (b.valorAtual ?? b.valor) - (a.valorAtual ?? a.valor);
    } else {
      return a.nomeDevedor.localeCompare(b.nomeDevedor);
    }
  });

  // Paginação
  const totalPaginas = Math.ceil(cobrancasOrdenadas.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const cobrancasPaginadas = cobrancasOrdenadas.slice(inicio, fim);

  const totalRecebido = cobrancasPagas.reduce((sum, c) => sum + (c.valorAtual ?? c.valor), 0);

  if (!user) return null;

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cobranças Pagas</h1>
              <p className="text-muted-foreground">Visualize e gerencie pagamentos recebidos</p>
            </div>
          </div>

          {/* Card de resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Recebido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cobranças Pagas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{cobrancasPagas.length}</div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  R${" "}
                  {cobrancasPagas.length > 0
                    ? (totalRecebido / cobrancasPagas.length).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0,00"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome do devedor..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={ordenacao} onValueChange={(value: any) => setOrdenacao(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="valor">Valor</SelectItem>
                    <SelectItem value="nome">Nome</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Lista de Cobranças */}
        {cobrancasPaginadas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cobrancasPaginadas.map((cobranca) => {
              const dataFormatada = new Date(cobranca.dataVencimento).toLocaleDateString("pt-BR");

              return (
                <Card
                  key={cobranca.id}
                  className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {cobranca.nomeDevedor}
                        </CardTitle>
                      </div>
                      <Badge className="bg-green-600 hover:bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paga
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Valor</span>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        R${" "}
                        {(cobranca.valorAtual ?? cobranca.valor).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Vencimento</span>
                      </div>
                      <span className="font-medium">{dataFormatada}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(cobranca.link, "_blank")}
                      className="w-full mt-2 border font-semibold shadow-sm hover:bg-gradient-to-r hover:from-coepay-primary hover:to-coepay-secondary hover:text-white transition"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Comprovante
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  {busca ? "Nenhuma cobrança encontrada" : "Nenhuma cobrança paga ainda"}
                </h3>
                <p className="text-muted-foreground">
                  {busca
                    ? "Tente ajustar os filtros de busca"
                    : "Quando seus clientes pagarem, as cobranças aparecerão aqui"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paginação */}
        {cobrancasOrdenadas.length > itensPorPagina && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual(paginaAtual - 1)}
            >
              Anterior
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: totalPaginas }).map((_, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={paginaAtual === index + 1 ? "default" : "outline"}
                  onClick={() => setPaginaAtual(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual(paginaAtual + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CobrancasPagas;
