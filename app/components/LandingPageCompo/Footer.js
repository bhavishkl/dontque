'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@nextui-org/react"
import { Button } from "@nextui-org/react"
import { Facebook, Twitter, Instagram, Github, Youtube, ArrowRight } from 'lucide-react'

export default function Footer() {
  const footerSections = [
    {
      title: "Solutions",
      links: [
        { name: "Marketing", href: "#" },
        { name: "Analytics", href: "#" },
        { name: "Automation", href: "#" },
        { name: "Commerce", href: "#" },
        { name: "Insights", href: "#" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Submit ticket", href: "#" },
        { name: "Documentation", href: "#" },
        { name: "Guides", href: "#" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Jobs", href: "#" },
        { name: "Press", href: "#" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of service", href: "#" },
        { name: "Privacy policy", href: "#" },
        { name: "License", href: "#" }
      ]
    }
  ]

  const socialLinks = [
    { icon: <Facebook size={20} />, href: "#" },
    { icon: <Instagram size={20} />, href: "#" },
    { icon: <Twitter size={20} />, href: "#" },
    { icon: <Github size={20} />, href: "#" },
    { icon: <Youtube size={20} />, href: "#" }
  ]

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Revolutionize Your Queue Management?</h2>
          <p className="text-xl mb-8 text-orange-100">Join thousands of businesses already using QueueSmart to transform their operations.</p>
          <Button 
            size="lg" 
            className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
            endContent={<ArrowRight className="w-5 h-5" />}
          >
            Get Started Now
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Logo and Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div>
            <Link href="/" className="inline-block mb-6">
              <Image src="/logo.webp" alt="dontque Logo" width={40} height={40} />
            </Link>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 p-2 rounded-full"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-orange-600 font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-600 hover:text-orange-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Subscribe to our newsletter
              </h3>
              <p className="text-gray-600">
                The latest news, articles, and resources, sent to your inbox weekly.
              </p>
            </div>
            <div className="flex gap-2 md:justify-end">
              <Input 
                placeholder="Enter your email" 
                className="max-w-xs bg-orange-50"
                classNames={{
                  input: "text-gray-900",
                  inputWrapper: "border border-orange-100 hover:border-orange-500 focus-within:border-orange-500"
                }}
              />
              <Button 
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 mt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2024 QueueSmart, Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-gray-600 hover:text-orange-600 text-sm">Privacy Policy</Link>
            <Link href="#" className="text-gray-600 hover:text-orange-600 text-sm">Terms of Service</Link>
            <Link href="#" className="text-gray-600 hover:text-orange-600 text-sm">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 