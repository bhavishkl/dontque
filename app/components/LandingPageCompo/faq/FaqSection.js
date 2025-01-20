'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between items-center w-full py-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <Plus 
          className={`w-5 h-5 text-orange-600 transition-transform duration-200 ${
            isOpen ? 'rotate-45' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-48 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600">{answer}</p>
      </div>
    </div>
  )
}

export default function FaqSection() {
  const faqs = [
    {
      question: "How does QueueSmart's AI optimize queues?",
      answer: "Our AI analyzes historical data, real-time conditions, and predictive models to dynamically adjust queue flow, allocate resources, and provide accurate wait time estimates."
    },
    {
      question: "Can QueueSmart integrate with my existing systems?",
      answer: "Yes, QueueSmart offers APIs and pre-built integrations with popular CRM, POS, and scheduling systems to seamlessly fit into your existing tech stack."
    },
    {
      question: "Is QueueSmart suitable for small businesses?",
      answer: "We offer scalable solutions that cater to businesses of all sizes, from small local shops to large enterprises, with flexible pricing plans to match your needs."
    },
    {
      question: "How secure is the data stored in QueueSmart?",
      answer: "We prioritize data security with bank-grade encryption, regular security audits, and full compliance with GDPR and CCPA regulations for data protection."
    },
    {
      question: "What kind of support do you offer?",
      answer: "We provide 24/7 technical support, dedicated account managers for enterprise clients, and comprehensive documentation to ensure your success."
    },
    {
      question: "How long does it take to set up?",
      answer: "Most businesses can get started within minutes. Our no-code setup process and intuitive interface make implementation quick and hassle-free."
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
         
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 mt-2">
            Frequently asked questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about QueueSmart and how it works.
          </p>
        </div>

        <div className="divide-y divide-gray-200 border-t border-gray-200">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
} 