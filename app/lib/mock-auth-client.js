'use client'

import React, { createContext, useContext } from 'react'

export const mockSession = {
  user: {
    id: 'mock-user-id',
    name: 'Mock User',
    email: 'mock@example.com',
    image: null,
    role: 'business',
  },
  expires: '9999-12-31T23:59:59.999Z',
}

export function useSession() {
  return {
    data: mockSession,
    status: 'authenticated',
    update: () => Promise.resolve(mockSession)
  }
}

export async function signIn() {
  console.log('Mock signIn called')
  return Promise.resolve({ error: null, ok: true, status: 200, url: '/' })
}

export async function signOut() {
  console.log('Mock signOut called')
  return Promise.resolve({ url: '/' })
}

const SessionContext = createContext(mockSession)

export function SessionProvider({ children, session }) {
  return (
    <SessionContext.Provider value={session || mockSession}>
      {children}
    </SessionContext.Provider>
  )
}
