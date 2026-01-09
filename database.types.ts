
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string
          case_id: string | null
          user_id: string | null
          tipo: string
          status: string
          data_alvo: string | null
          resumo_ia: string | null
          sugestao_ia: string | null
          created_at: string | null
          updated_at: string | null
          numero_processo_ref: string | null
          data_atividade: string | null
          cargo_ref: string | null
          promotor_ref: string | null
          observacao: string | null
        }
        Insert: {
          id?: string
          case_id?: string | null
          user_id?: string | null
          tipo: string
          status?: string
          data_alvo?: string | null
          resumo_ia?: string | null
          sugestao_ia?: string | null
          created_at?: string | null
          updated_at?: string | null
          numero_processo_ref?: string | null
          data_atividade?: string | null
          cargo_ref?: string | null
          promotor_ref?: string | null
          observacao?: string | null
        }
        Update: {
          id?: string
          case_id?: string | null
          user_id?: string | null
          tipo?: string
          status?: string
          data_alvo?: string | null
          resumo_ia?: string | null
          sugestao_ia?: string | null
          created_at?: string | null
          updated_at?: string | null
          numero_processo_ref?: string | null
          data_atividade?: string | null
          cargo_ref?: string | null
          promotor_ref?: string | null
          observacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      anpp_requests: {
        Row: {
          id: string
          case_id: string | null
          user_id: string | null
          tipo_tramite: string | null
          prazo_defesa: number | null
          forma_celebracao: string | null
          contatos_vitima: string | null
          observacoes_gerais: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          case_id?: string | null
          user_id?: string | null
          tipo_tramite?: string | null
          prazo_defesa?: number | null
          forma_celebracao?: string | null
          contatos_vitima?: string | null
          observacoes_gerais?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          case_id?: string | null
          user_id?: string | null
          tipo_tramite?: string | null
          prazo_defesa?: number | null
          forma_celebracao?: string | null
          contatos_vitima?: string | null
          observacoes_gerais?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anpp_requests_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anpp_requests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      case_participants: {
        Row: {
          id: string
          case_id: string
          person_id: string
          role: string
          is_preso: boolean | null
          advogado_nome: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          case_id: string
          person_id: string
          role?: string
          is_preso?: boolean | null
          advogado_nome?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          case_id?: string
          person_id?: string
          role?: string
          is_preso?: boolean | null
          advogado_nome?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_participants_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_participants_person_id_fkey"
            columns: ["person_id"]
            referencedRelation: "global_people"
            referencedColumns: ["id"]
          }
        ]
      }
      cases: {
        Row: {
          id: string
          numero_processo: string
          cargo_id: number | null
          data_distribuicao: string | null
          status: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          numero_processo: string
          cargo_id?: number | null
          data_distribuicao?: string | null
          status?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          numero_processo?: string
          cargo_id?: number | null
          data_distribuicao?: string | null
          status?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_cargo_id_fkey"
            columns: ["cargo_id"]
            referencedRelation: "master_cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      escala_plantao: {
        Row: {
          id: number
          data: string
          dia_semana: string | null
          sala_audiencia: string | null
          created_at: string | null
          promotor_id: string | null
          observacao: string | null
          cargo_id: number | null
        }
        Insert: {
          id?: never
          data: string
          dia_semana?: string | null
          sala_audiencia?: string | null
          created_at?: string | null
          promotor_id?: string | null
          observacao?: string | null
          cargo_id?: number | null
        }
        Update: {
          id?: never
          data?: string
          dia_semana?: string | null
          sala_audiencia?: string | null
          created_at?: string | null
          promotor_id?: string | null
          observacao?: string | null
          cargo_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_escala_plantao_cargo"
            columns: ["cargo_id"]
            referencedRelation: "master_cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_escala_plantao_promotor"
            columns: ["promotor_id"]
            referencedRelation: "master_promotores"
            referencedColumns: ["id"]
          }
        ]
      }
      global_people: {
        Row: {
          id: string
          nome: string
          cpf: string | null
          rg: string | null
          data_nascimento: string | null
          nome_mae: string | null
          endereco_completo: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nome: string
          cpf?: string | null
          rg?: string | null
          data_nascimento?: string | null
          nome_mae?: string | null
          endereco_completo?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nome?: string
          cpf?: string | null
          rg?: string | null
          data_nascimento?: string | null
          nome_mae?: string | null
          endereco_completo?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      master_cargos: {
        Row: {
          id: number
          label: string
          numero_cargo: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: number
          label: string
          numero_cargo?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: number
          label?: string
          numero_cargo?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      master_promotores: {
        Row: {
          id: string
          nome: string
          sexo: "M" | "F" | null
          created_at: string | null
          email: string | null
        }
        Insert: {
          id?: string
          nome: string
          sexo?: "M" | "F" | null
          created_at?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          nome?: string
          sexo?: "M" | "F" | null
          created_at?: string | null
          email?: string | null
        }
        Relationships: []
      }
      mentor_chats: {
        Row: {
          id: string
          user_id: string | null
          titulo_conversa: string | null
          prompt_usuario: string | null
          resposta_ia: string | null
          arquivo_analisado_nome: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          titulo_conversa?: string | null
          prompt_usuario?: string | null
          resposta_ia?: string | null
          arquivo_analisado_nome?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          titulo_conversa?: string | null
          prompt_usuario?: string | null
          resposta_ia?: string | null
          arquivo_analisado_nome?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_chats_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      oficios: {
        Row: {
          id: string
          case_id: string | null
          user_id: string | null
          numero_oficio: string | null
          destinatario_orgao: string | null
          destinatario_nome: string | null
          template_usado: string | null
          conteudo_gerado: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          case_id?: string | null
          user_id?: string | null
          numero_oficio?: string | null
          destinatario_orgao?: string | null
          destinatario_nome?: string | null
          template_usado?: string | null
          conteudo_gerado?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          case_id?: string | null
          user_id?: string | null
          numero_oficio?: string | null
          destinatario_orgao?: string | null
          destinatario_nome?: string | null
          template_usado?: string | null
          conteudo_gerado?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oficios_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oficios_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string | null
          matricula: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string | null
          matricula?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string | null
          matricula?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tb_atendimento_publico: {
        Row: {
          id: number
          data: string
          dia_semana: string | null
          responsavel: string | null
        }
        Insert: {
          id?: never
          data: string
          dia_semana?: string | null
          responsavel?: string | null
        }
        Update: {
          id?: never
          data?: string
          dia_semana?: string | null
          responsavel?: string | null
        }
        Relationships: []
      }
      tb_cargos_acumulacoes: {
        Row: {
          id: number
          cargo_nome: string
          data_inicio: string | null
          data_fim: string | null
          eh_acumulacao: boolean | null
          created_at: string | null
          promotor_titular_id: string | null
          promotor_designado_id: string | null
        }
        Insert: {
          id?: never
          cargo_nome: string
          data_inicio?: string | null
          data_fim?: string | null
          eh_acumulacao?: boolean | null
          created_at?: string | null
          promotor_titular_id?: string | null
          promotor_designado_id?: string | null
        }
        Update: {
          id?: never
          cargo_nome?: string
          data_inicio?: string | null
          data_fim?: string | null
          eh_acumulacao?: boolean | null
          created_at?: string | null
          promotor_titular_id?: string | null
          promotor_designado_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tb_cargos_acumulacoes_promotor_designado_id_fkey"
            columns: ["promotor_designado_id"]
            referencedRelation: "master_promotores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_cargos_acumulacoes_promotor_titular_id_fkey"
            columns: ["promotor_titular_id"]
            referencedRelation: "master_promotores"
            referencedColumns: ["id"]
          }
        ]
      }
      tb_escala_analistas: {
        Row: {
          id: number
          cargo: string | null
          nome: string | null
          email: string | null
          created_at: string | null
          user_id: string | null
          cargo_id: number | null
        }
        Insert: {
          id?: never
          cargo?: string | null
          nome?: string | null
          email?: string | null
          created_at?: string | null
          user_id?: string | null
          cargo_id?: number | null
        }
        Update: {
          id?: never
          cargo?: string | null
          nome?: string | null
          email?: string | null
          created_at?: string | null
          user_id?: string | null
          cargo_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_escala_analistas_profile"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tb_escala_oficiais: {
        Row: {
          id: number
          data: string | null
          dia_semana: string | null
          nome_oficial: string | null
          equipe: string | null
        }
        Insert: {
          id?: never
          data?: string | null
          dia_semana?: string | null
          nome_oficial?: string | null
          equipe?: string | null
        }
        Update: {
          id?: never
          data?: string | null
          dia_semana?: string | null
          nome_oficial?: string | null
          equipe?: string | null
        }
        Relationships: []
      }
      tb_escala_presencial_membros: {
        Row: {
          id: number
          dia_semana: string
          dia_id: number
          cargo: string
          created_at: string | null
        }
        Insert: {
          id?: never
          dia_semana: string
          dia_id: number
          cargo: string
          created_at?: string | null
        }
        Update: {
          id?: never
          dia_semana?: string
          dia_id?: number
          cargo?: string
          created_at?: string | null
        }
        Relationships: []
      }
      tb_escala_varas: {
        Row: {
          id: number
          data: string
          vara: string
          promotor_1_id: string | null
          promotor_2_id: string | null
          cargo_1_id: number | null
          cargo_2_id: number | null
        }
        Insert: {
          id?: never
          data: string
          vara: string
          promotor_1_id?: string | null
          promotor_2_id?: string | null
          cargo_1_id?: number | null
          cargo_2_id?: number | null
        }
        Update: {
          id?: never
          data?: string
          vara?: string
          promotor_1_id?: string | null
          promotor_2_id?: string | null
          cargo_1_id?: number | null
          cargo_2_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_escala_varas_cargo1"
            columns: ["cargo_1_id"]
            referencedRelation: "master_cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_escala_varas_cargo2"
            columns: ["cargo_2_id"]
            referencedRelation: "master_cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_escala_varas_p1"
            columns: ["promotor_1_id"]
            referencedRelation: "master_promotores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_escala_varas_p2"
            columns: ["promotor_2_id"]
            referencedRelation: "master_promotores"
            referencedColumns: ["id"]
          }
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
      activity_status:
        | "NAO_VERIFICADO"
        | "PENDENTE"
        | "REVISAR"
        | "EM_ANDAMENTO"
        | "AGUARDANDO"
        | "FINALIZADO_NAO_CONCLUIDO"
        | "CONCLUIDO"
        | "FINALIZADO"
      case_status: "ATIVO" | "ARQUIVADO" | "SUSPENSO"
      person_role: "REU" | "VITIMA" | "TESTEMUNHA" | "OUTRO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
