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
import { Plus, Edit, Users, Monitor, MapPin } from "lucide-react"
import { salas as salasIniciais } from "@/lib/data"
import type { Sala } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"

export default function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>(salasIniciais)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [salaEditando, setSalaEditando] = useState<Sala | null>(null)
  const [usuario, setUsuario] = useState(getCurrentUser())

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
      // Editar sala existente
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
      // Criar nova sala
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

  if (usuario?.tipo !== "coordenador") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Salas</h1>
          <p className="text-muted-foreground">Visualização das salas disponíveis</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {salas.map((sala) => (
            <Card key={sala.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{sala.nome}</CardTitle>
                  <Badge variant={getStatusColor(sala.status)}>{getStatusText(sala.status)}</Badge>
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
          ))}
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {salas.map((sala) => (
          <Card key={sala.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{sala.nome}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(sala.status)}>{getStatusText(sala.status)}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => abrirDialog(sala)}>
                    <Edit className="h-4 w-4" />
                  </Button>
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
        ))}
      </div>
    </div>
  )
}
