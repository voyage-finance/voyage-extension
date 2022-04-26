import browser, { Windows } from 'webextension-polyfill';

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
