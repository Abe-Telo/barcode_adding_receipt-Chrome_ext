// Function to take a screenshot and send it to the active tab's content script
function takeScreenshot() {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(imageUri) {
        // Check for errors in capturing the screenshot
        if (chrome.runtime.lastError) {
            console.error("Error capturing screenshot:", chrome.runtime.lastError.message);
            return;
        }
        // Log the captured URI for debugging
        console.log("Screenshot taken and URI ready to use.", imageUri);
        // Find the active tab to send the screenshot to its content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                console.error("No active tab found.");
                return;
            }
            chrome.tabs.sendMessage(tabs[0].id, {action: "process_screenshot", imageUri: imageUri});
        });
    });
}

// Listener for the browser action (clicking the extension icon)
chrome.action.onClicked.addListener((tab) => {
    takeScreenshot();
});

// Listening for specific messages to trigger screenshot capture
// This allows for triggering screenshots from the content script or other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureScreenshot") {
        takeScreenshot();
        sendResponse({status: "Screenshot processing started"});
        return true; // Indicates asynchronous response
    }
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Message received", request); // Log to see if message is received
    if (request.action == "capture") {
      chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(imageUri) {
        if (chrome.runtime.lastError) {
            console.error("Error capturing:", chrome.runtime.lastError.message);
            sendResponse({error: chrome.runtime.lastError.message});
            return;
        }
        console.log("Screenshot taken and URI ready to use.", imageUri);
        sendResponse({imageUri: imageUri});
      });
      return true; // Indicates you will respond asynchronously
    }
  }
);


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureScreenshot") {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, (imageUri) => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "processScreenshot", imageUri: imageUri});
      });
    });
  }
});