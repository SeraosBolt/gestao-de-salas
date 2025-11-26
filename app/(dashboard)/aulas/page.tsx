"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, Clock, MapPin, List, CalendarDays, Search, AlertCircle, Users, Building } from "lucide-react"
import { aulas as aulasIniciais, salas, usuarios } from "@/lib/data"
import type { Aula, HorarioSemanal, ProfessorSalaAssignment } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { CalendarView } from "@/components/calendar-view"
import { RoomSearch } from "@/components/room-search"
import { toast } from "sonner"

const CORES_AULAS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#14b8a6"]

const DIAS_SEMANA = [
  { valor: 1, nome: "Segunda", abrev: "Seg" },
  { valor: 2, nome: "Terça", abrev: "Ter" },
  { valor: 3, nome: "Quarta", abrev: "Qua" },
  { valor: 4, nome: "Quinta", abrev: "Qui" },
  { valor: 5, nome: "Sexta", abrev: "Sex" },
  { valor: 6, nome: "Sábado", abrev: "Sáb" },
]

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export default function AulasPage() {
  const [aulas, setAulas] = useState<Aula[]>(aulasIniciais)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [alertaConflito, setAlertaConflito] = useState(false)
  const [conflitos, setConflitos] = useState<
    { diaSemana: number; aula: Aula; horario: HorarioSemanal; salaId: string }[]
  >([])
  const [usuario, setUsuario] = useState(getCurrentUser())
  const [visaoAtual, setVisaoAtual] = useState<"calendario" | "lista" | "buscar">("calendario")

  const [formData, setFormData] = useState({
    disciplina: "",
    professoresIds: [] as string[],
    salasIds: [] as string[],
    professorSalaAssignments: [] as { professorId: string; salaId: string }[],
    diasSemana: [] as number[],
    horaInicio: "",
    horaFim: "",
  })

  useEffect(() => {
    setUsuario(getCurrentUser())
  }, [])

  const resetForm = () => {
    setFormData({
      disciplina: "",
      professoresIds: usuario?.tipo === "professor" ? [usuario.id] : [],
      salasIds: [],
      professorSalaAssignments: [],
      diasSemana: [],
      horaInicio: "",
      horaFim: "",
    })
  }

  const toggleDiaSemana = (dia: number) => {
    setFormData((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia) ? prev.diasSemana.filter((d) => d !== dia) : [...prev.diasSemana, dia],
    }))
  }

  const toggleProfessor = (profId: string) => {
    setFormData((prev) => {
      const newProfessoresIds = prev.professoresIds.includes(profId)
        ? prev.professoresIds.filter((id) => id !== profId)
        : [...prev.professoresIds, profId]

      const newAssignments = prev.professorSalaAssignments.filter((a) => newProfessoresIds.includes(a.professorId))

      return {
        ...prev,
        professoresIds: newProfessoresIds,
        professorSalaAssignments: newAssignments,
      }
    })
  }

  const toggleSala = (salaId: string) => {
    setFormData((prev) => {
      const newSalasIds = prev.salasIds.includes(salaId)
        ? prev.salasIds.filter((id) => id !== salaId)
        : [...prev.salasIds, salaId]

      // Clean up assignments when room is removed
      const newAssignments = prev.professorSalaAssignments.filter((a) => newSalasIds.includes(a.salaId))

      return {
        ...prev,
        salasIds: newSalasIds,
        professorSalaAssignments: newAssignments,
      }
    })
  }

  const updateProfessorSalaAssignment = (professorId: string, salaId: string) => {
    setFormData((prev) => {
      const existingAssignmentIndex = prev.professorSalaAssignments.findIndex((a) => a.professorId === professorId)

      const newAssignments = [...prev.professorSalaAssignments]

      if (existingAssignmentIndex >= 0) {
        if (salaId === "") {
          // Remove assignment
          newAssignments.splice(existingAssignmentIndex, 1)
        } else {
          // Update assignment
          newAssignments[existingAssignmentIndex] = { professorId, salaId }
        }
      } else if (salaId !== "") {
        // Add new assignment
        newAssignments.push({ professorId, salaId })
      }

      return {
        ...prev,
        professorSalaAssignments: newAssignments,
      }
    })
  }

  const verificarConflitos = (
    salasIds: string[],
    diasSemana: number[],
    horaInicio: string,
    horaFim: string,
  ): { diaSemana: number; aula: Aula; horario: HorarioSemanal; salaId: string }[] => {
    const conflitosEncontrados: { diaSemana: number; aula: Aula; horario: HorarioSemanal; salaId: string }[] = []
    const novoInicio = timeToMinutes(horaInicio)
    const novoFim = timeToMinutes(horaFim)

    salasIds.forEach((salaId) => {
      diasSemana.forEach((dia) => {
        aulas.forEach((aula) => {
          // Check both legacy salaId and new salasAtribuicoes
          const aulaSalasIds = aula.salasAtribuicoes ? aula.salasAtribuicoes.map((a) => a.salaId) : [aula.salaId]

          if (!aulaSalasIds.includes(salaId) || aula.status === "cancelada") return

          aula.horarios.forEach((horario) => {
            if (horario.diaSemana !== dia) return

            const aulaInicio = timeToMinutes(horario.horaInicio)
            const aulaFim = timeToMinutes(horario.horaFim)

            if (novoInicio < aulaFim && novoFim > aulaInicio) {
              conflitosEncontrados.push({ diaSemana: dia, aula, horario, salaId })
            }
          })
        })
      })
    })

    return conflitosEncontrados
  }

  const salvarAula = () => {
    const professoresSelecionados = usuarios.filter((u) => formData.professoresIds.includes(u.id))
    const salasSelecionadas = salas.filter((s) => formData.salasIds.includes(s.id))

    if (professoresSelecionados.length === 0 || salasSelecionadas.length === 0 || formData.diasSemana.length === 0) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (
      usuario?.tipo === "coordenador" &&
      formData.professorSalaAssignments.length !== professoresSelecionados.length
    ) {
      toast.error("Atribua uma sala para cada professor")
      return
    }

    const conflitosEncontrados = verificarConflitos(
      formData.salasIds,
      formData.diasSemana,
      formData.horaInicio,
      formData.horaFim,
    )

    if (conflitosEncontrados.length > 0) {
      setConflitos(conflitosEncontrados)
      setAlertaConflito(true)
      return
    }

    const salasAtribuicoes: ProfessorSalaAssignment[] = formData.professorSalaAssignments.map((assignment) => {
      const professor = professoresSelecionados.find((p) => p.id === assignment.professorId)
      const sala = salasSelecionadas.find((s) => s.id === assignment.salaId)
      return {
        professorId: assignment.professorId,
        professorNome: professor?.nome || "",
        salaId: assignment.salaId,
        salaNome: sala?.nome || "",
      }
    })

    // For professor creating own class
    if (usuario?.tipo === "professor" && salasAtribuicoes.length === 0) {
      const sala = salasSelecionadas[0]
      salasAtribuicoes.push({
        professorId: usuario.id,
        professorNome: usuario.nome,
        salaId: sala.id,
        salaNome: sala.nome,
      })
    }

    const novaAula: Aula = {
      id: Date.now().toString(),
      disciplina: formData.disciplina,
      professores: professoresSelecionados.map((p) => ({ id: p.id, nome: p.nome })),
      salaId: salasSelecionadas[0].id, // Primary room for backwards compatibility
      sala: salasSelecionadas[0].nome,
      salasAtribuicoes,
      horarios: formData.diasSemana.map((dia) => ({
        diaSemana: dia,
        horaInicio: formData.horaInicio,
        horaFim: formData.horaFim,
      })),
      status: "agendada",
      cor: CORES_AULAS[Math.floor(Math.random() * CORES_AULAS.length)],
    }

    setAulas([...aulas, novaAula])
    setDialogAberto(false)
    resetForm()
    toast.success("Aula agendada com sucesso!")
  }

  const handleSlotClick = (diaSemana: number, horaInicio: string, salaId?: string) => {
    const horaFimCalculada = `${(Number.parseInt(horaInicio.split(":")[0]) + 2).toString().padStart(2, "0")}:00`

    setFormData({
      ...formData,
      diasSemana: [diaSemana],
      horaInicio,
      horaFim: horaFimCalculada,
      salasIds: salaId ? [salaId] : [],
      professorSalaAssignments: [],
      professoresIds: usuario?.tipo === "professor" ? [usuario.id] : [],
    })
    setDialogAberto(true)
  }

  const handleSelectRoomFromSearch = (salaId: string, diasSemana: number[], horaInicio: string, horaFim: string) => {
    setFormData({
      ...formData,
      salasIds: [salaId],
      diasSemana,
      horaInicio,
      horaFim,
      professorSalaAssignments: [],
      professoresIds: usuario?.tipo === "professor" ? [usuario.id] : [],
    })
    setDialogAberto(true)
  }

  const getDiaNome = (dia: number) => DIAS_SEMANA.find((d) => d.valor === dia)?.nome || ""

  const aulasExibidas =
    usuario?.tipo === "professor" ? aulas.filter((aula) => aula.professores.some((p) => p.id === usuario.id)) : aulas

  const professores = usuarios.filter((u) => u.tipo === "professor" && u.ativo)
  const salasDisponiveis = salas.filter((s) => s.status !== "manutencao")

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{usuario?.tipo === "professor" ? "Minhas Aulas" : "Agenda de Aulas"}</h1>
          <p className="text-muted-foreground">
            {usuario?.tipo === "professor"
              ? "Gerencie suas aulas e busque salas disponíveis"
              : "Gerencie as aulas da universidade com horários semanais"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border bg-muted p-1">
            <Button
              variant={visaoAtual === "calendario" ? "default" : "ghost"}
              size="sm"
              onClick={() => setVisaoAtual("calendario")}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendário
            </Button>
            <Button
              variant={visaoAtual === "lista" ? "default" : "ghost"}
              size="sm"
              onClick={() => setVisaoAtual("lista")}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
            {usuario?.tipo === "professor" && (
              <Button
                variant={visaoAtual === "buscar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setVisaoAtual("buscar")}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar Sala
              </Button>
            )}
          </div>

          {(usuario?.tipo === "coordenador" || usuario?.tipo === "professor") && (
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Aula
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agendar Nova Aula</DialogTitle>
                  <DialogDescription>Configure os dias, horários e atribua professores às salas.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="disciplina">Disciplina *</Label>
                    <Input
                      id="disciplina"
                      value={formData.disciplina}
                      onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                      placeholder="Ex: Programação Web"
                    />
                  </div>

                  {usuario?.tipo === "coordenador" && (
                    <div className="space-y-3">
                      <Label>Professores *</Label>
                      <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg max-h-40 overflow-y-auto">
                        {professores.map((professor) => (
                          <div key={professor.id ?? ""} className="flex items-center space-x-2">
                            <Checkbox
                              id={`prof-${professor.id ?? ""}`}
                              checked={formData.professoresIds.includes(professor.id ?? "")}
                              onCheckedChange={() => professor.id && toggleProfessor(professor.id)}
                            />
                            <Label htmlFor={`prof-${professor.id ?? ""}`} className="cursor-pointer text-sm">
                              {professor.nome}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.professoresIds.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.professoresIds.map((id) => {
                            const prof = professores.find((p) => p.id === id)
                            return prof ? (
                              <Badge key={id} variant="secondary" className="text-xs">
                                {prof.nome}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label>Salas * {usuario?.tipo === "coordenador" && "(selecione uma para cada professor)"}</Label>
                    <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg max-h-40 overflow-y-auto">
                      {salasDisponiveis.map((sala) => (
                        <div key={sala.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sala-${sala.id}`}
                            checked={formData.salasIds.includes(sala.id)}
                            onCheckedChange={() => toggleSala(sala.id)}
                          />
                          <Label htmlFor={`sala-${sala.id}`} className="cursor-pointer text-sm">
                            {sala.nome} - {sala.localizacao} (Cap: {sala.capacidade})
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.salasIds.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formData.salasIds.map((id) => {
                          const sala = salasDisponiveis.find((s) => s.id === id)
                          return sala ? (
                            <Badge key={id} variant="outline" className="text-xs">
                              <Building className="h-3 w-3 mr-1" />
                              {sala.nome}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>

                  {usuario?.tipo === "coordenador" &&
                    formData.professoresIds.length > 0 &&
                    formData.salasIds.length > 0 && (
                      <div className="space-y-3">
                        <Label>Atribuição Professor → Sala *</Label>
                        <div className="p-4 border rounded-lg space-y-3 bg-muted/30">
                          {formData.professoresIds.map((profId) => {
                            const professor = professores.find((p) => p.id === profId)
                            const currentAssignment = formData.professorSalaAssignments.find(
                              (a) => a.professorId === profId,
                            )
                            return (
                              <div key={profId} className="flex items-center gap-4">
                                <div className="flex items-center gap-2 min-w-[200px]">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{professor?.nome}</span>
                                </div>
                                <span className="text-muted-foreground">→</span>
                                <Select
                                  value={currentAssignment?.salaId || ""}
                                  onValueChange={(value) => updateProfessorSalaAssignment(profId, value)}
                                >
                                  <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Selecione a sala" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {formData.salasIds.map((salaId) => {
                                      const sala = salasDisponiveis.find((s) => s.id === salaId)
                                      return sala ? (
                                        <SelectItem key={salaId} value={salaId}>
                                          {sala.nome} - {sala.localizacao}
                                        </SelectItem>
                                      ) : null
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            )
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Cada professor deve ser atribuído a uma sala. O mesmo professor pode lecionar em salas
                          diferentes.
                        </p>
                      </div>
                    )}

                  <div className="space-y-3">
                    <Label>Dias da Semana *</Label>
                    <div className="flex flex-wrap gap-4 p-3 border rounded-lg">
                      {DIAS_SEMANA.map((dia) => (
                        <div key={dia.valor} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dia-${dia.valor}`}
                            checked={formData.diasSemana.includes(dia.valor)}
                            onCheckedChange={() => toggleDiaSemana(dia.valor)}
                          />
                          <Label htmlFor={`dia-${dia.valor}`} className="cursor-pointer">
                            {dia.nome}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.diasSemana.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Selecionado: {formData.diasSemana.map(getDiaNome).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="horaInicio">Horário de Início *</Label>
                      <Input
                        id="horaInicio"
                        type="time"
                        value={formData.horaInicio}
                        onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="horaFim">Horário de Término *</Label>
                      <Input
                        id="horaFim"
                        type="time"
                        value={formData.horaFim}
                        onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                      />
                    </div>
                  </div>

                  {formData.horaInicio && formData.horaFim && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Duração:</strong> {timeToMinutes(formData.horaFim) - timeToMinutes(formData.horaInicio)}{" "}
                        minutos
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={salvarAula}
                    disabled={
                      !formData.disciplina ||
                      formData.salasIds.length === 0 ||
                      formData.diasSemana.length === 0 ||
                      !formData.horaInicio ||
                      !formData.horaFim ||
                      (usuario?.tipo === "coordenador" && formData.professoresIds.length === 0) ||
                      (usuario?.tipo === "coordenador" &&
                        formData.professorSalaAssignments.length !== formData.professoresIds.length)
                    }
                  >
                    Agendar Aula
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Alerta de Conflito */}
      <AlertDialog open={alertaConflito} onOpenChange={setAlertaConflito}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Conflito de Horário Detectado
            </AlertDialogTitle>
            <AlertDialogDescription>
              As salas selecionadas já estão ocupadas nos seguintes horários:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 my-4">
            {conflitos.map((conflito, idx) => {
              const sala = salas.find((s) => s.id === conflito.salaId)
              return (
                <Card key={idx} className="border-destructive/50">
                  <CardContent className="p-4">
                    <div className="font-medium">{conflito.aula.disciplina}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <Badge variant="outline" className="mr-2">
                        {sala?.nome}
                      </Badge>
                      {getDiaNome(conflito.diaSemana)} • {conflito.horario.horaInicio} - {conflito.horario.horaFim}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {conflito.aula.professores.map((p) => p.nome).join(", ")}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setAlertaConflito(false)
                setVisaoAtual("buscar")
              }}
            >
              Buscar Outra Sala
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Conteúdo Principal */}
      <div className="flex-1">
        {visaoAtual === "calendario" && (
          <Card className="h-[calc(100vh-14rem)]">
            <CardContent className="p-4 h-full">
              <CalendarView aulas={aulasExibidas} salas={salas} onSelectSlot={handleSlotClick} />
            </CardContent>
          </Card>
        )}

        {visaoAtual === "lista" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aulasExibidas.map((aula) => (
              <Card key={aula.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: aula.cor || CORES_AULAS[0] }} />
                      <CardTitle className="text-lg">{aula.disciplina}</CardTitle>
                    </div>
                    <Badge variant={aula.status === "agendada" ? "default" : "secondary"}>
                      {aula.status === "agendada" ? "Ativa" : aula.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {aula.professores.map((p) => p.nome).join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aula.salasAtribuicoes && aula.salasAtribuicoes.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Atribuições:</span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {aula.salasAtribuicoes.map((attr, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {attr.salaNome}
                              </Badge>
                              <span>→</span>
                              <span>{attr.professorNome}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{aula.sala}</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Horários:</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {aula.horarios.map((horario, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {getDiaNome(horario.diaSemana)}: {horario.horaInicio} - {horario.horaFim}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {aulasExibidas.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma aula encontrada</h3>
                  <p className="text-muted-foreground text-center">
                    {usuario?.tipo === "professor"
                      ? "Você ainda não tem aulas agendadas."
                      : 'Clique em "Nova Aula" para começar a agendar.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {visaoAtual === "buscar" && usuario?.tipo === "professor" && (
          <RoomSearch aulas={aulas} salas={salas} onSelectRoom={handleSelectRoomFromSearch} />
        )}
      </div>
    </div>
  )
}
