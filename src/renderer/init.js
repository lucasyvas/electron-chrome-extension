const url = require('url');
const constants = require('../common/constants');
const isBackgroundPage = process.argv.indexOf('--electron-chrome-extension-background-page') !== -1;

const { protocol, hostname } = url.parse(window.location.href);

if (protocol === `${constants.EXTENSION_PROTOCOL}:`) {
  // Add implementations of chrome API.
  require('./chrome-api').injectTo(hostname, isBackgroundPage, window);

  process.once('loaded', function () {
    delete global.require
    delete global.module
    // delete global.process
    delete global.Buffer
    delete global.setImmediate
    delete global.clearImmediate
    delete global.global
  })
} else {
  // native window open workaround
  const { ipcRenderer } = require('electron');

  const { guestInstanceId, openerId } = process;
  const hiddenPage = process.argv.includes('--hidden-page');
  const usesNativeWindowOpen = process.argv.includes('--native-window-open');

  // Any URL that shouldn't be loaded as `nativeWindowOpen` as a popup
  // should appear here if parent window uses `nativeWindowOpen`
  const overrideNativeWindowOpenList = [];

  require('./window-setup')(window, ipcRenderer, guestInstanceId, openerId, hiddenPage, usesNativeWindowOpen, overrideNativeWindowOpenList);
  // end workaround
  require('./injectors/content-scripts-injector')
}
