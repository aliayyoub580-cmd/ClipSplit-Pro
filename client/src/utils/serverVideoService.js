const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:4000" : "");

export function splitVideoOnServer({ file, duration, onProgress }) {
  const jobId = createJobId();
  const formData = new FormData();
  formData.append("video", file);
  formData.append("duration", String(duration));
  formData.append("jobId", jobId);

  const xhr = new XMLHttpRequest();
  const events = new EventSource(`${API_BASE}/api/split-video/events/${jobId}`);

  const promise = new Promise((resolve, reject) => {
    events.onmessage = (event) => {
      const update = JSON.parse(event.data);
      onProgress?.({
        stage: update.stage,
        percent: update.percent,
        currentClip: 0,
        totalClips: 0,
        remainingMs: 0
      });
      if (update.error) {
        reject(new Error(update.error));
      }
    };

    events.onerror = () => {
      events.close();
    };

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const uploadPercent = Math.round((event.loaded / event.total) * 30);
      onProgress?.({
        stage: "Uploading",
        percent: Math.max(1, Math.min(30, uploadPercent)),
        currentClip: 0,
        totalClips: 0,
        remainingMs: 0
      });
    };

    xhr.onload = () => {
      events.close();
      try {
        const payload = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.({
            stage: "Completed",
            percent: 100,
            currentClip: payload.clips?.length || 0,
            totalClips: payload.clips?.length || 0,
            remainingMs: 0
          });
          resolve({
            ...payload,
            clips: (payload.clips || []).map((clip) => ({
              ...clip,
              url: absoluteUrl(clip.url)
            })),
            zipUrl: absoluteUrl(payload.zipUrl)
          });
          return;
        }
        reject(new Error(payload.error || payload.message || "Video splitting failed."));
      } catch (error) {
        reject(new Error("Video splitting failed. The server returned an invalid response."));
      }
    };

    xhr.onerror = () => {
      events.close();
      reject(new Error("Upload failed. Please check that the backend server is running."));
    };

    xhr.onabort = () => {
      events.close();
      reject(new Error("Processing cancelled. Your original video was not changed."));
    };

    xhr.open("POST", `${API_BASE}/api/split-video`);
    xhr.send(formData);
  });

  return {
    promise,
    cancel() {
      events.close();
      xhr.abort();
    }
  };
}

function absoluteUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url}`;
}

function createJobId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `job_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
