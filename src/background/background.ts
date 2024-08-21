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
         console.log(error, "from background.ts - update_extension_state");
        }
    })();

    return true;
  }
});
