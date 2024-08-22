import { getDataFromIndexedDb, OpenIndexedDatabase, shouldStoreUrl, UpdateDataIndexedDb, UpdateUrlAndStateInDb } from "../utils/indexedDb";

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Extension Installed Successfully - Upwork Extension");

    chrome.storage.local.set({
        extension_enabled: false
    })
    
  }
  
  else if (details.reason === "update") {
    console.log("Extension Updated Successfully - Upwork Extension");
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.task === "check_extension_state") {
    (async () => {
      try {
        const result = (await chrome.storage.local.get("extension_enabled")) as {extension_enabled: boolean};

        if(!("extension_enabled" in result)){
            throw new Error("Unable to find extension state - extension_enabled, does not exist")
        }

        sendResponse(result.extension_enabled);

      } catch (error) {
        console.log(error, "from background.ts - check_extension_state");
      }
    })();

    return true;
  }

  if(message.task === "update_extension_state") {
    (async() => {
        try {
            console.log(message, "from bg message print");
            
            if(!("current_state" in message)){
                throw new Error("No Current State is provided to update_extension_state") 
            }

            const current_state = message.current_state;
            const newState = !current_state;
            chrome.storage.local.set({
                extension_enabled: newState
            })
            sendResponse({success: true, newState: newState})

        } catch (error) {
            sendResponse({success: false})
         console.log(error, "from background.ts - update_extension_state", error);
        }
    })();

    return true;
  }

  if(message.task === "get_combo_box_topic"){

    (async () => {
        try {

            console.log("from function get_combo_box_topic background.ts");

            const db = await OpenIndexedDatabase();
            const transaction = db.transaction("topic_url_state_db_object_store", "readonly");
            const store = transaction.objectStore("topic_url_state_db_object_store");

            const request = store.get("topic_url_state")

            request.onsuccess = () => {
                console.log(request.result, "i am actual request get_combo_box_topic");
                
                sendResponse(request.result)
            }
            

        } catch (error) {
            sendResponse({success: false})
            console.log(error, "from background.ts - get_combo_box_topic", error);
        }
    })();

    return true;
  }

  if (message.task === "add_new_topic") {
    (async () => {
      try {
        console.log("from function add_new_topic background.ts");
  
        if (!("topic" in message)) {
          throw new Error("Please provide a topic.");
        }
  
        const tabs = await chrome.tabs.query({active:true, currentWindow:true});
        
  
        if (!tabs[0] || !tabs[0].url) {
          throw new Error("Unable to retrieve the active tab or URL.");
        }

        const {id,topic, last_topic, current_url} = await getDataFromIndexedDb()

        await UpdateDataIndexedDb({id, topic, new_topic: message.topic, current_url: tabs[0].url})

        const result = await getDataFromIndexedDb();
        sendResponse({success: true, result})
  

      } catch (error) {
        console.error("Error in background.ts - add_new_topic:", error);
        sendResponse({ success: false, error: error });
      }
    })();
  
    return true;
  }

  if(message.task === "test_message"){

    (async() => {
        const db = await OpenIndexedDatabase();
        const transaction = db.transaction("topic_url_state_db_object_store", "readonly");
            const store = transaction.objectStore("topic_url_state_db_object_store");
    
            const getRequest = store.get("topic_url_state");
    
            getRequest.onsuccess = () => {sendResponse(getRequest.result)};
    })();

    return true;
  }

  
});


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if(changeInfo.status === "complete" && tab.active && tab.url){

        const { extension_enabled } = await chrome.storage.local.get("extension_enabled");

        // if(extension_enabled && shouldStoreUrl(tab.url)){
        //     console.log("stroing in db", tab.url);
            
        // }

        if(extension_enabled){
            await UpdateUrlAndStateInDb(tab.url)
        }

    }
})