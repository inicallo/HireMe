import prisma from '@/prisma';
import { Request, Response } from 'express';

export class SubsController {
  // Create a new subscription type
  async createSubsType(req: Request, res: Response) {
    const { type, description, price, features, is_recomend } = req.body;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ status: 'error', msg: 'Unauthorized' });
    }

    try {
      const subscriptionType = await prisma.subscriptionType.create({
        data: {
          type,
          description,
          price: parseFloat(price), // ✅ ENSURE price is a number
          features,
          is_recomend: is_recomend || false,
          User_id: userId, // ✅ USE consistent snake_case
        },
      });
      res.status(201).send({
        status: 'ok',
        msg: 'Subscription created successfully',
        subscriptionType,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).send({
        status: 'error',
        msg: err.message || 'An error occurred',
      });
    }
  }

  // Get all subscription types
  async getSubsType(req: Request, res: Response) {
    try {
      const subscriptionstypeAll = await prisma.subscriptionType.findMany();
      res.status(200).send({ // Use 200 OK for successful GET requests
        status: 'ok',
        msg: 'All Subscription Types fetched successfully!',
        subscriptionstypeAll,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).send({
        status: 'error',
        msg: err.message || 'An error occurred',
      });
    }
  }

  // Get a single subscription type by ID
  async getSubsTypeById(req: Request, res: Response) {
    const { id } = req.params; // id is a string for MongoDB
    try {
      const subscription = await prisma.subscriptionType.findUnique({
        where: { subs_type_id: id },
      });
      if (subscription) {
        res.status(200).json(subscription);
      } else {
        res.status(404).json({ error: 'Subscription Type not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subscription type' });
    }
  }

  // Update a subscription type by ID
  async updateSubsType(req: Request, res: Response) {
    const { id } = req.params; // id is a string for MongoDB
    const { type, description, price, features, is_recomend } = req.body;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ status: 'error', msg: 'Unauthorized' });
    }

    try {
      const updatedSubscriptionType = await prisma.subscriptionType.update({
        where: { subs_type_id: id },
        data: {
          type,
          description,
          price: price ? parseFloat(price) : undefined,
          features,
          is_recomend: is_recomend,
          User_id: userId,
        },
      });
      res.status(200).send({
        status: 'ok',
        msg: 'Subscription Type updated successfully',
        updatedSubscriptionType,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).send({
        status: 'error',
        msg: err.message || 'An error occurred',
      });
    }
  }

  // Delete a subscription type by ID
  async deleteSubsType(req: Request, res: Response) {
    const { id } = req.params; // id is a string for MongoDB
    try {
      await prisma.subscriptionType.delete({
        where: { subs_type_id: id },
      });
      res.status(200).send({ // Use 200 OK for successful delete
        status: 'ok',
        msg: 'Subscription Type deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete subscription type' });
    }
  }
}