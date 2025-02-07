export default async function TermsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="mb-4">
          Welcome to our Terms of Service. By using our application, you agree to the following terms and conditions.
          Please read them carefully.
        </p>
        <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat
          molestie vehicula.
        </p>
        <h2 className="text-2xl font-semibold mb-2">2. Use of the Service</h2>
        <p className="mb-4">
          Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Nulla vitae elit
          libero, a pharetra augue.
        </p>
        <h2 className="text-2xl font-semibold mb-2">3. Modifications to the Terms</h2>
        <p className="mb-4">
          Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Cras mattis consectetur purus
          sit amet fermentum.
        </p>
        <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
}
