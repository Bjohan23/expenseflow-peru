# Guía de Uso del Supabase CLI

## Configuración Inicial

### 1. Autenticarse con Supabase

Antes de poder vincular tu proyecto, necesitas autenticarte:

```bash
npm run db:link
```

Esto te pedirá un access token. Para obtenerlo:

1. Ve a https://supabase.com/dashboard/account/tokens
2. Click en "Generate new token"
3. Dale un nombre (ej: "ExpenseFlow Local Dev")
4. Copia el token generado
5. Pégalo cuando el CLI te lo pida

**Alternativa**: Configurar variable de entorno (PowerShell):
```powershell
$env:SUPABASE_ACCESS_TOKEN="tu-token-aqui"
npm run db:link
```

### 2. Verificar Vinculación

```bash
npm run db:status
```

Si está vinculado correctamente, verás información sobre tu proyecto.

---

## Comandos Disponibles

### Desarrollo Local

#### Iniciar Base de Datos Local (Docker)
```bash
npm run db:start
```

Esto inicia:
- PostgreSQL local en `localhost:54322`
- Supabase Studio en `http://localhost:54323`
- API local en `http://localhost:54321`

#### Detener Base de Datos Local
```bash
npm run db:stop
```

#### Ver Estado de Servicios Locales
```bash
npm run db:status
```

---

### Migraciones

#### Crear Nueva Migración
```bash
npm run db:migration:new nombre_de_la_migracion
```

Esto crea: `supabase/migrations/YYYYMMDDHHMMSS_nombre_de_la_migracion.sql`

**Ejemplo**:
```bash
npm run db:migration:new add_categoria_column
# Crea: supabase/migrations/20251127180000_add_categoria_column.sql
```

Luego edita el archivo SQL generado con tus cambios.

#### Aplicar Migraciones Localmente
```bash
npm run db:reset
```

Este comando:
1. Borra la BD local
2. Vuelve a crearla desde cero
3. Aplica TODAS las migraciones en orden

#### Ver Diferencias (Schema Diff)
```bash
npm run db:diff -f nombre_para_migracion
```

Compara tu BD local con las migraciones y genera una nueva migración con las diferencias.

#### Aplicar Migraciones a Producción
```bash
npm run db:push:remote
```

⚠️ **CUIDADO**: Esto aplica las migraciones a tu base de datos de producción en Supabase.

---

### Sincronización

#### Descargar Schema de Producción
```bash
npm run db:pull
```

Descarga el schema actual de tu BD en Supabase y lo guarda como migración.

#### Subir Cambios Locales
```bash
npm run db:push
```

Aplica migraciones pendientes a la BD local (si está corriendo).

---

## Flujo de Trabajo Recomendado

### Desarrollo de Nueva Funcionalidad

1. **Iniciar BD local**:
   ```bash
   npm run db:start
   ```

2. **Crear migración**:
   ```bash
   npm run db:migration:new add_new_feature
   ```

3. **Editar archivo SQL** generado en `supabase/migrations/`

4. **Probar cambios localmente**:
   ```bash
   npm run db:reset
   ```

5. **Verificar en Studio local**: http://localhost:54323

6. **Si todo funciona, aplicar a producción**:
   ```bash
   npm run db:push:remote
   ```

7. **Commit y push**:
   ```bash
   git add supabase/migrations/
   git commit -m "feat: Add new feature migration"
   git push
   ```

---

## Estructura de Archivos

```
supabase/
├── config.toml                    # Configuración del proyecto
├── migrations/                    # Migraciones timestamped
│   ├── 20251127120000_initial.sql
│   ├── 20251127120001_add_rls.sql
│   └── ...
├── README.md                      # Guía de scripts SQL legacy
└── CLI-GUIDE.md                   # Esta guía
```

---

## Archivos Legacy vs Migraciones

Los archivos sueltos en `supabase/` (como `fix-rls-policies.sql`, `seed-data.sql`) son scripts legacy que se ejecutaban manualmente.

**Recomendación**: Para nuevos cambios, siempre usa migraciones:

```bash
# ❌ NO HAGAS ESTO (manual)
# Copiar SQL y pegar en Supabase Dashboard

# ✅ HAZ ESTO (migración)
npm run db:migration:new fix_something
# Editar archivo generado
npm run db:reset  # Probar local
npm run db:push:remote  # Aplicar a producción
```

---

## Comandos Útiles de PostgreSQL

Una vez que tengas la BD local corriendo, puedes conectarte directamente:

```bash
# Ver variables de conexión
npm run db:status

# Conectar con psql (si lo tienes instalado)
psql postgresql://postgres:postgres@localhost:54322/postgres
```

---

## Troubleshooting

### Error: "Docker not running"
- Asegúrate de tener Docker Desktop instalado y corriendo
- Descarga: https://www.docker.com/products/docker-desktop

### Error: "Access token not provided"
- Ejecuta `npm run db:link` nuevamente
- O configura `SUPABASE_ACCESS_TOKEN` como variable de entorno

### Error: "Port already in use"
- Otro servicio está usando el puerto 54322 o 54321
- Detén otros contenedores de Docker o cambia el puerto en `supabase/config.toml`

### La BD local no tiene mis datos
- La BD local es independiente de producción
- Si necesitas datos, crea un script de seed o usa `npm run db:pull` para descargar el schema

### Error al aplicar migraciones
- Verifica que las migraciones no tengan errores de sintaxis
- Usa `npm run db:reset` para aplicar desde cero
- Revisa los logs en la terminal

---

## Variables de Entorno

Para desarrollo local, puedes apuntar tu app al Supabase local:

```env
# .env.local (para desarrollo local)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGci... # Obtén esto de `npm run db:status`
```

Después de cambiar, reinicia tu servidor de desarrollo:
```bash
npm run dev
```

---

## Recursos

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Migraciones](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Desarrollo Local](https://supabase.com/docs/guides/cli/local-development)

---

**¡Happy migrating! 🚀**
