-- Migración: Actualizar restricción de roles en profiles
-- Fecha: 2025-11-27
-- Descripción: Agregar todos los roles del sistema a la restricción CHECK

BEGIN;

-- 1. Eliminar la restricción antigua (si existe)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check' 
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
    RAISE NOTICE 'Restricción antigua eliminada';
  END IF;
END $$;

-- 2. Crear la nueva restricción con TODOS los roles
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
  'superadmin',     -- Acceso total al sistema
  'administrador',  -- Gestión completa
  'gerente',        -- Supervisión
  'colaborador',    -- Uso operativo (por defecto)
  'contador'        -- Revisión contable
));

-- 3. Actualizar usuarios sin rol válido (si los hay)
UPDATE profiles
SET role = 'colaborador'
WHERE role NOT IN ('superadmin', 'administrador', 'gerente', 'colaborador', 'contador')
   OR role IS NULL;

-- 4. Verificar la restricción
DO $$ 
DECLARE
  constraint_def TEXT;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO constraint_def
  FROM pg_constraint
  WHERE conname = 'profiles_role_check'
    AND conrelid = 'profiles'::regclass;
  
  RAISE NOTICE 'Nueva restricción: %', constraint_def;
END $$;

COMMIT;

-- 5. Verificar que todo está correcto
SELECT 
  'Restricción actualizada correctamente' as status,
  count(*) as total_usuarios,
  count(*) FILTER (WHERE role = 'colaborador') as colaboradores,
  count(*) FILTER (WHERE role = 'administrador') as administradores,
  count(*) FILTER (WHERE role = 'gerente') as gerentes,
  count(*) FILTER (WHERE role = 'contador') as contadores,
  count(*) FILTER (WHERE role = 'superadmin') as superadmins
FROM profiles;
