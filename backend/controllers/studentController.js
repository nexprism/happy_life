import UserService from "../service/userService.js";
import ProjectAnalyticsService from "../service/ProjectAnalyticsService.js";
import CourseEnrollment from "../models/CourseEnrollment.js"; // <-- Add this import
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
    const skipped = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const fullName = (row["Name"] || row["Full Name"] || row["fullName"] || row["Student Name"] || "").toString().trim();
      const rawEmail = (row["Email"] || row["email"] || row["EMAIL"] || "").toString().trim();
      const rawPhone = (row["Phone"] || row["phone"] || row["Phone No"] || row["Mobile"] || "").toString().trim();
      const rawPassword = (row["Password"] || row["password"] || "Student@123").toString().trim();

      if (!rawEmail || !rawEmail.includes("@")) {
        errors.push({ row: i + 2, reason: "Invalid or missing email" });
        continue;
      }

      const email = rawEmail.toLowerCase();
      const name = fullName || email.split("@")[0] || "Student";

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        skipped.push({ email, name, reason: "User with this email already exists" });
        continue;
      }

      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const newUser = await User.create({
        fullName: name,
        email,
        password: hashedPassword,
        phone: rawPhone || undefined,
        role: "student",
        is_verify: true,
        emailVerified: true,
        isActive: true,
      });

      created.push({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Bulk import completed: ${created.length} students created, ${skipped.length} skipped, ${errors.length} failed.`,
      students: created,
      details: {
        createdCount: created.length,
        skippedCount: skipped.length,
        errorCount: errors.length,
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
