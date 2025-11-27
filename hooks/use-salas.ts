import { Sala } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useSalas() {
  return useQuery({
    queryKey: ['salas'],
    queryFn: async () => {
      const response = await fetch('/api/sala');
      if (!response.ok) {
        throw new Error('Erro ao buscar salas');
      }
      return response.json() as Promise<Sala[]>;
    },
  });
}

export function useSala(id: string) {
  return useQuery({
    queryKey: ['sala', id],
    queryFn: async () => {
      const response = await fetch(`/api/sala/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar sala');
      }
      return response.json() as Promise<Sala>;
    },
    enabled: !!id,
  });
}

export function useCreateSala() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sala: Omit<Sala, 'id'>) => {
      const response = await fetch('/api/sala', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sala),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sala');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salas'] });
    },
  });
}

export function useUpdateSala() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sala: Sala) => {
      if (!sala.id) {
        throw new Error('ID da sala é obrigatório');
      }
      const response = await fetch(`/api/sala/${sala.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sala),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar sala');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salas'] });
      queryClient.invalidateQueries({ queryKey: ['sala', variables.id] });
    },
  });
}

export function useDeleteSala() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/sala/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir sala');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salas'] });
    },
  });
}
