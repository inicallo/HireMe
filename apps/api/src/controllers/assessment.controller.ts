import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export class AssessmentController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async createAssessment(req: Request, res: Response): Promise<void> {
    try {
      const user_id = req.user?.user_id;
      const { assessment_data, questions } = req.body;

      if (!user_id) {
        res.status(401).json({ message: 'Unauthorized. User ID is missing.' });
        return;
      }

      const user = await this.prisma.user.findUnique({
        where: { user_id: String(user_id) },
      });
      if (!user || user.role !== 'developer') {
        res.status(403).json({
          message: 'Access denied. Only developers can create assessments.',
        });
        return;
      }

      const newAssessment = await this.prisma.skillAssessment.create({
        data: {
          user_id: String(user_id),
          assessment_data,
          questions: {
            create: questions.map((q: any) => ({
              question_text: q.question_text,
              question_type: q.question_type || 'multiple_choice',
              is_active: true,
              difficulty_level: q.difficulty_level || 'medium',
              points: q.points || 1,
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

      const id = parseInt(assessment_id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid assessment ID' });
      }

      await this.prisma.skillAssessment.delete({
        where: { assessment_id: String(id) },
      });

      res.status(200).json({ message: 'Assessment deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error deleting assessment:', error.message);
        res.status(500).json({
          message:
            'This assessment has been applied by a customer and cannot be deleted at this time.',
          error: error.message,
        });
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
      const assessment = await this.prisma.skillAssessment.findUnique({
        where: { assessment_id: String(assessment_id) },
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

      const responses =
        assessment.questions?.map((question: any) => ({
          user_id: String(user_id),
          question_id: question.question_id,
          assessment_id: String(assessment.assessment_id),
          created_at: new Date(),
          updated_at: new Date(),
          answer_id: null,
          answer_text: null,
        })) || [];

      if (responses.length > 0) {
        await this.prisma.userAssessmentResponse.createMany({
          data: responses,
        });
      }

      const token = jwt.sign(
        {
          user_id,
          assessment_id: assessment.assessment_id,
        },
        process.env.SECRET_JWT!,
        { expiresIn: '30m' },
      );

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
      let decodedToken: { user_id: any; assessment_id: any };

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

      if (!Array.isArray(responses) || responses.length === 0) {
        res.status(400).json({ message: 'Invalid or missing responses.' });
        return;
      }

      const assessment = await this.prisma.skillAssessment.findUnique({
        where: { assessment_id: String(assessment_id) },
        include: { questions: true },
      });

      if (!assessment) {
        res.status(404).json({ message: 'Assessment not found' });
        return;
      }

      const totalQuestions = assessment.questions?.length ?? 0;

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
            user_id: String(user_id),
            question_id: response.question_id,
            answer_id: response.answer_id,
            assessment_id: String(assessment_id),
            answer_text: response.answer_text,
          },
        });
      }

      const isPassed = totalScore >= 75;

      const badge = isPassed ? 'Passed Skill Assessment by HireMe' : null;
      const assessmentScoreData: any = {
        user_id: String(user_id),
        assessment_id: String(assessment_id),
        score: Math.round(totalScore),
        status: isPassed ? 'passed' : 'failed',
        badge,
      };
      if (isPassed) {
        assessmentScoreData.unique_code = crypto.randomUUID();
      }
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
      const { user_id } = req.user || {};

      if (!user_id) {
        res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        return;
      }
      const userAssessmentScores =
        await this.prisma.userAssessmentScore.findMany({
          where: { user_id: String(user_id) },
          include: {
            skillAssessment: true,
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
        scores: userAssessmentScores.map((score) => ({
          ...score,
          skillAssessment: score.skillAssessment
            ? {
                ...score.skillAssessment,
                questions: undefined,
              }
            : null,
        })),
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
      const { user_id } = req.params;

      if (!user_id) {
        res.status(400).json({ message: 'Bad Request. User ID is required.' });
        return;
      }
      const passedBadges = await this.prisma.userAssessmentScore.findMany({
        where: {
          user_id: String(user_id),
          status: 'passed',
        },
        select: {
          badge: true,
          skillAssessment: {
            select: {
              assessment_data: true,
            },
          },
        },
      });

      if (!passedBadges || passedBadges.length === 0) {
        res.status(404).json({
          message: `No badges found for user with ID ${user_id}.`,
        });
        return;
      }

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
