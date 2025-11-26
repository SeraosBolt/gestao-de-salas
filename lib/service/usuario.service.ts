import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase'; // ajuste o caminho
import { Usuario, ServiceResponse } from '../types'; // ajuste o caminho
import { fromFirestore } from '../utils/fromFirestore'; // ajuste o caminho

const USUARIOS_COLLECTION = 'usuarios';

export const usuarioService = {
  /**
   * Cria um novo usuário, garantindo que o e-mail seja único.
   */
  create: async (
    userData: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ServiceResponse & { usuarioId?: string }> => {
    try {
      const newUserId = await runTransaction(db, async (transaction) => {
        const usersCollectionRef = collection(
          db,
          USUARIOS_COLLECTION
        ) as CollectionReference<Usuario>;

        // Verifica se o email já existe
        const q = query(
          usersCollectionRef,
          where('email', '==', userData.email)
        );
        const existingUserSnapshot = await getDocs(q);

        if (!existingUserSnapshot.empty) {
          throw new Error('Um usuário com este e-mail já existe.');
        }

        const newDocRef = doc(usersCollectionRef);
        const newUserData: Omit<Usuario, 'id'> = {
          ...userData,
          created_at: Timestamp.now(),
        };
        transaction.set(newDocRef, newUserData);
        return newDocRef.id;
      });

      return {
        codRet: 0,
        msgRet: 'Usuário criado com sucesso!',
        usuarioId: newUserId,
      };
    } catch (error: any) {
      return {
        codRet: 1,
        msgRet:
          error.message || 'Ocorreu um erro desconhecido ao criar o usuário.',
      };
    }
  },

  /**
   * Retorna todos os usuários.
   */
  getAll: async (): Promise<Usuario[]> => {
    const q = query(collection(db, USUARIOS_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => fromFirestore<Usuario>(doc));
  },

  /**
   * Busca um usuário pelo seu ID.
   */
  getById: async (id: string): Promise<Usuario | null> => {
    if (!id) return null;
    const docRef = doc(db, USUARIOS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? fromFirestore<Usuario>(docSnap) : null;
  },

  getByEmail: async (email: string): Promise<Usuario | null> => {
    try {
      if (!email) {
        console.error('❌ Email não fornecido');
        return null;
      }

      console.log(`🔍 Buscando usuário por email: ${email}`);
      
      const q = query(
        collection(db, USUARIOS_COLLECTION),
        where('email', '==', email)
      );

      const querySnapshot = await getDocs(q);
      
      console.log(`📊 Resultados encontrados: ${querySnapshot.docs.length}`);
      
      if (querySnapshot.empty) {
        console.warn(`⚠️ Nenhum usuário encontrado com o email: ${email}`);
        return null;
      }
      
      const usuario = fromFirestore<Usuario>(querySnapshot.docs[0]);
      console.log(`✅ Usuário encontrado: ${usuario.nome}`);
      
      return usuario;
    } catch (error: any) {
      console.error('❌ Erro ao buscar usuário por email:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  },
  /**
   * Atualiza os dados de um usuário.
   */
  update: async (
    id: string,
    userData: Partial<Omit<Usuario, 'id' | 'created_at'>>
  ): Promise<ServiceResponse> => {
    if (!id) return { codRet: 1, msgRet: 'ID do usuário não fornecido.' };
    const docRef = doc(db, USUARIOS_COLLECTION, id);
    try {
      await updateDoc(docRef, {
        ...userData,
        updated_at: Timestamp.now(),
      });
      return { codRet: 0, msgRet: 'Usuário atualizado com sucesso.' };
    } catch (error: any) {
      return {
        codRet: 1,
        msgRet: `Erro ao atualizar usuário: ${error.message}`,
      };
    }
  },

  /**
   * Deleta um usuário.
   */
  delete: async (id: string): Promise<ServiceResponse> => {
    if (!id) return { codRet: 1, msgRet: 'ID do usuário não fornecido.' };
    const docRef = doc(db, USUARIOS_COLLECTION, id);
    try {
      await deleteDoc(docRef);
      return { codRet: 0, msgRet: 'Usuário deletado com sucesso.' };
    } catch (error: any) {
      return { codRet: 1, msgRet: `Erro ao deletar usuário: ${error.message}` };
    }
  },
};
