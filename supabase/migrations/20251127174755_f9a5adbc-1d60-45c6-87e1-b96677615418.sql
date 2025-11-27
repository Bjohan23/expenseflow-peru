-- ============================================================================
-- SISTEMA DE GESTIÓN DE GASTOS CORPORATIVOS - SPRINT 02
-- Base de datos completa con RLS y auditoría
-- ============================================================================

-- 1. TABLA: profiles (Extensión de auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'colaborador' CHECK (role IN ('admin', 'responsable', 'aprobador', 'colaborador')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los perfiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden actualizar perfiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TABLA: empresas
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc TEXT NOT NULL UNIQUE,
  razon_social TEXT NOT NULL,
  nombre_comercial TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  moneda TEXT DEFAULT 'PEN' CHECK (moneda IN ('PEN', 'USD')),
  limite_gasto_mensual DECIMAL(12,2),
  logo_url TEXT,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ruc_length_check CHECK (LENGTH(ruc) = 11)
);

CREATE INDEX IF NOT EXISTS idx_empresas_ruc ON public.empresas(ruc);
CREATE INDEX IF NOT EXISTS idx_empresas_estado ON public.empresas(estado);

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver empresas activas"
  ON public.empresas FOR SELECT
  USING (estado = 'activo' OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Solo admins pueden insertar empresas"
  ON public.empresas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden actualizar empresas"
  ON public.empresas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. TABLA: empresa_usuarios (Relación N:N)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.empresa_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rol_en_empresa TEXT NOT NULL DEFAULT 'colaborador',
  fecha_asignacion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_empresa_usuarios_empresa ON public.empresa_usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_usuarios_user ON public.empresa_usuarios(user_id);

ALTER TABLE public.empresa_usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus empresas"
  ON public.empresa_usuarios FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins pueden asignar usuarios"
  ON public.empresa_usuarios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. TABLA: sucursales
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sucursales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  region TEXT NOT NULL,
  telefono TEXT,
  responsable_id UUID REFERENCES public.profiles(id),
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_sucursales_empresa ON public.sucursales(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sucursales_responsable ON public.sucursales(responsable_id);
CREATE INDEX IF NOT EXISTS idx_sucursales_estado ON public.sucursales(estado);

ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sucursales de sus empresas"
  ON public.sucursales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.empresa_usuarios
      WHERE empresa_usuarios.empresa_id = sucursales.empresa_id
        AND empresa_usuarios.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins y responsables pueden crear sucursales"
  ON public.sucursales FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable')
    )
  );

CREATE POLICY "Admins y responsables pueden actualizar sucursales"
  ON public.sucursales FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable')
    )
  );

-- 5. TABLA: cajas
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cajas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  sucursal_id UUID NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
  responsable_id UUID NOT NULL REFERENCES public.profiles(id),
  saldo_inicial DECIMAL(12,2) NOT NULL DEFAULT 0,
  saldo_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado TEXT DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
  fecha_apertura TIMESTAMPTZ DEFAULT NOW(),
  fecha_cierre TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sucursal_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_cajas_sucursal ON public.cajas(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_cajas_responsable ON public.cajas(responsable_id);
CREATE INDEX IF NOT EXISTS idx_cajas_estado ON public.cajas(estado);

ALTER TABLE public.cajas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver cajas de sus sucursales"
  ON public.cajas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sucursales s
      JOIN public.empresa_usuarios eu ON s.empresa_id = eu.empresa_id
      WHERE s.id = cajas.sucursal_id AND eu.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. TABLA: centros_costo
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.centros_costo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  responsable_id UUID NOT NULL REFERENCES public.profiles(id),
  presupuesto_asignado DECIMAL(12,2) NOT NULL DEFAULT 0,
  presupuesto_consumido DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_centros_costo_empresa ON public.centros_costo(empresa_id);
CREATE INDEX IF NOT EXISTS idx_centros_costo_responsable ON public.centros_costo(responsable_id);
CREATE INDEX IF NOT EXISTS idx_centros_costo_estado ON public.centros_costo(estado);

ALTER TABLE public.centros_costo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver centros de costo de sus empresas"
  ON public.centros_costo FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.empresa_usuarios
      WHERE empresa_usuarios.empresa_id = centros_costo.empresa_id
        AND empresa_usuarios.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden crear centros de costo"
  ON public.centros_costo FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden actualizar centros de costo"
  ON public.centros_costo FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. TABLA: conceptos_gasto
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conceptos_gasto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('viaticos', 'transporte', 'alimentacion', 'hospedaje', 'otros')),
  centro_costo_id UUID REFERENCES public.centros_costo(id) ON DELETE SET NULL,
  requiere_aprobacion BOOLEAN DEFAULT true,
  limite_maximo DECIMAL(12,2),
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conceptos_gasto_categoria ON public.conceptos_gasto(categoria);
CREATE INDEX IF NOT EXISTS idx_conceptos_gasto_centro_costo ON public.conceptos_gasto(centro_costo_id);
CREATE INDEX IF NOT EXISTS idx_conceptos_gasto_estado ON public.conceptos_gasto(estado);

ALTER TABLE public.conceptos_gasto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver conceptos activos"
  ON public.conceptos_gasto FOR SELECT
  USING (estado = 'activo' OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins pueden crear conceptos"
  ON public.conceptos_gasto FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden actualizar conceptos"
  ON public.conceptos_gasto FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. TABLA: auditoria
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla TEXT NOT NULL,
  registro_id UUID NOT NULL,
  accion TEXT NOT NULL CHECK (accion IN ('crear', 'editar', 'eliminar', 'aprobar', 'rechazar')),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  comentario TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON public.auditoria(tabla);
CREATE INDEX IF NOT EXISTS idx_auditoria_registro ON public.auditoria(registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON public.auditoria(created_at);

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo admins pueden ver auditoría"
  ON public.auditoria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger para updated_at en todas las tablas
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_empresas_updated_at ON public.empresas;
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sucursales_updated_at ON public.sucursales;
CREATE TRIGGER update_sucursales_updated_at
  BEFORE UPDATE ON public.sucursales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cajas_updated_at ON public.cajas;
CREATE TRIGGER update_cajas_updated_at
  BEFORE UPDATE ON public.cajas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_centros_costo_updated_at ON public.centros_costo;
CREATE TRIGGER update_centros_costo_updated_at
  BEFORE UPDATE ON public.centros_costo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_conceptos_gasto_updated_at ON public.conceptos_gasto;
CREATE TRIGGER update_conceptos_gasto_updated_at
  BEFORE UPDATE ON public.conceptos_gasto
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();