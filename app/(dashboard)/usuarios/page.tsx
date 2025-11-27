'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreHorizontal,
  UserCog,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  UserPlus,
  BookOpen,
  Headphones,
} from 'lucide-react';
import type { Usuario } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';
import { ProtectedRoute } from '@/components/protected-route';
import {
  useUsuarios,
  useCreateUsuario,
  useUpdateUsuario,
  useDeleteUsuario,
} from '@/hooks/use-usuarios';
import { toast } from 'sonner';

export default function UsuariosPage() {
  const { data: usuarios = [], isLoading, error } = useUsuarios();
  const { mutateAsync: createUsuario, isPending: isCreating } =
    useCreateUsuario();
  const { mutateAsync: updateUsuario, isPending: isUpdating } =
    useUpdateUsuario();
  const { mutateAsync: deleteUsuario, isPending: isDeleting } =
    useDeleteUsuario();

  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogDetalhes, setDialogDetalhes] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarioDetalhes, setUsuarioDetalhes] = useState<Usuario | null>(null);
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [usuario, setUsuario] = useState(getCurrentUser());
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    tipo: 'professor' as Usuario['tipo'],
    ativo: true,
    departamento: '',
    telefone: '',
  });

  useEffect(() => {
    setUsuario(getCurrentUser());
  }, []);

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      tipo: 'professor',
      ativo: true,
      departamento: '',
      telefone: '',
    });
    setUsuarioEditando(null);
  };

  const abrirDialog = (usuario?: Usuario) => {
    if (usuario) {
      setUsuarioEditando(usuario);
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        ativo: usuario.ativo,
        departamento: usuario.departamento || '',
        telefone: usuario.telefone || '',
      });
    } else {
      resetForm();
    }
    setDialogAberto(true);
  };

  const abrirDetalhes = (usuario: Usuario) => {
    setUsuarioDetalhes(usuario);
    setDialogDetalhes(true);
  };

  const salvarUsuario = async () => {
    try {
      if (usuarioEditando) {
        // Editar usuário existente
        await updateUsuario({
          ...usuarioEditando,
          nome: formData.nome,
          email: formData.email,
          tipo: formData.tipo,
          ativo: formData.ativo,
          departamento: formData.departamento,
          telefone: formData.telefone,
        });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        const novoUsuario: Omit<Usuario, 'id' | 'created_at'> = {
          nome: formData.nome,
          email: formData.email,
          senha: 'senha123', // Em um sistema real, a senha deve ser gerada e armazenada de forma segura
          tipo: formData.tipo,
          ativo: formData.ativo,
          departamento: formData.departamento,
          telefone: formData.telefone,
          foto: 'https://www.shutterstock.com/pt/image-photo/selfie-influencer-girl-live-streaming-update-2489152413',
        };
        await createUsuario(novoUsuario);
        toast.success('Usuário criado com sucesso!');
      }

      setDialogAberto(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar usuário');
    }
  };

  const alterarStatus = async (id: string | undefined, ativo: boolean) => {
    if (!id) return;
    try {
      const usuario = usuarios.find((u) => u.id === id);
      if (!usuario) return;

      await updateUsuario({
        ...usuario,
        ativo,
      });
      toast.success(`Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar status');
    }
  };

  const excluirUsuario = async (id: string) => {
    try {
      await deleteUsuario(id);
      toast.success('Usuário excluído com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário');
    }
  };

  const resetarSenha = (id: string | undefined) => {
    // Em um sistema real, isso enviaria um email com um link para redefinir a senha
    alert(
      `Senha resetada para o usuário ID: ${id}. Em um sistema real, um email seria enviado.`
    );
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchFiltro =
      filtro === '' ||
      (u.nome && u.nome.toLowerCase().includes(filtro.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(filtro.toLowerCase())) ||
      (u.departamento &&
        u.departamento.toLowerCase().includes(filtro.toLowerCase()));

    const matchTipo = tipoFiltro === 'todos' || u.tipo === tipoFiltro;
    const matchStatus =
      statusFiltro === 'todos' ||
      (statusFiltro === 'ativo' ? u.ativo : !u.ativo);

    return matchFiltro && matchTipo && matchStatus;
  });

  const getTipoLabel = (tipo: Usuario['tipo']) => {
    switch (tipo) {
      case 'professor':
        return 'Professor';
      case 'coordenador':
        return 'Coordenador';
      case 'suporte':
        return 'Suporte';
      default:
        return tipo;
    }
  };

  const getTipoColor = (tipo: Usuario['tipo']) => {
    switch (tipo) {
      case 'professor':
        return 'default';
      case 'coordenador':
        return 'secondary';
      case 'suporte':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Estatísticas de usuários
  const totalUsuarios = usuarios.length;
  const usuariosAtivos = usuarios.filter((u) => u.ativo).length;
  const professores = usuarios.filter((u) => u.tipo === 'professor').length;
  const suporte = usuarios.filter((u) => u.tipo === 'suporte').length;

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['coordenador']}>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['coordenador']}>
        <div className="flex items-center justify-center h-96">
          <p className="text-destructive">
            Erro ao carregar usuários: {error.message}
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['coordenador']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button onClick={() => abrirDialog()}>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogDescription>
                  {usuarioEditando
                    ? 'Edite as informações do usuário.'
                    : 'Adicione um novo usuário ao sistema.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Ex: joao.silva@universidade.edu"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo de Usuário</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: string) =>
                        setFormData({
                          ...formData,
                          tipo: value as Usuario['tipo'],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="coordenador">Coordenador</SelectItem>
                        <SelectItem value="suporte">Suporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.ativo ? 'ativo' : 'inativo'}
                      onValueChange={(value) =>
                        setFormData({ ...formData, ativo: value === 'ativo' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      id="departamento"
                      value={formData.departamento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departamento: e.target.value,
                        })
                      }
                      placeholder="Ex: Ciência da Computação"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone: e.target.value })
                      }
                      placeholder="Ex: (11) 98765-4321"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogAberto(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={salvarUsuario}
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {usuarioEditando ? 'Salvando...' : 'Criando...'}
                    </>
                  ) : usuarioEditando ? (
                    'Salvar Alterações'
                  ) : (
                    'Criar Usuário'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total de Usuários</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalUsuarios}
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
                  <p className="text-sm font-medium">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {usuariosAtivos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Professores</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {professores}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Suporte</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {suporte}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou departamento..."
              className="pl-8"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de Usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="professor">Professor</SelectItem>
              <SelectItem value="coordenador">Coordenador</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela de Usuários */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">
                      {usuario.nome}
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant={getTipoColor(usuario.tipo)}>
                        {getTipoLabel(usuario.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>{usuario.departamento || '-'}</TableCell>
                    <TableCell>
                      {usuario.ativo ? (
                        <Badge variant="default" className="bg-green-500">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-500">
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => abrirDetalhes(usuario as Usuario)}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => abrirDialog(usuario as Usuario)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => resetarSenha(usuario.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resetar Senha
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              alterarStatus(usuario.id ?? '', !usuario.ativo)
                            }
                            className={
                              usuario.ativo ? 'text-red-600' : 'text-green-600'
                            }
                          >
                            {usuario.ativo ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => excluirUsuario(usuario.id ?? '')}
                            className="text-red-600"
                            disabled={usuario.tipo === 'coordenador'}
                          >
                            {isDeleting ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Excluindo
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum usuário encontrado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog de Detalhes do Usuário */}
        <Dialog open={dialogDetalhes} onOpenChange={setDialogDetalhes}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
            </DialogHeader>
            {usuarioDetalhes && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={usuarioDetalhes.foto || '/placeholder.svg'}
                    />
                    <AvatarFallback className="text-lg">
                      {usuarioDetalhes.nome
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-semibold">
                      {usuarioDetalhes.nome}
                    </h3>
                    <Badge
                      variant={getTipoColor(usuarioDetalhes.tipo)}
                      className="mt-1"
                    >
                      {getTipoLabel(usuarioDetalhes.tipo)}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {usuarioDetalhes.ativo
                        ? 'Usuário Ativo'
                        : 'Usuário Inativo'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{usuarioDetalhes.email}</span>
                  </div>
                  {usuarioDetalhes.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{usuarioDetalhes.telefone}</span>
                    </div>
                  )}
                  {usuarioDetalhes.departamento && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{usuarioDetalhes.departamento}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Criado em:{' '}
                      {usuarioDetalhes.ultimoAcesso
                        ? usuarioDetalhes.ultimoAcesso.toJSON().seconds
                        : '-'}
                    </span>
                  </div>
                  {usuarioDetalhes.ultimoAcesso && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Último acesso:{' '}
                        {usuarioDetalhes.ultimoAcesso.toJSON().seconds}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => abrirDialog(usuarioDetalhes)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant={usuarioDetalhes.ativo ? 'destructive' : 'default'}
                    onClick={() => {
                      alterarStatus(
                        usuarioDetalhes?.id,
                        !usuarioDetalhes.ativo
                      );
                      setDialogDetalhes(false);
                    }}
                  >
                    {usuarioDetalhes.ativo ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
