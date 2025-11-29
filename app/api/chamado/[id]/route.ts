import { chamadoService } from '@/lib/service/chamado.service';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do chamado é obrigatório' },
        { status: 400 }
      );
    }

    const result = await chamadoService.delete(id);
    
    if (result.codRet === 1) {
      return NextResponse.json(
        { error: result.msgRet },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: result.msgRet },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao excluir chamado:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao excluir chamado' },
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
    const chamadoData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do chamado é obrigatório' },
        { status: 400 }
      );
    }

    const result = await chamadoService.update(id, chamadoData);
    
    if (result.codRet === 1) {
      return NextResponse.json(
        { error: result.msgRet },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: result.msgRet },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar chamado:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao atualizar chamado' },
      { status: 500 }
    );
  }
}
