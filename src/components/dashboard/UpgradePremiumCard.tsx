import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface UpgradePremiumCardProps {
  subscription: {
    createCheckout: () => void;
    loading: boolean;
  };
}

export const UpgradePremiumCard = ({ subscription }: UpgradePremiumCardProps) => {
  return (
    <Card className="border-2 border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-800">
          <Crown className="w-5 h-5 mr-2" />
          Upgrade para Premium
        </CardTitle>
        <CardDescription>
          Desbloqueie recursos avançados e cobranças ilimitadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">🚀 Recursos Premium:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Cobranças ilimitadas</li>
              <li>• Juros compostos automáticos</li>
              <li>• Cálculo por dia ou mês</li>
              <li>• Relatórios avançados</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">💰 Preço:</h4>
            <p className="text-2xl font-bold text-green-600">R$ 29,90/mês</p>
            <Button 
              onClick={subscription.createCheckout}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              disabled={subscription.loading}
            >
              <Crown className="w-4 h-4 mr-2" />
              {subscription.loading ? "Carregando..." : "Assinar Premium"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};