import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  addDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Aula, ServiceResponse } from '../types';
import { fromFirestore } from '../utils/fromFirestore';

const AULAS_COLLECTION = 'aulas';

export const aulaService = {
  /**
   * Cria uma nova aula.
   */
  create: async (
    aulaData: Omit<Aula, 'id'>
  ): Promise<ServiceResponse & { aulaId?: string }> => {
    try {
      const aulasCollectionRef = collection(
        db,
        AULAS_COLLECTION
      ) as CollectionReference;

      const newDocRef = await addDoc(aulasCollectionRef, {
        ...aulaData,
      });

      return {
        codRet: 0,
        msgRet: 'Aula criada com sucesso!',
        aulaId: newDocRef.id,
      };
    } catch (error: any) {
      return {
        codRet: 1,
        msgRet:
          error.message || 'Ocorreu um erro desconhecido ao criar a aula.',
      };
    }
  },

  /**
   * Retorna todas as aulas.
   */
  getAll: async (): Promise<Aula[]> => {
    const q = query(collection(db, AULAS_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => fromFirestore<Aula>(doc));
  },

  /**
   * Busca uma aula pelo seu ID.
   */
  getById: async (id: string): Promise<Aula | null> => {
    if (!id) return null;
    const docRef = doc(db, AULAS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? fromFirestore<Aula>(docSnap) : null;
  },

  /**
   * Busca aulas por professor.
   */
  getByProfessor: async (professorId: string): Promise<Aula[]> => {
    try {
      if (!professorId) {
        console.error('❌ ID do professor não fornecido');
        return [];
      }

      const q = query(collection(db, AULAS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      // Filtrar aulas que contenham o professor no array de professores
      return querySnapshot.docs
        .map((doc) => fromFirestore<Aula>(doc))
        .filter((aula) => 
          aula.professores.some((p) => p.id === professorId)
        );
    } catch (error: any) {
      console.error('❌ Erro ao buscar aulas por professor:', error);
      throw error;
    }
  },

  /**
   * Busca aulas por sala.
   */
  getBySala: async (salaId: string): Promise<Aula[]> => {
    try {
      if (!salaId) {
        console.error('❌ ID da sala não fornecido');
        return [];
      }

      const q = query(
        collection(db, AULAS_COLLECTION),
        where('salaId', '==', salaId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => fromFirestore<Aula>(doc));
    } catch (error: any) {
      console.error('❌ Erro ao buscar aulas por sala:', error);
      throw error;
    }
  },

  /**
   * Atualiza os dados de uma aula.
   */
  update: async (
    id: string,
    aulaData: Partial<Omit<Aula, 'id'>>
  ): Promise<ServiceResponse> => {
    if (!id) return { codRet: 1, msgRet: 'ID da aula não fornecido.' };
    const docRef = doc(db, AULAS_COLLECTION, id);
    try {
      await updateDoc(docRef, {
        ...aulaData,
      });
      return { codRet: 0, msgRet: 'Aula atualizada com sucesso.' };
    } catch (error: any) {
      return {
        codRet: 1,
        msgRet: `Erro ao atualizar aula: ${error.message}`,
      };
    }
  },

  /**
   * Deleta uma aula.
   */
  delete: async (id: string): Promise<ServiceResponse> => {
    if (!id) return { codRet: 1, msgRet: 'ID da aula não fornecido.' };
    const docRef = doc(db, AULAS_COLLECTION, id);
    try {
      await deleteDoc(docRef);
      return { codRet: 0, msgRet: 'Aula deletada com sucesso.' };
    } catch (error: any) {
      return { codRet: 1, msgRet: `Erro ao deletar aula: ${error.message}` };
    }
  },
};
