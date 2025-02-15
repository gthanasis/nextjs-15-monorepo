export default async function PrivacyPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and safeguard your personal
          information.
        </p>
        <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
        <p className="mb-4">
          We may collect various types of information, including your name, email address, and browsing data when you
          interact with our services.
        </p>
        <h2 className="text-2xl font-semibold mb-2">How We Use Your Information</h2>
        <p className="mb-4">
          The information we collect is used to provide, maintain, and improve our services. We do not sell your
          personal information.
        </p>
        <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
        <p className="mb-4">
          You have the right to access, update, or delete your personal data. Please contact us if you have any
          questions or concerns.
        </p>
        <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
}
