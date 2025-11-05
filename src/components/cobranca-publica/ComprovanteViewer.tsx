import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";
import { useState } from "react";

interface ComprovanteViewerProps {
  comprovanteUrls?: string;
}

export const ComprovanteViewer = ({ comprovanteUrls }: ComprovanteViewerProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!comprovanteUrls) return null;

  const urls = comprovanteUrls.split(',').map(url => url.trim());

  const handleDownload = (url: string) => {
    window.open(`http://localhost:5000${url}`, '_blank');
  };

  const isImage = (url: string) => {
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Comprovantes enviados:</p>
      <div className="grid grid-cols-1 gap-2">
        {urls.map((url, index) => (
          <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm flex-1 truncate text-foreground">
              Comprovante {index + 1}
            </span>
            <div className="flex gap-2">
              {isImage(url) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedImage(`http://localhost:5000${url}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDownload(url)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Visualizar Comprovante</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img src={selectedImage} alt="Comprovante" className="max-w-full h-auto rounded-lg" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
