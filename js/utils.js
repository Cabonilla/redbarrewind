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

const handleLinkCopy = () => {
  const videoElement = document.querySelector("video");
  const totalSeconds = Math.ceil(videoElement.currentTime);

  if (window.location.href.includes("youtube")) {
    const pageUrl = window.location.href
      .replace("www.", "")
      .replace("youtube.com", "youtu.be")
      .replace("watch?v=", "");

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