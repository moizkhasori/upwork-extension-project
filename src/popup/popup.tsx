import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client"
import "./popup.css"
import { OpenIndexedDatabase } from "../utils/indexedDb";


const Popup = () => {

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

    useEffect(() => {
        chrome.runtime.sendMessage({task: "test_message"}, (response) => {
            console.log(response, "current db state");
        })
    },[lastTopic])

    const handleUpdateExtensionState = async () => {
        chrome.runtime.sendMessage({task: "update_extension_state", current_state: isExtensionEnabled}, (response) => {
            if(response.success === true){
                setIsExtensionEnabled(response.newState)
                console.log(response.newState);
                
            }
        })
        
    }

    const handleAddNewTopic = async () => {

        if(!(addTopicInputValue === "" || addTopicInputValue === null)){
            chrome.runtime.sendMessage({task: "add_new_topic", topic: addTopicInputValue}, (response) => {                
                setLastTopic(response.result.topic)

            })
        }
        
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

           {
            isExtensionEnabled &&
            <div className="popup_optional_render_div">

            <div className="popup_input_div">
                <input type="text" placeholder="Add Topic" value={addTopicInputValue} onChange={(e) => {setAddTopicInputValue(e.target.value);}} />
                <button onClick={handleAddNewTopic} >Add</button>
            </div>

            <div className="popup_combobox_div">
                <label htmlFor="topic_combobox">Select a Topic:</label>

                {
                    lastTopic === null
                    ? (
                        <select id="topic_combobox">
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

            {/* <button className="crud-btn" onClick={deleteDb}>Index Db</button> */}
        </div>
           }

        </div>
    )
}

const root = createRoot(document.getElementById("popup") as HTMLElement);
root.render(<Popup />)