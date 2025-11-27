-- =====================================================
-- POLÍTICAS RLS MEJORADAS - Con control por empresa y rol
-- =====================================================
-- Este archivo reemplaza las políticas permisivas con
-- políticas que filtran por empresa y validan roles

-- =====================================================
-- ELIMINAR POL ÍTICAS EXISTENTES
-- =====================================================

-- Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- Empresas
DROP POLICY IF EXISTS "empresas_select_authenticated" ON empresas;
DROP POLICY IF EXISTS "empresas_insert_authenticated" ON empresas;
DROP POLICY IF EXISTS "empresas_update_authenticated" ON empresas;
DROP POLICY IF EXISTS "empresas_delete_authenticated" ON empresas;

-- Empresa Usuarios
DROP POLICY IF EXISTS "empresa_usuarios_select_own" ON empresa_usuarios;
DROP POLICY IF EXISTS "empresa_usuarios_insert_authenticated" ON empresa_usuarios;
DROP POLICY IF EXISTS "empresa_usuarios_update_authenticated" ON empresa_usuarios;

-- Sucursales
DROP POLICY IF EXISTS "sucursales_select_authenticated" ON sucursales;
DROP POLICY IF EXISTS "sucursales_insert_authenticated" ON sucursales;
DROP POLICY IF EXISTS "sucursales_update_authenticated" ON sucursales;
DROP POLICY IF EXISTS "sucursales_delete_authenticated" ON sucursales;

-- Centros de Costo
DROP POLICY IF EXISTS "centros_costo_select_authenticated" ON centros_costo;
DROP POLICY IF EXISTS "centros_costo_insert_authenticated" ON centros_costo;
DROP POLICY IF EXISTS "centros_costo_update_authenticated" ON centros_costo;
DROP POLICY IF EXISTS "centros_costo_delete_authenticated" ON centros_costo;

-- Conceptos de Gasto
DROP POLICY IF EXISTS "conceptos_gasto_select_authenticated" ON conceptos_gasto;
DROP POLICY IF EXISTS "conceptos_gasto_insert_authenticated" ON conceptos_gasto;
DROP POLICY IF EXISTS "conceptos_gasto_update_authenticated" ON conceptos_gasto;
DROP POLICY IF EXISTS "conceptos_gasto_delete_authenticated" ON conceptos_gasto;

-- Cajas
DROP POLICY IF EXISTS "cajas_select_authenticated" ON cajas;
DROP POLICY IF EXISTS "cajas_insert_authenticated" ON cajas;
DROP POLICY IF EXISTS "cajas_update_authenticated" ON cajas;
DROP POLICY IF EXISTS "cajas_delete_authenticated" ON cajas;

-- Auditoría
DROP POLICY IF EXISTS "auditoria_select_authenticated" ON auditoria;
DROP POLICY IF EXISTS "auditoria_insert_authenticated" ON auditoria;

-- =====================================================
-- HELPER FUNCTION - Verificar si usuario es admin
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES - Solo perfil propio
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Ver todos los perfiles si eres admin, solo el tuyo si no
CREATE POLICY "profiles_select_policy"
ON profiles FOR SELECT
USING (
  auth.uid() = id OR is_admin()
);

-- Actualizar solo tu perfil
CREATE POLICY "profiles_update_policy"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Insertar solo tu perfil (durante registro)
CREATE POLICY "profiles_insert_policy"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- EMPRESAS - Con control de roles
-- =====================================================

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Ver todas las empresas (necesario para selectors)
CREATE POLICY "empresas_select_policy"
ON empresas FOR SELECT
USING (auth.role() = 'authenticated');

-- Solo admins pueden crear empresas
CREATE POLICY "empresas_insert_policy"
ON empresas FOR INSERT
WITH CHECK (is_admin());

-- Solo admins pueden actualizar empresas
CREATE POLICY "empresas_update_policy"
ON empresas FOR UPDATE
USING (is_admin());

-- Solo admins pueden eliminar empresas
CREATE POLICY "empresas_delete_policy"
ON empresas FOR DELETE
USING (is_admin());

-- =====================================================
-- EMPRESA_USUARIOS - Gestión de asignaciones
-- =====================================================

ALTER TABLE empresa_usuarios ENABLE ROW LEVEL SECURITY;

-- Ver tus empresas asignadas o todas si eres admin
CREATE POLICY "empresa_usuarios_select_policy"
ON empresa_usuarios FOR SELECT
USING (
  auth.uid() = user_id OR is_admin()
);

-- Solo admins pueden asignar usuarios a empresas
CREATE POLICY "empresa_usuarios_insert_policy"
ON empresa_usuarios FOR INSERT
WITH CHECK (is_admin());

-- Solo admins pueden modificar asignaciones
CREATE POLICY "empresa_usuarios_update_policy"
ON empresa_usuarios FOR UPDATE
USING (is_admin());

-- Solo admins pueden eliminar asignaciones
CREATE POLICY "empresa_usuarios_delete_policy"
ON empresa_usuarios FOR DELETE
USING (is_admin());

-- =====================================================
-- SUCURSALES - Filtradas por empresa del usuario
-- =====================================================

ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;

-- Ver sucursales de empresas a las que perteneces
CREATE POLICY "sucursales_select_policy"
ON sucursales FOR SELECT
USING (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM empresa_usuarios
    WHERE empresa_usuarios.empresa_id = sucursales.empresa_id
      AND empresa_usuarios.user_id = auth.uid()
  )
);

-- Crear sucursales solo si perteneces a la empresa o eres admin
CREATE POLICY "sucursales_insert_policy"
ON sucursales FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM empresa_usuarios
    WHERE empresa_usuarios.empresa_id = sucursales.empresa_id
      AND empresa_usuarios.user_id = auth.uid()
  )
);

-- Actualizar sucursales de tus empresas o si eres admin
CREATE POLICY "sucursales_update_policy"
ON sucursales FOR UPDATE
USING (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM empresa_usuarios
    WHERE empresa_usuarios.empresa_id = sucursales.empresa_id
      AND empresa_usuarios.user_id = auth.uid()
  )
);

-- Solo admins pueden eliminar sucursales
CREATE POLICY "sucursales_delete_policy"
ON sucursales FOR DELETE
USING (is_admin());

-- =====================================================
-- CENTROS_COSTO - Filtrados por empresa del usuario
-- =====================================================

ALTER TABLE centros_costo ENABLE ROW LEVEL SECURITY;

-- Ver centros de costo de empresas a las que perteneces
CREATE POLICY "centros_costo_select_policy"
ON centros_costo FOR SELECT
USING (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM empresa_usuarios
    WHERE empresa_usuarios.empresa_id = centros_costo.empresa_id
      AND empresa_usuarios.user_id = auth.uid()
  )
);

-- Crear centros de costo solo si perteneces a la empresa o eres admin
CREATE POLICY "centros_costo_insert_policy"
ON centros_costo FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM empresa_usuarios
    WHERE empresa_usuarios.empresa_id = centros_costo.empresa_id
      AND empresa_usuarios.user_id = auth.uid()
  )
);

-- Actualizar centros de costo de tus empresas o si eres admin
CREATE POLICY "centros_costo_update_policy"
ON centros_costo FOR UPDATE
USING (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM empresa_usuarios
    WHERE empresa_usuarios.empresa_id = centros_costo.empresa_id
      AND empresa_usuarios.user_id = auth.uid()
  )
);

-- Solo admins pueden eliminar centros de costo
CREATE POLICY "centros_costo_delete_policy"
ON centros_costo FOR DELETE
USING (is_admin());

-- =====================================================
-- CONCEPTOS_GASTO - Todos pueden ver, admins gestionan
-- =====================================================

ALTER TABLE conceptos_gasto ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver conceptos de gasto
CREATE POLICY "conceptos_gasto_select_policy"
ON conceptos_gasto FOR SELECT
USING (auth.role() = 'authenticated');

-- Solo admins pueden crear conceptos de gasto
CREATE POLICY "conceptos_gasto_insert_policy"
ON conceptos_gasto FOR INSERT
WITH CHECK (is_admin());

-- Solo admins pueden actualizar conceptos de gasto
CREATE POLICY "conceptos_gasto_update_policy"
ON conceptos_gasto FOR UPDATE
USING (is_admin());

-- Solo admins pueden eliminar conceptos de gasto
CREATE POLICY "conceptos_gasto_delete_policy"
ON conceptos_gasto FOR DELETE
USING (is_admin());

-- =====================================================
-- CAJAS - Filtradas por sucursal/empresa del usuario
-- =====================================================

ALTER TABLE cajas ENABLE ROW LEVEL SECURITY;

-- Ver cajas de sucursales de tus empresas
CREATE POLICY "cajas_select_policy"
ON cajas FOR SELECT
USING (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM sucursales s
    JOIN empresa_usuarios eu ON s.empresa_id = eu.empresa_id
    WHERE s.id = cajas.sucursal_id
      AND eu.user_id = auth.uid()
  )
);

-- Crear cajas solo si perteneces a la empresa de la sucursal
CREATE POLICY "cajas_insert_policy"
ON cajas FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM sucursales s
    JOIN empresa_usuarios eu ON s.empresa_id = eu.empresa_id
    WHERE s.id = cajas.sucursal_id
      AND eu.user_id = auth.uid()
  )
);

-- Actualizar cajas si eres responsable, perteneces a la empresa o eres admin
CREATE POLICY "cajas_update_policy"
ON cajas FOR UPDATE
USING (
  is_admin() OR
  auth.uid() = cajas.responsable_id OR
  EXISTS (
    SELECT 1 FROM sucursales s
    JOIN empresa_usuarios eu ON s.empresa_id = eu.empresa_id
    WHERE s.id = cajas.sucursal_id
      AND eu.user_id = auth.uid()
  )
);

-- Solo admins pueden eliminar cajas
CREATE POLICY "cajas_delete_policy"
ON cajas FOR DELETE
USING (is_admin());

-- =====================================================
-- AUDITORÍA - Solo admins pueden ver
-- =====================================================

ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver auditoría
CREATE POLICY "auditoria_select_policy"
ON auditoria FOR SELECT
USING (is_admin());

-- Todos pueden insertar en auditoría (para tracking)
CREATE POLICY "auditoria_insert_policy"
ON auditoria FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Nadie puede actualizar auditoría (inmutable)
-- No se crea política de UPDATE

-- Nadie puede eliminar auditoría (histórico permanente)
-- No se crea política de DELETE

-- =====================================================
-- COMENTARIOS Y NOTAS
-- =====================================================

-- IMPORTANTE:
-- 1. Estas políticas filtran datos por empresa usando la tabla empresa_usuarios
-- 2. Solo los administradores pueden:
--    - Crear/editar/eliminar empresas
--    - Asignar usuarios a empresas
--    - Eliminar cualquier registro
-- 3. Los usuarios solo pueden ver y gestionar datos de sus empresas asignadas
-- 4. Los responsables de cajas pueden actualizarlas (para cierre)
-- 5. La auditoría es inmutable y solo visible para admins

-- Para aplicar estas políticas, ejecuta este archivo en tu base de datos Supabase:
-- 1. Ve a SQL Editor en Supabase Dashboard
-- 2. Copia y pega este contenido
-- 3. Ejecuta el script
-- 4. Verifica que no haya errores

-- Verificación:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
