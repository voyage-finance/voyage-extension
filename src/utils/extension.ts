import browser, { Windows } from 'webextension-polyfill';
import { memoize } from 'lodash';

export enum ExtensionEnvType {
  Popup, // the extension panel opened by the icon in the top right corner.
  Fullscreen, // currently not in use
  Notification, // the popup that appears for actions taken out of the extension (e.g. signing, approving)
  Background,
}

/**
 * Lifted directly from https://github.com/MetaMask/metamask-extension/blob/8df8f81df785f2a2b08143bcb4a0f706a2404825/app/scripts/lib/util.js#L105
 * Returns an Error if extension.runtime.lastError is present
 * this is a workaround for the non-standard error object that's used
 *
 * @returns {Error|undefined}
 */
export function checkForError() {
  const { lastError } = browser.runtime;
  if (!lastError) {
    return undefined;
  }

  // if it quacks like an Error, its an Error
  if ((lastError as unknown as any).stack && lastError.message) {
    return lastError;
  }
  // repair incomplete error object (eg chromium v77)
  return new Error(lastError.message);
}

export const openNotificationWindow = (
  options: Windows.CreateCreateDataType
) => {
  return new Promise((resolve, reject) => {
    browser.windows.create(options).then((newWindow) => {
      const error = checkForError();
      if (error) {
        return reject(error);
      }
      return resolve(newWindow);
    });
  });
};

export const closeNotificationWindow = () => {
  return browser.windows.getCurrent().then((windowDetails) => {
    return browser.windows.remove(windowDetails.id || -1);
  });
};

const getEnvironmentTypeMemo = memoize((url: string) => {
  const parsedUrl = new URL(url);
  if (parsedUrl.pathname === '/popup.html') {
    return ExtensionEnvType.Popup;
  } else if (['/home.html', '/phishing.html'].includes(parsedUrl.pathname)) {
    return ExtensionEnvType.Fullscreen;
  } else if (parsedUrl.pathname === '/notification.html') {
    return ExtensionEnvType.Notification;
  }
  return ExtensionEnvType.Background;
});

/**
 * Returns the window type for the application
 *
 *  - `popup` refers to the extension opened through the browser app icon (in top right corner in chrome and firefox)
 *  - `fullscreen` refers to the main browser window
 *  - `notification` refers to the popup that appears in its own window when taking action outside of metamask
 *  - `background` refers to the background page
 *
 * NOTE: This should only be called on internal URLs.
 *
 * @param {string} [url] - the URL of the window
 * @returns {string} the environment ENUM
 */
export const getEnvironmentType = (url = window.location.href) =>
  getEnvironmentTypeMemo(url);
