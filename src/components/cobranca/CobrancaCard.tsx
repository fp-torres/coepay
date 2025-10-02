import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";

interface CobrancaCardProps {
  valorAtual: number;
  valorOriginal: number;
  descricao?: string;
  status: 'ativa' | 'vencida';
  dataVencimento: string;
  diasVencido: number;
  taxaJuros?: number;
  tipoJuros?: string;
}

export const CobrancaCard = ({
  valorAtual,
  valorOriginal,
  descricao,
  status,
  dataVencimento,
  diasVencido,
  taxaJuros,
  tipoJuros
}: CobrancaCardProps) => {
  return (
    <Card className="mb-6 border-l-4 border-l-orange-500">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {status === 'vencida' ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : (
            <Clock className="w-5 h-5 text-orange-500" />
          )}
          Valor da Dívida
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-4xl font-bold text-red-600">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorAtual)}
        </div>

        {descricao && (
          <p className="text-sm text-muted-foreground italic">
            {descricao}
          </p>
        )}

        {valorAtual !== valorOriginal && (
          <div className="text-sm text-muted-foreground">
            Valor original: <span className="line-through">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorOriginal)}</span>
          </div>
        )}

        {status === 'vencida' && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            {taxaJuros
              ? `Juros aplicados: ${taxaJuros}% ${tipoJuros === 'diario' ? 'ao dia' : 'ao mês'}`
              : "Sem juros"}
          </div>
        )}

        {status === 'vencida' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <Badge variant="destructive" className="mb-2">
              Cobrança Vencida
            </Badge>
            <p className="text-sm text-red-700">
              Data de vencimento: {new Date(dataVencimento).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm font-semibold text-red-700">
              {diasVencido} dia(s) vencido(s)
            </p>
          </div>
        )}

        {status === 'ativa' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Badge variant="default" className="mb-2">
              No Prazo
            </Badge>
            <p className="text-sm text-blue-700">
              Data de vencimento: {new Date(dataVencimento).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
