'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, CardBody, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useUserInfo } from './hooks/useUserName';
import PerformanceMetrics from './components/PerformanceMetrics';

export default function LandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { role } = useUserInfo(session?.user?.id);

  useEffect(() => {
    if (session) {
      if (role === 'business') {
        router.push('/dashboard');
      } else {
        router.push('/user/home');
      }
    }
  }, [session, router, role]);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      {/* Header */}
      <Navbar className="bg-white/90 backdrop-blur-sm shadow-sm">
        <NavbarBrand>
          <Link href="/" className="text-2xl font-bold text-black">QueueSmart</Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="#features" className="text-gray-600 hover:text-black">Features</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="#how-it-works" className="text-gray-600 hover:text-black">How It Works</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="#pricing" className="text-gray-600 hover:text-black">Pricing</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="#case-studies" className="text-gray-600 hover:text-black">Case Studies</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="#faq" className="text-gray-600 hover:text-black">FAQ</Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <Button color="default" onClick={handleStartFreeTrial}>Get Started</Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main>
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-black">
              Revolutionize Your Queue Management
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your waiting lines, enhance customer satisfaction, and boost efficiency with QueueSmart's cutting-edge AI-powered solution.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" color="default" onClick={handleStartFreeTrial}>
                Start Free Trial
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
              <Button size="lg" variant="bordered">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-black">Why Choose QueueSmart?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardBody className="text-center">
                  <div className="text-4xl mb-4">⏱️</div>
                  <h3 className="text-xl font-semibold mb-2 text-black">AI-Powered Queue Optimization</h3>
                  <p className="text-gray-600">Our advanced AI algorithms dynamically adjust queue flow, minimizing wait times and maximizing efficiency.</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold mb-2 text-black">Seamless Virtual Queues</h3>
                  <p className="text-gray-600">Allow customers to join queues remotely and receive real-time updates through our intuitive mobile app.</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2 text-black">Predictive Analytics</h3>
                  <p className="text-gray-600">Gain valuable insights into customer behavior and optimize your service with our advanced analytics dashboard.</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-black">How QueueSmart Works</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <ol className="space-y-6">
                  <li className="flex items-start">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white font-bold mr-4">1</span>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-black">Set Up Your Smart Queue</h3>
                      <p className="text-gray-600">Customize your queue settings and integrate with your existing systems in minutes.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white font-bold mr-4">2</span>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-black">AI-Powered Queue Management</h3>
                      <p className="text-gray-600">Our AI continuously optimizes your queue, adjusting to real-time conditions and predicting peak times.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white font-bold mr-4">3</span>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-black">Enhance Customer Experience</h3>
                      <p className="text-gray-600">Provide real-time updates, personalized wait times, and virtual queue options to delight your customers.</p>
                    </div>
                  </li>
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

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-black">Simple, Transparent Pricing</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Starter", price: "$99", features: ["Up to 100 queue entries/month", "Basic analytics", "Email support"] },
                { name: "Pro", price: "$299", features: ["Unlimited queue entries", "Advanced analytics", "Priority support", "Custom branding"] },
                { name: "Enterprise", price: "Custom", features: ["Unlimited queue entries", "Advanced analytics & reporting", "Dedicated account manager", "On-premise deployment option"] }
              ].map((plan, index) => (
                <Card key={index}>
                  <CardBody className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-black">{plan.name}</h3>
                    <p className="text-3xl font-bold mb-4 text-black">{plan.price}<span className="text-sm font-normal text-gray-600">/month</span></p>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button color="default" className="w-full">{plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}</Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section id="case-studies" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-black">Success Stories</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { 
                  title: "Reducing Wait Times by 40% at CityHospital",
                  description: "Learn how CityHospital implemented QueueSmart to streamline patient flow and significantly reduce wait times in their emergency department.",
                  image: "/placeholder.svg"
                },
                {
                  title: "Boosting Customer Satisfaction at MegaRetail",
                  description: "Discover how MegaRetail used QueueSmart's virtual queue system to enhance the shopping experience and increase customer satisfaction scores by 25%.",
                  image: "/placeholder.svg"
                }
              ].map((study, index) => (
                <Card key={index}>
                  <CardBody className="p-0">
                    <Image src={study.image} alt={study.title} width={400} height={300} className="w-full h-48 object-cover" />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-black">{study.title}</h3>
                      <p className="text-gray-600 mb-4">{study.description}</p>
                      <Button color="default" variant="light">Read Full Case Study</Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-black">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { q: "How does QueueSmart's AI optimize queues?", a: "Our AI analyzes historical data, real-time conditions, and predictive models to dynamically adjust queue flow, allocate resources, and provide accurate wait time estimates." },
                { q: "Can QueueSmart integrate with my existing systems?", a: "Yes, QueueSmart offers APIs and pre-built integrations with popular CRM, POS, and scheduling systems to seamlessly fit into your existing tech stack." },
                { q: "Is QueueSmart suitable for small businesses?", a: "We offer scalable solutions that cater to businesses of all sizes, from small local shops to large enterprises." },
                { q: "How secure is the data stored in QueueSmart?", a: "We prioritize data security and comply with industry standards. All data is encrypted in transit and at rest, and we offer GDPR and CCPA compliant data handling." }
              ].map((faq, index) => (
                <div key={index}>
                  <h3 className="text-xl font-semibold mb-2 text-black">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-black text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Revolutionize Your Queue Management?</h2>
            <p className="text-xl mb-8">Join thousands of businesses already using QueueSmart to transform their operations.</p>
            <Button size="lg" color="default" onClick={handleStartFreeTrial}>
              Get Started Now
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
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
      <PerformanceMetrics />
    </div>
  );
}