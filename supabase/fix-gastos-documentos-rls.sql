-- =====================================================
-- Fix: Políticas RLS para gastos_documentos
-- Fecha: 2025-11-27
-- Problema: Error "permission denied for table users" 
--           al consultar gastos_documentos
-- Solución: Actualizar políticas RLS para evitar JOIN con auth.users
-- =====================================================

-- =====================================================
-- 1. ELIMINAR POLÍTICAS ANTIGUAS
-- =====================================================

DROP POLICY IF EXISTS "gastos_documentos_select_policy" ON gastos_documentos;
DROP POLICY IF EXISTS "gastos_documentos_insert_policy" ON gastos_documentos;
DROP POLICY IF EXISTS "gastos_documentos_update_policy" ON gastos_documentos;
DROP POLICY IF EXISTS "gastos_documentos_delete_policy" ON gastos_documentos;

-- =====================================================
-- 2. CREAR NUEVAS POLÍTICAS RLS SIMPLIFICADAS
-- =====================================================

-- Política SELECT: El usuario puede ver sus propios documentos
-- Simplificada para evitar el error de permisos en auth.users
CREATE POLICY "gastos_documentos_select_policy" 
ON gastos_documentos FOR SELECT
USING (
  usuario_id = auth.uid()
);

-- Política INSERT: El usuario puede crear documentos para sí mismo
CREATE POLICY "gastos_documentos_insert_policy" 
ON gastos_documentos FOR INSERT
WITH CHECK (
  usuario_id = auth.uid()
);

-- Política UPDATE: El usuario puede actualizar sus propios documentos
CREATE POLICY "gastos_documentos_update_policy" 
ON gastos_documentos FOR UPDATE
USING (
  usuario_id = auth.uid()
);

-- Política DELETE: El usuario puede eliminar sus propios documentos
CREATE POLICY "gastos_documentos_delete_policy" 
ON gastos_documentos FOR DELETE
USING (
  usuario_id = auth.uid()
);

-- =====================================================
-- 3. RECREAR VISTA SIN REFERENCIA A auth.users
-- =====================================================

-- Eliminar vista anterior
DROP VIEW IF EXISTS vista_gastos_documentos;

-- Crear nueva vista sin JOIN a auth.users para evitar problemas de permisos
CREATE OR REPLACE VIEW vista_gastos_documentos AS
SELECT 
  gd.*,
  cg.nombre AS concepto_nombre,
  cg.categoria AS concepto_categoria,
  c.nombre AS caja_nombre,
  -- Calcular días desde emisión
  CURRENT_DATE - gd.fecha_emision AS dias_desde_emision,
  -- Calcular si está vencido
  CASE 
    WHEN gd.fecha_vencimiento IS NOT NULL 
         AND gd.fecha_vencimiento < CURRENT_DATE 
    THEN TRUE 
    ELSE FALSE 
  END AS esta_vencido,
  -- Calcular total en PEN (si es USD, aplicar tipo de cambio)
  CASE 
    WHEN gd.moneda = 'USD' AND gd.tipo_cambio IS NOT NULL 
    THEN gd.total * gd.tipo_cambio
    ELSE gd.total
  END AS total_pen
FROM gastos_documentos gd
LEFT JOIN conceptos_gasto cg ON gd.concepto_gasto_id = cg.id
LEFT JOIN cajas c ON gd.caja_id = c.id;

-- =====================================================
-- 4. VERIFICAR QUE RLS ESTÉ HABILITADO
-- =====================================================

-- Asegurar que RLS está habilitado en la tabla
ALTER TABLE gastos_documentos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$ 
BEGIN 
  RAISE NOTICE 'Políticas RLS actualizadas correctamente para gastos_documentos';
  RAISE NOTICE 'Vista vista_gastos_documentos recreada sin auth.users';
END $$;
