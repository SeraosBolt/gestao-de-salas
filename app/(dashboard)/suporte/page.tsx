'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Headphones,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  UserCheck,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { chamados as chamadosIniciais, salas, usuarios } from '@/lib/data';
import type { Chamado } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';

export default function SuportePage() {
  const [chamados, setChamados] = useState<Chamado[]>(chamadosIniciais);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogObservacoes, setDialogObservacoes] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(
    null
  );
  const [observacoes, setObservacoes] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todos');
  const [usuario, setUsuario] = useState(getCurrentUser());

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'equipamento' as Chamado['tipo'],
    prioridade: 'media' as Chamado['prioridade'],
    salaId: '',
  });

  useEffect(() => {
    setUsuario(getCurrentUser());
  }, []);

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'equipamento',
      prioridade: 'media',
      salaId: '',
    });
  };

  const criarChamado = () => {
    if (!usuario) return;

    const sala = salas.find((s) => s.id === formData.salaId);

    const novoChamado: Chamado = {
      id: Date.now().toString(),
      titulo: formData.titulo,
      descricao: formData.descricao,
      tipo: formData.tipo,
      prioridade: formData.prioridade,
      status: 'aberto',
      salaId: formData.salaId || undefined,
      sala: sala?.nome || undefined,
      solicitante: usuario.nome,
      solicitanteId: usuario.id,
      dataAbertura: new Date().toISOString() as any,
    };

    setChamados([novoChamado, ...chamados]);
    setDialogAberto(false);
    resetForm();
  };

  const atribuirChamado = (chamadoId: string, responsavelId: string | undefined) => {
    const responsavel = usuarios.find((u) => u.id === responsavelId);
    if (!responsavel) return;

    setChamados(
      chamados.map((chamado) =>
        chamado.id === chamadoId
          ? {
              ...chamado,
              responsavelId,
              responsavel: responsavel.nome,
              status:
                chamado.status === 'aberto' ? 'em_andamento' : chamado.status,
            }
          : chamado
      )
    );
  };

  const atualizarStatus = (
    chamadoId: string,
    novoStatus: Chamado['status']
  ) => {
    setChamados(
      chamados.map((chamado) =>
        chamado.id === chamadoId
          ? {
              ...chamado,
              status: novoStatus,
              dataResolucao:
                novoStatus === 'resolvido' || novoStatus === 'fechado'
                  ? (new Date().toISOString() as any)
                  : undefined,
            }
          : chamado
      )
    );
  };

  const adicionarObservacoes = () => {
    if (!chamadoSelecionado) return;

    setChamados(
      chamados.map((chamado) =>
        chamado.id === chamadoSelecionado.id
          ? {
              ...chamado,
              observacoes: observacoes,
            }
          : chamado
      )
    );

    setDialogObservacoes(false);
    setObservacoes('');
    setChamadoSelecionado(null);
  };

  const abrirDialogObservacoes = (chamado: Chamado) => {
    setChamadoSelecionado(chamado);
    setObservacoes(chamado.observacoes || '');
    setDialogObservacoes(true);
  };

  const getStatusColor = (status: Chamado['status']) => {
    switch (status) {
      case 'aberto':
        return 'destructive';
      case 'em_andamento':
        return 'secondary';
      case 'resolvido':
        return 'default';
      case 'fechado':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: Chamado['status']) => {
    switch (status) {
      case 'aberto':
        return 'Aberto';
      case 'em_andamento':
        return 'Em Andamento';
      case 'resolvido':
        return 'Resolvido';
      case 'fechado':
        return 'Fechado';
      default:
        return status;
    }
  };

  const getPrioridadeColor = (prioridade: Chamado['prioridade']) => {
    switch (prioridade) {
      case 'urgente':
        return 'destructive';
      case 'alta':
        return 'destructive';
      case 'media':
        return 'secondary';
      case 'baixa':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTipoText = (tipo: Chamado['tipo']) => {
    switch (tipo) {
      case 'manutencao':
        return 'Manutenção';
      case 'equipamento':
        return 'Equipamento';
      case 'limpeza':
        return 'Limpeza';
      case 'outro':
        return 'Outro';
      default:
        return tipo;
    }
  };

  // Filtrar chamados baseado no tipo de usuário e filtros
  const filtrarChamados = (lista: Chamado[]) => {
    let chamadosFiltrados = lista;

    if (filtroStatus !== 'todos') {
      chamadosFiltrados = chamadosFiltrados.filter(
        (c) => c.status === filtroStatus
      );
    }

    if (filtroPrioridade !== 'todos') {
      chamadosFiltrados = chamadosFiltrados.filter(
        (c) => c.prioridade === filtroPrioridade
      );
    }

    return chamadosFiltrados;
  };

  const chamadosExibidos =
    usuario?.tipo === 'professor'
      ? filtrarChamados(
          chamados.filter((chamado) => chamado.solicitanteId === usuario.id)
        )
      : filtrarChamados(chamados);

  const meusChamados =
    usuario?.tipo === 'suporte'
      ? filtrarChamados(
          chamados.filter((chamado) => chamado.responsavelId === usuario.id)
        )
      : [];

  const chamadosNaoAtribuidos = filtrarChamados(
    chamados.filter((chamado) => !chamado.responsavelId)
  );

  const usuariosSuporte = usuarios.filter((u) => u.tipo === 'suporte');

  const renderChamadoCard = (chamado: Chamado, showActions = true) => (
    <Card key={chamado.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{chamado.titulo}</CardTitle>
            <CardDescription className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {chamado.solicitante}
              </span>
              {chamado.sala && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {chamado.sala}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {chamado.dataAbertura.valueOf()}
              </span>
              {chamado.responsavel && (
                <span className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  {chamado.responsavel}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge variant={getPrioridadeColor(chamado.prioridade)}>
              {chamado.prioridade}
            </Badge>
            <Badge variant="outline">{getTipoText(chamado.tipo)}</Badge>
            <Badge variant={getStatusColor(chamado.status)}>
              {getStatusText(chamado.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          {chamado.descricao}
        </p>

        {chamado.observacoes && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Observações:
            </p>
            <p className="text-sm text-blue-700">{chamado.observacoes}</p>
          </div>
        )}

        {showActions && (
          <div className="flex flex-wrap gap-2">
            {/* Ações para Coordenador */}
            {usuario?.tipo === 'coordenador' && (
              <>
                {!chamado.responsavelId && (
                  <Select
                    onValueChange={(value) =>
                      atribuirChamado(chamado.id, value)
                    }
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Atribuir a..." />
                    </SelectTrigger>
                    <SelectContent>
                      {usuariosSuporte.map((suporte) => (
                        <SelectItem key={suporte.id} value={suporte.id ?? ''}>
                          {suporte.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {chamado.status === 'aberto' && chamado.responsavelId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => atualizarStatus(chamado.id, 'em_andamento')}
                  >
                    Iniciar Atendimento
                  </Button>
                )}

                {chamado.status === 'em_andamento' && (
                  <Button
                    size="sm"
                    onClick={() => atualizarStatus(chamado.id, 'resolvido')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Resolvido
                  </Button>
                )}

                {chamado.status === 'resolvido' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => atualizarStatus(chamado.id, 'fechado')}
                  >
                    Fechar Chamado
                  </Button>
                )}
              </>
            )}

            {/* Ações para Suporte */}
            {usuario?.tipo === 'suporte' && (
              <>
                {!chamado.responsavelId && (
                  <Button
                    size="sm"
                    onClick={() => atribuirChamado(chamado.id, usuario.id)}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Assumir Chamado
                  </Button>
                )}

                {chamado.responsavelId === usuario.id &&
                  chamado.status === 'aberto' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        atualizarStatus(chamado.id, 'em_andamento')
                      }
                    >
                      Iniciar Atendimento
                    </Button>
                  )}

                {chamado.responsavelId === usuario.id &&
                  chamado.status === 'em_andamento' && (
                    <Button
                      size="sm"
                      onClick={() => atualizarStatus(chamado.id, 'resolvido')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Resolvido
                    </Button>
                  )}

                {chamado.responsavelId === usuario.id &&
                  chamado.status !== 'fechado' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirDialogObservacoes(chamado)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {chamado.observacoes
                        ? 'Editar Observações'
                        : 'Adicionar Observações'}
                    </Button>
                  )}
              </>
            )}
          </div>
        )}

        {chamado.dataResolucao && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Resolvido em:{' '}
              {chamado.dataAbertura.valueOf()}
            </p>
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {usuario?.tipo === 'professor'
              ? 'Meus Chamados'
              : usuario?.tipo === 'suporte'
              ? 'Central de Suporte'
              : 'Sistema de Suporte'}
          </h1>
          <p className="text-muted-foreground">
            {usuario?.tipo === 'professor'
              ? 'Gerencie suas solicitações de suporte'
              : usuario?.tipo === 'suporte'
              ? 'Gerencie e resolva chamados de suporte'
              : 'Gerencie todas as solicitações de suporte'}
          </p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Chamado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Chamado</DialogTitle>
              <DialogDescription>
                Abra uma nova solicitação de suporte.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  placeholder="Ex: Projetor não funciona"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: Chamado['tipo']) =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipamento">Equipamento</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="limpeza">Limpeza</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value: Chamado['prioridade']) =>
                    setFormData({ ...formData, prioridade: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sala">Sala (opcional)</Label>
                <Select
                  value={formData.salaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, salaId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma sala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">
                      Nenhuma sala específica
                    </SelectItem>
                    {salas.map((sala) => (
                      <SelectItem key={sala.id} value={sala.id}>
                        {sala.nome} - {sala.localizacao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Descreva o problema em detalhes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={criarChamado}>
                Abrir Chamado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      {/* <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="resolvido">Resolvido</SelectItem>
            <SelectItem value="fechado">Fechado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Prioridades</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      {/* Interface específica para Suporte */}
      {usuario?.tipo === 'suporte' ? (
        <Tabs defaultValue="meus" className="space-y-4">
          <TabsList>
            <TabsTrigger value="meus">
              Meus Chamados ({meusChamados.length})
            </TabsTrigger>
            <TabsTrigger value="nao-atribuidos">
              Não Atribuídos ({chamadosNaoAtribuidos.length})
            </TabsTrigger>
            <TabsTrigger value="todos">
              Todos ({chamadosExibidos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meus" className="space-y-4">
            {meusChamados.length > 0 ? (
              <div className="grid gap-4">
                {meusChamados.map((chamado) => renderChamadoCard(chamado))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Headphones className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhum chamado atribuído
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Você não possui chamados atribuídos no momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nao-atribuidos" className="space-y-4">
            {chamadosNaoAtribuidos.length > 0 ? (
              <div className="grid gap-4">
                {chamadosNaoAtribuidos.map((chamado) =>
                  renderChamadoCard(chamado)
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Todos os chamados atribuídos
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Não há chamados aguardando atribuição.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="todos" className="space-y-4">
            {chamadosExibidos.length > 0 ? (
              <div className="grid gap-4">
                {chamadosExibidos.map((chamado) =>
                  renderChamadoCard(chamado, false)
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Headphones className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhum chamado encontrado
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Não há chamados que correspondam aos filtros selecionados.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        /* Interface para Professor e Coordenador */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chamadosExibidos.length > 0 ? (
            chamadosExibidos.map((chamado) => renderChamadoCard(chamado))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Headphones className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhum chamado encontrado
                </h3>
                <p className="text-muted-foreground text-center">
                  {usuario?.tipo === 'professor'
                    ? 'Você não possui chamados abertos no momento.'
                    : 'Não há chamados no sistema.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Estatísticas rápidas para coordenadores e suporte */}
      {(usuario?.tipo === 'coordenador' || usuario?.tipo === 'suporte') &&
        chamados.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Abertos</p>
                    <p className="text-2xl font-bold text-red-600">
                      {chamados.filter((c) => c.status === 'aberto').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Em Andamento</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {
                        chamados.filter((c) => c.status === 'em_andamento')
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Resolvidos</p>
                    <p className="text-2xl font-bold text-green-600">
                      {chamados.filter((c) => c.status === 'resolvido').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {chamados.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Dialog para observações */}
      <Dialog open={dialogObservacoes} onOpenChange={setDialogObservacoes}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Observações do Chamado</DialogTitle>
            <DialogDescription>
              Adicione observações sobre o atendimento deste chamado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva as ações realizadas, peças trocadas, etc..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={adicionarObservacoes}>
              Salvar Observações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
