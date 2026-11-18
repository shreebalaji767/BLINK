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
    return (selector === "[data-social]" && Boolean(this.dataset.social))
      || (selector === "[data-news-action]" && Boolean(this.dataset.newsAction));
  }
  closest(selector) {
    let node = this;
    while (node) {
      if (selector === "[data-social]" && node.dataset?.social) return node;
      if (selector === "[data-news-action]" && node.dataset?.newsAction) return node;
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
elements.get("postInput").value = "A repeated observer broadcast";
elements.get("postBtn").listeners.click();
elements.get("postInput").value = "A repeated observer broadcast";
elements.get("postBtn").listeners.click();
const savedFeed = JSON.parse(localStorage.getItem("blinkFeedV2") || "null");
assert.ok(savedFeed && savedFeed.version === 1, "generated feed must be persisted with a versioned schema");
assert.ok(savedFeed.posts.length >= 34, "initial feed and profile timeline posts must be persisted");
assert.ok(savedFeed.posts.some((post) => post.context && post.context.person), "initial feed should include connected NPC conversation references");
assert.ok(savedFeed.relationships && Object.keys(savedFeed.relationships).length > 0, "connected NPC posts must build a persistent relationship ledger");
assert.ok(Object.values(savedFeed.relationships).every((entry) => Array.isArray(entry.people) && entry.people.length === 2 && Number.isInteger(entry.score) && entry.interactions > 0), "relationship entries must contain two NPCs, a score, and interaction count");
assert.ok(JSON.parse(localStorage.getItem("blinkRelationships")) && Object.keys(JSON.parse(localStorage.getItem("blinkRelationships"))).length > 0, "relationship history must be saved independently");
assert.ok(elements.get("feed").innerHTML.includes("relationship-tag") || elements.get("feed").innerHTML.includes("ACQUAINTANCE") || elements.get("feed").innerHTML.includes("ALLY") || elements.get("feed").innerHTML.includes("RIVAL"), "connected and news-linked posts must display their relationship/status tag");
assert.ok(Array.isArray(savedFeed.signatures) && savedFeed.signatures.length >= 34, "persistent feed must save post fingerprints");
assert.ok(savedFeed.signatures.length <= 500, "post fingerprint history must remain bounded");
const observerPosts = savedFeed.posts.filter((post) => post.person === "You (Observer)");
assert.equal(observerPosts.length, 2, "both Observer posts must persist");
assert.notEqual(observerPosts[0].text, observerPosts[1].text, "duplicate Observer broadcasts must be varied");
assert.ok(JSON.parse(localStorage.getItem("blinkPostSignatures")).length >= 34, "post fingerprints must be stored separately for migration safety");
const worldNews = JSON.parse(localStorage.getItem("blinkWorldNewsV1") || "null");
assert.ok(Array.isArray(worldNews) && worldNews.length >= 4, "cross-world news desk must seed and persist multiple stories");
assert.ok(worldNews.every(item => item.sources.length >= 2 && item.worlds.length >= 2 && item.updates.length >= 1), "news stories must connect multiple NPC sources and worlds");
assert.ok(worldNews.every(item => Array.isArray(item.postIds) && item.postIds.length >= 3), "every breaking story must publish reports and a cross-world discussion post into the social feed");
assert.ok(worldNews.every(item => Array.isArray(item.discussants) && item.discussants.length >= 1), "every breaking story must persist its NPC discussion participants");
assert.ok(savedFeed.posts.some(post => post.context && post.context.newsEventId && post.context.relationship === "NEWS · DISCUSSION"), "news stories must create NPC discussion posts linked to the source event");
const newsFeedBeforeAdvance = JSON.parse(localStorage.getItem("blinkFeedV2") || "null");
assert.ok(newsFeedBeforeAdvance.posts.some(post => post.context && post.context.newsEventId === worldNews[0].id), "news coverage posts must be linked to their source story");

assert.ok(html.includes('data-view="news"'), "navigation must expose the World News desk");
assert.ok(app.includes('data-news-action="advance"') && app.includes('INVESTIGATING'), "news stories must support persistent follow-up stages");
assert.ok(app.includes('data-news-action="bookmark"') && app.includes('data-news-action="note-save"'), "news desk must provide dossier bookmarks and private notes");
assert.ok(app.includes("item.bookmarked") && app.includes("item.note"), "dossier metadata must be rendered from persistent story fields");
const bookmarkButton = new FakeElement();
bookmarkButton.dataset = { newsAction: "bookmark", newsId: worldNews[0].id };
documentListeners.click({ target: bookmarkButton, preventDefault() {}, stopPropagation() {} });
assert.equal(JSON.parse(localStorage.getItem("blinkWorldNewsV1"))[0].bookmarked, true, "bookmark action must persist a story dossier");
const noteField = document.querySelector("#news-note-" + worldNews[0].id);
noteField.value = "Check the second witness timestamp.";
const noteButton = new FakeElement();
noteButton.dataset = { newsAction: "note-save", newsId: worldNews[0].id };
documentListeners.click({ target: noteButton, preventDefault() {}, stopPropagation() {} });
assert.equal(JSON.parse(localStorage.getItem("blinkWorldNewsV1"))[0].note, "Check the second witness timestamp.", "private case notes must persist against their story");


const newsButton = new FakeElement();
newsButton.dataset = { newsAction: "advance", newsId: worldNews[0].id };
documentListeners.click({ target: newsButton, preventDefault() {}, stopPropagation() {} });
const advancedNews = JSON.parse(localStorage.getItem("blinkWorldNewsV1") || "[]");
assert.equal(advancedNews[0].stage, 1, "advancing coverage must move the story into investigation");
assert.equal(advancedNews[0].updates.length, 2, "each story advancement must append a new report");
const feedAfterNewsUpdate = JSON.parse(localStorage.getItem("blinkFeedV2") || "null");
assert.equal(advancedNews[0].postIds.length, 5, "advancing a story must publish a report and a separate NPC discussion post");
assert.equal(advancedNews[0].discussants.length, 2, "story advancement must add a new discussion participant without repeating one");
assert.ok(feedAfterNewsUpdate.posts.some(post => post.context && post.context.newsEventId === advancedNews[0].id && post.context.relationship === "NEWS · DISCUSSION"), "story advancement must publish a new linked discussion post");
assert.ok(feedAfterNewsUpdate.posts.some(post => post.context && post.context.newsEventId === advancedNews[0].id && post.context.relationship === "NEWS · INVESTIGATING"), "investigation updates must reach the feed with their story status");

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
assert.equal(JSON.parse(localStorage.getItem("blinkFeedV2")).posts.length, feedAfterNewsUpdate.posts.length, "refresh must not replace or duplicate the saved feed after a news update");
assert.equal(JSON.parse(localStorage.getItem("blinkSeenNPCs")).length, 34, "refresh must preserve the NPC no-repeat history");
console.log("BLINK persistence and connected-conversation regression tests passed.");
console.log("BLINK no-friend-request regression tests passed.");
