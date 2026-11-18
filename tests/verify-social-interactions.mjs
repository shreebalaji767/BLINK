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

const firstSeen = JSON.parse(localStorage.getItem("blinkSeenNPCs") || "[]");
assert.equal(firstSeen.length, 34, "initial feed must save all 34 NPC authors");
assert.equal(new Set(firstSeen).size, firstSeen.length, "initial feed must not repeat NPC authors");
assert.ok(firstSeen.every((name) => !name.includes("|")), "NPC history must use stable canonical names");
assert.ok(!html.includes("Friends & Requests"), "friend requests navigation must be removed");
assert.ok(!/friend request|sentRequests|receivedRequests|state\\.friends|data-social="(?:add|accept|decline|cancel)"/i.test(app), "friend request feature and controls must be absent from active app");
assert.ok(!/data-social="(?:add|accept|decline|cancel)"/.test(elements.get("feed").innerHTML), "initial feed must not expose friend request controls");
const profileMatch = elements.get("feed").innerHTML.match(/data-social="profile" data-person="([^"]+)"/);
assert.ok(profileMatch, "feed must retain clickable NPC profile links");
const profileButton = new FakeElement();
profileButton.dataset = { social: "profile", person: profileMatch[1] };
documentListeners.click({ target: profileButton, preventDefault() {}, stopPropagation() {} });
assert.equal(elements.get("feedTitle").textContent, "NPC Profile", "profile navigation must continue working");
assert.ok(!/Send friend request|Request sent|Accept request/.test(elements.get("feed").innerHTML), "NPC profiles must not show friend request options");
const savedFeed = JSON.parse(localStorage.getItem("blinkFeedV2") || "null");
assert.ok(savedFeed && savedFeed.version === 1, "generated feed must be persisted with a versioned schema");
assert.ok(savedFeed.posts.length >= 34, "initial feed and profile timeline posts must be persisted");
assert.ok(savedFeed.posts.some((post) => post.context && post.context.person), "initial feed should include connected NPC conversation references");
const firstPersistedText = savedFeed.posts[0].text;
const reloadedElements = new Map(ids.map((id) => [id, new FakeElement(id)]));
const reloadedNavItems = Array.from({ length: 7 }, () => new FakeElement());
const reloadedListeners = {};
const reloadedDocument = {
  querySelector(selector) {
    if (selector.startsWith("#")) {
      const id = selector.slice(1);
      if (!reloadedElements.has(id)) reloadedElements.set(id, new FakeElement(id));
      return reloadedElements.get(id);
    }
    return null;
  },
  querySelectorAll(selector) {
    if (selector === ".nav-item") return reloadedNavItems;
    if (selector === ".world-filter") return [];
    return [];
  },
  addEventListener(type, callback) { reloadedListeners[type] = callback; },
};
vm.runInNewContext(app, {
  document: reloadedDocument,
  Element: FakeElement,
  localStorage,
  Math: math,
  Date,
  console,
  setTimeout: () => 1,
  clearTimeout: () => {},
}, { timeout: 5000 });
assert.equal(reloadedElements.get("feed").innerHTML.includes(firstPersistedText), true, "refresh must restore the same saved feed content");
assert.equal(JSON.parse(localStorage.getItem("blinkFeedV2")).posts.length, savedFeed.posts.length, "refresh must not replace or duplicate the saved feed");
assert.equal(JSON.parse(localStorage.getItem("blinkSeenNPCs")).length, 34, "refresh must preserve the NPC no-repeat history");
console.log("BLINK persistence and connected-conversation regression tests passed.");
console.log("BLINK no-friend-request regression tests passed.");
