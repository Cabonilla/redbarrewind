const handleClick = async (text) => {
  try {
    await navigator.clipboard.writeText(text).then(() => {
      console.log("Copied!");
    });
  } catch (err) {
    console.error("Error Copying Text:", err);
  }
};

const handleTimeCopy = () => {
  const videoElement = document.querySelector("video");
  let currTime = videoElement.currentTime;

  function secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(
      remainingSeconds
    )}`;
    return formattedTime;
  }

  function padZero(num) {
    return num < 10 ? `0${num}` : num;
  }

  const paddedTime = secondsToTime(currTime);
  console.log(paddedTime);
  return paddedTime;
};

const handleLinkCopy = () => {
  const videoElement = document.querySelector("video");
  let totalSeconds = videoElement.currentTime;
  if (window.location.href.includes("youtube")) {
    const pageUrl = window.location.href
      .replace("www.", "")
      .replace("youtube.com", "youtu.be")
      .replace("watch?v=", "");

    return pageUrl + "?feature=shared&t=" + Math.ceil(totalSeconds);
  }
};