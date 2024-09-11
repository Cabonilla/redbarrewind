chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

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
          let videoElement;
          const iframe = document.querySelector('iframe');

          if (window.location.href.includes("redbarradio.net/shows") && iframe) {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            videoElement = iframeDocument.querySelector('video');
          } else {
            videoElement = document.querySelector("video")
          }

          if (videoElement) {
            videoElement.currentTime = time;
          }

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "fetchJsonData") {
    fetch(chrome.runtime.getURL('assets/bookmarks.json'))
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Ensure sendResponse is called only if the context is valid
        if (typeof sendResponse === 'function') {
          sendResponse({ success: true, data });
        }
      })
      .catch(error => {
        console.error("Error fetching JSON:", error);
        if (typeof sendResponse === 'function') {
          sendResponse({ success: false, error: error.message });
        }
      });

    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'fetchVideoInfo') {
    gatherVideoInfo(request.bookmarks)
      .then(videoData => {
        sendResponse({ videoInfoArray: videoData });
      })
      .catch(error => {
        console.error('Error in gatherVideoInfo:', error);
        sendResponse({ videoInfoArray: [] });
      });
  }
  return true; // Keeps the message channel open for asynchronous response
});

async function gatherVideoInfo(videos) {
  const videoInfoArray = [];
  for (const url of Object.keys(videos)) {
    const videoInfo = await getVideoInfo(url);
    if (videoInfo) {
      videoInfoArray.push({ url, ...videoInfo });
    }
  }
  return videoInfoArray;
}

async function getVideoInfo(url) {
  const apiUrl = `https://www.youtube.com/oembed?url=${url}&format=json`;
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'SameSite': 'None', // Headers related to cookies
      },
      credentials: 'omit' // Avoid sending cookies in the request
    });
    if (!response.ok) throw new Error(`Error fetching data for ${url}`);
    const data = await response.json();
    console.log(data)
    return {
      title: data.title,
      preview: data.thumbnail_url,
      iframe: data.html,
      url: url
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}