import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  pix: string;
}

const Configuracoes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pix: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      pix: parsedUser.pix || "",
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Atualizar localStorage e state
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        toast({
          title: "Dados atualizados!",
          description: "Suas informações foram salvas com sucesso.",
        });
      } else {
        throw new Error("Erro ao atualizar dados");
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast({
        title: "Erro!",
        description: "Não foi possível atualizar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais. As alterações no PIX serão aplicadas a todas as cobranças futuras.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix">Chave PIX Padrão</Label>
                <Input
                  id="pix"
                  value={formData.pix}
                  onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                  placeholder="Sua chave PIX (CPF, e-mail, telefone ou chave aleatória)"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Esta chave será usada em todas as suas novas cobranças por padrão
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;
