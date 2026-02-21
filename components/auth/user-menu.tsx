'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'

interface UserMenuProps {
  userEmail?: string
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      toast.success('Logout realizado com sucesso')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Erro ao fazer logout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {userEmail && (
        <div className="flex items-center gap-2 text-sm">
          <User className="size-4" />
          <span className="text-muted-foreground max-w-[150px] truncate">
            {userEmail}
          </span>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={loading}
      >
        <LogOut className="mr-2 size-4" />
        {loading ? 'Saindo...' : 'Sair'}
      </Button>
    </div>
  )
}
