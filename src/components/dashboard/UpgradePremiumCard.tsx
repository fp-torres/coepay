import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePremiumCardProps {
  plan: "free" | "basic" | "premium";
}

export const UpgradePremiumCard = ({ plan }: UpgradePremiumCardProps) => {
  const navigate = useNavigate();

  if (plan === "free") {
    return (
      <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-800">
            <Sparkles className="w-5 h-5 mr-2" />
            Desbloqueie Todo o Potencial
          </CardTitle>
          <CardDescription>
            Escolha o plano ideal para suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* Basic agora em roxo */}
              <div className="border-l-4 border-purple-500 pl-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Basic - R$ 29,90/mês
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>• Até 50 cobranças/mês</li>
                  <li>• Juros compostos</li>
                  <li>• Relatórios básicos</li>
                </ul>
              </div>

              {/* Premium agora em dourado */}
              <div className="border-l-4 border-amber-500 pl-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Premium - R$ 49,90/mês
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>• Cobranças ilimitadas</li>
                  <li>• Todos os recursos</li>
                  <li>• Acesso antecipado</li>
                </ul>
              </div>
            </div>
            <div className="space-y-2 flex flex-col justify-center">
<Button 
  onClick={() => navigate("/planos")}
  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
>
  <Sparkles className="w-4 h-4 mr-2" />
  Ver Todos os Planos
</Button>

<Button
  onClick={() => navigate("/futuras-implementacoes")}
  variant="outline"
  className="w-full px-4 py-2 border text-coepay-primary bg-white font-semibold shadow-sm rounded-xl
             hover:bg-gradient-to-r hover:from-coepay-primary hover:to-coepay-secondary hover:text-white transition"
>
  Ver Futuras Implementações
</Button>

            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (plan === "basic") {
    return (
      <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-800">
            <Sparkles className="w-5 h-5 mr-2" />
            Upgrade para Premium
          </CardTitle>
          <CardDescription>
            Desbloqueie cobranças ilimitadas e recursos exclusivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">✨ Recursos Adicionais:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cobranças ilimitadas</li>
                <li>• Acesso antecipado a novos recursos</li>
                <li>• Suporte prioritário</li>
                <li>• Relatórios ainda mais avançados</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">💰 Upgrade:</h4>
              <p className="text-2xl font-bold text-purple-600">+ R$ 20,00/mês</p>
              <p className="text-xs text-muted-foreground">Total: R$ 49,90/mês</p>
              <Button 
                onClick={() => navigate("/planos")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Premium users see future features
  return (
    <Card className="border-2 border-dashed border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center text-green-800">
          <Sparkles className="w-5 h-5 mr-2" />
          Você é Premium!
        </CardTitle>
        <CardDescription>
          Tenha acesso antecipado aos novos recursos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Como usuário Premium, você tem acesso a todos os recursos disponíveis e será o primeiro a
            testar as novidades assim que forem lançadas.
          </p>
          <Button 
            onClick={() => navigate("/futuras-implementacoes")}
            variant="outline"
            className="w-full"
          >
            Ver Futuras Implementações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};