import { Timestamp } from "firebase/firestore"

export interface ServiceResponse {
  codRet: 0 | 1; // 0 para sucesso, 1 para erro
  msgRet: string;
}


export interface Usuario {
  id?: string;
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
  id: string
  nome: string
  capacidade: number
  equipamentos: string[]
  statusManual: "disponivel" | "indisponivel" | "manutencao" // Status set by user
  localizacao: string
}

export type StatusSalaCalculado = "disponivel" | "ocupada" | "indisponivel" | "manutencao"

export interface HorarioSemanal {
  diaSemana: number // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  horaInicio: string // "19:00"
  horaFim: string // "21:00"
}

export interface ProfessorSalaAssignment {
  professorId: string
  professorNome: string
  salaId: string
  salaNome: string
}

export interface Aula {
  id: string
  disciplina: string
  professores: {
    id: string
    nome: string
  }[]
  // Legacy - primary room
  salaId: string
  sala: string
  // New: professor-room assignments
  salasAtribuicoes?: ProfessorSalaAssignment[]
  horarios: HorarioSemanal[]
  // Legacy field for backward compatibility
  dataHora?: string
  duracao?: number
  status: "agendada" | "em_andamento" | "concluida" | "cancelada"
  cor?: string
  dataInicioAnoLetivo: string // "2024-02-05"
  dataFimAnoLetivo: string // "2024-12-15"
}

export interface AulaCalendarioItem {
  id: string
  aulaId: string
  disciplina: string
  professores: { id: string; nome: string }[]
  salaId: string
  sala: string
  data: Date
  horaInicio: string
  horaFim: string
  cor?: string
  status: Aula["status"]
}

export interface Chamado {
  id: string
  titulo: string
  descricao: string
  tipo: "manutencao" | "equipamento" | "limpeza" | "outro"
  prioridade: "baixa" | "media" | "alta" | "urgente"
  status: "aberto" | "em_andamento" | "resolvido" | "fechado"
  salaId?: string
  sala?: string
  solicitante: string
  solicitanteId: string
  responsavel?: string
  responsavelId?: string
  dataAbertura: string
  dataResolucao?: string
  observacoes?: string
}
