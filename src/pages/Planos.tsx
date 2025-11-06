import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

const PLANS = {
  basic: {
    priceId: "price_1SPkWYLPcRqPYGNw1iTH0I02",
    name: "Basic",
    price: "R$ 29,90",
    description: "Recursos essenciais para começar",
    features: [
      "Até 25 cobranças por mês",
      "Juros compostos automáticos",
      "Período de juros configurável (dia/mês)",
      "Relatórios básicos",
      "Notificações de vencimento",
    ],
  },
  premium: {
    priceId: "price_1SPkX1LPcRqPYGNwGjgjGILu",
    name: "Premium",
    price: "R$ 49,90",
    description: "Todos os recursos para crescimento",
    features: [
      "Cobranças ilimitadas",
      "Juros compostos automáticos",
      "Período de juros configurável (dia/mês)",
      "Relatórios avançados e métricas",
      "Notificações personalizadas",
      "Acesso antecipado a novos recursos",
      "Suporte prioritário",
    ],
  },
};

const Planos = () => {
  const navigate = useNavigate();
  const subscription = useSubscription();

  const handleSelectPlan = (priceId: string) => {
    subscription.createCheckout(priceId);
  };

  return (
    <div className="bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent">
            Escolha o Plano Ideal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece grátis e faça upgrade quando precisar de mais recursos
          </p>
        </div>

        {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-12 items-stretch">
        
        {/* Free Plan */}
      <Card
        className={`relative flex flex-col h-full transition-all duration-300 ${
          subscription.plan === "free"
            ? "border-2 border-coepay-primary bg-gradient-to-br from-coepay-primary/15 via-purple-500/10 to-transparent shadow-lg"
            : "hover:border-coepay-primary/50 hover:bg-gradient-to-br hover:from-coepay-primary/5 hover:to-purple-500/5"
        }`}
      >
          {subscription.plan === "free" && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coepay-primary">
              Plano Atual
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Para testar a plataforma</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">R$ 0</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow space-y-4">
            <ul className="space-y-3 flex-grow">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>Até 5 cobranças por mês</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>Recursos básicos</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>Suporte por e-mail</span>
              </li>
            </ul>

            <div className="mt-auto">
              {subscription.plan !== "free" ? (
                <Button variant="outline" className="w-full" disabled>
                  Downgrade disponível em breve
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Plano Atual
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

       {/* Basic Plan */}
        <Card
          className={`relative flex flex-col h-full transition-all duration-300 ${
            subscription.plan === "basic"
              ? "border-2 border-purple-500 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-transparent shadow-lg"
              : "hover:border-purple-500/60 hover:bg-gradient-to-br hover:from-purple-500/10 hover:via-pink-500/10 hover:to-transparent"
          }`}
        >
          {subscription.plan === "basic" && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">
              <Sparkles className="w-3 h-3 mr-1" />
              Plano Atual
            </Badge>
          )}
<CardHeader>
  <CardTitle className="text-2xl flex items-center gap-2">
    Basic
    <span className="text-xs bg-purple-100 text-purple-600 font-semibold px-2 py-0.5 rounded-full">
      Em breve
    </span>
    <Sparkles className="w-5 h-5 text-purple-500" />
  </CardTitle>
  <CardDescription>{PLANS.basic.description}</CardDescription>
  <div className="mt-4">
    <span className="text-4xl font-bold text-muted-foreground">—</span>
    <span className="text-muted-foreground">/mês</span>
  </div>
</CardHeader>
          <CardContent className="flex flex-col flex-grow space-y-4">
            <ul className="space-y-3 flex-grow">
              {PLANS.basic.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {subscription.plan === "free" ? (
<Button
  onClick={() => handleSelectPlan(PLANS.basic.priceId)}
  disabled // 🔒 sempre desabilitado
  className="w-full bg-gradient-to-r from-purple-300 to-pink-300 text-white font-semibold cursor-not-allowed opacity-70 border border-gray-300"
>
  <Sparkles className="w-4 h-4 mr-2" />
  Disponível em breve
</Button>

              ) : subscription.plan === "basic" ? (
                <Button variant="outline" onClick={subscription.openCustomerPortal} className="w-full">
                  Gerenciar Assinatura
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Downgrade disponível em breve
                </Button>
              )}
            </div>
          </CardContent>
        </Card>


     {/* Premium Plan */}
      <Card
        className={`relative flex flex-col h-full transition-all duration-300 ${
          subscription.plan === "premium"
            ? "border-2 border-amber-500 bg-gradient-to-br from-amber-400/20 via-orange-400/10 to-transparent shadow-lg"
            : "hover:border-amber-500/60 hover:bg-gradient-to-br hover:from-amber-400/10 hover:via-orange-400/5 hover:to-transparent"
        }`}
      >
        {subscription.plan === "premium" ? (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500">
            <Crown className="w-3 h-3 mr-1" />
            Plano Atual
          </Badge>
        ) : (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500">
            Recomendado
          </Badge>
        )}

        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            Premium    <span className="text-xs bg-amber-100 text-amber-600 font-semibold px-2 py-0.5 rounded-full">
      Em breve
    </span>
            <Crown className="w-5 h-5 text-amber-500" />
          </CardTitle>
          <CardDescription>{PLANS.premium.description}</CardDescription>
          <div className="mt-4">
    <span className="text-4xl font-bold text-muted-foreground">—</span>
            <span className="text-muted-foreground">/mês</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow space-y-4">
          <ul className="space-y-3 flex-grow">
            {PLANS.premium.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            {subscription.plan === "premium" ? (
              <Button variant="outline" onClick={subscription.openCustomerPortal} className="w-full">
                Gerenciar Assinatura
              </Button>
            ) : (
<Button
  onClick={() => handleSelectPlan(PLANS.premium.priceId)}
  disabled // 🔒 sempre desabilitado
  className="w-full bg-gradient-to-r from-amber-300 to-orange-300 text-white font-semibold cursor-not-allowed opacity-70 border border-gray-300"
>
  <Crown className="w-4 h-4 mr-2" />
  Disponível em breve
</Button>

            )}
          </div>
        </CardContent>
      </Card>
            </div>


        {/* FAQ ou informações adicionais */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Dúvidas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento através do portal de
                gerenciamento. Não há taxas de cancelamento.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">O que acontece quando eu faço upgrade?</h3>
              <p className="text-muted-foreground">
                Ao fazer upgrade, você tem acesso imediato a todos os recursos do novo plano. O valor
                será proporcional ao período restante.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Formas de pagamento aceitas?</h3>
              <p className="text-muted-foreground">
                Aceitamos cartões de crédito e débito através do Stripe, uma plataforma segura de
                pagamentos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Planos;
