import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UAE Salary Guide 2026 | UAE Careers',
  description: 'Explore salary ranges for top jobs across UAE — Dubai, Abu Dhabi and all emirates. Updated for 2026.',
};

const SALARIES = [
  { role: 'Software Engineer', min: 10000, max: 30000, avg: 18000 },
  { role: 'Civil Engineer', min: 8000, max: 20000, avg: 13000 },
  { role: 'Registered Nurse', min: 6000, max: 16000, avg: 10000 },
  { role: 'Marketing Manager', min: 12000, max: 28000, avg: 19000 },
  { role: 'Financial Analyst', min: 9000, max: 22000, avg: 14500 },
  { role: 'HR Manager', min: 10000, max: 24000, avg: 16000 },
  { role: 'Sales Executive', min: 5000, max: 15000, avg: 9000 },
  { role: 'Accountant', min: 6000, max: 18000, avg: 11000 },
  { role: 'Operations Manager', min: 14000, max: 35000, avg: 22000 },
  { role: 'IT Support Specialist', min: 5000, max: 12000, avg: 8000 },
  { role: 'Graphic Designer', min: 5000, max: 14000, avg: 8500 },
  { role: 'Project Manager', min: 15000, max: 40000, avg: 26000 },
];

function fmt(n: number) {
  return `AED ${n.toLocaleString()}`;
}

export default function SalaryGuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <section className="bg-[#1A3C6E] text-white py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">UAE Salary Guide 2026</h1>
            <p className="text-blue-200">Average monthly salaries across UAE — Dubai, Abu Dhabi & all emirates (in AED)</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Job Role</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">Min</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">Average</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {SALARIES.map((s) => (
                  <tr key={s.role} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{s.role}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{fmt(s.min)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-[#1A3C6E]">{fmt(s.avg)}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{fmt(s.max)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Salary data is based on market research and job postings. Actual salaries may vary.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
