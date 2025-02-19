import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="w-full mt-[8rem] mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
      <p className="text-gray-600 mb-6">
        Your privacy is important to us. This Privacy Policy outlines how we
        collect, use, and protect your information.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 mb-3">
        1. Information We Collect
      </h2>
      <p className="text-gray-600 mb-4">
        We may collect personal information such as your name, email address,
        and other contact details when you use our website.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 mb-3">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>To provide and maintain our services</li>
        <li>To personalize user experience</li>
        <li>To communicate with you about updates and promotions</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-700 mb-3">
        3. Data Protection
      </h2>
      <p className="text-gray-600 mb-4">
        We implement security measures to safeguard your personal data from
        unauthorized access or disclosure.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 mb-3">4. Cookies</h2>
      <p className="text-gray-600 mb-4">
        We use cookies to enhance user experience and analyze website traffic.
        You can control cookie preferences in your browser settings.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 mb-3">
        5. Third-Party Services
      </h2>
      <p className="text-gray-600 mb-4">
        We may use third-party services for analytics and advertising. These
        services may collect data about your interactions with our site.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 mb-3">
        6. Changes to This Policy
      </h2>
      <p className="text-gray-600 mb-4">
        We may update this Privacy Policy periodically. Any changes will be
        posted on this page with an updated revision date.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 mb-3">
        7. Contact Us
      </h2>
      <p className="text-gray-600 mb-4">
        If you have any questions about this Privacy Policy, please contact us
        at support@example.com.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
