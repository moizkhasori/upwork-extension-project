import React from "react";
import { createRoot } from "react-dom/client"
import "./popup.css"

const Popup = () => {
    return(
        <div>
            ok
        </div>
    )
}

const root = createRoot(document.getElementById("popup") as HTMLElement);
root.render(<Popup />)