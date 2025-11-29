"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar, Users, Building } from "lucide-react"
import type { Aula, Sala, HorarioSemanal } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  aulas: Aula[]
  salas: Sala[]
  onSelectSlot?: (diaSemana: number, horaInicio: string, salaId?: string) => void
  salaFiltro?: string
  showAllRooms?: boolean
  onEditAula: any
}

const HORAS_DIA = Array.from({ length: 17 }, (_, i) => i + 7) // 7:00 às 23:00

const DIAS_SEMANA = [
  { valor: 0, nome: "Domingo", abrev: "Dom" },
  { valor: 1, nome: "Segunda", abrev: "Seg" },
  { valor: 2, nome: "Terça", abrev: "Ter" },
  { valor: 3, nome: "Quarta", abrev: "Qua" },
  { valor: 4, nome: "Quinta", abrev: "Qui" },
  { valor: 5, nome: "Sexta", abrev: "Sex" },
  { valor: 6, nome: "Sábado", abrev: "Sáb" },
]

const CORES_AULAS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#14b8a6"]

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

const calcularDuracao = (horaInicio: string, horaFim: string): number => {
  return timeToMinutes(horaFim) - timeToMinutes(horaInicio)
}

interface AulaComPosicao {
  aula: Aula
  horario: HorarioSemanal
  coluna: number
  totalColunas: number
}

const temposSeOverlap = (inicio1: string, fim1: string, inicio2: string, fim2: string): boolean => {
  const start1 = timeToMinutes(inicio1)
  const end1 = timeToMinutes(fim1)
  const start2 = timeToMinutes(inicio2)
  const end2 = timeToMinutes(fim2)
  return start1 < end2 && start2 < end1
}

const calcularPosicoesAulas = (aulasNoDia: { aula: Aula; horario: HorarioSemanal }[]): AulaComPosicao[] => {
  if (aulasNoDia.length === 0) return []

  // Ordenar por horário de início
  const aulasOrdenadas = [...aulasNoDia].sort(
    (a, b) => timeToMinutes(a.horario.horaInicio) - timeToMinutes(b.horario.horaInicio),
  )

  // Encontrar grupos de aulas que se sobrepõem
  const grupos: { aula: Aula; horario: HorarioSemanal; index: number }[][] = []

  aulasOrdenadas.forEach((aulaInfo, index) => {
    // Verificar se esta aula se sobrepõe a algum grupo existente
    let grupoEncontrado = false

    for (const grupo of grupos) {
      const temOverlap = grupo.some((item) =>
        temposSeOverlap(
          item.horario.horaInicio,
          item.horario.horaFim,
          aulaInfo.horario.horaInicio,
          aulaInfo.horario.horaFim,
        ),
      )

      if (temOverlap) {
        grupo.push({ ...aulaInfo, index })
        grupoEncontrado = true
        break
      }
    }

    if (!grupoEncontrado) {
      grupos.push([{ ...aulaInfo, index }])
    }
  })

  // Agora precisamos verificar se grupos separados devem ser mesclados
  // porque uma aula pode conectar dois grupos
  let mergeHappened = true
  while (mergeHappened) {
    mergeHappened = false
    for (let i = 0; i < grupos.length; i++) {
      for (let j = i + 1; j < grupos.length; j++) {
        // Verificar se alguma aula do grupo i se sobrepõe com alguma do grupo j
        const shouldMerge = grupos[i].some((aulaI) =>
          grupos[j].some((aulaJ) =>
            temposSeOverlap(
              aulaI.horario.horaInicio,
              aulaI.horario.horaFim,
              aulaJ.horario.horaInicio,
              aulaJ.horario.horaFim,
            ),
          ),
        )

        if (shouldMerge) {
          grupos[i] = [...grupos[i], ...grupos[j]]
          grupos.splice(j, 1)
          mergeHappened = true
          break
        }
      }
      if (mergeHappened) break
    }
  }

  // Atribuir colunas dentro de cada grupo
  const resultado: AulaComPosicao[] = []

  grupos.forEach((grupo) => {
    // Ordenar o grupo por horário de início
    grupo.sort((a, b) => timeToMinutes(a.horario.horaInicio) - timeToMinutes(b.horario.horaInicio))

    // Colunas disponíveis (cada coluna tem o horário de fim da última aula nela)
    const colunas: number[] = []

    grupo.forEach((aulaInfo) => {
      const inicioMinutos = timeToMinutes(aulaInfo.horario.horaInicio)

      // Encontrar a primeira coluna disponível
      let colunaAtribuida = -1
      for (let c = 0; c < colunas.length; c++) {
        if (colunas[c] <= inicioMinutos) {
          colunaAtribuida = c
          break
        }
      }

      // Se não encontrou coluna disponível, criar nova
      if (colunaAtribuida === -1) {
        colunaAtribuida = colunas.length
        colunas.push(0)
      }

      // Atualizar o fim da coluna
      colunas[colunaAtribuida] = timeToMinutes(aulaInfo.horario.horaFim)

      resultado.push({
        aula: aulaInfo.aula,
        horario: aulaInfo.horario,
        coluna: colunaAtribuida,
        totalColunas: 0, // Será atualizado depois
      })
    })

    // Atualizar totalColunas para todas as aulas do grupo
    const totalColunas = colunas.length
    resultado.forEach((item) => {
      const pertenceAoGrupo = grupo.some(
        (g) => g.aula.id === item.aula.id && g.horario.horaInicio === item.horario.horaInicio,
      )
      if (pertenceAoGrupo) {
        item.totalColunas = totalColunas
      }
    })
  })

  return resultado
}

export function CalendarView({ aulas, salas, onSelectSlot, salaFiltro, showAllRooms = false }: CalendarViewProps) {
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [visao, setVisao] = useState<"semana" | "dia">("semana")
  const [aulaDetalhes, setAulaDetalhes] = useState<{
    aula: Aula
    horario: HorarioSemanal
  } | null>(null)
  const [salaId, setSalaId] = useState<string>(salaFiltro || "todas")
  const [horaAtual, setHoraAtual] = useState(new Date())
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Atualizar hora atual a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraAtual(new Date())
    }, 60000) // Atualiza a cada minuto

    return () => clearInterval(timer)
  }, [])

  // Scroll automático para a hora atual ao carregar
  useEffect(() => {
    if (scrollContainerRef.current) {
      const agora = new Date()
      const horas = agora.getHours()
      const minutos = agora.getMinutes()
      
      // Calcular a posição em pixels (cada hora tem 80px de altura)
      const pixelsPorMinuto = 80 / 60
      const offsetDoInicioDoDia = (horas - 7) * 80 + minutos * pixelsPorMinuto
      
      // Centralizar a hora atual na viewport
      const viewportHeight = scrollContainerRef.current.clientHeight
      const scrollPosition = Math.max(0, offsetDoInicioDoDia - viewportHeight / 2 + 40)
      
      scrollContainerRef.current.scrollTop = scrollPosition
    }
  }, [])

  const diasSemana = useMemo(() => {
    const dias = []
    const inicioDaSemana = new Date(dataSelecionada)
    const diaDaSemana = inicioDaSemana.getDay()
    inicioDaSemana.setDate(inicioDaSemana.getDate() - diaDaSemana)

    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioDaSemana)
      dia.setDate(inicioDaSemana.getDate() + i)
      dias.push(dia)
    }
    return dias
  }, [dataSelecionada])

  const aulasFiltradas = useMemo(() => {
    let filtered = aulas.filter((a) => a.status !== "cancelada")
    if (salaId !== "todas") {
      filtered = filtered.filter((a) => {
        if (a.salasAtribuicoes && a.salasAtribuicoes.length > 0) {
          return a.salasAtribuicoes.some((attr) => attr.salaId === salaId)
        }
        return a.salaId === salaId
      })
    }
    return filtered
  }, [aulas, salaId])

  const getAulasParaDiaSemana = (diaSemana: number): AulaComPosicao[] => {
    const aulasNoDia: { aula: Aula; horario: HorarioSemanal }[] = []

    aulasFiltradas.forEach((aula) => {
      aula.horarios.forEach((horario) => {
        if (horario.diaSemana === diaSemana) {
          aulasNoDia.push({ aula, horario })
        }
      })
    })

    return calcularPosicoesAulas(aulasNoDia)
  }

  const getAulaStyle = (horario: HorarioSemanal, coluna: number, totalColunas: number) => {
    const inicioMinutos = timeToMinutes(horario.horaInicio)
    const fimMinutos = timeToMinutes(horario.horaFim)
    const duracao = fimMinutos - inicioMinutos

    const topOffset = (inicioMinutos - 7 * 60) * (80 / 60)
    const height = duracao * (80 / 60)

    // Calcular largura e posição horizontal
    const larguraPorcentagem = 100 / totalColunas
    const leftPorcentagem = coluna * larguraPorcentagem
    const gap = 2 // Gap em pixels entre as aulas

    return {
      top: `${topOffset}px`,
      height: `${Math.max(height, 40)}px`,
      left: `calc(${leftPorcentagem}% + ${gap}px)`,
      width: `calc(${larguraPorcentagem}% - ${gap * 2}px)`,
    }
  }

  const navegarSemana = (direcao: number) => {
    const novaData = new Date(dataSelecionada)
    if (visao === "semana") {
      novaData.setDate(novaData.getDate() + direcao * 7)
    } else {
      novaData.setDate(novaData.getDate() + direcao)
    }
    setDataSelecionada(novaData)
  }

  const formatarMes = () => {
    const opcoes: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" }
    return dataSelecionada.toLocaleDateString("pt-BR", opcoes)
  }

  const isHoje = (data: Date) => {
    const hoje = new Date()
    return data.toDateString() === hoje.toDateString()
  }

  const handleSlotClick = (diaSemana: number, hora: number) => {
    if (onSelectSlot) {
      const horaFormatada = `${hora.toString().padStart(2, "0")}:00`
      onSelectSlot(diaSemana, horaFormatada, salaId !== "todas" ? salaId : undefined)
    }
  }

  const getAulaDisplayInfo = (aula: Aula) => {
    if (aula.salasAtribuicoes && aula.salasAtribuicoes.length > 0) {
      const salasUnicas = [...new Set(aula.salasAtribuicoes.map((a) => a.salaNome))]
      return salasUnicas.length > 1 ? `${salasUnicas.length} salas` : salasUnicas[0]
    }
    return aula.sala
  }

  // Calcular posição da linha de hora atual
  const getPosicaoHoraAtual = () => {
    const horas = horaAtual.getHours()
    const minutos = horaAtual.getMinutes()
    const totalMinutos = horas * 60 + minutos
    const minutosDesde7AM = totalMinutos - 7 * 60
    
    // Cada hora tem 80px de altura
    const pixelsPorMinuto = 80 / 60
    return minutosDesde7AM * pixelsPorMinuto
  }

  const mostrarLinhaHoraAtual = () => {
    const agora = new Date()
    const horas = agora.getHours()
    // Mostrar a linha apenas durante horário de aulas (7h às 23h)
    return horas >= 7 && horas < 23
  }

  return (
    <div className="flex flex-col h-500">
      {/* Header do Calendário */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navegarSemana(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navegarSemana(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold capitalize">{formatarMes()}</h2>
          <Button variant="outline" size="sm" onClick={() => setDataSelecionada(new Date())}>
            Hoje
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select value={salaId} onValueChange={setSalaId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por sala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Salas</SelectItem>
              {salas.map((sala) => (
                <SelectItem key={sala.id} value={sala.id}>
                  {sala.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex rounded-lg border bg-muted p-1">
            <Button variant={visao === "semana" ? "default" : "ghost"} size="sm" onClick={() => setVisao("semana")}>
              Semana
            </Button>
            <Button variant={visao === "dia" ? "default" : "ghost"} size="sm" onClick={() => setVisao("dia")}>
              Dia
            </Button>
          </div>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
        <div className="">
          {/* Cabeçalho dos dias */}
          <div
            className="grid border-b sticky top-0 bg-background z-10"
            style={{ gridTemplateColumns: "70px repeat(7, 1fr)" }}
          >
            <div className="p-2 text-center text-xs font-medium text-muted-foreground border-r bg-muted/30">
              Horário
            </div>
            {(visao === "semana" ? diasSemana : [dataSelecionada]).map((dia, index) => {
              const diaSemanaIndex = visao === "semana" ? index : dataSelecionada.getDay()
              return (
                <div
                  key={index}
                  className={cn("p-3 text-center border-r last:border-r-0", isHoje(dia) && "bg-primary/5")}
                >
                  <div className="text-xs font-medium text-muted-foreground uppercase">
                    {DIAS_SEMANA[diaSemanaIndex].abrev}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-semibold mt-1",
                      isHoje(dia) &&
                        "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto",
                    )}
                  >
                    {dia.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grid de horários */}
          <div className="relative">
            <div className="grid" style={{ gridTemplateColumns: "70px repeat(7, 1fr)" }}>
              {/* Coluna de horas */}
              <div className="border-r bg-muted/30">
                {HORAS_DIA.map((hora) => (
                  <div key={hora} className="h-20 border-b flex items-start justify-end pr-2 pt-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {hora.toString().padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Colunas dos dias */}
              {(visao === "semana" ? DIAS_SEMANA : [DIAS_SEMANA[dataSelecionada.getDay()]]).map((dia, diaIndex) => {
                const diaSemanaIndex = visao === "semana" ? dia.valor : dataSelecionada.getDay()
                const aulasNoDia = getAulasParaDiaSemana(diaSemanaIndex)

                return (
                  <div
                    key={diaIndex}
                    className={cn(
                      "relative border-r last:border-r-0",
                      visao === "semana" &&
                        diasSemana[diaSemanaIndex] &&
                        isHoje(diasSemana[diaSemanaIndex]) &&
                        "bg-primary/5",
                    )}
                  >
                    {/* Slots de horário */}
                    {HORAS_DIA.map((hora) => (
                      <div
                        key={hora}
                        className="h-20 border-b hover:bg-muted/50 cursor-pointer transition-colors border-dashed"
                        onClick={() => handleSlotClick(diaSemanaIndex, hora)}
                      >
                        <div className="h-10 border-b border-dashed border-muted-foreground/20" />
                      </div>
                    ))}

                    {aulasNoDia.map(({ aula, horario, coluna, totalColunas }, idx) => {
                      const style = getAulaStyle(horario, coluna, totalColunas)
                      const duracao = calcularDuracao(horario.horaInicio, horario.horaFim)
                      const displayInfo = getAulaDisplayInfo(aula)

                      return (
                        <div
                          key={`${aula.id}-${horario.diaSemana}-${horario.horaInicio}-${idx}`}
                          className="absolute rounded-lg px-2 py-1.5 cursor-pointer overflow-hidden shadow-md hover:shadow-lg transition-all hover:z-10 border border-white/20"
                          style={{
                            ...style,
                            backgroundColor: aula.cor || CORES_AULAS[Number.parseInt(aula.id) % CORES_AULAS.length],
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setAulaDetalhes({ aula, horario })
                          }}
                        >
                          <div className="text-white text-xs font-semibold truncate">{aula.disciplina}</div>
                          {duracao >= 60 && totalColunas <= 2 && (
                            <div className="text-white/90 text-[11px] truncate mt-0.5 flex items-center gap-1">
                              <Building className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{displayInfo}</span>
                            </div>
                          )}
                          {duracao >= 90 && (
                            <div className="text-white/80 text-[10px] truncate">
                              {horario.horaInicio} - {horario.horaFim}
                            </div>
                          )}
                          {duracao >= 120 && aula.professores.length > 0 && totalColunas <= 2 && (
                            <div className="text-white/70 text-[10px] truncate mt-0.5 flex items-center gap-1">
                              <Users className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {aula.professores.length > 1
                                  ? `${aula.professores.length} prof.`
                                  : aula.professores[0].nome.split(" ")[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Linha da hora atual */}
            {mostrarLinhaHoraAtual() && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${getPosicaoHoraAtual()}px` }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-[70px] flex justify-end pr-2">
                    <div className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      {horaAtual.getHours().toString().padStart(2, "0")}:
                      {horaAtual.getMinutes().toString().padStart(2, "0")}
                    </div>
                  </div>
                  <div className="flex-1 h-[2px] bg-red-500 shadow-lg relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-lg" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de detalhes da aula */}
      <Dialog open={!!aulaDetalhes} onOpenChange={() => setAulaDetalhes(null)}>
        <DialogContent className="max-h-[80vh] w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: aulaDetalhes?.aula.cor || CORES_AULAS[0] }}
              />
              {aulaDetalhes?.aula.disciplina}
            </DialogTitle>
            <DialogDescription>Detalhes da aula agendada</DialogDescription>
          </DialogHeader>
          {aulaDetalhes && (
            <div className="space-y-4 pt-4 overflow-y-scroll">
              {aulaDetalhes.aula.salasAtribuicoes && aulaDetalhes.aula.salasAtribuicoes.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Professores e Salas
                  </div>
                  <div className="ml-6 space-y-2">
                    {aulaDetalhes.aula.salasAtribuicoes.map((attr, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <Badge variant="secondary" className="text-xs">
                          {attr.professorNome}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {attr.salaNome}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Professores
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {aulaDetalhes.aula.professores.map((prof) => (
                        <Badge key={prof.id} variant="secondary">
                          {prof.nome}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{aulaDetalhes.aula.sala}</span>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{DIAS_SEMANA[aulaDetalhes.horario.diaSemana].nome}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {aulaDetalhes.horario.horaInicio} - {aulaDetalhes.horario.horaFim} (
                  {calcularDuracao(aulaDetalhes.horario.horaInicio, aulaDetalhes.horario.horaFim)} min)
                </span>
              </div>

              {aulaDetalhes.aula.horarios.length > 1 && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-sm font-medium text-muted-foreground">Todos os horários desta disciplina:</div>
                  <div className="space-y-1 ml-2">
                    {aulaDetalhes.aula.horarios.map((h, idx) => (
                      <div key={idx} className="text-sm flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: aulaDetalhes.aula.cor || CORES_AULAS[0] }}
                        />
                        <span className="font-medium">{DIAS_SEMANA[h.diaSemana].nome}</span>
                        <span className="text-muted-foreground">
                          {h.horaInicio} - {h.horaFim}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Badge
                variant={
                  aulaDetalhes.aula.status === "agendada"
                    ? "default"
                    : aulaDetalhes.aula.status === "em_andamento"
                      ? "secondary"
                      : aulaDetalhes.aula.status === "concluida"
                        ? "outline"
                        : "destructive"
                }
              >
                {aulaDetalhes.aula.status === "agendada"
                  ? "Agendada"
                  : aulaDetalhes.aula.status === "em_andamento"
                    ? "Em Andamento"
                    : aulaDetalhes.aula.status === "concluida"
                      ? "Concluída"
                      : "Cancelada"}
              </Badge>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
