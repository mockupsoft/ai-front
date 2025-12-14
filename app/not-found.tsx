import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-50">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
          Page Not Found
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Go Home
        </Link>
        <Link
          href="/mgx"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
