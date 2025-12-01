/**
 * Script de migração para criptografar senhas existentes no Firebase
 * 
 * Este script deve ser executado UMA VEZ para converter senhas em texto plano
 * para senhas criptografadas com bcrypt.
 * 
 * IMPORTANTE: Faça backup do banco de dados antes de executar!
 * 
 * Para executar:
 * npx ts-node scripts/migrate-passwords.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

// Configure o Firebase (copie do seu arquivo firebase.ts)
const firebaseConfig = {
  // Cole suas configurações do Firebase aqui
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

async function migratePasswords() {
  try {
    console.log('🔄 Iniciando migração de senhas...');
    
    const usersRef = collection(db, 'usuarios');
    const snapshot = await getDocs(usersRef);
    
    console.log(`📊 Total de usuários: ${snapshot.docs.length}`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const userData = docSnapshot.data();
      const userId = docSnapshot.id;
      
      // Verifica se a senha já está criptografada (bcrypt hash começa com $2a$, $2b$ ou $2y$)
      if (userData.senha && !userData.senha.startsWith('$2')) {
        console.log(`🔐 Criptografando senha do usuário: ${userData.email}`);
        
        const hashedPassword = await hashPassword(userData.senha);
        
        await updateDoc(doc(db, 'usuarios', userId), {
          senha: hashedPassword,
        });
        
        migrated++;
        console.log(`✅ Senha migrada para: ${userData.email}`);
      } else {
        skipped++;
        console.log(`⏭️ Senha já criptografada ou ausente: ${userData.email}`);
      }
    }
    
    console.log('\n📊 Resumo da migração:');
    console.log(`   ✅ Migradas: ${migrated}`);
    console.log(`   ⏭️ Puladas: ${skipped}`);
    console.log(`   📝 Total: ${snapshot.docs.length}`);
    console.log('\n✨ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

// Executar migração
migratePasswords()
  .then(() => {
    console.log('🎉 Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na migração:', error);
    process.exit(1);
  });
