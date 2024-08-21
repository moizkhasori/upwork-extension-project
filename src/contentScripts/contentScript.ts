chrome.runtime.sendMessage({task: "check_extension_state"}, (response) => {
    console.log(response);
})