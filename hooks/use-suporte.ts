import { Chamado } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useChamados() {
  return useQuery({
    queryKey: ['chamados'],
    queryFn: async () => {
      const response = await fetch('/api/suporte');
      if (!response.ok) {
        throw new Error('Erro ao buscar chamados');
      }
      return response.json() as Promise<Chamado[]>;
    },
  });
}

export function useChamado(id: string) {
  return useQuery({
    queryKey: ['chamado', id],
    queryFn: async () => {
      const response = await fetch(`/api/suporte/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar chamado');
      }
      return response.json() as Promise<Chamado>;
    },
    enabled: !!id,
  });
}

export function useCreateChamado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chamado: Omit<Chamado, 'id'>) => {
      const response = await fetch('/api/suporte', {
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Chamado, 'id'>> }) => {
      const response = await fetch(`/api/suporte/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar chamado');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chamados'] });
      queryClient.invalidateQueries({ queryKey: ['chamado', variables.id] });
    },
  });
}

export function useDeleteChamado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/suporte/${id}`, {
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
