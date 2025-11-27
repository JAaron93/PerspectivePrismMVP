/**
 * Test Setup File
 * 
 * This file runs before all tests to set up the test environment.
 * It mocks Chrome extension APIs and provides global test utilities.
 */

import { chrome } from 'vitest-chrome';

// Make chrome API available globally in tests
global.chrome = chrome;

// Mock chrome.storage API
chrome.storage.sync.get.mockImplementation((keys, callback) => {
  if (callback) {
    callback({});
  }
  return Promise.resolve({});
});

chrome.storage.sync.set.mockImplementation((items, callback) => {
  if (callback) {
    callback();
  }
  return Promise.resolve();
});

chrome.storage.local.get.mockImplementation((keys, callback) => {
  if (callback) {
    callback({});
  }
  return Promise.resolve({});
});

chrome.storage.local.set.mockImplementation((items, callback) => {
  if (callback) {
    callback();
  }
  return Promise.resolve();
});

chrome.storage.local.remove.mockImplementation((keys, callback) => {
  if (callback) {
    callback();
  }
  return Promise.resolve();
});

chrome.storage.local.clear.mockImplementation((callback) => {
  if (callback) {
    callback();
  }
  return Promise.resolve();
});

// Mock chrome.runtime API
chrome.runtime.sendMessage.mockImplementation((message, callback) => {
  if (callback) {
    callback({ success: true });
  }
  return Promise.resolve({ success: true });
});

chrome.runtime.onMessage.addListener.mockImplementation(() => {});

// Mock chrome.tabs API
chrome.tabs.create.mockImplementation((createProperties, callback) => {
  const tab = { id: 1, url: createProperties.url };
  if (callback) {
    callback(tab);
  }
  return Promise.resolve(tab);
});

chrome.tabs.query.mockImplementation((queryInfo, callback) => {
  const tabs = [];
  if (callback) {
    callback(tabs);
  }
  return Promise.resolve(tabs);
});

// Mock chrome.alarms API
chrome.alarms.create.mockImplementation(() => {});
chrome.alarms.clear.mockImplementation((name, callback) => {
  if (callback) {
    callback(true);
  }
  return Promise.resolve(true);
});
chrome.alarms.getAll.mockImplementation((callback) => {
  if (callback) {
    callback([]);
  }
  return Promise.resolve([]);
});
chrome.alarms.onAlarm.addListener.mockImplementation(() => {});

// Mock chrome.notifications API
chrome.notifications.create.mockImplementation((notificationId, options, callback) => {
  const id = notificationId || 'notification-id';
  if (callback) {
    callback(id);
  }
  return Promise.resolve(id);
});

// Mock fetch API for tests
global.fetch = vi.fn();

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  chrome.storage.sync.get.mockClear();
  chrome.storage.sync.set.mockClear();
  chrome.storage.local.get.mockClear();
  chrome.storage.local.set.mockClear();
  chrome.storage.local.remove.mockClear();
  chrome.storage.local.clear.mockClear();
  chrome.runtime.sendMessage.mockClear();
  chrome.tabs.create.mockClear();
  chrome.tabs.query.mockClear();
  chrome.alarms.create.mockClear();
  chrome.alarms.clear.mockClear();
  chrome.alarms.getAll.mockClear();
  chrome.notifications.create.mockClear();
  
  if (global.fetch.mockClear) {
    global.fetch.mockClear();
  }
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});
