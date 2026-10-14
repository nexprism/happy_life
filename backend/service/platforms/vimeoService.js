import axios from 'axios';

class VimeoService {
  constructor() {
    // Public oEmbed endpoint does not require authentication
  }

  /**
   * Extract Vimeo Video ID and optional privacy hash from any Vimeo URL or ID
   * Supported formats:
   * - https://vimeo.com/123456789
   * - https://vimeo.com/123456789/abcdef1234
   * - https://player.vimeo.com/video/123456789
   * - https://player.vimeo.com/video/123456789?h=abcdef1234
   * - https://vimeo.com/channels/staffpicks/123456789
   * - https://vimeo.com/groups/name/videos/123456789
   * - https://vimeo.com/manage/videos/123456789
   * - 123456789
   * - 123456789/abcdef1234
   */
  cleanVimeoUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      return iframeMatch[1].replace(/&amp;/g, '&').trim();
    }
    return trimmed;
  }

  extractVideoData(url) {
    if (!url || typeof url !== 'string') return null;
    const cleanUrl = this.cleanVimeoUrl(url);

    // Check direct format "123456789" or "123456789/abcdef"
    const directMatch = cleanUrl.match(/^(\d+)(?:\/([a-zA-Z0-9]+))?$/);
    if (directMatch) {
      return {
        videoId: directMatch[1],
        hash: directMatch[2] || null
      };
    }

    // Check player URL: player.vimeo.com/video/123456789?h=abcdef or player.vimeo.com/video/123456789
    const playerMatch = cleanUrl.match(/player\.vimeo\.com\/video\/(\d+)(?:\?[^#]*\bh=([a-zA-Z0-9]+))?/i);
    if (playerMatch) {
      return {
        videoId: playerMatch[1],
        hash: playerMatch[2] || null
      };
    }

    // Check standard Vimeo URLs
    const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]+\/videos\/|album\/(?:\d+\/)?video\/|video\/|manage\/videos\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/i);
    if (vimeoMatch) {
      return {
        videoId: vimeoMatch[1],
        hash: vimeoMatch[2] || null
      };
    }

    return null;
  }

  async processVimeoUrl({ url, title, description, videoLessonId }) {
    try {
      const videoData = this.extractVideoData(url);
      if (!videoData || !videoData.videoId) {
        throw new Error('Invalid Vimeo URL or Video ID');
      }

      const { videoId, hash } = videoData;
      const embedUrl = hash 
        ? `https://player.vimeo.com/video/${videoId}?h=${hash}&title=0&byline=0&portrait=0&dnt=1`
        : `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&dnt=1`;
      const watchUrl = hash 
        ? `https://vimeo.com/${videoId}/${hash}`
        : `https://vimeo.com/${videoId}`;

      let thumbnail = '';
      let duration = 0;
      let videoTitle = title;
      let videoDescription = description;

      // Try to fetch metadata and high-res thumbnail from Vimeo oEmbed API
      try {
        const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(watchUrl)}`;
        const response = await axios.get(oembedUrl, { timeout: 4000 });
        if (response.data) {
          thumbnail = response.data.thumbnail_url || '';
          duration = response.data.duration || 0;
          if (!videoTitle && response.data.title) {
            videoTitle = response.data.title;
          }
          if (!videoDescription && response.data.description) {
            videoDescription = response.data.description;
          }
        }
      } catch (oembedError) {
        // oEmbed API failure fallback (e.g. unlisted/private video or offline)
        console.warn(`Vimeo oEmbed fetch note: ${oembedError.message}. Proceeding with URL extraction.`);
      }

      return {
        videoId,
        hash,
        embedUrl,
        watchUrl,
        thumbnail,
        duration,
        title: videoTitle,
        description: videoDescription,
      };
    } catch (error) {
      console.error(`Error processing Vimeo URL: ${error.message}`);
      throw error;
    }
  }

  validateVimeoUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const videoData = this.extractVideoData(url);
    return !!(videoData && videoData.videoId);
  }

  generateEmbedUrl(videoId, hash = null, options = {}) {
    const {
      autoplay = 0,
      loop = 0,
      muted = 0,
      title = 0,
      byline = 0,
      portrait = 0,
      dnt = 1,
    } = options;

    const params = new URLSearchParams({
      ...(hash && { h: hash }),
      autoplay: String(autoplay),
      loop: String(loop),
      muted: String(muted),
      title: String(title),
      byline: String(byline),
      portrait: String(portrait),
      dnt: String(dnt),
    });

    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  }
}

export default new VimeoService();
