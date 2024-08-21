import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client"
import "./popup.css"


const Popup = () => {

    const [isExtensionEnabled, setIsExtensionEnabled] = useState<boolean | null>(null);

    useEffect(() => {
        chrome.runtime.sendMessage({task: "check_extension_state"}, (response) => {
            setIsExtensionEnabled(response)            
        })
        
    }, [isExtensionEnabled])

    const handleUpdateExtensionState = async () => {
        chrome.runtime.sendMessage({task: "update_extension_state", current_state: isExtensionEnabled}, (response) => {
            if(response.success === true){
                setIsExtensionEnabled(response.newState)
                console.log(response.newState);
                
            }
            if(response.success === false){
                console.log("false a gaya");
                
            }
        })
        
    }


    // if(true){
    //     return (
    //         <div className="popup_window">
    //             <span>Loading...</span>
    //         </div>
    //     )
    // }

    return(
        <div className="popup_window">
            <button style={{backgroundColor: `${isExtensionEnabled ? "green" : "red"}`}} onClick={handleUpdateExtensionState} className="popup_button">{isExtensionEnabled ? "Enabled" : "Disabled"}</button>
        </div>
    )
}

const root = createRoot(document.getElementById("popup") as HTMLElement);
root.render(<Popup />)