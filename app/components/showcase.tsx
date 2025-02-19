"use client";
import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Showcase = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Define your slides; note that the video slide has type "video"
  const slides = [
    { type: "image", src: "/fav.png" },
    { type: "image", src: "/fly1.png" },
    { type: "image", src: "/fly3.jpg" },
    { type: "image", src: "/fly4.png" },
    { type: "image", src: "/favicon.png" },
    { type: "video", src: "/vid.mp4" },
  ];

  // Auto-change slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Greeting based on time of day
  const now = new Date();
  const hour = now.getHours();
  let greeting = "";
  if (hour < 12) {
    greeting = "Good morning!";
  } else if (hour < 18) {
    greeting = "Good afternoon!";
  } else {
    greeting = "Good evening!";
  }

  // Manual navigation functions
  const goToPrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-center mb-4">
        {greeting} Check out our new arrivals!
      </h2>
      <div className="relative w-full h-64 md:h-96 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.type === "image" ? (
              <img
                src={slide.src}
                alt={`slide ${index}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={slide.src}
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
        {/* Navigation Controls */}
        <button
          onClick={goToPrev}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          aria-label="Previous Slide"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          aria-label="Next Slide"
        >
          <FiChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Showcase;
