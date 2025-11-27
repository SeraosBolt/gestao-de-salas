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
import { db } from '../firebase';
import { Sala, ServiceResponse } from '../types';
import { fromFirestore } from '../utils/fromFirestore';

const SALAS_COLLECTION = 'salas';

export const salaService = {
  /**
   * Cria uma nova sala, garantindo que o nome seja único.
   */
  create: async (
    salaData: Omit<Sala, 'id'>
  ): Promise<ServiceResponse & { salaId?: string }> => {
    try {
      const newSalaId = await runTransaction(db, async (transaction) => {
        const salasCollectionRef = collection(
          db,
          SALAS_COLLECTION
        ) as CollectionReference<Sala>;

        // Verifica se o nome já existe
        const q = query(
          salasCollectionRef,
          where('nome', '==', salaData.nome)
        );
        const existingSalaSnapshot = await getDocs(q);

        if (!existingSalaSnapshot.empty) {
          throw new Error('Uma sala com este nome já existe.');
        }

        const newDocRef = doc(salasCollectionRef);
        transaction.set(newDocRef, salaData);
        return newDocRef.id;
      });

      return {
        codRet: 0,
        msgRet: 'Sala criada com sucesso!',
        salaId: newSalaId,
      };
    } catch (error: any) {
      return {
        codRet: 1,
        msgRet:
          error.message || 'Ocorreu um erro desconhecido ao criar a sala.',
      };
    }
  },

  /**
   * Retorna todas as salas.
   */
  getAll: async (): Promise<Sala[]> => {
    try {
      const q = query(collection(db, SALAS_COLLECTION));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => fromFirestore<Sala>(doc));
    } catch (error: any) {
      console.error('❌ Erro ao buscar salas:', error);
      throw error;
    }
  },

  /**
   * Busca uma sala pelo seu ID.
   */
  getById: async (id: string): Promise<Sala | null> => {
    try {
      if (!id) return null;
      const docRef = doc(db, SALAS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? fromFirestore<Sala>(docSnap) : null;
    } catch (error: any) {
      console.error('❌ Erro ao buscar sala por ID:', error);
      throw error;
    }
  },

  /**
   * Busca uma sala pelo nome.
   */
  getByNome: async (nome: string): Promise<Sala | null> => {
    try {
      if (!nome) {
        console.error('❌ Nome não fornecido');
        return null;
      }

      console.log(`🔍 Buscando sala por nome: ${nome}`);
      
      const q = query(
        collection(db, SALAS_COLLECTION),
        where('nome', '==', nome)
      );

      const querySnapshot = await getDocs(q);
      
      console.log(`📊 Resultados encontrados: ${querySnapshot.docs.length}`);
      
      if (querySnapshot.empty) {
        console.warn(`⚠️ Nenhuma sala encontrada com o nome: ${nome}`);
        return null;
      }
      
      const sala = fromFirestore<Sala>(querySnapshot.docs[0]);
      console.log(`✅ Sala encontrada: ${sala.nome}`);
      
      return sala;
    } catch (error: any) {
      console.error('❌ Erro ao buscar sala por nome:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  },

  /**
   * Atualiza os dados de uma sala.
   */
  update: async (
    id: string,
    salaData: Partial<Omit<Sala, 'id'>>
  ): Promise<ServiceResponse> => {
    try {
      if (!id) return { codRet: 1, msgRet: 'ID da sala não fornecido.' };
      
      const docRef = doc(db, SALAS_COLLECTION, id);
      
      // Se estiver atualizando o nome, verificar se já existe
      if (salaData.nome) {
        const q = query(
          collection(db, SALAS_COLLECTION),
          where('nome', '==', salaData.nome)
        );
        const existingSala = await getDocs(q);
        
        // Verifica se existe outra sala com o mesmo nome (ignorando a sala atual)
        if (!existingSala.empty && existingSala.docs[0].id !== id) {
          return { codRet: 1, msgRet: 'Uma sala com este nome já existe.' };
        }
      }
      
      await updateDoc(docRef, salaData);
      return { codRet: 0, msgRet: 'Sala atualizada com sucesso.' };
    } catch (error: any) {
      console.error('❌ Erro ao atualizar sala:', error);
      return {
        codRet: 1,
        msgRet: `Erro ao atualizar sala: ${error.message}`,
      };
    }
  },

  /**
   * Deleta uma sala.
   */
  delete: async (id: string): Promise<ServiceResponse> => {
    try {
      if (!id) return { codRet: 1, msgRet: 'ID da sala não fornecido.' };
      const docRef = doc(db, SALAS_COLLECTION, id);
      await deleteDoc(docRef);
      return { codRet: 0, msgRet: 'Sala deletada com sucesso.' };
    } catch (error: any) {
      console.error('❌ Erro ao deletar sala:', error);
      return { codRet: 1, msgRet: `Erro ao deletar sala: ${error.message}` };
    }
  },
};
