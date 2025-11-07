import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

function SidebarToggleButton() {
  const { state, toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="absolute top-10 -right-1 z-50 flex items-center justify-center w-7 h-7 rounded-full border border-sidebar-border bg-background hover:bg-gradient-to-r hover:from-coepay-primary hover:to-coepay-secondary hover:text-white shadow-sm transition-all"
      style={{
        transform: "translateX(50%)",
      }}
    >
      {state === "collapsed" ? (
        <ChevronRight className="w-4 h-4" />
      ) : (
        <ChevronLeft className="w-4 h-4" />
      )}
    </button>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        {/* Sidebar principal */}
        <div className="relative">
          <AppSidebar onLogout={handleLogout} />
          {/* Botão de seta sobre a linha divisória */}
          <SidebarToggleButton />
        </div>

        {/* Conteúdo */}
        <SidebarInset className="flex-1">
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
