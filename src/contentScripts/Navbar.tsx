import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./Navbar.css";
const NAVBAR_HEIGHT = "7.5rem";

const navbar = document.createElement("div");
navbar.style.position = "fixed";
navbar.style.top = "0";
navbar.style.left = "0";
navbar.style.width = "100%";
navbar.style.height = NAVBAR_HEIGHT;
navbar.style.backgroundColor = "#111";
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

  useEffect(() => {
    chrome.runtime.sendMessage({ task: "get_combo_box_topic" }, (response) => {
      if ("last_topic" in response) {
        setLastTopic(response.last_topic);
      } else {
        setLastTopic(null);
      }
    });

    chrome.storage.local.get("extension_enabled", ({ extension_enabled }) => {
        navbar.style.display = extension_enabled ? "block" : "none";
        document.body.style.marginTop = extension_enabled ? NAVBAR_HEIGHT : "0rem";
        
    });
  }, []);

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

  const handleUpdateExtensionState = async () => {
    chrome.storage.local.set({extension_enabled: false})
  };

  return (
    <div className="navbar-container">
      <button
        style={{ backgroundColor: "red" }}
        onClick={handleUpdateExtensionState}
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
    </div>
  );
};

const root = createRoot(navbar);
root.render(<Navbar />);
