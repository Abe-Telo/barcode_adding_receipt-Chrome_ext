document.addEventListener('DOMContentLoaded', function() {
  var captureButton = document.getElementById('captureBtn');
  if (captureButton) {
    captureButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({action: "capture"}, function(response) {
        if (response.error) {
          console.error('Failed to take screenshot:', response.error);
        } else {
          console.log('Screenshot taken', response.imageUri);
          // For instance, you can display the image in a new element or process it further:
          displayScreenshot(response.imageUri);
        }
      });
    });
  }
});

function displayScreenshot(imageUri) {
  var img = document.createElement('img');
  img.src = imageUri;
  document.body.appendChild(img);  // Append the screenshot to the body of popup.html for visual confirmation
}
// Example: Sending the screenshot to content.js for further processing
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {action: "process_screenshot", imageUri: response.imageUri});
});
