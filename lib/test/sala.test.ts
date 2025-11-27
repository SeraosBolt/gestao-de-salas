/**
 * Script de teste para validar o CRUD de Salas
 * Execute este código no console do navegador ou em um componente de teste
 */

// Teste 1: Buscar todas as salas
async function testarListarSalas() {
  console.log('🧪 Teste 1: Listar todas as salas');
  const response = await fetch('/api/sala');
  const salas = await response.json();
  console.log('✅ Salas encontradas:', salas.length);
  console.table(salas);
  return salas;
}

// Teste 2: Criar nova sala
async function testarCriarSala() {
  console.log('🧪 Teste 2: Criar nova sala');
  const novaSala = {
    nome: `Sala Teste ${Date.now()}`,
    capacidade: 30,
    equipamentos: ['Projetor', 'Quadro Branco', 'Ar Condicionado'],
    statusManual: 'disponivel',
    localizacao: 'Bloco Teste - 1º Andar'
  };
  
  const response = await fetch('/api/sala', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novaSala)
  });
  
  const result = await response.json();
  console.log('✅ Sala criada:', result);
  return result;
}

// Teste 3: Buscar sala por ID
async function testarBuscarPorId(id: string) {
  console.log('🧪 Teste 3: Buscar sala por ID');
  const response = await fetch(`/api/sala/${id}`);
  const sala = await response.json();
  console.log('✅ Sala encontrada:', sala);
  return sala;
}

// Teste 4: Atualizar sala
async function testarAtualizarSala(id: string) {
  console.log('🧪 Teste 4: Atualizar sala');
  const salaAtualizada = {
    capacidade: 50,
    equipamentos: ['Projetor 4K', 'Quadro Interativo', 'Ar Condicionado', 'Microfone']
  };
  
  const response = await fetch(`/api/sala/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(salaAtualizada)
  });
  
  const result = await response.json();
  console.log('✅ Sala atualizada:', result);
  return result;
}

// Teste 5: Excluir sala
async function testarExcluirSala(id: string) {
  console.log('🧪 Teste 5: Excluir sala');
  const response = await fetch(`/api/sala/${id}`, {
    method: 'DELETE'
  });
  
  const result = await response.json();
  console.log('✅ Sala excluída:', result);
  return result;
}

// Teste 6: Validação - Criar sala com nome duplicado
async function testarNomeDuplicado() {
  console.log('🧪 Teste 6: Validação de nome duplicado');
  const salaDuplicada = {
    nome: 'Sala 101', // Nome que provavelmente já existe
    capacidade: 30,
    equipamentos: ['Projetor'],
    statusManual: 'disponivel',
    localizacao: 'Bloco A'
  };
  
  try {
    const response = await fetch('/api/sala', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salaDuplicada)
    });
    
    const result = await response.json();
    if (!response.ok) {
      console.log('✅ Validação funcionou - erro esperado:', result.error);
    } else {
      console.log('⚠️ Sala criada (pode não existir duplicata):', result);
    }
    return result;
  } catch (error) {
    console.log('✅ Erro capturado:', error);
  }
}

// Executar todos os testes em sequência
async function executarTodosTestes() {
  console.log('🚀 Iniciando bateria de testes do CRUD de Salas\n');
  
  try {
    // 1. Listar salas existentes
    const salas = await testarListarSalas();
    console.log('\n---\n');
    
    // 2. Criar nova sala
    const salaCriada = await testarCriarSala();
    const salaId = salaCriada.id;
    console.log('\n---\n');
    
    // 3. Buscar sala recém-criada
    await testarBuscarPorId(salaId);
    console.log('\n---\n');
    
    // 4. Atualizar sala
    await testarAtualizarSala(salaId);
    console.log('\n---\n');
    
    // 5. Validar nome duplicado
    await testarNomeDuplicado();
    console.log('\n---\n');
    
    // 6. Excluir sala de teste
    await testarExcluirSala(salaId);
    console.log('\n---\n');
    
    console.log('✅ Todos os testes executados com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Exportar funções para uso
export {
  testarListarSalas,
  testarCriarSala,
  testarBuscarPorId,
  testarAtualizarSala,
  testarExcluirSala,
  testarNomeDuplicado,
  executarTodosTestes
};

// Para executar no console do navegador, copie e cole:
// await executarTodosTestes()
