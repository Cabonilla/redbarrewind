function getActiveTabId(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs.length > 0) {
      const tabId = tabs[0].id;
      callback(tabId);
    }
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.command === "checkActiveTab") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const isValid = tabs && tabs.length > 0;
      sendResponse({ isValid: isValid });
    });
    return true; // Indicates that sendResponse will be called asynchronously
  }
});

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  getActiveTabId((tabId) => {
    if (message.command === "jumpToTime") {
      console.log("message sent: jumpToTime");
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: (time) => {
            const videoElement = document.querySelector("video");
            if (videoElement) {
              console.log("total time: ", time);
              videoElement.currentTime = time;
            }
          },
          args: [message.time], // Pass the time parameter
        },
        (result) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Background script: Error executing script in content script:",
              chrome.runtime.lastError
            );
          } else {
            console.log(
              "Background script: Script executed successfully:",
              result
            );
          }
        }
      );
    } else if (message.command === "getLink") {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (time) => {
          const pageUrl = window.location.href
            .replace("www.", "")
            .replace("youtube.com", "youtu.be")
            .replace("watch?v=", "");
          // console.log(pageUrl + "?feature=shared&t=" + Math.ceil(time))
          // console.log(time)
          navigator.clipboard.writeText(
            pageUrl + "?feature=shared&t=" + Math.ceil(time)
          );
        },
        args: [message.time], // Pass the time parameter
      });
    }
  });
  return true;
});