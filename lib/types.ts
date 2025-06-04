export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: "professor" | "coordenador" | "suporte"
}

export interface Sala {
  id: string
  nome: string
  capacidade: number
  equipamentos: string[]
  status: "disponivel" | "ocupada" | "manutencao"
  localizacao: string
}

export interface Aula {
  id: string
  disciplina: string
  professor: string
  professorId: string
  salaId: string
  sala: string
  dataHora: string
  duracao: number
  status: "agendada" | "em_andamento" | "concluida" | "cancelada"
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
