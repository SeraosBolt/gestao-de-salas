import { suporteService } from '@/lib/service/suporte.service';
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

    const result = await suporteService.delete(id);
    
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

    const result = await suporteService.update(id, chamadoData);
    
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
    console.error('Erro ao atualizar chamado:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao atualizar chamado' },
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
        { error: 'ID do chamado é obrigatório' },
        { status: 400 }
      );
    }

    const chamado = await suporteService.getById(id);
    
    if (chamado) {
      return NextResponse.json(chamado, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Chamado não encontrado' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao buscar chamado:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar chamado' },
      { status: 500 }
    );
  }
}
