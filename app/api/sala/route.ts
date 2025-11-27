import { salaService } from '@/lib/service/sala.service';
import { Sala } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const salaData = (await request.json()) as Omit<Sala, 'id'>;
    
    // Validação básica
    if (!salaData.nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!salaData.capacidade || salaData.capacidade <= 0) {
      return NextResponse.json(
        { error: 'Capacidade deve ser maior que zero' },
        { status: 400 }
      );
    }
    
    if (!salaData.localizacao) {
      return NextResponse.json(
        { error: 'Localização é obrigatória' },
        { status: 400 }
      );
    }

    const result = await salaService.create(salaData);
    
    if (result.codRet === 0) {
      return NextResponse.json(
        { id: result.salaId, message: result.msgRet },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: result.msgRet },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao criar sala:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar sala' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const salas = await salaService.getAll();
    return NextResponse.json(salas, {
      status: 200,
    });
  } catch (error: any) {
    console.error('Erro ao buscar salas:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar salas' },
      { status: 500 }
    );
  }
}
