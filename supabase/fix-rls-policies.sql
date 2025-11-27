-- =====================================================
-- FIX RLS POLICIES - Eliminar recursión infinita
-- =====================================================

-- Eliminar todas las políticas existentes que causan recursión
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

DROP POLICY IF EXISTS "Enable read access for all users" ON empresas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON empresas;
DROP POLICY IF EXISTS "Enable update for users based on company access" ON empresas;

DROP POLICY IF EXISTS "Enable read access for all users" ON sucursales;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sucursales;
DROP POLICY IF EXISTS "Enable update for users based on company access" ON sucursales;

DROP POLICY IF EXISTS "Enable read access for all users" ON centros_costo;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON centros_costo;
DROP POLICY IF EXISTS "Enable update for users based on company access" ON centros_costo;

DROP POLICY IF EXISTS "Enable read access for all users" ON conceptos_gasto;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON conceptos_gasto;

DROP POLICY IF EXISTS "Enable read access for all users" ON cajas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON cajas;

DROP POLICY IF EXISTS "Enable read access for all users" ON empresa_usuarios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON empresa_usuarios;

DROP POLICY IF EXISTS "Enable read access for all users" ON auditoria;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON auditoria;

-- =====================================================
-- PROFILES - Políticas simples sin recursión
-- =====================================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Permitir insert para nuevos usuarios (durante registro)
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- EMPRESAS - Solo usuarios autenticados
-- =====================================================

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver empresas
CREATE POLICY "empresas_select_authenticated"
ON empresas FOR SELECT
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede crear empresas
CREATE POLICY "empresas_insert_authenticated"
ON empresas FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede actualizar empresas
CREATE POLICY "empresas_update_authenticated"
ON empresas FOR UPDATE
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede eliminar empresas
CREATE POLICY "empresas_delete_authenticated"
ON empresas FOR DELETE
USING (auth.role() = 'authenticated');

-- =====================================================
-- EMPRESA_USUARIOS - Relación empresa-usuario
-- =====================================================

ALTER TABLE empresa_usuarios ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propias asignaciones
CREATE POLICY "empresa_usuarios_select_own"
ON empresa_usuarios FOR SELECT
USING (auth.uid() = user_id);

-- Usuarios autenticados pueden insertar asignaciones
CREATE POLICY "empresa_usuarios_insert_authenticated"
ON empresa_usuarios FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Usuarios autenticados pueden actualizar asignaciones
CREATE POLICY "empresa_usuarios_update_authenticated"
ON empresa_usuarios FOR UPDATE
USING (auth.role() = 'authenticated');

-- =====================================================
-- SUCURSALES
-- =====================================================

ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver sucursales
CREATE POLICY "sucursales_select_authenticated"
ON sucursales FOR SELECT
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede crear sucursales
CREATE POLICY "sucursales_insert_authenticated"
ON sucursales FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede actualizar sucursales
CREATE POLICY "sucursales_update_authenticated"
ON sucursales FOR UPDATE
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede eliminar sucursales
CREATE POLICY "sucursales_delete_authenticated"
ON sucursales FOR DELETE
USING (auth.role() = 'authenticated');

-- =====================================================
-- CENTROS_COSTO
-- =====================================================

ALTER TABLE centros_costo ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver centros de costo
CREATE POLICY "centros_costo_select_authenticated"
ON centros_costo FOR SELECT
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede crear centros de costo
CREATE POLICY "centros_costo_insert_authenticated"
ON centros_costo FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede actualizar centros de costo
CREATE POLICY "centros_costo_update_authenticated"
ON centros_costo FOR UPDATE
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede eliminar centros de costo
CREATE POLICY "centros_costo_delete_authenticated"
ON centros_costo FOR DELETE
USING (auth.role() = 'authenticated');

-- =====================================================
-- CONCEPTOS_GASTO
-- =====================================================

ALTER TABLE conceptos_gasto ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver conceptos de gasto
CREATE POLICY "conceptos_gasto_select_authenticated"
ON conceptos_gasto FOR SELECT
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede crear conceptos de gasto
CREATE POLICY "conceptos_gasto_insert_authenticated"
ON conceptos_gasto FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede actualizar conceptos de gasto
CREATE POLICY "conceptos_gasto_update_authenticated"
ON conceptos_gasto FOR UPDATE
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede eliminar conceptos de gasto
CREATE POLICY "conceptos_gasto_delete_authenticated"
ON conceptos_gasto FOR DELETE
USING (auth.role() = 'authenticated');

-- =====================================================
-- CAJAS
-- =====================================================

ALTER TABLE cajas ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver cajas
CREATE POLICY "cajas_select_authenticated"
ON cajas FOR SELECT
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede crear cajas
CREATE POLICY "cajas_insert_authenticated"
ON cajas FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede actualizar cajas
CREATE POLICY "cajas_update_authenticated"
ON cajas FOR UPDATE
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede eliminar cajas
CREATE POLICY "cajas_delete_authenticated"
ON cajas FOR DELETE
USING (auth.role() = 'authenticated');

-- =====================================================
-- AUDITORIA
-- =====================================================

ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver auditoría
CREATE POLICY "auditoria_select_authenticated"
ON auditoria FOR SELECT
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede crear registros de auditoría
CREATE POLICY "auditoria_insert_authenticated"
ON auditoria FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
