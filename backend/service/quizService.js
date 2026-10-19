import fcmTokens from '../models/fcmTokens.js';
import QuizRepository from '../repository/quizRepository.js';
import NotificationService from "../utils/notificationService.js";
import QuizAttempt from '../models/QuizAttempt.js';
import QuizSubmission from '../models/QuizSubmission.js';
import User from '../models/user.js';

export default class QuizService {
  constructor() {
    this.quizRepository = new QuizRepository();
  }

  async createQuiz(data) {
    try {
      //console.log('QuizService: Creating quiz with data:', data);
      const createdQuiz = await this.quizRepository.create(data);
      //console.log('QuizService: Quiz created successfully:', createdQuiz);
      return createdQuiz;
    } catch (error) {
      console.error('QuizService: Error in createQuiz:', error);
      throw error;
    }
  }

  async getAllQuizzes(query) {
    try {
      return await this.quizRepository.findAll(query);
    } catch (error) {
      console.error('QuizService: Error in getAllQuizzes:', error);
      throw error;
    }
  }

  async getQuizById(id) {
    try {
      return await this.quizRepository.findById(id);
    } catch (error) {
      console.error('QuizService: Error in getQuizById:', error);
      throw error;
    }
  }

  async updateQuiz(id, data) {
    try {
      //console.log('QuizService: Updating quiz with ID:', id, 'and data:', data);
      return await this.quizRepository.update(id, data);
    } catch (error) {
      console.error('QuizService: Error in updateQuiz:', error);
      throw error;
    }
  }

  async deleteQuiz(id) {
    try {
      return await this.quizRepository.delete(id);
    } catch (error) {
      console.error('QuizService: Error in deleteQuiz:', error);
      throw error;
    }
  }

  async startQuiz(quizId, courseId, userId) {
    try {
      // Find or create active attempt
      let attempt = await QuizAttempt.findOne({ user: userId, quiz: quizId, status: 'in_progress' });
      if (!attempt) {
        attempt = new QuizAttempt({
          user: userId,
          quiz: quizId,
          course: courseId,
          startedAt: new Date()
        });
        await attempt.save();
      }
      return attempt;
    } catch (error) {
      console.error('QuizService: Error in startQuiz:', error);
      throw error;
    }
  }

async submitQuiz(quizId, userId, answers, timeTakenFrontend = 0) {
  try {
    //console.log('QuizService: Submitting quiz with ID:', quizId, 'for user:', userId);
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    let totalQuestions = 0;
    quiz.sections.forEach(section => {
      totalQuestions += section.questions.length;
    });

    // If quiz.totalMarks is defined, use it, otherwise default to totalQuestions
    const totalMarks = quiz.totalMarks || totalQuestions;
    const marksPerQuestion = totalQuestions > 0 ? totalMarks / totalQuestions : 1;

    let score = 0;
    let totalCorrectQuestions = 0;
    let totalWrongQuestions = 0;
    const submissionAnswers = [];

    const questionMap = new Map();
    quiz.sections.forEach(section => {
      section.questions.forEach(question => {
        questionMap.set(question.question, question);
      });
    });

    const seenQuestions = new Set();
    for (const answer of answers) {
      if (!answer || !answer.question) continue;
      const qKey = String(answer.question).trim();
      if (seenQuestions.has(qKey)) {
        continue;
      }
      seenQuestions.add(qKey);

      const question = questionMap.get(answer.question);
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedOption;

        if (isCorrect) {
          score += marksPerQuestion;
          totalCorrectQuestions += 1;
        } else if (answer.selectedOption !== null && answer.selectedOption !== undefined && answer.selectedOption !== '') {
          totalWrongQuestions += 1;
        }

        submissionAnswers.push({
          question: answer.question,
          selectedOption: answer.selectedOption
        });
      } else {
        console.warn(`Question not found: ${answer.question}`);
        totalWrongQuestions += 1;
      }
    }

    // Ensure score does not exceed totalMarks and percentage is bounded [0, 100]
    score = Math.min(score, totalMarks);
    const rawPercentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const percentage = Math.min(100, Math.max(0, Number(rawPercentage.toFixed(2))));

    // Calculate time taken from QuizAttempt if exists
    let calculatedTimeTaken = timeTakenFrontend;
    const attempt = await QuizAttempt.findOne({ user: userId, quiz: quizId, status: 'in_progress' }).sort({ createdAt: -1 });
    if (attempt) {
      if (!calculatedTimeTaken || calculatedTimeTaken === 0) {
        calculatedTimeTaken = Math.floor((new Date() - attempt.startedAt) / 1000); // Time in seconds
      }
      attempt.status = 'completed';
      await attempt.save();
    }

    const submissionData = {
      user: userId,
      quiz: quizId,
      courseId: quiz.course || null,
      lessonId: quiz.lesson || null,
      answers: submissionAnswers,
      score,
      totalMarks,
      passed: score >= quiz.passMark,
      is_completed: score >= quiz.passMark,
      totalQuestions,
      totalCorrectQuestions,
      totalWrongQuestions,
      percentage,
      timeTaken: calculatedTimeTaken,
      submittedAt: new Date()
    };

    const submission = await this.quizRepository.createSubmission(submissionData);
    //console.log('QuizService: Quiz submitted successfully:', submission);

    const notificationData = {
      title: 'Quiz Submitted',
      body: `Your quiz for the course has been successfully submitted.`,
      type: 'quiz_submission',
      referenceId: submission._id
    };

    const fcm = await fcmTokens.findOne({ userId: userId });
    if(fcm) {
      await NotificationService.sendPushNotification(fcm?.token, notificationData);
    }

    // Sanitize response based on showLeaderboard toggle
    if (quiz.showLeaderboard === false) {
      return {
        _id: submission._id,
        score: submission.score,
        totalMarks: submission.totalMarks,
        passed: submission.passed,
        is_completed: submission.is_completed,
        courseId: submission.courseId,
        lessonId: submission.lessonId,
        totalQuestions: submission.totalQuestions,
        totalCorrectQuestions: submission.totalCorrectQuestions,
        totalWrongQuestions: submission.totalWrongQuestions,
        percentage: submission.percentage,
        timeTaken: submission.timeTaken,
        message: "Successfully Submitted"
      };
    }

    return {
      _id: submission._id,
      score: submission.score,
      totalMarks: submission.totalMarks,
      passed: submission.passed,
      is_completed: submission.is_completed,
      courseId: submission.courseId,
      lessonId: submission.lessonId,
      totalQuestions: submission.totalQuestions,
      totalCorrectQuestions: submission.totalCorrectQuestions,
      totalWrongQuestions: submission.totalWrongQuestions,
      percentage: submission.percentage,
      timeTaken: submission.timeTaken
    };
  } catch (error) {
    console.error('QuizService: Error in submitQuiz:', error);
    throw error;
  }
}


  async getMySubmittedQuizzes(userId, query) {
    try {
      //console.log('QuizService: Fetching submitted quizzes for user:', userId);
      const submissions = await this.quizRepository.findSubmissionsByUser(userId, query);
      //console.log('QuizService: Submitted quizzes fetched successfully:', submissions);
      return submissions;
    } catch (error) {
      console.error('QuizService: Error in getMySubmittedQuizzes:', error);
      throw error;
    }
  }

  async getSubmittedQuiz(submissionId, userId) {
    try {
      //console.log('QuizService: Fetching submission with ID:', submissionId, 'for user:', userId);
      const submission = await this.quizRepository.findSubmissionById(submissionId, userId);
      if (!submission) {
        throw new Error('Submission not found or not authorized');
      }
      //console.log('QuizService: Submission fetched successfully:', submission);
      return submission;
    } catch (error) {
      console.error('QuizService: Error in getSubmittedQuiz:', error);
      throw error;
    }
  }

   async getAllSubmissions(query) {
    try {
      //console.log('QuizService: Fetching all submissions with query:', query);
      const submissions = await this.quizRepository.findAllSubmissions(query);
      //console.log('QuizService: All submissions fetched successfully:', submissions);
      return submissions;
    } catch (error) {
      console.error('QuizService: Error in getAllSubmissions:', error);
      throw error;
    }
  }

  async getQuizLeaderboard(courseId, quizId) {
    try {
      const quiz = await this.quizRepository.findById(quizId);
      if (!quiz) throw new Error("Quiz not found");
      if (quiz.showLeaderboard === false) {
        throw new Error("Leaderboard is disabled for this quiz");
      }

      const submissions = await QuizSubmission.find({ courseId, quiz: quizId })
        .populate('user', 'fullName profilePic')
        .sort({ score: -1, timeTaken: 1, submittedAt: 1 })
        .lean();
      
      // Filter out multiple submissions by same user (keep best/first encountered based on sort)
      const seenUsers = new Set();
      const leaderboard = [];
      let rank = 1;

      for (const sub of submissions) {
        if (!sub.user || seenUsers.has(sub.user._id.toString())) continue;
        
        seenUsers.add(sub.user._id.toString());
        leaderboard.push({
          rank: rank++,
          userId: sub.user._id,
          firstName: sub.user.fullName || 'User',
          lastName: '',
          profilePic: sub.user.profilePic,
          score: sub.score,
          totalMarks: sub.totalMarks,
          percentage: sub.percentage,
          timeTaken: sub.timeTaken || 0,
          submittedAt: sub.submittedAt
        });
      }

      return leaderboard;
    } catch (error) {
      console.error('QuizService: Error in getQuizLeaderboard:', error);
      throw error;
    }
  }
  
}