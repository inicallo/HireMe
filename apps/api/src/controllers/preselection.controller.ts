import { Request, Response } from 'express';
import prisma from '@/prisma';

export class PreSelectionTestController {
  async createTestLink(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const { assessmentId } = req.body;

      if (!assessmentId) {
        return res.status(400).json({ msg: 'Assessment ID is required.' });
      }

      await prisma.preSelectionTest.deleteMany({
        where: { job_id: jobId },
      });

      const newTest = await prisma.preSelectionTest.create({
        data: {
          job_id: jobId,
          assessment_id: assessmentId,
        },
        include: {
          skillAssessment: {
            select: {
              assessment_data: true,
            },
          },
        },
      });

      const assessmentTitle =
        (newTest.skillAssessment?.assessment_data as any)?.title ||
        'Linked Assessment';

      res.status(201).json({
        msg: 'Test linked successfully!',
        assessment: {
          assessment_id: newTest.assessment_id,
          assessment_data: assessmentTitle,
        },
      });
    } catch (error: any) {
      console.error('Error creating test link:', error);
      res
        .status(500)
        .json({ msg: 'Failed to create test link', error: error.message });
    }
  }

  async getAssessmentStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      if (!jobId) return res.status(400).json({ msg: 'Job ID is required' });

      const test = await prisma.preSelectionTest.findUnique({
        where: { job_id: jobId },
        include: {
          skillAssessment: {
            select: {
              assessment_data: true,
            },
          },
        },
      });

      if (!test || !test.skillAssessment) {
        return res.status(200).json(null);
      }

      const assessmentTitle =
        (test.skillAssessment.assessment_data as any)?.title ||
        'Linked Assessment';

      res.status(200).json({
        assessment_id: test.assessment_id,
        assessment_data: assessmentTitle,
      });
    } catch (error) {
      console.error('Error fetching assessment status:', error);
      res.status(500).json({ msg: 'Failed to fetch assessment status' });
    }
  }

  async deleteTestLink(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const { assessmentId } = req.body; 
      if (!jobId || !assessmentId) {
        return res
          .status(400)
          .json({ msg: 'Job ID and Assessment ID are required' });
      }

      await prisma.preSelectionTest.delete({
        where: {
          job_id: jobId,
          assessment_id: assessmentId,
        },
      });

      res.status(200).json({ msg: 'Assessment successfully unlinked.' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ msg: 'No assessment link found to delete.' });
      }
      console.error('Error deleting test link:', error);
      res.status(500).json({ msg: 'Failed to delete test link' });
    }
  }

  async addQuestion(req: Request, res: Response) {
    try {
      const { test_id, questions } = req.body;
      if (!test_id || !Array.isArray(questions)) {
        return res
          .status(400)
          .json({ msg: 'Test ID and questions are required' });
      }

      for (const question of questions) {
        if (question.questionId) {
          await prisma.testQuestion.update({
            where: { question_id: question.questionId },
            data: {
              question_text: question.questionText,
              correct_answer: question.correctAnswer,
              options: {
                deleteMany: {},
                create: question.options.map((opt: { text: string }) => ({
                  option_text: opt.text,
                })),
              },
            },
          });
        } else {
          await prisma.testQuestion.create({
            data: {
              test_id: test_id,
              question_text: question.questionText,
              correct_answer: question.correctAnswer,
              options: {
                create: question.options.map((opt: { text: string }) => ({
                  option_text: opt.text,
                })),
              },
            },
          });
        }
      }
      res.status(200).json({ msg: 'Questions added or updated successfully' });
    } catch (err) {
      const error = err as Error;
      res
        .status(400)
        .json({ msg: error.message || 'An error occurred', error: err });
    }
  }

  async getTestWithQuestions(req: Request, res: Response) {
    try {
      const { testId } = req.params;
      const test = await prisma.preSelectionTest.findUnique({
        where: { test_id: testId },
        include: { questions: { include: { options: true } } },
      });
      if (!test) return res.status(404).json({ msg: 'Test not found' });
      res.status(200).json({ test });
    } catch (error) {
      console.error('Error fetching test with questions:', error);
      res.status(500).json({ msg: 'Failed to fetch test with questions' });
    }
  }

  async saveTestAnswer(req: Request, res: Response) {
    try {
      const { userId, testId, answers } = req.body;
      if (
        !userId ||
        !testId ||
        !Array.isArray(answers) ||
        answers.length === 0
      ) {
        return res.status(400).json({ msg: 'All fields are required' });
      }
      const savedAnswers = [];
      for (const answer of answers) {
        const { questionId, selectedOption } = answer;
        if (!questionId || selectedOption == null) {
          return res.status(400).json({
            msg: 'Each answer must include questionId and selectedOption',
          });
        }
        const question = await prisma.testQuestion.findUnique({
          where: { question_id: questionId },
          include: { options: true },
        });
        if (!question)
          return res
            .status(404)
            .json({ msg: `Question not found: ${questionId}` });

        const isCorrect = question.correct_answer === selectedOption;

        const testAnswer = await prisma.testAnswer.create({
          data: {
            user_id: userId,
            test_id: testId,
            question_id: questionId,
            selected_option: selectedOption,
            is_correct: isCorrect,
          },
        });
        savedAnswers.push(testAnswer);
      }
      res
        .status(201)
        .json({ msg: 'Answers saved successfully!', answers: savedAnswers });
    } catch (error) {
      console.error('Error saving test answers:', error);
      res.status(500).json({ msg: 'Failed to save answers' });
    }
  }

  async getQuestionsByJobId(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      if (!jobId) return res.status(400).json({ msg: 'Job ID is required' });

      const test = await prisma.preSelectionTest.findUnique({
        where: { job_id: jobId },
        include: { questions: { include: { options: true } } },
      });
      if (!test)
        return res.status(404).json({ msg: 'No test found for this job ID' });

      const questions = test.questions.map((question) => ({
        questionId: question.question_id,
        questionText: question.question_text,
        options: question.options.map((option) => ({
          optionId: option.option_id,
          text: option.option_text,
        })),
        correctAnswer: question.correct_answer,
      }));

      res.status(200).json({ testId: test.test_id, questions });
    } catch (error) {
      console.error('Error fetching questions by job ID:', error);
      res.status(500).json({ msg: 'Failed to fetch questions by job ID' });
    }
  }

  async checkTest(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const test = await prisma.preSelectionTest.findUnique({
        where: { job_id: jobId },
      });
      res.status(200).json({ hasTest: !!test });
    } catch (error) {
      console.error('Error checking test:', error);
      res.status(500).json({ msg: 'Failed to check for test' });
    }
  }
}
