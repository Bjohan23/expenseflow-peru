-- =====================================================
-- Migration: Sistema de Gestión de Gastos
-- Fecha: 2025-11-27
-- Descripción: Crea tabla para registrar gastos con flujo de aprobación,
--              vinculación con conceptos, cajas y documentos OCR
-- =====================================================

-- =====================================================
-- 1. CREAR TABLA gastos
-- =====================================================

CREATE TABLE IF NOT EXISTS gastos (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL, -- Código único del gasto (ej: GAS-2025-001)
  
  -- Relaciones
  concepto_gasto_id UUID NOT NULL REFERENCES conceptos_gasto(id) ON DELETE RESTRICT,
  caja_id UUID REFERENCES cajas(id) ON DELETE SET NULL,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  documento_id UUID REFERENCES gastos_documentos(id) ON DELETE SET NULL,
  centro_costo_id UUID REFERENCES centros_costo(id) ON DELETE SET NULL,
  
  -- Información del gasto
  descripcion TEXT NOT NULL,
  fecha_gasto DATE NOT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  moneda TEXT NOT NULL DEFAULT 'PEN' CHECK (moneda IN ('PEN', 'USD', 'EUR')),
  tipo_cambio DECIMAL(10,4) CHECK (tipo_cambio > 0),
  
  -- Beneficiario
  beneficiario_tipo TEXT CHECK (beneficiario_tipo IN ('proveedor', 'empleado', 'otro')),
  beneficiario_documento TEXT, -- RUC o DNI
  beneficiario_nombre TEXT,
  
  -- Estado y aprobación
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN (
    'borrador',      -- Guardado pero no enviado
    'pendiente',     -- Enviado, esperando aprobación
    'aprobado',      -- Aprobado por supervisor/gerente
    'rechazado',     -- Rechazado
    'pagado',        -- Pago realizado
    'anulado'        -- Anulado
  )),
  
  -- Flujo de aprobación
  requiere_aprobacion BOOLEAN DEFAULT TRUE,
  aprobado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  aprobado_en TIMESTAMP WITH TIME ZONE,
  rechazado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rechazado_en TIMESTAMP WITH TIME ZONE,
  motivo_rechazo TEXT,
  
  -- Pago
  pagado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pagado_en TIMESTAMP WITH TIME ZONE,
  forma_pago TEXT CHECK (forma_pago IN (
    'efectivo',
    'tarjeta',
    'transferencia',
    'cheque',
    'otro'
  )),
  numero_operacion TEXT, -- Número de transferencia/cheque
  
  -- Metadata
  observaciones TEXT,
  tags TEXT[], -- Tags para categorización adicional
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT gastos_fecha_valida CHECK (fecha_gasto <= CURRENT_DATE)
);

-- =====================================================
-- 2. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_gastos_codigo ON gastos(codigo);
CREATE INDEX idx_gastos_concepto ON gastos(concepto_gasto_id);
CREATE INDEX idx_gastos_caja ON gastos(caja_id);
CREATE INDEX idx_gastos_usuario ON gastos(usuario_id);
CREATE INDEX idx_gastos_documento ON gastos(documento_id);
CREATE INDEX idx_gastos_centro_costo ON gastos(centro_costo_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha_gasto DESC);
CREATE INDEX idx_gastos_estado ON gastos(estado);
CREATE INDEX idx_gastos_aprobado_por ON gastos(aprobado_por) WHERE aprobado_por IS NOT NULL;
CREATE INDEX idx_gastos_tags ON gastos USING GIN(tags) WHERE tags IS NOT NULL;

-- Índice para búsqueda de texto completo
CREATE INDEX idx_gastos_texto_busqueda 
  ON gastos USING gin(
    to_tsvector('spanish', 
      coalesce(descripcion, '') || ' ' || 
      coalesce(beneficiario_nombre, '') || ' ' ||
      coalesce(observaciones, '')
    )
  );

-- =====================================================
-- 3. TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_gastos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gastos_updated_at
  BEFORE UPDATE ON gastos
  FOR EACH ROW
  EXECUTE FUNCTION update_gastos_updated_at();

-- =====================================================
-- 4. FUNCIÓN PARA GENERAR CÓDIGO ÚNICO
-- =====================================================

CREATE OR REPLACE FUNCTION generar_codigo_gasto()
RETURNS TRIGGER AS $$
DECLARE
  nuevo_codigo TEXT;
  anio TEXT;
  consecutivo INTEGER;
BEGIN
  -- Obtener año actual
  anio := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Obtener último consecutivo del año
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(codigo FROM 'GAS-' || anio || '-(\d+)$') AS INTEGER)
  ), 0) + 1 INTO consecutivo
  FROM gastos
  WHERE codigo LIKE 'GAS-' || anio || '-%';
  
  -- Generar código con formato GAS-2025-0001
  nuevo_codigo := 'GAS-' || anio || '-' || LPAD(consecutivo::TEXT, 4, '0');
  
  NEW.codigo := nuevo_codigo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_codigo_gasto
  BEFORE INSERT ON gastos
  FOR EACH ROW
  WHEN (NEW.codigo IS NULL OR NEW.codigo = '')
  EXECUTE FUNCTION generar_codigo_gasto();

-- =====================================================
-- 5. TABLA DE HISTORIAL DE APROBACIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS gastos_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  accion TEXT NOT NULL CHECK (accion IN (
    'creado',
    'modificado',
    'enviado',
    'aprobado',
    'rechazado',
    'pagado',
    'anulado'
  )),
  estado_anterior TEXT,
  estado_nuevo TEXT,
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gastos_historial_gasto ON gastos_historial(gasto_id);
CREATE INDEX idx_gastos_historial_usuario ON gastos_historial(usuario_id);
CREATE INDEX idx_gastos_historial_fecha ON gastos_historial(created_at DESC);

-- =====================================================
-- 6. TRIGGER PARA REGISTRAR HISTORIAL
-- =====================================================

CREATE OR REPLACE FUNCTION registrar_historial_gasto()
RETURNS TRIGGER AS $$
BEGIN
  -- Al insertar (crear gasto)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO gastos_historial (gasto_id, usuario_id, accion, estado_nuevo, comentario)
    VALUES (NEW.id, NEW.usuario_id, 'creado', NEW.estado, 'Gasto creado');
    RETURN NEW;
  END IF;
  
  -- Al actualizar
  IF TG_OP = 'UPDATE' THEN
    -- Cambio de estado
    IF OLD.estado != NEW.estado THEN
      INSERT INTO gastos_historial (
        gasto_id, 
        usuario_id, 
        accion, 
        estado_anterior, 
        estado_nuevo,
        comentario
      )
      VALUES (
        NEW.id,
        COALESCE(NEW.aprobado_por, NEW.rechazado_por, NEW.pagado_por, NEW.usuario_id),
        CASE 
          WHEN NEW.estado = 'aprobado' THEN 'aprobado'
          WHEN NEW.estado = 'rechazado' THEN 'rechazado'
          WHEN NEW.estado = 'pagado' THEN 'pagado'
          WHEN NEW.estado = 'anulado' THEN 'anulado'
          ELSE 'modificado'
        END,
        OLD.estado,
        NEW.estado,
        CASE 
          WHEN NEW.estado = 'rechazado' THEN NEW.motivo_rechazo
          ELSE 'Estado actualizado'
        END
      );
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_historial_gasto
  AFTER INSERT OR UPDATE ON gastos
  FOR EACH ROW
  EXECUTE FUNCTION registrar_historial_gasto();

-- =====================================================
-- 7. POLÍTICAS RLS (Row Level Security)
-- =====================================================

ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_historial ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Usuarios pueden ver sus propios gastos
CREATE POLICY "gastos_select_policy" 
ON gastos FOR SELECT
USING (
  usuario_id = auth.uid() OR
  aprobado_por = auth.uid() OR
  rechazado_por = auth.uid() OR
  pagado_por = auth.uid()
);

-- Política INSERT: Usuarios pueden crear gastos
CREATE POLICY "gastos_insert_policy" 
ON gastos FOR INSERT
WITH CHECK (usuario_id = auth.uid());

-- Política UPDATE: Usuarios pueden actualizar sus propios gastos
CREATE POLICY "gastos_update_policy" 
ON gastos FOR UPDATE
USING (
  usuario_id = auth.uid() OR
  (requiere_aprobacion = true AND estado = 'pendiente')
);

-- Política DELETE: Solo el creador puede eliminar gastos en borrador
CREATE POLICY "gastos_delete_policy" 
ON gastos FOR DELETE
USING (usuario_id = auth.uid() AND estado = 'borrador');

-- Políticas para historial
CREATE POLICY "gastos_historial_select_policy" 
ON gastos_historial FOR SELECT
USING (
  gasto_id IN (
    SELECT id FROM gastos 
    WHERE usuario_id = auth.uid()
  )
);

CREATE POLICY "gastos_historial_insert_policy" 
ON gastos_historial FOR INSERT
WITH CHECK (true);

-- =====================================================
-- 8. VISTA CON INFORMACIÓN AGREGADA
-- =====================================================

CREATE OR REPLACE VIEW vista_gastos AS
SELECT 
  g.*,
  cg.nombre AS concepto_nombre,
  cg.categoria AS concepto_categoria,
  cg.limite_maximo AS concepto_limite,
  ca.nombre AS caja_nombre,
  cc.nombre AS centro_costo_nombre,
  gd.numero_documento AS documento_numero,
  gd.tipo_documento AS documento_tipo,
  gd.archivo_url AS documento_url,
  -- Usuario que creó
  u_creador.email AS usuario_email,
  -- Aprobador
  u_aprobador.email AS aprobado_por_email,
  -- Pagador
  u_pagador.email AS pagado_por_email,
  -- Calcular días desde creación
  CURRENT_DATE - g.fecha_gasto AS dias_desde_gasto,
  -- Calcular si excede límite
  CASE 
    WHEN cg.limite_maximo IS NOT NULL AND g.monto > cg.limite_maximo 
    THEN TRUE 
    ELSE FALSE 
  END AS excede_limite
FROM gastos g
LEFT JOIN conceptos_gasto cg ON g.concepto_gasto_id = cg.id
LEFT JOIN cajas ca ON g.caja_id = ca.id
LEFT JOIN centros_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN gastos_documentos gd ON g.documento_id = gd.id
LEFT JOIN auth.users u_creador ON g.usuario_id = u_creador.id
LEFT JOIN auth.users u_aprobador ON g.aprobado_por = u_aprobador.id
LEFT JOIN auth.users u_pagador ON g.pagado_por = u_pagador.id;

-- =====================================================
-- 9. FUNCIONES ÚTILES
-- =====================================================

-- Función para obtener estadísticas de gastos
CREATE OR REPLACE FUNCTION obtener_estadisticas_gastos(
  p_usuario_id UUID DEFAULT NULL,
  p_fecha_desde DATE DEFAULT NULL,
  p_fecha_hasta DATE DEFAULT NULL
)
RETURNS TABLE (
  total_gastos BIGINT,
  gastos_pendientes BIGINT,
  gastos_aprobados BIGINT,
  gastos_rechazados BIGINT,
  gastos_pagados BIGINT,
  monto_total_pen NUMERIC,
  monto_pendiente_pen NUMERIC,
  monto_aprobado_pen NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total_gastos,
    COUNT(*) FILTER (WHERE estado = 'pendiente')::BIGINT AS gastos_pendientes,
    COUNT(*) FILTER (WHERE estado = 'aprobado')::BIGINT AS gastos_aprobados,
    COUNT(*) FILTER (WHERE estado = 'rechazado')::BIGINT AS gastos_rechazados,
    COUNT(*) FILTER (WHERE estado = 'pagado')::BIGINT AS gastos_pagados,
    SUM(
      CASE 
        WHEN moneda = 'USD' AND tipo_cambio IS NOT NULL 
        THEN monto * tipo_cambio
        ELSE monto
      END
    )::NUMERIC AS monto_total_pen,
    SUM(
      CASE 
        WHEN estado = 'pendiente' THEN
          CASE 
            WHEN moneda = 'USD' AND tipo_cambio IS NOT NULL 
            THEN monto * tipo_cambio
            ELSE monto
          END
        ELSE 0
      END
    )::NUMERIC AS monto_pendiente_pen,
    SUM(
      CASE 
        WHEN estado = 'aprobado' THEN
          CASE 
            WHEN moneda = 'USD' AND tipo_cambio IS NOT NULL 
            THEN monto * tipo_cambio
            ELSE monto
          END
        ELSE 0
      END
    )::NUMERIC AS monto_aprobado_pen
  FROM gastos
  WHERE (p_usuario_id IS NULL OR usuario_id = p_usuario_id)
    AND (p_fecha_desde IS NULL OR fecha_gasto >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR fecha_gasto <= p_fecha_hasta);
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 10. COMENTARIOS
-- =====================================================

COMMENT ON TABLE gastos IS 'Registro de gastos con flujo de aprobación';
COMMENT ON COLUMN gastos.codigo IS 'Código único del gasto (GAS-2025-0001)';
COMMENT ON COLUMN gastos.estado IS 'Estado del gasto en el flujo';
COMMENT ON COLUMN gastos.requiere_aprobacion IS 'Si el concepto requiere aprobación';
COMMENT ON TABLE gastos_historial IS 'Historial de cambios y aprobaciones de gastos';

-- =====================================================
-- 11. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$ 
BEGIN 
  RAISE NOTICE 'Migración de gastos completada exitosamente';
  RAISE NOTICE 'Tabla gastos creada con flujo de aprobación';
  RAISE NOTICE 'Tabla gastos_historial creada para auditoría';
  RAISE NOTICE 'Triggers configurados para código automático e historial';
  RAISE NOTICE 'RLS policies habilitadas';
END $$;
