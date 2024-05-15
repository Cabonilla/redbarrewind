// console.log("background.js");

function getActiveTabId(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs.length > 0) {
      const tabId = tabs[0].id;
      callback(tabId);
    }
  });
}

function jumpToTime(time) {
  getActiveTabId((tabId) => {
    chrome.runtime?.id && chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        func: (time) => {
          // document.addEventListener('DOMContentLoaded', () => {
            const videoElement = document.querySelector("video")
            // videoElement = vid

            console.log(videoElement)

            console.log("JUMPING! ", videoElement, " ", window.location.href.includes("redbar"))

            if (videoElement) {
              videoElement.currentTime = time;
              console.log(videoElement.currentTime);
            }
          // });
        },
        args: [time],
      },
      (result) => handleScriptExecutionResult(result)
    );
  });
}

function handleScriptExecutionResult(result) {
  if (chrome.runtime.lastError) {
    console.error("Background script: Error executing script in content script:", chrome.runtime.lastError);
  }
}

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  if (message.command === "jumpToTime") {
    jumpToTime(message.time, message.vid);
  }
  return true;
});