-- =====================================================
-- Migration: Sistema OCR - Tabla de Documentos de Gastos
-- Fecha: 2025-11-27
-- Descripción: Crea tabla para almacenar documentos procesados con OCR,
--              bucket de storage y políticas RLS
-- =====================================================

-- =====================================================
-- 1. CREAR BUCKET DE STORAGE PARA DOCUMENTOS
-- =====================================================

-- Insertar bucket si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gastos-documentos',
  'gastos-documentos',
  false, -- No público, requiere autenticación
  10485760, -- 10 MB límite
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. POLÍTICAS RLS PARA BUCKET DE STORAGE
-- =====================================================

-- Política: Los usuarios pueden subir documentos
CREATE POLICY "gastos_documentos_storage_insert_policy"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gastos-documentos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Los usuarios pueden ver sus propios documentos
CREATE POLICY "gastos_documentos_storage_select_policy"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'gastos-documentos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Los usuarios pueden actualizar sus propios documentos
CREATE POLICY "gastos_documentos_storage_update_policy"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gastos-documentos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Los usuarios pueden eliminar sus propios documentos
CREATE POLICY "gastos_documentos_storage_delete_policy"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gastos-documentos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 3. CREAR TABLA gastos_documentos
-- =====================================================

CREATE TABLE IF NOT EXISTS gastos_documentos (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concepto_gasto_id UUID REFERENCES conceptos_gasto(id) ON DELETE CASCADE,
  caja_id UUID REFERENCES cajas(id) ON DELETE SET NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- ============================================
  -- INFORMACIÓN DEL ARCHIVO
  -- ============================================
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  archivo_tipo TEXT NOT NULL CHECK (archivo_tipo IN (
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  )),
  archivo_tamano INTEGER NOT NULL CHECK (archivo_tamano > 0),
  
  -- ============================================
  -- TIPO DE DOCUMENTO
  -- ============================================
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN (
    'factura',
    'boleta',
    'recibo',
    'ticket',
    'orden_compra',
    'contrato',
    'otro'
  )),
  numero_documento TEXT NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE,
  moneda TEXT NOT NULL DEFAULT 'PEN' CHECK (moneda IN ('PEN', 'USD', 'EUR')),
  
  -- ============================================
  -- INFORMACIÓN DEL EMISOR (Proveedor)
  -- ============================================
  emisor_ruc TEXT CHECK (emisor_ruc ~ '^\d{11}$'), -- RUC debe ser 11 dígitos
  emisor_razon_social TEXT,
  emisor_direccion TEXT,
  emisor_telefono TEXT,
  emisor_email TEXT,
  
  -- ============================================
  -- INFORMACIÓN DEL CLIENTE (Receptor)
  -- ============================================
  cliente_documento TEXT, -- RUC (11 dígitos) o DNI (8 dígitos)
  cliente_nombre TEXT,
  cliente_direccion TEXT,
  
  -- ============================================
  -- MONTOS Y CÁLCULOS
  -- ============================================
  subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
  igv DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (igv >= 0),
  total DECIMAL(12,2) NOT NULL CHECK (total >= 0),
  tipo_cambio DECIMAL(10,4) CHECK (tipo_cambio > 0),
  descuento DECIMAL(12,2) DEFAULT 0 CHECK (descuento >= 0),
  detraccion DECIMAL(12,2) DEFAULT 0 CHECK (detraccion >= 0),
  
  -- ============================================
  -- DETALLE DE ITEMS (JSONB)
  -- ============================================
  -- Formato: [{ 
  --   descripcion: string, 
  --   cantidad: number, 
  --   precio_unitario: number, 
  --   subtotal: number 
  -- }]
  items JSONB,
  
  -- ============================================
  -- VALIDACIÓN SUNAT
  -- ============================================
  codigo_qr TEXT,
  hash_validacion TEXT,
  validado_sunat BOOLEAN DEFAULT FALSE,
  
  -- ============================================
  -- INFORMACIÓN DE PAGO
  -- ============================================
  forma_pago TEXT CHECK (forma_pago IN (
    'efectivo',
    'tarjeta',
    'transferencia',
    'cheque',
    'credito',
    'otro'
  )),
  condiciones_pago TEXT,
  
  -- ============================================
  -- METADATOS OCR
  -- ============================================
  texto_raw TEXT, -- Texto completo extraído por OCR
  confianza_ocr DECIMAL(5,2) CHECK (confianza_ocr >= 0 AND confianza_ocr <= 100),
  procesado_por TEXT DEFAULT 'tesseract' CHECK (procesado_por IN (
    'tesseract',
    'google-vision',
    'aws-textract',
    'manual'
  )),
  requiere_validacion BOOLEAN DEFAULT TRUE,
  validado_manualmente BOOLEAN DEFAULT FALSE,
  validado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validado_en TIMESTAMP WITH TIME ZONE,
  
  -- ============================================
  -- OBSERVACIONES Y NOTAS
  -- ============================================
  observaciones TEXT,
  glosa TEXT, -- Descripción adicional del gasto
  
  -- ============================================
  -- ESTADO Y AUDITORÍA
  -- ============================================
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN (
    'pendiente',      -- Subido, esperando validación
    'validado',       -- Datos confirmados como correctos
    'rechazado',      -- Documento no válido
    'aprobado',       -- Aprobado para gasto
    'observado'       -- Tiene observaciones pendientes
  )),
  
  -- ============================================
  -- TIMESTAMPS
  -- ============================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ============================================
  -- CONSTRAINTS
  -- ============================================
  CONSTRAINT gastos_documentos_numero_unico UNIQUE(numero_documento, emisor_ruc),
  CONSTRAINT gastos_documentos_fecha_valida CHECK (fecha_emision <= CURRENT_DATE),
  CONSTRAINT gastos_documentos_vencimiento_valido CHECK (
    fecha_vencimiento IS NULL OR fecha_vencimiento >= fecha_emision
  )
);

-- =====================================================
-- 4. COMENTARIOS EN COLUMNAS
-- =====================================================

COMMENT ON TABLE gastos_documentos IS 'Almacena documentos de gastos procesados con OCR';
COMMENT ON COLUMN gastos_documentos.archivo_url IS 'URL del archivo en Supabase Storage';
COMMENT ON COLUMN gastos_documentos.emisor_ruc IS 'RUC del emisor (11 dígitos)';
COMMENT ON COLUMN gastos_documentos.items IS 'Detalle de items en formato JSONB';
COMMENT ON COLUMN gastos_documentos.confianza_ocr IS 'Nivel de confianza del OCR (0-100)';
COMMENT ON COLUMN gastos_documentos.texto_raw IS 'Texto completo extraído sin procesar';

-- =====================================================
-- 5. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_gastos_documentos_concepto 
  ON gastos_documentos(concepto_gasto_id);

CREATE INDEX idx_gastos_documentos_caja 
  ON gastos_documentos(caja_id);

CREATE INDEX idx_gastos_documentos_usuario 
  ON gastos_documentos(usuario_id);

CREATE INDEX idx_gastos_documentos_fecha 
  ON gastos_documentos(fecha_emision DESC);

CREATE INDEX idx_gastos_documentos_emisor 
  ON gastos_documentos(emisor_ruc) 
  WHERE emisor_ruc IS NOT NULL;

CREATE INDEX idx_gastos_documentos_estado 
  ON gastos_documentos(estado);

CREATE INDEX idx_gastos_documentos_tipo 
  ON gastos_documentos(tipo_documento);

CREATE INDEX idx_gastos_documentos_numero 
  ON gastos_documentos(numero_documento);

-- Índice para búsqueda de texto completo en texto_raw
CREATE INDEX idx_gastos_documentos_texto_busqueda 
  ON gastos_documentos USING gin(to_tsvector('spanish', texto_raw))
  WHERE texto_raw IS NOT NULL;

-- =====================================================
-- 6. TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_gastos_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gastos_documentos_updated_at
  BEFORE UPDATE ON gastos_documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_gastos_documentos_updated_at();

-- =====================================================
-- 7. FUNCIÓN PARA CALCULAR IGV AUTOMÁTICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_igv_automatico()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el IGV es 0 y tenemos subtotal, calcular IGV (18%)
  IF NEW.igv = 0 AND NEW.subtotal > 0 THEN
    NEW.igv := ROUND(NEW.subtotal * 0.18, 2);
    NEW.total := NEW.subtotal + NEW.igv - COALESCE(NEW.descuento, 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_igv
  BEFORE INSERT OR UPDATE ON gastos_documentos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_igv_automatico();

-- =====================================================
-- 8. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE gastos_documentos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. POLÍTICAS RLS PARA LA TABLA
-- =====================================================

-- Política SELECT: Los usuarios ven documentos de su empresa
CREATE POLICY "gastos_documentos_select_policy" 
ON gastos_documentos FOR SELECT
USING (
  auth.uid() = usuario_id
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'empresa_id' = 
        (SELECT raw_user_meta_data->>'empresa_id' 
         FROM auth.users 
         WHERE id = gastos_documentos.usuario_id)
  )
);

-- Política INSERT: Solo el usuario puede crear sus documentos
CREATE POLICY "gastos_documentos_insert_policy" 
ON gastos_documentos FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

-- Política UPDATE: Solo el usuario puede actualizar sus documentos
CREATE POLICY "gastos_documentos_update_policy" 
ON gastos_documentos FOR UPDATE
USING (auth.uid() = usuario_id);

-- Política DELETE: Solo el usuario puede eliminar sus documentos
CREATE POLICY "gastos_documentos_delete_policy" 
ON gastos_documentos FOR DELETE
USING (auth.uid() = usuario_id);

-- =====================================================
-- 10. VISTA PARA DOCUMENTOS CON INFORMACIÓN AGREGADA
-- =====================================================

CREATE OR REPLACE VIEW vista_gastos_documentos AS
SELECT 
  gd.*,
  cg.nombre AS concepto_nombre,
  cg.categoria AS concepto_categoria,
  c.nombre AS caja_nombre,
  u.email AS usuario_email,
  -- Calcular días desde emisión
  CURRENT_DATE - gd.fecha_emision AS dias_desde_emision,
  -- Calcular si está vencido
  CASE 
    WHEN gd.fecha_vencimiento IS NOT NULL 
         AND gd.fecha_vencimiento < CURRENT_DATE 
    THEN TRUE 
    ELSE FALSE 
  END AS esta_vencido,
  -- Calcular total en PEN (si es USD, aplicar tipo de cambio)
  CASE 
    WHEN gd.moneda = 'USD' AND gd.tipo_cambio IS NOT NULL 
    THEN gd.total * gd.tipo_cambio
    ELSE gd.total
  END AS total_pen
FROM gastos_documentos gd
LEFT JOIN conceptos_gasto cg ON gd.concepto_gasto_id = cg.id
LEFT JOIN cajas c ON gd.caja_id = c.id
LEFT JOIN auth.users u ON gd.usuario_id = u.id;

-- =====================================================
-- 11. FUNCIÓN PARA ESTADÍSTICAS DE OCR
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_estadisticas_ocr(
  p_usuario_id UUID DEFAULT NULL,
  p_fecha_desde DATE DEFAULT NULL,
  p_fecha_hasta DATE DEFAULT NULL
)
RETURNS TABLE (
  total_documentos BIGINT,
  documentos_validados BIGINT,
  documentos_pendientes BIGINT,
  confianza_promedio NUMERIC,
  total_monto_pen NUMERIC,
  documentos_por_tipo JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total_documentos,
    COUNT(*) FILTER (WHERE estado = 'validado')::BIGINT AS documentos_validados,
    COUNT(*) FILTER (WHERE estado = 'pendiente')::BIGINT AS documentos_pendientes,
    ROUND(AVG(confianza_ocr), 2) AS confianza_promedio,
    ROUND(SUM(
      CASE 
        WHEN moneda = 'USD' AND tipo_cambio IS NOT NULL 
        THEN total * tipo_cambio
        ELSE total
      END
    ), 2) AS total_monto_pen,
    jsonb_object_agg(
      tipo_documento, 
      conteo
    ) AS documentos_por_tipo
  FROM (
    SELECT 
      gd.*,
      COUNT(*) OVER (PARTITION BY gd.tipo_documento) AS conteo
    FROM gastos_documentos gd
    WHERE (p_usuario_id IS NULL OR gd.usuario_id = p_usuario_id)
      AND (p_fecha_desde IS NULL OR gd.fecha_emision >= p_fecha_desde)
      AND (p_fecha_hasta IS NULL OR gd.fecha_emision <= p_fecha_hasta)
  ) subq;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 12. DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- =====================================================

/*
-- Descomentar para insertar datos de prueba

INSERT INTO gastos_documentos (
  concepto_gasto_id,
  usuario_id,
  archivo_url,
  archivo_nombre,
  archivo_tipo,
  archivo_tamano,
  tipo_documento,
  numero_documento,
  fecha_emision,
  moneda,
  emisor_ruc,
  emisor_razon_social,
  subtotal,
  igv,
  total,
  confianza_ocr,
  estado
) VALUES (
  (SELECT id FROM conceptos_gasto LIMIT 1),
  auth.uid(),
  'gastos-documentos/test/factura001.pdf',
  'factura001.pdf',
  'application/pdf',
  256000,
  'factura',
  'F001-00000123',
  '2025-11-27',
  'PEN',
  '20123456789',
  'EMPRESA EJEMPLO SAC',
  1000.00,
  180.00,
  1180.00,
  95.50,
  'validado'
);
*/

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

-- Verificar que todo se creó correctamente
DO $$
BEGIN
  RAISE NOTICE 'Migración completada exitosamente';
  RAISE NOTICE 'Bucket creado: gastos-documentos';
  RAISE NOTICE 'Tabla creada: gastos_documentos';
  RAISE NOTICE 'Vista creada: vista_gastos_documentos';
  RAISE NOTICE 'Función creada: obtener_estadisticas_ocr';
END $$;
