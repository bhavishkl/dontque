'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Clock, Users, ChevronRight, ChevronLeft, Phone, Globe, Instagram, Facebook, Twitter, Plus, Minus, Calendar, Info, Heart, Share2, DollarSign, Utensils, Camera } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Progress, Skeleton } from "@nextui-org/react"

// Mock data for the restaurant (unchanged)
const restaurantData = {
  id: '1',
  name: 'Gourmet Delight',
  location: '123 Foodie St, Culinary City, CC 12345',
  rating: 4.5,
  images: [
    '/placeholder.svg?height=400&width=600',
    '/placeholder.svg?height=400&width=600',
    '/placeholder.svg?height=400&width=600',
  ],
  availability: {
    status: 'available',
    tables: 5,
  },
  estimatedWaitTime: 20, // in minutes
  menu: [
    { name: 'Signature Pasta', price: 18.99, description: 'Handmade pasta with a rich tomato sauce', image: '/placeholder.svg?height=100&width=100', dietary: ['vegetarian'] },
    { name: 'Grilled Salmon', price: 24.99, description: 'Fresh Atlantic salmon with lemon butter sauce', image: '/placeholder.svg?height=100&width=100', dietary: ['gluten-free'] },
    { name: 'Spicy Tofu Stir-Fry', price: 16.99, description: 'Crispy tofu with mixed vegetables in a spicy sauce', image: '/placeholder.svg?height=100&width=100', dietary: ['vegan', 'spicy'] },
  ],
  reviews: [
    { id: 1, user: 'John D.', rating: 5, comment: 'Absolutely fantastic! The flavors were incredible.', date: '2023-06-15' },
    { id: 2, user: 'Sarah M.', rating: 4, comment: 'Great food and atmosphere. Service was a bit slow.', date: '2023-06-10' },
    { id: 3, user: 'Mike R.', rating: 5, comment: 'Best restaurant in town! Can\'t wait to come back.', date: '2023-06-05' },
  ],
  hours: [
    { day: 'Monday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Tuesday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Wednesday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Thursday', hours: '11:00 AM - 11:00 PM' },
    { day: 'Friday', hours: '11:00 AM - 12:00 AM' },
    { day: 'Saturday', hours: '10:00 AM - 12:00 AM' },
    { day: 'Sunday', hours: '10:00 AM - 10:00 PM' },
  ],
  phone: '+1 (555) 123-4567',
  website: 'https://www.gourmetdelight.com',
  socials: {
    instagram: 'gourmet_delight',
    facebook: 'GourmetDelight',
    twitter: 'GourmetDelight',
  },
  safetyProtocols: [
    'Mask required for staff',
    'Regular sanitization',
    'Social distancing enforced',
    'Contactless payment available',
  ],
}

export default function RestaurantPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [partySize, setPartySize] = useState(2)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('menu')

  useEffect(() => {
    const today = new Date()
    setSelectedDate(today.toISOString().split('T')[0])
    setSelectedTime('19:00') // Default to 7 PM
  }, [])

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % restaurantData.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + restaurantData.images.length) % restaurantData.images.length)
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const shareRestaurant = () => {
    // Implement share functionality
    console.log('Sharing restaurant')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">{restaurantData.name}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="font-semibold">{restaurantData.rating}</span>
            </div>
            <Button onClick={() => setIsReservationModalOpen(true)}>Reserve Table</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative h-[60vh] rounded-lg overflow-hidden">
            <Image
              src={restaurantData.images[currentImageIndex]}
              alt={`${restaurantData.name} - Image ${currentImageIndex + 1}`}
              layout="fill"
              objectFit="cover"
              className="transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Button
              variant="bordered"
              size="sm"
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-background/80"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="bordered"
              size="sm"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-background/80"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{restaurantData.name}</h2>
                <p className="text-white/80 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {restaurantData.location}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="bordered" size="sm" onClick={toggleFavorite}>
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                <Button variant="bordered" size="sm" onClick={shareRestaurant}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Info Section */}
        <section className="mb-8">
          <Card>
            <CardBody className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${restaurantData.availability.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {restaurantData.availability.status === 'available'
                      ? `${restaurantData.availability.tables} tables available`
                      : 'Fully Booked'}
                  </span>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{restaurantData.estimatedWaitTime} min wait</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>$$</span>
                  </div>
                </div>
                <Button color="primary" onClick={() => setIsReservationModalOpen(true)}>
                  Reserve Table
                </Button>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Tabs Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex space-x-2">
                <Button 
                  color={activeTab === 'menu' ? 'primary' : 'default'}
                  onClick={() => setActiveTab('menu')}
                >
                  Menu
                </Button>
                <Button 
                  color={activeTab === 'reviews' ? 'primary' : 'default'}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews
                </Button>
                <Button 
                  color={activeTab === 'info' ? 'primary' : 'default'}
                  onClick={() => setActiveTab('info')}
                >
                  Info
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {activeTab === 'menu' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurantData.menu.map((item, index) => (
                    <Card key={index}>
                      <CardBody className="p-4">
                        <div className="flex items-center space-x-4">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-md"
                          />
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <p className="font-semibold mt-1">${item.price.toFixed(2)}</p>
                            <div className="flex space-x-1 mt-1">
                              {item.dietary.map((diet, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{diet}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {restaurantData.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{review.user}</p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{review.date}</p>
                        </div>
                        <p className="mt-2">{review.comment}</p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Business Hours</h3>
                    <ul className="space-y-1">
                      {restaurantData.hours.map((day, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{day.day}</span>
                          <span>{day.hours}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <p className="flex items-center mb-2">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href={`tel:${restaurantData.phone}`} className="text-blue-600">{restaurantData.phone}</a>
                    </p>
                    <p className="flex items-center mb-2">
                      <Globe className="w-4 h-4 mr-2" />
                      <a href={restaurantData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">{restaurantData.website}</a>
                    </p>
                    <div className="flex space-x-4 mt-4">
                      <a href={`https://instagram.com/${restaurantData.socials.instagram}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
                      </a>
                      <a href={`https://facebook.com/${restaurantData.socials.facebook}`} target="_blank" rel="noopener noreferrer">
                        <Facebook className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
                      </a>
                      <a href={`https://twitter.com/${restaurantData.socials.twitter}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </section>
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 bg-background border-t py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">Estimated wait time: {restaurantData.estimatedWaitTime} minutes</p>
          <Button color="primary" onClick={() => console.log('Joining waitlist')}>Join Waitlist</Button>
        </div>
      </footer>
    </div>
  )
}
