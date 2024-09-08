import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

const DynamicHeader = ({ session }) => {
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      toast.error('Your session has expired. Please sign in to continue.', {
        duration: 5000,
        action: {
          label: 'Sign In',
          onClick: () => router.push('/signin')
        }
      })
      router.push('/signin')
    }
  }, [session, router])

  return null
}

export default DynamicHeader