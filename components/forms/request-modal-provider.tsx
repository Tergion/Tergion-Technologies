"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { LeadFormModal } from "@/components/forms/lead-form-modal";
import {
  buildRequestFormUrl,
  parseRequestFormMode,
  removeRequestFormUrl,
  type RequestModalMode,
} from "@/lib/request-form-url";

export type { RequestModalMode } from "@/lib/request-form-url";

type OpenRequestModalOptions = {
  mode?: RequestModalMode;
  trigger?: HTMLElement | null;
  triggerSource?: string;
  restoreFocus?: boolean;
  syncUrl?: boolean;
};

type RequestModalContextValue = {
  isRequestModalOpen: boolean;
  activeMode: RequestModalMode;
  openRequestModal: (options?: OpenRequestModalOptions) => void;
  closeRequestModal: () => void;
};

const RequestModalContext = createContext<RequestModalContextValue | null>(null);

type RequestModalUrlSyncApi = {
  setFormMode: (mode: RequestModalMode) => void;
  clearFormMode: () => void;
};

const emptyUrlSyncApi: RequestModalUrlSyncApi = {
  setFormMode: () => {},
  clearFormMode: () => {},
};

function focusPageFallback() {
  const fallback = document.getElementById("main-content");

  if (fallback instanceof HTMLElement) {
    fallback.focus({ preventScroll: true });
  }
}

export function RequestModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] =
    useState<RequestModalMode>("quick_request");
  const [triggerSource, setTriggerSource] = useState("");
  const [sessionKey, setSessionKey] = useState(0);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const shouldFocusPageFallback = useRef(false);
  const urlSyncApi = useRef<RequestModalUrlSyncApi>(emptyUrlSyncApi);
  const wasOpen = useRef(false);

  const registerUrlSyncApi = useCallback(
    (api: RequestModalUrlSyncApi | null) => {
      urlSyncApi.current = api ?? emptyUrlSyncApi;
    },
    [],
  );

  const openRequestModal = useCallback(
    (options: OpenRequestModalOptions = {}) => {
      const {
        mode = "quick_request",
        trigger,
        triggerSource: nextTriggerSource = "",
        restoreFocus = true,
        syncUrl = true,
      } = options;

      if (trigger) {
        lastFocusedElement.current = trigger;
        shouldFocusPageFallback.current = false;
      } else if (
        restoreFocus &&
        document.activeElement instanceof HTMLElement
      ) {
        lastFocusedElement.current = document.activeElement;
        shouldFocusPageFallback.current = false;
      } else {
        lastFocusedElement.current = null;
        shouldFocusPageFallback.current = true;
      }

      setActiveMode(mode);
      setTriggerSource(nextTriggerSource);
      setSessionKey((current) => current + 1);
      setOpen(true);

      if (syncUrl) {
        urlSyncApi.current.setFormMode(mode);
      }
    },
    [],
  );

  const closeRequestModal = useCallback(() => {
    urlSyncApi.current.clearFormMode();
    setOpen(false);
  }, []);

  const handleModeChange = useCallback(
    (mode: RequestModalMode) => {
      setActiveMode(mode);
      urlSyncApi.current.setFormMode(mode);
    },
    [],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setOpen(true);
        return;
      }

      closeRequestModal();
    },
    [closeRequestModal],
  );

  useEffect(() => {
    if (!open && wasOpen.current) {
      urlSyncApi.current.clearFormMode();

      const element = lastFocusedElement.current;
      const usePageFallback = shouldFocusPageFallback.current;

      shouldFocusPageFallback.current = false;

      window.requestAnimationFrame(() => {
        if (element && document.contains(element)) {
          element.focus({ preventScroll: true });
          return;
        }

        if (usePageFallback) {
          focusPageFallback();
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
      <Suspense fallback={null}>
        <RequestModalUrlController
          activeMode={activeMode}
          open={open}
          onModeChange={handleModeChange}
          onOpenFromUrl={openRequestModal}
          onRegisterUrlSyncApi={registerUrlSyncApi}
        />
      </Suspense>
      <LeadFormModal
        key={sessionKey}
        open={open}
        activeMode={activeMode}
        triggerSource={triggerSource}
        onModeChange={handleModeChange}
        onOpenChange={handleOpenChange}
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

function RequestModalUrlController({
  activeMode,
  open,
  onModeChange,
  onOpenFromUrl,
  onRegisterUrlSyncApi,
}: {
  activeMode: RequestModalMode;
  open: boolean;
  onModeChange: (mode: RequestModalMode) => void;
  onOpenFromUrl: (options?: OpenRequestModalOptions) => void;
  onRegisterUrlSyncApi: (api: RequestModalUrlSyncApi | null) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formValue = searchParams.get("form");
  const activeModeRef = useRef(activeMode);
  const openRef = useRef(open);

  useEffect(() => {
    activeModeRef.current = activeMode;
    openRef.current = open;
  }, [activeMode, open]);

  const setFormMode = useCallback(
    (mode: RequestModalMode) => {
      window.history.replaceState(
        window.history.state,
        "",
        buildRequestFormUrl(
          mode,
          pathname,
          window.location.search,
          window.location.hash,
        ),
      );
    },
    [pathname],
  );

  const clearFormMode = useCallback(() => {
    const currentUrl = `${pathname}${window.location.search}${window.location.hash}`;
    const nextUrl = removeRequestFormUrl(
      pathname,
      window.location.search,
      window.location.hash,
    );

    if (nextUrl !== currentUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [pathname]);

  useEffect(() => {
    onRegisterUrlSyncApi({ setFormMode, clearFormMode });

    return () => onRegisterUrlSyncApi(null);
  }, [clearFormMode, onRegisterUrlSyncApi, setFormMode]);

  useEffect(() => {
    const mode = parseRequestFormMode(formValue);

    if (!mode) {
      return;
    }

    if (!openRef.current) {
      onOpenFromUrl({
        mode,
        trigger: null,
        triggerSource: "url-form-param",
        restoreFocus: false,
        syncUrl: false,
      });
      return;
    }

    if (activeModeRef.current !== mode) {
      onModeChange(mode);
    }
  }, [formValue, onModeChange, onOpenFromUrl]);

  useEffect(() => {
    if (open) {
      setFormMode(activeMode);
    }
  }, [activeMode, open, setFormMode]);

  return null;
}
