'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Tabs, Tab } from "@nextui-org/react"
import { ArrowLeft, Settings, Plus } from "lucide-react"
import Link from "next/link"

export default function ManageAdvanced({ params, queueData, isLoading }) {
  const [selectedCounter, setSelectedCounter] = useState("1")
  const [activeTab, setActiveTab] = useState("queue-cards")

  // Mock counters array - replace with actual data later
  const counters = [
    { id: "1", name: "Counter 1" },
    { id: "2", name: "Counter 2" },
    { id: "3", name: "Counter 3" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center text-blue-600 dark:text-blue-400">
            <ArrowLeft className="mr-2" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">
            Advanced Queue Management
          </h1>
          <Button variant="bordered" startContent={<Settings />}>
            Queue Settings
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Counter Selection Tabs */}
        <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
          <Button
            color="primary"
            startContent={<Plus />}
            className="min-w-fit"
          >
            Add Counter
          </Button>
          <div className="flex space-x-2">
            {counters.map((counter) => (
              <Button
                key={counter.id}
                variant={selectedCounter === counter.id ? "solid" : "flat"}
                className="min-w-[120px]"
                onClick={() => setSelectedCounter(counter.id)}
              >
                Counter {counter.id}
              </Button>
            ))}
          </div>
        </div>

        {/* Counter Management Section */}
        <Card className="mb-6">
          <CardHeader className="flex justify-between">
            <h2 className="text-xl font-semibold">Counter {selectedCounter} Management</h2>
            <Button color="success">Counter Active</Button>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardBody>
                  <h3 className="text-lg font-medium mb-2">Current Queue</h3>
                  <p className="text-3xl font-bold">15</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <h3 className="text-lg font-medium mb-2">Average Wait Time</h3>
                  <p className="text-3xl font-bold">25m</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <h3 className="text-lg font-medium mb-2">Service Time</h3>
                  <p className="text-3xl font-bold">10m</p>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>

        {/* Queue Management Tabs */}
        <Tabs 
          aria-label="Queue Management Options" 
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
        >
          <Tab key="queue-cards" title="Queue Cards">
            <Card>
              <CardBody>
                <p className="text-lg">Queue Cards View for Counter {selectedCounter}</p>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="queue-list" title="Queue List">
            <Card>
              <CardBody>
                <p className="text-lg">Queue List View for Counter {selectedCounter}</p>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="analytics" title="Analytics">
            <Card>
              <CardBody>
                <p className="text-lg">Analytics for Counter {selectedCounter}</p>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="settings" title="Settings">
            <Card>
              <CardBody>
                <p className="text-lg">Settings for Counter {selectedCounter}</p>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </main>
    </div>
  )
}

