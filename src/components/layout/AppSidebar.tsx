import {
  Building2,
  LayoutDashboard,
  CreditCard,
  MapPin,
  DollarSign,
  FileText,
  Receipt,
  Users,
  UserCog,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Empresas", url: "/empresas", icon: Building2 },
  { title: "Sucursales", url: "/sucursales", icon: MapPin },
  { title: "Centros de Costo", url: "/centros-costo", icon: CreditCard },
  { title: "Conceptos de Gasto", url: "/conceptos-gasto", icon: DollarSign },
  { title: "Gastos", url: "/gastos", icon: Receipt },
  { title: "Cajas", url: "/cajas", icon: FileText },
  { title: "Usuarios", url: "/usuarios", icon: UserCog },
  { title: "Usuarios por Empresa", url: "/empresa-usuarios", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800"
    >
      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-base">ExpenseFlow</span>
                  <p className="text-xs text-white/70 mt-0.5">Sistema de Gastos</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </SidebarGroupLabel>

          <SidebarGroupContent className="px-3">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                      activeClassName="bg-white/20 text-white font-semibold shadow-lg backdrop-blur-sm"
                    >
                      <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User info at bottom with better design */}
        {user && (
          <div className="mt-auto p-4 border-t border-white/10">
            {!collapsed ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold shadow-md">
                  {(user.firstName?.charAt(0) || user.username?.charAt(0) || 'U').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username || 'Usuario'
                    }
                  </p>
                  <p className="text-xs text-white/70 truncate capitalize">
                    {user.groups?.[0] || 'Usuario'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold shadow-md">
                  {(user.firstName?.charAt(0) || user.username?.charAt(0) || 'U').toUpperCase()}
                </div>
              </div>
            )}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
