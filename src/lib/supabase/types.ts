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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          apelido: string | null
          bairro: string
          cep: string
          cidade: string
          complemento: string | null
          customer_id: string
          id: string
          logradouro: string
          numero: string
          padrao: boolean
          uf: string
        }
        Insert: {
          apelido?: string | null
          bairro: string
          cep: string
          cidade: string
          complemento?: string | null
          customer_id: string
          id?: string
          logradouro: string
          numero: string
          padrao?: boolean
          uf: string
        }
        Update: {
          apelido?: string | null
          bairro?: string
          cep?: string
          cidade?: string
          complemento?: string | null
          customer_id?: string
          id?: string
          logradouro?: string
          numero?: string
          padrao?: boolean
          uf?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      attribute_options: {
        Row: {
          attribute_id: string
          codigo: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          attribute_id: string
          codigo: string
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          attribute_id?: string
          codigo?: string
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "attribute_options_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      attributes: {
        Row: {
          codigo: string
          filtravel: boolean
          id: string
          nome: string
          ordem: number
          tipo: string
        }
        Insert: {
          codigo: string
          filtravel?: boolean
          id?: string
          nome: string
          ordem?: number
          tipo?: string
        }
        Update: {
          codigo?: string
          filtravel?: boolean
          id?: string
          nome?: string
          ordem?: number
          tipo?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          ativo: boolean
          descricao: string | null
          id: string
          logo_url: string | null
          nome: string
          site_url: string | null
          slug: string
        }
        Insert: {
          ativo?: boolean
          descricao?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          site_url?: string | null
          slug: string
        }
        Update: {
          ativo?: boolean
          descricao?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          site_url?: string | null
          slug?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          id: string
          quantidade: number
          variant_id: string
        }
        Insert: {
          cart_id: string
          id?: string
          quantidade: number
          variant_id: string
        }
        Update: {
          cart_id?: string
          id?: string
          quantidade?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          session_token: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          session_token?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          session_token?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_drafts: {
        Row: {
          confianca: number | null
          created_at: string
          id: string
          midia_urls: string[]
          origem: string
          payload: Json
          product_id: string | null
          revisado_por: string | null
          status: Database["public"]["Enums"]["draft_status"]
          transcricao: string | null
          vendor_id: string
        }
        Insert: {
          confianca?: number | null
          created_at?: string
          id?: string
          midia_urls?: string[]
          origem?: string
          payload: Json
          product_id?: string | null
          revisado_por?: string | null
          status?: Database["public"]["Enums"]["draft_status"]
          transcricao?: string | null
          vendor_id: string
        }
        Update: {
          confianca?: number | null
          created_at?: string
          id?: string
          midia_urls?: string[]
          origem?: string
          payload?: Json
          product_id?: string | null
          revisado_por?: string | null
          status?: Database["public"]["Enums"]["draft_status"]
          transcricao?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_drafts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_drafts_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_drafts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          ativo: boolean
          descricao: string | null
          id: string
          nome: string
          ordem: number
          parent_id: string | null
          slug: string
        }
        Insert: {
          ativo?: boolean
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number
          parent_id?: string | null
          slug: string
        }
        Update: {
          ativo?: boolean
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_recommendations: {
        Row: {
          consultation_id: string
          convertido: boolean
          id: string
          justificativa: string
          ordem: number
          variant_id: string
        }
        Insert: {
          consultation_id: string
          convertido?: boolean
          id?: string
          justificativa: string
          ordem?: number
          variant_id: string
        }
        Update: {
          consultation_id?: string
          convertido?: boolean
          id?: string
          justificativa?: string
          ordem?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_recommendations_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_recommendations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          created_at: string
          customer_id: string | null
          diagnostico: string | null
          id: string
          respostas: Json
          session_token: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          diagnostico?: string | null
          id?: string
          respostas: Json
          session_token?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          diagnostico?: string | null
          id?: string
          respostas?: Json
          session_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          ativo: boolean
          codigo: string
          fim: string | null
          id: string
          inicio: string | null
          minimo_pedido: number
          tipo: string
          usos: number
          usos_max: number | null
          valor: number
        }
        Insert: {
          ativo?: boolean
          codigo: string
          fim?: string | null
          id?: string
          inicio?: string | null
          minimo_pedido?: number
          tipo: string
          usos?: number
          usos_max?: number | null
          valor?: number
        }
        Update: {
          ativo?: boolean
          codigo?: string
          fim?: string | null
          id?: string
          inicio?: string | null
          minimo_pedido?: number
          tipo?: string
          usos?: number
          usos_max?: number | null
          valor?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          aceita_mkt: boolean
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          aceita_mkt?: boolean
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          aceita_mkt?: boolean
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          location_id: string
          minimo: number
          quantidade: number
          reservado: number
          variant_id: string
        }
        Insert: {
          location_id: string
          minimo?: number
          quantidade?: number
          reservado?: number
          variant_id: string
        }
        Update: {
          location_id?: string
          minimo?: number
          quantidade?: number
          reservado?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          location_id: string
          nota_entrada_id: string | null
          observacao: string | null
          order_id: string | null
          quantidade: number
          tipo: Database["public"]["Enums"]["movimento_tipo"]
          variant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          location_id: string
          nota_entrada_id?: string | null
          observacao?: string | null
          order_id?: string | null
          quantidade: number
          tipo: Database["public"]["Enums"]["movimento_tipo"]
          variant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string
          nota_entrada_id?: string | null
          observacao?: string | null
          order_id?: string | null
          quantidade?: number
          tipo?: Database["public"]["Enums"]["movimento_tipo"]
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_nota_entrada_id_fkey"
            columns: ["nota_entrada_id"]
            isOneToOne: false
            referencedRelation: "nota_entrada"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_order_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      nota_entrada: {
        Row: {
          arquivo_url: string | null
          chave_nfe: string | null
          created_at: string
          data_emissao: string
          id: string
          numero: string
          serie: string | null
          supplier_id: string
          valor_total: number | null
        }
        Insert: {
          arquivo_url?: string | null
          chave_nfe?: string | null
          created_at?: string
          data_emissao: string
          id?: string
          numero: string
          serie?: string | null
          supplier_id: string
          valor_total?: number | null
        }
        Update: {
          arquivo_url?: string | null
          chave_nfe?: string | null
          created_at?: string
          data_emissao?: string
          id?: string
          numero?: string
          serie?: string | null
          supplier_id?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nota_entrada_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      nota_entrada_itens: {
        Row: {
          custo_unitario: number
          id: string
          nota_entrada_id: string
          quantidade: number
          variant_id: string
        }
        Insert: {
          custo_unitario: number
          id?: string
          nota_entrada_id: string
          quantidade: number
          variant_id: string
        }
        Update: {
          custo_unitario?: number
          id?: string
          nota_entrada_id?: string
          quantidade?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nota_entrada_itens_nota_entrada_id_fkey"
            columns: ["nota_entrada_id"]
            isOneToOne: false
            referencedRelation: "nota_entrada"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nota_entrada_itens_variant_fk"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          comissao_pct: number
          id: string
          order_id: string
          preco_unitario: number
          produto_nome: string
          quantidade: number
          sku: string
          total_linha: number
          variant_id: string
          variante_nome: string
          vendor_id: string
        }
        Insert: {
          comissao_pct?: number
          id?: string
          order_id: string
          preco_unitario: number
          produto_nome: string
          quantidade: number
          sku: string
          total_linha: number
          variant_id: string
          variante_nome: string
          vendor_id: string
        }
        Update: {
          comissao_pct?: number
          id?: string
          order_id?: string
          preco_unitario?: number
          produto_nome?: string
          quantidade?: number
          sku?: string
          total_linha?: number
          variant_id?: string
          variante_nome?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      order_shipments: {
        Row: {
          codigo_rastreio: string | null
          enviado_em: string | null
          etiqueta_url: string | null
          id: string
          nfe_chave: string | null
          nfe_pdf_url: string | null
          order_id: string
          status: string
          tipo: Database["public"]["Enums"]["entrega_tipo"]
          transportadora: string | null
          valor_frete: number
          vendor_id: string
        }
        Insert: {
          codigo_rastreio?: string | null
          enviado_em?: string | null
          etiqueta_url?: string | null
          id?: string
          nfe_chave?: string | null
          nfe_pdf_url?: string | null
          order_id: string
          status?: string
          tipo: Database["public"]["Enums"]["entrega_tipo"]
          transportadora?: string | null
          valor_frete?: number
          vendor_id: string
        }
        Update: {
          codigo_rastreio?: string | null
          enviado_em?: string | null
          etiqueta_url?: string | null
          id?: string
          nfe_chave?: string | null
          nfe_pdf_url?: string | null
          order_id?: string
          status?: string
          tipo?: Database["public"]["Enums"]["entrega_tipo"]
          transportadora?: string | null
          valor_frete?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_shipments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          created_at: string
          cupom_codigo: string | null
          customer_id: string
          desconto_total: number
          frete_total: number
          id: string
          numero: number
          observacoes: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          created_at?: string
          cupom_codigo?: string | null
          customer_id: string
          desconto_total?: number
          frete_total?: number
          id?: string
          numero?: never
          observacoes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          created_at?: string
          cupom_codigo?: string | null
          customer_id?: string
          desconto_total?: number
          frete_total?: number
          id?: string
          numero?: never
          observacoes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_splits: {
        Row: {
          comissao: number
          id: string
          liberado_em: string | null
          payment_id: string
          status: string
          valor_bruto: number
          valor_liquido: number
          vendor_id: string
        }
        Insert: {
          comissao?: number
          id?: string
          liberado_em?: string | null
          payment_id: string
          status?: string
          valor_bruto: number
          valor_liquido: number
          vendor_id: string
        }
        Update: {
          comissao?: number
          id?: string
          liberado_em?: string | null
          payment_id?: string
          status?: string
          valor_bruto?: number
          valor_liquido?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_splits_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_splits_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          gateway: string
          gateway_payment_id: string | null
          id: string
          metodo: Database["public"]["Enums"]["pagamento_metodo"]
          order_id: string
          pago_em: string | null
          parcelas: number
          raw: Json | null
          status: Database["public"]["Enums"]["pagamento_status"]
          valor: number
        }
        Insert: {
          gateway: string
          gateway_payment_id?: string | null
          id?: string
          metodo: Database["public"]["Enums"]["pagamento_metodo"]
          order_id: string
          pago_em?: string | null
          parcelas?: number
          raw?: Json | null
          status?: Database["public"]["Enums"]["pagamento_status"]
          valor: number
        }
        Update: {
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          metodo?: Database["public"]["Enums"]["pagamento_metodo"]
          order_id?: string
          pago_em?: string | null
          parcelas?: number
          raw?: Json | null
          status?: Database["public"]["Enums"]["pagamento_status"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_attributes: {
        Row: {
          option_id: string
          product_id: string
        }
        Insert: {
          option_id: string
          product_id: string
        }
        Update: {
          option_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_attributes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "attribute_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          alt: string
          id: string
          ordem: number
          product_id: string
          tipo: string
          url: string
        }
        Insert: {
          alt: string
          id?: string
          ordem?: number
          product_id: string
          tipo?: string
          url: string
        }
        Update: {
          alt?: string
          id?: string
          ordem?: number
          product_id?: string
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          altura_cm: number | null
          ativo: boolean
          ean: string | null
          id: string
          largura_cm: number | null
          nome: string
          ordem: number
          peso_g: number
          preco: number
          preco_promocional: number | null
          product_id: string
          profundidade_cm: number | null
          sku: string
        }
        Insert: {
          altura_cm?: number | null
          ativo?: boolean
          ean?: string | null
          id?: string
          largura_cm?: number | null
          nome: string
          ordem?: number
          peso_g?: number
          preco: number
          preco_promocional?: number | null
          product_id: string
          profundidade_cm?: number | null
          sku: string
        }
        Update: {
          altura_cm?: number | null
          ativo?: boolean
          ean?: string | null
          id?: string
          largura_cm?: number | null
          nome?: string
          ordem?: number
          peso_g?: number
          preco?: number
          preco_promocional?: number | null
          product_id?: string
          profundidade_cm?: number | null
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          categoria_regulada: boolean
          category_id: string
          cest: string | null
          created_at: string
          descricao: string | null
          descricao_curta: string | null
          destaque: boolean
          id: string
          ingredientes: string | null
          meta_descricao: string | null
          meta_titulo: string | null
          modo_uso: string | null
          ncm: string | null
          nome: string
          origem: string | null
          publico: Database["public"]["Enums"]["publico_alvo"]
          registro_anvisa: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          brand_id?: string | null
          categoria_regulada?: boolean
          category_id: string
          cest?: string | null
          created_at?: string
          descricao?: string | null
          descricao_curta?: string | null
          destaque?: boolean
          id?: string
          ingredientes?: string | null
          meta_descricao?: string | null
          meta_titulo?: string | null
          modo_uso?: string | null
          ncm?: string | null
          nome: string
          origem?: string | null
          publico?: Database["public"]["Enums"]["publico_alvo"]
          registro_anvisa?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          brand_id?: string | null
          categoria_regulada?: boolean
          category_id?: string
          cest?: string | null
          created_at?: string
          descricao?: string | null
          descricao_curta?: string | null
          destaque?: boolean
          id?: string
          ingredientes?: string | null
          meta_descricao?: string | null
          meta_titulo?: string | null
          modo_uso?: string | null
          ncm?: string | null
          nome?: string
          origem?: string | null
          publico?: Database["public"]["Enums"]["publico_alvo"]
          registro_anvisa?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string
          papel: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          nome: string
          papel?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          papel?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_locations: {
        Row: {
          id: string
          nome: string
          vendavel: boolean
        }
        Insert: {
          id?: string
          nome: string
          vendavel?: boolean
        }
        Update: {
          id?: string
          nome?: string
          vendavel?: boolean
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          cnpj: string | null
          contato: string | null
          id: string
          nome: string
          observacoes: string | null
        }
        Insert: {
          cnpj?: string | null
          contato?: string | null
          id?: string
          nome: string
          observacoes?: string | null
        }
        Update: {
          cnpj?: string | null
          contato?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          cnpj: string | null
          comissao_pct: number | null
          created_at: string
          email: string | null
          emite_nfe: boolean
          gateway_account_id: string | null
          id: string
          inscricao_estadual: string | null
          nome: string
          slug: string
          status: Database["public"]["Enums"]["vendor_status"]
          telefone: string | null
          tipo: Database["public"]["Enums"]["vendor_tipo"]
        }
        Insert: {
          cnpj?: string | null
          comissao_pct?: number | null
          created_at?: string
          email?: string | null
          emite_nfe?: boolean
          gateway_account_id?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome: string
          slug: string
          status?: Database["public"]["Enums"]["vendor_status"]
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["vendor_tipo"]
        }
        Update: {
          cnpj?: string | null
          comissao_pct?: number | null
          created_at?: string
          email?: string | null
          emite_nfe?: boolean
          gateway_account_id?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome?: string
          slug?: string
          status?: Database["public"]["Enums"]["vendor_status"]
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["vendor_tipo"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_customer_id: { Args: never; Returns: string }
      fn_papel: { Args: never; Returns: string }
      fn_produto_publico: { Args: { p_id: string }; Returns: boolean }
      fn_staff: { Args: never; Returns: boolean }
      fn_valida_cupom: {
        Args: { p_codigo: string; p_subtotal: number }
        Returns: {
          motivo: string
          tipo: string
          valido: boolean
          valor: number
        }[]
      }
      fn_vendor: { Args: never; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      draft_status: "gerado" | "em_revisao" | "aprovado" | "descartado"
      entrega_tipo:
        | "correios"
        | "transportadora"
        | "retirada_salao"
        | "entrega_local"
      movimento_tipo:
        | "entrada_compra"
        | "venda"
        | "uso_interno"
        | "devolucao"
        | "perda"
        | "ajuste"
      order_status:
        | "aguardando_pagamento"
        | "pago"
        | "em_separacao"
        | "enviado"
        | "pronto_retirada"
        | "concluido"
        | "cancelado"
        | "estornado"
      pagamento_metodo: "pix" | "cartao_credito" | "boleto"
      pagamento_status:
        | "pendente"
        | "aprovado"
        | "recusado"
        | "estornado"
        | "chargeback"
      product_status: "rascunho" | "revisao" | "ativo" | "pausado" | "arquivado"
      publico_alvo: "consumidor" | "profissional"
      vendor_status: "ativo" | "pausado" | "pendente"
      vendor_tipo: "proprio" | "parceiro"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      draft_status: ["gerado", "em_revisao", "aprovado", "descartado"],
      entrega_tipo: [
        "correios",
        "transportadora",
        "retirada_salao",
        "entrega_local",
      ],
      movimento_tipo: [
        "entrada_compra",
        "venda",
        "uso_interno",
        "devolucao",
        "perda",
        "ajuste",
      ],
      order_status: [
        "aguardando_pagamento",
        "pago",
        "em_separacao",
        "enviado",
        "pronto_retirada",
        "concluido",
        "cancelado",
        "estornado",
      ],
      pagamento_metodo: ["pix", "cartao_credito", "boleto"],
      pagamento_status: [
        "pendente",
        "aprovado",
        "recusado",
        "estornado",
        "chargeback",
      ],
      product_status: ["rascunho", "revisao", "ativo", "pausado", "arquivado"],
      publico_alvo: ["consumidor", "profissional"],
      vendor_status: ["ativo", "pausado", "pendente"],
      vendor_tipo: ["proprio", "parceiro"],
    },
  },
} as const
