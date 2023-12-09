export async function copyTextToClipboard(textToCopy) {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      }
    } catch (err) {
      console.error(err);
    }
  }