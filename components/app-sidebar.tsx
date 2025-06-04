"use client"

import type React from "react"

import { Home, Users, BookOpen, Headphones, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getCurrentUser, logout } from "@/lib/auth"
import type { Usuario } from "@/lib/types"

const menuItems = {
  coordenador: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Salas",
      url: "/salas",
      icon: Users,
    },
    {
      title: "Aulas",
      url: "/aulas",
      icon: BookOpen,
    },
    {
      title: "Suporte",
      url: "/suporte",
      icon: Headphones,
    },
  ],
  professor: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Minhas Aulas",
      url: "/aulas",
      icon: BookOpen,
    },
    {
      title: "Suporte",
      url: "/suporte",
      icon: Headphones,
    },
  ],
  suporte: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Chamados",
      url: "/suporte",
      icon: Headphones,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setUsuario(user)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!usuario) return null

  const items = menuItems[usuario.tipo] || []

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Settings className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Gestão Salas</h2>
            <p className="text-xs text-muted-foreground">Universidade</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>
              {usuario.nome
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{usuario.nome}</p>
            <p className="text-xs text-muted-foreground capitalize">{usuario.tipo}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
