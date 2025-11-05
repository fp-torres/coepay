import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sugestao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string | null;
  status: string;
  created_at: string;
}

interface SugestaoCardProps {
  sugestao: Sugestao;
}

export const SugestaoCard = ({ sugestao }: SugestaoCardProps) => {
  return (
    <Card className="bg-card hover:shadow-md transition-shadow cursor-move">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">
            {sugestao.titulo}
          </CardTitle>
          {sugestao.categoria && (
            <Badge variant="outline" className="shrink-0 text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {sugestao.categoria}
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-3 text-sm">
          {sugestao.descricao}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {formatDistanceToNow(new Date(sugestao.created_at), {
            addSuffix: true,
            locale: ptBR
          })}
        </div>
      </CardContent>
    </Card>
  );
};
