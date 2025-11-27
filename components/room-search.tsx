"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, MapPin, Users, Monitor, Clock, CheckCircle2, XCircle, Calendar, Projector, Wind } from "lucide-react"
import type { Sala, Aula, HorarioSemanal } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RoomSearchProps {
  salas: Sala[]
  aulas: Aula[]
  onSelectRoom?: (salaId: string, diasSemana: number[], horaInicio: string, horaFim: string) => void
}

const DIAS_SEMANA = [
  { valor: 1, nome: "Segunda" },
  { valor: 2, nome: "Terça" },
  { valor: 3, nome: "Quarta" },
  { valor: 4, nome: "Quinta" },
  { valor: 5, nome: "Sexta" },
  { valor: 6, nome: "Sábado" },
]

const EQUIPAMENTOS_ICONS: Record<string, React.ReactNode> = {
  Projetor: <Projector className="h-4 w-4" />,
  Computador: <Monitor className="h-4 w-4" />,
  "Ar Condicionado": <Wind className="h-4 w-4" />,
  "Sistema de Som": <Monitor className="h-4 w-4" />,
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function RoomSearch({ salas, aulas, onSelectRoom }: RoomSearchProps) {
  const [filtros, setFiltros] = useState({
    diasSemana: [] as number[],
    horaInicio: "",
    horaFim: "",
    capacidadeMinima: "",
    equipamento: "todos",
  })

  const [resultados, setResultados] = useState<
    {
      sala: Sala
      disponivel: boolean
      conflitos: { diaSemana: number; aula: string; horario: string }[]
      proximosHorariosLivres: { diaSemana: number; horario: string }[]
    }[]
  >([])

  const [buscaRealizada, setBuscaRealizada] = useState(false)

  const equipamentosUnicos = useMemo(() => {
    const equipamentos = new Set<string>()
    salas.forEach((sala) => sala.equipamentos.forEach((eq) => equipamentos.add(eq)))
    return Array.from(equipamentos)
  }, [salas])

  const toggleDiaSemana = (dia: number) => {
    setFiltros((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia) ? prev.diasSemana.filter((d) => d !== dia) : [...prev.diasSemana, dia],
    }))
  }

  const verificarDisponibilidadeDia = (
    sala: Sala,
    diaSemana: number,
    horaInicio: string,
    horaFim: string,
  ): { disponivel: boolean; aulaConflito?: Aula; horarioConflito?: HorarioSemanal } => {
    if (sala.statusManual === "manutencao") {
      return { disponivel: false }
    }

    const novoInicio = timeToMinutes(horaInicio)
    const novoFim = timeToMinutes(horaFim)

    for (const aula of aulas) {
      if (aula.salaId !== sala.id || aula.status === "cancelada") continue

      for (const horario of aula.horarios) {
        if (horario.diaSemana !== diaSemana) continue

        const aulaInicio = timeToMinutes(horario.horaInicio)
        const aulaFim = timeToMinutes(horario.horaFim)

        if (novoInicio < aulaFim && novoFim > aulaInicio) {
          return { disponivel: false, aulaConflito: aula, horarioConflito: horario }
        }
      }
    }

    return { disponivel: true }
  }

  const encontrarProximoHorarioLivre = (sala: Sala, diaSemana: number): string | undefined => {
    for (let hora = 7; hora <= 21; hora++) {
      const horaInicio = `${hora.toString().padStart(2, "0")}:00`
      const horaFim = `${(hora + 2).toString().padStart(2, "0")}:00`

      const { disponivel } = verificarDisponibilidadeDia(sala, diaSemana, horaInicio, horaFim)
      if (disponivel) {
        return horaInicio
      }
    }
    return undefined
  }

  const buscarSalas = () => {
    if (filtros.diasSemana.length === 0 || !filtros.horaInicio || !filtros.horaFim) {
      return
    }

    const capacidadeMinima = filtros.capacidadeMinima ? Number.parseInt(filtros.capacidadeMinima) : 0

    const resultadosBusca = salas
      .filter((sala) => {
        if (sala.capacidade < capacidadeMinima) return false
        if (filtros.equipamento !== "todos" && !sala.equipamentos.includes(filtros.equipamento)) return false
        return true
      })
      .map((sala) => {
        const conflitos: { diaSemana: number; aula: string; horario: string }[] = []
        const proximosHorariosLivres: { diaSemana: number; horario: string }[] = []

        filtros.diasSemana.forEach((dia) => {
          const resultado = verificarDisponibilidadeDia(sala, dia, filtros.horaInicio, filtros.horaFim)

          if (!resultado.disponivel && resultado.aulaConflito && resultado.horarioConflito) {
            conflitos.push({
              diaSemana: dia,
              aula: resultado.aulaConflito.disciplina,
              horario: `${resultado.horarioConflito.horaInicio} - ${resultado.horarioConflito.horaFim}`,
            })

            const proximoLivre = encontrarProximoHorarioLivre(sala, dia)
            if (proximoLivre) {
              proximosHorariosLivres.push({ diaSemana: dia, horario: proximoLivre })
            }
          }
        })

        return {
          sala,
          disponivel: conflitos.length === 0 && sala.statusManual !== "manutencao",
          conflitos,
          proximosHorariosLivres,
        }
      })
      .sort((a, b) => {
        if (a.disponivel && !b.disponivel) return -1
        if (!a.disponivel && b.disponivel) return 1
        return a.conflitos.length - b.conflitos.length
      })

    setResultados(resultadosBusca)
    setBuscaRealizada(true)
  }

  const handleSelectRoom = (salaId: string) => {
    if (onSelectRoom && filtros.diasSemana.length > 0 && filtros.horaInicio && filtros.horaFim) {
      onSelectRoom(salaId, filtros.diasSemana, filtros.horaInicio, filtros.horaFim)
    }
  }

  const getDiaNome = (dia: number) => DIAS_SEMANA.find((d) => d.valor === dia)?.nome || ""

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Salas Disponíveis
          </CardTitle>
          <CardDescription>Encontre salas disponíveis para os dias e horários desejados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Dias da Semana</Label>
            <div className="flex flex-wrap gap-4">
              {DIAS_SEMANA.map((dia) => (
                <div key={dia.valor} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dia-${dia.valor}`}
                    checked={filtros.diasSemana.includes(dia.valor)}
                    onCheckedChange={() => toggleDiaSemana(dia.valor)}
                  />
                  <Label htmlFor={`dia-${dia.valor}`} className="cursor-pointer">
                    {dia.nome}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="horaInicio">Horário de Início</Label>
              <Input
                id="horaInicio"
                type="time"
                value={filtros.horaInicio}
                onChange={(e) => setFiltros({ ...filtros, horaInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaFim">Horário de Término</Label>
              <Input
                id="horaFim"
                type="time"
                value={filtros.horaFim}
                onChange={(e) => setFiltros({ ...filtros, horaFim: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidade">Capacidade Mínima</Label>
              <Input
                id="capacidade"
                type="number"
                placeholder="Ex: 30"
                value={filtros.capacidadeMinima}
                onChange={(e) => setFiltros({ ...filtros, capacidadeMinima: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipamento">Equipamento</Label>
              <Select
                value={filtros.equipamento}
                onValueChange={(value) => setFiltros({ ...filtros, equipamento: value })}
              >
                <SelectTrigger id="equipamento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {equipamentosUnicos.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={buscarSalas}
            disabled={filtros.diasSemana.length === 0 || !filtros.horaInicio || !filtros.horaFim}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar Salas
          </Button>
        </CardContent>
      </Card>

      {buscaRealizada && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {resultados.length > 0
              ? `${resultados.filter((r) => r.disponivel).length} salas totalmente disponíveis`
              : "Nenhuma sala encontrada com os critérios selecionados"}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {resultados.map(({ sala, disponivel, conflitos, proximosHorariosLivres }) => (
              <Card
                key={sala.id}
                className={cn(
                  "transition-all",
                  disponivel
                    ? "border-green-500/50 hover:border-green-500"
                    : conflitos.length < filtros.diasSemana.length
                      ? "border-yellow-500/50"
                      : "border-red-500/30 opacity-75",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {sala.nome}
                        {disponivel ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {sala.localizacao}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        disponivel ? "default" : conflitos.length < filtros.diasSemana.length ? "outline" : "secondary"
                      }
                    >
                      {disponivel ? "Disponível" : conflitos.length < filtros.diasSemana.length ? "Parcial" : "Ocupada"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{sala.capacidade} lugares</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sala.equipamentos.map((eq) => (
                      <Badge key={eq} variant="outline" className="text-xs">
                        {EQUIPAMENTOS_ICONS[eq] || <Monitor className="h-3 w-3 mr-1" />}
                        {eq}
                      </Badge>
                    ))}
                  </div>

                  {conflitos.length > 0 && (
                    <div className="space-y-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="text-sm font-medium text-red-700 dark:text-red-400">Conflitos encontrados:</div>
                      {conflitos.map((conflito, idx) => (
                        <div key={idx} className="text-xs text-red-600 dark:text-red-400">
                          {getDiaNome(conflito.diaSemana)}: {conflito.aula} ({conflito.horario})
                        </div>
                      ))}
                    </div>
                  )}

                  {proximosHorariosLivres.length > 0 && (
                    <div className="space-y-1 text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                      <div className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4" />
                        Horários alternativos:
                      </div>
                      {proximosHorariosLivres.map((item, idx) => (
                        <div key={idx} className="text-xs ml-6">
                          {getDiaNome(item.diaSemana)}: a partir das {item.horario}
                        </div>
                      ))}
                    </div>
                  )}

                  {disponivel && onSelectRoom && (
                    <Button className="w-full" onClick={() => handleSelectRoom(sala.id)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Reservar esta Sala
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
