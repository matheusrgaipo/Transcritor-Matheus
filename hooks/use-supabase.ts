'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      try {
        console.log('🔍 useSupabase - Verificando usuário inicial...')
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('❌ Erro ao verificar usuário:', error)
          setUser(null)
        } else {
          console.log('👤 Usuário encontrado:', user ? 'Autenticado' : 'Não autenticado')
          setUser(user)
        }
      } catch (error) {
        console.error('🚨 Erro na verificação inicial:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Mudança de estado de auth:', event, session?.user ? 'Usuário logado' : 'Usuário deslogado')
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    try {
      console.log('🚪 Fazendo logout...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Erro no logout:', error)
        throw error
      }
      console.log('✅ Logout realizado com sucesso')
    } catch (error) {
      console.error('🚨 Erro no logout:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    supabase,
    signOut,
  }
} 