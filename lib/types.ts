// src/types.ts ou similar
import { Timestamp } from 'firebase/firestore';

export interface ServiceResponse {
  codRet: 0 | 1; // 0 para sucesso, 1 para erro
  msgRet: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string; // Em produção, deve ser armazenada de forma segura (hash)
  tipo: "professor" | "coordenador" | "suporte" | undefined;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  ativo: boolean; // Indica se o usuário está ativo
  foto: string; // URL da foto do usuário
  ultimoAcesso?: Timestamp; // Data do último acesso do usuário
  departamento?: string; // Departamento do usuário, se aplicável
  telefone?: string; // Telefone do usuário, se aplicável
}


export interface Sala {
  id: string;
  nome: string;
  capacidade: number;
  equipamentos: string[];
  status: "disponivel" | "ocupada" | "manutencao";
  localizacao: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Aula {
  id: string;
  disciplina: string;
  professor: string;
  professorId: string;
  salaId: string;
  sala: string;
  dataHora: Timestamp; // Alterado para Timestamp para melhor consulta
  duracao: number; // em minutos
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Chamado {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "manutencao" | "equipamento" | "limpeza" | "outro";
  prioridade: "baixa" | "media" | "alta" | "urgente";
  status: "aberto" | "em_andamento" | "resolvido" | "fechado";
  salaId?: string;
  sala?: string;
  solicitante: string;
  solicitanteId: string;
  responsavel?: string;
  responsavelId?: string;
  dataAbertura: Timestamp; // Alterado para Timestamp
  dataResolucao?: Timestamp;
  observacoes?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}