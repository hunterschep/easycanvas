import { useNavigate } from 'react-router-dom';
import { Account } from '@/features/account/components/Account/Account';

const PrivacyPolicy = () => {
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
            <h1 className="text-3xl font-black tracking-tighter mb-4">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: December 2024</p>
          </div>

          <div className="space-y-6">
            {/* 1. Introduction */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">1. Introduction</h2>
              <p className="text-gray-400 leading-relaxed">
                Welcome to easyCanvas! We are dedicated to enhancing your Canvas LMS experience by providing AI-powered insights and personalized analytics, while keeping your data secure and respecting your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use easyCanvas. If you do not agree with the practices described in this policy, please discontinue your use of our service.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">2. Information We Collect</h2>
              <ul className="text-gray-400 leading-relaxed space-y-2 list-disc list-inside">
                <li>
                  <strong>Canvas Data:</strong> We collect certain Canvas LMS data such as course enrollments, assignments, due dates, and grades to facilitate our analytics services.
                </li>
                <li>
                  <strong>API Key or Token:</strong> We require a read-only Canvas API token to retrieve the data needed to provide our services. These credentials are encrypted and stored securely.
                </li>
                <li>
                  <strong>Profile Information:</strong> This may include your name, email address, and other identifying details you provide or that are retrieved from your Canvas profile settings.
                </li>
                <li>
                  <strong>Usage Data:</strong> We may collect information about how you access and interact with easyCanvas, including device information, browser type, IP address, and other diagnostic data.
                </li>
                <li>
                  <strong>Cookies &amp; Similar Technologies:</strong> We may use cookies or local storage to remember your preferences and to provide a seamless user experience.
                </li>
              </ul>
            </section>

            {/* 3. How We Use Your Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">3. How We Use Your Information</h2>
              <ul className="text-gray-400 leading-relaxed space-y-2 list-disc list-inside">
                <li>To provide and maintain our services, including retrieval of Canvas data through API integrations.</li>
                <li>To analyze your course performance, deadlines, and other metrics, enabling AI-powered academic insights.</li>
                <li>To improve our platform’s functionality, user experience, and product offerings.</li>
                <li>To communicate with you about updates, important notices, or promotional content (where applicable).</li>
                <li>To detect, prevent, and address technical or security issues.</li>
              </ul>
            </section>

            {/* 4. Data Storage and Security */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">4. Data Storage and Security</h2>
              <p className="text-gray-400 leading-relaxed">
                We take appropriate technical and organizational measures to protect your personal information. Data is stored in secure Firebase databases, and all communication with our servers is encrypted via HTTPS. We also encrypt API tokens using industry-standard encryption methods. We regularly audit our systems to prevent unauthorized access, disclosure, or misuse of your data. 
              </p>
            </section>

            {/* 5. Sharing of Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">5. Sharing of Information</h2>
              <p className="text-gray-400 leading-relaxed">
                easyCanvas does not sell, trade, or rent your personal information to third parties. We may share certain details in the following limited circumstances:
              </p>
              <ul className="text-gray-400 leading-relaxed space-y-2 list-disc list-inside">
                <li>
                  <strong>With Service Providers:</strong> We may share data with trusted service providers (e.g., Firebase) to perform certain functions on our behalf, such as hosting, data storage, or analytics.
                </li>
                <li>
                  <strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law, or in response to valid requests by public authorities.
                </li>
                <li>
                  <strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale, your personal data may be transferred as part of that transaction.
                </li>
              </ul>
            </section>

            {/* 6. Cookies and Tracking Technologies */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">6. Cookies &amp; Tracking Technologies</h2>
              <p className="text-gray-400 leading-relaxed">
                We use cookies and similar technologies to enhance your experience and understand user interactions. You can control cookie preferences through your browser settings. Note that disabling cookies may affect certain features of easyCanvas.
              </p>
            </section>

            {/* 7. Children's Privacy */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">7. Children’s Privacy</h2>
              <p className="text-gray-400 leading-relaxed">
                easyCanvas is intended for users who are at least 13 years of age. If we become aware that we have inadvertently collected personal information from a child under the age of 13, we will take steps to delete such information promptly. If you believe we might have information from or about a child under 13, please contact us.
              </p>
            </section>

            {/* 8. International Users */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">8. International Users</h2>
              <p className="text-gray-400 leading-relaxed">
                easyCanvas operates from within the jurisdiction of Fictionland and may store or process data in other regions. By using easyCanvas, you consent to the transfer, processing, and storage of your information in jurisdictions where data protection laws may differ from those in your home country.
              </p>
            </section>

            {/* 9. Data Retention */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">9. Data Retention</h2>
              <p className="text-gray-400 leading-relaxed">
                We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy or as required by law. If you request deletion of your account, we will remove all personally identifiable data within a reasonable timeframe, unless we are required to retain certain information to comply with legal obligations.
              </p>
            </section>

            {/* 10. User Rights */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">10. Your Rights</h2>
              <ul className="text-gray-400 leading-relaxed space-y-2 list-disc list-inside">
                <li>
                  <strong>Access &amp; Correction:</strong> You can view and edit the personal information we hold about you through your account settings.
                </li>
                <li>
                  <strong>Data Portability:</strong> You may request a copy of the data we maintain about you in a commonly used electronic format.
                </li>
                <li>
                  <strong>Deletion:</strong> You can delete your account and all associated data at any time, subject to any legal obligations requiring us to retain certain records.
                </li>
                <li>
                  <strong>Opt-Out:</strong> You may opt out of certain data processing activities, including AI analytics, by adjusting your settings or contacting us directly.
                </li>
              </ul>
            </section>

            {/* 11. Third-Party Links */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">11. Third-Party Links</h2>
              <p className="text-gray-400 leading-relaxed">
                Our website may contain links to third-party sites or services. We are not responsible for the privacy practices of these external websites. We encourage you to review the privacy policies of any website you visit before providing any personal information.
              </p>
            </section>

            {/* 12. Changes to This Privacy Policy */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-400 leading-relaxed">
                We may update our Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we do, we will revise the “Last updated” date at the top of this page. We may also provide additional notice, such as an in-app notification or email, depending on the significance of the changes. Your continued use of easyCanvas following the posting of any modifications constitutes acceptance of those changes.
              </p>
            </section>

            {/* 13. Contact Us */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">13. Contact Us</h2>
              <p className="text-gray-400 leading-relaxed">
                If you have any questions, concerns, or comments about this Privacy Policy or our data practices, please reach out to us at:
                <br />
                <span className="block mt-1">Email: support@easycanvas.com</span>
                <span className="block">Address: 1234 Imaginary Drive, Suite 100, Fictionland, 56789</span>
              </p>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              By using easyCanvas, you acknowledge that you have read, understood, and agree to the terms of this Privacy Policy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;