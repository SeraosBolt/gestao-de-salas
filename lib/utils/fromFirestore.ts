import { DocumentData, DocumentSnapshot } from 'firebase/firestore';

export function fromFirestore<T>(doc: DocumentSnapshot<DocumentData>): T {
  const data = doc.data() as T;
  return {
    ...data,
    id: doc.id,
  };
}
