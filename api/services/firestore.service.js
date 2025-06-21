const { Firestore } = require('@google-cloud/firestore');
const { prepareForFirestore } = require('../utils/firestore-utils');
const { COLLECTIONS } = require('../config/constants');

// Initialize Firestore with ADC
const firestore = global.firestore || new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID,
});

// Base service class with common CRUD operations
class BaseFirestoreService {
  constructor(collectionName) {
    this.collection = firestore.collection(collectionName);
  }

  async create(data) {
    // Clean data before sending to Firestore
    const cleanedData = prepareForFirestore({
      ...data,
      createdAt: Firestore.Timestamp.now(),
      updatedAt: Firestore.Timestamp.now()
    });
    
    const docRef = await this.collection.add(cleanedData);
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
    // Clean data before sending to Firestore
    const cleanedData = prepareForFirestore({
      ...data,
      updatedAt: Firestore.Timestamp.now()
    });
    
    await this.collection.doc(id).update(cleanedData);
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
const extractionMetadataService = new BaseFirestoreService(COLLECTIONS.EXTRACTION_METADATA);

module.exports = {
  BaseFirestoreService,
  vendorService,
  extractionService,
  reconciliationService,
  rulesService,
  statusService,
  extractionMetadataService,
  COLLECTIONS
};