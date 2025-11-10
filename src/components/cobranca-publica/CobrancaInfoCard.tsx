import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface CobrancaInfoCardProps {
  pago: boolean;
  status: 'no prazo' | 'vencida' | 'paga';
  valorAtual: number;
  valor: number;
  descricao?: string;
  dataVencimento: string;
  diasVencido: number;
  taxaJuros?: number;
  tipoJuros?: string;
}

export const CobrancaInfoCard = ({
  pago,
  status,
  valorAtual,
  valor,
  descricao,
  dataVencimento,
  diasVencido,
  taxaJuros,
  tipoJuros,
}: CobrancaInfoCardProps) => {
  return (
    <Card className={`mb-6 shadow-lg overflow-hidden ${
      pago 
        ? 'bg-gradient-to-br from-green-50 to-green-100' 
        : 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent'
    }`}>
      {!pago && (
        <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l"></div>
      )}

      <CardContent className={`p-6 text-center space-y-4 ${pago ? '' : 'relative'}`}>
        {!pago ? (
          <>
            <div className="flex justify-end mb-4">
              <Badge variant={status === 'vencida' ? 'destructive' : 'default'}>
                {status === 'vencida' ? 'Vencida' : 'No Prazo'}
              </Badge>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Valor Atual</p>
              <p className="text-5xl font-bold text-orange-600 mb-2">
                {valorAtual.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
              {valorAtual !== valor && (
                <p className="text-sm text-muted-foreground">
                  Valor original:{' '}
                  {valor.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              )}
            </div>

            {descricao && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Descrição:</p>
                <p className="text-sm text-muted-foreground">{descricao}</p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vencimento:</span>
                <span className="font-medium">
                  {new Date(dataVencimento).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {status === 'vencida' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dias vencidos:</span>
                  <span className="font-medium text-red-600">{diasVencido} dias</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de juros:</span>
                <span className="font-medium">
                  {taxaJuros
                    ? `${taxaJuros}% ${
                        tipoJuros === 'diario' 
                          ? 'ao dia' 
                          : tipoJuros === 'anual' 
                          ? 'ao ano' 
                          : 'ao mês'
                      }`
                    : 'Sem juros'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl font-bold tracking-tight text-green-700">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorAtual)}
            </div>

            <div className="flex flex-col items-center space-y-2 py-4">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>

            <p className="text-sm mt-1 text-green-700 max-w-prose mx-auto">
              👋 Coé, conheça o <a href="https://coepay.com.br" target="_blank" rel="noreferrer" className="underline font-semibold">CoéPay</a> – 
              um sistema de cobrança rápido, fácil e seguro. Controle juros, veja relatórios diários e mensais, acompanhe histórico de pagamentos e receba notificações automáticas.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
