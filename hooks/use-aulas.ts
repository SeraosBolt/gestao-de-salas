import { Aula } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useAulas() {
  return useQuery({
    queryKey: ['aulas'],
    queryFn: async () => {
      const response = await fetch('/api/aula');
      if (!response.ok) {
        throw new Error('Erro ao buscar aulas');
      }
      return response.json() as Promise<Aula[]>;
    },
  });
}

export function useCreateAula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (aula: Omit<Aula, 'id'>) => {
      const response = await fetch('/api/aula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aula),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar aula');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
    },
  });
}

export function useUpdateAula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (aula: Aula) => {
      if (!aula.id) {
        throw new Error('ID da aula é obrigatório');
      }
      const response = await fetch(`/api/aula/${aula.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aula),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar aula');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
    },
  });
}

export function useDeleteAula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/aula/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir aula');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
    },
  });
}
