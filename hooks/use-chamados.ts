import { Chamado } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useChamados() {
  return useQuery({
    queryKey: ['chamados'],
    queryFn: async () => {
      const response = await fetch('/api/chamado');
      if (!response.ok) {
        throw new Error('Erro ao buscar chamados');
      }
      return response.json() as Promise<Chamado[]>;
    },
  });
}

export function useCreateChamado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chamado: Omit<Chamado, 'id'>) => {
      const response = await fetch('/api/chamado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chamado),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar chamado');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chamados'] });
    },
  });
}

export function useUpdateChamado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chamado: Chamado) => {
      if (!chamado.id) {
        throw new Error('ID do chamado é obrigatório');
      }
      const response = await fetch(`/api/chamado/${chamado.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chamado),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar chamado');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chamados'] });
    },
  });
}

export function useDeleteChamado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/chamado/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir chamado');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chamados'] });
    },
  });
}
