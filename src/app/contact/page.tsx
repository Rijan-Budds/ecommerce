"use client";
import React, { useState } from "react";
import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import { AnimatedSupportCard } from "@/components/AnimatedSupportCard";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/app/contact/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
    </div>
  ),
});



export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Have a question about a product or an order? We&apos;re here to help.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 rounded-xl border bg-white dark:bg-gray-900 dark:text-white shadow-lg"
          >
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Get in Touch</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                Have a question or need support? Send us a message and we&apos;ll respond as soon as possible.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 h-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how we can help you..."
                required
              />
            </div>
            
            <div className="mt-6">
              <AnimatedSupportCard />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200 shadow-lg"
            >
              Send Message
            </button>
            {sent && (
              <p className="text-green-600 mt-2">
                Thanks! We’ll get back to you soon.
              </p>
            )}
          </form>

          <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 dark:text-white space-y-4 shadow-lg">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Our Location</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Visit us at Suryamadhi, Bhaktapur, Nepal
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <MapComponent />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                📍 Suryamadhi, Bhaktapur 44800, Nepal
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
