"use client";
import React, { useEffect, useState } from "react";
import ThemeToggle from "@/components/layout/theme-toggle";
import { Logo } from "@/components/logo";
import Link from "next/link";
import {
  Activity,
  Bot,
  ChevronDown,
  Cpu,
  DatabaseZap,
  Menu,
  Shield,
  X,
} from "lucide-react";

export default function Navbar({ scrolled, isDark }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    {
      name: "Product",
      href: "#product",
      children: [
        {
          name: "Nawadhya Big Data Platform",
          icon: <DatabaseZap />,
          href: "/nawadhya-big-data",
        },
        {
          name: "Nawadhya Log Monitoring",
          icon: <Activity />,
          href: "/nawadhya-log-monitoring",
        },
        {
          name: "Nawadhya Operating System",
          icon: <Cpu />,
          href: "/nawadhya-os",
        },
        {
          name: "Bodhavara AI Assistant",
          icon: <Bot />,
          href: "/bodhavara-ai-assistant",
        },
        {
          name: "Private On-Premise",
          icon: <Shield />,
          href: "/private-on-premise",
        },
      ],
    },
    { name: "Services", href: "/services" },
    { name: "Resources", href: "/resources" },
    { name: "Contact", href: "/contact" },
  ];

  const handleNavClick = () => {
    setIsMenuOpen(false);
    setIsProductOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll(); // Initial check
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed ${isScrolled ? "top-0" : "top-4 sm:top-8 md:top-8"} left-0 right-0 z-50 transition-all duration-500`}
    >
      <div
        className={`
          lg:mx-auto
          px-4 sm:px-6 py-3 sm:py-3.5
          flex items-center
          transition-all duration-300
          backdrop-blur-xl
          ${isScrolled ? "bg-primary w-full shadow-lg lg:justify-around justify-between" : "bg-white/10 max-w-5xl rounded-2xl sm:rounded-3xl lg:rounded-4xl justify-between"}    
        `}
      >
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-12">
          {navItems.map((item, index) => {
            if (item.children) {
              return (
                <div key={index}>
                  <div className="relative group">
                    <button
                      onClick={() => setIsProductOpen(!isProductOpen)}
                      className="text-sm lg:text-base text-white dark:text-gray-300
                       hover:text-blue-600 dark:hover:text-blue-400
                       transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {item.name}

                      <ChevronDown
                        size={16}
                        className={`transition-all duration-300 ${isProductOpen ? "rotate-180" : "group-hover:rotate-180"}`}
                      />
                    </button>

                    {/* Dropdown */}
                    <div
                      className={`w-fit absolute left-0 pt-3 transition-all duration-300 ${isProductOpen ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"}`}
                    >
                      <div className="min-w-2xl grid grid-cols-2 gap-8 p-6 rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-white/10">
                        {/* PRODUCT SECTION */}
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Product
                          </p>

                          <div className="flex flex-col gap-1">
                            {item.children.slice(0, 4).map((child, i) => (
                              <a
                                key={i}
                                href={child.href}
                                onClick={() => setIsProductOpen(false)}
                                className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200
                     hover:bg-blue-50 dark:hover:bg-white/10
                     hover:text-blue-600 dark:hover:text-blue-400
                     transition-colors rounded-lg flex items-center gap-3"
                              >
                                {child.icon}
                                {child.name}
                              </a>
                            ))}
                          </div>
                        </div>

                        {/* HOSTING SECTION */}
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Hosting
                          </p>

                          <div className="flex flex-col gap-1">
                            {item.children.slice(4).map((child, i) => (
                              <a
                                key={i}
                                href={child.href}
                                onClick={() => setIsProductOpen(false)}
                                className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200
                     hover:bg-blue-50 dark:hover:bg-white/10
                     hover:text-blue-600 dark:hover:text-blue-400
                     transition-colors rounded-lg flex items-center gap-3"
                              >
                                {child.icon}
                                {child.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <a
                key={index}
                href={item.href}
                className="text-sm lg:text-base text-white dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.name}
              </a>
            );
          })}
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
          <div className="flex flex-col py-1">
            {navItems.map((item, index) => (
              <div key={index}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => setIsProductOpen(!isProductOpen)}
                      className="w-full px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-600/10 dark:hover:bg-blue-400/10 transition-colors flex items-center justify-between"
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${isProductOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isProductOpen && (
                      <div className="bg-gray-50 dark:bg-gray-800/50">
                        {item.children.map((child, i) => (
                          <Link
                            key={i}
                            href={child.href}
                            onClick={handleNavClick}
                            className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-600/10 dark:hover:bg-blue-400/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-3 pl-8"
                          >
                            <span className="text-gray-400">{child.icon}</span>
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className="px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-600/10 dark:hover:bg-blue-400/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
