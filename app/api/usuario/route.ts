import { usuarioService } from '@/lib/service/usuario.service';
import { Usuario } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const UsuarioData = (await request.json()) as Omit<
      Usuario,
      'id' | 'created_at'
    >;
    // Adicionar validação para UsuarioData aqui
    if (!UsuarioData.email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }
    const UsuarioId = await usuarioService.create(UsuarioData);
    return NextResponse.json(
      { id: UsuarioId, message: 'Usuário criado com sucesso' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao criar Usuário', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar Usuário' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const usuarios = await usuarioService.getAll();
    return NextResponse.json(usuarios, {
      status: 200,
    });
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar usuários' },
      { status: 500 }
    );
  }
}

