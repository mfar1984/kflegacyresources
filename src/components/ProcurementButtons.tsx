"use client";

import { useEffect } from "react";

export default function ProcurementButtons() {
  useEffect(() => {
    // Function to open procurement modal
    const openModal = () => {
      if (typeof window !== "undefined" && (window as unknown as { openProcurementModal?: () => void }).openProcurementModal) {
        (window as unknown as { openProcurementModal: () => void }).openProcurementModal();
      }
    };

    // Attach event listeners to all procurement buttons
    const attachListeners = () => {
      const buttons = document.querySelectorAll('[data-action="open-procurement"]');
      buttons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          openModal();
        });
      });
    };

    // Initial attach
    attachListeners();

    // Re-attach after a short delay to catch dynamically rendered elements
    const timer = setTimeout(attachListeners, 500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

