import { chamadoService } from '@/lib/service/chamado.service';
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
    
    if (!chamadoData.solicitanteId) {
      return NextResponse.json(
        { error: 'Solicitante é obrigatório' },
        { status: 400 }
      );
    }
    
    const result = await chamadoService.create(chamadoData);
    
    if (result.codRet === 1) {
      return NextResponse.json(
        { error: result.msgRet },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { id: result.chamadoId, message: result.msgRet },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao criar chamado', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar chamado' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const chamados = await chamadoService.getAll();
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
