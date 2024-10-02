'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react"
import { toast } from 'sonner'

// Dummy data for development
const dummyQueueData = {
  name: "Street Food Fiesta",
  menu: [
    { id: 1, name: "Tacos al Pastor", description: "Marinated pork tacos with pineapple", price: 8.99 },
    { id: 2, name: "Pad Thai", description: "Thai stir-fried rice noodles", price: 10.99 },
    { id: 3, name: "Falafel Wrap", description: "Crispy falafel with tahini sauce", price: 7.99 },
    { id: 4, name: "Churros", description: "Spanish fried-dough pastry", price: 5.99 },
    { id: 5, name: "Bubble Tea", description: "Taiwanese tea-based drink", price: 4.99 },
  ]
}

export default function StreetFoodPreOrder({ params }) {
  const [cart, setCart] = useState({})
  const [isOrdering, setIsOrdering] = useState(false)

  const handleAddToCart = (itemId) => {
    setCart(prevCart => ({
      ...prevCart,
      [itemId]: (prevCart[itemId] || 0) + 1
    }))
  }

  const handleRemoveFromCart = (itemId) => {
    setCart(prevCart => {
      const newCart = { ...prevCart }
      if (newCart[itemId] > 1) {
        newCart[itemId]--
      } else {
        delete newCart[itemId]
      }
      return newCart
    })
  }

  const handlePlaceOrder = async () => {
    setIsOrdering(true)
    try {
      // Simulating order placement with setTimeout
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Order placed successfully')
      setCart({})
    } catch (err) {
      console.error('Error placing order:', err)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/user/queues" className="flex items-center text-blue-600 dark:text-blue-400">
          <ArrowLeft className="mr-2" />
          <span className="font-semibold">Back to Queues</span>
        </Link>
      </div>

      <main className="container mx-auto px-4 py-2">
        <h1 className="text-3xl font-bold mb-6">{dummyQueueData.name} Menu</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dummyQueueData.menu.map((item) => (
            <Card key={item.id} className="dark:bg-gray-800">
              <CardBody>
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                <p className="text-lg font-bold mb-4">${item.price.toFixed(2)}</p>
                <div className="flex items-center justify-between">
                  <Button color="primary" onClick={() => handleAddToCart(item.id)}>
                    Add to Cart
                  </Button>
                  {cart[item.id] && (
                    <div className="flex items-center">
                      <Button size="sm" onClick={() => handleRemoveFromCart(item.id)}>-</Button>
                      <span className="mx-2">{cart[item.id]}</span>
                      <Button size="sm" onClick={() => handleAddToCart(item.id)}>+</Button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {Object.keys(cart).length > 0 && (
          <Card className="mt-8 dark:bg-gray-800">
            <CardHeader>
              <h2 className="text-2xl font-bold">Your Order</h2>
            </CardHeader>
            <CardBody>
              {Object.entries(cart).map(([itemId, quantity]) => {
                const item = dummyQueueData.menu.find(i => i.id === parseInt(itemId))
                return (
                  <div key={itemId} className="flex justify-between items-center mb-2">
                    <span>{item.name} x {quantity}</span>
                    <span>${(item.price * quantity).toFixed(2)}</span>
                  </div>
                )
              })}
              <div className="mt-4 text-xl font-bold">
                Total: ${Object.entries(cart).reduce((total, [itemId, quantity]) => {
                  const item = dummyQueueData.menu.find(i => i.id === parseInt(itemId))
                  return total + (item.price * quantity)
                }, 0).toFixed(2)}
              </div>
              <Button 
                color="success" 
                className="mt-4 w-full"
                onClick={handlePlaceOrder}
                isLoading={isOrdering}
              >
                {isOrdering ? 'Placing Order...' : 'Place Order'}
              </Button>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  )
}
