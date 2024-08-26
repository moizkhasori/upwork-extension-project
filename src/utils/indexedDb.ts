import { RatingType, StatusType } from "./types";

export const OpenIndexedDatabase = ():Promise<IDBDatabase> => {

    return new Promise((resolve,reject) => {

        const request = indexedDB.open("topic_url_state_db",1);

        request.onupgradeneeded = (event) => {

            const db = (event.target as IDBOpenDBRequest).result;

            if(!db.objectStoreNames.contains("topic_url_state_db_object_store")){
                const objectStore = db.createObjectStore("topic_url_state_db_object_store", {keyPath:"id"});

                objectStore.createIndex("topic", "topic", {unique:false})
                objectStore.createIndex("current_url", "current_url", {unique:false})
                objectStore.createIndex("last_topic", "last_topic", {unique:false})

                objectStore.put({id: "topic_url_state", topic: undefined, last_topic: undefined, current_url: undefined})
                // objectStore.put({id: "topic_url_state", topic: "!2", last_topic: "1221", current_url: "112"})
            }

        }

        request.onsuccess = () => {
            resolve(request.result)
        };
        request.onerror = () => {
            reject(request.error)
        }

    })
}

  // const handleCrud = async () => {
    //     const db = await handleOpenDb();
    //     const transaction = db.transaction("topicStore", "readwrite");
    //     const store = transaction.objectStore("topicStore");

    //     const data = {topic: "i am topic 1", url:"i am url 1"};
    //     const request = store.add(data);
    //     request.onsuccess = () => {
    //         console.log("data added successfully!", data);
            
    //     }
    //     request.onerror = () => {
    //         console.log("data not added, got error", request.error);
            
    //     }

    //     const request2 = store.getAll();
    //     request2.onsuccess = () => {
    //         console.log("data added successfully!", request2.result);
            
    //     }
    //     request2.onerror = () => {
    //         console.log("data not added, got error", request2.error);
            
    //     }

    // }

export async function UpdateUrlAndStateInDb(url:string) {
    const db = await OpenIndexedDatabase();

    return new Promise<void>((resolve, reject) => {

        const transaction = db.transaction("topic_url_state_db_object_store", "readwrite");
        const store = transaction.objectStore("topic_url_state_db_object_store");

        const getRequest = store.get("topic_url_state");

        getRequest.onsuccess = () => {

            const lastTopic = getRequest.result.last_topic;

            const putRequest = store.put({...getRequest.result, current_url:url, topic: lastTopic});

            putRequest.onsuccess = () => {
                resolve()
            }
    
            putRequest.onerror = () => {
                reject("put request error, UpdateUrlAndStateInDb")
            }
        }

        
    })
}

export function shouldStoreUrl(url: string): boolean {
    if (url === "chrome://newtab/" || url === "about:blank") {
      return false;
    }
  
    if (url.includes("google.com/search") || url.includes("google.com")) {
      return false;
    }
  
    //   add more filters here
  
    return true;
  }
  

export async function getDataFromIndexedDb():Promise<any>{

    const db = await OpenIndexedDatabase();

    return new Promise((resolve, reject) => {

        try {
            const transaction = db.transaction("topic_url_state_db_object_store", "readonly");
            const store = transaction.objectStore("topic_url_state_db_object_store");
    
            const getRequest = store.get("topic_url_state");
    
            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => reject(getRequest.error);

        } catch (error) {
            reject(error)
        }

    })

}


export async function UpdateDataIndexedDb({id, new_topic, current_url}:{id:string, new_topic:string, current_url:string}) {

    const db = await OpenIndexedDatabase();

    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("topic_url_state_db_object_store", "readwrite");
        const store = transaction.objectStore("topic_url_state_db_object_store");

        const putRequest = store.put({
            id,
            current_url,
            last_topic: new_topic,
            topic: new_topic
        });

        putRequest.onsuccess = () => {
            resolve()
        }

        putRequest.onerror = () => {
            reject()
        }

        
    })
}



export const OpenMilestone3Database = ():Promise<IDBDatabase> => {

    return new Promise((resolve,reject) => {

        const request = indexedDB.open("milestone3db",1);

        request.onupgradeneeded = (event) => {

            const db = (event.target as IDBOpenDBRequest).result;

            if(!db.objectStoreNames.contains("milestone3db_object_store")){
                const objectStore = db.createObjectStore("milestone3db_object_store", {keyPath:"url"});
            }
        }

        request.onsuccess = () => {
            resolve(request.result)
        };
        request.onerror = () => {
            reject(request.error)
        }

    })
}



export const addUrlDataIntoMilestone3Db = async ({current_url, last_topic, rating = 0, status="none"}:{current_url:string, last_topic:string, rating?:RatingType,status?:StatusType}): Promise<void> => {

    const db = await OpenMilestone3Database();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction('milestone3db_object_store', 'readwrite');
        const store = transaction.objectStore('milestone3db_object_store');

        const request = store.add({
            url: current_url,
            topic: last_topic,
            rating,
            status,
            visited_datetime : new Date().toISOString(),
        },)

        request.onsuccess = () => {
            resolve()
        }

        request.onerror = () => {
            reject(request.error)
        }

    })
}

export const getUrlDataFromMilestone3Db = async (url:string): Promise<any> => {

    const db = await OpenMilestone3Database();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction('milestone3db_object_store', 'readonly');
        const store = transaction.objectStore('milestone3db_object_store');

        const request = store.get(url)

        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result);
              } else {
                resolve({})
              }
        }

        request.onerror = () => {
            reject(request.error)
        }

    })
}

export const getAllDataFromMilestone3Db = async (): Promise<any[]> => {

    const db = await OpenMilestone3Database();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction('milestone3db_object_store', 'readonly');
        const store = transaction.objectStore('milestone3db_object_store');

        const request = store.getAll()

        request.onsuccess = () => {
            resolve(request.result);
        }

        request.onerror = () => {
            reject(request.error)
        }

    })
}


export const updateUrlDataInMilestone3Db = async ({current_url, rating, status, topic}:{current_url:string, rating?:RatingType,status?:StatusType, topic?:string}): Promise<void> => {

    const db = await OpenMilestone3Database();

    return new Promise(async (resolve, reject) => {

        const data = await getUrlDataFromMilestone3Db(current_url);

        if(!("url" in data)){
            reject("url not found!")
        }

        const transaction = db.transaction('milestone3db_object_store', 'readwrite');
        const store = transaction.objectStore('milestone3db_object_store');

        if(status){
            data.status = status;
        }

        
        if(rating){
            data.rating = rating;
        }

        if(topic){
            data.topic = topic;
        }

        const request = store.put({
            ...data,
            visited_datetime: new Date().toISOString()
        }) 

        request.onsuccess = () => {
            resolve()
        }

        request.onerror = () => {
            reject(request.error)
        }

    })
}