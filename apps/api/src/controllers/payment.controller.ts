import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();
const base_url = process.env.BASE_API_URL

export class PaymentController {
  // Mengunggah bukti pembayaran
  async uploadPaymentProof(req: Request, res: Response) {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }

    try {
if (!req.body.fileUrl) throw new Error('No file uploaded or upload failed'); 

 const link = req.body.fileUrl; // ⭐️ Use the full Cloudinary URL

      // Buat tautan publik untuk file yang diunggah
      const link = `${base_url}/public/payment-proof/${req.file.filename}`;

      // Konversi subscription_type_id menjadi integer
      const subscription_type_id = parseInt(req.body.subscription_type_id, 10);

      if (isNaN(subscription_type_id)) {
        return res.status(400).json({
          message: 'Invalid subscription_type_id. Must be an integer.',
        });
      }

      // Ambil informasi SubscriptionType berdasarkan subscription_type_id
      const subscriptionType = await prisma.subscriptionType.findUnique({
        where: { subs_type_id: subscription_type_id },
      });

      if (!subscriptionType) {
        return res
          .status(404)
          .json({ message: 'Subscription type not found.' });
      }

      // Cek apakah ada transaksi `pending` untuk user dan subscription_type_id
      let payment = await prisma.paymentTransaction.findFirst({
        where: {
          user_id: userId,
          subscription_type_id,
          status: 'pending',
        },
      });

      // Jika tidak ada transaksi `pending`, buat transaksi baru
      if (!payment) {
        payment = await prisma.paymentTransaction.create({
          data: {
            user_id: userId,
            subscription_type_id,
            amount: subscriptionType.price, // Ambil harga dari SubscriptionType
            status: 'pending',
          },
        });
      }

      // Perbarui kolom receipt dengan nama file
      const updatedPayment = await prisma.paymentTransaction.update({
        where: { transaction_id: payment.transaction_id },
        data: {
          receipt: req.file.filename, // Simpan nama file di kolom receipt
          status: 'pending',
        },
      });

      res.json({
        message: 'Payment proof uploaded successfully',
        receiptUrl: link,
        updatedPayment,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mengkonfirmasi pembayaran
  async confirmPayment(req: Request, res: Response) {
    const { transaction_id, status } = req.body;
  
    try {
      if (!transaction_id) {
        return res.status(400).json({ message: 'Transaction ID is required.' });
      }
  
      if (!['completed', 'failed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "completed" or "failed".' });
      }
  
      const payment = await prisma.paymentTransaction.findUnique({
        where: { transaction_id },
        include: {
          subscriptionType: true,
        },
      });
  
      if (!payment) {
        return res.status(404).json({ message: 'Transaction not found.' });
      }
  
      if (payment.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending transactions can be updated.' });
      }
  
      // Update status transaksi
      const updatedTransaction = await prisma.paymentTransaction.update({
        where: { transaction_id },
        data: {
          status,
        },
      });
  
      // Tambahkan logika untuk membuat subscription jika status "completed"
      if (status === 'completed') {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);
  
        await prisma.subscription.create({
          data: {
            user_id: payment.user_id,
            subscription_type_id: payment.subscription_type_id,
            start_date: startDate,
            end_date: endDate,
            status: 'active',
            payment_proof: true,
          },
        });
      }
  
      res.status(200).json({
        message: `Transaction successfully ${status}.`,
        updatedTransaction,
      });
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
  

  // Mendapatkan bukti pembayaran berdasarkan subscription ID
  async getPaymentProof(req: Request, res: Response) {
    const subscriptionId = parseInt(req.params.subscriptionId);
    try {
      const payments = await prisma.paymentTransaction.findMany({
        where: {
          subscription_id: subscriptionId,
          receipt: { not: null },
        },
      });
      if (payments.length === 0) {
        res
          .status(404)
          .json({ message: 'No payment proof found for this subscription' });
      } else {
        res.json(payments);
      }
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch payment proof',
        details: error.message,
      });
    }
  }

  async getDashboardData(req: Request, res: Response) {
    try {
      const totalTransactions = await prisma.paymentTransaction.count();
      const pendingTransactions = await prisma.paymentTransaction.count({
        where: { status: 'pending' },
      });
      const completedTransactions = await prisma.paymentTransaction.count({
        where: { status: 'completed' },
      });
      const failedTransactions = await prisma.paymentTransaction.count({
        where: { status: 'failed' },
      });

      const transactions = await prisma.paymentTransaction.findMany({
        include: {
          subscriptionType: true, // Relasi ke SubscriptionType
          user: true, // Relasi ke User
        },
      });

      res.status(200).json({
        totalTransactions,
        pendingTransactions,
        completedTransactions,
        failedTransactions,
        transactions,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      res
        .status(500)
        .json({ message: 'Internal server error', error: error.message });
    }
  }
}
