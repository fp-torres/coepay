import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Crown, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

const PLANS = {
  basic: {
    priceId: "price_1SPkWYLPcRqPYGNw1iTH0I02",
    name: "Basic",
    price: "R$ 29,90",
    description: "Recursos essenciais para começar",
    features: [
      "Até 50 cobranças por mês",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/painel-de-controle")}
            className="bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

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
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {/* Free Plan */}
          <Card className={`relative ${subscription.plan === "free" ? "border-2 border-coepay-primary" : ""}`}>
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
            <CardContent className="space-y-4">
              <ul className="space-y-3">
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
              {subscription.plan !== "free" && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  Downgrade disponível em breve
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Basic Plan */}
          <Card className={`relative ${subscription.plan === "basic" ? "border-2 border-amber-500" : ""}`}>
            {subscription.plan === "basic" && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500">
                <Crown className="w-3 h-3 mr-1" />
                Plano Atual
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                Basic
                <Crown className="w-5 h-5 text-amber-500" />
              </CardTitle>
              <CardDescription>{PLANS.basic.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{PLANS.basic.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {PLANS.basic.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {subscription.plan === "free" ? (
                <Button
                  onClick={() => handleSelectPlan(PLANS.basic.priceId)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  disabled={subscription.loading}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {subscription.loading ? "Carregando..." : "Assinar Basic"}
                </Button>
              ) : subscription.plan === "basic" ? (
                <Button 
                  variant="outline" 
                  onClick={subscription.openCustomerPortal}
                  className="w-full"
                >
                  Gerenciar Assinatura
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  Downgrade disponível em breve
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`relative border-2 ${subscription.plan === "premium" ? "border-purple-500" : "border-purple-500/20"}`}>
            {subscription.plan === "premium" ? (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">
                <Sparkles className="w-3 h-3 mr-1" />
                Plano Atual
              </Badge>
            ) : (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">
                Recomendado
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                Premium
                <Sparkles className="w-5 h-5 text-purple-500" />
              </CardTitle>
              <CardDescription>{PLANS.premium.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{PLANS.premium.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {PLANS.premium.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {subscription.plan === "premium" ? (
                <Button 
                  variant="outline" 
                  onClick={subscription.openCustomerPortal}
                  className="w-full"
                >
                  Gerenciar Assinatura
                </Button>
              ) : (
                <Button
                  onClick={() => handleSelectPlan(PLANS.premium.priceId)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={subscription.loading}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {subscription.loading ? "Carregando..." : "Assinar Premium"}
                </Button>
              )}
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
