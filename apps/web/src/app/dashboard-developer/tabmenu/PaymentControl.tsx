import { confirmTransaction, fetchDashboardData } from '@/lib/payment';
import { getToken } from '@/lib/server';
import { DecodedToken } from '@/types/iuser';
import { DashboardMetrics, Transaction } from '@/types/payment';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MdOpenInNew } from "react-icons/md";

const base_url = process.env.NEXT_PUBLIC_BASE_API_URL

const BillsManage: React.FC = () => {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const validateUser = async () => {
      try {
        const token = await getToken(); // Ambil token dari localStorage
        if (!token) {
          toast.error('User not logged in.');
          router.push('/sign-in'); // Redirect ke halaman login jika token tidak ditemukan
          return;
        }

        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.role !== 'developer') {
          toast.error('Access denied. Only candidates can view this page.');
          router.push('/sign-in'); // Redirect jika bukan role candidate
          return;
        }

        setUserRole(decodedToken.role); // Set user role
      } catch (error) {
        console.error('Failed to validate user:', error);
        toast.error('Invalid token or user not authorized.');
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    validateUser();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchDashboardData();
      if (error) {
        toast.error(error);
        console.error('Failed to fetch dashboard data:', error);
        return;
      }

      setMetrics(data || null);
      setTransactions(data?.transactions || []);
    } catch (error) {
      toast.error('Error loading dashboard data.');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (
    transactionId: number,
    status: 'completed' | 'failed',
  ) => {
    try {
      const { success, error } = await confirmTransaction(
        transactionId,
        status,
      );
      if (success) {
        toast.success(
          status === 'completed'
            ? 'Transaction confirmed successfully!'
            : 'Transaction marked as failed successfully!',
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Tunggu 1 detik
        loadDashboardData(); // Muat ulang data
      } else {
        toast.error(
          error || `Failed to update transaction status to ${status}.`,
        );
      }
    } catch (error) {
      toast.error('Error updating transaction status.');
      console.error('Update error:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Developer Payment Control</h1>

      {/* Metrics Section */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-blue-100 text-center rounded shadow">
          <h2 className="text-xl font-bold">
            {metrics?.totalTransactions || 0}
          </h2>
          <p>Total Transactions</p>
        </div>
        <div className="p-4 bg-yellow-100 text-center rounded shadow">
          <h2 className="text-xl font-bold">
            {metrics?.pendingTransactions || 0}
          </h2>
          <p>Pending Transactions</p>
        </div>
        <div className="p-4 bg-green-100 text-center rounded shadow">
          <h2 className="text-xl font-bold">
            {metrics?.completedTransactions || 0}
          </h2>
          <p>Completed Transactions</p>
        </div>
        <div className="p-4 bg-red-100 text-center rounded shadow">
          <h2 className="text-xl font-bold">
            {metrics?.failedTransactions || 0}
          </h2>
          <p>Failed Transactions</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Subscription</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-center">Receipt</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.transaction_id} className="border-t">
                <td className="px-4 py-2">{tx.transaction_id}</td>
                <td className="px-4 py-2">{`${tx.user.first_name} ${tx.user.last_name}`}</td>
                <td className="px-4 py-2">{tx.subscriptionType.type}</td>
                <td className="px-4 py-2 text-right">
                  Rp {tx.amount.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-2">{tx.status}</td>
                <td className="px-4 py-2 text-center">
                  {tx.receipt ? (
                    <a
                      href={`${tx.receipt}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 flex justify-center"
                    >
                      <MdOpenInNew size={20} />
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {tx.status === 'pending' && (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          handleConfirmPayment(tx.transaction_id, 'completed')
                        }
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleConfirmPayment(tx.transaction_id, 'failed')
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillsManage;
