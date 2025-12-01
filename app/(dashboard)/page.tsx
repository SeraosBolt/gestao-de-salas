"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Headphones, AlertTriangle, RefreshCw } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import type { Usuario } from "@/lib/types"
import { useSalas } from "@/hooks/use-salas"
import { useAulas } from "@/hooks/use-aulas"
import { useChamados } from "@/hooks/use-chamados"

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const { data: salas = [], isLoading: isLoadingSalas } = useSalas()
  const { data: aulas = [], isLoading: isLoadingAulas } = useAulas()
  const { data: chamados = [], isLoading: isLoadingChamados } = useChamados()

  useEffect(() => {
    setUsuario(getCurrentUser())
  }, [])

  const isLoading = isLoadingSalas || isLoadingAulas || isLoadingChamados

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!usuario) return null

  const salasDisponiveis = salas.filter((s) => s.statusManual === "disponivel").length
  const salasOcupadas = salas.filter((s) => s.statusManual === "indisponivel").length
  const salasManutencao = salas.filter((s) => s.statusManual === "manutencao").length

  // Contar aulas de hoje com base nos horários semanais e período letivo
  const hoje = new Date()
  const diaSemanaHoje = hoje.getDay()
  // Garantir que a data seja no formato local (sem conversão de timezone)
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  const dataHoje = `${ano}-${mes}-${dia}`

  // Contar cada ocorrência de aula hoje (uma aula pode ter múltiplos horários no mesmo dia)
  const aulasHoje = aulas.reduce((total, aula) => {
    // Verificar se hoje está dentro do período letivo
    if (aula.dataInicioAnoLetivo && aula.dataFimAnoLetivo) {
      // Comparar strings de data no formato ISO (YYYY-MM-DD)
      if (dataHoje < aula.dataInicioAnoLetivo || dataHoje > aula.dataFimAnoLetivo) {
        return total // Hoje não está no período letivo desta aula
      }
    }
    
    // Contar quantos horários desta aula acontecem hoje
    const horariosHoje = aula.horarios.filter((h) => h.diaSemana === diaSemanaHoje).length
    return total + horariosHoje
  }, 0)

  const chamadosAbertos = chamados.filter((c) => c.status === "aberto" || c.status === "em_andamento").length

  const minhasAulas =
    usuario.tipo === "professor" && usuario.id
      ? aulas.filter((a) => a.professores.some((p) => p.id === usuario.id))
      : []

  // Próximas aulas do professor hoje
  const minhasAulasHoje = minhasAulas.filter((a) => {
    if (a.dataInicioAnoLetivo && a.dataFimAnoLetivo) {
      // Usar a mesma lógica de comparação de datas
      if (dataHoje < a.dataInicioAnoLetivo || dataHoje > a.dataFimAnoLetivo) {
        return false
      }
    }
    return a.horarios.some((h) => h.diaSemana === diaSemanaHoje)
  })

  const meusChamados = usuario?.tipo === "suporte" ? chamados.filter((c) => c.responsavelId === usuario.id) : []
  const chamadosNaoAtribuidos = chamados.filter((c) => !c.responsavelId && c.status === "aberto")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo, {usuario.nome}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salas Disponíveis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{salasDisponiveis}</div>
            <p className="text-xs text-muted-foreground">de {salas.length} salas totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salas Ocupadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{salasOcupadas}</div>
            <p className="text-xs text-muted-foreground">em uso no momento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aulas Hoje</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aulasHoje}</div>
            <p className="text-xs text-muted-foreground">aulas agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{chamadosAbertos}</div>
            <p className="text-xs text-muted-foreground">pendentes de resolução</p>
          </CardContent>
        </Card>

        {usuario?.tipo === "suporte" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meus Chamados</CardTitle>
                <Headphones className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{meusChamados.length}</div>
                <p className="text-xs text-muted-foreground">atribuídos a mim</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Não Atribuídos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{chamadosNaoAtribuidos.length}</div>
                <p className="text-xs text-muted-foreground">aguardando atribuição</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status das Salas</CardTitle>
            <CardDescription>Situação atual de todas as salas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salas.slice(0, 4).map((sala) => (
                <div key={sala.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sala.nome}</p>
                    <p className="text-sm text-muted-foreground">{sala.localizacao}</p>
                  </div>
                  <Badge
                    variant={
                      sala.statusManual === "disponivel" ? "default" : sala.statusManual === "indisponivel" ? "secondary" : "destructive"
                    }
                  >
                    {sala.statusManual === "disponivel" ? "Disponível" : sala.statusManual === "indisponivel" ? "Indisponível" : "Manutenção"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {usuario.tipo === "professor" ? (
          <Card>
            <CardHeader>
              <CardTitle>Minhas Próximas Aulas</CardTitle>
              <CardDescription>Suas aulas agendadas para hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {minhasAulasHoje.length > 0 ? (
                  minhasAulasHoje.slice(0, 3).map((aula) => {
                    const horarioHoje = aula.horarios.find((h) => h.diaSemana === diaSemanaHoje)
                    return (
                      <div key={aula.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{aula.disciplina}</p>
                          <p className="text-sm text-muted-foreground">
                            {aula.sala} - {horarioHoje?.horaInicio} às {horarioHoje?.horaFim}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {aula.status === "agendada"
                            ? "Agendada"
                            : aula.status === "em_andamento"
                              ? "Em Andamento"
                              : "Concluída"}
                        </Badge>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma aula agendada para hoje.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Chamados Recentes</CardTitle>
              <CardDescription>Últimas solicitações de suporte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chamados.slice(0, 3).map((chamado) => (
                  <div key={chamado.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{chamado.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {chamado.sala} - {chamado.solicitante}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          chamado.prioridade === "urgente" || chamado.prioridade === "alta"
                            ? "destructive"
                            : chamado.prioridade === "media"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {chamado.prioridade}
                      </Badge>
                      {chamado.status === "aberto" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {usuario.tipo === "suporte" && (
        <Card>
          <CardHeader>
            <CardTitle>Meus Chamados Ativos</CardTitle>
            <CardDescription>Chamados atribuídos a você</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meusChamados
                .filter((c) => c.status !== "fechado")
                .slice(0, 3)
                .map((chamado) => (
                  <div key={chamado.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{chamado.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {chamado.sala} - {chamado.solicitante}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          chamado.prioridade === "urgente" || chamado.prioridade === "alta"
                            ? "destructive"
                            : chamado.prioridade === "media"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {chamado.prioridade}
                      </Badge>
                      {chamado.status === "aberto" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                ))}
              {meusChamados.filter((c) => c.status !== "fechado").length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum chamado ativo no momento.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
