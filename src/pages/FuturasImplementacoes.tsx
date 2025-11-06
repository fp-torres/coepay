import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Clock, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { NovaSugestaoForm } from "@/components/sugestoes/NovaSugestaoForm";
import { KanbanBoard } from "@/components/sugestoes/KanbanBoard";

const FUTURE_FEATURES = [
  {
    title: "Tipos de Juros Personalizados",
    description: "Escolha entre juros simples, compostos e outros tipos de cálculo",
    status: "em_desenvolvimento",
    availableFor: ["premium"],
    eta: "Q2 2025",
  },
  {
    title: "Automação via WhatsApp",
    description: "Envio automático de cobranças e lembretes pelo WhatsApp",
    status: "planejado",
    availableFor: ["basic", "premium"],
    eta: "Q3 2025",
  },
  {
    title: "Descrição Detalhada de Cobranças",
    description: "Campo adicional para detalhar melhor a finalidade de cada cobrança",
    status: "em_desenvolvimento",
    availableFor: ["basic", "premium"],
    eta: "Q2 2025",
  },
  {
    title: "Integrações com Bancos",
    description: "Sincronização automática com contas bancárias via Open Banking",
    status: "planejado",
    availableFor: ["premium"],
    eta: "Q4 2025",
  },
  {
    title: "App Mobile",
    description: "Aplicativo nativo para iOS e Android",
    status: "planejado",
    availableFor: ["basic", "premium"],
    eta: "Q4 2025",
  },
  {
    title: "Multi-moeda",
    description: "Suporte para cobranças em diferentes moedas",
    status: "em_analise",
    availableFor: ["premium"],
    eta: "A definir",
  },
];

const STATUS_CONFIG = {
  em_desenvolvimento: {
    label: "Em Desenvolvimento",
    icon: AlertCircle,
    color: "bg-blue-500",
  },
  planejado: {
    label: "Planejado",
    icon: Clock,
    color: "bg-amber-500",
  },
  em_analise: {
    label: "Em Análise",
    icon: CheckCircle2,
    color: "bg-purple-500",
  },
};

const FuturasImplementacoes = () => {
  const navigate = useNavigate();
  const subscription = useSubscription();
  const [recarregarSugestoes, setRecarregarSugestoes] = useState(0);

  const isFeatureAvailable = (availableFor: string[]) => {
    return availableFor.includes(subscription.plan);
  };

  const handleSugestaoAdicionada = () => {
    setRecarregarSugestoes(prev => prev + 1);
  };

  return (
    <div className="bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent">
            Futuras Implementações
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja o que estamos desenvolvendo e planejando para o futuro da plataforma
          </p>
          {subscription.plan === "free" && (
            <Card className="max-w-2xl mx-auto border-amber-300 bg-amber-50/50">
              <CardContent className="pt-6">
                <p className="text-sm text-center">
                  <Sparkles className="w-4 h-4 inline mr-2 text-amber-600" />
                  Usuários Premium têm acesso antecipado a novos recursos assim que são lançados
                  <Button
                    onClick={() => navigate("/planos")}
                    className="ml-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    size="sm"
                  >
                    Ver Planos
                  </Button>
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs: Roadmap Oficial vs Sugestões da Comunidade */}
        <Tabs defaultValue="roadmap" className="mt-8">
          <TabsList className="grid w-full max-w-[400px] mx-auto grid-cols-2">
            <TabsTrigger value="roadmap">Roadmap Oficial</TabsTrigger>
            <TabsTrigger value="sugestoes">
              <Lightbulb className="w-4 h-4 mr-2" />
              Sugestões
            </TabsTrigger>
          </TabsList>

          {/* Roadmap Oficial */}
          <TabsContent value="roadmap" className="mt-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FUTURE_FEATURES.map((feature, idx) => {
                const statusConfig = STATUS_CONFIG[feature.status];
                const StatusIcon = statusConfig.icon;
                const available = isFeatureAvailable(feature.availableFor);

                return (
                  <Card 
                    key={idx} 
                    className={`relative ${!available ? "opacity-60" : ""}`}
                  >
                    <Badge className={`absolute -top-3 right-4 ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                    <CardHeader>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Previsão:</span>
                        <span className="font-semibold">{feature.eta}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {feature.availableFor.map((plan) => (
                          <Badge key={plan} variant="outline" className="text-xs">
                            {plan === "basic" ? "Basic" : "Premium"}
                          </Badge>
                        ))}
                      </div>
                      {!available && (
                        <Button
                          onClick={() => navigate("/planos")}
                          className="w-full"
                          variant="outline"
                          size="sm"
                        >
                          Upgrade para acessar
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Sugestões da Comunidade */}
          <TabsContent value="sugestoes" className="mt-8 space-y-8">
            <NovaSugestaoForm onSugestaoAdicionada={handleSugestaoAdicionada} />
            <KanbanBoard recarregar={recarregarSugestoes} />
          </TabsContent>
        </Tabs>

        {/* Roadmap Info */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Sobre o Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Nosso roadmap é dinâmico e pode sofrer alterações conforme o feedback dos usuários e
              as necessidades do mercado. Priorizamos recursos que trazem maior valor aos nossos
              clientes.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div key={key} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{config.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {key === "em_desenvolvimento" && "Já estamos trabalhando nisso"}
                        {key === "planejado" && "Confirmado para desenvolvimento"}
                        {key === "em_analise" && "Avaliando viabilidade"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FuturasImplementacoes;
