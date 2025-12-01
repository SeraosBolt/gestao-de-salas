import { suporteService } from '@/lib/service/suporte.service';
import { Chamado } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const chamadoData = (await request.json()) as Omit<Chamado, 'id'>;
    
    // Validação básica
    if (!chamadoData.titulo) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!chamadoData.descricao) {
      return NextResponse.json(
        { error: 'Descrição é obrigatória' },
        { status: 400 }
      );
    }
    
    if (!chamadoData.solicitanteId) {
      return NextResponse.json(
        { error: 'Solicitante é obrigatório' },
        { status: 400 }
      );
    }

    const result = await suporteService.create(chamadoData);
    
    if (result.codRet === 0) {
      return NextResponse.json(
        { id: result.chamadoId, message: result.msgRet },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: result.msgRet },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao criar chamado:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar chamado' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const chamados = await suporteService.getAll();
    return NextResponse.json(chamados, {
      status: 200,
    });
  } catch (error: any) {
    console.error('Erro ao buscar chamados:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar chamados' },
      { status: 500 }
    );
  }
}
