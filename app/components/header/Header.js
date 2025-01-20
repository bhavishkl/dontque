'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { useRouter } from 'next/navigation';

export default function Header({ showNavLinks = true }) {
  const router = useRouter();

  const handleStartFreeTrial = () => {
    router.push('/signin');
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Navbar className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm">
      <NavbarBrand>
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo.webp" 
            alt="DontQue Logo" 
            width={32} 
            height={32} 
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
          <span className="ml-2 text-xl sm:text-2xl font-bold text-black dark:text-white">
            Dont<span className="text-orange-600">Que</span>
          </span>
        </Link>
      </NavbarBrand>

      {showNavLinks && (
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link 
              href="#features" 
              className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-200"
              onClick={(e) => scrollToSection(e, 'features')}
            >
              Features
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link 
              href="#pricing" 
              className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-200"
              onClick={(e) => scrollToSection(e, 'pricing')}
            >
              Pricing
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link 
              href="#testimonials" 
              className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-200"
              onClick={(e) => scrollToSection(e, 'testimonials')}
            >
              Testimonials
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link 
              href="#faq" 
              className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-200"
              onClick={(e) => scrollToSection(e, 'faq')}
            >
              FAQ
            </Link>
          </NavbarItem>
        </NavbarContent>
      )}

      <NavbarContent justify="end">
        <NavbarItem>
          <Button 
            className="bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            size="sm"
            onClick={handleStartFreeTrial}
          >
            Get Started
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
} 