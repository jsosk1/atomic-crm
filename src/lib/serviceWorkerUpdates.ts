// The PWA service worker (registerType "autoUpdate") activates a new version
// as soon as it is downloaded, but the open page keeps running the old code.
// This module checks for new versions when the app is opened or brought back
// to the foreground, and reloads the page once the new version takes control,
// waiting until the user is not filling a form or looking at a dialog.

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
const BUSY_RETRY_DELAY = 3000;

const isUserBusy = () => {
  if (document.querySelector('[role="dialog"]')) return true;
  const active = document.activeElement as HTMLElement | null;
  if (!active) return false;
  return (
    active.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName)
  );
};

const reloadWhenIdle = () => {
  if (isUserBusy()) {
    setTimeout(reloadWhenIdle, BUSY_RETRY_DELAY);
    return;
  }
  window.location.reload();
};

const checkForUpdate = () => {
  navigator.serviceWorker
    .getRegistration()
    .then((registration) => registration?.update())
    .catch(() => {
      // Offline or registration not ready: try again on the next check
    });
};

export const setupServiceWorkerUpdates = () => {
  if (!("serviceWorker" in navigator)) return;

  // On the very first install there is no previous version to replace
  let hasController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hasController) {
      hasController = true;
      return;
    }
    reloadWhenIdle();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkForUpdate();
  });
  setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL);
};
