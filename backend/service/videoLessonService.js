import videoLessonRepository from '../repository/videoLessonRepository.js';
import videoCypherService from './platforms/videoCypherService.js';
import VdoCipherService from './VdoCipherService.js';
import youtubeService from './platforms/youtubeService.js';
import vimeoService from './platforms/vimeoService.js';
import mongoose from 'mongoose';
import VideoLesson from '../models/video.js';
import fs from "fs";

class VideoLessonService {
  async createVideoLesson(data, videoFile = null) {
    try {
      if (!data.lessonId) {
        throw new Error('Lesson ID is required');
      }

      if (!data.sourcePlatform) {
        throw new Error('Source platform is required');
      }

      if (data.uploadedBy && !mongoose.isValidObjectId(data.uploadedBy)) {
        throw new Error('Invalid uploadedBy ID format');
      }

      const initialData = {
        ...data,
        status: 'processing',
        secureUrl: '',
        videoId: '',
        thumbnail: '',
      };

      const videoLesson = await videoLessonRepository.create(initialData);

      let uploadResult;

      try {
        switch (data.sourcePlatform) {
          case 'videocypher':
            // Check upload method for VdoCipher
            if (data.uploadMethod == 'existing_video_id') {
              uploadResult = await this.handleVdoCipherExistingVideo(data, videoLesson._id);
            } else {
              // Default to file upload
              uploadResult = await this.handleVideoCypherUpload(videoFile, data, videoLesson._id);
            }
            break;

          case 'youtube':
            //console.log('createVideoLesson data:', data);
            uploadResult = await this.handleYouTubeUpload(data, videoLesson._id);
            break;

          case 'vimeo':
            uploadResult = await this.handleVimeoUpload(data, videoLesson._id);
            break;

          case 'external_link':
            uploadResult = await this.handleExternalLink(data, videoLesson._id);
            break;

          default:
            throw new Error('Unsupported platform');
        }

        const isVimeo = videoLesson.sourcePlatform === 'vimeo' || data.sourcePlatform === 'vimeo';
        const isEmbed = isVimeo && (data.vimeoInputType === 'embed' || Boolean(data.vimeoEmbedCode));

        const updatedVideoLesson = await videoLessonRepository.updateById(videoLesson._id, {
          secureUrl: uploadResult.secureUrl,
          embedUrl: uploadResult.embedUrl || '',
          originalUrl: uploadResult.originalUrl || data.vimeoUrl || data.youtubeUrl || '',
          vimeoUrl: isVimeo ? (isEmbed ? '' : (data.vimeoUrl || uploadResult.originalUrl || '')) : (data.vimeoUrl || ''),
          vimeoEmbedCode: isEmbed ? (data.vimeoEmbedCode || uploadResult.originalUrl || '') : '',
          vimeoInputType: isEmbed ? 'embed' : 'direct',
          youtubeUrl: data.youtubeUrl || '',
          videoId: uploadResult.videoId,
          thumbnail: uploadResult.thumbnail || '',
          status: 'ready',
          uploadMethod: data.uploadMethod || 'file',
          size: uploadResult.size || 0,
          duration: uploadResult.duration || 0,
          quality: uploadResult.quality || 'auto',
        });

        return {
          success: true,
          data: updatedVideoLesson,
          message: 'Video lesson created and uploaded successfully',
          uploadDetails: uploadResult,
        };
      } catch (uploadError) {
        await videoLessonRepository.updateStatus(videoLesson._id, 'failed');
        console.error('Upload error:', uploadError.message, uploadError);
        return {
          success: false,
          error: `Upload failed: ${uploadError.message}`,
          videoLessonId: videoLesson._id,
        };
      }
    } catch (error) {
      console.error('createVideoLesson error:', error.message, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // New method to handle existing VdoCipher video linking
  async handleVdoCipherExistingVideo(data, videoLessonId) {
    try {
      //console.log(`🔗 Linking existing VdoCipher video: ${data.videoId}`);
      
      if (!data.videoId) {
        throw new Error('Video ID is required for existing video linking');
      }

      // Use the VdoCipherService to link existing video
      const linkedVideoData = await VdoCipherService.linkExistingVideoSimple(data.videoId, {
        lessonId: data.lessonId,
        title: data.title,
        description: data.description,
        quality: data.quality,
        userId: data.uploadedBy
      });

      //console.log('✅ VdoCipher video linked successfully:', linkedVideoData);

      return {
        videoId: linkedVideoData.videoId,
        secureUrl: linkedVideoData.secureUrl,
        embedUrl: linkedVideoData.embedUrl,
        thumbnail: linkedVideoData.thumbnail,
        duration: linkedVideoData.duration,
        size: linkedVideoData.size,
        quality: linkedVideoData.quality,
        status: linkedVideoData.status,
        platform: 'videocypher',
        uploadMethod: 'existing_video_id',
        isLinked: true
      };

    } catch (error) {
      console.error('❌ Error linking existing VdoCipher video:', error.message);
      throw new Error(`Failed to link existing video: ${error.message}`);
    }
  }

async handleVideoCypherUpload(videoFilePath, data, videoLessonId) {
  if (!videoFilePath) {
    throw new Error("Video file path is required for VideoCypher upload");
  }

  if (!fs.existsSync(videoFilePath)) {
    throw new Error(`Video file not found at path: ${videoFilePath}`);
  }

  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastError = null;

  while (attempt < MAX_RETRIES) {
    try {
      //console.log(`🚀 Uploading to VideoCypher (attempt ${attempt + 1}/${MAX_RETRIES})`);

      const uploadResult = await videoCypherService.uploadVideo({
        file: { path: videoFilePath }, // Pass file path object
        title: data.title,
        description: data.description,
        folderId: process.env.VIDEOCYPHER_FOLDER_ID,
        timeout: 30 * 60 * 1000, // 30 minutes
        onProgress: (progress) => {
          //console.log(`Upload progress: ${progress}%`);
        },
      });

      //console.log("✅ VideoCypher uploadResult:", uploadResult);

      return {
        videoId: uploadResult.videoId,
        secureUrl: uploadResult.playbackUrl,
        thumbnail: uploadResult.thumbnail,
        platform: "videocypher",
        uploadMethod: "file"
      };
    } catch (error) {
      lastError = error;
      attempt++;

      if (error.response?.status === 524) {
        console.error(`⏳ Timeout on attempt ${attempt}. Retrying...`);
        if (attempt < MAX_RETRIES) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }
      }

      throw new Error(`Upload failed after ${attempt} attempts. Last error: ${lastError.message}`);
    }
  }
}


  async handleYouTubeUpload(data, videoLessonId) {
    try {
      if (!data.youtubeUrl) {
        throw new Error('YouTube URL is required');
      }

      const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!urlPattern.test(data.youtubeUrl)) {
        throw new Error('Invalid YouTube URL format');
      }

      const urlResult = await youtubeService.processYouTubeUrl({
        url: data.youtubeUrl,
        title: data.title,
        description: data.description,
        videoLessonId,
      });

      if (!urlResult || typeof urlResult !== 'object') {
        throw new Error('Failed to process YouTube URL: No result returned');
      }

      return {
        videoId: urlResult.videoId,
        secureUrl: urlResult.watchUrl,
        embedUrl: urlResult.embedUrl,
        originalUrl: data.youtubeUrl,
        thumbnail: urlResult.thumbnail,
        platform: 'youtube',
      };
    } catch (error) {
      console.error(`Error in handleYouTubeUpload: ${error.message}`, error);
      throw error;
    }
  }

  async handleVimeoUpload(data, videoLessonId) {
    try {
      const isEmbed = data.vimeoInputType === 'embed' || Boolean(data.vimeoEmbedCode && !data.vimeoUrl);
      const rawVimeoUrl = isEmbed
        ? (data.vimeoEmbedCode || data.vimeoUrl || data.secureUrl || data.url)
        : (data.vimeoUrl || data.secureUrl || data.url);
      const vimeoUrl = vimeoService.cleanVimeoUrl(rawVimeoUrl);
      if (!vimeoUrl) {
        throw new Error('Vimeo URL or embed code is required');
      }

      if (!vimeoService.validateVimeoUrl(vimeoUrl)) {
        throw new Error('Invalid Vimeo URL format');
      }

      const urlResult = await vimeoService.processVimeoUrl({
        url: vimeoUrl,
        title: data.title,
        description: data.description,
        videoLessonId,
      });

      if (!urlResult || typeof urlResult !== 'object') {
        throw new Error('Failed to process Vimeo URL: No result returned');
      }

      return {
        videoId: urlResult.videoId,
        secureUrl: urlResult.watchUrl,
        embedUrl: urlResult.embedUrl,
        originalUrl: vimeoUrl,
        thumbnail: urlResult.thumbnail,
        duration: urlResult.duration,
        platform: 'vimeo',
      };
    } catch (error) {
      console.error(`Error in handleVimeoUpload: ${error.message}`, error);
      throw error;
    }
  }

  async handleExternalLink(data, videoLessonId) {
    if (!data.secureUrl) {
      throw new Error('External URL is required for external link platform');
    }

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(data.secureUrl)) {
      throw new Error('Invalid URL format');
    }

    return {
      videoId: data.videoId || 'external',
      secureUrl: data.secureUrl,
      thumbnail: data.thumbnail || '',
      platform: 'external_link',
    };
  }

  async getVideoLessonById(id) {
    try {
      //console.log("Finding video lesson by ID:", id);

      const videoLesson = await videoLessonRepository.findById(id);

      if (!videoLesson) {
        throw new Error('Video lesson not found');
      }

      return {
        success: true,
        data: videoLesson,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getAllVideoLessons(filters = {}, options = {}) {
    try {
      const result = await videoLessonRepository.findAll(filters, options);

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getVideoLessonsByLessonId(lessonId) {
    try {
      if (!mongoose.isValidObjectId(lessonId)) {
        throw new Error('Invalid lesson ID format');
      }

      const videoLessons = await videoLessonRepository.findByLessonId(lessonId);

      return {
        success: true,
        data: videoLessons,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getVideoLessonsByPlatform(platform) {
    try {
      const validPlatforms = ['videocypher', 'youtube', 'vimeo', 'external_link'];

      if (!validPlatforms.includes(platform)) {
        throw new Error('Invalid source platform');
      }

      const videoLessons = await videoLessonRepository.findByPlatform(platform);

      return {
        success: true,
        data: videoLessons,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

 async updateVideoLesson(id, updateData, videoFilePath) {
  try {
    const videoLesson = await videoLessonRepository.findById(id);
    if (!videoLesson) throw new Error("Video lesson not found");

    const targetPlatform = updateData.sourcePlatform || videoLesson.sourcePlatform;

    // Handle Vimeo video updates
    if (targetPlatform === "vimeo" && (updateData.vimeoUrl || updateData.vimeoEmbedCode || updateData.sourcePlatform === "vimeo" || updateData.secureUrl)) {
      const isEmbed = updateData.vimeoInputType === 'embed' || Boolean(updateData.vimeoEmbedCode && !updateData.vimeoUrl);
      const rawVimeoUrl = isEmbed
        ? (updateData.vimeoEmbedCode || updateData.vimeoUrl || updateData.secureUrl || updateData.originalUrl)
        : (updateData.vimeoUrl || updateData.secureUrl || updateData.originalUrl);

      const vimeoUrl = vimeoService.cleanVimeoUrl(rawVimeoUrl);
      if (vimeoUrl) {
        if (!vimeoService.validateVimeoUrl(vimeoUrl)) {
          throw new Error('Invalid Vimeo URL format');
        }
        const urlResult = await vimeoService.processVimeoUrl({
          url: vimeoUrl,
          title: updateData.title || videoLesson.title,
          description: updateData.description || videoLesson.description,
          videoLessonId: videoLesson.lessonId,
        });

        updateData.secureUrl = urlResult.watchUrl;
        updateData.embedUrl = urlResult.embedUrl;
        updateData.originalUrl = vimeoUrl;
        if (isEmbed) {
          updateData.vimeoEmbedCode = updateData.vimeoEmbedCode || vimeoUrl;
          updateData.vimeoUrl = '';
          updateData.vimeoInputType = 'embed';
        } else {
          updateData.vimeoUrl = vimeoUrl;
          updateData.vimeoEmbedCode = '';
          updateData.vimeoInputType = 'direct';
        }
        updateData.videoId = urlResult.videoId;
        if (urlResult.thumbnail) updateData.thumbnail = urlResult.thumbnail;
        if (urlResult.duration) updateData.duration = urlResult.duration;
        updateData.status = "ready";
        updateData.sourcePlatform = "vimeo";
      }
    }
    // Handle YouTube video updates
    else if (targetPlatform === "youtube" && (updateData.youtubeUrl || updateData.sourcePlatform === "youtube" || updateData.secureUrl)) {
      const youtubeUrl = updateData.youtubeUrl || updateData.secureUrl || updateData.originalUrl;
      if (youtubeUrl) {
        const urlResult = await youtubeService.processYouTubeUrl({
          url: youtubeUrl,
          title: updateData.title || videoLesson.title,
          description: updateData.description || videoLesson.description,
          videoLessonId: videoLesson.lessonId,
        });

        if (urlResult) {
          updateData.secureUrl = urlResult.watchUrl;
          updateData.embedUrl = urlResult.embedUrl;
          updateData.originalUrl = youtubeUrl;
          updateData.youtubeUrl = youtubeUrl;
          updateData.videoId = urlResult.videoId;
          if (urlResult.thumbnail) updateData.thumbnail = urlResult.thumbnail;
          updateData.status = "ready";
          updateData.sourcePlatform = "youtube";
        }
      }
    }
    // Handle VdoCipher video updates
    else if (targetPlatform === "videocypher") {
      // Check if updating with existing video ID
      if (updateData.uploadMethod === 'existing_video_id' && updateData.videoId) {
        //console.log(`🔗 Updating with existing VdoCipher video: ${updateData.videoId}`);
        
        const linkedVideoData = await VdoCipherService.linkExistingVideoSimple(updateData.videoId, {
          lessonId: videoLesson.lessonId,
          title: updateData.title || videoLesson.title,
          description: updateData.description || videoLesson.description,
          quality: updateData.quality || videoLesson.quality,
          userId: updateData.uploadedBy || videoLesson.uploadedBy
        });

        updateData.secureUrl = linkedVideoData.secureUrl;
        updateData.embedUrl = linkedVideoData.embedUrl;
        updateData.videoId = linkedVideoData.videoId;
        updateData.thumbnail = linkedVideoData.thumbnail;
        updateData.status = linkedVideoData.status;
        updateData.uploadMethod = 'existing_video_id';
        updateData.duration = linkedVideoData.duration;
        updateData.size = linkedVideoData.size;
        updateData.quality = linkedVideoData.quality;
      }
      // Handle file replacement
      else if (videoFilePath) {
        if (!fs.existsSync(videoFilePath)) {
          throw new Error(`Video file not found at path: ${videoFilePath}`);
        }

        // Delete old video if it exists
        if (videoLesson.videoId) {
          try {
            await videoCypherService.deleteVideo(videoLesson.videoId);
          } catch (e) {
            console.warn("Delete failed, continuing:", e.message);
          }
        }

        const uploadResult = await videoCypherService.uploadVideo({
          file: { path: videoFilePath },
          title: updateData.title || videoLesson.title,
          description: updateData.description || videoLesson.description,
          folderId: process.env.VIDEOCYPHER_FOLDER_ID,
        });

        updateData.secureUrl = uploadResult.playbackUrl;
        updateData.videoId = uploadResult.videoId;
        updateData.thumbnail = uploadResult.thumbnail || "";
        updateData.status = "ready";
        updateData.uploadMethod = "file";
      }
    } else {
      //console.log(`ℹ️ No new video file provided for update`);
    }

    updateData.updatedAt = new Date();

    //console.log(`💾 Updating video lesson in repository with data:`, updateData);
    const updatedVideoLesson = await videoLessonRepository.updateById(id, updateData);
    //console.log(`✅ Video lesson updated successfully:`, updatedVideoLesson);

    return {
      success: true,
      data: updatedVideoLesson,
      message: 'Video lesson updated successfully'
    };
  } catch (error) {
    console.error('❌ Error in updateVideoLesson:', error.message, error);
    return {
      success: false,
      error: error.message
    };
  }
}

  async deleteVideoLesson(id) {
    try {
      if (!mongoose.isValidObjectId(id)) {
        throw new Error('Invalid video lesson ID format');
      }

      const exists = await videoLessonRepository.exists(id);
      if (!exists) {
        throw new Error('Video lesson not found');
      }

      await videoLessonRepository.deleteById(id);

      return {
        success: true,
        message: 'Video lesson deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateVideoStatus(id, status) {
    try {
      if (!mongoose.isValidObjectId(id)) {
        throw new Error('Invalid video lesson ID format');
      }

      const validStatuses = ['processing', 'ready', 'failed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const exists = await videoLessonRepository.exists(id);
      if (!exists) {
        throw new Error('Video lesson not found');
      }

      const updatedVideoLesson = await videoLessonRepository.updateStatus(id, status);

      return {
        success: true,
        data: updatedVideoLesson,
        message: 'Video status updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getVideoLessonsByStatus(status) {
    try {
      const validStatuses = ['processing', 'ready', 'failed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const videoLessons = await videoLessonRepository.findByStatus(status);

      return {
        success: true,
        data: videoLessons,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new VideoLessonService();