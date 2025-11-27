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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
