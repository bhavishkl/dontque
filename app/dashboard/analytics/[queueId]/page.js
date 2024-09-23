'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowLeft, Users, Clock, TrendingUp, Settings, Download, Repeat, Star } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Select, SelectItem, Tabs, Tab, Skeleton } from "@nextui-org/react"
import { useApi } from '@/app/hooks/useApi'

export default function QueueAnalyticsPage({ params }) {
  const [timeRange, setTimeRange] = useState('today')

  const { data: queueData, isLoading, isError, mutate: refetchQueueData } = useApi(`/api/analytics?range=${timeRange}&queueId=${params.queueId}`)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}&queueId=${params.queueId}`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to export data')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `analytics_${timeRange}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting data:', err)
      toast.error('Failed to export data')
    }
  }
  
  

  if (isError) {
    return <div>Error: {isError}</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="w-32 h-6">
              <Skeleton className="rounded-lg" />
            </div>
            <div className="w-48 h-8">
              <Skeleton className="rounded-lg" />
            </div>
            <div className="w-24 h-10">
              <Skeleton className="rounded-lg" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div className="w-44 h-10">
              <Skeleton className="rounded-lg" />
            </div>
            <div className="w-36 h-10">
              <Skeleton className="rounded-lg" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardBody>
                  <Skeleton className="rounded-lg w-full h-24" />
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {[...Array(2)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="rounded-lg w-48 h-6" />
                </CardHeader>
                <CardBody>
                  <Skeleton className="rounded-lg w-full h-[300px]" />
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardBody>
                  <Skeleton className="rounded-lg w-full h-24" />
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {[...Array(2)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="rounded-lg w-48 h-6" />
                </CardHeader>
                <CardBody>
                  <Skeleton className="rounded-lg w-full h-[300px]" />
                </CardBody>
              </Card>
            ))}
          </div>

          <Skeleton className="rounded-lg w-full h-12 mb-4" />
          <Card>
            <CardHeader>
              <Skeleton className="rounded-lg w-64 h-6" />
            </CardHeader>
            <CardBody>
              <Skeleton className="rounded-lg w-full h-32" />
            </CardBody>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/queue-owner/dashboard" className="flex items-center text-blue-600 dark:text-blue-400">
            <ArrowLeft className="mr-2" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">{queueData.name} Analytics</h1>
          <Button variant="bordered" startContent={<Settings />}>
            Settings
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Select 
            value={timeRange} 
            onChange={(e) => {
              setTimeRange(e.target.value)
              fetchAnalyticsData(e.target.value)
            }}
            className="w-[180px]"
          >
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </Select>
          <Button startContent={<Download />} onClick={handleExport}>
            Export Data
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Queue</p>
                <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-2xl font-bold dark:text-white">{queueData.currentQueue}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">people in line</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Wait Time</p>
                <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-2xl font-bold dark:text-white">{queueData.averageWaitTime} min</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">per customer</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Served</p>
                <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-2xl font-bold dark:text-white">{queueData.totalServed}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">customers today</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold dark:text-white">Hourly Queue Traffic</h3>
            </CardHeader>
            <CardBody>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={queueData.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="customers" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold dark:text-white">Average Wait Time Trend</h3>
            </CardHeader>
            <CardBody>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={queueData.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgWaitTime" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Peak Hour</p>
                <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-2xl font-bold dark:text-white">{queueData.peakHour}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">busiest time of day</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Repeat Customers</p>
                <Repeat className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-2xl font-bold dark:text-white">{queueData.repeatCustomers}%</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">of total customers</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer Satisfaction</p>
                <Star className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-2xl font-bold dark:text-white">{queueData.customerSatisfaction}/5</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">average rating</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold dark:text-white">Customer Types</h3>
            </CardHeader>
            <CardBody>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={queueData.customerTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {queueData.customerTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold dark:text-white">Weekly Customer Trend</h3>
            </CardHeader>
            <CardBody>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={queueData.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="customers" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        <Tabs aria-label="Analytics tabs">
          <Tab key="customer-feedback" title="Customer Feedback">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold dark:text-white">Customer Feedback Analysis</h3>
              </CardHeader>
              <CardBody>
                <p className="dark:text-gray-300">Detailed customer feedback analysis and trends will be displayed here.</p>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="staff-performance" title="Staff Performance">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold dark:text-white">Staff Performance Metrics</h3>
              </CardHeader>
              <CardBody>
                <p className="dark:text-gray-300">Staff performance metrics, efficiency analysis, and trends will be shown here.</p>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </main>
    </div>
  )
}