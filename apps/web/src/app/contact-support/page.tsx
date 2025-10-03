"use client"
import { useState } from 'react';

const ContactPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [company, setCompany] = useState('');
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      alert('Message sent!');
    }, 1000);
  };

  return (
    <div className="bg-[#F1F2F4]">
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left section: form */}
        <div className="bg-white mt-12 lg:mt-0 p-8 rounded-lg shadow-xl border border-gray-200">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Contact Us</h2>
          <p className="text-lg mb-4 text-gray-700">Have an enquiry? Send us a message using the form below and we’ll get back to you as soon as possible.</p>
          <p className="text-sm mb-8 text-blue-600 underline cursor-pointer">Job seekers contact us here</p>

          <form onSubmit={handleSubmit}>
            {/* First and Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-gray-800 font-semibold">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  className="input input-bordered w-full mt-2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-gray-800 font-semibold">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  className="input input-bordered w-full mt-2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-800 font-semibold">Email</label>
              <input
                type="email"
                id="email"
                className="input input-bordered w-full mt-2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Contact Number */}
            <div className="mb-4">
              <label htmlFor="contactNumber" className="block text-gray-800 font-semibold">Contact Number (optional)</label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  id="contactNumber"
                  className="input input-bordered w-2/3 mt-2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+628127789000"
                />
              </div>
            </div>

            {/* Company */}
            <div className="mb-4">
              <label htmlFor="company" className="block text-gray-800 font-semibold">Company</label>
              <input
                type="text"
                id="company"
                className="input input-bordered w-full mt-2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label htmlFor="subject" className="block text-gray-800 font-semibold">Subject</label>
              <select
                id="subject"
                className="input input-bordered w-full mt-2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              >
                <option value="">Please select</option>
                <option value="inquiry">Inquiry</option>
                <option value="support">Support</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label htmlFor="reason" className="block text-gray-800 font-semibold">Reason</label>
              <select
                id="reason"
                className="input input-bordered w-full mt-2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                <option value="">Please select</option>
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="sales">Sales</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Additional Information */}
            <div className="mb-4">
              <label htmlFor="additionalInfo" className="block text-gray-800 font-semibold">Additional Information (Max 1000 characters)</label>
              <textarea
                id="additionalInfo"
                className="input input-bordered w-full mt-2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                maxLength={1000}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn btn-primary w-full mt-4 p-3 rounded-lg bg-pink-600 text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Right section: contact information */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Contact Information</h3>

          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-semibold">Jakarta</h4>
              <p>PT. HireMe Indonesia</p>
              <p>Lantai 30, District 8 SCBD, Revenue Tower, <br /> Jl. Jend. Sudirman kav 52-53 No.Lot 13</p>
              <p>Senayan, Kec. Kby. Baru, Kota Jakarta Selatan,</p>
              <p>Daerah Khusus Ibukota Jakarta 12190</p>
              <p>Customer Service and Sales: <a href="tel:+62213277890" className="text-blue-600">+62 21 2778 9000</a></p>
            </div>
            <div>
              <h4 className="font-semibold">Penang</h4>
              <p>432, 433 & 435 L3A-2, Lv 3A, SPICE Arena, <br /> 180, Jalan Tun Dr. Awang, Relau</p>
              <p>Penang 11900</p>
            </div>
            <div>
              <h4 className="font-semibold">Johor Bahru</h4>
              <p>19-18, Lv 19, Austin 18 Versatile Business Suites, <br />Jalan Austin Perdana 3, <br />Taman Austin Perdana</p>
              <p>Johor Bahru, Johor Malaysia 81100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ContactPage;
