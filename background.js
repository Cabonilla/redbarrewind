console.log("background.js");

function getActiveTabId(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs.length > 0) {
      const tabId = tabs[0].id;
      callback(tabId);
    }
  });
}

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  getActiveTabId((tabId) => {
    if (message.command === "jumpToTime") {
      chrome.runtime?.id
        ? chrome.scripting.executeScript(
            {
              target: { tabId: tabId },
              func: (time) => {
                const videoElement = document.querySelector("video");
                if (videoElement) {
                  videoElement.currentTime = time;
                }
              },
              args: [message.time],
            },
            (result) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Background script: Error executing script in content script:",
                  result
                );
              }
            }
          )
        : null;
    }
  });
  return true;
});
