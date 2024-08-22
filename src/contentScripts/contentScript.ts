chrome.runtime.sendMessage({task: "check_extension_state"}, (response) => {
    console.log(response);
})

console.log(" i am inserted in each tab");



/*

Object - {
    topic - xyz
    last-topic - xyz
    current_url - xyz
}



*/