// Ad service for managing advertisements
import { adConfig } from '@/config/adConfig';

class AdService {
  private static instance: AdService;
  private youtubeVideoIds: string[];
  private currentAdIndex: number = 0;

  private constructor() {
    this.youtubeVideoIds = adConfig.youtubeAdVideoIds;
    console.log("AdService: Initialized with video IDs", this.youtubeVideoIds);
  }

  static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  getNextYouTubeAd(): string {
    if (this.youtubeVideoIds.length === 0) {
      console.log("AdService: No ads available");
      return ""; // Return empty string if no ads available
    }
    const adId = this.youtubeVideoIds[this.currentAdIndex];
    console.log("AdService: Getting next ad", adId, "at index", this.currentAdIndex);
    this.currentAdIndex = (this.currentAdIndex + 1) % this.youtubeVideoIds.length;
    return adId;
  }

  getYouTubeAdAtIndex(index: number): string {
    if (this.youtubeVideoIds.length === 0) {
      console.log("AdService: No ads available");
      return ""; // Return empty string if no ads available
    }
    if (index >= 0 && index < this.youtubeVideoIds.length) {
      console.log("AdService: Getting ad at index", index, ":", this.youtubeVideoIds[index]);
      return this.youtubeVideoIds[index];
    }
    console.log("AdService: Index out of bounds, returning first ad");
    return this.youtubeVideoIds[0]; // Return first ad if index is out of bounds
  }

  getAllYouTubeAds(): string[] {
    console.log("AdService: Getting all ads", this.youtubeVideoIds);
    return [...this.youtubeVideoIds];
  }

  setYouTubeAds(videoIds: string[]): void {
    console.log("AdService: Setting YouTube ads", videoIds);
    this.youtubeVideoIds = videoIds;
    this.currentAdIndex = 0; // Reset index when updating ads
  }

  addYouTubeAd(videoId: string): void {
    if (!this.youtubeVideoIds.includes(videoId)) {
      console.log("AdService: Adding YouTube ad", videoId);
      this.youtubeVideoIds.push(videoId);
    }
  }

  removeYouTubeAd(videoId: string): void {
    console.log("AdService: Removing YouTube ad", videoId);
    this.youtubeVideoIds = this.youtubeVideoIds.filter(id => id !== videoId);
    if (this.currentAdIndex >= this.youtubeVideoIds.length) {
      this.currentAdIndex = 0;
    }
  }

  getAdTiming(): { interval: number; duration: number } {
    console.log("AdService: Getting ad timing", {
      interval: adConfig.adInterval,
      duration: adConfig.adDuration
    });
    return {
      interval: adConfig.adInterval,
      duration: adConfig.adDuration
    };
  }

  setAdTiming(interval: number, duration: number): void {
    // In a real implementation, this would update the config
    console.log(`AdService: Ad timing set to ${interval} minutes interval, ${duration} seconds duration`);
  }
}

export default AdService;