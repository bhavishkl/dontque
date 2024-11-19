import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <div className="text-center">
        <svg
          className="mx-auto mb-8"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="10" className="text-gray-300 dark:text-gray-700" />
          <path
            d="M65 80C65 71.7157 71.7157 65 80 65C88.2843 65 95 71.7157 95 80C95 88.2843 88.2843 95 80 95C71.7157 95 65 88.2843 65 80Z"
            fill="currentColor"
            className="text-gray-600 dark:text-gray-400"
          />
          <path
            d="M105 80C105 71.7157 111.716 65 120 65C128.284 65 135 71.7157 135 80C135 88.2843 128.284 95 120 95C111.716 95 105 88.2843 105 80Z"
            fill="currentColor"
            className="text-gray-600 dark:text-gray-400"
          />
          <path
            d="M60 120C60 120 75 140 100 140C125 140 140 120 140 120"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-red-500 dark:text-red-400"
          />
        </svg>
        <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">404</h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8">Oops! This page seems to be lost in cyberspace.</p>
        <Link href="/" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
          Beam me back home
        </Link>
      </div>
    </div>
  )
}