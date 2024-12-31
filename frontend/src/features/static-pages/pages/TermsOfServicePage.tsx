import { useNavigate } from 'react-router-dom';
import { Account } from '@/features/account/components/Account/Account';

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
          {/* Title and Last Updated */}
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter mb-4">Terms of Service</h1>
            <p className="text-gray-400">Last updated: December 2024</p>
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
                <li>• We collect limited Canvas information, such as courses, assignments, and grades, solely to deliver our services.</li>
                <li>• Your Canvas API key (or token) is encrypted and stored securely; we do not share your API credentials with any third party without your explicit consent.</li>
                <li>• We use read-only API access and cannot modify your Canvas account in any manner.</li>
                <li>• Your name, student identifiers, and other personal information are never publicly associated with your grades or AI analysis results.</li>
                <li>• We will never sell your personal information or data to third parties.</li>
                <li>• For more details on how we collect, use, and protect your data, please review our Privacy Policy.</li>
              </ul>
            </section>

            {/* 3. Security */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">3. Security</h2>
              <ul className="text-gray-400 leading-relaxed space-y-2">
                <li>• All user data is stored in secure Firebase databases and protected by robust access controls.</li>
                <li>• API keys are encrypted using industry-standard methods.</li>
                <li>• All connections to easyCanvas are encrypted using HTTPS.</li>
                <li>• We conduct regular security audits and reviews to maintain a high level of data protection.</li>
                <li>• You agree to safeguard your account credentials and notify us immediately of any unauthorized use or suspicious activity.</li>
              </ul>
            </section>

            {/* 4. User Rights */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">4. User Rights</h2>
              <ul className="text-gray-400 leading-relaxed space-y-2">
                <li>• You have the right to delete your account and data at any time through the account settings.</li>
                <li>• You may request a copy of your stored data in a commonly used electronic format.</li>
                <li>• You have the option to opt out of AI analysis features without discontinuing other easyCanvas services.</li>
                <li>• You can update or revoke your API key or token at your discretion.</li>
              </ul>
            </section>

            {/* 5. Limitations */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">5. Limitations</h2>
              <p className="text-gray-400 leading-relaxed">
                easyCanvas is provided “as is,” without warranties of any kind, whether express or implied. We maintain read-only access to protect the integrity of your Canvas account. We do not guarantee uninterrupted or error-free service, nor the accuracy, reliability, or completeness of any information presented. 
              </p>
            </section>

            {/* 6. Eligibility & Account Responsibility */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">6. Eligibility &amp; Account Responsibility</h2>
              <p className="text-gray-400 leading-relaxed">
                By using easyCanvas, you represent and warrant that you are at least 13 years of age and have the legal capacity to enter into these Terms of Service. You are responsible for all activity under your account, including actions taken by others to whom you have granted access. You agree to comply with all applicable local, state, federal, and institutional laws and regulations.
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
                <li>• Violating the security of any computer network or cracking passwords or security encryption codes.</li>
                <li>• Interfering with or disrupting the integrity or performance of the easyCanvas platform.</li>
                <li>• Engaging in activities that infringe on the intellectual property or data privacy rights of any party.</li>
                <li>• Bypassing or attempting to bypass security measures to access restricted areas of the service.</li>
              </ul>
            </section>

            {/* 8. Intellectual Property */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">8. Intellectual Property</h2>
              <p className="text-gray-400 leading-relaxed">
                All content, features, and functionality on the easyCanvas platform, including (but not limited to) text, graphics, images, logos, and software, are the exclusive property of easyCanvas or its licensors and are protected by intellectual property laws. You agree not to reproduce, distribute, or create derivative works from any part of our service without express written permission.
              </p>
            </section>

            {/* 9. Disclaimers */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">9. Disclaimers</h2>
              <p className="text-gray-400 leading-relaxed">
                easyCanvas makes no warranties, expressed or implied, regarding the reliability, accuracy, or completeness of any AI analysis or other features. Academic and professional decisions you make based on information provided by easyCanvas are solely your responsibility. We shall not be liable for errors, mistakes, or inaccuracies of content, or for any damage arising from your reliance on such content.
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
                You agree to defend, indemnify, and hold harmless easyCanvas, its affiliates, and their respective officers, employees, and agents, from and against any and all claims, damages, losses, liabilities, costs, or expenses (including attorney’s fees) arising from: 
                (a) your use of and access to easyCanvas; 
                (b) your violation of these Terms of Service; or 
                (c) your violation of any third-party right, including without limitation any intellectual property or privacy right.
              </p>
            </section>

            {/* 12. Modifications to the Service & Terms */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">12. Modifications to the Service &amp; Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                We reserve the right to modify or discontinue easyCanvas, or any part thereof, at any time without prior notice. We may also revise these Terms of Service from time to time in our sole discretion. If we make changes, we will update the “Last updated” date at the top of these Terms. In some cases, we may provide additional notice (such as an email or an in-app notification). By continuing to use easyCanvas after any updates become effective, you agree to be bound by the revised Terms.
              </p>
            </section>

            {/* 13. Governing Law & Dispute Resolution */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">13. Governing Law &amp; Dispute Resolution</h2>
              <p className="text-gray-400 leading-relaxed">
                These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which easyCanvas is operated, without regard to its conflict of law provisions. Any dispute arising out of or in connection with these Terms shall be submitted to the exclusive jurisdiction of the courts of that jurisdiction. You agree to submit to personal jurisdiction in such courts.
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
