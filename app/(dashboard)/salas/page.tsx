"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Edit, Users, Monitor, MapPin, Search, Building, CheckCircle, AlertTriangle, Wrench } from "lucide-react"
import { salas as salasIniciais } from "@/lib/data"
import type { Sala } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"

export default function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>(salasIniciais)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [salaEditando, setSalaEditando] = useState<Sala | null>(null)
  const [usuario, setUsuario] = useState(getCurrentUser())

  const [filtro, setFiltro] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<string>("todos")
  const [capacidadeFiltro, setCapacidadeFiltro] = useState<string>("todos")

  const [formData, setFormData] = useState({
    nome: "",
    capacidade: "",
    equipamentos: "",
    status: "disponivel" as Sala["status"],
    localizacao: "",
  })

  useEffect(() => {
    setUsuario(getCurrentUser())
  }, [])

  const resetForm = () => {
    setFormData({
      nome: "",
      capacidade: "",
      equipamentos: "",
      status: "disponivel",
      localizacao: "",
    })
    setSalaEditando(null)
  }

  const abrirDialog = (sala?: Sala) => {
    if (sala) {
      setSalaEditando(sala)
      setFormData({
        nome: sala.nome,
        capacidade: sala.capacidade.toString(),
        equipamentos: sala.equipamentos.join(", "),
        status: sala.status,
        localizacao: sala.localizacao,
      })
    } else {
      resetForm()
    }
    setDialogAberto(true)
  }

  const salvarSala = () => {
    const equipamentosArray = formData.equipamentos
      .split(",")
      .map((eq) => eq.trim())
      .filter((eq) => eq.length > 0)

    if (salaEditando) {
      setSalas(
        salas.map((sala) =>
          sala.id === salaEditando.id
            ? {
                ...sala,
                nome: formData.nome,
                capacidade: Number.parseInt(formData.capacidade),
                equipamentos: equipamentosArray,
                status: formData.status,
                localizacao: formData.localizacao,
              }
            : sala,
        ),
      )
    } else {
      const novaSala: Sala = {
        id: Date.now().toString(),
        nome: formData.nome,
        capacidade: Number.parseInt(formData.capacidade),
        equipamentos: equipamentosArray,
        status: formData.status,
        localizacao: formData.localizacao,
      }
      setSalas([...salas, novaSala])
    }

    setDialogAberto(false)
    resetForm()
  }

  const getStatusColor = (status: Sala["status"]) => {
    switch (status) {
      case "disponivel":
        return "default"
      case "ocupada":
        return "secondary"
      case "manutencao":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: Sala["status"]) => {
    switch (status) {
      case "disponivel":
        return "Disponível"
      case "ocupada":
        return "Ocupada"
      case "manutencao":
        return "Manutenção"
      default:
        return status
    }
  }

  const salasFiltradas = salas.filter((s) => {
    const matchFiltro =
      filtro === "" ||
      s.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      s.localizacao.toLowerCase().includes(filtro.toLowerCase()) ||
      s.equipamentos.some((eq) => eq.toLowerCase().includes(filtro.toLowerCase()))

    const matchStatus = statusFiltro === "todos" || s.status === statusFiltro

    const matchCapacidade =
      capacidadeFiltro === "todos" ||
      (capacidadeFiltro === "pequena" && s.capacidade <= 30) ||
      (capacidadeFiltro === "media" && s.capacidade > 30 && s.capacidade <= 60) ||
      (capacidadeFiltro === "grande" && s.capacidade > 60)

    return matchFiltro && matchStatus && matchCapacidade
  })

  const totalSalas = salas.length
  const salasDisponiveis = salas.filter((s) => s.status === "disponivel").length
  const salasOcupadas = salas.filter((s) => s.status === "ocupada").length
  const salasManutencao = salas.filter((s) => s.status === "manutencao").length

  const RoomCard = ({ sala, showEdit = false }: { sala: Sala; showEdit?: boolean }) => (
    <Card key={sala.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{sala.nome}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(sala.status)}>{getStatusText(sala.status)}</Badge>
            {showEdit && (
              <Button variant="ghost" size="sm" onClick={() => abrirDialog(sala)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {sala.localizacao}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Capacidade: {sala.capacidade} pessoas</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Equipamentos:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {sala.equipamentos.map((equipamento, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {equipamento}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const FiltersSection = () => (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, localização ou equipamento..."
          className="pl-8"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>
      <Select value={statusFiltro} onValueChange={setStatusFiltro}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os Status</SelectItem>
          <SelectItem value="disponivel">Disponível</SelectItem>
          <SelectItem value="ocupada">Ocupada</SelectItem>
          <SelectItem value="manutencao">Manutenção</SelectItem>
        </SelectContent>
      </Select>
      <Select value={capacidadeFiltro} onValueChange={setCapacidadeFiltro}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Capacidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas Capacidades</SelectItem>
          <SelectItem value="pequena">Pequena (até 30)</SelectItem>
          <SelectItem value="media">Média (31-60)</SelectItem>
          <SelectItem value="grande">Grande (60+)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  const StatsCards = () => (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Total de Salas</p>
              <p className="text-2xl font-bold text-blue-600">{totalSalas}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Disponíveis</p>
              <p className="text-2xl font-bold text-green-600">{salasDisponiveis}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Ocupadas</p>
              <p className="text-2xl font-bold text-orange-600">{salasOcupadas}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm font-medium">Manutenção</p>
              <p className="text-2xl font-bold text-red-600">{salasManutencao}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (usuario?.tipo !== "coordenador") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Salas</h1>
          <p className="text-muted-foreground">Visualização das salas disponíveis</p>
        </div>

        <StatsCards />
        <FiltersSection />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {salasFiltradas.map((sala) => (
            <RoomCard key={sala.id} sala={sala} />
          ))}
          {salasFiltradas.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma sala encontrada</h3>
                <p className="text-muted-foreground text-center">Tente ajustar os filtros para encontrar salas.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Salas</h1>
          <p className="text-muted-foreground">Gerencie as salas de aula da universidade</p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sala
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{salaEditando ? "Editar Sala" : "Nova Sala"}</DialogTitle>
              <DialogDescription>
                {salaEditando ? "Edite as informações da sala." : "Adicione uma nova sala ao sistema."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome da Sala</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Sala 101"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacidade">Capacidade</Label>
                <Input
                  id="capacidade"
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                  placeholder="Ex: 40"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  placeholder="Ex: Bloco A - 1º Andar"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Sala["status"]) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="ocupada">Ocupada</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="equipamentos">Equipamentos</Label>
                <Textarea
                  id="equipamentos"
                  value={formData.equipamentos}
                  onChange={(e) => setFormData({ ...formData, equipamentos: e.target.value })}
                  placeholder="Ex: Projetor, Computador, Quadro Branco (separados por vírgula)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={salvarSala}>
                {salaEditando ? "Salvar Alterações" : "Criar Sala"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <StatsCards />
      <FiltersSection />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {salasFiltradas.map((sala) => (
          <RoomCard key={sala.id} sala={sala} showEdit />
        ))}
        {salasFiltradas.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma sala encontrada</h3>
              <p className="text-muted-foreground text-center">Tente ajustar os filtros para encontrar salas.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
