"use client";
import { useState } from "react";
import { FaQuoteRight, FaChevronLeft, FaChevronRight, FaUserCircle, FaStar } from "react-icons/fa";

const testimonials = [
  {
    id: 1,
    name: "Robert Fox",
    title: "UI/UX Designer",
    feedback:
      "The platform's intuitive design and user-friendly features have truly elevated my workflow. It's a great tool for creative professionals!",
    rating: 3,
  },
  {
    id: 2,
    name: "Bessie Cooper",
    title: "Creative Director",
    feedback:
      "This tool has streamlined our team's projects, making it easy to collaborate and execute our vision seamlessly. Highly recommend it!",
    rating: 4,
  },
  {
    id: 3,
    name: "Jane Cooper",
    title: "Photographer",
    feedback:
      "An essential part of my creative process! The platform provides fantastic resources and inspiration that help me bring my ideas to life.",
    rating: 5,
  },
];

const Testimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const getVisibleTestimonial = (index: number) => {
    return testimonials[(currentIndex + index) % testimonials.length];
  };

  return (
    <div className="bg-[#F1F2F4] py-16 relative">
      <div className="container mx-auto px-4 lg:px-8 text-center relative">
        <h2 className="text-3xl font-bold mb-8">Clients Testimonial</h2>

        <div className="relative">
          {/* Previous Button (FIXED: Hidden on mobile, positioned outside on LG) */}
          <button
            onClick={prevTestimonial}
            className="absolute z-50 top-1/2 transform -translate-y-1/2 bg-white shadow-md w-12 h-12 sm:w-14 sm:h-14 rounded-lg hover:bg-blue-100 transition flex items-center justify-center 
            // 👇 Only show on screens larger than LG, and apply the fixed margin
            hidden lg:flex -left-16" 
          >
            <FaChevronLeft className="text-blue-500 text-xl" />
          </button>

          {/* Testimonial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Array(3)
              .fill(0)
              .map((_, i) => {
                const testimonial = getVisibleTestimonial(i);
                return (
                  <div
                    key={testimonial.id}
                    className="p-8 bg-white rounded-lg shadow-lg h-72 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex">
                        {Array(testimonial.rating)
                          .fill(0)
                          .map((_, i) => (
                            <FaStar key={i} className="text-yellow-500 text-xl" />
                          ))}
                      </div>
                      <FaQuoteRight className="text-gray-300 text-3xl" />
                    </div>
                    <p className="text-gray-600 mb-6 truncate-2-lines">
                    &quot;{testimonial.feedback}&quot;
                    </p>
                    <div className="flex items-center">
                      <FaUserCircle className="text-gray-400 text-5xl" />
                      <div className="ml-4">
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-gray-500">{testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Next Button (FIXED: Hidden on mobile, positioned outside on LG) */}
          <button
            onClick={nextTestimonial}
            className="absolute z-50 top-1/2 transform -translate-y-1/2 bg-white shadow-md w-12 h-12 sm:w-14 sm:h-14 rounded-lg hover:bg-blue-100 transition flex items-center justify-center
            // 👇 Only show on screens larger than LG, and apply the fixed margin
            hidden lg:flex -right-16" 
          >
            <FaChevronRight className="text-blue-500 text-xl" />
          </button>

          {/* 👇 NEW MOBILE NAVIGATION (Visible only on small screens) */}
          <div className="mt-8 flex justify-center lg:hidden space-x-4">
              <button
                  onClick={prevTestimonial}
                  className="bg-white shadow-md w-12 h-12 rounded-lg hover:bg-blue-100 transition flex items-center justify-center"
              >
                  <FaChevronLeft className="text-blue-500 text-xl" />
              </button>
              <button
                  onClick={nextTestimonial}
                  className="bg-white shadow-md w-12 h-12 rounded-lg hover:bg-blue-100 transition flex items-center justify-center"
              >
                  <FaChevronRight className="text-blue-500 text-xl" />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;