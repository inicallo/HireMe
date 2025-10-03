import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { ISubsType } from '@/types/substype';
import { getSubstypes } from '@/lib/substype';
import { uploadPaymentProof } from '@/lib/payment';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/types/iuser';
import { getToken } from '@/lib/server';
import PromoSection from './components/promossection';
import CustomerCard from './components/cusCardPlan';

const banks = [
  { name: 'Bank Mandiri', account: '1400012345678' },
  { name: 'Bank BRI', account: '0020123456789' },
  { name: 'Bank BCA', account: '0080123456789' },
  { name: 'Bank BNI', account: '0090123456789' },
];

const CustomerPlans: React.FC = () => {
  const [plans, setPlans] = useState<ISubsType[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ISubsType | null>(null);
  const [selectedBank, setSelectedBank] = useState<{ name: string; account: string } | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateUser = async () => {
      try {
        const token = await getToken();
        if (!token) {
          toast.error('User not logged in.');
          router.push('/sign-in');
          return;
        }

        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.role !== 'candidate') {
          toast.error('Access denied. Only candidates can view this page.');
          router.push('/');
          return;
        }

        setUserRole(decodedToken.role);
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

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getSubstypes();
        if (response.ok && response.substypes && Array.isArray(response.substypes.subscriptionstypeAll)) {
          setPlans(response.substypes.subscriptionstypeAll);
        } else {
          toast.error('Failed to fetch plans.');
        }
      } catch (error) {
        toast.error(`Failed to fetch plans: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      }
    };

    fetchPlans();
  }, []);

  const handleChoosePlan = (plan: ISubsType) => {
    if (userRole !== 'candidate') {
      toast.error('Only candidates can purchase plans.');
      return;
    }

    const uniqueCode = Math.floor(10 + Math.random() * 90);
    const modifiedPrice = parseInt(`${plan.price.toString().slice(0, -2)}${uniqueCode}`);
    setTotalPrice(modifiedPrice);
    setSelectedPlan(plan);
    setSelectedBank(banks[0]);
  };

  const handleCloseModal = () => {
    setSelectedPlan(null);
    setSelectedBank(null);
    setSelectedFile(null);
  };

  const handleBankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBank = banks.find((bank) => bank.name === event.target.value);
    setSelectedBank(selectedBank || null);
  };

  const handleSubmitPaymentProof = async () => {
    if (!selectedPlan || !selectedFile) {
      toast.error('Plan and payment proof are required!');
      return;
    }
  
    try {
      const result = await uploadPaymentProof({
        subs_type_id: selectedPlan.subs_type_id,
        payment_proof: selectedFile,
      });
  
      if (result.ok) {
        toast.success('Payment proof uploaded successfully!');
        handleCloseModal();
      } else {
        console.error('Upload failed:', result.error);
        toast.error(result.error || 'Failed to upload payment proof.');
      }
    } catch (error) {
      console.error('Error during upload:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center p-2 md:p-4 relative">
      <PromoSection />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <CustomerCard key={plan.subs_type_id} plan={plan} onChoose={() => handleChoosePlan(plan)} />
        ))}
      </div>

      {/* Overlay dan Modal */}
      {selectedPlan && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out"></div>
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-transform transform scale-95 opacity-0 duration-300 ease-in-out"
            style={{ opacity: selectedPlan ? 1 : 0, transform: selectedPlan ? 'scale(1)' : 'scale(0.95)' }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
              <h2 className="text-xl font-semibold mb-4">Payment for {selectedPlan.type} Plan</h2>
              <p className="text-gray-600 mb-4">Payment gateway on develop</p>
              <p className="text-sm text-gray-500 mb-2">Please select a payment method and upload payment proof manually.</p>

              {/* Harga Total dengan Kode Unik */}
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Total Amount:</label>
                <p className="text-2xl font-bold text-blue-500">Rp {new Intl.NumberFormat('id-ID').format(totalPrice)}</p>
              </div>

              {/* Pilihan Bank */}
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-2">Select Bank:</label>
                <select
                  className="w-full p-2 border rounded-lg text-black bg-gray-300"
                  value={selectedBank?.name || ''}
                  onChange={handleBankChange}
                >
                  {banks.map((bank) => (
                    <option key={bank.name} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Informasi Rekening Bank */}
              {selectedBank && (
                <div className="mb-4">
                  <label className="block font-medium text-gray-700">Bank Account:</label>
                  <p className="text-lg font-bold text-blue-500">{selectedBank.name}</p>
                  <p className="text-blue-500 font-bold text-2xl">{selectedBank.account}</p>
                </div>
              )}

              {/* Upload Bukti Pembayaran */}
              <div className="mb-6">
                <label className="block font-medium text-gray-700 mb-2">Upload Payment Proof:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end">
                <button onClick={handleCloseModal} className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2">
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPaymentProof}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerPlans;
