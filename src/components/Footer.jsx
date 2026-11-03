import React, { useState, useEffect } from 'react';
import logoSymbol from '../assets/logo1.png';
import footerImg from '../assets/footer.png';
import { pathForTab } from '../routes';

export default function Footer({ setActiveTab }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLinkClick = (e, linkName) => {
    e.preventDefault();
    if (setActiveTab) {
      setActiveTab(linkName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleServiceClick = (e, tabName, targetId) => {
    e.preventDefault();
    if (setActiveTab) {
      setActiveTab(tabName);
    }
    setTimeout(() => {
      if (targetId) {
        const element = document.querySelector(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <footer id="contact" className="w-full relative overflow-hidden">

      {/* 1. Top CTA Banner (Bright Gold Gradient) */}
      <div className="w-full bg-gradient-to-r from-[#F5BC04] via-[#F4B400] to-[#E5A900] relative py-4 md:py-5 px-4 sm:px-6 lg:px-8 border-b border-stone-200/20 z-10 shadow-inner">
        {/* City Skyscraper Brand Image */}
        <img
          src={footerImg}
          alt="City Skyline"
          className="absolute left-6 bottom-0 h-full w-auto object-contain pointer-events-none hidden md:block mix-blend-multiply opacity-40"
        />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-20">
          {/* CTA Text */}
          <div className="text-center md:text-left md:pl-28 lg:pl-36 xl:pl-48">

            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#23190E] mt-1 leading-tight">
              We're Here to Help You!
            </h3>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-row items-center gap-4 sm:gap-6 flex-wrap justify-center">
            {/* Call Now Button */}
            <a
              href="tel:+91 9514476555"
              className="flex items-center gap-2.5 bg-white text-[#23190E] hover:bg-stone-50 active:scale-95 px-6 sm:px-8 py-3 rounded-xl font-extrabold text-sm tracking-wide shadow-md transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#F5BC04]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 00-1.02.24l-2.2 2.2a15.1 15.1 0 01-6.59-6.59l2.2-2.2a1 1 0 00.25-1.02A11.36 11.36 0 008.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                <path d="M14 6.5c1.5 0 3 1.5 3 3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M14 3.5c3.2 0 6 2.8 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span>Call Now</span>
            </a>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/9514476555"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-white text-[#23190E] hover:bg-stone-50 active:scale-95 px-6 sm:px-8 py-3 rounded-xl font-extrabold text-sm tracking-wide shadow-md transition-all duration-300"
            >
              <svg className="w-5 h-5 text-[#25D366] fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Bottom Links Bar (Solid Gold Background) */}
      <div className="w-full bg-[#D29F13] py-8 md:py-10 px-4 sm:px-6 lg:px-8 text-[#23190E] z-10">
        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0">

            {/* Column 1: Brand Logo & Socials */}
            <div className="flex flex-col items-start md:pr-4 lg:pr-8 md:border-r lg:border-r border-[#23190E]/10">
              <div className="flex items-center gap-3 select-none mb-4">
                <img src={logoSymbol} alt="Thirumalai Properties Icon" className="h-11 w-auto object-contain brightness-0 invert" />
                <div className="flex flex-col items-start mt-0.5">
                  <span className="font-serif font-bold text-lg tracking-[0.1em] leading-none text-white">
                    THIRUMALAI
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-[1px] w-3 bg-white/70"></span>
                    <span className="text-[9px] font-bold tracking-[0.25em] text-white/90 leading-none uppercase">
                      PROPERTIES
                    </span>
                    <span className="h-[1px] w-3 bg-white/70"></span>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#23190E] mb-6 leading-relaxed max-w-[280px]">
                Your Trusted Partner in Real Estate & Documentation Services & NRI Properties Management in Pondicherry.
              </p>

              {/* Social Icon Rings */}
              <div className="flex items-center gap-3.5">
                {[
                  {
                    icon: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01',
                    label: 'Instagram',
                    isInsta: true,
                    link: 'https://www.instagram.com/thirumalai_properties'
                  },
                  {
                    label: 'YouTube',
                    isYoutube: true,
                    link: 'https://www.youtube.com/@ThirumalaiProperties'
                  },
                  {
                    icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
                    label: 'Facebook',
                    link: '#'
                  },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.link}
                    target={social.link !== '#' ? '_blank' : undefined}
                    rel={social.link !== '#' ? 'noopener noreferrer' : undefined}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full border border-[#23190E]/20 flex items-center justify-center text-[#23190E] hover:border-[#23190E] hover:bg-[#23190E]/5 transition-all duration-300"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                      {social.isInsta ? (
                        <>
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </>
                      ) : social.isYoutube ? (
                        <>
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                        </>
                      ) : (
                        <path d={social.icon} />
                      )}
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-col items-start md:pl-6 lg:pl-12 lg:pr-8 lg:border-r border-[#23190E]/10">
              <h4 className="text-base font-extrabold text-[#23190E] mb-5 uppercase tracking-wide">
                Quick Links
              </h4>
              <ul className="space-y-3.5 text-sm font-semibold">
                {['Home', 'Properties', 'Documents', 'NRI Property', 'Blog', 'About Us', 'Contact'].map((link) => (
                  <li key={link}>
                    <a
                      href={pathForTab(link)}
                      onClick={(e) => handleLinkClick(e, link)}
                      className="hover:text-white transition-all duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Our Services */}
            <div className="flex flex-col items-start md:pr-4 lg:pl-12 lg:pr-8 md:border-r lg:border-r border-[#23190E]/10">
              <h4 className="text-base font-extrabold text-[#23190E] mb-5 uppercase tracking-wide">
                Our Services
              </h4>
              <ul className="space-y-3.5 text-sm font-semibold leading-snug">
                {[
                  { text: 'Buying & Selling of Properties', tab: 'Properties', targetId: null },
                  { text: 'Document Registration & Writing', tab: 'Documents', targetId: null },
                  { text: 'NRI Property Management', tab: 'NRI Property', targetId: null }
                ].map((item, i) => (
                  <li key={i}>
                    <a
                      href={pathForTab(item.tab)}
                      onClick={(e) => handleServiceClick(e, item.tab, item.targetId)}
                      className="hover:text-white transition-all duration-300"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div className="flex flex-col items-start md:pl-6 lg:pl-12">
              <h4 className="text-base font-extrabold text-[#23190E] mb-5 uppercase tracking-wide">
                Contact Us
              </h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li className="flex items-start gap-3 leading-snug">
                  <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 text-[#23190E] flex-shrink-0 mt-0.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>No. 17 sakthi Nagar main road saram Puducherry - 605013</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 text-[#23190E] flex-shrink-0 mt-0.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.56 11.56 0 018.82 4c0-.55-.45-1-1-1H4a1 1 0 00-1 1c0 9.39 7.61 17 17 17a1 1 0 001-1v-3.58c0-.56-.45-1.04-1-1.04z" />
                  </svg>
                  <div className="flex flex-col gap-1">
                    <span>+91 95144 76555</span>
                    <span>+91 96556 11234</span>

                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 text-[#23190E] flex-shrink-0 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <span>mail.thirumalaiproperties@gmail.com</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright & Legal Row */}
          <div className="border-t border-[#23190E]/10 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold">
            <span>
              © 2026 THIRUMALAI PROPERTIES.
            </span>

          </div>

        </div>
      </div>

      {/* Floating Back to Top Button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-[#F5BC04] hover:bg-[#D49D0E] text-[#23190E] w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 animate-fade-in-up border border-[#23190E]/10"
          aria-label="Back to top"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current stroke-[2.5] fill-none" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

    </footer>
  );
}
