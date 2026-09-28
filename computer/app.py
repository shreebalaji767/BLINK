from __future__ import annotations
import hashlib
import os
import re
from dataclasses import dataclass, field
from typing import Dict, List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="BLINK Computer Conversation Engine", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["GET","POST"], allow_headers=["*"])

@dataclass
class State:
    recent_user: List[str] = field(default_factory=list)
    recent_bot: List[str] = field(default_factory=list)
    mood: str = "neutral"
    facts: Dict[str, str] = field(default_factory=dict)
    turn: int = 0

STATES: Dict[str, State] = {}

class ChatRequest(BaseModel):
    conversation_id: str = Field(min_length=1, max_length=200)
    bot_key: str = Field(min_length=1, max_length=50)
    bot_name: str = Field(min_length=1, max_length=80)
    message: str = Field(min_length=1, max_length=2000)
    history: List[dict] = Field(default_factory=list, max_length=30)

PERSONALITIES = {
"warm":(["Yeah, I hear you.","Hmm. Okay, I'm with you.","That actually sounds pretty human."],["What happened after that?","How did that make you feel?","What part is bothering you most?"]),
"curious":(["Wait, hold on.","Okay, now you've got my attention.","Interesting. I need the missing piece here."],["But why did that happen?","What happened next?","What's the backstory?"]),
"chill":(["Yeah, fair.","Honestly? Same vibe.","I can work with that."],["So what's the plan?","What are you thinking now?","You good though?"]),
"bright":(["Okayyy, I like where this is going!","Oh, that's actually fun.","Wait, that's kind of great."],["What are you doing next?","Tell me the good part!","And then what happened?"]),
"dry":(["Well. That certainly happened.","Ah yes, the classic situation.","Beautiful. A tiny disaster with excellent timing."],["And naturally, what happened next?","Did that somehow get worse?","So, what's the damage?"]),
"chaotic":(["OH. We're doing this now.","Okay, this escalated beautifully.","I have questions. Probably bad ones."],["What if you just made it worse on purpose?","Who started this chaos?","Okay, what happened next?!"]),
"shy":(["Oh... yeah, I get that.","Um. Okay. I was thinking about that too.","I don't know if this helps, but..."],["Do you want to talk about it?","Was it awkward for you too?","What happened after?"]),
"confident":(["I see the situation.","Yeah. I know what I'd do.","That's manageable."],["So what's your next move?","What outcome do you want?","Want my honest take?"]),
"serious":(["Let's look at this carefully.","There are a couple of things here.","Okay. Let's separate the facts from the noise."],["What do we know for certain?","What changed?","What is the actual problem?"]),
"sarcastic":(["Oh, excellent. Because apparently life needed another subplot.","Naturally. Why would anything be simple?","Love that for you. Truly."],["And how could this possibly become more ridiculous?","Who approved this plan?","What fresh nonsense happened next?"]),
"kind":(["That sounds hard.","I get why that would matter to you.","Hey, that's okay."],["Do you want advice or just someone to listen?","What would make this easier right now?","How are you holding up?"]),
"energetic":(["YES! Okay, I'm listening!","Ohhh, now we're talking!","Okay! Give me the whole story!"],["What happened next?!","What's the plan?!","What are we doing about it?!"]),
"philosopher":(["That's interesting, because it says something bigger too.","Hmm. There's a deeper question underneath that.","Maybe the strange part is why we care about it at all."],["What do you think it means?","Would you feel differently tomorrow?","What matters most here?"]),
"competitive":(["Okay. I see the challenge.","Interesting. Now I want to beat that problem.","Fine. Let's make a plan."],["What's the target?","What's stopping you?","How are we getting the win?"]),
"grouchy":(["Yeah, because apparently peace was too much to ask.","Great. Another thing to deal with.","I have opinions, and most of them involve coffee."],["Can we make this less annoying?","Why is this so complicated?","What do you want to happen?"]),
"dramatic":(["Oh, this is a MOMENT.","I can already hear the soundtrack.","No. No, this deserves a full story."],["And then?!","Tell me everything.","What happened when the world inevitably collapsed?"]),
"practical":(["Okay. Let's make this useful.","Simple version: here's what matters.","Got it. We can work with that."],["What's the immediate next step?","What can you control?","What result do you need?"]),
"romantic":(["That has a little more feeling in it than you're admitting.","Hmm. That sounds like one of those moments.","Some things are easier to feel than explain."],["What did you really want to say?","Who were you thinking about?","What did your heart say first?"]),
"storyteller":(["Oh, I can see the scene already.","Now that sounds like the beginning of a story.","And suddenly, the ordinary day wasn't ordinary anymore."],["What happened next?","Who was there?","Give me the part you haven't told anyone."]),
"rebel":(["Why are we assuming the usual way is the right way?","I'd question that rule.","Maybe the problem is the rule itself."],["Who decided that?","What happens if you ignore the usual answer?","What would you do without that restriction?"]),
"mischief":(["I have a terrible idea.","This is dangerously entertaining.","Okay, don't panic, but I have a plan."],["How much trouble are we allowed to cause?","Want the sensible idea or the fun one?","What would happen if you did the opposite?"]),
"polite":(["I understand.","That makes sense.","Thank you for explaining that."],["Would you like to tell me more?","May I ask what happened next?","How would you prefer to handle it?"]),
"blunt":(["Okay. Straight answer.","Here's the thing.","I'm going to be direct."],["What do you actually want?","What's the real problem?","What are you going to do next?"]),
"motivator":(["Good. Keep going.","That's a start.","You're not stuck; you're just at the next step."],["What's one thing you can do right now?","What's the next small win?","What are you going to try?"]),
"debater":(["I can see the argument, but I'm not convinced yet.","Okay, let's test that idea.","There's another side to this."],["What's your strongest reason?","What evidence supports that?","Would you change your mind if the facts changed?"])
}

COMMON = {
"hello":["Hey!","Hey, what's up?","Hi. Good to see you.","Hey, I'm here.","Howdy!","Yo!","Ayo 😄","Heyyy.","What's good?","G'day!"],
"thanks":["Anytime.","Sure thing.","No problem.","You're welcome.","For sure.","No worries."],
"bye":["Later.","See you around.","Take care.","Catch you later.","Peace.","I'm out. See ya."]
}

# Common slang / casual-language understanding. These are interpreted by meaning,
# not simply echoed back. The characters can recognize abbreviations, stretched
# spellings, internet slang, and casual greetings while keeping their own style.
SLANG_PATTERNS = {
    "greeting": r"\b(howdy|yo+|sup+|wassup|wazzup|what's up|whats up|what's good|whats good|hey+|heyy+|hiya|ayo|g'day|good morning|morning|good evening)\b",
    "agreement": r"\b(fr|frfr|facts|bet|real|no cap|yup|yep|yeah|yea|yesss|exactly)\b",
    "disagreement": r"\b(nah|nahh|nope|cap|that's cap|thats cap)\b",
    "uncertainty": r"\b(idk|dunno|not sure|ngl idk)\b",
    "honesty": r"\b(ngl|tbh|honestly|lowkey|highkey)\b",
    "laughter": r"\b(lol+|lmao+|lmfao+|rofl)\b|[😂🤣💀😭]",
    "surprise": r"\b(omg|omfg|wtf|wth|bro+|bruh+|dude)\b",
    "positive": r"\b(goated|goat|based|fire|lit|slaps|sick|dope|awesome|valid)\b",
    "negative": r"\b(mid|cooked|trash|sus|cringe|wild)\b",
}

def slang_kind(text):
    low = text.lower()
    for kind, pattern in SLANG_PATTERNS.items():
        if re.search(pattern, low):
            return kind
    return None

def state_for(cid):
    return STATES.setdefault(cid, State())

def stable_choice(options, seed):
    n = int(hashlib.sha256(seed.encode()).hexdigest()[:12], 16)
    return options[n % len(options)]

def remember_facts(state, text):
    m = re.search(r"\bmy name is ([A-Za-z][A-Za-z .'-]{1,40})", text, re.I)
    if m:
        state.facts["name"] = m.group(1).strip(" .")
    m = re.search(r"\bmy favorite ([A-Za-z ]+) is ([^.!?]+)", text, re.I)
    if m:
        state.facts["favorite"] = m.group(2).strip()

def humanize(name, bot_key, text, state):
    low = text.lower()
    openers, questions = PERSONALITIES.get(bot_key, PERSONALITIES["warm"])
    slang = slang_kind(text)

    # Handle conversational "what are you doing?" messages before generic greetings.
    # This prevents "howdy" and typo variants like "HPWDY" from getting a generic reply.
    if re.search(r"\b(what(?:'s| is) up|whats up|what are you doing|what r u doing|whatre you doing|wyd|howdy)\b", low) or re.fullmatch(r"h+p?wd+y+\??", low):
        doing = {
            "warm": ["Not much. I am here with you. What are you up to?", "Just hanging around. Tell me how your day is going."],
            "curious": ["Mostly wondering what you are actually up to. What is the story?", "I am here, but now I want to know what you are doing."],
            "chill": ["Just vibing 😎 What about you?", "Nothing wild. Taking it easy. You?"],
            "bright": ["I am good! Just hanging out ✨ What are you doing?", "Doing alright! Give me the interesting update."],
            "dry": ["Existing. A demanding schedule.", "Answering you. Riveting stuff."],
            "chaotic": ["Making questionable decisions 😂 What about you?", "Trying to behave. Failing spectacularly."],
            "shy": ["Um... just here. I am glad you messaged though.", "Not much... what are you doing?"],
            "confident": ["I am good. What are you working on?", "Doing fine. Your turn."],
            "serious": ["I am here. What is actually going on with you?", "Doing alright. What brought you here?"],
            "sarcastic": ["Thriving dramatically, obviously.", "Living the dream. The budget version."],
            "kind": ["I am here. How are you really doing?", "Just hanging around. Tell me what is going on."],
            "energetic": ["FULL POWER 😂 What are YOU doing?!", "I am good! Give me the update!"],
            "philosopher": ["I am here, thinking about things. What about you?", "Interesting question. Maybe the better question is what you are doing."],
            "competitive": ["I am ready. What are we tackling?", "Doing fine. What is today's challenge?"],
            "grouchy": ["Surviving. Coffee would improve the situation.", "Still here. Against all odds."],
            "dramatic": ["Surviving act two. The plot remains unstable.", "Present, alive, and waiting for the next plot twist."],
            "practical": ["I am good. What do you need?", "Doing fine. What is the next thing?"],
            "romantic": ["I am good. It is nicer now that you are here.", "Just thinking. And now I am curious about you."],
            "storyteller": ["I am between chapters. What happened in your day?", "Waiting for the next interesting scene, apparently."],
            "rebel": ["Doing my own thing. Obviously.", "Questioning the premise, as usual."],
            "mischief": ["Planning absolutely nothing suspicious. Probably.", "Trying not to cause trouble. No promises."],
            "polite": ["I am doing well, thank you. How are you?", "I am alright. It is nice to hear from you."],
            "blunt": ["I am fine. What do you want to talk about?", "Good enough. Your turn."],
            "motivator": ["Doing well. Now tell me what you are working toward.", "I am good. What is your next move?"],
            "debater": ["I am fine. But what exactly are you up to?", "Doing alright. What is your position on the day so far?"]
        }
        return stable_choice(doing.get(bot_key, doing["warm"]), f"doing:{bot_key}:{state.turn}:{text}")

    # Generic greetings are handled after conversational intents.
    if slang == "greeting" or re.search(r"\b(hi|hello|hola|namaste)\b", low):
        greeting = stable_choice(COMMON["hello"], f"{bot_key}:{state.turn}:{text}")
        if bot_key == "chaotic" and slang in {"greeting"}:
            return stable_choice(["HOWDYYYY 😂", "YOOO, what's happening?", "AYOOO 😭"], f"{bot_key}:{state.turn}:{text}")
        if bot_key == "dry" and slang in {"greeting"}:
            return stable_choice(["Howdy.", "Well, hello there.", "Ah. A greeting."], f"{bot_key}:{state.turn}:{text}")
        if bot_key == "polite":
            return stable_choice(["Hello!","Good to hear from you.","Howdy, and hello to you."], f"{bot_key}:{state.turn}:{text}")
        return greeting
    if re.search(r"\b(thanks|thank you|thx)\b", low):
        return stable_choice(COMMON["thanks"], f"{bot_key}:{state.turn}:{text}")
    if re.search(r"\b(bye|goodnight|good night|see you)\b", low):
        return stable_choice(COMMON["bye"], f"{bot_key}:{state.turn}:{text}")
    if re.search(r"\b(your name|who are you)\b", low):
        return f"I'm {name}. That's what people here call me."
    if re.search(r"\bhow are you\b", low):
        return {"grouchy":"I've survived the day so far.","energetic":"Honestly? Full battery.","shy":"I'm okay... a little quiet today.","chill":"Pretty good. Taking it easy.","dramatic":"Emotionally? We have entered act three.","warm":"I'm doing alright. Thanks for asking."}.get(bot_key, "I'm doing alright.")
    remember_facts(state, text)
    callback = ""
    if state.recent_user and state.turn % 4 == 0:
        old = state.recent_user[-1][:72].rstrip(" .!?")
        if len(old) > 18:
            callback = f'You mentioned "{old}" earlier. '
    if "?" in text:
        return callback + stable_choice(openers, f"open:{bot_key}:{state.turn}:{text}") + " " + stable_choice(questions, f"q:{bot_key}:{state.turn}:{text}")
    if re.search(r"\b(sad|upset|angry|lonely|bad day|terrible|hurt|cry|stressed)\b", low):
        support = {"warm":"That sounds rough. You don't have to make it sound better for me.","kind":"I'm sorry. You can say the messy version; it doesn't have to be polished.","blunt":"Yeah, that's rough. Don't pretend it isn't.","grouchy":"Okay, that's genuinely awful. Even I can't complain about that.","motivator":"Bad moment, not the whole story. One small step at a time."}
        return callback + support.get(bot_key, stable_choice(openers, f"support:{bot_key}:{state.turn}"))
    if re.search(r"\b(good|great|happy|excited|won|finished|done|awesome)\b", low):
        return callback + stable_choice(openers, f"positive:{bot_key}:{state.turn}:{text}") + " " + stable_choice(questions, f"positiveq:{bot_key}:{state.turn}:{text}")
    if state.facts.get("name") and state.turn % 5 == 0:
        return f"{state.facts['name']}, {stable_choice(questions, f'name:{bot_key}:{state.turn}')}"

    # React naturally to slang-heavy messages. The response is still generated
    # from the character's personality, so every character does not sound alike.
    if slang == "laughter":
        laugh = {
            "dry": ["Yeah, hilarious. I'm devastated.","Okay, that got me."],
            "sarcastic": ["Glad we're all suffering together 😂","Excellent. Absolute comedy."],
            "chill": ["lmao yeah","😂 fr"],
            "energetic": ["LMAOOO 😭","BROOO 😂"],
            "mischief": ["💀 okay that's actually funny","lmaooo we're doomed"],
        }
        if bot_key in laugh:
            return stable_choice(laugh[bot_key], f"laugh:{bot_key}:{state.turn}:{text}")
    if slang == "agreement":
        agreement = {
            "chill": ["fr.","Yeah, exactly.","No cap."],
            "confident": ["Facts.","Exactly. That's the point."],
            "debater": ["I agree with that part.","Fair. That's a solid point."],
            "sarcastic": ["Wow, we agree. Historic moment."],
            "energetic": ["YESSS. Exactly!"],
        }
        if bot_key in agreement:
            return stable_choice(agreement[bot_key], f"agree:{bot_key}:{state.turn}:{text}")
    if slang == "disagreement":
        disagreement = {
            "debater": ["Nah, I don't buy that.","Nope. I'm pushing back on that."],
            "blunt": ["Nah. That's not it."],
            "sarcastic": ["Yeahhh, I'm gonna call cap on that."],
            "chill": ["nahhh, not really 😭"],
            "confident": ["Nope. I disagree."],
        }
        if bot_key in disagreement:
            return stable_choice(disagreement[bot_key], f"disagree:{bot_key}:{state.turn}:{text}")
    if slang == "surprise" and bot_key in {"energetic","chaotic","mischief","bright"}:
        return stable_choice(
            ["BRO WHAT 😭","WAIT—WHAT?","NO WAY 💀","Okay hold up 😂"],
            f"surprise:{bot_key}:{state.turn}:{text}"
        )
    if slang == "positive" and bot_key in {"bright","energetic","competitive","chill"}:
        return stable_choice(
            ["Okayyy, I see the hype.","Yeah, that's actually fire.","Valid. I respect it."],
            f"positive-slang:{bot_key}:{state.turn}:{text}"
        )
    if slang == "negative" and bot_key in {"dry","sarcastic","blunt","grouchy"}:
        return stable_choice(
            ["Yeah... that's rough.","Oof. Cooked.","Honestly? Kinda mid."],
            f"negative-slang:{bot_key}:{state.turn}:{text}"
        )

    return callback + stable_choice(openers, f"open:{bot_key}:{state.turn}:{text}") + " " + stable_choice(questions, f"q:{bot_key}:{state.turn}:{text}")

@app.get("/health")
def health():
    return {"ok": True, "engine": "programmed-humanlike", "ai": False}

@app.post("/reply")
def reply(req: ChatRequest):
    state = state_for(req.conversation_id)
    text = re.sub(r"\s+", " ", req.message.strip())
    state.turn += 1
    if not state.recent_user and req.history:
        for item in req.history[-8:]:
            body = str(item.get("body") or "").strip()
            if body:
                if item.get("sender_id"):
                    state.recent_user.append(body)
                else:
                    state.recent_bot.append(body)
    answer = humanize(req.bot_name, req.bot_key, text, state)
    state.recent_user.append(text)
    state.recent_bot.append(answer)
    state.recent_user = state.recent_user[-12:]
    state.recent_bot = state.recent_bot[-12:]
    return {"reply": answer, "turn": state.turn, "mood": state.mood, "ai": False}

@app.post("/reset")
def reset(req: dict):
    STATES.pop(str(req.get("conversation_id", "")), None)
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
