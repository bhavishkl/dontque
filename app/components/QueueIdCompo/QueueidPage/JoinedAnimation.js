'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

export default function JoinedAnimation({ show, queuePosition }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Hide animation after 2.5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [show])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
              transition: { delay: 0.1, duration: 0.4 },
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-lg p-8 flex flex-col items-center max-w-md mx-4"
          >
            <motion.div
              className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full p-4 mb-4"
              initial={{ scale: 0 }}
              animate={{
                scale: [0, 1.2, 1],
                transition: { delay: 0.3, duration: 0.5, times: [0, 0.6, 1] },
              }}
            >
              <CheckCircle className="h-12 w-12" />
            </motion.div>
            
            <motion.h2
              className="text-2xl font-bold mb-2 text-center dark:text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.5, duration: 0.3 },
              }}
            >
              Successfully Joined Queue!
            </motion.h2>
            
            <motion.p
              className="text-gray-600 dark:text-gray-400 text-center mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.6, duration: 0.3 },
              }}
            >
              You are now in position #{queuePosition}
            </motion.p>
            
            <motion.div
              className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mb-4"
              initial={{ opacity: 0, width: "0%" }}
              animate={{
                opacity: 1,
                width: "100%",
                transition: { delay: 0.7, duration: 0.5 },
              }}
            >
              <motion.div
                className="bg-green-500 h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: "100%",
                  transition: { delay: 0.8, duration: 1.5 },
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}