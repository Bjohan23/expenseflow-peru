/**
 * Hooks personalizados para gestión de gastos
 * Usa TanStack Query para caching y sincronización
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// TODO: Migrate to new API service - import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  Gasto,
  GastoConDetalles,
  FormularioGasto,
  FiltrosGastos,
  EstadisticasGastos,
  AprobarGastoRequest,
  RechazarGastoRequest,
  RegistrarPagoRequest,
  GastoHistorial,
} from "@/types/gastos";

// =====================================================
// QUERY KEYS
// =====================================================

export const gastosKeys = {
  all: ["gastos"],
  lists: () => ["gastos", "list"],
  list: (filtros?: FiltrosGastos) => ["gastos", "list", filtros],
  details: () => ["gastos", "detail"],
  detail: (id: string) => ["gastos", "detail", id],
  stats: (filtros?: FiltrosGastos) => ["gastos", "stats", filtros],
  historial: (id: string) => ["gastos", "historial", id],
};

// =====================================================
// HOOK: OBTENER LISTA DE GASTOS
// =====================================================

export function useGastos(filtros?: FiltrosGastos) {
  return useQuery({
    queryKey: gastosKeys.list(filtros),
    queryFn: async () => {
      let query = supabase
        .from("vista_gastos")
        .select("*")
        .order("fecha_gasto", { ascending: false });

      // Aplicar filtros
      if (filtros?.estado) {
        if (Array.isArray(filtros.estado)) {
          query = query.in("estado", filtros.estado);
        } else {
          query = query.eq("estado", filtros.estado);
        }
      }

      if (filtros?.concepto_gasto_id) {
        query = query.eq("concepto_gasto_id", filtros.concepto_gasto_id);
      }

      if (filtros?.caja_id) {
        query = query.eq("caja_id", filtros.caja_id);
      }

      if (filtros?.centro_costo_id) {
        query = query.eq("centro_costo_id", filtros.centro_costo_id);
      }

      if (filtros?.usuario_id) {
        query = query.eq("usuario_id", filtros.usuario_id);
      }

      if (filtros?.fecha_desde) {
        query = query.gte("fecha_gasto", filtros.fecha_desde);
      }

      if (filtros?.fecha_hasta) {
        query = query.lte("fecha_gasto", filtros.fecha_hasta);
      }

      if (filtros?.monto_min) {
        query = query.gte("monto", filtros.monto_min);
      }

      if (filtros?.monto_max) {
        query = query.lte("monto", filtros.monto_max);
      }

      if (filtros?.moneda) {
        query = query.eq("moneda", filtros.moneda);
      }

      if (filtros?.excede_limite !== undefined) {
        query = query.eq("excede_limite", filtros.excede_limite);
      }

      // Búsqueda en múltiples campos
      if (filtros?.busqueda && filtros.busqueda.trim() !== "") {
        const busqueda = `%${filtros.busqueda}%`;
        query = query.or(
          `codigo.ilike.${busqueda},` +
            `descripcion.ilike.${busqueda},` +
            `beneficiario_nombre.ilike.${busqueda},` +
            `beneficiario_documento.ilike.${busqueda}`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as GastoConDetalles[];
    },
  });
}

// =====================================================
// HOOK: OBTENER DETALLE DE UN GASTO
// =====================================================

export function useGasto(id: string) {
  return useQuery({
    queryKey: gastosKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase.from("vista_gastos").select("*").eq("id", id).single();

      if (error) throw error;
      return data as GastoConDetalles;
    },
    enabled: !!id,
  });
}

// =====================================================
// HOOK: OBTENER ESTADÍSTICAS
// =====================================================

export function useEstadisticasGastos(filtros?: FiltrosGastos) {
  return useQuery({
    queryKey: gastosKeys.stats(filtros),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("obtener_estadisticas_gastos", {
        p_usuario_id: filtros?.usuario_id || null,
        p_fecha_desde: filtros?.fecha_desde || null,
        p_fecha_hasta: filtros?.fecha_hasta || null,
      });

      if (error) throw error;

      const result = data?.[0] || {};

      return {
        total_gastos: result.total_gastos || 0,
        gastos_pendientes: result.gastos_pendientes || 0,
        gastos_aprobados: result.gastos_aprobados || 0,
        gastos_rechazados: result.gastos_rechazados || 0,
        gastos_pagados: result.gastos_pagados || 0,
        monto_total_pen: result.monto_total_pen || 0,
        monto_pendiente_pen: result.monto_pendiente_pen || 0,
        monto_aprobado_pen: result.monto_aprobado_pen || 0,
      } as EstadisticasGastos;
    },
  });
}

// =====================================================
// HOOK: OBTENER HISTORIAL DE UN GASTO
// =====================================================

export function useHistorialGasto(gastoId: string) {
  return useQuery({
    queryKey: gastosKeys.historial(gastoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gastos_historial")
        .select("*")
        .eq("gasto_id", gastoId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as GastoHistorial[];
    },
    enabled: !!gastoId,
  });
}

// =====================================================
// MUTATION: CREAR GASTO
// =====================================================

export function useCrearGasto() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (datos: FormularioGasto) => {
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("gastos")
        .insert({
          ...datos,
          usuario_id: user.id,
          estado: datos.estado || "borrador",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Gasto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.stats() });

      const mensaje =
        data.estado === "borrador"
          ? "Gasto guardado como borrador"
          : "Gasto creado y enviado para aprobación";

      toast.success(mensaje, {
        description: `Código: ${data.codigo}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Error al crear gasto", {
        description: error.message,
      });
    },
  });
}

// =====================================================
// MUTATION: ACTUALIZAR GASTO
// =====================================================

export function useActualizarGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, datos }: { id: string; datos: Partial<FormularioGasto> }) => {
      const { data, error } = await supabase
        .from("gastos")
        .update(datos)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Gasto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: gastosKeys.stats() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.historial(data.id) });

      toast.success("Gasto actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar gasto", {
        description: error.message,
      });
    },
  });
}

// =====================================================
// MUTATION: ELIMINAR GASTO
// =====================================================

export function useEliminarGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gastos").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.stats() });

      toast.success("Gasto eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar gasto", {
        description: error.message,
      });
    },
  });
}

// =====================================================
// MUTATION: APROBAR GASTO
// =====================================================

export function useAprobarGasto() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ gasto_id, observaciones }: AprobarGastoRequest) => {
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("gastos")
        .update({
          estado: "aprobado",
          aprobado_por: user.id,
          aprobado_en: new Date().toISOString(),
          observaciones: observaciones || null,
        })
        .eq("id", gasto_id)
        .eq("estado", "pendiente")
        .select()
        .single();

      if (error) throw error;
      return data as Gasto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: gastosKeys.stats() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.historial(data.id) });

      toast.success("Gasto aprobado correctamente", {
        description: `Código: ${data.codigo}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Error al aprobar gasto", {
        description: error.message,
      });
    },
  });
}

// =====================================================
// MUTATION: RECHAZAR GASTO
// =====================================================

export function useRechazarGasto() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ gasto_id, motivo_rechazo }: RechazarGastoRequest) => {
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("gastos")
        .update({
          estado: "rechazado",
          rechazado_por: user.id,
          rechazado_en: new Date().toISOString(),
          motivo_rechazo,
        })
        .eq("id", gasto_id)
        .eq("estado", "pendiente")
        .select()
        .single();

      if (error) throw error;
      return data as Gasto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: gastosKeys.stats() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.historial(data.id) });

      toast.success("Gasto rechazado", {
        description: `Código: ${data.codigo}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Error al rechazar gasto", {
        description: error.message,
      });
    },
  });
}

// =====================================================
// MUTATION: REGISTRAR PAGO
// =====================================================

export function useRegistrarPago() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      gasto_id,
      forma_pago,
      numero_operacion,
      observaciones,
    }: RegistrarPagoRequest) => {
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("gastos")
        .update({
          estado: "pagado",
          pagado_por: user.id,
          pagado_en: new Date().toISOString(),
          forma_pago,
          numero_operacion: numero_operacion || null,
          observaciones: observaciones || null,
        })
        .eq("id", gasto_id)
        .eq("estado", "aprobado")
        .select()
        .single();

      if (error) throw error;
      return data as Gasto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: gastosKeys.stats() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.historial(data.id) });

      toast.success("Pago registrado correctamente", {
        description: `Código: ${data.codigo}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Error al registrar pago", {
        description: error.message,
      });
    },
  });
}

// =====================================================
// MUTATION: ANULAR GASTO
// =====================================================

export function useAnularGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      const { data, error } = await supabase
        .from("gastos")
        .update({
          estado: "anulado",
          observaciones: motivo,
        })
        .eq("id", id)
        .neq("estado", "pagado")
        .select()
        .single();

      if (error) throw error;
      return data as Gasto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: gastosKeys.stats() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.historial(data.id) });

      toast.success("Gasto anulado correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al anular gasto", {
        description: error.message,
      });
    },
  });
}

// =====================================================
// MUTATION: ENVIAR GASTO (BORRADOR → PENDIENTE)
// =====================================================

export function useEnviarGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("gastos")
        .update({ estado: "pendiente" })
        .eq("id", id)
        .eq("estado", "borrador")
        .select()
        .single();

      if (error) throw error;
      return data as Gasto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: gastosKeys.stats() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.historial(data.id) });

      toast.success("Gasto enviado para aprobación", {
        description: `Código: ${data.codigo}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Error al enviar gasto", {
        description: error.message,
      });
    },
  });
}
