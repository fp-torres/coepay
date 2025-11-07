import { Home, BarChart3, Settings, Crown, Lightbulb, LogOut, CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Painel de Controle", url: "/painel-de-controle", icon: Home },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Cobranças Pagas", url: "/cobrancas-pagas", icon: CheckCircle2 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Planos", url: "/planos", icon: Crown },
  { title: "Futuras Implementações", url: "/futuras-implementacoes", icon: Lightbulb },
];

interface AppSidebarProps {
  onLogout: () => void;
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const isActive = (path: string) => location.pathname === path;

  return (
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border transition-all duration-300"
        style={{
          width: state === "collapsed" ? "60px" : "260px", // <-- aqui é o ajuste real
          transition: "width 0.3s ease",
        }}
      >
      <SidebarHeader className="border-b border-sidebar-border p-2">
        <div
          className={`flex items-center transition-all duration-300 ${
            state === "collapsed"
              ? "justify-center px-0" // Centraliza a logo no modo colapsado
              : "justify-start px-4 gap-2" // Logo + texto quando expandido
          }`}
        >
          <img
            src="/logo1_modo_escuro.png"
            alt="CoéPay"
            className={`transition-all duration-300 ${
              state === "collapsed" ? "h-10 w-10" : "h-10 w-10"
            }`}
          />
          <span
            className={`font-bold text-lg bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent transition-all duration-300 ${
              state === "collapsed"
                ? "opacity-0 w-0 overflow-hidden"
                : "opacity-100 w-auto"
            }`}
          >
            CoéPay
          </span>
        </div>
      </SidebarHeader>




      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : ""}>
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const active = isActive(item.url);
              const isGradientItem = ["/planos", "/relatorios"].includes(item.url);

              return (
                <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  onClick={() => navigate(item.url)}
                  isActive={active}
                  tooltip={item.title}
                  className={`
                    transition-all duration-300 flex items-center gap-2 rounded-md
                    ${
                      state === "collapsed"
                        ? "justify-center w-10 h-10 mx-auto" // centraliza e corrige o hover no modo colapsado
                        : "justify-start w-full px-4 py-2" // modo expandido normal
                    }
                    ${
                      active
                        ? isGradientItem
                          ? "bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 text-white font-semibold shadow-md"
                          : "bg-gradient-to-r from-coepay-primary to-coepay-secondary text-white font-semibold shadow-md"
                        : isGradientItem
                        ? "hover:bg-gradient-to-r hover:from-amber-400 hover:via-rose-400 hover:to-purple-500 hover:text-white"
                        : "hover:bg-gradient-to-r hover:from-coepay-primary hover:to-coepay-secondary hover:text-white"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {state !== "collapsed" && <span>{item.title}</span>}
                </SidebarMenuButton>

                      </SidebarMenuItem>
                    );
                  })}
          </SidebarMenu>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              tooltip="Sair"
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
