// assessmentController.ts
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export class AssessmentController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async createAssessment(req: Request, res: Response): Promise<void> {
    try {
      const user_id = req.user?.user_id; // Extract user_id from req.user
      const { assessment_data, questions } = req.body;

      if (!user_id) {
        res.status(401).json({ message: 'Unauthorized. User ID is missing.' });
        return;
      }

      const user = await this.prisma.user.findUnique({ where: { user_id } });
      if (!user || user.role !== 'developer') {
        res.status(403).json({
          message: 'Access denied. Only developers can create assessments.',
        });
        return;
      }

      const newAssessment = await this.prisma.skillAssessment.create({
        data: {
          user_id,
          assessment_data,
          questions: {
            create: questions.map((q: any) => ({
              question_text: q.question_text,
              question_type: q.question_type || 'multiple_choice',
              is_active: true,
              difficulty_level: q.difficulty_level || 'medium',
              points: q.points || 1, // Default points
              answers: {
                create: q.answers.map((a: any) => ({
                  answer_text: a.answer_text,
                  is_correct: a.is_correct,
                })),
              },
            })),
          },
        },
      });

      res.status(201).json({
        message: 'Assessment created successfully',
        assessment: newAssessment,
      });
    } catch (error) {
      console.error('Error creating assessment:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  public async getAllAssessments(req: Request, res: Response): Promise<void> {
    try {
      const assessments = await this.prisma.skillAssessment.findMany({
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      });

      res.status(200).json({ assessments });
    } catch (error) {
      console.error('Error fetching all assessments:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  }

  public async deleteAssessment(req: Request, res: Response) {
    try {
      const { assessment_id } = req.params;

      // Pastikan `assessment_id` adalah angka
      const id = parseInt(assessment_id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid assessment ID' });
      }

      // Hapus data dari tabel SkillAssessment (cascade deletion berlaku)
      await this.prisma.skillAssessment.delete({
        where: { assessment_id: id },
      });

      res.status(200).json({ message: 'Assessment deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error deleting assessment:', error.message); // Mengakses pesan error
        res
          .status(500)
          .json({ message: "This assessment has been applied by a customer and cannot be deleted at this time.", error: error.message });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Unexpected error occurred' });
      }
    }
  }

  public async startAssessment(req: Request, res: Response): Promise<void> {
    try {
      const user_id = req.user?.user_id;

      if (!user_id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { assessment_id } = req.params;

      // Temukan assessment beserta pertanyaan dan jawabannya
      const assessment = await this.prisma.skillAssessment.findUnique({
        where: { assessment_id: parseInt(assessment_id, 10) },
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      });

      if (!assessment) {
        res.status(404).json({ message: 'Assessment not found' });
        return;
      }

      // Masukkan semua data ke `UserAssessmentResponse`
      const responses = assessment.questions.map((question) => ({
        user_id,
        question_id: question.question_id,
        assessment_id: parseInt(assessment_id, 10),
        created_at: new Date(),
        updated_at: new Date(),
        answer_id: null, // Belum ada jawaban
        answer_text: null, // Belum ada jawaban teks
      }));

      // Batch insert ke `UserAssessmentResponse`
      await this.prisma.userAssessmentResponse.createMany({
        data: responses,
      });

      // Buat token JWT untuk sesi assessment
      const token = jwt.sign(
        {
          user_id,
          assessment_id: parseInt(assessment_id, 10),
        },
        process.env.SECRET_JWT!,
        { expiresIn: '30m' },
      );

      // Kirimkan respons
      res.status(200).json({
        message: 'Assessment started',
        token,
        time_limit: 30,
        assessment,
      });
    } catch (error) {
      console.error('Error starting assessment:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  public async submitAssessment(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ message: 'Unauthorized: Missing token' });
        return;
      }

      const token = authHeader.split(' ')[1];
      let decodedToken: { user_id: number; assessment_id: number };

      try {
        decodedToken = jwt.verify(token, process.env.SECRET_JWT!) as {
          user_id: number;
          assessment_id: number;
        };
      } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
      }

      const { user_id, assessment_id } = decodedToken;

      const { responses } = req.body;

      // Validasi responses
      if (!Array.isArray(responses) || responses.length === 0) {
        res.status(400).json({ message: 'Invalid or missing responses.' });
        return;
      }

      const assessment = await this.prisma.skillAssessment.findUnique({
        where: { assessment_id },
        include: { questions: true },
      });

      if (!assessment) {
        res.status(404).json({ message: 'Assessment not found' });
        return;
      }

      const totalQuestions = Array.isArray(assessment.questions)
        ? assessment.questions.length
        : 0;

      const pointsPerQuestion = totalQuestions > 0 ? 100 / totalQuestions : 0;

      let totalScore = 0;

      for (const response of responses) {
        const answer = await this.prisma.assessmentAnswer.findUnique({
          where: { answer_id: response.answer_id },
        });

        if (answer && answer.is_correct) {
          totalScore += pointsPerQuestion;
        }

        await this.prisma.userAssessmentResponse.create({
          data: {
            user_id,
            question_id: response.question_id,
            answer_id: response.answer_id,
            assessment_id,
            answer_text: response.answer_text,
          },
        });
      }

      const isPassed = totalScore >= 75;

      // Tentukan badge berdasarkan data assessment
      const badge = isPassed ? 'Passed Skill Assessment by HIRE-ME' : null;

      // Data untuk UserAssessmentScore
      const assessmentScoreData: any = {
        user_id,
        assessment_id,
        score: Math.round(totalScore),
        status: isPassed ? 'passed' : 'failed',
        badge,
      };

      // Tambahkan `unique_code` hanya jika lulus
      if (isPassed) {
        assessmentScoreData.unique_code = crypto.randomUUID();
      }

      // Simpan skor dan badge di UserAssessmentScore
      const userAssessmentScore = await this.prisma.userAssessmentScore.create({
        data: assessmentScoreData,
      });

      res.status(200).json({
        message: isPassed ? 'Assessment passed' : 'Assessment failed',
        score: Math.round(totalScore),
        badge: userAssessmentScore.badge,
      });
    } catch (error) {
      console.error('Error submitting assessment:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  public async getUserAssessmentScore(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { user_id } = req.user || {}; // Ambil user_id dari req.user (diatur oleh middleware autentikasi)

      if (!user_id) {
        res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        return;
      }

      // Ambil data skor milik pengguna
      const userAssessmentScores =
        await this.prisma.userAssessmentScore.findMany({
          where: { user_id }, // Batasi hanya data milik pengguna
          include: {
            skillAssessment: true, // Sertakan data relasi skillAssessment
          },
        });

      if (!userAssessmentScores || userAssessmentScores.length === 0) {
        res
          .status(404)
          .json({ message: 'No assessment scores found for this user.' });
        return;
      }

      res.status(200).json({
        message: 'User assessment scores retrieved successfully.',
        scores: userAssessmentScores,
      });
    } catch (error) {
      console.error('Error fetching user assessment scores:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : error,
      });
    }
  }
  public async getUserBadgesById(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params; // Ambil user_id dari parameter URL

      if (!user_id) {
        res.status(400).json({ message: 'Bad Request. User ID is required.' });
        return;
      }
      // Query ke database untuk mengambil badge dengan status 'passed'
      const passedBadges = await this.prisma.userAssessmentScore.findMany({
        where: {
          user_id: parseInt(user_id), // Konversi user_id ke integer
          status: 'passed', // Hanya data dengan status 'passed'
        },
        select: {
          badge: true, // Ambil hanya field badge
          skillAssessment: {
            select: {
              assessment_data: true, // Opsional: jika data assessment diperlukan
            },
          },
        },
      });
      if (!passedBadges || passedBadges.length === 0) {
  // 🚨 CHANGE THE RESPONSE STATUS AND DATA HERE 🚨
  res.status(200).json({ // Changed from 404 to 200
    // Keep the message informative
    message: `No badges found for user with ID ${user_id}.`,
    badges: [], // Send an empty array to the frontend
  });
  return;
}
      // Respons jika badge ditemukan
      res.status(200).json({
        message: 'User badges retrieved successfully.',
        badges: passedBadges.map((badge) => ({
          badge: badge.badge,
          assessment_data: badge.skillAssessment?.assessment_data || null,
        })),
      });
    } catch (error) {
      console.error('Error fetching user badges:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}
