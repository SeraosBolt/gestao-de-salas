"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isTokenValid } from "@/lib/auth"
import type { Usuario } from "@/lib/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("professor" | "coordenador" | "suporte" | undefined)[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if token is valid first
    if (!isTokenValid()) {
      router.push("/login")
      return
    }

    const user = getCurrentUser()

    if (!user) {
      router.push("/login")
      return
    }

    if (allowedRoles && !allowedRoles.includes(user.tipo)) {
      router.push("/")
      return
    }

    setUsuario(user)
    setCarregando(false)
  }, [router, allowedRoles])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!usuario) {
    return null
  }

  return <>{children}</>
}
