'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowLeft, Users, Clock, TrendingUp, Settings, Download, Repeat, Star } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Select, SelectItem, Tabs, Tab } from "@nextui-org/react"

// Mock data for the queue analytics
const queueData = {
  name: 'Central Perk Coffee',
  currentQueue: 15,
  averageWaitTime: 20,
  totalServed: 150,
  peakHour: '12PM',
  repeatCustomers: 30,
  customerSatisfaction: 4.2,
  hourlyData: [
    { hour: '9AM', customers: 10, avgWaitTime: 15 },
    { hour: '10AM', customers: 25, avgWaitTime: 18 },
    { hour: '11AM', customers: 35, avgWaitTime: 22 },
    { hour: '12PM', customers: 40, avgWaitTime: 25 },
    { hour: '1PM', customers: 30, avgWaitTime: 20 },
    { hour: '2PM', customers: 20, avgWaitTime: 15 },
    { hour: '3PM', customers: 15, avgWaitTime: 12 },
    { hour: '4PM', customers: 10, avgWaitTime: 10 },
  ],
  customerTypes: [
    { name: 'New', value: 70 },
    { name: 'Returning', value: 30 },
  ],
  weeklyTrend: [
    { day: 'Mon', customers: 120 },
    { day: 'Tue', customers: 135 },
    { day: 'Wed', customers: 140 },
    { day: 'Thu', customers: 150 },
    { day: 'Fri', customers: 180 },
    { day: 'Sat', customers: 200 },
    { day: 'Sun', customers: 170 },
  ],
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function QueueAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('today')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/queue-owner/dashboard" className="flex items-center text-blue-600">
            <ArrowLeft className="mr-2" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold">{queueData.name} Analytics</h1>
          <Button variant="bordered" startContent={<Settings />}>
            Settings
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-[180px]"
          >
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </Select>
          <Button startContent={<Download />}>
            Export Data
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">Current Queue</p>
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{queueData.currentQueue}</div>
              <p className="text-xs text-gray-500">people in line</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">Average Wait Time</p>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{queueData.averageWaitTime} min</div>
              <p className="text-xs text-gray-500">per customer</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">Total Served</p>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{queueData.totalServed}</div>
              <p className="text-xs text-gray-500">customers today</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Hourly Queue Traffic</h3>
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
              <h3 className="text-lg font-semibold">Average Wait Time Trend</h3>
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
                <p className="text-sm text-gray-500">Peak Hour</p>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{queueData.peakHour}</div>
              <p className="text-xs text-gray-500">busiest time of day</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">Repeat Customers</p>
                <Repeat className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{queueData.repeatCustomers}%</div>
              <p className="text-xs text-gray-500">of total customers</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">Customer Satisfaction</p>
                <Star className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{queueData.customerSatisfaction}/5</div>
              <p className="text-xs text-gray-500">average rating</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Customer Types</h3>
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
              <h3 className="text-lg font-semibold">Weekly Customer Trend</h3>
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
                <h3 className="text-lg font-semibold">Customer Feedback Analysis</h3>
              </CardHeader>
              <CardBody>
                <p>Detailed customer feedback analysis and trends will be displayed here.</p>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="staff-performance" title="Staff Performance">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Staff Performance Metrics</h3>
              </CardHeader>
              <CardBody>
                <p>Staff performance metrics, efficiency analysis, and trends will be shown here.</p>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </main>
    </div>
  )
}