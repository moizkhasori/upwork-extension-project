interface UrlRowState {
    rating: number,
    status: string,
    topic: string,
    url: string,
    visited_datetime: string
}


export function findNextMatch({lastIndex, AllUrlArray, present_url, topic}: {lastIndex:number, AllUrlArray:UrlRowState[], present_url:string, topic:string}) {

    // Start searching from the next index
    const nextMatch = AllUrlArray.slice(lastIndex + 1).find((urlItem) => (
            !urlItem.url.startsWith("chrome://") 
            && urlItem.url !== present_url
            && urlItem.topic === topic
            && urlItem.status !== "done"
            && urlItem.status !== "ignore"
        ));
  
    if (nextMatch) {
      return {
        newIndex: AllUrlArray.indexOf(nextMatch),
        nextUrl: nextMatch
      };
    } 
    
    else {
      const nextMatch =  AllUrlArray.find((urlItem) => (
        !urlItem.url.startsWith("chrome://") 
        && urlItem.url !== present_url
        && urlItem.topic === topic
        && urlItem.status !== "done"
        && urlItem.status !== "ignore"
    ));

        return {
            newIndex: 0,
            nextUrl: nextMatch
        };

    }
  }


  export function findPreviousMatch({
    lastIndex,
    AllUrlArray,
    present_url,
    topic
}: {
    lastIndex: number,
    AllUrlArray: UrlRowState[],
    present_url: string,
    topic: string
}) {
    // Handle case where lastIndex is invalid (e.g., -1)
    if (lastIndex < 0) {
        lastIndex = 0;
    }

    // Search backwards from the current lastIndex
    const previousMatch = AllUrlArray.slice(0, lastIndex)
        .reverse()
        .find((urlItem) => (
            !urlItem.url.startsWith("chrome://") 
            && urlItem.url !== present_url
            && urlItem.topic === topic
            && urlItem.status !== "done"
            && urlItem.status !== "ignore"
        ));

    if (previousMatch) {
        // console.log("if previous block ran");
        
        // Find the original index of the previous match in the unsliced array
        const newIndex = AllUrlArray.indexOf(previousMatch);
        // console.log(newIndex, previousMatch);
        
        return {
            newIndex: newIndex,
            previousUrl: previousMatch
        };
    } else {
        // console.log("else previous block ran");

        // If no previous match is found, consider wrapping around to the end of the array
        const lastMatch = AllUrlArray.slice().reverse().find((urlItem) => (
            !urlItem.url.startsWith("chrome://") 
            && urlItem.url !== present_url
            && urlItem.topic === topic
            && urlItem.status !== "done"
            && urlItem.status !== "ignore"
        ));
        // console.log(lastMatch, "lastMatch else block");
        

        const newIndex = lastMatch ? AllUrlArray.indexOf(lastMatch) : 0;
        return {
            newIndex: newIndex,
            previousUrl: lastMatch
        };
    }
}
