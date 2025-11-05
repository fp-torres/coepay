import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SugestaoCard } from "./SugestaoCard";
import { SortableItem } from "./SortableItem";

interface Sugestao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string | null;
  status: string;
  created_at: string;
}

interface KanbanColumnProps {
  id: string;
  titulo: string;
  cor: string;
  sugestoes: Sugestao[];
}

export const KanbanColumn = ({ id, titulo, cor, sugestoes }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card 
      ref={setNodeRef}
      className={`transition-colors ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{titulo}</span>
          <Badge className={`${cor} text-white`}>
            {sugestoes.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <SortableContext
          items={sugestoes.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sugestoes.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
              Nenhuma sugestão aqui ainda
            </div>
          ) : (
            sugestoes.map((sugestao) => (
              <SortableItem key={sugestao.id} id={sugestao.id}>
                <SugestaoCard sugestao={sugestao} />
              </SortableItem>
            ))
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
};
