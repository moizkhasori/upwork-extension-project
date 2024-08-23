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

            if(!("current_state" in message)){
                throw new Error("No Current State is provided to update_extension_state") 
            }

            // true/false
            const current_state = message.current_state; 

            if(current_state === true){
                chrome.storage.local.set({
                    extension_enabled: false

                })
            }else{

            }

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

            const db = await OpenIndexedDatabase();
            const transaction = db.transaction("topic_url_state_db_object_store", "readonly");
            const store = transaction.objectStore("topic_url_state_db_object_store");

            const request = store.get("topic_url_state")

            request.onsuccess = () => {
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

        if (!("topic" in message)) {
          throw new Error("Please provide a topic.");
        }
  
        const tabs = await chrome.tabs.query({active:true, currentWindow:true});
        
  
        if (!tabs[0] || !tabs[0].url) {
          throw new Error("Unable to retrieve the active tab or URL.");
        }

        const {id,topic, last_topic, current_url} = await getDataFromIndexedDb()

        await UpdateDataIndexedDb({id, new_topic: message.topic, current_url: tabs[0].url})

        const result = await getDataFromIndexedDb();
        sendResponse({success: true, result})
  

      } catch (error) {
        console.error("Error in background.ts - add_new_topic:", error);
        sendResponse({ success: false, error: error });
      }
    })();
  
    return true;
  }

});


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if(changeInfo.status === "complete" && tab.active && tab.url){
        console.log("hahaha");
        

        try {
            const { extension_enabled } = await chrome.storage.local.get("extension_enabled");

        const currentState = await getDataFromIndexedDb();
        // console.log(currentState,"current state - before updating");
        
        const isExtensionFirstTime = (currentState?.last_topic === undefined && currentState?.topic === undefined)
        // console.log(isExtensionFirstTime, "isExtensionFirstTime");
        

        if(extension_enabled && !isExtensionFirstTime){

            await UpdateUrlAndStateInDb(tab.url)
            const data = await getDataFromIndexedDb()
            // console.log(data, "current db state, bg auto tab funciton");
            
        }
        } catch (error) {
         console.log(error, "from background.ts auto update tabs, tabs listener");
            
        }

    }
})