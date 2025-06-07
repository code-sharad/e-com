"use client"
import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-background border-t border-gold-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <Image src="/logo1.png" alt="Global Saanvika" width={50} height={50} className="w-10 h-10" />
              <span className="font-serif text-xl font-bold text-gold-500">Global Saanvika</span>
            </Link>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Crafting timeless elegance through exquisite jewelry, photo frames, and resin art. Each piece tells a
              story of luxury and sophistication.
            </p>

            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-gold-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-gold-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-gold-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/category/jewelry" className="text-muted-foreground hover:text-gold-500 transition-colors">
                  Jewelry Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/category/photo-frames"
                  className="text-muted-foreground hover:text-gold-500 transition-colors"
                >
                  Photo Frames
                </Link>
              </li>
              <li>
                <Link
                  href="/category/resin-art"
                  className="text-muted-foreground hover:text-gold-500 transition-colors"
                >
                  Resin Art
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-gold-500 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

         
          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-6">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold-500" />
                <span className="text-muted-foreground">info@globalsaanvika.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold-500" />
                <span className="text-muted-foreground">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gold-500" />
                <span className="text-muted-foreground">Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gold-200/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">© 2024 Global Saanvika. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-muted-foreground hover:text-gold-500 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-gold-500 text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
