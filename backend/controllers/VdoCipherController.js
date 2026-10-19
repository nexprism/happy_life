import VdoCipherService from '../service/VdoCipherService.js';
import SecurityService from '../service/SecurityService.js';
import Enrollment from '../models/Enrollment.js';
import CourseEnrollment from '../models/CourseEnrollment.js';
import Lesson from '../models/Lesson.js';
import VideoLesson from '../models/video.js';
import Module from '../models/Module.js';

class VdoCipherController {
    async generatePlayback(req, res) {
        try {
            const { courseId, videoId: paramVideoId } = req.params;
            const { lessonId, videoId: bodyVideoId } = req.body;
            const userId = req?.user?._id;
            const userEmail = req?.user?.email;
            const userRole = req?.user?.role;

            // Check if both params and body videoId are provided and mismatch
            if (paramVideoId && bodyVideoId && paramVideoId !== bodyVideoId) {
                return res.status(400).json({ success: false, error: 'Video ID mismatch between URL and body' });
            }

            const videoId = paramVideoId || bodyVideoId;

            // Check user security status
            const securityStatus = await SecurityService.checkUserSecurityStatus(userId);
            if (securityStatus.isBlocked) {
                return res.status(403).json({ 
                    success: false,
                    error: 'Access temporarily restricted due to security concerns' 
                });
            }

            // Validate required parameters
            if (!videoId) {
                return res.status(400).json({ success: false, error: 'Video ID is required' });
            }

            // Entitlement & Access Control Verification
            const isPrivileged = ['admin', 'super_admin', 'instructor'].includes(userRole);
            // Resolve the requested provider ID through our own records, never through
            // a client-selected free lesson. Keep lessonId optional for existing clients.
            if (!isPrivileged) {
                const records = await VideoLesson.find({
                    $or: [{ videoId }, { vdocipherVideoId: videoId }],
                    sourcePlatform: 'videocypher', isDeleted: { $ne: true }
                }).select('lessonId').lean();
                const modules = await Module.find({ courseId, isDeleted: { $ne: true } }).select('_id').lean();
                const lesson = await Lesson.findOne({
                    _id: lessonId ? { $eq: lessonId, $in: records.map(v => v.lessonId) } : { $in: records.map(v => v.lessonId) },
                    moduleId: { $in: modules.map(m => m._id) }, isActive: { $ne: false }
                }).select('accessibility').lean();
                if (!courseId || !lesson) {
                    return res.status(403).json({ success: false, error: 'Video does not belong to this course lesson.' });
                }
                req.authorizedVideoLesson = lesson;
            }
            if (!isPrivileged && courseId) {
                // Check if lesson is free preview and belongs to this course
                let isFreeAccess = false;
                if (req.authorizedVideoLesson) {
                    const lesson = req.authorizedVideoLesson;
                    if (lesson && String(lesson.accessibility).toLowerCase() === 'free') {
                        isFreeAccess = true;
                    }
                }

                if (!isFreeAccess) {
                    // Verify active enrollment in Enrollment or CourseEnrollment with valid expiry
                    const now = new Date();
                    let activeEnrollment = await Enrollment.findOne({
                        userId,
                        courseId,
                        isActive: true,
                        $or: [
                            { accessEnd: null },
                            { accessEnd: { $gte: now } }
                        ]
                    }).lean() || await CourseEnrollment.findOne({
                        userId,
                        courseId,
                        status: 'active',
                        $or: [
                            { accessExpiry: null },
                            { accessExpiry: { $gt: now } }
                        ]
                    }).lean();

                    if (activeEnrollment) {
                        const expiry = activeEnrollment.accessExpiry || activeEnrollment.accessEnd;
                        if (expiry && new Date(expiry) <= now) {
                            activeEnrollment = null;
                        }
                    }

                    if (!activeEnrollment) {
                        return res.status(403).json({
                            success: false,
                            error: 'Active enrollment is required to access this course video.'
                        });
                    }
                }
            }

            // Pass only analytics fields (no rtext type)
            const playbackData = await VdoCipherService.generatePlaybackData(
                videoId,
                userId,
                { userEmail, lessonId, courseId }
            );

            res.json({
                success: true,
                data: playbackData,
                message: 'Playback data generated successfully'
            });

        } catch (error) {
            console.error('Error generating VdoCipher playback:', error?.message);
            res.status(500).json({ 
                error: 'Failed to generate playback data',
                message: error.message 
            });
        }
    }

    async validateToken(req, res) {
        try {
            const { otp, playbackInfo } = req.body;
            const userId = req.user.id;

            // Basic validation
            if (!otp || !playbackInfo) {
                return res.status(400).json({ 
                    error: 'OTP and playback info are required' 
                });
            }

            // Here you could add additional token validation logic
            // For now, we'll just return success if the token exists

            res.json({
                success: true,
                valid: true,
                message: 'Token is valid'
            });

        } catch (error) {
            console.error('Error validating token:', error);
            res.status(500).json({ 
                error: 'Failed to validate token' 
            });
        }
    }
}

export default new VdoCipherController();
