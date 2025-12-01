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
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Chamado, ServiceResponse } from '../types';
import { fromFirestore } from '../utils/fromFirestore';

const CHAMADOS_COLLECTION = 'chamados';

export const suporteService = {
  /**
   * Cria um novo chamado.
   */
  create: async (
    chamadoData: Omit<Chamado, 'id'>
  ): Promise<ServiceResponse & { chamadoId?: string }> => {
    try {
      const newChamadoId = await runTransaction(db, async (transaction) => {
        const chamadosCollectionRef = collection(
          db,
          CHAMADOS_COLLECTION
        ) as CollectionReference<Chamado>;

        const newDocRef = doc(chamadosCollectionRef);
        transaction.set(newDocRef, chamadoData);
        return newDocRef.id;
      });

      return {
        codRet: 0,
        msgRet: 'Chamado criado com sucesso!',
        chamadoId: newChamadoId,
      };
    } catch (error: any) {
      return {
        codRet: 1,
        msgRet:
          error.message || 'Ocorreu um erro desconhecido ao criar o chamado.',
      };
    }
  },

  /**
   * Retorna todos os chamados.
   */
  getAll: async (): Promise<Chamado[]> => {
    try {
      const q = query(
        collection(db, CHAMADOS_COLLECTION),
        orderBy('dataAbertura', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => fromFirestore<Chamado>(doc));
    } catch (error: any) {
      console.error('❌ Erro ao buscar chamados:', error);
      throw error;
    }
  },

  /**
   * Busca um chamado pelo seu ID.
   */
  getById: async (id: string): Promise<Chamado | null> => {
    try {
      if (!id) return null;
      const docRef = doc(db, CHAMADOS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? fromFirestore<Chamado>(docSnap) : null;
    } catch (error: any) {
      console.error('❌ Erro ao buscar chamado por ID:', error);
      throw error;
    }
  },

  /**
   * Busca chamados por solicitante.
   */
  getBySolicitante: async (solicitanteId: string): Promise<Chamado[]> => {
    try {
      if (!solicitanteId) {
        console.error('❌ ID do solicitante não fornecido');
        return [];
      }

      console.log(`🔍 Buscando chamados do solicitante: ${solicitanteId}`);
      
      const q = query(
        collection(db, CHAMADOS_COLLECTION),
        where('solicitanteId', '==', solicitanteId),
        orderBy('dataAbertura', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      console.log(`📊 Chamados encontrados: ${querySnapshot.docs.length}`);
      
      return querySnapshot.docs.map((doc) => fromFirestore<Chamado>(doc));
    } catch (error: any) {
      console.error('❌ Erro ao buscar chamados por solicitante:', error);
      throw error;
    }
  },

  /**
   * Busca chamados por responsável.
   */
  getByResponsavel: async (responsavelId: string): Promise<Chamado[]> => {
    try {
      if (!responsavelId) {
        console.error('❌ ID do responsável não fornecido');
        return [];
      }

      console.log(`🔍 Buscando chamados do responsável: ${responsavelId}`);
      
      const q = query(
        collection(db, CHAMADOS_COLLECTION),
        where('responsavelId', '==', responsavelId),
        orderBy('dataAbertura', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      console.log(`📊 Chamados encontrados: ${querySnapshot.docs.length}`);
      
      return querySnapshot.docs.map((doc) => fromFirestore<Chamado>(doc));
    } catch (error: any) {
      console.error('❌ Erro ao buscar chamados por responsável:', error);
      throw error;
    }
  },

  /**
   * Busca chamados não atribuídos.
   */
  getNaoAtribuidos: async (): Promise<Chamado[]> => {
    try {
      console.log('🔍 Buscando chamados não atribuídos');
      
      const q = query(
        collection(db, CHAMADOS_COLLECTION),
        where('responsavelId', '==', null),
        orderBy('dataAbertura', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      console.log(`📊 Chamados não atribuídos encontrados: ${querySnapshot.docs.length}`);
      
      return querySnapshot.docs.map((doc) => fromFirestore<Chamado>(doc));
    } catch (error: any) {
      console.error('❌ Erro ao buscar chamados não atribuídos:', error);
      throw error;
    }
  },

  /**
   * Atualiza os dados de um chamado.
   */
  update: async (
    id: string,
    chamadoData: Partial<Omit<Chamado, 'id'>>
  ): Promise<ServiceResponse> => {
    try {
      if (!id) return { codRet: 1, msgRet: 'ID do chamado não fornecido.' };
      
      const docRef = doc(db, CHAMADOS_COLLECTION, id);
      
      await updateDoc(docRef, chamadoData);
      return { codRet: 0, msgRet: 'Chamado atualizado com sucesso.' };
    } catch (error: any) {
      console.error('❌ Erro ao atualizar chamado:', error);
      return {
        codRet: 1,
        msgRet: `Erro ao atualizar chamado: ${error.message}`,
      };
    }
  },

  /**
   * Deleta um chamado.
   */
  delete: async (id: string): Promise<ServiceResponse> => {
    try {
      if (!id) return { codRet: 1, msgRet: 'ID do chamado não fornecido.' };
      const docRef = doc(db, CHAMADOS_COLLECTION, id);
      await deleteDoc(docRef);
      return { codRet: 0, msgRet: 'Chamado deletado com sucesso.' };
    } catch (error: any) {
      console.error('❌ Erro ao deletar chamado:', error);
      return { codRet: 1, msgRet: `Erro ao deletar chamado: ${error.message}` };
    }
  },
};
