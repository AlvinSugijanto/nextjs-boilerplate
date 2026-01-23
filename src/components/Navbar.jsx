"use client";
import React, { useState } from "react";
import ThemeToggle from "@/components/layout/theme-toggle";
import { Logo } from "@/components/logo";
import { Menu, X } from "lucide-react";

export default function Navbar({ scrolled, isDark }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Product", href: "#product" },
    { name: "Services", href: "#services" },
    { name: "Resources", href: "#resources" },
    { name: "Contact", href: "#contact" },
  ];

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-4 sm:top-8 md:top-12 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? "bg-gray-900/80 backdrop-blur-lg shadow-lg shadow-black/20"
            : "bg-white/80 backdrop-blur-lg shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-2xl lg:max-w-5xl rounded-2xl sm:rounded-3xl lg:rounded-4xl bg-white/10 backdrop-blur mx-4 sm:mx-6 lg:mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-12">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="text-sm lg:text-base text-white dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 mx-4 sm:mx-6 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg overflow-hidden">
          <div className="flex flex-col py-2">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={handleNavClick}
                className="px-6 py-3 text-gray-800 dark:text-gray-200 hover:bg-blue-600/10 dark:hover:bg-blue-400/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
