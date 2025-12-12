import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-lg font-bold">Monitor</Link>
          <Link href="/dashboard" className="hover:text-blue-500">Dashboard</Link>
          <Link href="/tasks" className="hover:text-blue-500">Tasks</Link>
        </div>
      </div>
    </nav>
  );
}
