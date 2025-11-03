import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Zap, Activity, Percent, CheckCircle, BarChart3 } from "lucide-react";
import logoImage from "/logo1_modo_claro.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-coepay-primary/5 via-background to-coepay-secondary/10">
      {/* Header */}
     <header className="relative z-10 flex justify-between items-center px-6 lg:px-8 h-32">
      <div
        className="flex items-center space-x-3 cursor-pointer outline-none focus:outline-none focus-visible:outline-none select-none"
        onClick={() => navigate("/")}
        tabIndex={-1} // impede o foco pelo clique
      >
    <img 
      src={logoImage} 
      alt="CoéPay Logo" 
      className="w-16 h-16 object-contain"
    />
    <span className="text-2xl font-bold bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent">
      CoéPay
    </span>
  </div>

  <Button 
    variant="outline" 
    onClick={() => navigate("/login")}
    className="
      border-coepay-primary/20 text-coepay-primary
      hover:bg-gradient-to-r hover:from-coepay-primary/90 hover:to-coepay-secondary/90
      hover:text-white hover:border-transparent
      transition-colors
    "
  >
    Entrar
  </Button>
</header>


      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-120px)]">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent">
                  Pagamentos & Cobranças
                </span>
                <br />
                <span className="text-foreground">simples e automatizados</span>
              </h1>
                <p className="text-xl text-foreground/90 leading-relaxed">
                  Gerencie suas cobranças com praticidade e eficiência, sem dor de cabeça nem burocracia.
                  <span className="text-base text-coepay-primary block mt-1">
                    Crie e envie cobranças com PIX, QR Codes, juros e envio automático de forma rápida e descontraída.
                  </span>
                </p>
            </div>

            {/* Features */}
            <div className="grid gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-coepay-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-coepay-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Relatórios Avançados</h3>
                  <p className="text-sm text-muted-foreground">Acompanhe suas métricas em tempo real</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-coepay-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-coepay-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Automatize Cobranças</h3>
                  <p className="text-sm text-muted-foreground">
                    Envie cobranças automaticamente facilitando sua rotina e aumentando a eficiência
                  </p>
                </div>

              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-coepay-secondary/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-coepay-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">PIX Instantâneo</h3>
                  <p className="text-sm text-muted-foreground">Receba pagamentos em segundos</p>
                </div>
              </div>
            
            {/*Juros Personalizados */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-coepay-warning/10 rounded-lg flex items-center justify-center">
                <Percent className="w-5 h-5 text-coepay-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Juros Personalizados</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione juros por dia ou por mês e escolha a porcentagem ideal para cada cobrança
                </p>
              </div>
            </div>
          </div>



            <Button 
              size="lg" 
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-coepay-primary to-coepay-secondary hover:from-coepay-primary/90 hover:to-coepay-secondary/90 text-white group"
            >
              Começar Agora
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Side - Visual Showcase */}
          <div className="flex justify-center">
            <div className="hidden lg:block w-full max-w-md">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-coepay-primary/40 to-coepay-secondary/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-coepay-primary/10">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-coepay-primary to-coepay-secondary rounded-2xl flex items-center justify-center mx-auto">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">Controle Total</h3>
                      <p className="text-muted-foreground text-sm">
                        Gerencie todas as suas cobranças em um só lugar
                      </p>
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-coepay-success flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Cobranças Automáticas</p>
                          <p className="text-muted-foreground text-xs">Envie lembretes automaticamente</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-coepay-success flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">QR Code PIX</p>
                          <p className="text-muted-foreground text-xs">Pagamento instantâneo e seguro</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-coepay-success flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Relatórios Completos</p>
                          <p className="text-muted-foreground text-xs">Análise detalhada do seu negócio</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                      <Button 
                        onClick={() => navigate("/login")}
                        className="w-full bg-gradient-to-r from-coepay-primary to-coepay-secondary hover:from-coepay-primary/90 hover:to-coepay-secondary/90 text-white"
                      >
                        Começar Gratuitamente
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
