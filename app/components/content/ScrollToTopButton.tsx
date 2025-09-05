"use client";

import { useState, useEffect } from "react";
import { IconChevronUp } from "@tabler/icons-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Mostrar/ocultar el botón basado en la posición del scroll
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  // Función para hacer scroll al inicio
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#164e63] text-white rounded-full shadow-lg hover:bg-[#0f3a47] transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#164e63] focus:ring-offset-2"
          aria-label="Volver al inicio"
        >
          <IconChevronUp size={24} />
        </button>
      )}
    </>
  );
}
