import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Save, Key } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  pix: string;
}

const Configuracoes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", pix: "" });
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
      const response = await fetch(`http://localhost:3000/auth/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        toast({
          title: "Dados atualizados!",
          description: "Suas informações foram salvas com sucesso.",
        });
      } else throw new Error("Erro ao atualizar dados");
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
    <div className="bg-gradient-to-b from-gray-50 to-white p-6 flex justify-center items-start">
      <div className="w-full max-w-3xl space-y-6">
        {/* Card principal */}
        <Card className="shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-coepay-primary to-coepay-secondary text-white p-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Save className="w-6 h-6" />
              Configurações de Perfil
            </CardTitle>
            <CardDescription className="text-white/90 mt-1">
              Atualize suas informações pessoais. As alterações no PIX serão aplicadas a todas as cobranças futuras.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 bg-white space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <div className="space-y-1">
                <Label htmlFor="name" className="font-medium text-gray-700">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                  className="border-gray-300 focus:border-coepay-primary focus:ring-coepay-primary"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="font-medium text-gray-700">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                  className="border-gray-300 focus:border-coepay-primary focus:ring-coepay-primary"
                />
              </div>

              {/* PIX */}
              <div className="space-y-1">
                <Label htmlFor="pix" className="font-medium text-gray-700 flex items-center gap-1">
                  <Key className="w-4 h-4 text-coepay-primary" /> Chave PIX Padrão
                </Label>
                <Input
                  id="pix"
                  value={formData.pix}
                  onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                  placeholder="Sua chave PIX (CPF, e-mail, telefone ou aleatória)"
                  required
                  className="border-gray-300 focus:border-coepay-primary focus:ring-coepay-primary"
                />
                <p className="text-xs text-gray-500">
                  Esta chave será usada por padrão em todas as suas novas cobranças
                </p>
              </div>

              {/* Botão Salvar */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center
                           bg-gradient-to-r from-coepay-primary to-coepay-secondary
                           text-white font-semibold shadow-lg rounded-lg hover:opacity-90 transition"
              >
                <Save className="w-5 h-5 mr-2" />
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
