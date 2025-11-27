export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      auditoria: {
        Row: {
          accion: string
          comentario: string | null
          created_at: string | null
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          id: string
          ip_address: string | null
          registro_id: string
          tabla: string
          user_agent: string | null
          usuario_id: string
        }
        Insert: {
          accion: string
          comentario?: string | null
          created_at?: string | null
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id?: string
          ip_address?: string | null
          registro_id: string
          tabla: string
          user_agent?: string | null
          usuario_id: string
        }
        Update: {
          accion?: string
          comentario?: string | null
          created_at?: string | null
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id?: string
          ip_address?: string | null
          registro_id?: string
          tabla?: string
          user_agent?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cajas: {
        Row: {
          codigo: string
          created_at: string | null
          estado: string | null
          fecha_apertura: string | null
          fecha_cierre: string | null
          id: string
          nombre: string
          responsable_id: string
          saldo_actual: number
          saldo_inicial: number
          sucursal_id: string
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          estado?: string | null
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          id?: string
          nombre: string
          responsable_id: string
          saldo_actual?: number
          saldo_inicial?: number
          sucursal_id: string
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          estado?: string | null
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          id?: string
          nombre?: string
          responsable_id?: string
          saldo_actual?: number
          saldo_inicial?: number
          sucursal_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cajas_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cajas_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
        ]
      }
      centros_costo: {
        Row: {
          codigo: string
          created_at: string | null
          descripcion: string | null
          empresa_id: string
          estado: string | null
          id: string
          nombre: string
          presupuesto_asignado: number
          presupuesto_consumido: number
          responsable_id: string
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          descripcion?: string | null
          empresa_id: string
          estado?: string | null
          id?: string
          nombre: string
          presupuesto_asignado?: number
          presupuesto_consumido?: number
          responsable_id: string
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          descripcion?: string | null
          empresa_id?: string
          estado?: string | null
          id?: string
          nombre?: string
          presupuesto_asignado?: number
          presupuesto_consumido?: number
          responsable_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centros_costo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_costo_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      concepto_documentos_requeridos: {
        Row: {
          concepto_gasto_id: string | null
          created_at: string | null
          descripcion: string | null
          es_obligatorio: boolean | null
          estado: string | null
          id: string
          nombre_documento: string
          orden: number | null
          tipo_documento: string | null
          updated_at: string | null
        }
        Insert: {
          concepto_gasto_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          es_obligatorio?: boolean | null
          estado?: string | null
          id?: string
          nombre_documento: string
          orden?: number | null
          tipo_documento?: string | null
          updated_at?: string | null
        }
        Update: {
          concepto_gasto_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          es_obligatorio?: boolean | null
          estado?: string | null
          id?: string
          nombre_documento?: string
          orden?: number | null
          tipo_documento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concepto_documentos_requeridos_concepto_gasto_id_fkey"
            columns: ["concepto_gasto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_gasto"
            referencedColumns: ["id"]
          },
        ]
      }
      conceptos_gasto: {
        Row: {
          categoria: string
          centro_costo_id: string | null
          codigo: string
          created_at: string | null
          descripcion: string | null
          estado: string | null
          id: string
          limite_maximo: number | null
          nombre: string
          requiere_aprobacion: boolean | null
          updated_at: string | null
        }
        Insert: {
          categoria: string
          centro_costo_id?: string | null
          codigo: string
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          id?: string
          limite_maximo?: number | null
          nombre: string
          requiere_aprobacion?: boolean | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string
          centro_costo_id?: string | null
          codigo?: string
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          id?: string
          limite_maximo?: number | null
          nombre?: string
          requiere_aprobacion?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conceptos_gasto_centro_costo_id_fkey"
            columns: ["centro_costo_id"]
            isOneToOne: false
            referencedRelation: "centros_costo"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_usuarios: {
        Row: {
          created_at: string | null
          empresa_id: string
          fecha_asignacion: string | null
          id: string
          rol_en_empresa: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          empresa_id: string
          fecha_asignacion?: string | null
          id?: string
          rol_en_empresa?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          empresa_id?: string
          fecha_asignacion?: string | null
          id?: string
          rol_en_empresa?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresa_usuarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          created_at: string | null
          direccion: string | null
          email: string | null
          estado: string | null
          id: string
          limite_gasto_mensual: number | null
          logo_url: string | null
          moneda: string | null
          nombre_comercial: string | null
          razon_social: string
          ruc: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          limite_gasto_mensual?: number | null
          logo_url?: string | null
          moneda?: string | null
          nombre_comercial?: string | null
          razon_social: string
          ruc: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          limite_gasto_mensual?: number | null
          logo_url?: string | null
          moneda?: string | null
          nombre_comercial?: string | null
          razon_social?: string
          ruc?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gastos: {
        Row: {
          aprobado_en: string | null
          aprobado_por: string | null
          beneficiario_documento: string | null
          beneficiario_nombre: string | null
          beneficiario_tipo: string | null
          caja_id: string | null
          centro_costo_id: string | null
          codigo: string
          concepto_gasto_id: string
          created_at: string | null
          descripcion: string
          documento_id: string | null
          estado: string
          fecha_gasto: string
          forma_pago: string | null
          id: string
          moneda: string
          monto: number
          motivo_rechazo: string | null
          numero_operacion: string | null
          observaciones: string | null
          pagado_en: string | null
          pagado_por: string | null
          rechazado_en: string | null
          rechazado_por: string | null
          requiere_aprobacion: boolean | null
          tags: string[] | null
          tipo_cambio: number | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          aprobado_en?: string | null
          aprobado_por?: string | null
          beneficiario_documento?: string | null
          beneficiario_nombre?: string | null
          beneficiario_tipo?: string | null
          caja_id?: string | null
          centro_costo_id?: string | null
          codigo: string
          concepto_gasto_id: string
          created_at?: string | null
          descripcion: string
          documento_id?: string | null
          estado?: string
          fecha_gasto: string
          forma_pago?: string | null
          id?: string
          moneda?: string
          monto: number
          motivo_rechazo?: string | null
          numero_operacion?: string | null
          observaciones?: string | null
          pagado_en?: string | null
          pagado_por?: string | null
          rechazado_en?: string | null
          rechazado_por?: string | null
          requiere_aprobacion?: boolean | null
          tags?: string[] | null
          tipo_cambio?: number | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          aprobado_en?: string | null
          aprobado_por?: string | null
          beneficiario_documento?: string | null
          beneficiario_nombre?: string | null
          beneficiario_tipo?: string | null
          caja_id?: string | null
          centro_costo_id?: string | null
          codigo?: string
          concepto_gasto_id?: string
          created_at?: string | null
          descripcion?: string
          documento_id?: string | null
          estado?: string
          fecha_gasto?: string
          forma_pago?: string | null
          id?: string
          moneda?: string
          monto?: number
          motivo_rechazo?: string | null
          numero_operacion?: string | null
          observaciones?: string | null
          pagado_en?: string | null
          pagado_por?: string | null
          rechazado_en?: string | null
          rechazado_por?: string | null
          requiere_aprobacion?: boolean | null
          tags?: string[] | null
          tipo_cambio?: number | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gastos_caja_id_fkey"
            columns: ["caja_id"]
            isOneToOne: false
            referencedRelation: "cajas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_centro_costo_id_fkey"
            columns: ["centro_costo_id"]
            isOneToOne: false
            referencedRelation: "centros_costo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_concepto_gasto_id_fkey"
            columns: ["concepto_gasto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_gasto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "gastos_documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "vista_gastos_documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos_documentos: {
        Row: {
          archivo_nombre: string
          archivo_tamano: number
          archivo_tipo: string
          archivo_url: string
          caja_id: string | null
          cliente_direccion: string | null
          cliente_documento: string | null
          cliente_nombre: string | null
          codigo_qr: string | null
          concepto_gasto_id: string | null
          condiciones_pago: string | null
          confianza_ocr: number | null
          created_at: string | null
          descuento: number | null
          detraccion: number | null
          emisor_direccion: string | null
          emisor_email: string | null
          emisor_razon_social: string | null
          emisor_ruc: string | null
          emisor_telefono: string | null
          estado: string | null
          fecha_emision: string
          fecha_vencimiento: string | null
          forma_pago: string | null
          glosa: string | null
          hash_validacion: string | null
          id: string
          igv: number
          items: Json | null
          moneda: string
          numero_documento: string
          observaciones: string | null
          procesado_por: string | null
          requiere_validacion: boolean | null
          subtotal: number
          texto_raw: string | null
          tipo_cambio: number | null
          tipo_documento: string
          total: number
          updated_at: string | null
          usuario_id: string | null
          validado_en: string | null
          validado_manualmente: boolean | null
          validado_por: string | null
          validado_sunat: boolean | null
        }
        Insert: {
          archivo_nombre: string
          archivo_tamano: number
          archivo_tipo: string
          archivo_url: string
          caja_id?: string | null
          cliente_direccion?: string | null
          cliente_documento?: string | null
          cliente_nombre?: string | null
          codigo_qr?: string | null
          concepto_gasto_id?: string | null
          condiciones_pago?: string | null
          confianza_ocr?: number | null
          created_at?: string | null
          descuento?: number | null
          detraccion?: number | null
          emisor_direccion?: string | null
          emisor_email?: string | null
          emisor_razon_social?: string | null
          emisor_ruc?: string | null
          emisor_telefono?: string | null
          estado?: string | null
          fecha_emision: string
          fecha_vencimiento?: string | null
          forma_pago?: string | null
          glosa?: string | null
          hash_validacion?: string | null
          id?: string
          igv?: number
          items?: Json | null
          moneda?: string
          numero_documento: string
          observaciones?: string | null
          procesado_por?: string | null
          requiere_validacion?: boolean | null
          subtotal: number
          texto_raw?: string | null
          tipo_cambio?: number | null
          tipo_documento: string
          total: number
          updated_at?: string | null
          usuario_id?: string | null
          validado_en?: string | null
          validado_manualmente?: boolean | null
          validado_por?: string | null
          validado_sunat?: boolean | null
        }
        Update: {
          archivo_nombre?: string
          archivo_tamano?: number
          archivo_tipo?: string
          archivo_url?: string
          caja_id?: string | null
          cliente_direccion?: string | null
          cliente_documento?: string | null
          cliente_nombre?: string | null
          codigo_qr?: string | null
          concepto_gasto_id?: string | null
          condiciones_pago?: string | null
          confianza_ocr?: number | null
          created_at?: string | null
          descuento?: number | null
          detraccion?: number | null
          emisor_direccion?: string | null
          emisor_email?: string | null
          emisor_razon_social?: string | null
          emisor_ruc?: string | null
          emisor_telefono?: string | null
          estado?: string | null
          fecha_emision?: string
          fecha_vencimiento?: string | null
          forma_pago?: string | null
          glosa?: string | null
          hash_validacion?: string | null
          id?: string
          igv?: number
          items?: Json | null
          moneda?: string
          numero_documento?: string
          observaciones?: string | null
          procesado_por?: string | null
          requiere_validacion?: boolean | null
          subtotal?: number
          texto_raw?: string | null
          tipo_cambio?: number | null
          tipo_documento?: string
          total?: number
          updated_at?: string | null
          usuario_id?: string | null
          validado_en?: string | null
          validado_manualmente?: boolean | null
          validado_por?: string | null
          validado_sunat?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "gastos_documentos_caja_id_fkey"
            columns: ["caja_id"]
            isOneToOne: false
            referencedRelation: "cajas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_documentos_concepto_gasto_id_fkey"
            columns: ["concepto_gasto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_gasto"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos_historial: {
        Row: {
          accion: string
          comentario: string | null
          created_at: string | null
          estado_anterior: string | null
          estado_nuevo: string | null
          gasto_id: string
          id: string
          usuario_id: string
        }
        Insert: {
          accion: string
          comentario?: string | null
          created_at?: string | null
          estado_anterior?: string | null
          estado_nuevo?: string | null
          gasto_id: string
          id?: string
          usuario_id: string
        }
        Update: {
          accion?: string
          comentario?: string | null
          created_at?: string | null
          estado_anterior?: string | null
          estado_nuevo?: string | null
          gasto_id?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gastos_historial_gasto_id_fkey"
            columns: ["gasto_id"]
            isOneToOne: false
            referencedRelation: "gastos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_historial_gasto_id_fkey"
            columns: ["gasto_id"]
            isOneToOne: false
            referencedRelation: "vista_gastos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sucursales: {
        Row: {
          ciudad: string
          codigo: string
          created_at: string | null
          direccion: string
          empresa_id: string
          estado: string | null
          id: string
          nombre: string
          region: string
          responsable_id: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          ciudad: string
          codigo: string
          created_at?: string | null
          direccion: string
          empresa_id: string
          estado?: string | null
          id?: string
          nombre: string
          region: string
          responsable_id?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          ciudad?: string
          codigo?: string
          created_at?: string | null
          direccion?: string
          empresa_id?: string
          estado?: string | null
          id?: string
          nombre?: string
          region?: string
          responsable_id?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sucursales_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sucursales_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vista_gastos: {
        Row: {
          aprobado_en: string | null
          aprobado_por: string | null
          aprobado_por_email: string | null
          beneficiario_documento: string | null
          beneficiario_nombre: string | null
          beneficiario_tipo: string | null
          caja_id: string | null
          caja_nombre: string | null
          centro_costo_id: string | null
          centro_costo_nombre: string | null
          codigo: string | null
          concepto_categoria: string | null
          concepto_gasto_id: string | null
          concepto_limite: number | null
          concepto_nombre: string | null
          created_at: string | null
          descripcion: string | null
          dias_desde_gasto: number | null
          documento_id: string | null
          documento_numero: string | null
          documento_tipo: string | null
          documento_url: string | null
          estado: string | null
          excede_limite: boolean | null
          fecha_gasto: string | null
          forma_pago: string | null
          id: string | null
          moneda: string | null
          monto: number | null
          motivo_rechazo: string | null
          numero_operacion: string | null
          observaciones: string | null
          pagado_en: string | null
          pagado_por: string | null
          pagado_por_email: string | null
          rechazado_en: string | null
          rechazado_por: string | null
          requiere_aprobacion: boolean | null
          tags: string[] | null
          tipo_cambio: number | null
          updated_at: string | null
          usuario_email: string | null
          usuario_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gastos_caja_id_fkey"
            columns: ["caja_id"]
            isOneToOne: false
            referencedRelation: "cajas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_centro_costo_id_fkey"
            columns: ["centro_costo_id"]
            isOneToOne: false
            referencedRelation: "centros_costo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_concepto_gasto_id_fkey"
            columns: ["concepto_gasto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_gasto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "gastos_documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "vista_gastos_documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      vista_gastos_documentos: {
        Row: {
          archivo_nombre: string | null
          archivo_tamano: number | null
          archivo_tipo: string | null
          archivo_url: string | null
          caja_id: string | null
          caja_nombre: string | null
          cliente_direccion: string | null
          cliente_documento: string | null
          cliente_nombre: string | null
          codigo_qr: string | null
          concepto_categoria: string | null
          concepto_gasto_id: string | null
          concepto_nombre: string | null
          condiciones_pago: string | null
          confianza_ocr: number | null
          created_at: string | null
          descuento: number | null
          detraccion: number | null
          dias_desde_emision: number | null
          emisor_direccion: string | null
          emisor_email: string | null
          emisor_razon_social: string | null
          emisor_ruc: string | null
          emisor_telefono: string | null
          esta_vencido: boolean | null
          estado: string | null
          fecha_emision: string | null
          fecha_vencimiento: string | null
          forma_pago: string | null
          glosa: string | null
          hash_validacion: string | null
          id: string | null
          igv: number | null
          items: Json | null
          moneda: string | null
          numero_documento: string | null
          observaciones: string | null
          procesado_por: string | null
          requiere_validacion: boolean | null
          subtotal: number | null
          texto_raw: string | null
          tipo_cambio: number | null
          tipo_documento: string | null
          total: number | null
          total_pen: number | null
          updated_at: string | null
          usuario_id: string | null
          validado_en: string | null
          validado_manualmente: boolean | null
          validado_por: string | null
          validado_sunat: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "gastos_documentos_caja_id_fkey"
            columns: ["caja_id"]
            isOneToOne: false
            referencedRelation: "cajas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_documentos_concepto_gasto_id_fkey"
            columns: ["concepto_gasto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_gasto"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      obtener_estadisticas_gastos: {
        Args: {
          p_fecha_desde?: string
          p_fecha_hasta?: string
          p_usuario_id?: string
        }
        Returns: {
          gastos_aprobados: number
          gastos_pagados: number
          gastos_pendientes: number
          gastos_rechazados: number
          monto_aprobado_pen: number
          monto_pendiente_pen: number
          monto_total_pen: number
          total_gastos: number
        }[]
      }
      obtener_estadisticas_ocr: {
        Args: {
          p_fecha_desde?: string
          p_fecha_hasta?: string
          p_usuario_id?: string
        }
        Returns: {
          confianza_promedio: number
          documentos_pendientes: number
          documentos_por_tipo: Json
          documentos_validados: number
          total_documentos: number
          total_monto_pen: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
