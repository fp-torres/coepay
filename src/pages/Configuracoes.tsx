import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Save, Key, Lock, Eye, EyeOff } from "lucide-react";

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
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    showOld: false,
    showNew: false,
    showConfirm: false,
  });

  const [loadingPassword, setLoadingPassword] = useState(false);

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

 // Atualizar senha
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro!",
        description: "As senhas novas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setLoadingPassword(true);
    try {
      const response = await fetch(`http://localhost:3000/auth/${user.id}/updatePassword`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Senha atualizada!",
          description: data.message || "Sua senha foi alterada com sucesso.",
        });
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "", showOld: false, showNew: false, showConfirm: false });
      } else {
        toast({
          title: "Erro!",
          description: data.message || "Não foi possível atualizar a senha.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        title: "Erro!",
        description: "Ocorreu um problema ao atualizar sua senha.",
        variant: "destructive",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!user) return null;

    return (
    <div className="bg-gradient-to-b from-gray-50 to-white p-6 flex justify-center items-start">
      <div className="w-full max-w-3xl space-y-6">
        {/* Card principal - Perfil */}
        <Card className="shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-coepay-primary to-coepay-secondary text-white p-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Save className="w-6 h-6" />
              Configurações de Perfil
            </CardTitle>
            <CardDescription className="text-white/90 mt-1">
              Atualize suas informações pessoais e chave PIX.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 bg-white space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <div className="space-y-1">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
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

              {/* PIX */}
              <div className="space-y-1">
                <Label htmlFor="pix" className="flex items-center gap-1">
                  <Key className="w-4 h-4 text-coepay-primary" /> Chave PIX Padrão
                </Label>
                <Input
                  id="pix"
                  value={formData.pix}
                  onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                  placeholder="Sua chave PIX"
                  required
                />
              </div>

              {/* Botão Salvar */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-coepay-primary to-coepay-secondary text-white font-semibold"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

{/* Card de atualização de senha */}
<Card className="shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
  <CardHeader className="bg-gradient-to-r from-coepay-primary to-coepay-secondary text-white p-6">
    <CardTitle className="text-2xl flex items-center gap-2">
      <Lock className="w-6 h-6" />
      Alterar Senha
    </CardTitle>
    <CardDescription className="text-white/90 mt-1">
      Troque sua senha de acesso com segurança.
    </CardDescription>
  </CardHeader>

  <CardContent className="p-6 bg-white space-y-6">
    <form onSubmit={handlePasswordUpdate} className="space-y-5">
      {/* Senha atual */}
      <div className="space-y-1 relative">
        <Label htmlFor="oldPassword">Senha atual</Label>
        <div className="relative">
          <Input
            id="oldPassword"
            type={passwordData.showOld ? "text" : "password"}
            value={passwordData.oldPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, oldPassword: e.target.value })
            }
            required
          />
          <button
            type="button"
            onClick={() =>
              setPasswordData((prev) => ({
                ...prev,
                showOld: !prev.showOld,
              }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {passwordData.showOld ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Nova senha */}
      <div className="space-y-1 relative">
        <Label htmlFor="newPassword">Nova senha</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={passwordData.showNew ? "text" : "password"}
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            required
          />
          <button
            type="button"
            onClick={() =>
              setPasswordData((prev) => ({
                ...prev,
                showNew: !prev.showNew,
              }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {passwordData.showNew ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Confirmar nova senha */}
      <div className="space-y-1 relative">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={passwordData.showConfirm ? "text" : "password"}
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
            }
            required
          />
          <button
            type="button"
            onClick={() =>
              setPasswordData((prev) => ({
                ...prev,
                showConfirm: !prev.showConfirm,
              }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {passwordData.showConfirm ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Botão salvar */}
      <Button
        type="submit"
        disabled={loadingPassword}
        className="w-full bg-gradient-to-r from-coepay-primary to-coepay-secondary text-white font-semibold"
      >
        <Lock className="w-5 h-5 mr-2" />
        {loadingPassword ? "Atualizando..." : "Atualizar Senha"}
      </Button>
    </form>
  </CardContent>
</Card>
      </div>
    </div>
  );
};

export default Configuracoes;
