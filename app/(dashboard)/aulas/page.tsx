"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  AlertTriangle,
  List,
  CalendarDays,
  Search,
  Pencil,
  Trash2,
  CalendarRange,
} from "lucide-react"
import { aulas as aulasIniciais, salas, usuarios } from "@/lib/data"
import { getCurrentUser } from "@/lib/auth"
import type { Aula, Usuario, ProfessorSalaAssignment } from "@/lib/types"
import { CalendarView } from "@/components/calendar-view"
import { RoomSearch } from "@/components/room-search"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Building } from "lucide-react" // Import the Building component

const DIAS_SEMANA = [
  { value: 0, label: "Dom", labelFull: "Domingo" },
  { value: 1, label: "Seg", labelFull: "Segunda-feira" },
  { value: 2, label: "Ter", labelFull: "Terça-feira" },
  { value: 3, label: "Qua", labelFull: "Quarta-feira" },
  { value: 4, label: "Qui", labelFull: "Quinta-feira" },
  { value: 5, label: "Sex", labelFull: "Sexta-feira" },
  { value: 6, label: "Sáb", labelFull: "Sábado" },
]

const CORES_DISPONIVEIS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
  "#ef4444", // red
  "#84cc16", // lime
]

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export default function AulasPage() {
  const [aulasList, setAulasList] = useState<Aula[]>(aulasIniciais)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [conflito, setConflito] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [editingAula, setEditingAula] = useState<Aula | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [aulaToDelete, setAulaToDelete] = useState<Aula | null>(null)
  const [visaoAtual, setVisaoAtual] = useState<"calendario" | "lista" | "buscar">("calendario")

  const professores = usuarios.filter((u) => u.tipo === "professor")

  const [formData, setFormData] = useState({
    disciplina: "",
    professoresIds: [] as string[],
    salasIds: [] as string[],
    professorSalaAssignments: [] as { professorId: string; salaId: string }[],
    diasSemana: [] as number[],
    horaInicio: "",
    horaFim: "",
    dataInicioAnoLetivo: "",
    dataFimAnoLetivo: "",
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
      dataInicioAnoLetivo: "",
      dataFimAnoLetivo: "",
    })
    setEditingAula(null)
  }

  const openEditDialog = (aula: Aula) => {
    setEditingAula(aula)
    setFormData({
      disciplina: aula.disciplina,
      professoresIds: aula.professores.map((p) => p.id),
      salasIds: aula.salasAtribuicoes?.map((a) => a.salaId) || [aula.salaId],
      professorSalaAssignments:
        aula.salasAtribuicoes?.map((a) => ({
          professorId: a.professorId,
          salaId: a.salaId,
        })) || [],
      diasSemana: aula.horarios.map((h) => h.diaSemana),
      horaInicio: aula.horarios[0]?.horaInicio || "",
      horaFim: aula.horarios[0]?.horaFim || "",
      dataInicioAnoLetivo: aula.dataInicioAnoLetivo || "",
      dataFimAnoLetivo: aula.dataFimAnoLetivo || "",
    })
    setDialogAberto(true)
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
          newAssignments.splice(existingAssignmentIndex, 1)
        } else {
          newAssignments[existingAssignmentIndex] = { professorId, salaId }
        }
      } else if (salaId !== "") {
        newAssignments.push({ professorId, salaId })
      }

      return {
        ...prev,
        professorSalaAssignments: newAssignments,
      }
    })
  }

  const verificarConflito = (): string | null => {
    if (formData.diasSemana.length === 0 || !formData.horaInicio || !formData.horaFim) {
      return null
    }

    if (!formData.dataInicioAnoLetivo || !formData.dataFimAnoLetivo) {
      return null
    }

    const novoInicio = formData.dataInicioAnoLetivo
    const novoFim = formData.dataFimAnoLetivo

    for (const aula of aulasList) {
      if (editingAula && aula.id === editingAula.id) continue

      // Check if date ranges overlap
      const aulaInicio = aula.dataInicioAnoLetivo
      const aulaFim = aula.dataFimAnoLetivo

      const datasOverlap = novoInicio <= aulaFim && novoFim >= aulaInicio

      if (!datasOverlap) continue

      for (const dia of formData.diasSemana) {
        const aulaTemMesmoDia = aula.horarios.some((h) => h.diaSemana === dia)

        if (aulaTemMesmoDia) {
          const horaInicioNova = Number.parseInt(formData.horaInicio.replace(":", ""))
          const horaFimNova = Number.parseInt(formData.horaFim.replace(":", ""))

          for (const horario of aula.horarios) {
            if (horario.diaSemana !== dia) continue

            const horaInicioExistente = Number.parseInt(horario.horaInicio.replace(":", ""))
            const horaFimExistente = Number.parseInt(horario.horaFim.replace(":", ""))

            const horariosOverlap = horaInicioNova < horaFimExistente && horaFimNova > horaInicioExistente

            if (horariosOverlap) {
              // Check if any of the selected rooms conflict with existing room assignments
              const salasExistentes = aula.salasAtribuicoes?.map((a) => a.salaId) || [aula.salaId]
              const salasConflitantes = formData.salasIds.filter((sId) => salasExistentes.includes(sId))

              if (salasConflitantes.length > 0) {
                const nomeSalasConflitantes = salasConflitantes
                  .map((sId) => salas.find((s) => s.id === sId)?.nome)
                  .join(", ")
                const diaNome = DIAS_SEMANA.find((d) => d.value === dia)?.labelFull
                return `Conflito: ${aula.disciplina} já está agendada em ${nomeSalasConflitantes} às ${diaNome} das ${horario.horaInicio} às ${horario.horaFim}`
              }
            }
          }
        }
      }
    }

    return null
  }

  useEffect(() => {
    const conflito = verificarConflito()
    setConflito(conflito)
  }, [
    formData.diasSemana,
    formData.horaInicio,
    formData.horaFim,
    formData.salasIds,
    formData.dataInicioAnoLetivo,
    formData.dataFimAnoLetivo,
  ])

  const handleSubmit = () => {
    if (conflito) return

    const professoresSelecionados = professores.filter((p) => formData.professoresIds.includes(p.id))
    const salasSelecionadas = salas.filter((s) => formData.salasIds.includes(s.id))
    const primarySala = salasSelecionadas[0]

    const salasAtribuicoes: ProfessorSalaAssignment[] = formData.professorSalaAssignments.map((assignment) => {
      const prof = professores.find((p) => p.id === assignment.professorId)
      const sala = salas.find((s) => s.id === assignment.salaId)
      return {
        professorId: assignment.professorId,
        professorNome: prof?.nome || "",
        salaId: assignment.salaId,
        salaNome: sala?.nome || "",
      }
    })

    const horarios = formData.diasSemana.map((dia) => ({
      diaSemana: dia,
      horaInicio: formData.horaInicio,
      horaFim: formData.horaFim,
    }))

    if (editingAula) {
      // Update existing aula
      setAulasList((prev) =>
        prev.map((aula) =>
          aula.id === editingAula.id
            ? {
                ...aula,
                disciplina: formData.disciplina,
                professores: professoresSelecionados.map((p) => ({ id: p.id, nome: p.nome })),
                salaId: primarySala?.id || "",
                sala: primarySala?.nome || "",
                salasAtribuicoes,
                horarios,
                dataInicioAnoLetivo: formData.dataInicioAnoLetivo,
                dataFimAnoLetivo: formData.dataFimAnoLetivo,
              }
            : aula,
        ),
      )
    } else {
      // Create new aula
      const novaAula: Aula = {
        id: Date.now().toString(),
        disciplina: formData.disciplina,
        professores: professoresSelecionados.map((p) => ({ id: p.id, nome: p.nome })),
        salaId: primarySala?.id || "",
        sala: primarySala?.nome || "",
        salasAtribuicoes,
        horarios,
        status: "agendada",
        cor: CORES_DISPONIVEIS[aulasList.length % CORES_DISPONIVEIS.length],
        dataInicioAnoLetivo: formData.dataInicioAnoLetivo,
        dataFimAnoLetivo: formData.dataFimAnoLetivo,
      }

      setAulasList([...aulasList, novaAula])
    }

    setDialogAberto(false)
    resetForm()
  }

  const handleDeleteAula = (aula: Aula) => {
    setAulaToDelete(aula)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (aulaToDelete) {
      setAulasList((prev) => prev.filter((a) => a.id !== aulaToDelete.id))
      setDeleteConfirmOpen(false)
      setAulaToDelete(null)
    }
  }

  const canEdit = usuario?.tipo === "coordenador"

  const formatDateRange = (dataInicio: string, dataFim: string) => {
    try {
      const inicio = parseISO(dataInicio)
      const fim = parseISO(dataFim)
      return `${format(inicio, "dd/MM/yyyy", { locale: ptBR })} a ${format(fim, "dd/MM/yyyy", { locale: ptBR })}`
    } catch {
      return "Período não definido"
    }
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
      dataInicioAnoLetivo: "",
      dataFimAnoLetivo: "",
    })
    setEditingAula(null)
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
      dataInicioAnoLetivo: "",
      dataFimAnoLetivo: "",
    })
    setEditingAula(null)
    setDialogAberto(true)
  }

  const aulasExibidas =
    usuario?.tipo === "professor"
      ? aulasList.filter((aula) => aula.professores.some((p) => p.id === usuario.id))
      : aulasList

  const salasDisponiveis = salas.filter((s) => s.statusManual !== "manutencao")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{usuario?.tipo === "professor" ? "Minhas Aulas" : "Agenda de Aulas"}</h1>
          <p className="text-muted-foreground">
            {canEdit
              ? "Gerencie o agendamento de aulas e visualize a ocupação das salas"
              : "Visualize e busque salas disponíveis para suas aulas"}
          </p>
        </div>
        {canEdit && (
          <Dialog
            open={dialogAberto}
            onOpenChange={(open) => {
              setDialogAberto(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Aula
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAula ? "Editar Aula" : "Agendar Nova Aula"}</DialogTitle>
                <DialogDescription>
                  {editingAula
                    ? "Edite as informações da aula selecionada"
                    : "Preencha as informações para agendar uma nova aula recorrente"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Disciplina */}
                <div className="space-y-2">
                  <Label htmlFor="disciplina">Disciplina *</Label>
                  <Input
                    id="disciplina"
                    value={formData.disciplina}
                    onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                    placeholder="Ex: Programação Web"
                  />
                </div>

                {/* Professores (Multi-select) */}
                <div className="space-y-2">
                  <Label>Professores *</Label>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                    {professores.map((prof) => (
                      <div key={prof.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`prof-${prof.id}`}
                          checked={formData.professoresIds.includes(prof.id)}
                          onCheckedChange={() => toggleProfessor(prof.id)}
                        />
                        <label htmlFor={`prof-${prof.id}`} className="text-sm cursor-pointer">
                          {prof.nome}
                        </label>
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

                {/* Salas (Multi-select) */}
                <div className="space-y-2">
                  <Label>Salas *</Label>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                    {salasDisponiveis.map((sala) => (
                      <div key={sala.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sala-${sala.id}`}
                          checked={formData.salasIds.includes(sala.id)}
                          onCheckedChange={() => toggleSala(sala.id)}
                        />
                        <label htmlFor={`sala-${sala.id}`} className="text-sm cursor-pointer">
                          {sala.nome} ({sala.capacidade} lugares)
                        </label>
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

                {/* Professor-Sala Assignments */}
                {formData.professoresIds.length > 0 && formData.salasIds.length > 0 && (
                  <div className="space-y-2">
                    <Label>Atribuição Professor → Sala *</Label>
                    <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                      {formData.professoresIds.map((profId) => {
                        const prof = professores.find((p) => p.id === profId)
                        const currentAssignment = formData.professorSalaAssignments.find(
                          (a) => a.professorId === profId,
                        )

                        return (
                          <div key={profId} className="flex items-center gap-3">
                            <span className="text-sm min-w-[150px]">{prof?.nome}:</span>
                            <Select
                              value={currentAssignment?.salaId || ""}
                              onValueChange={(value) => updateProfessorSalaAssignment(profId, value)}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Selecione a sala" />
                              </SelectTrigger>
                              <SelectContent>
                                {formData.salasIds.map((salaId) => {
                                  const sala = salasDisponiveis.find((s) => s.id === salaId)
                                  return (
                                    <SelectItem key={salaId} value={salaId}>
                                      {sala?.nome}
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cada professor deve ser atribuído a uma sala. O mesmo professor pode lecionar em salas diferentes.
                    </p>
                  </div>
                )}

                {/* Dias da Semana */}
                <div className="space-y-2">
                  <Label>Dias da Semana *</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg">
                    {DIAS_SEMANA.slice(1, 7).map((dia) => (
                      <Button
                        key={dia.value}
                        type="button"
                        variant={formData.diasSemana.includes(dia.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDiaSemana(dia.value)}
                      >
                        {dia.label}
                      </Button>
                    ))}
                  </div>
                  {formData.diasSemana.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Selecionado:{" "}
                      {formData.diasSemana.map((d) => DIAS_SEMANA.find((dia) => dia.value === d)?.labelFull).join(", ")}
                    </p>
                  )}
                </div>

                {/* Horário */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horaInicio">Hora Início *</Label>
                    <Input
                      id="horaInicio"
                      type="time"
                      value={formData.horaInicio}
                      onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horaFim">Hora Fim *</Label>
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

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-base font-medium">Período do Ano Letivo *</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Defina as datas de início e fim do período em que as aulas serão aplicadas
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataInicioAnoLetivo">Data de Início</Label>
                      <Input
                        id="dataInicioAnoLetivo"
                        type="date"
                        value={formData.dataInicioAnoLetivo}
                        onChange={(e) => setFormData({ ...formData, dataInicioAnoLetivo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataFimAnoLetivo">Data de Fim</Label>
                      <Input
                        id="dataFimAnoLetivo"
                        type="date"
                        value={formData.dataFimAnoLetivo}
                        onChange={(e) => setFormData({ ...formData, dataFimAnoLetivo: e.target.value })}
                        min={formData.dataInicioAnoLetivo}
                      />
                    </div>
                  </div>
                  {formData.dataInicioAnoLetivo && formData.dataFimAnoLetivo && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        Período: {formatDateRange(formData.dataInicioAnoLetivo, formData.dataFimAnoLetivo)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Alerta de Conflito */}
                {conflito && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{conflito}</AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogAberto(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !formData.disciplina ||
                    formData.professoresIds.length === 0 ||
                    formData.salasIds.length === 0 ||
                    formData.diasSemana.length === 0 ||
                    !formData.horaInicio ||
                    !formData.horaFim ||
                    !formData.dataInicioAnoLetivo ||
                    !formData.dataFimAnoLetivo ||
                    !!conflito
                  }
                >
                  {editingAula ? "Salvar Alterações" : "Agendar Aula"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a aula "{aulaToDelete?.disciplina}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="calendario" className="">
        <TabsList>
          <TabsTrigger value="calendario" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="lista" className="gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          {usuario?.tipo === "professor" && (
            <TabsTrigger value="buscar" className="gap-2">
              <Search className="h-4 w-4" />
              Buscar Salas
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="calendario">
          <Card className="h-[calc(100vh-14rem)]">
            <CardContent className="p-4 h-full">
              <CalendarView
                aulas={aulasExibidas}
                salas={salas}
                onSelectSlot={handleSlotClick}
                onEditAula={canEdit ? openEditDialog : undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Aulas Agendadas</CardTitle>
              <CardDescription>Lista completa de aulas com horários recorrentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aulasList.map((aula) => (
                  <div
                    key={aula.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                    style={{ borderLeftColor: aula.cor || CORES_DISPONIVEIS[0], borderLeftWidth: "4px" }}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">{aula.disciplina}</span>
                        <Badge variant="outline">{aula.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <User className="h-4 w-4" />
                        <span>{aula.professores.map((p) => p.nome).join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <MapPin className="h-4 w-4" />
                        {aula.salasAtribuicoes && aula.salasAtribuicoes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {aula.salasAtribuicoes.map((attr, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {attr.salaNome} ({attr.professorNome.split(" ")[0]})
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span>{aula.sala}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {aula.horarios
                            .map((h) => `${DIAS_SEMANA.find((d) => d.value === h.diaSemana)?.labelFull}`)
                            .join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {aula.horarios[0]?.horaInicio} - {aula.horarios[0]?.horaFim}
                        </span>
                      </div>
                      {aula.dataInicioAnoLetivo && aula.dataFimAnoLetivo && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarRange className="h-4 w-4" />
                          <span>{formatDateRange(aula.dataInicioAnoLetivo, aula.dataFimAnoLetivo)}</span>
                        </div>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(aula)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteAula(aula)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {usuario?.tipo === "professor" && (
          <TabsContent value="buscar">
            <RoomSearch aulas={aulasList} salas={salas} onSelectRoom={handleSelectRoomFromSearch} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
