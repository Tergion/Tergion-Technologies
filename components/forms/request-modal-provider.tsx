"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { LeadFormModal } from "@/components/forms/lead-form-modal";

type RequestModalContextValue = {
  isRequestModalOpen: boolean;
  openRequestModal: (trigger?: HTMLElement | null) => void;
  closeRequestModal: () => void;
};

const RequestModalContext = createContext<RequestModalContextValue | null>(null);

export function RequestModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  function openRequestModal(trigger?: HTMLElement | null) {
    if (trigger) {
      lastFocusedElement.current = trigger;
    } else if (document.activeElement instanceof HTMLElement) {
      lastFocusedElement.current = document.activeElement;
    }

    setOpen(true);
  }

  function closeRequestModal() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open && wasOpen.current) {
      const element = lastFocusedElement.current;

      window.requestAnimationFrame(() => {
        if (element && document.contains(element)) {
          element.focus({ preventScroll: true });
        }
      });
    }

    wasOpen.current = open;
  }, [open]);

  return (
    <RequestModalContext.Provider
      value={{
        isRequestModalOpen: open,
        openRequestModal,
        closeRequestModal,
      }}
    >
      {children}
      <LeadFormModal open={open} onOpenChange={setOpen} />
    </RequestModalContext.Provider>
  );
}

export function useRequestModal() {
  const context = useContext(RequestModalContext);

  if (!context) {
    throw new Error("useRequestModal must be used inside RequestModalProvider.");
  }

  return context;
}
