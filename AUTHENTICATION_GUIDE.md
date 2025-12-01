# Sistema de Autenticação com Criptografia de Senha

## ✨ Mudanças Implementadas

### 1. **Criptografia de Senhas com bcrypt**
- As senhas agora são criptografadas usando bcrypt antes de serem salvas no Firebase
- Biblioteca `bcryptjs` já estava instalada no projeto
- Hash com 10 rounds de salt para segurança adequada

### 2. **Formulário de Criação de Usuário**
- ✅ Adicionado campo "Senha" (obrigatório ao criar novo usuário)
- ✅ Adicionado campo "Confirmar Senha" (obrigatório ao criar novo usuário)
- ✅ Validação: senha mínima de 6 caracteres
- ✅ Validação: senhas devem coincidir
- ✅ Campos opcionais ao editar usuário existente (para alterar senha)

### 3. **Funcionalidade de Login Atualizada**
- ✅ Login agora compara senha usando bcrypt.compare()
- ✅ Não mais comparação de texto plano
- ✅ Segurança aprimorada na autenticação

### 4. **Serviço de Usuário**
- ✅ Método `create`: criptografa senha antes de salvar
- ✅ Método `update`: criptografa senha se fornecida na atualização

## 📁 Arquivos Modificados

### Novos Arquivos
1. `lib/crypto.ts` - Funções de criptografia e comparação de senha
2. `scripts/migrate-passwords.ts` - Script de migração para senhas existentes
3. `AUTHENTICATION_GUIDE.md` - Este guia

### Arquivos Modificados
1. `app/(dashboard)/usuarios/page.tsx` - Formulário com campos de senha
2. `lib/auth.ts` - Login com verificação bcrypt
3. `lib/service/usuario.service.ts` - Criptografia ao criar/atualizar usuários

## 🚀 Como Usar

### Criar Novo Usuário
1. Acesse a página de Gestão de Usuários
2. Clique em "Novo Usuário"
3. Preencha todos os campos, incluindo:
   - **Senha**: mínimo 6 caracteres
   - **Confirmar Senha**: deve ser idêntica à senha
4. Clique em "Criar Usuário"
5. A senha será automaticamente criptografada e salva no Firebase

### Editar Usuário Existente
1. Clique em "Editar" no usuário desejado
2. **Campos de senha são opcionais**
3. Para alterar a senha:
   - Preencha "Nova Senha"
   - Confirme em "Confirmar Nova Senha"
4. Para manter a senha atual:
   - Deixe os campos de senha em branco
5. Clique em "Salvar Alterações"

### Login
1. O sistema agora usa bcrypt para verificar senhas
2. Digite email e senha normalmente
3. A verificação é feita de forma segura

## 🔧 Migração de Senhas Existentes

Se você já tem usuários com senhas em texto plano no banco de dados:

### Passo 1: Backup
Faça backup do Firebase antes de executar qualquer migração!

### Passo 2: Configurar Variáveis de Ambiente
Certifique-se de que as variáveis do Firebase estejam configuradas em `.env.local`

### Passo 3: Executar Script de Migração
```bash
# Instalar ts-node se ainda não tiver
npm install -D ts-node

# Executar o script de migração
npx ts-node scripts/migrate-passwords.ts
```

### O que o Script Faz:
- ✅ Busca todos os usuários no Firebase
- ✅ Identifica senhas em texto plano (não começam com $2)
- ✅ Criptografa cada senha com bcrypt
- ✅ Atualiza o documento do usuário no Firebase
- ✅ Exibe relatório de migração

### Exemplo de Saída:
```
🔄 Iniciando migração de senhas...
📊 Total de usuários: 5
🔐 Criptografando senha do usuário: admin@example.com
✅ Senha migrada para: admin@example.com
...
📊 Resumo da migração:
   ✅ Migradas: 5
   ⏭️ Puladas: 0
   📝 Total: 5
✨ Migração concluída com sucesso!
```

## 🔒 Segurança

### Boas Práticas Implementadas
- ✅ Senhas nunca são armazenadas em texto plano
- ✅ Hash bcrypt com salt automático
- ✅ Validação de senha mínima (6 caracteres)
- ✅ Confirmação de senha obrigatória
- ✅ Senhas não aparecem nos logs

### Recomendações Adicionais
Para produção, considere:
- Aumentar requisitos de senha (8+ caracteres, letras maiúsculas, números, símbolos)
- Implementar rate limiting no login
- Adicionar autenticação de dois fatores (2FA)
- Implementar recuperação de senha por email
- Adicionar bloqueio de conta após tentativas falhadas

## 🧪 Testando

### Testar Criação de Usuário
1. Tente criar usuário sem senha → deve mostrar erro
2. Tente criar com senha < 6 caracteres → deve mostrar erro
3. Tente criar com senhas diferentes → deve mostrar erro "As senhas não coincidem"
4. Crie com senhas válidas e idênticas → deve funcionar

### Testar Login
1. Tente login com senha incorreta → deve falhar
2. Tente login com senha correta → deve autenticar
3. Verifique no Firebase que a senha está criptografada (começa com $2b$)

### Testar Edição
1. Edite usuário sem preencher senhas → senha atual mantida
2. Edite com nova senha válida → senha atualizada e criptografada
3. Tente editar com senhas não coincidentes → deve mostrar erro

## 📝 Notas Técnicas

### Estrutura do Hash bcrypt
```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
│  │  │ │                                                    │
│  │  │ └─ Hash (53 caracteres)
│  │  └─ Salt
│  └─ Número de rounds (10)
└─ Algoritmo bcrypt versão 2b
```

### Performance
- Hash de senha leva ~100-200ms (por design, para segurança)
- Login levemente mais lento, mas mais seguro
- Migração de senhas pode levar alguns minutos para muitos usuários

## ❓ Troubleshooting

### Erro: "bcryptjs not found"
```bash
npm install bcryptjs @types/bcryptjs
```

### Senhas não funcionam após migração
- Verifique se o script de migração foi executado
- Confirme que as senhas no Firebase começam com $2
- Limpe o cache do navegador e tente novamente

### Erro no login após mudanças
- Certifique-se de que a senha foi criptografada
- Para senhas antigas, execute o script de migração
- Para novos usuários, recrie com o formulário atualizado

## 🎯 Checklist de Implementação

- [x] Criar arquivo `lib/crypto.ts`
- [x] Atualizar `lib/auth.ts` com bcrypt
- [x] Atualizar `lib/service/usuario.service.ts`
- [x] Adicionar campos de senha no formulário
- [x] Implementar validações de senha
- [x] Criar script de migração
- [x] Testar criação de usuário
- [x] Testar login
- [x] Testar edição de usuário
- [ ] Executar migração de senhas existentes (quando aplicável)
- [ ] Atualizar documentação do projeto

## 🚀 Próximos Passos Recomendados

1. **Requisitos de Senha Mais Fortes**
   - Implementar validação regex para complexidade
   - Adicionar barra de força da senha

2. **Recuperação de Senha**
   - Implementar "Esqueci minha senha"
   - Enviar email com token de redefinição

3. **Gestão de Sessão**
   - Implementar refresh token
   - Timeout de sessão por inatividade

4. **Auditoria**
   - Log de tentativas de login
   - Histórico de alterações de senha

5. **Autenticação Avançada**
   - OAuth/Social login
   - Autenticação de dois fatores (2FA)
