import { Building2, LayoutDashboard, CreditCard, MapPin, DollarSign, FileText } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
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
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Empresas', url: '/empresas', icon: Building2 },
  { title: 'Sucursales', url: '/sucursales', icon: MapPin },
  { title: 'Centros de Costo', url: '/centros-costo', icon: CreditCard },
  { title: 'Conceptos de Gasto', url: '/conceptos-gasto', icon: DollarSign },
  { title: 'Cajas', url: '/cajas', icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile } = useAuth();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <span className="font-bold">Sistema de Gastos</span>
              </div>
            )}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
                      activeClassName="bg-sidebar-accent font-semibold"
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User info at bottom */}
        {profile && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-semibold">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    {profile.role}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
