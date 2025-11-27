"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Headphones, AlertTriangle } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { salas, aulas, chamados } from "@/lib/data"
import type { Usuario } from "@/lib/types"

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    setUsuario(getCurrentUser())
  }, [])

  if (!usuario) return null

  const salasDisponiveis = salas.filter((s) => s.statusManual === "disponivel").length
  const salasOcupadas = salas.filter((s) => s.statusManual === "indisponivel").length
  const salasManutencao = salas.filter((s) => s.statusManual === "manutencao").length

  const aulasHoje = aulas.filter((a) => {
    const hoje = new Date().toDateString()
    const aulaData = new Date(a.dataHora).toDateString()
    return hoje === aulaData
  }).length

  const chamadosAbertos = chamados.filter((c) => c.status === "aberto" || c.status === "em_andamento").length

  const minhasAulas =
    usuario.tipo === "professor" && usuario.id
      ? aulas.filter((a) => a.professores.some((p) => p.id === usuario.id))
      : []

  // Adicione após as outras variáveis de contagem
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
              <CardDescription>Suas aulas agendadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {minhasAulas.slice(0, 3).map((aula) => (
                  <div key={aula.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{aula.disciplina}</p>
                      <p className="text-sm text-muted-foreground">
                        {aula.sala} - {new Date(aula.dataHora).toLocaleString("pt-BR")}
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
                ))}
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
