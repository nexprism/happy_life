import LessonProgress from '../models/LessonProgress.js';
import mongoose from 'mongoose';
import CourseEnrollment from '../models/CourseEnrollment.js'

class ProgressRepository {
  async findByUserAndLesson(userId, lessonId) {
    try {
      return await LessonProgress.findOne({ userId, lessonId })
        .populate('userId', 'email username')
        .populate('lessonId', 'title duration')
        .populate('courseId', 'title');
    } catch (error) {
      throw new Error(`Failed to find progress: ${error.message}`);
    }
  }

  async createProgress(progressData) {
    try {
      const progress = new LessonProgress(progressData);
      return await progress.save();
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error - progress already exists, update instead
        return await this.updateProgress(progressData.userId, progressData.lessonId, progressData);
      }
      throw new Error(`Failed to create progress: ${error.message}`);
    }
  }

  async updateProgress(userId, lessonId, courseId, updateData) {
    try {
      // Set last video played and update enrollment
      if (courseId) {
        await CourseEnrollment.findOneAndUpdate(
          { userId, courseId },
          { 
            lastVideoPlayed: lessonId,
            ...(updateData.completed && { $addToSet: { completedLessons: lessonId } })
          },
          { new: true }
        ).catch(() => {});
      }

      const progress = await LessonProgress.findOneAndUpdate(
        { userId, lessonId, ...(courseId && { courseId }) },
        { 
          ...updateData,
          lastUpdatedAt: new Date()
        },
        { 
          new: true, 
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      // If lesson completed, award XP
      if (updateData.completed || (updateData.progressPercentage && updateData.progressPercentage >= 80)) {
        try {
          const { updateLeaderboard } = await import('../service/leaderboardService.js');
          await updateLeaderboard({
            userId,
            action: 'complete_lesson',
            referenceType: 'lesson',
            referenceId: lessonId,
            remark: 'Lesson completed'
          }).catch(() => {});
        } catch (e) {}
      }

      return progress;
    } catch (error) {
      throw new Error(`Failed to update progress: ${error.message}`);
    }
  }

  async markCompleted(userId, lessonId, completionData = {}) {
    try {
      const courseId = completionData.courseId;
      const progress = await LessonProgress.findOneAndUpdate(
        { userId, lessonId },
        {
          $set: {
            completed: true,
            completedAt: new Date(),
            completionPercentage: completionData.completionPercentage || 100,
            progressPercentage: completionData.completionPercentage || 100,
            ...(completionData.watchTime && { 
              watchTime: completionData.watchTime 
            }),
            lastUpdatedAt: new Date()
          },
          $setOnInsert: {
            ...(courseId && { courseId }),
            videoType: 'direct'
          }
        },
        { 
          new: true, 
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      if (courseId) {
        await CourseEnrollment.findOneAndUpdate(
          { userId, courseId },
          { 
            $addToSet: { completedLessons: lessonId },
            $set: { lastVideoPlayed: lessonId }
          }
        ).catch(() => {});
      }

      try {
        const { updateLeaderboard } = await import('../service/leaderboardService.js');
        await updateLeaderboard({
          userId,
          action: 'complete_lesson',
          referenceType: 'lesson',
          referenceId: lessonId,
          remark: 'Lesson completed'
        }).catch(() => {});
      } catch (e) {}

      return progress;
    } catch (error) {
      throw new Error(`Failed to mark as completed: ${error.message}`);
    }
  }

  async getCourseProgress(userId, courseId) {
  try {
    const progress = await LessonProgress.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          courseId: new mongoose.Types.ObjectId(courseId)
        }
      },
      // JOIN with lessons
      {
        $lookup: {
          from: 'lessons', // your Lesson collection name in lowercase plural
          localField: 'lessonId',
          foreignField: '_id',
          as: 'lesson'
        }
      },
      {
        $unwind: {
          path: '$lesson',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$courseId',
          totalLessons: { $sum: 1 },
          completedLessons: {
            $sum: {
              $cond: [{ $eq: ['$completed', true] }, 1, 0]
            }
          },
          totalWatchTime: { $sum: '$watchTime' },
          averageProgress: { $avg: '$progressPercentage' },
          lessons: {
            $push: {
              lessonId: '$lessonId',
              progressPercentage: '$progressPercentage',
              completed: '$completed',
              watchTime: '$watchTime',
              lastPosition: '$lastPosition',
              lessonTitle: '$lesson.title',
              lessonType: '$lesson.type',
              moduleId: '$lesson.moduleId'
            }
          }
        }
      },
      {
        $addFields: {
          courseCompletionPercentage: {
            $cond: [
              { $eq: ['$totalLessons', 0] },
              0,
              {
                $multiply: [
                  { $divide: ['$completedLessons', '$totalLessons'] },
                  100
                ]
              }
            ]
          }
        }
      }
    ]);

    return progress[0] || {
      totalLessons: 0,
      completedLessons: 0,
      totalWatchTime: 0,
      averageProgress: 0,
      courseCompletionPercentage: 0,
      lessons: []
    };
  } catch (error) {
    console.error('Error in getCourseProgress:', error);
    throw new Error(`Failed to get course progress: ${error.message}`);
  }
}


  async getUserProgress(userId, options = {}) {
    try {
      const { page = 1, limit = 50, courseId, completed } = options;
      const skip = (page - 1) * limit;

      const query = { userId };
      if (courseId) query.courseId = courseId;
      if (completed !== undefined) query.completed = completed;

      const [progress, total] = await Promise.all([
        LessonProgress.find(query)
          .populate('courseId', 'title thumbnail')
          .populate('lessonId', 'title duration order')
          .sort({ lastUpdatedAt: -1 })
          .skip(skip)
          .limit(limit),
        LessonProgress.countDocuments(query)
      ]);

      return {
        progress,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user progress: ${error.message}`);
    }
  }

  async getProgressBySession(sessionId) {
    try {
      return await LessonProgress.findOne({ sessionId })
        .populate('userId', 'email username')
        .populate('lessonId', 'title duration')
        .populate('courseId', 'title');
    } catch (error) {
      throw new Error(`Failed to find progress by session: ${error.message}`);
    }
  }

  async getRecentProgress(userId, limit = 10) {
    try {
      return await LessonProgress.find({ userId })
        .populate('courseId', 'title thumbnail')
        .populate('lessonId', 'title duration')
        .sort({ lastUpdatedAt: -1 })
        .limit(limit);
    } catch (error) {
      throw new Error(`Failed to get recent progress: ${error.message}`);
    }
  }

  async deleteProgress(userId, lessonId) {
    try {
      return await LessonProgress.findOneAndDelete({ userId, lessonId });
    } catch (error) {
      throw new Error(`Failed to delete progress: ${error.message}`);
    }
  }

  async getProgressStats(userId) {
    try {
      const stats = await LessonProgress.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalLessons: { $sum: 1 },
            completedLessons: { 
              $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
            },
            totalWatchTime: { $sum: '$watchTime' },
            averageProgress: { $avg: '$progressPercentage' },
            coursesInProgress: { $addToSet: '$courseId' }
          }
        },
        {
          $addFields: {
            totalCourses: { $size: '$coursesInProgress' },
            overallCompletionRate: {
              $cond: [
                { $eq: ['$totalLessons', 0] },
                0,
                {
                  $multiply: [
                    { $divide: ['$completedLessons', '$totalLessons'] },
                    100
                  ]
                }
              ]
            }
          }
        }
      ]);

      return stats[0] || {
        totalLessons: 0,
        completedLessons: 0,
        totalWatchTime: 0,
        averageProgress: 0,
        totalCourses: 0,
        overallCompletionRate: 0
      };
    } catch (error) {
      throw new Error(`Failed to get progress stats: ${error.message}`);
    }
  }
}

export default new ProgressRepository();
