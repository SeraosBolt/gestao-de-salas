import { aulaService } from '@/lib/service/aula.service';
import { Aula } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const aulaData = (await request.json()) as Omit<Aula, 'id'>;
    
    // Validação básica
    if (!aulaData.disciplina) {
      return NextResponse.json(
        { error: 'Disciplina é obrigatória' },
        { status: 400 }
      );
    }
    
    if (!aulaData.professores || aulaData.professores.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos um professor é obrigatório' },
        { status: 400 }
      );
    }
    
    const result = await aulaService.create(aulaData);
    
    if (result.codRet === 1) {
      return NextResponse.json(
        { error: result.msgRet },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { id: result.aulaId, message: result.msgRet },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao criar aula', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar aula' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const aulas = await aulaService.getAll();
    return NextResponse.json(aulas, {
      status: 200,
    });
  } catch (error: any) {
    console.error('Erro ao buscar aulas:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar aulas' },
      { status: 500 }
    );
  }
}
