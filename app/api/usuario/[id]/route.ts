import { usuarioService } from '@/lib/service/usuario.service';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    await usuarioService.delete(id);
    
    return NextResponse.json(
      { message: 'Usuário excluído com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao excluir usuário' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const usuarioData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const updatedUsuario = await usuarioService.update(id, usuarioData);
    
    return NextResponse.json(
      {
        message: 'Usuário atualizado com sucesso',
        usuario: updatedUsuario,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao atualizar usuário' },
      { status: 500 }
    );
  }
}
