import { usuarioService } from '@/lib/service/usuario.service';
import { Usuario } from '@/lib/types';
import { Import } from 'lucide-react';
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
    return new Response(JSON.stringify(usuarios), {
      headers: { 'content-type': 'application/json' },
      status: 201,
    });
  } catch (error: any) {
    console.error('Erro ao buscar empresas clientes:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar empresas clientes' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const UsuarioData = (await request.json()) as Usuario;
    if (!UsuarioData.id) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      );
    }
    const updatedUsuario = await usuarioService.update(
      UsuarioData.id,
      UsuarioData
    );
    return NextResponse.json(
      {
        message: 'Empresa cliente atualizada com sucesso',
        Usuario: updatedUsuario,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar empresa cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao atualizar empresa cliente' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      );
    }
    await usuarioService.delete(id);
    return NextResponse.json(
      { message: 'Empresa cliente excluída com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao excluir empresa cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao excluir empresa cliente' },
      { status: 500 }
    );
  }
}
