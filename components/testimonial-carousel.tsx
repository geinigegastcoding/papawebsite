"use client";

import { useEffect, useState } from "react";

import { testimonials } from "@/lib/site";

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, []);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <div className="paper-panel rounded-[2rem] p-6 text-[#13213f] md:p-10">
      <div className="grid gap-8 md:grid-cols-[1.4fr_0.7fr] md:items-end">
        <div>
          <span className="eyebrow !border-[#13213f]/10 !bg-[#13213f]/5 !text-[#1d72f2]">
            Aanbevelingen
          </span>
          <p className="mt-5 text-2xl leading-relaxed font-medium text-[#18274a] md:text-[2rem]">
            “{activeTestimonial.quote}”
          </p>
          <div className="mt-6">
            <p className="font-heading text-xl font-semibold">{activeTestimonial.name}</p>
            <p className="mt-1 text-sm uppercase tracking-[0.18em] text-[#53658f]">
              {activeTestimonial.role}
            </p>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-[#13213f]/10 bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1d72f2]">
            Vertrouwen opgebouwd in de praktijk
          </p>
          <div className="mt-5 space-y-3">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  index === activeIndex
                    ? "border-[#1d72f2]/25 bg-[#1d72f2]/7"
                    : "border-[#13213f]/8 bg-[#f6f8fc]"
                }`}
              >
                <span>
                  <span className="block font-heading text-base font-semibold text-[#18274a]">
                    {testimonial.name}
                  </span>
                  <span className="mt-1 block text-sm text-[#60739f]">{testimonial.role}</span>
                </span>
                <span
                  className={`size-3 rounded-full ${
                    index === activeIndex ? "bg-[#1d72f2]" : "bg-[#c9d6f0]"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
