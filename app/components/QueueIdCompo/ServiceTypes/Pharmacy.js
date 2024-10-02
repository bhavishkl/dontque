'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react"
import { toast } from 'sonner'
import QueueInfoSec from '../QueueidPage/QueueInfoSec'

// Dummy data for development
const dummyPharmacyData = {
  name: "QuickMeds Pharmacy",
  location: "123 Main St, Anytown, USA",
  category: "Pharmacy",
  avg_rating: 4.5,
  total_ratings: 120,
  description: "Your trusted neighborhood pharmacy for all your medication needs.",
  opening_time: "9:00 AM",
  closing_time: "9:00 PM",
  short_id: "QMP123",
  medications: [
    { id: 1, name: "Aspirin", description: "Pain reliever and fever reducer", price: 9.99 },
    { id: 2, name: "Amoxicillin", description: "Antibiotic for bacterial infections", price: 15.99 },
    { id: 3, name: "Lisinopril", description: "ACE inhibitor for high blood pressure", price: 12.99 },
    { id: 4, name: "Metformin", description: "Oral diabetes medicine", price: 8.99 },
    { id: 5, name: "Levothyroxine", description: "Thyroid hormone medication", price: 11.99 },
  ]
}

export default function PharmacyPreOrder({ params }) {
  const [cart, setCart] = useState({})
  const [isOrdering, setIsOrdering] = useState(false)
  const [prescriptionNote, setPrescriptionNote] = useState('')
  const [prescriptionImage, setPrescriptionImage] = useState(null)
  const [placedOrder, setPlacedOrder] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleAddToCart = (itemId) => {
    setCart(prevCart => ({
      ...prevCart,
      [itemId]: { quantity: (prevCart[itemId]?.quantity || 0) + 1, packed: false }
    }))
  }

  const handleRemoveFromCart = (itemId) => {
    setCart(prevCart => {
      const newCart = { ...prevCart }
      if (newCart[itemId].quantity > 1) {
        newCart[itemId] = { ...newCart[itemId], quantity: newCart[itemId].quantity - 1 }
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
      
      const order = {
        items: Object.entries(cart).map(([itemId, { quantity, packed }]) => {
          const item = dummyPharmacyData.medications.find(i => i.id === parseInt(itemId))
          return { ...item, quantity, packed }
        }),
        prescriptionNote,
        prescriptionImage,
        total: Object.entries(cart).reduce((total, [itemId, { quantity }]) => {
          const item = dummyPharmacyData.medications.find(i => i.id === parseInt(itemId))
          return total + (item.price * quantity)
        }, 0)
      }
      
      setPlacedOrder(order)
      toast.success('Order placed successfully')
      setCart({})
      setPrescriptionNote('')
      setPrescriptionImage(null)
    } catch (err) {
      console.error('Error placing order:', err)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsOrdering(false)
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPrescriptionImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const togglePackedStatus = (itemId) => {
    setCart(prevCart => ({
      ...prevCart,
      [itemId]: { ...prevCart[itemId], packed: !prevCart[itemId].packed }
    }))
  }

  const handleShare = () => {
    // Implement share functionality
    toast.success('Share functionality not implemented yet')
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
        <QueueInfoSec queueData={dummyPharmacyData} isLoading={false} handleShare={handleShare} />
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Available Medications</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dummyPharmacyData.medications.map((item) => (
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
                      <span className="mx-2">{cart[item.id].quantity}</span>
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
              {Object.entries(cart).map(([itemId, { quantity, packed }]) => {
                const item = dummyPharmacyData.medications.find(i => i.id === parseInt(itemId))
                return (
                  <div key={itemId} className="flex justify-between items-center mb-2">
                    <span>{item.name} x {quantity}</span>
                    <span>${(item.price * quantity).toFixed(2)}</span>
                    <Button
                      size="sm"
                      color={packed ? "success" : "warning"}
                      onClick={() => togglePackedStatus(itemId)}
                    >
                      {packed ? "Packed" : "Packing"}
                    </Button>
                  </div>
                )
              })}
              <div className="mt-4 text-xl font-bold">
                Total: ${Object.entries(cart).reduce((total, [itemId, { quantity }]) => {
                  const item = dummyPharmacyData.medications.find(i => i.id === parseInt(itemId))
                  return total + (item.price * quantity)
                }, 0).toFixed(2)}
              </div>
              <Textarea
                label="Prescription Notes"
                placeholder="Enter any prescription details or special instructions here"
                value={prescriptionNote}
                onChange={(e) => setPrescriptionNote(e.target.value)}
                className="mt-4"
              />
              <div className="mt-4">
                <label htmlFor="prescription-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <Upload className="mr-2" />
                    <span>Upload Prescription Image</span>
                  </div>
                  <input
                    id="prescription-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                {prescriptionImage && (
                  <div className="mt-4 relative">
                    <img
                      src={prescriptionImage}
                      alt="Prescription"
                      className="max-w-[100px] h-auto rounded-lg cursor-pointer"
                      onClick={onOpen}
                    />
                    <Button
                      isIconOnly
                      color="danger"
                      aria-label="Remove image"
                      size="sm"
                      className="absolute top-0 right-0 -mt-2 -mr-2"
                      onClick={() => setPrescriptionImage(null)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
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

        {placedOrder && (
          <Card className="mt-8 dark:bg-gray-800">
            <CardHeader>
              <h2 className="text-2xl font-bold">Placed Order</h2>
            </CardHeader>
            <CardBody>
              {placedOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                  <span>{item.packed ? "Packed" : "Packing"}</span>
                </div>
              ))}
              <div className="mt-4 text-xl font-bold">
                Total: ${placedOrder.total.toFixed(2)}
              </div>
              {placedOrder.prescriptionNote && (
                <div className="mt-4">
                  <h3 className="font-semibold">Prescription Notes:</h3>
                  <p>{placedOrder.prescriptionNote}</p>
                </div>
              )}
              {placedOrder.prescriptionImage && (
                <div className="mt-4">
                  <h3 className="font-semibold">Prescription Image:</h3>
                  <img
                    src={placedOrder.prescriptionImage}
                    alt="Prescription"
                    className="max-w-[100px] h-auto rounded-lg mt-2 cursor-pointer"
                    onClick={onOpen}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </main>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Prescription Image</ModalHeader>
              <ModalBody>
                <img
                  src={prescriptionImage || (placedOrder && placedOrder.prescriptionImage)}
                  alt="Prescription"
                  className="w-full h-auto"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
