import React, { useEffect, useState } from 'react'
import { createRoot } from "react-dom/client";

const container = document.createElement("div");
container.style.position = "fixed";
container.style.top = "0";
container.style.left = "0";
container.style.width = "100%";
container.style.height = "5vh";
container.style.backgroundColor = "red";
container.style.zIndex = "9999";

document.body.appendChild(container);

document.body.style.marginTop = "5vh";



const Navbar = () => {

    const [isExtensionEnabled, setIsExtensionEnabled] = useState<boolean | null>(null);
    const [addTopicInputValue, setAddTopicInputValue] = useState<string>("")
    const [lastTopic, setLastTopic] = useState<string | null>(null);

    useEffect(() => {
        chrome.runtime.sendMessage({task: "check_extension_state"}, (response) => {
            setIsExtensionEnabled(response)            
        })
        
    }, [isExtensionEnabled])

    useEffect(() => {
        chrome.runtime.sendMessage({task: "get_combo_box_topic"}, (response) => {
           console.log(response, "from useeffect2 response");
           if("last_topic" in response){
               setLastTopic(response.last_topic)
           }else{
               setLastTopic(null)
           }
       })
       
   }, [])

   const handleUpdateExtensionState = async () => {
    chrome.runtime.sendMessage({task: "update_extension_state", current_state: isExtensionEnabled}, (response) => {
        if(response.success === true){
            setIsExtensionEnabled(response.newState)
            console.log(response.newState);
            
        }
    })
    
}


  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "white", gap:2 }}>
      <button style={{backgroundColor: `${isExtensionEnabled ? "green" : "red"}`}} onClick={handleUpdateExtensionState} className="popup_button">{isExtensionEnabled ? "Enabled" : "Disabled"}</button>

      {
            isExtensionEnabled &&
            <div className="popup_optional_render_div">


            <div className="popup_combobox_div">
                <label htmlFor="topic_combobox">Select a Topic:</label>

                {
                    lastTopic === null
                    ? (
                        <select id="topic_combobox">
                            <option selected disabled>Please Add a Topic!</option>
                            <option selected disabled>Please Add a Topic!</option>
                            <option selected disabled>Please Add a Topic!</option>
                            <option selected disabled>Please Add a Topic!</option>
                            <option selected disabled>Please Add a Topic!</option>
                        </select>
                    )
                    : (
                        <select id="topic_combobox">
                                <option selected value={lastTopic}>{lastTopic}</option>
                        </select>
                    )
                }

            </div>

        </div>
           }



    </div>
  )
}

const root = createRoot(container);
root.render(<Navbar />);