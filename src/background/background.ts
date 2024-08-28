import { addUrlDataIntoMilestone3Db, getAllDataFromMilestone3Db, getDataFromIndexedDb, getUrlDataFromMilestone3Db, OpenIndexedDatabase, shouldStoreUrl, UpdateDataIndexedDb, UpdateUrlAndStateInDb, updateUrlDataInMilestone3Db } from "../utils/indexedDb";
import { findNextMatch, findPreviousMatch } from "../utils/utils";

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Extension Installed Successfully - Upwork Extension");

    chrome.storage.local.set({
        extension_enabled: false,
        initialSearchIndexNext: -1,
        initialSearchIndexPrevious: 0
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

        const urlExists = await getUrlDataFromMilestone3Db(tabs[0].url);
        
        if(!urlExists || Object.keys(urlExists).length === 0){
          await addUrlDataIntoMilestone3Db({current_url: tabs[0].url, last_topic:message.topic})
          
        }else{
          await updateUrlDataInMilestone3Db({current_url: tabs[0].url, topic: message.topic})
          
        }

        const result = await getDataFromIndexedDb();
        sendResponse({success: true, result})
  

      } catch (error) {
        console.error("Error in background.ts - add_new_topic:", error);
        sendResponse({ success: false, error: error });
      }
    })();
  
    return true;
  }

  if(message.task === "check_current_url"){
    (async () => {

      try {
        const activeTabArray = await chrome.tabs.query({active:true, currentWindow:true});
        const activeTab = activeTabArray[0];

        const checkInDb = await getUrlDataFromMilestone3Db(activeTab.url!);
        sendResponse(checkInDb)

      } catch (error) {
        console.log(error, "from check_current_url bg.ts");
        sendResponse({success:false, error})
      }

    })();
    return true;
  }

  if(message.task === "get_allurl"){
    (async () => {

      try {

        const checkInDb = await getAllDataFromMilestone3Db();
        sendResponse(checkInDb)

      } catch (error) {
        console.log(error, "from check_current_url bg.ts");
        sendResponse(error)
      }

    })();
    return true;
  }

  if(message.task === "update_rating"){
    (async () => {
      try {

        const result = await getDataFromIndexedDb();

        if(result?.topic === undefined || result?.last_topic === undefined){
          throw new Error("Please Add a topic first before trying to update rating!")
        }        

        const activeTabArray = await chrome.tabs.query({active:true, currentWindow:true});
        const activeTab = activeTabArray[0];

        const checkInDb = await getUrlDataFromMilestone3Db(activeTab.url!);

        if(!("url" in checkInDb)){
          throw new Error("No Such entry in Db with this url! please try reloading.")
        }

        if(!("new_rating" in message)){
          throw new Error("No Rating value Found! Conrtact Developer")
        }

        await updateUrlDataInMilestone3Db({current_url: activeTab.url!, rating:message.new_rating})
        const updatedData = await getUrlDataFromMilestone3Db(activeTab.url!);
        sendResponse({success:true, updated_rating: updatedData.rating})


      } catch (error) {
        if(error instanceof Error){
          sendResponse({success:false, error: error.message})
        }else{
          sendResponse({success:false, error: "unknown error occured  - check dev tool"})
        }
      }


    })();
    return true;
  }

  if(message.task === "update_status"){
    (async () => {
      try {

        const result = await getDataFromIndexedDb();

        if(result?.topic === undefined || result?.last_topic === undefined){
          throw new Error("Please Add a topic first before trying to update status!")
        } 

        const activeTabArray = await chrome.tabs.query({active:true, currentWindow:true});
        const activeTab = activeTabArray[0];

        const checkInDb = await getUrlDataFromMilestone3Db(activeTab.url!);

        if(!("url" in checkInDb)){
          throw new Error("cannot find url in milestone 3 db!")
        }

        if(!("new_status" in message)){
          throw new Error("No Status value Found! Conrtact Developer")
        }

        await updateUrlDataInMilestone3Db({current_url: activeTab.url!, status:message.new_status})
        const updatedData = await getUrlDataFromMilestone3Db(activeTab.url!);
        sendResponse({success:true, updated_status: updatedData.status})


      } catch (error) {
        if(error instanceof Error){
          sendResponse({success:false, error: error.message})
        }else{
          sendResponse({success:false, error: "unknown error occured  - check dev tool"})
        }
      }

    })();
    return true;
  }

  if(message.task === "current_button_pressed"){

    (async() => {
      
      await chrome.storage.local.set({last_button_pressed: "next"})
      const data = await getDataFromIndexedDb()
      
      
      // if current_url exists in state
      if(data?.current_url !== undefined){

        const urlData = await getUrlDataFromMilestone3Db(data.current_url);

        // not exists
        if(Object.keys(urlData).length === 0){
          sendResponse({success:false, message: "state.url not found in url.db - try realoading or contact developer!"})
          return;
        }

        // exists
        const allTabs = await chrome.tabs.query({active:true, currentWindow:true});
        const activeTab = allTabs[0];
        chrome.tabs.update(activeTab.id!, {url: urlData.url});
        await UpdateDataIndexedDb({id:"topic_url_state", current_url:urlData.url, new_topic:urlData.topic})
      }
      // if current_url does not exists in state
      else{
        sendResponse({success:false, message:"current_url is undefined in state - please add a topic first! or contact developer"})
      }

    })();

    return true;
  }

  if(message.task === "next_button_pressed"){

    (async() => {
      
      await chrome.storage.local.set({last_button_pressed: "next"})
      const data = await getDataFromIndexedDb()
      
      // if current_url exists in state
      if(data?.current_url !== undefined){

        const urlData = await getUrlDataFromMilestone3Db(data.current_url);

        // not exists
        if(Object.keys(urlData).length === 0){
          sendResponse({success:false, message: "state.url not found in url.db - try realoading or contact developer!"})
          return;
        }
        
        const allUrlsFromMilestone3Db = await getAllDataFromMilestone3Db();              

        const initialSearchIndexNext = await chrome.storage.local.get("initialSearchIndexNext")        

        const nextMatch = findNextMatch({lastIndex: initialSearchIndexNext.initialSearchIndexNext, AllUrlArray:allUrlsFromMilestone3Db, present_url: urlData.url, topic: data.topic!})
        await chrome.storage.local.set({"initialSearchIndexNext": nextMatch.newIndex})
        

        // no next url exists
        if(nextMatch.nextUrl === undefined){
          sendResponse({success:false, message: "no next url is found!"})
          return;
        }

        // next url exists
        await UpdateDataIndexedDb({id:"topic_url_state", current_url:urlData.url, new_topic:urlData.topic})        
        const allTabs = await chrome.tabs.query({active:true, currentWindow:true});
        const activeTab = allTabs[0];
        chrome.tabs.update(activeTab.id!, {url: nextMatch.nextUrl.url});
      }
      // if current_url does not exists in state
      else{
        sendResponse({success:false, message:"current_url is undefined in state - please add a topic first! or contact developer"})
      }

    })();

    return true;
  }

  if(message.task === "previous_button_pressed"){

    (async() => {
      
      await chrome.storage.local.set({last_button_pressed: "previous"})
      const data = await getDataFromIndexedDb()
      
      // if current_url exists in state
      if(data?.current_url !== undefined){

        const urlData = await getUrlDataFromMilestone3Db(data.current_url);

        // not exists
        if(Object.keys(urlData).length === 0){
          sendResponse({success:false, message: "state.url not found in url.db - try realoading or contact developer!"})
          return;
        }
        
        const allUrlsFromMilestone3Db = await getAllDataFromMilestone3Db(); 
        console.log(allUrlsFromMilestone3Db, "allUrlsFromMilestone3Db");
                     

        const initialSearchIndexPrevious = await chrome.storage.local.get("initialSearchIndexPrevious")        

        const previousMatch = findPreviousMatch({lastIndex: initialSearchIndexPrevious.initialSearchIndexPrevious, AllUrlArray:allUrlsFromMilestone3Db, present_url: urlData.url, topic: data.topic!})
        await chrome.storage.local.set({"initialSearchIndexPrevious": previousMatch.newIndex})
        

        // no next url exists
        if(previousMatch.previousUrl === undefined){
          sendResponse({success:false, message: "no previous url is found!"})
          return;
        }

        // next url exists
        await UpdateDataIndexedDb({id:"topic_url_state", current_url:urlData.url, new_topic:urlData.topic})        
        const allTabs = await chrome.tabs.query({active:true, currentWindow:true});
        const activeTab = allTabs[0];
        chrome.tabs.update(activeTab.id!, {url: previousMatch.previousUrl.url});
      }
      // if current_url does not exists in state
      else{
        sendResponse({success:false, message:"current_url is undefined in state - please add a topic first! or contact developer"})
      }

    })();

    return true;
  }


  

});


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if(changeInfo.status === "complete" && tab.active && tab.url){        

        try {
            const { extension_enabled } = await chrome.storage.local.get("extension_enabled");

        const currentState = await getDataFromIndexedDb();
        // console.log(currentState,"current state - before updating");
        
        const isExtensionFirstTime = (currentState?.last_topic === undefined && currentState?.topic === undefined)
        // console.log(isExtensionFirstTime, "isExtensionFirstTime");
        

        if(extension_enabled && !isExtensionFirstTime){

            await UpdateUrlAndStateInDb(tab.url)
            const updateCurrentState = await getDataFromIndexedDb();
            await addUrlDataIntoMilestone3Db({current_url: tab.url, last_topic: updateCurrentState.last_topic})
            const data = await getAllDataFromMilestone3Db()
            console.log(data, "background auto");
            

            // const data = await getDataFromIndexedDb()
            // console.log(data, "current db state, bg auto tab funciton");
            
        }
        } catch (error) {
         console.log(error, "from background.ts auto update tabs, tabs listener");
            
        }

    }
})