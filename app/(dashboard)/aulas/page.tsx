"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Calendar, Clock, MapPin, User } from "lucide-react"
import { aulas as aulasIniciais, salas, usuarios } from "@/lib/data"
import type { Aula } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"

export default function AulasPage() {
  const [aulas, setAulas] = useState<Aula[]>(aulasIniciais)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [usuario, setUsuario] = useState(getCurrentUser())

  const [formData, setFormData] = useState({
    disciplina: "",
    professorId: "",
    salaId: "",
    dataHora: "",
    duracao: "120",
  })

  useEffect(() => {
    setUsuario(getCurrentUser())
  }, [])

  const resetForm = () => {
    setFormData({
      disciplina: "",
      professorId: "",
      salaId: "",
      dataHora: "",
      duracao: "120",
    })
  }

  const verificarConflito = (salaId: string, dataHora: string, duracao: number): boolean => {
    const novaAulaInicio = new Date(dataHora)
    const novaAulaFim = new Date(novaAulaInicio.getTime() + duracao * 60000)

    return aulas.some((aula) => {
      if (aula.salaId !== salaId || aula.status === "cancelada") return false

      const aulaInicio = new Date(aula.dataHora)
      const aulaFim = new Date(aulaInicio.getTime() + aula.duracao * 60000)

      return novaAulaInicio < aulaFim && novaAulaFim > aulaInicio
    })
  }

  const salvarAula = () => {
    const professor = usuarios.find((u) => u.id === formData.professorId)
    const sala = salas.find((s) => s.id === formData.salaId)

    if (!professor || !sala) return

    // Verificar conflito de horário
    if (verificarConflito(formData.salaId, formData.dataHora, Number.parseInt(formData.duracao))) {
      alert("Conflito de horário! A sala já está ocupada neste período.")
      return
    }

    const novaAula: Aula = {
      id: Date.now().toString(),
      disciplina: formData.disciplina,
      professor: professor.nome,
      professorId: formData.professorId,
      salaId: formData.salaId,
      sala: sala.nome,
      dataHora: formData.dataHora,
      duracao: Number.parseInt(formData.duracao),
      status: "agendada",
    }

    setAulas([...aulas, novaAula])
    setDialogAberto(false)
    resetForm()
  }

  const getStatusColor = (status: Aula["status"]) => {
    switch (status) {
      case "agendada":
        return "default"
      case "em_andamento":
        return "secondary"
      case "concluida":
        return "outline"
      case "cancelada":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: Aula["status"]) => {
    switch (status) {
      case "agendada":
        return "Agendada"
      case "em_andamento":
        return "Em Andamento"
      case "concluida":
        return "Concluída"
      case "cancelada":
        return "Cancelada"
      default:
        return status
    }
  }

  const aulasExibidas = usuario?.tipo === "professor" ? aulas.filter((aula) => aula.professorId === usuario.id) : aulas

  const professores = usuarios.filter((u) => u.tipo === "professor")
  const salasDisponiveis = salas.filter((s) => s.status === "disponivel")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{usuario?.tipo === "professor" ? "Minhas Aulas" : "Gestão de Aulas"}</h1>
          <p className="text-muted-foreground">
            {usuario?.tipo === "professor" ? "Visualize suas aulas agendadas" : "Gerencie as aulas da universidade"}
          </p>
        </div>
        {usuario?.tipo === "coordenador" && (
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Aula
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Aula</DialogTitle>
                <DialogDescription>Agende uma nova aula no sistema.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="disciplina">Disciplina</Label>
                  <Input
                    id="disciplina"
                    value={formData.disciplina}
                    onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                    placeholder="Ex: Programação Web"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="professor">Professor</Label>
                  <Select
                    value={formData.professorId}
                    onValueChange={(value) => setFormData({ ...formData, professorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>
                          {professor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sala">Sala</Label>
                  <Select
                    value={formData.salaId}
                    onValueChange={(value) => setFormData({ ...formData, salaId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma sala" />
                    </SelectTrigger>
                    <SelectContent>
                      {salasDisponiveis.map((sala) => (
                        <SelectItem key={sala.id} value={sala.id}>
                          {sala.nome} - {sala.localizacao} (Cap: {sala.capacidade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dataHora">Data e Hora</Label>
                  <Input
                    id="dataHora"
                    type="datetime-local"
                    value={formData.dataHora}
                    onChange={(e) => setFormData({ ...formData, dataHora: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duracao">Duração (minutos)</Label>
                  <Select
                    value={formData.duracao}
                    onValueChange={(value) => setFormData({ ...formData, duracao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                      <SelectItem value="120">120 minutos</SelectItem>
                      <SelectItem value="180">180 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={salvarAula}>
                  Agendar Aula
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {aulasExibidas.map((aula) => (
          <Card key={aula.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{aula.disciplina}</CardTitle>
                <Badge variant={getStatusColor(aula.status)}>{getStatusText(aula.status)}</Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {aula.professor}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{aula.sala}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(aula.dataHora).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(aula.dataHora).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {aula.duracao}min
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {aulasExibidas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma aula encontrada</h3>
            <p className="text-muted-foreground text-center">
              {usuario?.tipo === "professor"
                ? "Você não possui aulas agendadas no momento."
                : "Não há aulas cadastradas no sistema."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
