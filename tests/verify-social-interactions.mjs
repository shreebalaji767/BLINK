import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync("index.html", "utf8");
const app = readFileSync("app-social-requests.js", "utf8");
const ids = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.nodeType = 1;
    this.value = "";
    this.innerHTML = "";
    this.textContent = "";
    this.disabled = false;
    this.dataset = {};
    this.style = {};
    this.listeners = {};
    this.attributes = {};
    this.classList = {
      add: () => {},
      remove: () => {},
      toggle: () => {},
    };
  }
  addEventListener(type, callback) { this.listeners[type] = callback; }
  setAttribute(name, value) { this.attributes[name] = value; }
  matches(selector) {
    return selector === "[data-social]" && Boolean(this.dataset.social);
  }
  closest(selector) {
    let node = this;
    while (node) {
      if (selector === "[data-social]" && node.dataset?.social) return node;
      node = node.parentElement || null;
    }
    return null;
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  querySelector() { return new FakeElement(); }
}

const elements = new Map(ids.map((id) => [id, new FakeElement(id)]));
const navItems = Array.from({ length: 7 }, () => new FakeElement());
const documentListeners = {};
const document = {
  querySelector(selector) {
    if (selector.startsWith("#")) {
      const id = selector.slice(1);
      if (!elements.has(id)) elements.set(id, new FakeElement(id));
      return elements.get(id);
    }
    return null;
  },
  querySelectorAll(selector) {
    if (selector === ".nav-item") return navItems;
    if (selector === ".world-filter") return [];
    return [];
  },
  addEventListener(type, callback) { documentListeners[type] = callback; },
};
const storage = new Map();
const localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
};
const math = Object.create(Math);
math.random = () => 0;
const context = {
  document,
  Element: FakeElement,
  localStorage,
  Math: math,
  Date,
  console,
  setTimeout: () => 1,
  clearTimeout: () => {},
};
vm.runInNewContext(app, context, { timeout: 5000 });

const read = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const clickSocial = (action, name, nested = false) => {
  const button = new FakeElement();
  button.dataset = { social: action, person: name };
  const child = new FakeElement();
  child.nodeType = 3;
  child.parentElement = button;
  const target = nested ? child : button;
  documentListeners.click({
    target,
    preventDefault() {},
    stopPropagation() {},
  });
  return button;
};

const received = read("blinkReceivedRequests");
assert.equal(received.length, 3, "first launch should seed incoming NPC requests");
const feed = elements.get("feed").innerHTML;
const authors = [...feed.matchAll(/data-person="([^"]+)"/g)].map((m) => m[1]);
const outgoingName = authors.find((name) => !received.includes(name));
assert.ok(outgoingName, "feed should expose an NPC profile that can receive a request");

const sentButton = clickSocial("add", outgoingName, true);
assert.equal(sentButton.textContent, "✓ Request sent", "clicked button must immediately show sent state");
assert.equal(sentButton.disabled, true, "clicked button must prevent duplicate requests");
assert.ok(read("blinkSentRequests").includes(outgoingName), "send request must persist");
assert.equal(read("blinkFriends").includes(outgoingName), false, "sending must not instantly create a friend");

const acceptedName = received[0];
clickSocial("accept", acceptedName);
assert.ok(read("blinkFriends").includes(acceptedName), "accept must create a friend");
assert.equal(read("blinkReceivedRequests").includes(acceptedName), false, "accept must clear incoming request");

const declinedName = received[1];
clickSocial("decline", declinedName);
assert.equal(read("blinkReceivedRequests").includes(declinedName), false, "decline must clear incoming request");

clickSocial("cancel", outgoingName);
assert.equal(read("blinkSentRequests").includes(outgoingName), false, "cancel must remove outgoing request");

clickSocial("add", outgoingName);
elements.get("generateBtn").listeners.click();
assert.ok(read("blinkFriends").includes(outgoingName), "NPC should be able to accept an outgoing request during simulation");
assert.equal(read("blinkSentRequests").includes(outgoingName), false, "resolved request must leave sent list");

const count = Number(elements.get("requestCount").textContent);
assert.equal(count, read("blinkSentRequests").length + read("blinkReceivedRequests").length, "badge must match both request lists");
console.log("BLINK friend-request interaction tests passed.");
