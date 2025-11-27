/**
 * Setup Verification Tests
 *
 * These tests verify that the test environment is properly configured
 * and that Chrome API mocks are working correctly.
 */

import { describe, it, expect } from "vitest";

describe("Test Environment Setup", () => {
  it("should have chrome API available globally", () => {
    expect(chrome).toBeDefined();
    expect(chrome.storage).toBeDefined();
    expect(chrome.runtime).toBeDefined();
    expect(chrome.tabs).toBeDefined();
    expect(chrome.alarms).toBeDefined();
  });

  it("should mock chrome.storage.sync API", async () => {
    const testData = { key: "value" };

    // Test set
    await chrome.storage.sync.set(testData);
    expect(chrome.storage.sync.set).toHaveBeenCalledWith(testData);

    // Test get
    await chrome.storage.sync.get("key");
    expect(chrome.storage.sync.get).toHaveBeenCalledWith("key");
  });

  it("should mock chrome.storage.local API", async () => {
    const testData = { localKey: "localValue" };

    // Test set
    await chrome.storage.local.set(testData);
    expect(chrome.storage.local.set).toHaveBeenCalledWith(testData);

    // Test get
    await chrome.storage.local.get("localKey");
    expect(chrome.storage.local.get).toHaveBeenCalledWith("localKey");

    // Test remove
    await chrome.storage.local.remove("localKey");
    expect(chrome.storage.local.remove).toHaveBeenCalledWith("localKey");

    // Test clear
    await chrome.storage.local.clear();
    expect(chrome.storage.local.clear).toHaveBeenCalled();
  });

  it("should mock chrome.runtime.sendMessage API", async () => {
    const message = { type: "TEST_MESSAGE", data: "test" };

    const response = await chrome.runtime.sendMessage(message);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message);
    expect(response).toEqual({ success: true });
  });

  it("should mock chrome.tabs API", async () => {
    const createProperties = { url: "https://example.com" };

    const tab = await chrome.tabs.create(createProperties);

    expect(chrome.tabs.create).toHaveBeenCalledWith(createProperties);
    expect(tab).toHaveProperty("id");
    expect(tab).toHaveProperty("url", "https://example.com");
  });

  it("should mock chrome.alarms API", async () => {
    // Test create
    chrome.alarms.create("test-alarm", { delayInMinutes: 1 });
    expect(chrome.alarms.create).toHaveBeenCalledWith("test-alarm", {
      delayInMinutes: 1,
    });

    // Test clear
    const cleared = await chrome.alarms.clear("test-alarm");
    expect(chrome.alarms.clear).toHaveBeenCalledWith("test-alarm");
    expect(cleared).toBe(true);

    // Test getAll
    const alarms = await chrome.alarms.getAll();
    expect(chrome.alarms.getAll).toHaveBeenCalled();
    expect(Array.isArray(alarms)).toBe(true);
  });

  it("should mock chrome.notifications API", async () => {
    const options = {
      type: "basic",
      iconUrl: "icon.png",
      title: "Test",
      message: "Test message",
    };

    const notificationId = await chrome.notifications.create(
      "test-id",
      options,
    );

    expect(chrome.notifications.create).toHaveBeenCalledWith(
      "test-id",
      options,
    );
    expect(notificationId).toBe("test-id");
  });

  it("should have fetch API available", () => {
    expect(fetch).toBeDefined();
    expect(typeof fetch).toBe("function");
  });

  it("should start with clean mocks", () => {
    // This test verifies that mocks start in a clean state (cleared by global beforeEach in setup)
    expect(chrome.storage.sync.get).not.toHaveBeenCalled();
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });
});
