import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client"
import "./popup.css"

const Popup = () => {

    const [isExtensionEnabled, setIsExtensionEnabled] = useState<boolean | null>(null);
   
    

    useEffect(() => {
      chrome.runtime.sendMessage(
        { task: "check_extension_state" },
        (response) => {
          setIsExtensionEnabled(response);
        }
      );
    }, []);

    const handleUpdateExtensionState = async () => {
        chrome.storage.local.set({extension_enabled: !isExtensionEnabled})
        setIsExtensionEnabled(!isExtensionEnabled)
    }

   

    return(
        <div className="popup_window">
            <button style={{backgroundColor: `${isExtensionEnabled ? "green" : "red"}`}} onClick={handleUpdateExtensionState} className="popup_button">{isExtensionEnabled ? "Enabled" : "Disabled"}</button>
        </div>
    )
}

const root = createRoot(document.getElementById("popup") as HTMLElement);
root.render(<Popup />)