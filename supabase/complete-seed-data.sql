-- =====================================================
-- COMPLETE SEED DATA - Datos completos para desarrollo
-- =====================================================
-- Este archivo incluye TODOS los datos de prueba necesarios
-- para comenzar a trabajar con ExpenseFlow Peru

-- INSTRUCCIONES ANTES DE EJECUTAR:
-- 1. Crea un usuario administrador en Supabase Auth:
--    - Ve a Authentication > Users en Supabase Dashboard
--    - Click en "Add User" > "Create new user"
--    - Email: admin@expenseflow.pe
--    - Password: Admin123!@# (o la que prefieras)
--    - Confirma el email automáticamente
--    - Copia el UUID del usuario creado

-- 2. Reemplaza 'TU-USER-ID-AQUI' en este archivo con el UUID copiado
--    Usa Find & Replace (Ctrl+H) para reemplazar todas las ocurrencias

-- 3. Ejecuta este script completo en SQL Editor de Supabase

-- =====================================================
-- PASO 1: CREAR PROFILE DEL ADMINISTRADOR
-- =====================================================

-- IMPORTANTE: Reemplaza 'TU-USER-ID-AQUI' con el UUID del usuario creado en Supabase Auth
INSERT INTO profiles (id, email, full_name, phone, role, is_active)
VALUES
('TU-USER-ID-AQUI', 'admin@expenseflow.pe', 'Administrador Sistema', '+51 999 888 777', 'admin', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- =====================================================
-- PASO 2: EMPRESAS
-- =====================================================

INSERT INTO empresas (id, ruc, razon_social, nombre_comercial, direccion, telefono, email, moneda, limite_gasto_mensual, estado)
VALUES
('e1000000-0000-0000-0000-000000000001', '20123456789', 'CORPORACION ANDINA SAC', 'Corp Andina', 'Av. Javier Prado 1234, San Isidro', '01-4567890', 'contacto@corpandina.pe', 'PEN', 50000.00, 'activo'),
('e1000000-0000-0000-0000-000000000002', '20987654321', 'INVERSIONES DEL SUR EIRL', 'Inv del Sur', 'Calle Los Pinos 567, Miraflores', '01-7654321', 'info@invdelsur.pe', 'PEN', 35000.00, 'activo'),
('e1000000-0000-0000-0000-000000000003', '20555666777', 'COMERCIAL PACIFICO SA', 'Com Pacifico', 'Av. La Marina 890, Pueblo Libre', '01-5556677', 'ventas@compacifico.pe', 'USD', 75000.00, 'activo'),
('e1000000-0000-0000-0000-000000000004', '20111222333', 'SERVICIOS INTEGRALES DEL NORTE SAC', 'Serv Norte', 'Jr. Independencia 234, Trujillo', '044-123456', 'contacto@servnorte.pe', 'PEN', 25000.00, 'activo')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 3: ASIGNAR ADMIN A TODAS LAS EMPRESAS
-- =====================================================

INSERT INTO empresa_usuarios (empresa_id, user_id, rol_en_empresa)
VALUES
('e1000000-0000-0000-0000-000000000001', 'TU-USER-ID-AQUI', 'admin'),
('e1000000-0000-0000-0000-000000000002', 'TU-USER-ID-AQUI', 'admin'),
('e1000000-0000-0000-0000-000000000003', 'TU-USER-ID-AQUI', 'admin'),
('e1000000-0000-0000-0000-000000000004', 'TU-USER-ID-AQUI', 'admin')
ON CONFLICT (empresa_id, user_id) DO NOTHING;

-- =====================================================
-- PASO 4: SUCURSALES
-- =====================================================

-- Sucursales para CORPORACION ANDINA SAC
INSERT INTO sucursales (id, codigo, nombre, empresa_id, direccion, ciudad, region, telefono, responsable_id, estado)
VALUES
('a1000000-0000-0000-0000-000000000001', 'CA-LIM-001', 'Sede Central Lima', 'e1000000-0000-0000-0000-000000000001', 'Av. Javier Prado 1234, San Isidro', 'Lima', 'Lima', '01-4567890', 'TU-USER-ID-AQUI', 'activa'),
('a1000000-0000-0000-0000-000000000002', 'CA-CUS-001', 'Sucursal Cusco', 'e1000000-0000-0000-0000-000000000001', 'Av. El Sol 456, Cusco', 'Cusco', 'Cusco', '084-234567', 'TU-USER-ID-AQUI', 'activa'),
('a1000000-0000-0000-0000-000000000003', 'CA-ARE-001', 'Sucursal Arequipa', 'e1000000-0000-0000-0000-000000000001', 'Calle Mercaderes 789, Arequipa', 'Arequipa', 'Arequipa', '054-345678', 'TU-USER-ID-AQUI', 'activa')
ON CONFLICT (id) DO NOTHING;

-- Sucursales para INVERSIONES DEL SUR EIRL
INSERT INTO sucursales (id, codigo, nombre, empresa_id, direccion, ciudad, region, telefono, responsable_id, estado)
VALUES
('a1000000-0000-0000-0000-000000000004', 'IS-LIM-001', 'Oficina Principal', 'e1000000-0000-0000-0000-000000000002', 'Calle Los Pinos 567, Miraflores', 'Lima', 'Lima', '01-7654321', 'TU-USER-ID-AQUI', 'activa'),
('a1000000-0000-0000-0000-000000000005', 'IS-TAC-001', 'Sucursal Tacna', 'e1000000-0000-0000-0000-000000000002', 'Av. Bolognesi 321, Tacna', 'Tacna', 'Tacna', '052-456789', 'TU-USER-ID-AQUI', 'activa')
ON CONFLICT (id) DO NOTHING;

-- Sucursales para COMERCIAL PACIFICO SA
INSERT INTO sucursales (id, codigo, nombre, empresa_id, direccion, ciudad, region, telefono, responsable_id, estado)
VALUES
('a1000000-0000-0000-0000-000000000006', 'CP-LIM-001', 'Sede Lima', 'e1000000-0000-0000-0000-000000000003', 'Av. La Marina 890, Pueblo Libre', 'Lima', 'Lima', '01-5556677', 'TU-USER-ID-AQUI', 'activa'),
('a1000000-0000-0000-0000-000000000007', 'CP-CAL-001', 'Sucursal Callao', 'e1000000-0000-0000-0000-000000000003', 'Av. Argentina 555, Callao', 'Callao', 'Callao', '01-4445566', 'TU-USER-ID-AQUI', 'activa')
ON CONFLICT (id) DO NOTHING;

-- Sucursales para SERVICIOS INTEGRALES DEL NORTE SAC
INSERT INTO sucursales (id, codigo, nombre, empresa_id, direccion, ciudad, region, telefono, responsable_id, estado)
VALUES
('a1000000-0000-0000-0000-000000000008', 'SN-TRU-001', 'Sede Trujillo', 'e1000000-0000-0000-0000-000000000004', 'Jr. Independencia 234, Trujillo', 'Trujillo', 'La Libertad', '044-123456', 'TU-USER-ID-AQUI', 'activa'),
('a1000000-0000-0000-0000-000000000009', 'SN-CHI-001', 'Sucursal Chiclayo', 'e1000000-0000-0000-0000-000000000004', 'Av. Balta 678, Chiclayo', 'Chiclayo', 'Lambayeque', '074-234567', 'TU-USER-ID-AQUI', 'activa')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 5: CENTROS DE COSTO
-- =====================================================

INSERT INTO centros_costo (id, codigo, nombre, descripcion, empresa_id, responsable_id, presupuesto_asignado, presupuesto_consumido, estado)
VALUES
('c0000000-0000-0000-0000-000000000001', 'CC-ADM-001', 'Administración', 'Centro de costo para gastos administrativos', 'e1000000-0000-0000-0000-000000000001', 'TU-USER-ID-AQUI', 15000.00, 3500.00, 'activo'),
('c0000000-0000-0000-0000-000000000002', 'CC-VEN-001', 'Ventas', 'Centro de costo para el área de ventas', 'e1000000-0000-0000-0000-000000000001', 'TU-USER-ID-AQUI', 20000.00, 8500.00, 'activo'),
('c0000000-0000-0000-0000-000000000003', 'CC-OPE-001', 'Operaciones', 'Centro de costo para operaciones', 'e1000000-0000-0000-0000-000000000001', 'TU-USER-ID-AQUI', 25000.00, 12000.00, 'activo'),
('c0000000-0000-0000-0000-000000000004', 'CC-LOG-001', 'Logística', 'Centro de costo para logística', 'e1000000-0000-0000-0000-000000000002', 'TU-USER-ID-AQUI', 18000.00, 7200.00, 'activo'),
('c0000000-0000-0000-0000-000000000005', 'CC-MKT-001', 'Marketing', 'Centro de costo para marketing', 'e1000000-0000-0000-0000-000000000003', 'TU-USER-ID-AQUI', 30000.00, 15000.00, 'activo'),
('c0000000-0000-0000-0000-000000000006', 'CC-TEC-001', 'Tecnología', 'Centro de costo para TI', 'e1000000-0000-0000-0000-000000000004', 'TU-USER-ID-AQUI', 12000.00, 4500.00, 'activo')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 6: CONCEPTOS DE GASTO
-- =====================================================

INSERT INTO conceptos_gasto (id, codigo, nombre, descripcion, categoria, centro_costo_id, requiere_aprobacion, limite_maximo, estado)
VALUES
-- Viáticos
('f0000000-0000-0000-0000-000000000001', 'VIA-001', 'Viáticos Nacionales', 'Gastos de viaje dentro del país', 'viaticos', NULL, true, 1500.00, 'activo'),
('f0000000-0000-0000-0000-000000000002', 'VIA-002', 'Viáticos Internacionales', 'Gastos de viaje al extranjero', 'viaticos', NULL, true, 5000.00, 'activo'),

-- Transporte
('f0000000-0000-0000-0000-000000000003', 'TRA-001', 'Taxi / Uber', 'Servicios de taxi y transporte privado', 'transporte', NULL, false, 100.00, 'activo'),
('f0000000-0000-0000-0000-000000000004', 'TRA-002', 'Pasajes Aéreos', 'Boletos de avión', 'transporte', NULL, true, 2000.00, 'activo'),
('f0000000-0000-0000-0000-000000000005', 'TRA-003', 'Pasajes Terrestres', 'Boletos de bus interprovincial', 'transporte', NULL, false, 200.00, 'activo'),
('f0000000-0000-0000-0000-000000000006', 'TRA-004', 'Combustible', 'Gasolina para vehículos de empresa', 'transporte', 'c0000000-0000-0000-0000-000000000003', false, 500.00, 'activo'),

-- Alimentación
('f0000000-0000-0000-0000-000000000007', 'ALI-001', 'Almuerzo de Trabajo', 'Comidas con clientes o equipo', 'alimentacion', 'c0000000-0000-0000-0000-000000000002', false, 150.00, 'activo'),
('f0000000-0000-0000-0000-000000000008', 'ALI-002', 'Cena de Negocios', 'Cenas con clientes', 'alimentacion', 'c0000000-0000-0000-0000-000000000002', true, 300.00, 'activo'),
('f0000000-0000-0000-0000-000000000009', 'ALI-003', 'Coffee Break', 'Refrigerios para reuniones', 'alimentacion', NULL, false, 80.00, 'activo'),

-- Hospedaje
('f000000a-0000-0000-0000-00000000000a', 'HOS-001', 'Hotel Nacional', 'Hospedaje dentro del Perú', 'hospedaje', NULL, true, 400.00, 'activo'),
('f000000b-0000-0000-0000-00000000000b', 'HOS-002', 'Hotel Internacional', 'Hospedaje en el extranjero', 'hospedaje', NULL, true, 1500.00, 'activo'),

-- Otros
('f000000c-0000-0000-0000-00000000000c', 'OTR-001', 'Útiles de Oficina', 'Materiales de oficina', 'otros', 'c0000000-0000-0000-0000-000000000001', false, 200.00, 'activo'),
('f000000d-0000-0000-0000-00000000000d', 'OTR-002', 'Internet / Telefonía', 'Servicios de comunicación', 'otros', 'c0000000-0000-0000-0000-000000000006', false, 150.00, 'activo'),
('f000000e-0000-0000-0000-00000000000e', 'OTR-003', 'Estacionamiento', 'Pago de estacionamientos', 'otros', NULL, false, 50.00, 'activo'),
('f000000f-0000-0000-0000-00000000000f', 'OTR-004', 'Peajes', 'Pago de peajes en carretera', 'otros', NULL, false, 30.00, 'activo'),
('f0000010-0000-0000-0000-000000000010', 'OTR-005', 'Capacitación', 'Cursos y talleres', 'otros', NULL, true, 2000.00, 'activo'),
('f0000011-0000-0000-0000-000000000011', 'OTR-006', 'Atención a Clientes', 'Obsequios y atenciones', 'otros', 'c0000000-0000-0000-0000-000000000005', false, 300.00, 'activo')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 7: CAJAS CHICAS
-- =====================================================

INSERT INTO cajas (id, codigo, nombre, sucursal_id, responsable_id, saldo_inicial, saldo_actual, estado, fecha_apertura)
VALUES
-- Cajas para CORPORACION ANDINA SAC
('b0000000-0000-0000-0000-000000000001', 'CJ-CA-LIM-001', 'Caja Chica Lima', 'a1000000-0000-0000-0000-000000000001', 'TU-USER-ID-AQUI', 3000.00, 2450.00, 'abierta', NOW()),
('b0000000-0000-0000-0000-000000000002', 'CJ-CA-CUS-001', 'Caja Chica Cusco', 'a1000000-0000-0000-0000-000000000002', 'TU-USER-ID-AQUI', 2000.00, 1800.00, 'abierta', NOW()),
('b0000000-0000-0000-0000-000000000003', 'CJ-CA-ARE-001', 'Caja Chica Arequipa', 'a1000000-0000-0000-0000-000000000003', 'TU-USER-ID-AQUI', 2000.00, 1650.00, 'abierta', NOW()),

-- Cajas para INVERSIONES DEL SUR EIRL
('b0000000-0000-0000-0000-000000000004', 'CJ-IS-LIM-001', 'Caja Chica Miraflores', 'a1000000-0000-0000-0000-000000000004', 'TU-USER-ID-AQUI', 2500.00, 2100.00, 'abierta', NOW()),
('b0000000-0000-0000-0000-000000000005', 'CJ-IS-TAC-001', 'Caja Chica Tacna', 'a1000000-0000-0000-0000-000000000005', 'TU-USER-ID-AQUI', 1500.00, 1350.00, 'abierta', NOW()),

-- Cajas para COMERCIAL PACIFICO SA
('b0000000-0000-0000-0000-000000000006', 'CJ-CP-LIM-001', 'Caja Chica Pueblo Libre', 'a1000000-0000-0000-0000-000000000006', 'TU-USER-ID-AQUI', 4000.00, 3200.00, 'abierta', NOW()),
('b0000000-0000-0000-0000-000000000007', 'CJ-CP-CAL-001', 'Caja Chica Callao', 'a1000000-0000-0000-0000-000000000007', 'TU-USER-ID-AQUI', 2500.00, 2000.00, 'abierta', NOW()),

-- Cajas para SERVICIOS INTEGRALES DEL NORTE SAC
('b0000000-0000-0000-0000-000000000008', 'CJ-SN-TRU-001', 'Caja Chica Trujillo', 'a1000000-0000-0000-0000-000000000008', 'TU-USER-ID-AQUI', 1800.00, 1500.00, 'abierta', NOW()),
('b0000000-0000-0000-0000-000000000009', 'CJ-SN-CHI-001', 'Caja Chica Chiclayo', 'a1000000-0000-0000-0000-000000000009', 'TU-USER-ID-AQUI', 1500.00, 1200.00, 'abierta', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
  total_empresas INT;
  total_sucursales INT;
  total_centros INT;
  total_conceptos INT;
  total_cajas INT;
  total_usuarios INT;
BEGIN
  SELECT COUNT(*) INTO total_empresas FROM empresas;
  SELECT COUNT(*) INTO total_sucursales FROM sucursales;
  SELECT COUNT(*) INTO total_centros FROM centros_costo;
  SELECT COUNT(*) INTO total_conceptos FROM conceptos_gasto;
  SELECT COUNT(*) INTO total_cajas FROM cajas;
  SELECT COUNT(*) INTO total_usuarios FROM empresa_usuarios;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED DATA COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Empresas creadas: %', total_empresas;
  RAISE NOTICE 'Sucursales creadas: %', total_sucursales;
  RAISE NOTICE 'Centros de Costo creados: %', total_centros;
  RAISE NOTICE 'Conceptos de Gasto creados: %', total_conceptos;
  RAISE NOTICE 'Cajas Chicas creadas: %', total_cajas;
  RAISE NOTICE 'Asignaciones Empresa-Usuario: %', total_usuarios;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Usuario Admin: admin@expenseflow.pe';
  RAISE NOTICE 'Puedes iniciar sesión con este usuario';
  RAISE NOTICE '========================================';
END $$;
