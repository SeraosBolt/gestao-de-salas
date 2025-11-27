# CRUD de Salas - Implementação Completa

## 📋 Resumo

Foi implementado o CRUD completo para Salas seguindo a mesma estrutura do CRUD de Usuários, integrando com Firebase Firestore.

## 🗂️ Arquivos Criados/Modificados

### 1. Service Layer
**`lib/service/sala.service.ts`**
- ✅ `create()` - Cria nova sala (valida nome único)
- ✅ `getAll()` - Lista todas as salas
- ✅ `getById()` - Busca sala por ID
- ✅ `getByNome()` - Busca sala por nome
- ✅ `update()` - Atualiza sala (valida nome único)
- ✅ `delete()` - Remove sala

### 2. API Routes
**`app/api/sala/route.ts`**
- ✅ POST - Criar sala
- ✅ GET - Listar salas

**`app/api/sala/[id]/route.ts`**
- ✅ GET - Buscar sala por ID
- ✅ PATCH - Atualizar sala
- ✅ DELETE - Excluir sala

### 3. React Query Hooks
**`hooks/use-salas.ts`**
- ✅ `useSalas()` - Query para listar salas
- ✅ `useSala(id)` - Query para buscar sala específica
- ✅ `useCreateSala()` - Mutation para criar
- ✅ `useUpdateSala()` - Mutation para atualizar
- ✅ `useDeleteSala()` - Mutation para excluir

### 4. UI Components
**`app/(dashboard)/salas/page.tsx`**
- ✅ Integrado com hooks do React Query
- ✅ Loading states
- ✅ Toast notifications
- ✅ Dialog de confirmação de exclusão
- ✅ Formulário de criação/edição
- ✅ Botão de excluir sala
- ✅ Validações de formulário

## 🎯 Funcionalidades

### Para Coordenadores
- ✅ Criar nova sala
- ✅ Editar sala existente
- ✅ Excluir sala (com confirmação)
- ✅ Visualizar todas as salas
- ✅ Filtrar salas (nome, status, capacidade)

### Para Professores/Suporte
- ✅ Visualizar salas
- ✅ Filtrar salas
- ✅ Ver ocupação atual
- ⚠️ Sem permissão para editar/excluir

## 🔒 Validações Implementadas

### Backend (Service + API)
- ✅ Nome obrigatório e único
- ✅ Capacidade obrigatória e > 0
- ✅ Localização obrigatória
- ✅ Validação de ID em operações
- ✅ Verificação de duplicatas

### Frontend
- ✅ Campos obrigatórios
- ✅ Feedback visual de loading
- ✅ Mensagens de erro/sucesso
- ✅ Confirmação antes de excluir

## 📊 Estrutura de Dados

```typescript
interface Sala {
  id: string
  nome: string
  capacidade: number
  equipamentos: string[]
  statusManual: "disponivel" | "indisponivel" | "manutencao"
  localizacao: string
}
```

## 🔄 Fluxo de Dados

```
UI (page.tsx)
    ↕️
Hooks (use-salas.ts)
    ↕️
API Routes (/api/sala)
    ↕️
Service Layer (sala.service.ts)
    ↕️
Firebase Firestore
```

## 🚀 Como Usar

### Criar Sala
```typescript
const createSala = useCreateSala()

await createSala.mutateAsync({
  nome: "Sala 101",
  capacidade: 40,
  equipamentos: ["Projetor", "Quadro"],
  statusManual: "disponivel",
  localizacao: "Bloco A - 1º Andar"
})
```

### Atualizar Sala
```typescript
const updateSala = useUpdateSala()

await updateSala.mutateAsync({
  id: "sala-id",
  nome: "Sala 101A",
  capacidade: 45,
  // ... outros campos
})
```

### Excluir Sala
```typescript
const deleteSala = useDeleteSala()

await deleteSala.mutateAsync("sala-id")
```

## 🎨 UI/UX Features

- ✅ Loading spinners durante operações
- ✅ Toast notifications para feedback
- ✅ Dialog de confirmação para exclusão
- ✅ Estados desabilitados durante mutations
- ✅ Invalidação automática de cache após mutations
- ✅ Tratamento de erros com mensagens claras

## 📝 Notas Técnicas

1. **Validação de Nome Único**: O nome da sala é validado tanto na criação quanto na atualização
2. **Transações**: Usa transações do Firestore para garantir atomicidade na criação
3. **Cache Management**: React Query invalida automaticamente o cache após mutations
4. **Error Handling**: Erros são capturados e exibidos via toast
5. **Optimistic Updates**: Pode ser implementado futuramente para melhor UX

## 🔮 Melhorias Futuras

- [ ] Upload de imagens das salas
- [ ] Histórico de alterações
- [ ] Validação de conflitos de aulas antes de excluir
- [ ] Exportação de relatórios
- [ ] Bulk operations (criar/editar múltiplas salas)
- [ ] Soft delete (desativar ao invés de excluir)
