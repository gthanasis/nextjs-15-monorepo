import Authenticated from '@/guards/authenticated'

export default async function PublicPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Public Page</h1>
    </div>
  )
}
