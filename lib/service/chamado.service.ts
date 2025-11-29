import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  addDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Chamado, ServiceResponse } from '../types';
import { fromFirestore } from '../utils/fromFirestore';

const CHAMADOS_COLLECTION = 'chamados';

export const chamadoService = {
  /**
   * Cria um novo chamado.
   */
  create: async (
    chamadoData: Omit<Chamado, 'id'>
  ): Promise<ServiceResponse & { chamadoId?: string }> => {
    try {
      const chamadosCollectionRef = collection(
        db,
        CHAMADOS_COLLECTION
      ) as CollectionReference;

      const newDocRef = await addDoc(chamadosCollectionRef, {
        ...chamadoData,
      });

      return {
        codRet: 0,
        msgRet: 'Chamado criado com sucesso!',
        chamadoId: newDocRef.id,
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
    const q = query(collection(db, CHAMADOS_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => fromFirestore<Chamado>(doc));
  },

  /**
   * Busca um chamado pelo seu ID.
   */
  getById: async (id: string): Promise<Chamado | null> => {
    if (!id) return null;
    const docRef = doc(db, CHAMADOS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? fromFirestore<Chamado>(docSnap) : null;
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

      const q = query(
        collection(db, CHAMADOS_COLLECTION),
        where('solicitanteId', '==', solicitanteId)
      );

      const querySnapshot = await getDocs(q);
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

      const q = query(
        collection(db, CHAMADOS_COLLECTION),
        where('responsavelId', '==', responsavelId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => fromFirestore<Chamado>(doc));
    } catch (error: any) {
      console.error('❌ Erro ao buscar chamados por responsável:', error);
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
    if (!id) return { codRet: 1, msgRet: 'ID do chamado não fornecido.' };
    const docRef = doc(db, CHAMADOS_COLLECTION, id);
    try {
      await updateDoc(docRef, {
        ...chamadoData,
      });
      return { codRet: 0, msgRet: 'Chamado atualizado com sucesso.' };
    } catch (error: any) {
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
    if (!id) return { codRet: 1, msgRet: 'ID do chamado não fornecido.' };
    const docRef = doc(db, CHAMADOS_COLLECTION, id);
    try {
      await deleteDoc(docRef);
      return { codRet: 0, msgRet: 'Chamado deletado com sucesso.' };
    } catch (error: any) {
      return { codRet: 1, msgRet: `Erro ao deletar chamado: ${error.message}` };
    }
  },
};
