import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lightbulb } from "lucide-react";

const CATEGORIAS = [
  "Automação",
  "Relatórios",
  "Integrações",
  "Interface",
  "Segurança",
  "Pagamentos",
  "Notificações",
  "Outro"
];

export const NovaSugestaoForm = ({ onSugestaoAdicionada }: { onSugestaoAdicionada: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !descricao.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título e descrição",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("sugestoes")
        .insert({
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          categoria: categoria || null,
          status: "em_analise",
          user_id: user?.id || null
        });

      if (error) throw error;

      toast({
        title: "Sugestão enviada!",
        description: "Sua sugestão foi adicionada para análise. Obrigado!",
      });

      // Limpar formulário
      setTitulo("");
      setDescricao("");
      setCategoria("");
      
      onSugestaoAdicionada();
    } catch (error) {
      console.error("Erro ao enviar sugestão:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar sua sugestão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Sugira uma Funcionalidade
        </CardTitle>
        <CardDescription>
          Compartilhe suas ideias para melhorar a plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              placeholder="Ex: Envio automático via email"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva sua sugestão com o máximo de detalhes possível..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="min-h-[100px]"
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {descricao.length}/1000 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Sugestão"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
