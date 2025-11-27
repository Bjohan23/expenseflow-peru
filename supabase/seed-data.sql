-- =====================================================
-- SEED DATA - Datos iniciales para ExpenseFlow Peru
-- =====================================================

-- NOTA: Este script debe ejecutarse DESPUÉS de crear las tablas y DESPUÉS de fix-rls-policies.sql
-- Los UUIDs generados aquí son válidos y consistentes para mantener las relaciones

-- =====================================================
-- PROFILES - Usuarios de prueba
-- =====================================================
-- IMPORTANTE: Los profiles se crean automáticamente al registrar usuarios en Supabase Auth
-- Este INSERT solo funcionará si el usuario ya existe en auth.users
-- Para crear usuarios de prueba, usa el panel de Supabase o la función de registro

-- Ejemplo de perfiles (usar IDs de usuarios reales de auth.users)
-- INSERT INTO profiles (id, email, full_name, role, is_active) VALUES
-- ('auth-user-id-aqui', 'admin@expenseflow.pe', 'Administrador Sistema', 'admin', true);

-- =====================================================
-- EMPRESAS - Empresas de ejemplo
-- =====================================================
-- NOTA: Si ya insertaste empresas, comenta este bloque

INSERT INTO empresas (id, ruc, razon_social, nombre_comercial, direccion, telefono, email, moneda, limite_gasto_mensual, estado)
VALUES
('e1000000-0000-0000-0000-000000000001', '20123456789', 'CORPORACION ANDINA SAC', 'Corp Andina', 'Av. Javier Prado 1234, San Isidro', '01-4567890', 'contacto@corpandina.pe', 'PEN', 50000.00, 'activo'),
('e1000000-0000-0000-0000-000000000002', '20987654321', 'INVERSIONES DEL SUR EIRL', 'Inv del Sur', 'Calle Los Pinos 567, Miraflores', '01-7654321', 'info@invdelsur.pe', 'PEN', 35000.00, 'activo'),
('e1000000-0000-0000-0000-000000000003', '20555666777', 'COMERCIAL PACIFICO SA', 'Com Pacifico', 'Av. La Marina 890, Pueblo Libre', '01-5556677', 'ventas@compacifico.pe', 'USD', 75000.00, 'activo'),
('e1000000-0000-0000-0000-000000000004', '20111222333', 'SERVICIOS INTEGRALES DEL NORTE SAC', 'Serv Norte', 'Jr. Independencia 234, Trujillo', '044-123456', 'contacto@servnorte.pe', 'PEN', 25000.00, 'activo')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SUCURSALES - Sucursales por empresa
-- =====================================================

-- Sucursales para CORPORACION ANDINA SAC
INSERT INTO sucursales (id, codigo, nombre, empresa_id, direccion, ciudad, region, telefono, estado)
VALUES
('a1000000-0000-0000-0000-000000000001', 'CA-LIM-001', 'Sede Central Lima', 'e1000000-0000-0000-0000-000000000001', 'Av. Javier Prado 1234, San Isidro', 'Lima', 'Lima', '01-4567890', 'activa'),
('a1000000-0000-0000-0000-000000000002', 'CA-CUS-001', 'Sucursal Cusco', 'e1000000-0000-0000-0000-000000000001', 'Av. El Sol 456, Cusco', 'Cusco', 'Cusco', '084-234567', 'activa'),
('a1000000-0000-0000-0000-000000000003', 'CA-ARE-001', 'Sucursal Arequipa', 'e1000000-0000-0000-0000-000000000001', 'Calle Mercaderes 789, Arequipa', 'Arequipa', 'Arequipa', '054-345678', 'activa')
ON CONFLICT (id) DO NOTHING;

-- Sucursales para INVERSIONES DEL SUR EIRL
INSERT INTO sucursales (id, codigo, nombre, empresa_id, direccion, ciudad, region, telefono, estado)
VALUES
('a1000000-0000-0000-0000-000000000004', 'IS-LIM-001', 'Oficina Principal', 'e1000000-0000-0000-0000-000000000002', 'Calle Los Pinos 567, Miraflores', 'Lima', 'Lima', '01-7654321', 'activa'),
('a1000000-0000-0000-0000-000000000005', 'IS-TAC-001', 'Sucursal Tacna', 'e1000000-0000-0000-0000-000000000002', 'Av. Bolognesi 321, Tacna', 'Tacna', 'Tacna', '052-456789', 'activa')
ON CONFLICT (id) DO NOTHING;

-- Sucursales para COMERCIAL PACIFICO SA
INSERT INTO sucursales (id, codigo, nombre, empresa_id, direccion, ciudad, region, telefono, estado)
VALUES
('a1000000-0000-0000-0000-000000000006', 'CP-LIM-001', 'Sede Lima', 'e1000000-0000-0000-0000-000000000003', 'Av. La Marina 890, Pueblo Libre', 'Lima', 'Lima', '01-5556677', 'activa'),
('a1000000-0000-0000-0000-000000000007', 'CP-CAL-001', 'Sucursal Callao', 'e1000000-0000-0000-0000-000000000003', 'Av. Argentina 555, Callao', 'Callao', 'Callao', '01-4445566', 'activa')
ON CONFLICT (id) DO NOTHING;

-- Sucursales para SERVICIOS INTEGRALES DEL NORTE SAC
INSERT INTO sucursales (id, codigo, nombre, empresa_id, direccion, ciudad, region, telefono, estado)
VALUES
('a1000000-0000-0000-0000-000000000008', 'SN-TRU-001', 'Sede Trujillo', 'e1000000-0000-0000-0000-000000000004', 'Jr. Independencia 234, Trujillo', 'Trujillo', 'La Libertad', '044-123456', 'activa'),
('a1000000-0000-0000-0000-000000000009', 'SN-CHI-001', 'Sucursal Chiclayo', 'e1000000-0000-0000-0000-000000000004', 'Av. Balta 678, Chiclayo', 'Chiclayo', 'Lambayeque', '074-234567', 'activa')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- CENTROS DE COSTO
-- =====================================================
-- NOTA: Estos INSERTs necesitan un responsable_id válido
-- Comentado hasta que tengas usuarios reales. Descomenta y reemplaza 'USER-ID-AQUI'

/*
INSERT INTO centros_costo (id, codigo, nombre, descripcion, empresa_id, responsable_id, presupuesto_asignado, presupuesto_consumido, estado)
VALUES
('c0000000-0000-0000-0000-000000000001', 'CC-ADM-001', 'Administración', 'Centro de costo para gastos administrativos', 'e1000000-0000-0000-0000-000000000001', 'USER-ID-AQUI', 15000.00, 3500.00, 'activo'),
('c0000000-0000-0000-0000-000000000002', 'CC-VEN-001', 'Ventas', 'Centro de costo para el área de ventas', 'e1000000-0000-0000-0000-000000000001', 'USER-ID-AQUI', 20000.00, 8500.00, 'activo'),
('c0000000-0000-0000-0000-000000000003', 'CC-OPE-001', 'Operaciones', 'Centro de costo para operaciones', 'e1000000-0000-0000-0000-000000000001', 'USER-ID-AQUI', 25000.00, 12000.00, 'activo'),
('c0000000-0000-0000-0000-000000000004', 'CC-LOG-001', 'Logística', 'Centro de costo para logística', 'e1000000-0000-0000-0000-000000000002', 'USER-ID-AQUI', 18000.00, 7200.00, 'activo'),
('c0000000-0000-0000-0000-000000000005', 'CC-MKT-001', 'Marketing', 'Centro de costo para marketing', 'e1000000-0000-0000-0000-000000000003', 'USER-ID-AQUI', 30000.00, 15000.00, 'activo'),
('c0000000-0000-0000-0000-000000000006', 'CC-TEC-001', 'Tecnología', 'Centro de costo para TI', 'e1000000-0000-0000-0000-000000000004', 'USER-ID-AQUI', 12000.00, 4500.00, 'activo')
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- CONCEPTOS DE GASTO
-- =====================================================
-- Estos no dependen de usuarios, se pueden insertar directamente

INSERT INTO conceptos_gasto (id, codigo, nombre, descripcion, categoria, requiere_aprobacion, limite_maximo, estado)
VALUES
-- Viáticos
('f0000000-0000-0000-0000-000000000001', 'VIA-001', 'Viáticos Nacionales', 'Gastos de viaje dentro del país', 'viaticos', true, 1500.00, 'activo'),
('f0000000-0000-0000-0000-000000000002', 'VIA-002', 'Viáticos Internacionales', 'Gastos de viaje al extranjero', 'viaticos', true, 5000.00, 'activo'),

-- Transporte
('f0000000-0000-0000-0000-000000000003', 'TRA-001', 'Taxi / Uber', 'Servicios de taxi y transporte privado', 'transporte', false, 100.00, 'activo'),
('f0000000-0000-0000-0000-000000000004', 'TRA-002', 'Pasajes Aéreos', 'Boletos de avión', 'transporte', true, 2000.00, 'activo'),
('f0000000-0000-0000-0000-000000000005', 'TRA-003', 'Pasajes Terrestres', 'Boletos de bus interprovincial', 'transporte', false, 200.00, 'activo'),
('f0000000-0000-0000-0000-000000000006', 'TRA-004', 'Combustible', 'Gasolina para vehículos de empresa', 'transporte', false, 500.00, 'activo'),

-- Alimentación
('f0000000-0000-0000-0000-000000000007', 'ALI-001', 'Almuerzo de Trabajo', 'Comidas con clientes o equipo', 'alimentacion', false, 150.00, 'activo'),
('f0000000-0000-0000-0000-000000000008', 'ALI-002', 'Cena de Negocios', 'Cenas con clientes', 'alimentacion', true, 300.00, 'activo'),
('f0000000-0000-0000-0000-000000000009', 'ALI-003', 'Coffee Break', 'Refrigerios para reuniones', 'alimentacion', false, 80.00, 'activo'),

-- Hospedaje
('f000000a-0000-0000-0000-00000000000a', 'HOS-001', 'Hotel Nacional', 'Hospedaje dentro del Perú', 'hospedaje', true, 400.00, 'activo'),
('f000000b-0000-0000-0000-00000000000b', 'HOS-002', 'Hotel Internacional', 'Hospedaje en el extranjero', 'hospedaje', true, 1500.00, 'activo'),

-- Otros
('f000000c-0000-0000-0000-00000000000c', 'OTR-001', 'Útiles de Oficina', 'Materiales de oficina', 'otros', false, 200.00, 'activo'),
('f000000d-0000-0000-0000-00000000000d', 'OTR-002', 'Internet / Telefonía', 'Servicios de comunicación', 'otros', false, 150.00, 'activo'),
('f000000e-0000-0000-0000-00000000000e', 'OTR-003', 'Estacionamiento', 'Pago de estacionamientos', 'otros', false, 50.00, 'activo'),
('f000000f-0000-0000-0000-00000000000f', 'OTR-004', 'Peajes', 'Pago de peajes en carretera', 'otros', false, 30.00, 'activo'),
('f0000010-0000-0000-0000-000000000010', 'OTR-005', 'Capacitación', 'Cursos y talleres', 'otros', true, 2000.00, 'activo'),
('f0000011-0000-0000-0000-000000000011', 'OTR-006', 'Atención a Clientes', 'Obsequios y atenciones', 'otros', false, 300.00, 'activo')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- CAJAS - Cajas chicas por sucursal
-- =====================================================
-- NOTA: Estos INSERTs necesitan un responsable_id válido
-- Comentado hasta que tengas usuarios reales. Descomenta y reemplaza 'USER-ID-AQUI'

/*
INSERT INTO cajas (id, codigo, nombre, sucursal_id, responsable_id, saldo_inicial, saldo_actual, estado, fecha_apertura)
VALUES
-- Cajas para CORPORACION ANDINA SAC
('b0000000-0000-0000-0000-000000000001', 'CJ-CA-LIM-001', 'Caja Chica Lima', 'a1000000-0000-0000-0000-000000000001', 'USER-ID-AQUI', 3000.00, 2450.00, 'abierta', NOW()),
('b0000000-0000-0000-0000-000000000002', 'CJ-CA-CUS-001', 'Caja Chica Cusco', 'a1000000-0000-0000-0000-000000000002', 'USER-ID-AQUI', 2000.00, 1800.00, 'abierta', NOW()),
('b0000000-0000-0000-0000-000000000003', 'CJ-CA-ARE-001', 'Caja Chica Arequipa', 'a1000000-0000-0000-0000-000000000003', 'USER-ID-AQUI', 2000.00, 1650.00, 'abierta', NOW()),

-- Cajas para INVERSIONES DEL SUR EIRL
('b0000000-0000-0000-0000-000000000004', 'CJ-IS-LIM-001', 'Caja Chica Miraflores', 'a1000000-0000-0000-0000-000000000004', 'USER-ID-AQUI', 2500.00, 2100.00, 'abierta', NOW()),
('b0000000-0000-0000-0000-000000000005', 'CJ-IS-TAC-001', 'Caja Chica Tacna', 'a1000000-0000-0000-0000-000000000005', 'USER-ID-AQUI', 1500.00, 1350.00, 'abierta', NOW()),

-- Cajas para COMERCIAL PACIFICO SA
('b0000000-0000-0000-0000-000000000006', 'CJ-CP-LIM-001', 'Caja Chica Pueblo Libre', 'a1000000-0000-0000-0000-000000000006', 'USER-ID-AQUI', 4000.00, 3200.00, 'abierta', NOW()),
('b0000000-0000-0000-0000-000000000007', 'CJ-CP-CAL-001', 'Caja Chica Callao', 'a1000000-0000-0000-0000-000000000007', 'USER-ID-AQUI', 2500.00, 2000.00, 'abierta', NOW()),

-- Cajas para SERVICIOS INTEGRALES DEL NORTE SAC
('b0000000-0000-0000-0000-000000000008', 'CJ-SN-TRU-001', 'Caja Chica Trujillo', 'a1000000-0000-0000-0000-000000000008', 'USER-ID-AQUI', 1800.00, 1500.00, 'abierta', NOW()),
('b0000000-0000-0000-0000-000000000009', 'CJ-SN-CHI-001', 'Caja Chica Chiclayo', 'a1000000-0000-0000-0000-000000000009', 'USER-ID-AQUI', 1500.00, 1200.00, 'abierta', NOW())
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ejecuta estas queries para verificar que todo se insertó correctamente:

-- SELECT COUNT(*) as total_empresas FROM empresas;
-- SELECT COUNT(*) as total_sucursales FROM sucursales;
-- SELECT COUNT(*) as total_conceptos FROM conceptos_gasto;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Este script usa ON CONFLICT (id) DO NOTHING para evitar duplicados
--    Puedes ejecutarlo múltiples veces sin problemas
--
-- 2. Si ya tienes empresas insertadas, el bloque de empresas se omitirá
--
-- 3. Para completar el seed de centros_costo y cajas:
--    a) Primero registra un usuario admin en Supabase Auth
--    b) Obtén su UUID del panel de Supabase (tabla auth.users)
--    c) Reemplaza 'USER-ID-AQUI' con ese UUID
--    d) Descomenta los bloques de centros_costo y cajas
--    e) Ejecuta este script
--
-- 4. Después de poblar los datos, puedes crear relaciones en empresa_usuarios
--    para asignar usuarios a empresas con sus roles correspondientes
