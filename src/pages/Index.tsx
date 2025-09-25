import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", pix: "" });
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      if (!res.ok) throw new Error("Login inválido");
      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data));
      toast({ title: "Login realizado com sucesso!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });
      if (!res.ok) throw new Error("Erro ao cadastrar");
      const data = await res.json();
      toast({ title: data.message });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coepay-primary/5 via-background to-coepay-secondary/10">
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 lg:p-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-coepay-primary to-coepay-secondary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent">
            CoéPay
          </span>
        </div>
        
        {!showAuth && (
          <Button 
            variant="outline" 
            onClick={() => {
              setActiveTab("login");
              setShowAuth(true);
            }}
            className="border-coepay-primary/20 text-coepay-primary hover:bg-coepay-primary/10"
          >
            Entrar
          </Button>
        )}
      </header>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-120px)]">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent">
                  Pagamentos
                </span>
                <br />
                <span className="text-foreground">fluídos e modernos</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Gerencie suas cobranças de forma simples e eficiente. 
                Transforme a maneira como você recebe pagamentos.
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
                  <Shield className="w-5 h-5 text-coepay-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Segurança Total</h3>
                  <p className="text-sm text-muted-foreground">Suas transações protegidas com criptografia</p>
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
            </div>

            {!showAuth && (
              <Button 
                size="lg" 
                onClick={() => {
                  setActiveTab("signup");
                  setShowAuth(true);
                }}
                className="bg-gradient-to-r from-coepay-primary to-coepay-secondary hover:from-coepay-primary/90 hover:to-coepay-secondary/90 text-white group"
              >
                Começar Agora
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>

          {/* Right Side - Auth Forms */}
          <div className="flex justify-center">
            {showAuth ? (
              <Card className="w-full max-w-md shadow-2xl border-0 bg-card/60 backdrop-blur-sm">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent">
                    Bem-vindo ao CoéPay
                  </CardTitle>
                  <CardDescription>
                    Entre ou cadastre-se para começar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Entrar</TabsTrigger>
                      <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input
                            id="login-email"
                            type="email"
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            required
                            className="border-coepay-primary/20 focus:border-coepay-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Senha</Label>
                          <Input
                            id="login-password"
                            type="password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            required
                            className="border-coepay-primary/20 focus:border-coepay-primary"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-coepay-primary to-coepay-secondary hover:from-coepay-primary/90 hover:to-coepay-secondary/90"
                        >
                          Entrar
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Nome</Label>
                          <Input
                            id="signup-name"
                            value={signupData.name}
                            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                            required
                            className="border-coepay-primary/20 focus:border-coepay-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            value={signupData.email}
                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            required
                            className="border-coepay-primary/20 focus:border-coepay-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Senha</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            required
                            className="border-coepay-primary/20 focus:border-coepay-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-pix">Chave PIX</Label>
                          <Input
                            id="signup-pix"
                            value={signupData.pix}
                            onChange={(e) => setSignupData({ ...signupData, pix: e.target.value })}
                            placeholder="Sua chave PIX"
                            required
                            className="border-coepay-primary/20 focus:border-coepay-primary"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-coepay-primary to-coepay-secondary hover:from-coepay-primary/90 hover:to-coepay-secondary/90"
                        >
                          Cadastrar
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <div className="hidden lg:block w-full max-w-md">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-coepay-primary/40 to-coepay-secondary/20 rounded-3xl blur-3xl"></div>
                  <div className="relative bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-coepay-primary/10">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-coepay-primary to-coepay-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold">Pronto para começar?</h3>
                      <p className="text-muted-foreground">
                        Junte-se a milhares de usuários que já confiam no CoéPay
                      </p>
                      <div className="pt-4">
                        <Button 
                          onClick={() => {
                            setActiveTab("signup");
                            setShowAuth(true);
                          }}
                          className="w-full bg-gradient-to-r from-coepay-primary to-coepay-secondary hover:from-coepay-primary/90 hover:to-coepay-secondary/90 text-white"
                        >
                          Criar Conta Grátis
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
