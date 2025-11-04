import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface DashboardCardsProps {
  totalReceber: number;
  cobrancasAtivas: number;
  cobrancasVencidas: number;
  cobrancasPagas: number;
  totalRecebido: number;
}

export const DashboardCards = ({
  totalReceber,
  cobrancasAtivas,
  cobrancasVencidas,
  cobrancasPagas,
  totalRecebido,
}: DashboardCardsProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total a Receber */}
        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total a Receber
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <TrendingUp className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground/80 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="text-xs text-muted-foreground bg-background border rounded-md shadow-sm px-3 py-1.5">
                <p>Valor total ainda não recebido das cobranças pendentes.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              R$ {totalReceber.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cobranças Ativas */}
        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cobranças Ativas
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Clock className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground/80 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="text-xs text-muted-foreground bg-background border rounded-md shadow-sm px-3 py-1.5">
                <p>Cobranças dentro do prazo de vencimento.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">
              {cobrancasAtivas}
            </div>
          </CardContent>
        </Card>

        {/* Cobranças Vencidas */}
        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cobranças Vencidas
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground/80 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="text-xs text-muted-foreground bg-background border rounded-md shadow-sm px-3 py-1.5">
                <p>Cobranças que já ultrapassaram a data de vencimento.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">
              {cobrancasVencidas}
            </div>
          </CardContent>
        </Card>

        {/* Cobranças Pagas */}
        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cobranças Pagas
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <CheckCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground/80 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="text-xs text-muted-foreground bg-background border rounded-md shadow-sm px-3 py-1.5">
                <p>Cobranças que já foram quitadas pelos clientes.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {cobrancasPagas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total recebido:{" "}
              <span className="font-medium text-foreground">
                R$ {totalRecebido.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
