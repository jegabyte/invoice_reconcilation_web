import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    limit,
    startAfter,
    onSnapshot,
    QueryConstraint,
    DocumentData,
    WriteBatch,
    writeBatch,
    serverTimestamp,
    increment,
    DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export const COLLECTIONS = {
    INVOICES: 'invoices',
    VENDORS: 'vendors',
    LINE_ITEMS: 'line_items',
    VALIDATION_RULES: 'validation_rules',
    USERS: 'users',
} as const;

export class FirestoreService {
    // ==========================================
    // GENERIC CRUD OPERATIONS
    // ==========================================

    /**
     * Create a new document
     */
    static async create<T extends DocumentData>(
        collectionName: string,
        data: T,
        id?: string
    ): Promise<string> {
        try {
            const collectionRef = collection(db, collectionName);
            const docRef = id ? doc(collectionRef, id) : doc(collectionRef);

            await setDoc(docRef, {
                ...data,
                createdAt: serverTimestamp(),
                lastModified: serverTimestamp()
            });

            return docRef.id;
        } catch (error) {
            console.error(`Error creating document in ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Update an existing document
     */
    static async update<T extends DocumentData>(
        collectionName: string,
        id: string,
        data: Partial<T>
    ): Promise<void> {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, {
                ...data,
                lastModified: serverTimestamp()
            });
        } catch (error) {
            console.error(`Error updating document ${id} in ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Delete a document
     */
    static async delete(collectionName: string, id: string): Promise<void> {
        try {
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error(`Error deleting document ${id} from ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Get a single document by ID
     */
    static async get<T>(collectionName: string, id: string): Promise<T | null> {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as T;
            }
            return null;
        } catch (error) {
            console.error(`Error getting document ${id} from ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Get multiple documents with query constraints
     */
    static async list<T>(
        collectionName: string,
        constraints: QueryConstraint[]
    ): Promise<T[]> {
        try {
            const q = query(collection(db, collectionName), ...constraints);
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[];
        } catch (error) {
            console.error(`Error listing documents from ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Subscribe to real-time updates
     */
    static subscribe<T>(
        collectionName: string,
        constraints: QueryConstraint[],
        callback: (data: T[]) => void,
        errorCallback?: (error: Error) => void
    ): () => void {
        const q = query(collection(db, collectionName), ...constraints);

        return onSnapshot(
            q,
            (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as T[];
                callback(data);
            },
            (error) => {
                console.error(`Error in subscription to ${collectionName}:`, error);
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    /**
     * Subscribe to a single document
     */
    static subscribeToDoc<T>(
        collectionName: string,
        docId: string,
        callback: (data: T | null) => void,
        errorCallback?: (error: Error) => void
    ): () => void {
        const docRef = doc(db, collectionName, docId);

        return onSnapshot(
            docRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    callback({ id: docSnapshot.id, ...docSnapshot.data() } as T);
                } else {
                    callback(null);
                }
            },
            (error) => {
                console.error(`Error in subscription to document ${docId}:`, error);
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    // ==========================================
    // BATCH OPERATIONS
    // ==========================================

    /**
     * Batch create multiple documents
     */
    static async batchCreate<T extends DocumentData>(
        collectionName: string,
        items: T[]
    ): Promise<void> {
        try {
            const batch = writeBatch(db);

            items.forEach(item => {
                const docRef = doc(collection(db, collectionName));
                batch.set(docRef, {
                    ...item,
                    createdAt: serverTimestamp(),
                    lastModified: serverTimestamp()
                });
            });

            await batch.commit();
        } catch (error) {
            console.error(`Error batch creating documents in ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Batch update multiple documents
     */
    static async batchUpdate<T extends DocumentData>(
        collectionName: string,
        updates: Array<{ id: string; data: Partial<T> }>
    ): Promise<void> {
        try {
            const batch = writeBatch(db);

            updates.forEach(({ id, data }) => {
                const docRef = doc(db, collectionName, id);
                batch.update(docRef, {
                    ...data,
                    lastModified: serverTimestamp()
                });
            });

            await batch.commit();
        } catch (error) {
            console.error(`Error batch updating documents in ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Batch delete multiple documents
     */
    static async batchDelete(
        collectionName: string,
        ids: string[]
    ): Promise<void> {
        try {
            const batch = writeBatch(db);

            ids.forEach(id => {
                const docRef = doc(db, collectionName, id);
                batch.delete(docRef);
            });

            await batch.commit();
        } catch (error) {
            console.error(`Error batch deleting documents from ${collectionName}:`, error);
            throw error;
        }
    }

    // ==========================================
    // ATOMIC OPERATIONS
    // ==========================================

    /**
     * Increment a numeric field atomically
     */
    static async incrementField(
        collectionName: string,
        id: string,
        field: string,
        value: number
    ): Promise<void> {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, {
                [field]: increment(value),
                lastModified: serverTimestamp()
            });
        } catch (error) {
            console.error(`Error incrementing field ${field} in document ${id}:`, error);
            throw error;
        }
    }

    /**
     * Increment multiple fields atomically
     */
    static async incrementMultipleFields(
        collectionName: string,
        id: string,
        increments: { [field: string]: number }
    ): Promise<void> {
        try {
            const docRef = doc(db, collectionName, id);
            const updateData: any = {
                lastModified: serverTimestamp()
            };

            Object.entries(increments).forEach(([field, value]) => {
                updateData[field] = increment(value);
            });

            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error(`Error incrementing multiple fields in document ${id}:`, error);
            throw error;
        }
    }

    // ==========================================
    // PAGINATION HELPERS
    // ==========================================

    /**
     * Get paginated results
     */
    static async paginate<T>(
        collectionName: string,
        constraints: QueryConstraint[],
        pageSize: number,
        lastDoc?: DocumentSnapshot
    ): Promise<{
        data: T[];
        lastDoc: DocumentSnapshot | null;
        hasMore: boolean;
    }> {
        try {
            const baseConstraints = [...constraints, limit(pageSize + 1)];

            if (lastDoc) {
                baseConstraints.push(startAfter(lastDoc));
            }

            const q = query(collection(db, collectionName), ...baseConstraints);
            const querySnapshot = await getDocs(q);

            const docs = querySnapshot.docs;
            const hasMore = docs.length > pageSize;
            const data = docs.slice(0, pageSize).map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[];

            return {
                data,
                lastDoc: docs[pageSize - 1] || null,
                hasMore
            };
        } catch (error) {
            console.error(`Error paginating documents from ${collectionName}:`, error);
            throw error;
        }
    }

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    /**
     * Check if document exists
     */
    static async exists(collectionName: string, id: string): Promise<boolean> {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            return docSnap.exists();
        } catch (error) {
            console.error(`Error checking if document ${id} exists:`, error);
            throw error;
        }
    }

    /**
     * Get document count with constraints
     */
    static async count(
        collectionName: string,
        constraints: QueryConstraint[]
    ): Promise<number> {
        try {
            const q = query(collection(db, collectionName), ...constraints);
            const querySnapshot = await getDocs(q);
            return querySnapshot.size;
        } catch (error) {
            console.error(`Error counting documents in ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Create a batch instance for complex operations
     */
    static createBatch(): WriteBatch {
        return writeBatch(db);
    }
}
