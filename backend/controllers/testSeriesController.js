import TestSeries from "../models/TestSeries.js";
import TestSeriesAttempt from "../models/TestSeriesAttempt.js";
import TestSeriesSubmission from "../models/TestSeriesSubmission.js";
import Order from "../models/Order.js";
import User from "../models/user.js";
import Setting from "../models/setting.js";
import { generateOrderNumber } from "../utils/generateOrderNo.js";
import axios from 'axios';
import crypto from 'crypto';
import { getRazorpayKeys, verifyRazorpaySignature } from "../config/razorpay.js";

// GET /api/test-series - Fetch all active test series for the app
export const getTestSeriesList = async (req, res) => {
  try {
    const testSeries = await TestSeries.find({ isActive: true })
      .select('title description price totalMarks timeLimit level passMark coverImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, testSeries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/test-series/admin/list - Fetch all test series for admin
export const getAdminTestSeriesList = async (req, res) => {
  try {
    const testSeries = await TestSeries.find({})
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, testSeries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/test-series/:id - Fetch a specific test series by ID
export const getTestSeriesById = async (req, res) => {
  try {
    const testSeries = await TestSeries.findById(req.params.id);
    if (!testSeries) {
      return res.status(404).json({ success: false, message: 'Test Series not found' });
    }
    res.status(200).json({ success: true, testSeries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/test-series - Create a new test series (Admin only)
export const createTestSeries = async (req, res) => {
  try {
    const testSeriesData = { ...req.body };
    if (testSeriesData.isActive !== undefined) {
      testSeriesData.isActive = testSeriesData.isActive === 'true' || testSeriesData.isActive === true;
    }
    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
      testSeriesData.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
    }
    if (testSeriesData.quizData) {
      try {
        const parsedQuiz = JSON.parse(testSeriesData.quizData);
        if (parsedQuiz.sections) {
          testSeriesData.sections = parsedQuiz.sections;
        }
      } catch (e) {
        console.error("Error parsing quizData", e);
      }
    }
    const testSeries = new TestSeries(testSeriesData);
    await testSeries.save();
    res.status(201).json({ success: true, testSeries });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/test-series/:id - Update a test series (Admin only)
export const updateTestSeries = async (req, res) => {
  try {
    const testSeriesData = { ...req.body };
    if (testSeriesData.isActive !== undefined) {
      testSeriesData.isActive = testSeriesData.isActive === 'true' || testSeriesData.isActive === true;
    }
    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
      testSeriesData.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
    }
    if (testSeriesData.quizData) {
      try {
        const parsedQuiz = JSON.parse(testSeriesData.quizData);
        if (parsedQuiz.sections) {
          testSeriesData.sections = parsedQuiz.sections;
        }
      } catch (e) {
        console.error("Error parsing quizData", e);
      }
    }
    const testSeries = await TestSeries.findByIdAndUpdate(req.params.id, testSeriesData, { new: true, runValidators: true });
    if (!testSeries) {
      return res.status(404).json({ success: false, message: 'Test Series not found' });
    }
    res.status(200).json({ success: true, testSeries });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/test-series/:id - Delete a test series (Admin only)
export const deleteTestSeries = async (req, res) => {
  try {
    const testSeries = await TestSeries.findByIdAndDelete(req.params.id);
    if (!testSeries) {
      return res.status(404).json({ success: false, message: 'Test Series not found' });
    }
    res.status(200).json({ success: true, message: 'Test Series deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startTestSeries = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    let attempt = await TestSeriesAttempt.findOne({ user: userId, testSeries: id, status: 'in_progress' });
    if (!attempt) {
      attempt = new TestSeriesAttempt({
        user: userId,
        testSeries: id,
        startedAt: new Date()
      });
      await attempt.save();
    }
    res.status(200).json({ success: true, message: 'Test Series started', data: attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitTestSeries = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;
    const userId = req.user._id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers are required and must be an array' });
    }

    const testSeries = await TestSeries.findById(id);
    if (!testSeries) return res.status(404).json({ success: false, message: 'Test Series not found' });

    let totalQuestions = 0;
    const questionMap = new Map();
    
    testSeries.sections.forEach(section => {
      totalQuestions += section.questions.length;
      section.questions.forEach(question => {
        questionMap.set(question.question, question);
      });
    });

    const totalMarks = testSeries.totalMarks || totalQuestions;
    const marksPerQuestion = totalQuestions > 0 ? totalMarks / totalQuestions : 1;

    let score = 0;
    let totalCorrectQuestions = 0;
    let totalWrongQuestions = 0;
    const submissionAnswers = [];

    for (const answer of answers) {
      const question = questionMap.get(answer.question);
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedOption;
        if (isCorrect) {
          score += marksPerQuestion;
          totalCorrectQuestions += 1;
        } else {
          totalWrongQuestions += 1;
        }
        submissionAnswers.push({
          question: answer.question,
          selectedOption: answer.selectedOption
        });
      } else {
        totalWrongQuestions += 1;
      }
    }

    const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
    
    let calculatedTimeTaken = timeTaken || 0;
    const attempt = await TestSeriesAttempt.findOne({ user: userId, testSeries: id, status: 'in_progress' }).sort({ createdAt: -1 });
    if (attempt) {
      if (!calculatedTimeTaken || calculatedTimeTaken === 0) {
        calculatedTimeTaken = Math.floor((new Date() - attempt.startedAt) / 1000);
      }
      attempt.status = 'completed';
      await attempt.save();
    }

    await TestSeriesSubmission.deleteMany({ user: userId, testSeries: id });

    const submissionData = {
      user: userId,
      testSeries: id,
      answers: submissionAnswers,
      score,
      totalMarks,
      passed: score >= testSeries.passMark,
      is_completed: score >= testSeries.passMark,
      totalQuestions,
      totalCorrectQuestions,
      totalWrongQuestions,
      percentage,
      timeTaken: calculatedTimeTaken,
      submittedAt: new Date()
    };

    const submission = await TestSeriesSubmission.create(submissionData);

    res.status(201).json({
      success: true,
      message: 'Test Series submitted successfully',
      data: {
        submissionId: submission._id,
        score: submission.score,
        totalMarks: submission.totalMarks,
        passed: submission.passed,
        is_completed: submission.is_completed,
        totalQuestions: submission.totalQuestions,
        totalCorrectQuestions: submission.totalCorrectQuestions,
        totalWrongQuestions: submission.totalWrongQuestions,
        percentage: submission.percentage,
        timeTaken: submission.timeTaken
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSubmittedTestSeries = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    const submission = await TestSeriesSubmission.findOne({ _id: submissionId, user: userId })
      .populate('testSeries', 'title')
      .lean();
      
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.status(200).json({ success: true, message: 'Submission fetched', data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const testSeriesCheckoutInit = async (req, res) => {
  try {
    const { testSeriesId } = req.body;
    const userId = req.user._id;

    const testSeries = await TestSeries.findById(testSeriesId);
    if (!testSeries || !testSeries.isActive) {
      return res.status(404).json({ success: false, message: 'Test Series not found or inactive' });
    }

    const user = await User.findById(userId);
    if (user.purchasedTestSeries && user.purchasedTestSeries.includes(testSeriesId)) {
      return res.status(400).json({ success: false, message: 'You have already purchased this Test Series.' });
    }

    const { keyId: apiKey, keySecret: apiSecret } = await getRazorpayKeys();

    const GST_RATE = await Setting.getGstRate().catch(() => 0.18);
    const tax = parseFloat((testSeries.price * GST_RATE).toFixed(2));
    const grandTotal = parseFloat((testSeries.price + tax).toFixed(2));
    const amountPaise = Math.round(grandTotal * 100);

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const rpResponse = await axios.post(
      "https://api.razorpay.com/v1/orders",
      { amount: amountPaise, currency: "INR" },
      { headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` } }
    );

    res.status(200).json({
      success: true,
      key: apiKey,
      orderId: rpResponse.data.id,
      amount: amountPaise,
      currency: "INR",
      testSeries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const testSeriesCheckoutVerify = async (req, res) => {
  try {
    const { testSeriesId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    const isValidSignature = await verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      return res.status(400).json({ success: false, message: "Payment verification failed: invalid signature" });
    }

    const testSeries = await TestSeries.findById(testSeriesId);
    if (!testSeries) {
      return res.status(404).json({ success: false, message: "Test Series not found" });
    }

    const GST_RATE = await Setting.getGstRate().catch(() => 0.18);
    const tax = parseFloat((testSeries.price * GST_RATE).toFixed(2));
    const grandTotal = parseFloat((testSeries.price + tax).toFixed(2));
    const orderNo = await generateOrderNumber();

    const order = new Order({
      orderNo,
      userId,
      items: [{
        testSeriesId: testSeries._id,
        type: 'testSeries',
        pricePaid: testSeries.price,
        currency: "INR"
      }],
      subTotal: testSeries.price,
      tax: tax,
      gstRate: GST_RATE,
      grandTotal: grandTotal,
      payment: {
        provider: 'razorpay',
        paymentIntent: razorpay_payment_id,
        status: 'paid'
      }
    });
    await order.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { purchasedTestSeries: testSeries._id }
    });

    res.status(200).json({ success: true, message: "Payment successful", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
