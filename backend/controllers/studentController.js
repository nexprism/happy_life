import UserService from "../service/userService.js";
import ProjectAnalyticsService from "../service/ProjectAnalyticsService.js";
import CourseEnrollment from "../models/CourseEnrollment.js";
import Course from "../models/Course.js";
import CoursePlan from "../models/CoursePlan.js";
import CourseChatRoom from "../models/CourseChatRoom.js";
import { initRedis } from "../config/redisClient.js";
import User from "../models/user.js";
import xlsx from "xlsx";
import bcrypt from "bcryptjs";

const userService = new UserService();

export const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search?.trim();
    const filter = { role: 'student' };

    // ✅ Parse filters from query (JSON string)
    if (req.query.filters) {
      const parsedFilters = JSON.parse(req.query.filters);

      if (typeof parsedFilters.isActive !== "undefined") {
        // Convert string to boolean if needed
        filter.isActive =
          parsedFilters.isActive === "true" || parsedFilters.isActive === true;
      }

      // Add any other parsed filters (optional)
      if (parsedFilters.status) {
        filter.status = parsedFilters.status;
      }
    }

    // 🔍 Field-based searches
    if (req.query.fullName) {
      filter.fullName = { $regex: req.query.fullName, $options: 'i' };
    }
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: 'i' };
    }
    if (req.query.phone) {
      filter.phone = { $regex: req.query.phone, $options: 'i' };
    }

    // 🔍 General search
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { createdAt: -1 };

    const { users, total } = await userService.getAllUsers(page, limit, filter, sort);

    return res.status(200).json({
      success: true,
      message: "✅ Students fetched successfully",
      data: {
        students: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      err: {}
    });
  } catch (error) {
    console.error("❌ Error in getAllStudents:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      data: {},
      err: error.message
    });
  }
};



export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await userService.getUserById(id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        data: {},
        err: {}
      });
    }

    // Fetch enrollments from CourseEnrollment collection
    const enrollments = await CourseEnrollment.find({ userId: student._id })
      .populate('courseId') // <-- Correct field name
      .lean();

    // Map enrollments to include accessExpiry and enrolledAt, and rename courseId to course
    const mappedEnrollments = enrollments.map(enrollment => ({
      ...enrollment,
      course: enrollment.courseId, // expose as 'course'
      accessExpiry: enrollment.accessExpiry,
      enrolledAt: enrollment.enrolledAt || enrollment.createdAt,
    }));

    // Attach mapped enrollments to student object
    const studentObj = student.toObject ? student.toObject() : student;
    studentObj.enrollments = mappedEnrollments;

    // Attach latest personality test result
    let personality = null;
    try {
      const PersonalitySubmission = (await import('../models/PersonalitySubmission.js')).default;
      personality = await PersonalitySubmission.findOne({ userId: student._id }).sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.error('Error fetching personality submission:', e);
    }
    studentObj.personality = personality ? {
      resultType: personality.resultType,
      scores: personality.scores,
      createdAt: personality.createdAt
    } : null;

    return res.status(200).json({
      success: true,
      message: '✅ Student fetched successfully',
      data: { student: studentObj },
      err: {}
    });
  } catch (error) {
    console.error("❌ Error in getStudentById:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
      data: {},
      err: error.message
    });
  }
};

export const updateStudentByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      name,
      email,
      phone,
      password,
      bio,
      location,
      address,
      company,
      isActive,
      status,
      emailVerified,
      mobileVerified,
    } = req.body;

    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student / User not found",
      });
    }

    // Check unique email if changing
    const newEmail = email ? email.trim().toLowerCase() : null;
    if (newEmail && newEmail !== student.email) {
      const emailExists = await User.findOne({ email: newEmail, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use by another account",
        });
      }
      student.email = newEmail;
    }

    // Name update
    if (fullName !== undefined) {
      student.fullName = fullName.trim();
    } else if (name !== undefined) {
      student.fullName = name.trim();
    }

    // Phone update
    if (phone !== undefined) {
      student.phone = typeof phone === "string" ? phone.trim() : phone;
    }

    // Password update
    if (password && typeof password === "string" && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password.trim(), salt);
      student.passwordChangedAt = new Date();
      student.sessionVersion = (student.sessionVersion || 0) + 1;
    }

    // Bio & Location
    if (bio !== undefined) student.bio = typeof bio === "string" ? bio.trim() : bio;
    if (location !== undefined) student.location = typeof location === "string" ? location.trim() : location;

    // Address
    if (address && typeof address === "object") {
      student.address = {
        ...(student.address || {}),
        ...address,
      };
    }

    // Company & GST
    if (company && typeof company === "object") {
      student.company = {
        name: company.name !== undefined ? company.name : student.company?.name,
        gstNumber: company.gstNumber !== undefined ? company.gstNumber : student.company?.gstNumber,
      };
    }

    // Status & verification flags
    if (typeof isActive === "boolean") {
      student.isActive = isActive;
    }
    if (status && ["active", "inactive"].includes(status)) {
      student.status = status;
    }
    if (typeof emailVerified === "boolean") {
      student.emailVerified = emailVerified;
    }
    if (typeof mobileVerified === "boolean") {
      student.mobileVerified = mobileVerified;
    }

    await student.save();

    const updatedStudent = student.toObject();
    delete updatedStudent.password;
    delete updatedStudent.passwordResetToken;

    return res.status(200).json({
      success: true,
      message: "Student details updated successfully",
      data: { student: updatedStudent },
    });
  } catch (error) {
    console.error("❌ Error in updateStudentByAdmin:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update student details",
    });
  }
};

export const getStudentAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await ProjectAnalyticsService.getStudentAnalytics(id);
    if (analytics.error) {
      return res.status(404).json({
        success: false,
        message: analytics.error,
        data: {},
        err: {}
      });
    }
    return res.status(200).json({
      success: true,
      message: "✅ Student analytics fetched successfully",
      data: analytics,
      err: {}
    });
  } catch (error) {
    console.error("❌ Error in getStudentAnalytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student analytics",
      data: {},
      err: error.message
    });
  }
};

export const bulkImportStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload a .xlsx, .xls, or .csv file.",
      });
    }

    let workbook;
    if (req.file.buffer) {
      workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    } else if (req.file.path) {
      workbook = xlsx.readFile(req.file.path);
    } else {
      return res.status(400).json({ success: false, message: "Unable to read uploaded file." });
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ success: false, message: "Uploaded Excel workbook has no sheets." });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: "Excel sheet is empty. Please provide student rows." });
    }

    const created = [];
    const enrolled = [];
    const skipped = [];
    const errors = [];

    // Course cache to avoid querying DB for the same course on every row
    const courseCache = new Map();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const fullName = (
        row["Name"] || row["name"] || row["Full Name"] || row["fullName"] || row["Student Name"] || ""
      ).toString().trim();

      const rawEmail = (
        row["Email"] || row["email"] || row["EMAIL"] ||
        row["E- mail"] || row["E-mail"] || row["e-mail"] || ""
      ).toString().trim();

      let rawPhone = (
        row["Phone"] || row["phone"] || row["Phone No"] || row["Mobile"] || row["mobile"] ||
        row["Contact -No."] || row["Contact-No."] || row["Contact No."] || row["Contact No"] ||
        row["Contact"] || row["contact"] || ""
      ).toString().trim();

      // Normalize exponential format if present (e.g. 4.47901E+11)
      if (rawPhone && rawPhone.toLowerCase().includes("e+")) {
        const num = Number(rawPhone);
        if (!isNaN(num)) {
          rawPhone = BigInt(Math.round(num)).toString();
        }
      }

      const rawPassword = (
        row["Password"] || row["password"] || row["PASS"] || row["Pass"] || "happylife@123"
      ).toString().trim();

      const courseName = (
        row["Course"] || row["course"] || row["Course Name"] || row["courseName"] ||
        row["Course Title"] || row["courseTitle"] || ""
      ).toString().trim();

      if (!rawEmail || !rawEmail.includes("@")) {
        errors.push({ row: i + 2, reason: "Invalid or missing email" });
        continue;
      }

      const email = rawEmail.toLowerCase();
      const name = fullName || email.split("@")[0] || "Student";

      try {
        // 1. Find or create user
        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
          const hashedPassword = await bcrypt.hash(rawPassword, 10);
          user = await User.create({
            fullName: name,
            email,
            password: hashedPassword,
            phone: rawPhone || undefined,
            role: "student",
            is_verify: true,
            emailVerified: true,
            isActive: true,
          });
          isNewUser = true;
          created.push({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
          });
        } else if (!courseName) {
          skipped.push({ email, name, reason: "User with this email already exists" });
          continue;
        }

        // 2. If Course column is provided, enroll user into the course
        if (courseName) {
          let courseData = courseCache.get(courseName.toLowerCase());

          if (!courseData && !courseCache.has(courseName.toLowerCase())) {
            const course = await Course.findOne({
              $or: [
                { title: { $regex: new RegExp(`^${courseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
                { slug: courseName.toLowerCase().replace(/[^a-z0-9]+/g, "-") }
              ]
            }).lean();

            let plan = null;
            if (course) {
              plan = await CoursePlan.findOne({ courseId: course._id, status: "active" }).lean() ||
                     await CoursePlan.findOne({ courseId: course._id }).lean();
            }

            courseData = course ? { course, plan } : null;
            courseCache.set(courseName.toLowerCase(), courseData);
          }

          if (!courseData || !courseData.course) {
            errors.push({ row: i + 2, email, reason: `Course "${courseName}" not found in system` });
            continue;
          }

          const { course, plan } = courseData;
          const courseId = course._id;
          const userId = user._id;

          // Non-lifetime access expiry calculation
          let accessExpiry = new Date();
          if (plan && plan.duration && plan.durationType) {
            const durType = plan.durationType.toLowerCase();
            const dur = Number(plan.duration) || 1;
            if (durType.includes("year")) accessExpiry.setFullYear(accessExpiry.getFullYear() + dur);
            else if (durType.includes("month")) accessExpiry.setMonth(accessExpiry.getMonth() + dur);
            else if (durType.includes("day")) accessExpiry.setDate(accessExpiry.getDate() + dur);
            else accessExpiry.setFullYear(accessExpiry.getFullYear() + 1);
          } else {
            accessExpiry.setFullYear(accessExpiry.getFullYear() + 1); // Default 1 year non-lifetime access
          }

          const existingEnrollment = await CourseEnrollment.findOne({ userId, courseId });

          if (existingEnrollment) {
            const isExpired = existingEnrollment.accessExpiry && existingEnrollment.accessExpiry < new Date();
            if (existingEnrollment.status === "active" && !isExpired) {
              enrolled.push({ email, course: course.title, status: "already_active" });
            } else {
              // Reactivate / Renew
              await CourseEnrollment.findByIdAndUpdate(existingEnrollment._id, {
                status: "active",
                enrolledAt: new Date(),
                accessType: "limited",
                accessExpiry,
                coursePlanId: plan?._id || existingEnrollment.coursePlanId,
                enrollmentSource: "import"
              });
              enrolled.push({ email, course: course.title, status: "renewed" });
            }
          } else {
            // Create fresh enrollment
            await CourseEnrollment.create({
              userId,
              courseId,
              coursePlanId: plan?._id || undefined,
              type: plan ? "coursePlan" : "course",
              status: "active",
              accessType: "limited",
              accessExpiry,
              enrollmentSource: "import",
              enrolledAt: new Date()
            });

            await Course.findByIdAndUpdate(courseId, {
              $addToSet: { enrolledStudents: userId },
              $inc: { enrolledStudentsCount: 1 }
            });

            await User.findByIdAndUpdate(userId, {
              $addToSet: { enrolledCourses: courseId }
            });

            enrolled.push({
              email,
              course: course.title,
              status: isNewUser ? "created_and_enrolled" : "enrolled"
            });
          }

          // Grant community chat room access if available
          try {
            const chatRoom = await CourseChatRoom.findOne({ courseId });
            if (chatRoom && !chatRoom.participants.map(String).includes(String(userId))) {
              chatRoom.participants.push(userId);
              await chatRoom.save();
            }
          } catch (_) {}
        }
      } catch (rowErr) {
        errors.push({ row: i + 2, email, reason: rowErr.message });
      }
    }

    // Invalidate Redis cache for enrollments if any enrollment happened
    if (enrolled.length > 0) {
      try {
        const redis = await initRedis();
        await redis.del("enrollments:all*");
      } catch (_) {}
    }

    return res.status(200).json({
      success: true,
      message: `Bulk import completed: ${created.length} students created, ${enrolled.length} course enrollments processed, ${skipped.length} skipped, ${errors.length} failed.`,
      students: created,
      details: {
        createdCount: created.length,
        enrolledCount: enrolled.length,
        skippedCount: skipped.length,
        errorCount: errors.length,
        enrolled,
        skipped,
        errors,
      },
    });
  } catch (error) {
    console.error("❌ Error in bulkImportStudents:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process bulk student import",
    });
  }
};
