-- Script para corregir la restricción del campo role en profiles

-- 1. Ver la restricción actual
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND contype = 'c';

-- 2. Eliminar la restricción antigua
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. Crear la nueva restricción con TODOS los roles
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('superadmin', 'administrador', 'gerente', 'colaborador', 'contador'));

-- 4. Verificar que se aplicó correctamente
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND contype = 'c';

-- 5. Ahora sí, actualizar tu usuario
UPDATE profiles
SET role = 'administrador'
WHERE id = '32dcb51c-0fc4-402e-bc96-43e392d057ca';

-- 6. Verificar el cambio
SELECT id, email, full_name, role, is_active
FROM profiles
WHERE id = '32dcb51c-0fc4-402e-bc96-43e392d057ca';

-- 7. Ver todos los usuarios y sus roles
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles
ORDER BY created_at DESC;
