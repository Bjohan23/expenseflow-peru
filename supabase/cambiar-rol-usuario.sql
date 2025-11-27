-- Script para cambiar el rol de un usuario a administrador
-- Ejecuta este script en Supabase SQL Editor

-- IMPORTANTE: Si obtienes error "profiles_role_check", ejecuta primero fix-role-constraint.sql

-- 1. Ver todos los usuarios actuales
SELECT id, email, full_name, role, is_active
FROM profiles
ORDER BY created_at DESC;

-- 2. Cambiar el rol de tu usuario actual a 'administrador'
-- Reemplaza 'tu-email@gmail.com' con tu email real
UPDATE profiles
SET role = 'administrador'
WHERE email = 'borisatalaya10@gmail.com';

-- Si prefieres hacerlo por ID (más seguro):
-- Reemplaza 'UUID-AQUI' con tu ID de usuario
/*
UPDATE profiles
SET role = 'administrador'
WHERE id = '32dcb51c-0fc4-402e-bc96-43e392d057ca';
*/

-- 3. Verificar el cambio
SELECT 
  id, 
  email, 
  full_name, 
  role, 
  is_active,
  created_at
FROM profiles
WHERE email = 'borisatalaya10@gmail.com';

-- 4. Si necesitas cambiar a super admin:
/*
UPDATE profiles
SET role = 'superadmin'
WHERE email = 'borisatalaya10@gmail.com';
*/

-- 5. Ver todos los roles disponibles en el sistema:
-- superadmin - Acceso total al sistema
-- administrador - Gestión completa
-- gerente - Supervisión
-- colaborador - Uso operativo
-- contador - Revisión contable

-- 6. Cambiar múltiples usuarios a la vez (ejemplo):
/*
UPDATE profiles
SET role = 'administrador'
WHERE email IN ('user1@gmail.com', 'user2@gmail.com');
*/

-- 7. Verificar cambios finales
SELECT 
  email,
  full_name,
  role,
  is_active,
  CASE 
    WHEN role = 'superadmin' THEN '🔴 Super Admin - Acceso Total'
    WHEN role = 'administrador' THEN '🟠 Administrador - Gestión Completa'
    WHEN role = 'gerente' THEN '🟡 Gerente - Supervisión'
    WHEN role = 'colaborador' THEN '🟢 Colaborador - Uso Operativo'
    WHEN role = 'contador' THEN '🔵 Contador - Revisión Contable'
    ELSE '⚪ Sin rol definido'
  END as descripcion_rol
FROM profiles
ORDER BY 
  CASE role
    WHEN 'superadmin' THEN 1
    WHEN 'administrador' THEN 2
    WHEN 'gerente' THEN 3
    WHEN 'contador' THEN 4
    WHEN 'colaborador' THEN 5
    ELSE 6
  END;
