'use client'

import { Card, CardBody, Button, Avatar, Divider, Switch } from "@nextui-org/react"
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
    const router = useRouter()

    // Mock user data
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: '/default-avatar.png'
    }

    const menuItems = [
        { icon: User, label: 'Personal Information', href: '/new/profile' },
        { icon: Bell, label: 'Notifications', href: '/new/notifications' },
        { icon: Shield, label: 'Security', href: '/new/security' },
        { icon: HelpCircle, label: 'Help & Support', href: '/new/support' },
    ]

    return (
        <div className="min-h-screen p-4 pb-24 dark:bg-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>

            {/* User Profile Card */}
            <Card className="mb-6">
                <CardBody className="flex flex-row items-center gap-4 p-6">
                    <Avatar
                        src={user.avatar}
                        className="w-16 h-16 text-large"
                        isBordered
                        color="primary"
                    />
                    <div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                </CardBody>
            </Card>

            {/* Menu Items */}
            <Card className="mb-6">
                <CardBody className="p-0">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <div key={index}>
                                <Button
                                    variant="light"
                                    className="w-full justify-between p-6 h-auto rounded-none"
                                    endContent={<ChevronRight className="w-5 h-5 text-gray-400" />}
                                    onPress={() => {}}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </div>
                                        <span className="text-base font-medium">{item.label}</span>
                                    </div>
                                </Button>
                                {index < menuItems.length - 1 && <Divider />}
                            </div>
                        )
                    })}
                </CardBody>
            </Card>

            {/* Settings */}
            <h3 className="text-lg font-semibold mb-3 px-1">Preferences</h3>
            <Card className="mb-6">
                <CardBody className="p-0">
                     <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                            <span className="text-base font-medium">Dark Mode</span>
                        </div>
                        <Switch defaultSelected size="sm" />
                    </div>
                    <Divider />
                     <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                            <span className="text-base font-medium">App Settings</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </CardBody>
            </Card>

            <Button
                color="danger"
                variant="flat"
                className="w-full font-medium"
                startContent={<LogOut className="w-4 h-4" />}
            >
                Log Out
            </Button>
        </div>
    )
}
