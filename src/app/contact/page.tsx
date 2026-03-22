"use client";

import React, { useState } from "react";
import { Button } from "@/components/Button";
import Swal from "sweetalert2";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        (e.target as HTMLFormElement).reset();
        await Swal.fire({
          title: "Pesan Terkirim!",
          text: "Terima kasih! Saya akan segera membalas pesan Anda.",
          icon: "success",
          confirmButtonColor: "#f97066",
          background: "#18181b",
          color: "#fff",
        });
      } else {
        await Swal.fire({
          title: "Gagal Mengirim!",
          text: "Terjadi kesalahan saat mengirim pesan. Pastikan Form ID sudah dikonfigurasi.",
          icon: "error",
          confirmButtonColor: "#f97066",
          background: "#18181b",
          color: "#fff",
        });
      }
    } catch {
      await Swal.fire({
        title: "Error!",
        text: "Tidak dapat mengirim pesan. Coba lagi nanti.",
        icon: "error",
        confirmButtonColor: "#f97066",
        background: "#18181b",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-12 text-center" data-aos="fade-up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Get in <span className="text-salmon-500">Touch</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Have a project in mind or just want to say hi? Send me a message, and I'll get back to you as soon as possible.
        </p>
      </div>

      <div data-aos="fade-up" data-aos-delay="150" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-salmon-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-salmon-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Your Name</label>
              <input 
                required 
                type="text" 
                id="name" 
                name="name"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50 transition-all placeholder-zinc-500" 
                placeholder="John Doe" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
              <input 
                required 
                type="email" 
                id="email" 
                name="email"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50 transition-all placeholder-zinc-500" 
                placeholder="john@example.com" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-300">Subject</label>
            <input 
              required 
              type="text" 
              id="subject" 
              name="subject"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50 transition-all placeholder-zinc-500" 
              placeholder="Collaboration Opportunity" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
            <textarea 
              required 
              id="message" 
              name="message"
              rows={6} 
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50 transition-all placeholder-zinc-500 resize-y" 
              placeholder="Tell me about your project..." 
            />
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full md:w-auto px-10" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
