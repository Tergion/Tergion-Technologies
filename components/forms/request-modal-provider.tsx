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

export type RequestModalMode = "quick_request" | "automation_assessment";

type OpenRequestModalOptions = {
  mode?: RequestModalMode;
  trigger?: HTMLElement | null;
  triggerSource?: string;
};

type RequestModalContextValue = {
  isRequestModalOpen: boolean;
  activeMode: RequestModalMode;
  openRequestModal: (options?: OpenRequestModalOptions) => void;
  closeRequestModal: () => void;
};

const RequestModalContext = createContext<RequestModalContextValue | null>(null);

export function RequestModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] =
    useState<RequestModalMode>("quick_request");
  const [triggerSource, setTriggerSource] = useState("");
  const [sessionKey, setSessionKey] = useState(0);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  function openRequestModal(options: OpenRequestModalOptions = {}) {
    const {
      mode = "quick_request",
      trigger,
      triggerSource: nextTriggerSource = "",
    } = options;

    if (trigger) {
      lastFocusedElement.current = trigger;
    } else if (document.activeElement instanceof HTMLElement) {
      lastFocusedElement.current = document.activeElement;
    }

    setActiveMode(mode);
    setTriggerSource(nextTriggerSource);
    setSessionKey((current) => current + 1);
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
        activeMode,
        openRequestModal,
        closeRequestModal,
      }}
    >
      {children}
      <LeadFormModal
        key={sessionKey}
        open={open}
        activeMode={activeMode}
        triggerSource={triggerSource}
        onModeChange={setActiveMode}
        onOpenChange={setOpen}
      />
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
