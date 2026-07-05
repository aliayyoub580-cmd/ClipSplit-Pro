export function downloadClipsZip(zipUrl) {
  if (!zipUrl) {
    throw new Error("ZIP file is not ready yet. Please split the video again.");
  }
  window.location.href = zipUrl;
}
