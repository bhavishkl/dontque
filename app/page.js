'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, CardBody, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  const handleStartFreeTrial = () => {
    router.push('/signin');
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <Navbar className="bg-white/90 backdrop-blur-sm shadow-sm">
        <NavbarBrand>
          <Link href="/" className="text-2xl font-bold text-blue-600">QueueSmart</Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="#features" className="text-gray-600 hover:text-blue-600">Features</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600">How It Works</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="#testimonials" className="text-gray-600 hover:text-blue-600">Testimonials</Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <Button color="primary">Get Started</Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main>
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold mb-6">Revolutionize Your Queue Management</h1>
            <p className="text-xl text-gray-600 mb-8">Streamline your waiting lines, enhance customer satisfaction, and boost efficiency with QueueSmart.</p>
            <div className="flex justify-center gap-4">
              <Button size="lg" color="primary" onClick={handleStartFreeTrial}>
                Start Free Trial
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
              <Button size="lg" variant="bordered">Watch Demo</Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose QueueSmart?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "⏱️", title: "Reduce Wait Times", description: "Optimize your queue flow and minimize customer wait times with our advanced algorithms." },
                { icon: "📱", title: "Virtual Queues", description: "Allow customers to join queues remotely and receive real-time updates on their phones." },
                { icon: "📊", title: "Customer Insights", description: "Gain valuable data on customer behavior and preferences to improve your service." }
              ].map((feature, index) => (
                <Card key={index}>
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How QueueSmart Works</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <ol className="space-y-6">
                  {[
                    { title: "Set Up Your Queue", description: "Create and customize your queue in minutes with our intuitive interface." },
                    { title: "Customers Join", description: "Customers can join your queue in-person or virtually through our mobile app." },
                    { title: "Manage and Optimize", description: "Use our dashboard to manage your queue in real-time and optimize your service." }
                  ].map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold mr-4">{index + 1}</span>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="relative h-96">
                <Image
                  src="/placeholder.svg"
                  alt="QueueSmart Dashboard"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg shadow-lg"
                />
                {!isVideoPlaying && (
                  <Button 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    Play Demo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-blue-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Sarah Johnson", role: "Restaurant Owner", content: "QueueSmart has transformed our busy restaurant. Our customers love the virtual queue option!" },
                { name: "Michael Chen", role: "Retail Manager", content: "The insights we've gained from QueueSmart have helped us optimize our staffing and reduce wait times." },
                { name: "Emily Rodriguez", role: "Healthcare Administrator", content: "QueueSmart has greatly improved patient satisfaction in our clinic. It's a game-changer." }
              ].map((testimonial, index) => (
                <Card key={index}>
                  <CardBody>
                    <div className="text-yellow-400 mb-4">★★★★★</div>
                    <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Revolutionize Your Queue Management?</h2>
            <p className="text-xl mb-8">Join thousands of businesses already using QueueSmart to improve their operations.</p>
            <Button size="lg" color="secondary">
              Get Started Now
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: "QueueSmart", content: "Revolutionizing queue management for businesses of all sizes." },
              { title: "Product", links: ["Features", "Pricing", "Case Studies"] },
              { title: "Company", links: ["About Us", "Careers", "Contact"] },
              { title: "Connect", links: ["Twitter", "LinkedIn", "Facebook"] }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                {section.content ? (
                  <p className="text-sm text-gray-400">{section.content}</p>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-400">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}><Link href="#">{link}</Link></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>&copy; 2023 QueueSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}