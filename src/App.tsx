import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CobrancaPublica from "./pages/CobrancaPublica";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Planos from "./pages/Planos";
import FuturasImplementacoes from "./pages/FuturasImplementacoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cobranca/:hash" element={<CobrancaPublica />} />
          
          <Route element={<AppLayout />}>
            <Route path="/painel-de-controle" element={<Dashboard />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/futuras-implementacoes" element={<FuturasImplementacoes />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
