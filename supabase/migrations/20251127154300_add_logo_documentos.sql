-- ============================================================================
-- MIGRACIÓN: Agregar soporte para logos y documentos requeridos
-- Fecha: 27 de noviembre de 2025
-- ============================================================================

-- 1. CREAR BUCKET PARA LOGOS DE EMPRESAS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para logos
CREATE POLICY "Todos pueden ver logos públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY "Admins pueden subir logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'administrador')
    )
  );

CREATE POLICY "Admins pueden actualizar logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-logos' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'administrador')
    )
  );

CREATE POLICY "Admins pueden eliminar logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-logos' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'administrador')
    )
  );

-- 2. CREAR TABLA: concepto_documentos_requeridos
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.concepto_documentos_requeridos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concepto_gasto_id UUID NOT NULL REFERENCES public.conceptos_gasto(id) ON DELETE CASCADE,
  nombre_documento TEXT NOT NULL,
  descripcion TEXT,
  es_obligatorio BOOLEAN DEFAULT true,
  tipo_documento TEXT CHECK (tipo_documento IN ('factura', 'boleta', 'recibo', 'comprobante', 'ticket', 'otro')),
  orden INT DEFAULT 0,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_concepto_documentos_concepto 
  ON public.concepto_documentos_requeridos(concepto_gasto_id);
CREATE INDEX IF NOT EXISTS idx_concepto_documentos_estado 
  ON public.concepto_documentos_requeridos(estado);
CREATE INDEX IF NOT EXISTS idx_concepto_documentos_orden 
  ON public.concepto_documentos_requeridos(orden);

-- RLS Policies
ALTER TABLE public.concepto_documentos_requeridos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver documentos requeridos activos"
  ON public.concepto_documentos_requeridos FOR SELECT
  USING (estado = 'activo' OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('superadmin', 'administrador')
  ));

CREATE POLICY "Admins pueden insertar documentos requeridos"
  ON public.concepto_documentos_requeridos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'administrador')
    )
  );

CREATE POLICY "Admins pueden actualizar documentos requeridos"
  ON public.concepto_documentos_requeridos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'administrador')
    )
  );

CREATE POLICY "Admins pueden eliminar documentos requeridos"
  ON public.concepto_documentos_requeridos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'administrador')
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_concepto_documentos_updated_at
  BEFORE UPDATE ON public.concepto_documentos_requeridos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. COMENTARIOS EN TABLAS
-- ============================================================================
COMMENT ON TABLE public.concepto_documentos_requeridos IS 'Documentos requeridos para cada concepto de gasto';
COMMENT ON COLUMN public.concepto_documentos_requeridos.nombre_documento IS 'Nombre del documento requerido';
COMMENT ON COLUMN public.concepto_documentos_requeridos.es_obligatorio IS 'Si el documento es obligatorio para el concepto';
COMMENT ON COLUMN public.concepto_documentos_requeridos.tipo_documento IS 'Tipo de documento fiscal';
COMMENT ON COLUMN public.concepto_documentos_requeridos.orden IS 'Orden de presentación en la lista';

-- 4. DATOS DE EJEMPLO (Opcional)
-- ============================================================================
-- Insertar documentos requeridos comunes para conceptos existentes
-- Nota: Ejecutar solo si existen conceptos de gasto

-- Ejemplo: Si existe un concepto de viáticos
DO $$
DECLARE
  v_concepto_id UUID;
BEGIN
  -- Buscar concepto de viáticos
  SELECT id INTO v_concepto_id
  FROM public.conceptos_gasto
  WHERE LOWER(nombre) LIKE '%viatico%' OR LOWER(nombre) LIKE '%viaje%'
  LIMIT 1;

  -- Si existe, agregar documentos requeridos
  IF v_concepto_id IS NOT NULL THEN
    INSERT INTO public.concepto_documentos_requeridos (concepto_gasto_id, nombre_documento, descripcion, tipo_documento, es_obligatorio, orden)
    VALUES
      (v_concepto_id, 'Comprobante de Pago', 'Factura o boleta del gasto', 'factura', true, 1),
      (v_concepto_id, 'Itinerario de Viaje', 'Documento con fechas y destinos', 'otro', true, 2),
      (v_concepto_id, 'Autorización de Viaje', 'Documento de aprobación del gerente', 'otro', true, 3)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
