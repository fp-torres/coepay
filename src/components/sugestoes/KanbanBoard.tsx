import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SugestaoCard } from "./SugestaoCard";
import { KanbanColumn } from "./KanbanColumn";
import { Loader2 } from "lucide-react";

interface Sugestao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string | null;
  status: string;
  created_at: string;
}

const COLUNAS = [
  { id: "em_analise", titulo: "Em Análise", cor: "bg-purple-500" },
  { id: "planejado", titulo: "Planejado", cor: "bg-amber-500" },
  { id: "em_desenvolvimento", titulo: "Em Desenvolvimento", cor: "bg-blue-500" }
];

export const KanbanBoard = ({ recarregar }: { recarregar: number }) => {
  const { toast } = useToast();
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSugestao, setActiveSugestao] = useState<Sugestao | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const carregarSugestoes = async () => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        setSugestoes([]);
        return;
      }

      const { data, error } = await supabase
        .from("sugestoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSugestoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar sugestões:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as sugestões",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarSugestoes();
  }, [recarregar]);

  const handleDragStart = (event: DragStartEvent) => {
    const sugestao = sugestoes.find(s => s.id === event.active.id);
    setActiveSugestao(sugestao || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveSugestao(null);
    
    const { active, over } = event;
    
    if (!over) return;
    
    const sugestaoId = active.id as string;
    const novoStatus = over.id as string;

    // Verificar se é uma coluna válida
    if (!COLUNAS.find(col => col.id === novoStatus)) return;

    // Otimistic update
    setSugestoes(prev =>
      prev.map(s =>
        s.id === sugestaoId ? { ...s, status: novoStatus } : s
      )
    );

    try {
      if (!isSupabaseConfigured || !supabase) return;

      const { error } = await supabase
        .from("sugestoes")
        .update({ status: novoStatus })
        .eq("id", sugestaoId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "A sugestão foi movida com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      // Reverter mudança otimista
      carregarSugestoes();
      toast({
        title: "Erro ao mover",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid md:grid-cols-3 gap-6">
        {COLUNAS.map((coluna) => (
          <KanbanColumn
            key={coluna.id}
            id={coluna.id}
            titulo={coluna.titulo}
            cor={coluna.cor}
            sugestoes={sugestoes.filter(s => s.status === coluna.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeSugestao ? (
          <div className="rotate-3 opacity-80">
            <SugestaoCard sugestao={activeSugestao} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
