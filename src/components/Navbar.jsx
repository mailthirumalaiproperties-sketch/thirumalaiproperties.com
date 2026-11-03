import React, { useState } from 'react';
import logoSymbol from '../assets/logo22.png';

export default function Navbar({ activeTab: propsActiveTab, setActiveTab: propsSetActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localActiveTab, setLocalActiveTab] = useState('Home');

  const activeTab = propsActiveTab !== undefined ? propsActiveTab : localActiveTab;
  const setActiveTab = propsSetActiveTab !== undefined ? propsSetActiveTab : setLocalActiveTab;

  const handleNavClick = (e, name) => {
    e.preventDefault();
    setActiveTab(name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { name: 'Home', href: '/', hasDropdown: false },
    { name: 'Properties', href: '/properties/', hasDropdown: false },
    { name: 'Documents', href: '/documents/', hasDropdown: false },
    { name: 'NRI Property', href: '/nri-property/', hasDropdown: false },
    { name: 'Blog', href: '/blog/', hasDropdown: false },
    { name: 'About Us', href: '/about-us/', hasDropdown: false },
    { name: 'Contact', href: '/contact/', hasDropdown: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-stone-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">

          {/* Logo */}
          <a href="/" onClick={(e) => handleNavClick(e, 'Home')} className="flex flex-col items-center justify-center group py-1">
            <img
              src={logoSymbol}
              alt="Thirumalai Properties Icon"
              className="h-8 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div className="flex flex-col items-center mt-1 select-none">
              <span className="font-serif font-bold text-lg md:text-xl tracking-[0.12em] leading-none bg-gradient-to-b from-[#F5BC04] via-[#D29F13] to-[#9F7202] bg-clip-text text-transparent">
                THIRUMALAI
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-[1px] w-3.5 bg-[#D29F13]/80"></span>
                <span className="text-[9px] md:text-[10px] font-bold tracking-[0.25em] text-[#D29F13] leading-none uppercase">
                  PROPERTIES
                </span>
                <span className="h-[1px] w-3.5 bg-[#D29F13]/80"></span>
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex lg:space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative group flex items-center">
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.name)}
                  className={`flex items-center gap-1 text-sm font-semibold tracking-wide transition-all duration-300 py-2 outline-none focus:outline-none ${activeTab === item.name
                    ? 'text-brand-yellow'
                    : 'text-stone-700 hover:text-brand-gold'
                    }`}
                >
                  {item.name}
                  {item.hasDropdown && (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 transition-transform duration-200 group-hover:rotate-180" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </a>

                {/* Underline Indicator for active state */}
                {activeTab === item.name && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-brand-yellow rounded-full transition-all duration-300"></span>
                )}

                {/* Micro-hover bar for others */}
                {activeTab !== item.name && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-brand-gold opacity-0 group-hover:w-6 group-hover:opacity-100 transition-all duration-300"></span>
                )}
              </div>
            ))}
          </nav>

          {/* Phone Call Button */}
          <div className="hidden lg:block lg:-mr-4">
            <a
              href="tel:+919514476555"
              className="flex items-center gap-3.5 bg-brand-yellow hover:bg-[#E5B002] active:scale-95 text-brand-dark px-6 py-2.5 rounded-xl font-bold tracking-wide shadow-md hover:shadow-lg transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-dark" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 00-1.02.24l-2.2 2.2a15.1 15.1 0 01-6.59-6.59l2.2-2.2a1 1 0 00.25-1.02A11.36 11.36 0 008.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                <path d="M14 6.5c1.5 0 3 1.5 3 3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M14 3.5c3.2 0 6 2.8 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span>+91 95144 76555</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-stone-700 hover:text-brand-gold hover:bg-stone-50 focus:outline-none transition"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'}`} id="mobile-menu">
        <div className="px-4 pt-2 pb-6 space-y-2 bg-white border-t border-stone-100 shadow-inner">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => {
                handleNavClick(e, item.name);
                setIsOpen(false);
              }}
              className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all outline-none focus:outline-none ${activeTab === item.name
                ? 'bg-amber-50 text-brand-yellow font-bold'
                : 'text-stone-700 hover:bg-stone-50 hover:text-brand-gold'
                }`}
            >
              {item.name}
            </a>
          ))}
          <div className="pt-4 border-t border-stone-100">
            <a
              href="tel:+919514476555"
              className="flex items-center justify-center gap-2.5 bg-brand-yellow text-brand-dark px-6 py-4 rounded-xl font-bold tracking-wide shadow-md"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-dark" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 00-1.02.24l-2.2 2.2a15.1 15.1 0 01-6.59-6.59l2.2-2.2a1 1 0 00.25-1.02A11.36 11.36 0 008.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                <path d="M14 6.5c1.5 0 3 1.5 3 3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M14 3.5c3.2 0 6 2.8 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span>+91 95144 76555</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
