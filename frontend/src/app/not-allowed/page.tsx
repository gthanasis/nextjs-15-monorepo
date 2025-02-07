import Link from 'next/link'

export default function NotAllowed() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100 px-6 py-12">
      <div className="bg-white shadow-md rounded-lg p-10 max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">You aren&apos;t allowed to access this page</h1>
        <p className="text-lg text-gray-600 mb-8">
          Please return to the homepage or log in with the appropriate credentials to continue.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}
