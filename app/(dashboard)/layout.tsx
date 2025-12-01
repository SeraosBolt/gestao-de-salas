"use client"

import type React from "react"

import { useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Separator } from "@/components/ui/separator"
import { refreshToken, isTokenValid } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // Check token validity on mount and refresh if needed
    if (!isTokenValid()) {
      router.push("/login")
      return
    }

    // Refresh token to extend session
    refreshToken()

    // Set up periodic token refresh (every 30 minutes)
    const interval = setInterval(
      () => {
        if (isTokenValid()) {
          refreshToken()
        } else {
          router.push("/login")
        }
      },
      30 * 60 * 1000,
    ) // 30 minutes

    return () => clearInterval(interval)
  }, [router])

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <main className="flex-1 p-2 sm:p-4 overflow-x-hidden">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
