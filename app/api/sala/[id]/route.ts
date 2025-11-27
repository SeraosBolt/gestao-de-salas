import { salaService } from '@/lib/service/sala.service';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da sala é obrigatório' },
        { status: 400 }
      );
    }

    const result = await salaService.delete(id);
    
    if (result.codRet === 0) {
      return NextResponse.json(
        { message: result.msgRet },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.msgRet },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao excluir sala:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao excluir sala' },
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
    const salaData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da sala é obrigatório' },
        { status: 400 }
      );
    }

    const result = await salaService.update(id, salaData);
    
    if (result.codRet === 0) {
      return NextResponse.json(
        { message: result.msgRet },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.msgRet },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao atualizar sala:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao atualizar sala' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da sala é obrigatório' },
        { status: 400 }
      );
    }

    const sala = await salaService.getById(id);
    
    if (sala) {
      return NextResponse.json(sala, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao buscar sala:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar sala' },
      { status: 500 }
    );
  }
}
