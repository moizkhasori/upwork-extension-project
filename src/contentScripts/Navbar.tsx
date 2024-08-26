import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./Navbar.css";
import { addUrlDataIntoMilestone3Db, getAllDataFromMilestone3Db, getDataFromIndexedDb, getUrlDataFromMilestone3Db, OpenMilestone3Database } from "../utils/indexedDb";
import { RatingType, StatusType } from "../utils/types"
;
const NAVBAR_HEIGHT = "7.5rem";

const navbar = document.createElement("div");
navbar.style.position = "fixed";
navbar.style.top = "0";
navbar.style.left = "0";
navbar.style.width = "100%";
navbar.style.height = NAVBAR_HEIGHT;
navbar.style.zIndex = "9999";
navbar.style.borderBottom = "1px solid lightgray"
navbar.style.display = "none"

document.body.appendChild(navbar);

chrome.storage.onChanged.addListener((changes, area) => {
    if(area === "local" && changes.extension_enabled){
        navbar.style.display = changes.extension_enabled.newValue ? "block" : "none";
        document.body.style.marginTop = changes.extension_enabled.newValue ? NAVBAR_HEIGHT : "0rem";
    }
})

const Navbar = () => {
  const [addTopicInputValue, setAddTopicInputValue] = useState<string>("");
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const [rating, setRating] =useState<RatingType>(0)
  const [status, setStatus] =useState<StatusType>("none")
  const [pageAlreadyVisited, setPageAlreadyVisited] = useState<boolean>(false)
  const [navbarError, setNavbarError] = useState<string | null>(null)

  // just to see url db state
  // useEffect(() => {
  //   (async () => {
  //     chrome.runtime.sendMessage({task:"get_allurl"}, (response) => {
  //       console.log(response);
        
  //     })
      
  //   })();
  // },[rating, status, lastTopic])


  useEffect(() => {
    chrome.runtime.sendMessage({ task: "get_combo_box_topic" }, (response) => {
      if ("last_topic" in response) {
        setLastTopic(response.last_topic);
      } else {
        setLastTopic(null);
      }
    });


    chrome.storage.local.get("extension_enabled", ({ extension_enabled }) => {
      if (extension_enabled) {
        navbar.style.display = extension_enabled ? "block" : "none";
        document.body.style.marginTop = extension_enabled ? NAVBAR_HEIGHT : "0rem";
  
      chrome.runtime.sendMessage({ task: "check_current_url" }, (response) => {
          if ("url" in response) {
            setStatus(response.status);
            setRating(response.rating);
            setPageAlreadyVisited(true);
          }
        });

        
      } else {
        navbar.style.display = "none";
        document.body.style.marginTop = "0rem";
      }
    });
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setNavbarError(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  },[navbarError])



  const handleUpdateRating = async (event:React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const newValue = Number(event.target.value) as RatingType;
    
      chrome.runtime.sendMessage({task:"update_rating", new_rating: newValue}, (response) => {
        if(response.success === false){
          setNavbarError(response.error)
        }
       else{
        setRating((response.updated_rating))
       }
        
        
      })
    } catch (error) {      
      if(error instanceof Error){
        setNavbarError(error.message)
      }else{
        setNavbarError("unknown error occured! contact developer!")
        
      }
    }
    
  }

  const handleUpdateStatus = async (event:React.ChangeEvent<HTMLSelectElement>) => {
  
    try {

      const newValue = event.target.value as StatusType;

      chrome.runtime.sendMessage({task:"update_status", new_status: newValue}, (response) => {
        if(response.success === false){
          setNavbarError(response.error)
        }
       else{
        setStatus(response.updated_status)
       }
        
      })
  
    } catch (error) {      
      if(error instanceof Error){
        setNavbarError(error.message)
      }else{
        setNavbarError("unknown error occured! contact developer!")
        
      }
    }
    
  }

  const handleAddNewTopic = async () => {    
    if (!(addTopicInputValue === "" || addTopicInputValue === null)) {
      chrome.runtime.sendMessage(
        { task: "add_new_topic", topic: addTopicInputValue },
        async (response) => {
          setLastTopic(response.result.topic);
          setAddTopicInputValue("");
        }
      );
    }
  };

  const handleDisableExtension = async () => {
    chrome.storage.local.set({extension_enabled: false})
  };

  return (
   <div className="fulldiv">
     <div className="navbar-container" style={{backgroundColor:`${pageAlreadyVisited? "red" : "green"}`}}>
      <button
        onClick={handleDisableExtension}
        className="navbar_button"
      >
        Disable
      </button>

      <div className="navbar_input_div">
        <input
          type="text"
          placeholder="Add Topic"
          value={addTopicInputValue}
          onChange={(e) => {
            setAddTopicInputValue(e.target.value);
          }}
        />
        <button onClick={handleAddNewTopic}>Add</button>
      </div>

      <div className="navbar_combobox_div">
        <label htmlFor="topic_combobox">Select a Topic:</label>

        {lastTopic === null ? (
          <select id="topic_combobox">
            <option selected disabled>
              Please Add a Topic!
            </option>
          </select>
        ) : (
          <select id="topic_combobox">
            <option selected value={lastTopic}>
              {lastTopic}
            </option>
          </select>
        )}
      </div>

      <div className="rating_dropdown_div">
        <label htmlFor="rating_dropdown">Rating:</label>
        <select id="rating_dropdown" value={rating} onChange={handleUpdateRating}>
            <option disabled>0</option>
          {[1,2,3,4,5,6,7,8,9,10].map((rating) => (
            <option value={rating} key={rating}>{rating}</option>
          ))}
        </select>
      </div>


      <div className="status_dropdown_div">
        <label htmlFor="status_dropdown">Status:</label>
        <select value={status} id="status_dropdown" onChange={handleUpdateStatus}>
          <option disabled>none</option>
          {["ignore", "todo", "doing", "done"].map((status) => (
            <option value={status} key={status}>{status}</option>
          ))}

        </select>
      </div>

    </div>
    {navbarError && <div className="errordiv"><b style={{color:"red"}}>Error:</b>{" "+navbarError}</div>}
   </div>
  );
};

const root = createRoot(navbar);
root.render(<Navbar />);
