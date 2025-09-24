// Ad configuration settings
export const adConfig = {
  // Ad timing settings
  adInterval: 10, // minutes
  adDuration: 15, // seconds
  
  // YouTube ad video IDs (videos that work well for embedding)
  youtubeAdVideoIds: [
    "dQw4w9WgXcQ", // Rick Astley - Never Gonna Give You Up (works well for testing)
    "YE7VzlLtp-4", // Big Buck Bunny (Creative Commons, works well for embedding)
    "R2PN4k9tYIU", // Sintel (Creative Commons, works well for embedding)
    "KBK34_XT13k", // Elephants Dream (Creative Commons, works well for embedding)
    "i6818_KzM4g", // Tears of Steel (Creative Commons, works well for embedding)
    "iXwL5I9Kd4Y", // The New MacBook Air (Apple, works well for embedding)
    "z7VYVjR_n2E", // Google Pixel 6 Pro (works well for embedding)
    "x2H7P0K8zU0"  // Tesla Model 3 (works well for embedding)
  ],
  
  // Ad types
  adTypes: {
    VIDEO: "video",
    BANNER: "banner"
  },
  
  // Ad positions
  adPositions: {
    PRE_ROLL: "pre-roll",
    MID_ROLL: "mid-roll",
    POST_ROLL: "post-roll"
  }
};

export default adConfig;