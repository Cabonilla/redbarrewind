const handleClick = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Copied!");
    })
    .catch((err) => {
      console.error("Error Copying Text:", err);
    });
};

const handleTimeCopy = () => {
  const videoElement = document.querySelector("video");
  const currTime = videoElement.currentTime;
  const paddedTime = secondsToTime(currTime);
  console.log("Copied:", paddedTime);
  return paddedTime;
};

const handleTimeAdd = () => {
  const videoElement = document.querySelector("video");
  const currTime = videoElement.currentTime;
  const addedTime = secondsToTime(currTime);
  return addedTime;
};

const handleLinkCopy = () => {
  const videoElement = document.querySelector("video");
  const totalSeconds = Math.ceil(videoElement.currentTime);

  if (window.location.href.includes("youtube")) {
    const pageUrl = window.location.href.includes('watch') ? 
      window.location.href  
      .replace("www.", "")
      .replace("youtube.com", "youtu.be")
      .replace("watch?v=", "") :
      window.location.href

    const timestampLink = `${pageUrl}?feature=shared&t=${totalSeconds}`;
    console.log("Copied Timestamp Link:", timestampLink);
    return timestampLink;
  }
};

function secondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

function padZero(num) {
  return num < 10 ? `0${num}` : num;
}

function convertJsonToKeyValuePairs(jsonData) {
  const keyValuePairs = [];

  for (const url in jsonData) {
    if (jsonData.hasOwnProperty(url)) {
      const timestamps = jsonData[url];
      for (const time in timestamps) {
        if (timestamps.hasOwnProperty(time)) {
          keyValuePairs.push({
            url: url,
            timestamp: time,
            description: timestamps[time]
          });
        }
      }
    }
  }

  return keyValuePairs;
}

const flashBackground = async (element, color1, color2, duration) => {
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  element.style.backgroundColor = color1;
  await wait(duration);

  element.style.backgroundColor = color2;
  await wait(duration);

  element.style.backgroundColor = color1;
  await wait(duration);

  element.style.backgroundColor = color2;
};

const applyFlashEffect = (element) => {
  element.classList.add("flash-effect");

  element.addEventListener("animationend", () => {
    element.classList.remove("flash-effect");
  }, { once: true });
};

function simulateKeyPress() {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  
  const ctrlOrCmdKey = isMac ? 'Meta' : 'Control';
  const ctrlOrCmdKeyCode = isMac ? 91 : 17; 
  
  const ctrlOrCmdDownEvent = new KeyboardEvent('keydown', {
    key: ctrlOrCmdKey,
    keyCode: ctrlOrCmdKeyCode,
    code: ctrlOrCmdKey + 'Left',
    ctrlKey: !isMac,
    metaKey: isMac,
    altKey: false,
    bubbles: true,
    cancelable: true
  });

  const altDownEvent = new KeyboardEvent('keydown', {
    key: 'Alt',
    keyCode: 18, 
    code: 'AltLeft',
    ctrlKey: !isMac,
    metaKey: isMac,
    altKey: true,
    bubbles: true,
    cancelable: true
  });

  document.dispatchEvent(ctrlOrCmdDownEvent);
  document.dispatchEvent(altDownEvent);
}

function convertToObj(text) {
  const lines = text.trim().split("\n");
  const result = {};

  let currentLink = '';

  lines.forEach(line => {
    if (line.startsWith("https://")) {
      currentLink = line.trim();
      result[currentLink] = {}; 
    } else if (line.includes(" - ")) {
      const [time, description] = line.split(" - ");
      if (currentLink) {
        result[currentLink][time.trim()] = description.trim(); 
      }
    }
  });

  return result;
}
