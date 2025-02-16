// utils/indexedDB.ts
export const openDB = (dbName: string, storeName: string, version = 1) => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
  
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      };
  
      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
  
      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  };
  
  export const saveToDB = (db: IDBDatabase, storeName: string, data: { id: string; value: any }) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
  
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  };
  
  export const getFromDB = (db: IDBDatabase, storeName: string, id: string) => {
    return new Promise<any>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
  
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  };