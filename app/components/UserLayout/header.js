import Image from 'next/image'
import Link from 'next/link'
import { useSession } from "next-auth/react"
import { Bell } from 'lucide-react'

const Header = () => {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 bg-white shadow-sm z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/home">
          <h1 className="text-2xl font-bold text-black">QueueSmart</h1>
        </Link>
        <nav className="flex items-center space-x-4">
          {session?.user && (
            <>
              <div className="flex items-center space-x-2">
                <Image
                  src={session.user.image || "https://via.placeholder.com/40"}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-gray-700">{session.user.name}</span>
              </div>
              <button className="text-gray-600 hover:text-gray-800">
                <Bell size={24} />
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
