import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Sucursales from "./pages/Sucursales";
import CentrosCosto from "./pages/CentrosCosto";
import ConceptosGasto from "./pages/ConceptosGasto";
import ConceptoDocumentos from "./pages/ConceptoDocumentos";
import OCRUploadPage from "./pages/OCRUploadPage";
import GastosDocumentos from "./pages/GastosDocumentos";
import Gastos from "./pages/Gastos";
import NuevoGasto from "./pages/NuevoGasto";
import GastoDetalle from "./pages/GastoDetalle";
import Cajas from "./pages/Cajas";
import EmpresaUsuarios from "./pages/EmpresaUsuarios";
import Usuarios from "./pages/Usuarios";
import { AsignacionesFondos } from "./pages/AsignacionesFondos";
import { AsignacionDetalle } from "./pages/AsignacionDetalle";
import { Aprobaciones } from "./pages/Aprobaciones";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/sucursales" element={<Sucursales />} />
              <Route path="/centros-costo" element={<CentrosCosto />} />
              <Route path="/conceptos-gasto" element={<ConceptosGasto />} />
              <Route path="/conceptos-gasto/:id/documentos" element={<ConceptoDocumentos />} />
              <Route
                path="/conceptos-gasto/:id/documentos/escaneados"
                element={<GastosDocumentos />}
              />
              <Route path="/conceptos-gasto/:id/documentos/upload" element={<OCRUploadPage />} />
              <Route path="/gastos" element={<Gastos />} />
              <Route path="/gastos/nuevo" element={<NuevoGasto />} />
              <Route path="/gastos/:id" element={<GastoDetalle />} />
              <Route path="/cajas" element={<Cajas />} />
              <Route path="/asignaciones-fondo" element={<AsignacionesFondos />} />
              <Route path="/asignaciones-fondo/:id" element={<AsignacionDetalle />} />
              <Route path="/aprobaciones" element={<Aprobaciones />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/empresa-usuarios" element={<EmpresaUsuarios />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
