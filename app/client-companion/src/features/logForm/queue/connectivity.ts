export const subscribeToConnectivityChanges = (onOnline: () => void): (() => void) => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return () => undefined;
  }

  const handler = () => {
    if (navigator.onLine) {
      onOnline();
    }
  };

  window.addEventListener("online", handler);

  return () => {
    window.removeEventListener("online", handler);
  };
};
