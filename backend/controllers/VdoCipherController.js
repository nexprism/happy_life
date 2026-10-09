import VdoCipherService from '../service/VdoCipherService.js';
import SecurityService from '../service/SecurityService.js';
import Enrollment from '../models/Enrollment.js';
import CourseEnrollment from '../models/CourseEnrollment.js';
import Lesson from '../models/Lesson.js';

class VdoCipherController {
    async generatePlayback(req, res) {
        try {
            const { courseId } = req.params;
            const { lessonId, videoId } = req.body;
            const userId = req?.user?._id;
            const userEmail = req?.user?.email;
            const userRole = req?.user?.role;

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
            if (!isPrivileged && courseId) {
                // Check if lesson is free preview
                let isFreeAccess = false;
                if (lessonId) {
                    const lesson = await Lesson.findById(lessonId).select('accessibility').lean();
                    if (lesson && lesson.accessibility === 'free') {
                        isFreeAccess = true;
                    }
                }

                if (!isFreeAccess) {
                    // Verify active enrollment in Enrollment or CourseEnrollment
                    const now = new Date();
                    const activeEnrollment = await Enrollment.findOne({
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
                        status: 'active'
                    }).lean();

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