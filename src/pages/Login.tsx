import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Zap } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", pix: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

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
    navigate("/painel-de-controle");
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
      navigate("/painel-de-controle");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-coepay-primary/5 via-background to-coepay-secondary/10">
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 lg:p-8">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-gradient-to-br from-coepay-primary to-coepay-secondary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent">
            CoéPay
          </span>
        </div>
      </header>

      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
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
            <Tabs defaultValue="login" className="w-full">
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

                  <div className="relative space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="border-coepay-primary/20 focus:border-coepay-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[35px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
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

                  <div className="relative space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      className="border-coepay-primary/20 focus:border-coepay-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-[35px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
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
      </div>
    </div>
  );
};

export default Login;