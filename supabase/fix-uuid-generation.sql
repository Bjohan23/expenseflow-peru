-- =====================================================
-- FIX: Asegurar que la tabla tenga generación automática de UUID
-- Ejecutar esto en SQL Editor de Supabase
-- =====================================================

-- Verificar si la función uuid_generate_v4 existe (PostgreSQL < 13)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Opción 1: Alterar la tabla para usar uuid_generate_v4 (compatible con versiones antiguas)
ALTER TABLE concepto_documentos_requeridos 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Opción 2: Si lo anterior no funciona, usar gen_random_uuid (PostgreSQL 13+)
-- ALTER TABLE concepto_documentos_requeridos 
--   ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verificar que funciona
SELECT column_name, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'concepto_documentos_requeridos' 
  AND column_name = 'id';

-- Debe mostrar algo como:
-- column_name | column_default              | is_nullable
-- id          | uuid_generate_v4()         | NO
-- O:
-- id          | gen_random_uuid()          | NO
