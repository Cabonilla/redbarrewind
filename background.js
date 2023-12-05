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
      console.log("message sent: jumpToTime");
      chrome.runtime?.id
        ? chrome.scripting.executeScript(
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
          )
        : null;
    } else if (message.command === "getLink") {
      chrome.runtime?.id
        ? chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (time) => {
              if (window.location.href.includes("youtube")) {
                const pageUrl = window.location.href
                  .replace("www.", "")
                  .replace("youtube.com", "youtu.be")
                  .replace("watch?v=", "");
                navigator.clipboard.writeText(
                  pageUrl + "?feature=shared&t=" + Math.ceil(time)
                );
              } else {
                const pageUrl = window.location.href;
                navigator.clipboard.writeText(pageUrl);
              }
            },
            args: [message.time],
          })
        : null;
    } else if (message.command === "copyTime") {
      console.log("time, copied");
      chrome.runtime?.id
        ? chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (time) => {
              navigator.clipboard.writeText(time);
            },
            args: [message.time],
          })
        : null;
    }
  });
  return true;
});
