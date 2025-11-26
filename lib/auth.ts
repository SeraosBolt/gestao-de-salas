import type { Usuario } from './types';
// Simple token structure for client-side use
interface SimpleToken {
  userId: string | undefined;
  email: string;
  tipo: string | undefined;
  nome: string;
  timestamp: number;
  expiresAt: number;
}

const TOKEN_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
import { usuarioService } from './service/usuario.service';
import { Timestamp } from 'firebase/firestore';


export async function login(
  email: string,
  senha: string
): Promise<{ usuario: Usuario; token: string } | null> {
  try {
    console.log('🔐 Tentando login com email:', email);
    
    // Simulação de autenticação - em produção usar hash de senha
    const usuario = await usuarioService.getByEmail(email);
    
    if (!usuario) {
      console.warn('⚠️ Usuário não encontrado');
      return null;
    }
    
    console.log('👤 Usuário encontrado, verificando senha...');
    
    if (usuario.senha !== senha) {
      console.warn('⚠️ Senha incorreta');
      return null;
    }
    
    console.log('✅ Login bem-sucedido!');
    
    // Create simple token
    const token = generateToken(usuario);

    // Update last access time (in a real app, this would update the database)
    const updatedUser = { ...usuario, ultimoAcesso: Timestamp.now() };

    return { usuario: updatedUser, token };
  } catch (error: any) {
    console.error('❌ Erro durante login:', error);
    throw error;
  }
}
export function generateToken(usuario: Usuario): string {
  const tokenData: SimpleToken = {
    userId: usuario.id,
    email: usuario.email,
    tipo: usuario.tipo,
    nome: usuario.nome,
    timestamp: Date.now(),
    expiresAt: Date.now() + TOKEN_DURATION,
  };

  // Simple base64 encoding for client-side token
  return btoa(JSON.stringify(tokenData));
}

export function verifyToken(token: string): SimpleToken | null {
  try {
    const tokenData: SimpleToken = JSON.parse(atob(token));

    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      return null;
    }

    return tokenData;
  } catch (error) {
    return null;
  }
}

export function getCurrentUser(): Usuario | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  const tokenData = verifyToken(token);
  if (!tokenData) {
    // Token is invalid or expired
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    return null;
  }

  const userData = localStorage.getItem('currentUser');
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch (error) {
    return null;
  }
}

export function setCurrentUser(usuario: Usuario, token: string): void {
  localStorage.setItem('currentUser', JSON.stringify(usuario));
  localStorage.setItem('token', token);
}

export function logout(): void {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
}

// Check if user has required role
export function hasRole(requiredRoles: string[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return requiredRoles.includes(user.tipo ?? '');
}

// Check if user can access a specific feature
export function canAccess(feature: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  const permissions: Record<string, string[]> = {
    user_management: ['coordenador'],
    sala_management: ['coordenador'],
    aula_management: ['coordenador'],
    aula_view: ['coordenador', 'professor'],
    chamado_management: ['coordenador', 'suporte'],
    chamado_create: ['coordenador', 'professor', 'suporte'],
    chamado_resolve: ['coordenador', 'suporte'],
  };

  const allowedRoles = permissions[feature] || [];
  return allowedRoles.includes(user.tipo ?? '');
}

// Check if token is still valid
export function isTokenValid(): boolean {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('token');
  if (!token) return false;

  return verifyToken(token) !== null;
}

// Refresh token if needed (extend expiration)
export function refreshToken(): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  const newToken = generateToken(user);
  localStorage.setItem('token', newToken);
  return true;
}
