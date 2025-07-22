'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@nextui-org/react"
import { Clock, Users, ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-orange-500 pt-24 pb-0">
      <div className="absolute inset-x-0 top-0 h-96 bg-[linear-gradient(to_right,#f1f1f1_1px,transparent_1px),linear-gradient(to_bottom,#f1f1f1_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,white_10%,transparent)]"></div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <div className="mt-4 sm:mt-8 flex items-center gap-4">
            <Link href="#" className="inline-flex items-center">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold leading-6 text-orange-600 ring-1 ring-inset ring-orange-600/20">
                What&apos;s new
              </span>
              <span className="ml-4 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">2,000+</span> businesses joined last month
              </span>
            </Link>
          </div>

          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Stop losing customers to long queues
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Don&apos;t let outdated queue management cost you business. Join smart businesses saving 
            <span className="text-orange-600 font-semibold"> 30+ hours weekly </span> 
            and reducing customer walkouts by
            <span className="text-orange-600 font-semibold"> 70% </span>
            with AI-powered queue management.
          </p>
          
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6">
            <div className="flex gap-2 items-center bg-orange-50 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-700">Cut wait times by 60%</span>
            </div>
            <div className="flex gap-2 items-center bg-orange-50 p-3 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-700">Retain 2x more customers</span>
            </div>
          </div>
          
          <div className="mt-10 flex items-center gap-x-6">
            <Button 
              as={Link}
              href="/signin"
              className="bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20"
              size="lg"
              endContent={<ArrowRight className="w-4 h-4" />}
            >
              Start free trial
            </Button>
            <span className="text-sm text-gray-500">
              Limited time: 30-day free trial
            </span>
          </div>
        </div>
      </div>
    </section>
  )
} 