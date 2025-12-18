'use client'

import { NextUIProvider } from '@nextui-org/react'
import { SessionProvider } from "@/lib/mock-auth"

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </SessionProvider>
  )
}