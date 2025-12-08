"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MapPin,
  BarChart3,
  Clock,
  Shield,
  ArrowRight,
  CheckCircle,
  Radio,
  Bell,
  TrendingUp,
  Zap,
  Navigation,
  Gauge,
  Moon,
  Sun,
  Monitor,
  Car,
  Truck,
  Bus,
  Settings,
  AlertTriangle,
  Route,
} from "lucide-react";
import Navbar from "../navbar";
import { Logo } from "@/components/logo";
import { useTheme } from "next-themes";
import ClientOnly from "@/components/client-only";

const vehicleAvatars = [
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=100&h=100&fit=crop",
];

export default function LandingView() {
  const { resolvedTheme, setTheme, } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const isDark = useMemo(() => resolvedTheme === "dark", [resolvedTheme]);

  // Dummy vehicle data in Indonesia (Jakarta area)
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      name: "TRK-001",
      type: "truck",
      lat: -6.2088,
      lng: 106.8456,
      speed: 45,
      heading: 90,
      status: "moving",
      color: "#10b981"
    },
    {
      id: 2,
      name: "VAN-042",
      type: "van",
      lat: -6.1751,
      lng: 106.8650,
      speed: 0,
      heading: 0,
      status: "stopped",
      color: "#3b82f6"
    },
    {
      id: 3,
      name: "BUS-203",
      type: "bus",
      lat: -6.2297,
      lng: 106.8200,
      speed: 30,
      heading: 180,
      status: "moving",
      color: "#f59e0b"
    }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Load Mapbox CSS
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load Mapbox JS
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.async = true;
    script.onload = () => {
      const mapboxgl = window.mapboxgl;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12',
        center: [106.8456, -6.2088], // Jakarta
        zoom: 11
      });

      mapInstanceRef.current = map;

      // Add markers for each vehicle
      vehicles.forEach(vehicle => {
        const el = document.createElement('div');
        el.className = 'vehicle-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = vehicle.color;
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.innerHTML = '<div style="color: white; font-size: 18px; font-weight: bold;">•</div>';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([vehicle.lng, vehicle.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 10px; font-family: system-ui;">
                  <h3 style="margin: 0 0 8px 0; font-weight: bold;">${vehicle.name}</h3>
                  <p style="margin: 4px 0; font-size: 14px;">Status: <strong>${vehicle.status}</strong></p>
                  <p style="margin: 4px 0; font-size: 14px;">Speed: <strong>${vehicle.speed} km/h</strong></p>
                </div>
              `)
          )
          .addTo(map);

        markersRef.current.push({ marker, vehicle });
      });
    };
    document.body.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isDark, vehicles]);

  // Update marker positions
  useEffect(() => {
    markersRef.current.forEach(({ marker, vehicle: oldVehicle }) => {
      const updatedVehicle = vehicles.find(v => v.id === oldVehicle.id);
      if (updatedVehicle && mapInstanceRef.current) {
        marker.setLngLat([updatedVehicle.lng, updatedVehicle.lat]);
      }
    });
  }, [vehicles]);

  return (
    <ClientOnly>
      <div
        className={`min-h-screen text-sm transition-colors duration-300 ${isDark
          ? "dark bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
          }`}
      >
        {/* Navigation */}
        <Navbar scrolled={scrolled} isDark={isDark} toggleTheme={setTheme} />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center space-x-2">
                    <Radio className="w-4 h-4" />
                    <span>Real-Time GPS Tracking</span>
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Track Your Fleet in{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Real-Time
                  </span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Complete vehicle tracking solution with live location monitoring,
                  route history, geofencing, and comprehensive analytics for your
                  entire fleet.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700">
                    Watch Demo
                  </button>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <div className="flex -space-x-2">
                    {vehicleAvatars.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Vehicle ${i + 1}`}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 object-cover"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      5,000+ Vehicles Tracked
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Trusted by 200+ companies worldwide
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="shadow-2xl dark:shadow-black/40 rounded-2xl overflow-hidden">
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                    {/* Live Map */}
                    <div
                      ref={mapRef}
                      className="w-full h-80 relative"
                      style={{ minHeight: '320px' }}
                    >
                      {/* Loading placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                        <MapPin className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-bounce" />
                      </div>
                    </div>
                    {/* Live Stats */}
                    <div className="grid grid-cols-3 gap-3 p-4">
                      <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-700/50 rounded-lg p-3 text-center">
                        <Car className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {vehicles.length}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Active
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-white dark:from-gray-700 dark:to-gray-700/50 rounded-lg p-3 text-center">
                        <Navigation className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {vehicles.filter(v => v.status === 'moving').length}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Moving
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-white dark:from-gray-700 dark:to-gray-700/50 rounded-lg p-3 text-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          0
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Alerts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 animate-pulse">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      Live Tracking
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Powerful{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Tracking Features
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to monitor, manage, and optimize your fleet
                operations
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <MapPin className="w-8 h-8" />,
                  title: "Real-Time GPS Tracking",
                  description:
                    "Track vehicle locations in real-time with precise GPS coordinates and live map visualization",
                  color: "from-blue-500 to-indigo-500",
                },
                {
                  icon: <Route className="w-8 h-8" />,
                  title: "Route History & Playback",
                  description:
                    "Review complete route history with playback feature to analyze past trips and driver behavior",
                  color: "from-indigo-500 to-purple-500",
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Geofencing & Alerts",
                  description:
                    "Create virtual boundaries and receive instant notifications when vehicles enter or exit zones",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  icon: <Gauge className="w-8 h-8" />,
                  title: "Speed & Behavior Monitoring",
                  description:
                    "Monitor driving speed, harsh braking, rapid acceleration, and other driver behaviors",
                  color: "from-pink-500 to-rose-500",
                },
                {
                  icon: <BarChart3 className="w-8 h-8" />,
                  title: "Analytics & Reports",
                  description:
                    "Comprehensive reports on mileage, fuel consumption, idle time, and fleet utilization",
                  color: "from-orange-500 to-yellow-500",
                },
                {
                  icon: <Bell className="w-8 h-8" />,
                  title: "Instant Notifications",
                  description:
                    "Get real-time alerts for events like speeding, maintenance due, or unauthorized usage",
                  color: "from-green-500 to-teal-500",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-8 hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section
          id="benefits"
          className="py-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Why Choose Teletrace?
                </h2>
                <div className="space-y-5">
                  {[
                    "Real-time location tracking with 5-second update intervals",
                    "Unlimited devices and users - scale as you grow",
                    "Advanced geofencing with custom polygons and circles",
                    "Detailed trip reports with start/stop locations",
                    "Fuel monitoring and consumption analytics",
                    "Mobile apps for iOS and Android",
                    "API access for custom integrations",
                    "24/7 customer support and monitoring",
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-white text-lg">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-black/40 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Live Fleet Status
                    </h4>
                    <span className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </span>
                  </div>
                  {[
                    {
                      vehicle: vehicles[0]?.name || "TRK-001",
                      status: vehicles[0]?.status || "Moving",
                      speed: `${vehicles[0]?.speed || 45} km/h`,
                      location: "Jl. Sudirman, Jakarta",
                      icon: Truck,
                      color: "green",
                    },
                    {
                      vehicle: vehicles[1]?.name || "VAN-042",
                      status: vehicles[1]?.status || "Stopped",
                      speed: `${vehicles[1]?.speed || 0} km/h`,
                      location: "Kelapa Gading",
                      icon: Car,
                      color: "blue",
                    },
                    {
                      vehicle: vehicles[2]?.name || "BUS-203",
                      status: vehicles[2]?.status || "Moving",
                      speed: `${vehicles[2]?.speed || 30} km/h`,
                      location: "Tanah Abang",
                      icon: Bus,
                      color: "yellow",
                    },
                  ].map((vehicle, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div
                        className={`w-12 h-12 bg-${vehicle.color}-100 dark:bg-${vehicle.color}-900/30 rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <vehicle.icon
                          className={`w-6 h-6 text-${vehicle.color}-600 dark:text-${vehicle.color}-400`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {vehicle.vehicle}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {vehicle.location}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {vehicle.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            •
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {vehicle.speed}
                          </span>
                        </div>
                      </div>
                      <Navigation className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Ready to Track Your Fleet?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Join thousands of businesses that trust Teletrace for their vehicle
              tracking needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                <span>Start Free 14-Day Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700">
                Schedule Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              No credit card required • Free setup • Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black text-white py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Logo />
                </div>
                <p className="text-gray-400 text-sm">
                  Real-time GPS vehicle tracking and fleet management solution
                </p>
              </div>
              {[
                {
                  title: "Product",
                  links: ["Features", "Pricing", "Integrations", "API"],
                },
                {
                  title: "Company",
                  links: ["About Us", "Careers", "Contact", "Blog"],
                },
                {
                  title: "Support",
                  links: ["Help Center", "Documentation", "System Status", "FAQ"],
                },
              ].map((column, i) => (
                <div key={i} className="space-y-4">
                  <h5 className="font-semibold text-lg">{column.title}</h5>
                  <ul className="space-y-2">
                    {column.links.map((link, j) => (
                      <li key={j}>
                        <a
                          href="#"
                          className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2025 Teletrace. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

    </ClientOnly>
  );
}