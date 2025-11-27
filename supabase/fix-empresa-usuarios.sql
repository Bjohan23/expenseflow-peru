-- Script para verificar y corregir datos de empresa_usuarios

-- 1. Verificar registros existentes
SELECT 
  eu.id,
  eu.empresa_id,
  eu.usuario_id,
  eu.rol,
  eu.estado,
  e.razon_social as empresa,
  p.full_name as usuario,
  p.email
FROM empresa_usuarios eu
LEFT JOIN empresas e ON e.id = eu.empresa_id
LEFT JOIN profiles p ON p.id = eu.usuario_id
ORDER BY eu.created_at DESC;

-- 2. Actualizar registros sin rol (asignarles 'empleado' por defecto)
UPDATE empresa_usuarios
SET rol = 'empleado'
WHERE rol IS NULL;

-- 3. Activar registros inactivos si es necesario
UPDATE empresa_usuarios
SET estado = 'activo'
WHERE estado = 'inactivo';

-- 4. Verificar que todos los usuarios tengan perfil
SELECT 
  au.id as auth_user_id,
  au.email,
  p.id as profile_id,
  p.full_name,
  p.role,
  p.is_active
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.created_at DESC;

-- 5. Crear perfiles faltantes (si los hay)
-- Este INSERT se ejecutará solo si hay usuarios sin perfil
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  'colaborador',
  true
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 6. Insertar asignaciones de ejemplo (ajusta los IDs según tu base de datos)
-- Primero obtén los IDs disponibles ejecutando:
-- SELECT id, razon_social FROM empresas WHERE estado = 'activo';
-- SELECT id, full_name, email FROM profiles WHERE is_active = true;

-- Ejemplo de inserción (reemplaza los UUIDs con tus IDs reales):
/*
INSERT INTO empresa_usuarios (empresa_id, usuario_id, rol, estado)
VALUES 
  ('UUID-EMPRESA-1', 'UUID-USUARIO-1', 'administrador', 'activo'),
  ('UUID-EMPRESA-2', 'UUID-USUARIO-1', 'gerente', 'activo'),
  ('UUID-EMPRESA-1', 'UUID-USUARIO-2', 'empleado', 'activo')
ON CONFLICT DO NOTHING;
*/

-- 7. Verificar el resultado final
SELECT 
  eu.id,
  e.nombre_comercial || ' (' || e.razon_social || ')' as empresa,
  p.full_name as usuario,
  p.email,
  eu.rol,
  eu.estado,
  eu.created_at
FROM empresa_usuarios eu
JOIN empresas e ON e.id = eu.empresa_id
JOIN profiles p ON p.id = eu.usuario_id
ORDER BY eu.created_at DESC;
