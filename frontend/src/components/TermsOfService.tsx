import { useNavigate } from 'react-router-dom';
import Account from './Account';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-black tracking-tighter">
                easy<span className="text-gray-500">canvas</span>
              </h1>
            </div>
            <Account />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter mb-4">Terms of Service</h1>
            <p className="text-gray-400">Last updated: March 2024</p>
          </div>

          <div className="space-y-6">
            {/* 1. Service Overview */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">1. Service Overview</h2>
              <p className="text-gray-400 leading-relaxed">
                easyCanvas is a tool that enhances your Canvas LMS experience through secure API integration and AI-powered insights. By using easyCanvas, you agree to the terms outlined herein. If you do not agree to these Terms of Service, you must discontinue use of easyCanvas immediately.
              </p>
            </section>

            {/* 2. Data Collection & Privacy */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">2. Data Collection &amp; Privacy</h2>
              <ul className="text-gray-400 leading-relaxed space-y-2">
                <li>• We collect basic Canvas information including courses, assignments, and grades.</li>
                <li>• Your Canvas API key is encrypted and stored securely.</li>
                <li>• We use read-only API access and cannot modify your Canvas account.</li>
                <li>• Your name is never associated with grades in AI analysis.</li>
                <li>• We will never sell your personal information or data.</li>
                <li>• For more information on how we handle your data, please review our Privacy Policy.</li>
              </ul>
            </section>

            {/* 3. Security */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">3. Security</h2>
              <ul className="text-gray-400 leading-relaxed space-y-2">
                <li>• Data is stored in secure Firebase databases.</li>
                <li>• API keys are encrypted using industry-standard methods.</li>
                <li>• All connections are encrypted using HTTPS.</li>
                <li>• Regular security audits are performed.</li>
                <li>• You agree to safeguard your account credentials and notify us immediately of any unauthorized use.</li>
              </ul>
            </section>

            {/* 4. User Rights */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">4. User Rights</h2>
              <ul className="text-gray-400 leading-relaxed space-y-2">
                <li>• Delete your account and data at any time.</li>
                <li>• Request a copy of your stored data.</li>
                <li>• Opt out of AI analysis features.</li>
                <li>• Update or revoke your API key.</li>
              </ul>
            </section>

            {/* 5. Limitations */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">5. Limitations</h2>
              <p className="text-gray-400 leading-relaxed">
                easyCanvas is provided “as is” and without warranties of any kind, whether express or implied. We maintain read-only access to protect your Canvas account integrity. We do not guarantee uninterrupted or error-free service, nor do we guarantee the accuracy, reliability, or completeness of any information provided.
              </p>
            </section>

            {/* 6. Eligibility & Account Responsibility */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">6. Eligibility &amp; Account Responsibility</h2>
              <p className="text-gray-400 leading-relaxed">
                By using easyCanvas, you represent and warrant that you are at least 13 years of age and have the legal capacity to enter into these Terms of Service. You are responsible for any activity that occurs under your account, including any actions taken by persons to whom you have granted access.
              </p>
            </section>

            {/* 7. Prohibited Uses */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">7. Prohibited Uses</h2>
              <p className="text-gray-400 leading-relaxed">
                You may not use easyCanvas in any way that is unlawful, fraudulent, or harmful to others. Prohibited uses include, but are not limited to:
              </p>
              <ul className="text-gray-400 leading-relaxed space-y-2 list-disc list-inside">
                <li>• Attempting to gain unauthorized access to any systems or networks connected to easyCanvas.</li>
                <li>• Violating the security of any computer network or cracking any passwords or security encryption codes.</li>
                <li>• Interfering with or disrupting the integrity of the easyCanvas platform.</li>
                <li>• Engaging in activities that infringes on the intellectual property or data privacy rights of any entity.</li>
              </ul>
            </section>

            {/* 8. Intellectual Property */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">8. Intellectual Property</h2>
              <p className="text-gray-400 leading-relaxed">
                All content, features, and functionality on the easyCanvas platform, including but not limited to text, graphics, images, logos, and software, are the exclusive property of easyCanvas or its licensors and are protected by intellectual property laws. You agree not to reproduce, distribute, or create derivative works from any part of our service without express written permission.
              </p>
            </section>

            {/* 9. Disclaimers */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">9. Disclaimers</h2>
              <p className="text-gray-400 leading-relaxed">
                easyCanvas makes no warranties, expressed or implied, regarding the reliability, accuracy, or completeness of any AI analysis or other features. Any academic or professional decisions you make based on the information provided by easyCanvas are solely your responsibility. We shall not be liable for any errors, mistakes, or inaccuracies of content, or any damage arising from your reliance thereon.
              </p>
            </section>

            {/* 10. Limitation of Liability */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">10. Limitation of Liability</h2>
              <p className="text-gray-400 leading-relaxed">
                In no event shall easyCanvas, its affiliates, licensors, or partners be liable for any indirect, incidental, special, or consequential damages arising out of or related to your use or inability to use the service. In all cases, the maximum liability of easyCanvas shall be limited to the amount you paid (if any) for using the service.
              </p>
            </section>

            {/* 11. Indemnification */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">11. Indemnification</h2>
              <p className="text-gray-400 leading-relaxed">
                You agree to defend, indemnify, and hold harmless easyCanvas and its affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney’s fees) arising from: (a) your use of and access to easyCanvas; (b) your violation of these Terms of Service; (c) your violation of any third party right, including without limitation any intellectual property or privacy right.
              </p>
            </section>

            {/* 12. Modifications to the Service & Terms */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">12. Modifications to the Service &amp; Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                We reserve the right to modify or discontinue easyCanvas, or any part thereof, at any time. We may also revise these Terms of Service from time to time in our sole discretion. If we make changes, we will provide notice by updating the “Last updated” date at the top of these Terms and, in some cases, we may provide additional notice. By continuing to use easyCanvas after any updates become effective, you agree to be bound by the revised Terms.
              </p>
            </section>

            {/* 13. Governing Law & Dispute Resolution */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">13. Governing Law &amp; Dispute Resolution</h2>
              <p className="text-gray-400 leading-relaxed">
                These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which easyCanvas is operated, without regard to its conflict of law provisions. Any dispute arising out of or in connection with these Terms shall be submitted to the exclusive jurisdiction of the courts of that jurisdiction.
              </p>
            </section>

            {/* 14. Contact Us */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">14. Contact Us</h2>
              <p className="text-gray-400 leading-relaxed">
                If you have any questions or concerns about these Terms of Service or the easyCanvas platform, please contact us at: 
                <br />
                <span className="block mt-1">Email: support@easycanvas.com</span>
                <span className="block">Address: 1234 Imaginary Drive, Suite 100, Fictionland, 56789</span>
              </p>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              By using easyCanvas, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
