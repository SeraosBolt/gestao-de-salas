import type { Usuario } from "./types"
import { usuarios } from "./data"

export function login(email: string, senha: string): Usuario | null {
  // Simulação de autenticação - em produção usar hash de senha
  const usuario = usuarios.find((u) => u.email === email)
  if (usuario && senha === "123456") {
    return usuario
  }
  return null
}

export function getCurrentUser(): Usuario | null {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

export function setCurrentUser(usuario: Usuario): void {
  localStorage.setItem("currentUser", JSON.stringify(usuario))
}

export function logout(): void {
  localStorage.removeItem("currentUser")
}
