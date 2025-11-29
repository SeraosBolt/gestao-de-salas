import { aulaService } from '@/lib/service/aula.service';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da aula é obrigatório' },
        { status: 400 }
      );
    }

    const result = await aulaService.delete(id);
    
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
    console.error('Erro ao excluir aula:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao excluir aula' },
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
    const aulaData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da aula é obrigatório' },
        { status: 400 }
      );
    }

    const result = await aulaService.update(id, aulaData);
    
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
    console.error('Erro ao atualizar aula:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao atualizar aula' },
      { status: 500 }
    );
  }
}
