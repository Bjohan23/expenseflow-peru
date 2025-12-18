-- =====================================================
-- ACTUALIZACIÓN DE SISTEMA DE ROLES Y PERMISOS
-- =====================================================

BEGIN;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;

-- Crear el trigger
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Asegurar que los permisos estén insertados
INSERT INTO permisos (modulo, accion, descripcion) VALUES
  ('gastos', 'pagar', 'Registrar pagos'),
  ('usuarios', 'asignar_rol', 'Asignar roles a usuarios'),
  ('dashboard', 'ver_avanzado', 'Ver métricas avanzadas')
ON CONFLICT (modulo, accion) DO NOTHING;

-- Actualizar permisos de roles

-- GERENTE: Agregar permisos de pago
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'gerente'
  AND p.modulo = 'gastos'
  AND p.accion = 'pagar'
ON CONFLICT DO NOTHING;

-- CONTADOR: Asegurar permisos de lectura y pago
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'contador'
  AND (
    (p.modulo = 'gastos' AND p.accion IN ('leer_todos', 'pagar'))
    OR (p.modulo = 'reportes')
  )
ON CONFLICT DO NOTHING;

COMMIT;

SELECT 'Sistema de roles actualizado correctamente' as status;
