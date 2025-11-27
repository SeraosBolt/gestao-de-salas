"use client"

import { useState, useEffect, useMemo } from "react"
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
import {
  Plus,
  Edit,
  Users,
  Monitor,
  MapPin,
  Search,
  Building,
  CheckCircle,
  Wrench,
  Clock,
  Ban,
  Calendar,
  Trash2,
  Loader2,
} from "lucide-react"
import { aulas as aulasIniciais } from "@/lib/data"
import type { Sala, Aula, StatusSalaCalculado } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { getCurrentRoomStatus, getClassesForRoomOnDay } from "@/lib/room-utils"
import { useSalas, useCreateSala, useUpdateSala, useDeleteSala } from "@/hooks/use-salas"
import { useToast } from "@/hooks/use-toast"

export default function SalasPage() {
  const { data: salas = [], isLoading } = useSalas()
  const createSala = useCreateSala()
  const updateSala = useUpdateSala()
  const deleteSala = useDeleteSala()
  const { toast } = useToast()
  
  const [aulas] = useState<Aula[]>(aulasIniciais)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogOcupacaoAberto, setDialogOcupacaoAberto] = useState(false)
  const [dialogExcluirAberto, setDialogExcluirAberto] = useState(false)
  const [salaEditando, setSalaEditando] = useState<Sala | null>(null)
  const [salaSelecionadaOcupacao, setSalaSelecionadaOcupacao] = useState<Sala | null>(null)
  const [salaSelecionadaExcluir, setSalaSelecionadaExcluir] = useState<Sala | null>(null)
  const [usuario, setUsuario] = useState(getCurrentUser())

  const [filtro, setFiltro] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<string>("todos")
  const [capacidadeFiltro, setCapacidadeFiltro] = useState<string>("todos")

  const [formData, setFormData] = useState({
    nome: "",
    capacidade: "",
    equipamentos: "",
    statusManual: "disponivel" as Sala["statusManual"],
    localizacao: "",
  })

  useEffect(() => {
    setUsuario(getCurrentUser())
  }, [])

  // Calculate real-time status for all rooms
  const salasComStatus = useMemo(() => {
    return salas.map((sala) => ({
      sala,
      statusCalculado: getCurrentRoomStatus(sala, aulas),
      aulasHoje: getClassesForRoomOnDay(sala, aulas, new Date()),
    }))
  }, [salas, aulas])

  const resetForm = () => {
    setFormData({
      nome: "",
      capacidade: "",
      equipamentos: "",
      statusManual: "disponivel",
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
        statusManual: sala.statusManual,
        localizacao: sala.localizacao,
      })
    } else {
      resetForm()
    }
    setDialogAberto(true)
  }

  const abrirDialogOcupacao = (sala: Sala) => {
    setSalaSelecionadaOcupacao(sala)
    setDialogOcupacaoAberto(true)
  }

  const salvarSala = async () => {
    const equipamentosArray = formData.equipamentos
      .split(",")
      .map((eq) => eq.trim())
      .filter((eq) => eq.length > 0)

    const salaData = {
      nome: formData.nome,
      capacidade: Number.parseInt(formData.capacidade),
      equipamentos: equipamentosArray,
      statusManual: formData.statusManual,
      localizacao: formData.localizacao,
    }

    try {
      if (salaEditando) {
        await updateSala.mutateAsync({
          ...salaData,
          id: salaEditando.id,
        })
        toast({
          title: "Sucesso!",
          description: "Sala atualizada com sucesso.",
        })
      } else {
        await createSala.mutateAsync(salaData)
        toast({
          title: "Sucesso!",
          description: "Sala criada com sucesso.",
        })
      }

      setDialogAberto(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar sala.",
        variant: "destructive",
      })
    }
  }

  const confirmarExclusao = async () => {
    if (!salaSelecionadaExcluir?.id) return

    try {
      await deleteSala.mutateAsync(salaSelecionadaExcluir.id)
      toast({
        title: "Sucesso!",
        description: "Sala excluída com sucesso.",
      })
      setDialogExcluirAberto(false)
      setSalaSelecionadaExcluir(null)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir sala.",
        variant: "destructive",
      })
    }
  }

  const abrirDialogExcluir = (sala: Sala) => {
    setSalaSelecionadaExcluir(sala)
    setDialogExcluirAberto(true)
  }

  const getStatusColor = (status: StatusSalaCalculado) => {
    switch (status) {
      case "disponivel":
        return "default"
      case "ocupada":
        return "secondary"
      case "indisponivel":
        return "outline"
      case "manutencao":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: StatusSalaCalculado) => {
    switch (status) {
      case "disponivel":
        return "Disponível"
      case "ocupada":
        return "Ocupada"
      case "indisponivel":
        return "Indisponível"
      case "manutencao":
        return "Manutenção"
      default:
        return status
    }
  }

  const getStatusIcon = (status: StatusSalaCalculado) => {
    switch (status) {
      case "disponivel":
        return <CheckCircle className="h-4 w-4" />
      case "ocupada":
        return <Clock className="h-4 w-4" />
      case "indisponivel":
        return <Ban className="h-4 w-4" />
      case "manutencao":
        return <Wrench className="h-4 w-4" />
      default:
        return null
    }
  }

  const salasFiltradas = salasComStatus.filter(({ sala, statusCalculado }) => {
    const matchFiltro =
      filtro === "" ||
      sala.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      sala.localizacao.toLowerCase().includes(filtro.toLowerCase()) ||
      sala.equipamentos.some((eq) => eq.toLowerCase().includes(filtro.toLowerCase()))

    const matchStatus = statusFiltro === "todos" || statusCalculado === statusFiltro

    const matchCapacidade =
      capacidadeFiltro === "todos" ||
      (capacidadeFiltro === "pequena" && sala.capacidade <= 30) ||
      (capacidadeFiltro === "media" && sala.capacidade > 30 && sala.capacidade <= 60) ||
      (capacidadeFiltro === "grande" && sala.capacidade > 60)

    return matchFiltro && matchStatus && matchCapacidade
  })

  const totalSalas = salas.length
  const salasDisponiveis = salasComStatus.filter((s) => s.statusCalculado === "disponivel").length
  const salasOcupadas = salasComStatus.filter((s) => s.statusCalculado === "ocupada").length
  const salasManutencao = salasComStatus.filter((s) => s.statusCalculado === "manutencao").length
  const salasIndisponiveis = salasComStatus.filter((s) => s.statusCalculado === "indisponivel").length

  const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

  const RoomCard = ({
    sala,
    statusCalculado,
    aulasHoje,
    showEdit = false,
  }: {
    sala: Sala
    statusCalculado: StatusSalaCalculado
    aulasHoje: { aula: Aula; horario: { horaInicio: string; horaFim: string } }[]
    showEdit?: boolean
  }) => (
    <Card key={sala.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{sala.nome}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(statusCalculado)} className="flex items-center gap-1">
              {getStatusIcon(statusCalculado)}
              {getStatusText(statusCalculado)}
            </Badge>
            {showEdit && (
              <>
                <Button variant="ghost" size="sm" onClick={() => abrirDialog(sala)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => abrirDialogExcluir(sala)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
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

          {/* Show today's classes */}
          {aulasHoje.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Aulas Hoje:</span>
              </div>
              <div className="space-y-1">
                {aulasHoje.slice(0, 2).map(({ aula, horario }, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      {horario.horaInicio} - {horario.horaFim}:
                    </span>
                    <span className="font-medium">{aula.disciplina}</span>
                  </div>
                ))}
                {aulasHoje.length > 2 && (
                  <Button variant="link" className="h-auto p-0 text-xs" onClick={() => abrirDialogOcupacao(sala)}>
                    +{aulasHoje.length - 2} mais aulas...
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Manual status indicator */}
          {sala.statusManual !== "disponivel" && (
            <div className="pt-2 border-t">
              <Badge variant="outline" className="text-xs">
                Status Manual: {sala.statusManual === "indisponivel" ? "Indisponível" : "Manutenção"}
              </Badge>
            </div>
          )}
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
          <SelectItem value="indisponivel">Indisponível</SelectItem>
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
    <div className="grid gap-4 md:grid-cols-5">
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
            <Clock className="h-4 w-4 text-orange-500" />
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
            <Ban className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Indisponíveis</p>
              <p className="text-2xl font-bold text-gray-600">{salasIndisponiveis}</p>
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

  // Dialog for viewing room occupation details
  const OccupationDialog = () => {
    if (!salaSelecionadaOcupacao) return null
    const aulasHoje = getClassesForRoomOnDay(salaSelecionadaOcupacao, aulas, new Date())

    return (
      <Dialog open={dialogOcupacaoAberto} onOpenChange={setDialogOcupacaoAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ocupação - {salaSelecionadaOcupacao.nome}</DialogTitle>
            <DialogDescription>Aulas agendadas para hoje ({DIAS_SEMANA[new Date().getDay()]})</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {aulasHoje.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhuma aula agendada para hoje</p>
            ) : (
              aulasHoje.map(({ aula, horario }, idx) => (
                <Card key={idx}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{aula.disciplina}</span>
                      <Badge variant="secondary">
                        {horario.horaInicio} - {horario.horaFim}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Professor(es): {aula.professores.map((p) => p.nome).join(", ")}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (usuario?.tipo !== "coordenador") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Salas</h1>
          <p className="text-muted-foreground">Visualização das salas disponíveis</p>
        </div>

        <StatsCards />
        <FiltersSection />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {salasFiltradas.map(({ sala, statusCalculado, aulasHoje }) => (
              <RoomCard key={sala.id} sala={sala} statusCalculado={statusCalculado} aulasHoje={aulasHoje} />
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
        )}

        <OccupationDialog />
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
                <Label htmlFor="status">Status Manual</Label>
                <Select
                  value={formData.statusManual}
                  onValueChange={(value: Sala["statusManual"]) => setFormData({ ...formData, statusManual: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="indisponivel">Indisponível</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Status manual sobrepõe o status calculado pelas aulas (exceto para "Disponível")
                </p>
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
              <Button 
                type="submit" 
                onClick={salvarSala}
                disabled={createSala.isPending || updateSala.isPending}
              >
                {(createSala.isPending || updateSala.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {salaEditando ? "Salvar Alterações" : "Criar Sala"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <StatsCards />
      <FiltersSection />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {salasFiltradas.map(({ sala, statusCalculado, aulasHoje }) => (
            <RoomCard key={sala.id} sala={sala} statusCalculado={statusCalculado} aulasHoje={aulasHoje} showEdit />
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
      )}

      <OccupationDialog />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={dialogExcluirAberto} onOpenChange={setDialogExcluirAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá excluir permanentemente a sala{" "}
              <strong>{salaSelecionadaExcluir?.nome}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              disabled={deleteSala.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSala.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
