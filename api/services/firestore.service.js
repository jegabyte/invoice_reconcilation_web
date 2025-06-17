const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore with ADC
const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

// Collection names
const COLLECTIONS = {
  VENDORS: 'vendorConfigurations',
  EXTRACTIONS: 'extractionResults',
  RECONCILIATIONS: 'invoiceReconciliationSummaries',
  RULES: 'reconciliationRules',
  STATUS: 'reconciliationStatus'
};

// Base service class with common CRUD operations
class BaseFirestoreService {
  constructor(collectionName) {
    this.collection = firestore.collection(collectionName);
  }

  async create(data) {
    const docRef = await this.collection.add({
      ...data,
      createdAt: Firestore.Timestamp.now(),
      updatedAt: Firestore.Timestamp.now()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }

  async getAll(filters = {}) {
    let query = this.collection;
    
    // Apply filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null) {
        query = query.where(field, '==', value);
      }
    });
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async update(id, data) {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: Firestore.Timestamp.now()
    });
    return this.getById(id);
  }

  async delete(id) {
    await this.collection.doc(id).delete();
  }

  // Convert Firestore Timestamps to ISO strings for API responses
  static convertTimestamps(data) {
    if (!data) return data;
    
    const converted = { ...data };
    Object.keys(converted).forEach(key => {
      if (converted[key] && converted[key]._seconds !== undefined) {
        converted[key] = new Date(converted[key]._seconds * 1000).toISOString();
      } else if (converted[key] && typeof converted[key] === 'object') {
        converted[key] = BaseFirestoreService.convertTimestamps(converted[key]);
      }
    });
    return converted;
  }
}

// Service instances
const vendorService = new BaseFirestoreService(COLLECTIONS.VENDORS);
const extractionService = new BaseFirestoreService(COLLECTIONS.EXTRACTIONS);
const reconciliationService = new BaseFirestoreService(COLLECTIONS.RECONCILIATIONS);
const rulesService = new BaseFirestoreService(COLLECTIONS.RULES);
const statusService = new BaseFirestoreService(COLLECTIONS.STATUS);

module.exports = {
  BaseFirestoreService,
  vendorService,
  extractionService,
  reconciliationService,
  rulesService,
  statusService,
  COLLECTIONS
};