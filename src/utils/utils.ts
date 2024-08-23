export async function displayContentScriptInAllTabs() {
    const tabs = await chrome.tabs.query({}); 
    for (const tab of tabs) {
        if (tab.id && tab.url?.startsWith("http")) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["navbar.js"],
            });
        }
    }
}


export async function removeContentScriptInAllTabs() {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (tab.id && tab.url?.startsWith("http")) {
            chrome.tabs.reload(tab.id);
        }
    }
}