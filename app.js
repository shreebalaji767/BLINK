(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const worlds = [
    {name:"Fantasy",color:"#8c79b7",emoji:"🧙",people:[["Gandalf","🧙","Middle-earth"],["Legolas","🏹","Middle-earth"],["Shrek","🧅","Far Far Away"],["Elsa","❄️","Arendelle"],["Hiccup","🐉","Berk"],["Dumbledore","🪄","Wizarding World"],["Geralt","⚔️","The Continent"],["Sauron","👁️","Middle-earth"]]},
    {name:"Sci-Fi",color:"#65a6b7",emoji:"🛸",people:[["Darth Vader","🖤","Galactic Empire"],["Spock","🖖","Star Trek"],["The Doctor","🚀","Time and Space"],["Leia Organa","⭐","Rebel Alliance"],["Optimus Prime","🤖","Cybertron"],["Ripley","🚨","USCSS Nostromo"],["Yoda","🐸","Jedi Order"],["Wall-E","🤖","Earth"]]},
    {name:"Anime",color:"#d98b9d",emoji:"🍥",people:[["Naruto","🍥","Hidden Leaf"],["Luffy","🍖","Grand Line"],["Sailor Moon","🌙","Tokyo"],["Goku","🐉","Earth"],["Gojo","🕶️","Jujutsu High"],["Pikachu","⚡","Kanto"],["Anya Forger","🥜","Ostania"],["Totoro","🌳","Forest"]]},
    {name:"Comics",color:"#d59b52",emoji:"💥",people:[["Batman","🦇","Gotham"],["Spider-Man","🕷️","New York"],["Wonder Woman","🛡️","Themyscira"],["Deadpool","🔴","Earth-616"],["Joker","🃏","Gotham"],["Superman","☀️","Metropolis"],["Harley Quinn","🔨","Gotham"],["Loki","🐍","Asgard"]]},
    {name:"Games",color:"#75a47b",emoji:"🎮",people:[["Mario","🍄","Mushroom Kingdom"],["Link","🗡️","Hyrule"],["Kirby","🌸","Dream Land"],["Lara Croft","🧭","Tomb Raider"],["Sonic","💨","Green Hill"],["Kiryu","🐉","Kamurocho"],["Chell","🟠","Aperture"],["Sans","💀","Underground"]]},
    {name:"Cartoons",color:"#d4a4d0",emoji:"📺",people:[["SpongeBob","🧽","Bikini Bottom"],["Shaggy","🥪","Mystery Inc."],["Bugs Bunny","🥕","Looney Tunes"],["Rick Sanchez","🧪","Dimension C-137"],["Finn","🗡️","Land of Ooo"],["Daria","👓","Lawndale"],["Homer Simpson","🍩","Springfield"],["Scooby-Doo","🐕","Mystery Inc."]]}
  ];
  const openers = [
    "Quick update: the tiny problem I ignored yesterday has formed a committee.",
    "I went out for one normal errand and came back with a receipt, a minor curse and somebody else's lunch.",
    "Not to alarm anyone, but the town noticeboard has started replying to the notices.",
    "I have now heard three different versions of what happened and all three were told by me.",
    "Does anyone know why the palace lift stops at a floor that is not on the buttons?",
    "The person behind me in the queue knew my full government name. I was buying onions.",
    "I was promised a quiet afternoon. There are currently six witnesses and a damp horse.",
    "Small administrative issue: the emergency plan has become sentient and is asking for weekends off.",
    "I tried to return a library book and the librarian asked me to return the year 1842 as well.",
    "Someone has put a tiny hat on the warning statue. The statue looks happier. This is making the warning less effective.",
    "I am not saying the map is lying. I am saying it has moved the river since breakfast.",
    "The group chat has gone quiet in the exact way a kitchen goes quiet when something is burning.",
    "I have spent forty minutes looking for my keys. They were in the dragon. The dragon says we never discussed this.",
    "The new neighbour is very polite, but their mailbox is full of teeth.",
    "I have received a formal complaint about my tone from a person who communicates exclusively through thunder.",
    "Today's forecast: light rain, heavy omens, and a chance of somebody bringing up the incident at dinner.",
    "I only asked one question at the meeting. Somehow I am now responsible for the moon.",
    "There is a handwritten sign on the tavern door that says 'please stop testing the floor'. I have questions.",
    "I think the prophecy has been edited. The handwriting is definitely mine, but I don't remember owning that pen.",
    "I bought the cheap version and now the artifact keeps asking me to upgrade."
  ];
  const endings = [
    "Anyway, I have screenshots but they make it look worse.",
    "I am going to leave this here before it becomes a meeting.",
    "Please do not tag the person involved. They are already in the room.",
    "The official report will say 'weather-related'.",
    "I would explain further but the kettle is making the noise again.",
    "If anyone needs me, I will be somewhere with a door that locks.",
    "This is a normal amount of paperwork. I have checked.",
    "I am choosing not to learn what the wet footprints mean.",
    "No follow-up questions until everyone has eaten.",
    "I stand by the first half of this statement."
  ];
  const characterNotes = {
    "Gandalf":["the inn charged me extra for the room with the least prophecy in it","I have misplaced my pipe and suspect the eagles know more than they admit"],
    "Batman":["the cave's new motion sensor keeps alerting me to my own dramatic entrances","Alfred labelled the leftovers. I have ignored the label and regret it"],
    "Spider-Man":["the landlord has emailed again about the ceiling. I cannot keep saying 'weather event'","the train was delayed by a man in a cape arguing with a pigeon"],
    "Darth Vader":["the helmet fogged up during a budget meeting and nobody offered assistance","someone changed the conference room booking to 'dark side karaoke'"],
    "Yoda":["the kettle, I have descaled. Proud, I am. The instructions, ignored, I have","a parking ticket, I received. In this economy, difficult the Force is"],
    "SpongeBob":["Squidward has put a tiny cone around my desk and called it a boundary","the Krusty Krab ran out of napkins and somehow this is now a leadership issue"],
    "Shrek":["someone has left a wellness pamphlet outside my swamp. It is soggy now","the council wants me to attend a 'community listening circle'. I live in a swamp"],
    "Loki":["I was asked to sign for a parcel addressed to 'the other Loki'. There are four of us on this street","the palace has introduced a rota for dramatic entrances. I was not consulted"],
    "Mario":["the plumbing inspection was mostly questions about the pipes. Suspiciously specific questions","someone keeps leaving mushrooms in the staff fridge with no labels"],
    "Dumbledore":["the staff meeting could have been an owl","I have once again lost a very important object in a room that was not there yesterday"]
  };
  const details = [
    "the receipt was itemised, which somehow made it more insulting",
    "there were two witnesses and one of them was taking notes on a napkin",
    "the notice said 9:00, but nobody specified which calendar",
    "I have a photo, but in the background the same thing is happening again",
    "the person responsible said 'that's not usually attached' and walked away",
    "it was resolved in the group chat, then immediately un-resolved in person",
    "I am still waiting for the promised follow-up email"
  ];
  const templates = [
    p => p.name+": "+pick(characterNotes[p.name]||["I went to do one ordinary thing and somehow became the person in charge","the local office has my name spelled three different ways and all of them are legally binding"])+". "+pick(details)+".",
    p => "At "+p.place+" today, "+p.name+" "+pick(["waited 25 minutes for a form that turned out to be a person","politely asked who approved the new staircase; nobody made eye contact","watched a minor disagreement become an official calendar event","found a handwritten apology addressed to 'whoever keeps doing that'"])+". "+pick(endings),
    p => "Has anyone else noticed that "+pick(["the same three people keep arriving just before something breaks","the public noticeboard is using increasingly personal examples","the staff teapot is always warm even when nobody has been in the room","every official form has a box for 'unusual animal involvement'"])+ "? Asking because "+p.name+" has now had to explain it twice.",
    p => "I was standing behind "+p.name+" in "+p.place+" and heard them say, very calmly: '"+pick(["I don't think that door was there yesterday","we agreed not to feed it after midnight","please put the sword back before the inspection","that is not my emergency pigeon"])+"'. Nobody in the queue reacted. That is the worrying part.",
    p => "A completely ordinary update from "+p.name+": "+pick(["the appointment has moved to the abandoned lighthouse","the spare key is now considered a diplomatic object","the meeting minutes have been classified as a weather system","the local bakery is asking customers to declare magical side effects"])+". "+pick(details)+".",
    p => p.name+" posted a photo of "+pick(["a very normal sandwich with a tiny official seal on it","a cracked paving stone shaped exactly like the mayor","three identical lost-property tickets","a suspiciously familiar hat on an unfamiliar statue"])+ " with the caption: '"+pick(["not getting involved again","this feels like a trap but it is a nice hat","I have asked twice and nobody will explain","please tell me this belongs to someone"])+"'.",
    p => "Update from "+p.place+": "+p.name+" has "+pick(["apologised to the entire queue, including a decorative fern","been asked to stop using the emergency bell for routine announcements","returned the borrowed ladder but not the small moon","started a spreadsheet to track who keeps moving the chairs"])+". The spreadsheet already has 11 tabs."
  ];
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const people = worlds.flatMap(w => w.people.map(([name,emoji,place])=>({name,emoji,place,world:w.name,color:w.color})));
  const state = {posts:[],view:"feed",world:"All",sort:"latest",visible:14,following:new Set(JSON.parse(localStorage.getItem("blinkFollowing")||"[]")),saved:new Set(JSON.parse(localStorage.getItem("blinkSaved")||"[]")),liked:new Set(),generated:0};
  const ago = n => n<1?"just now":n+"m ago";
  const makePost = (person, customText) => ({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),person,text:customText||pick(templates)(person)+" "+(Math.random()>.45?pick(endings):""),minutes:Math.floor(Math.random()*180),likes:Math.floor(Math.random()*4200),comments:Math.floor(Math.random()*240),origin:pick(["💬 group chat","📎 local noticeboard","🧾 eyewitness account","📡 direct transmission","🗂️ meeting minutes","🛸 public broadcast"])});
  function seed(){for(let i=0;i<34;i++){const p=pick(people);const post=makePost(p,Math.random()<.24?pick(openers)+" "+pick(endings):null);post.minutes=i*3+Math.floor(Math.random()*3);state.posts.push(post)}}
  function generate(){const p=pick(people);const text=Math.random()<.58?pick(templates)(p)+" "+pick(endings):pick(openers)+" "+pick(endings);state.posts.unshift(makePost(p,text));state.generated++;render();toast(p.name+" has entered the chat.");}
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function render(){const q=$("#searchInput").value.trim().toLowerCase();let list=[...state.posts];if(state.view==="following")list=list.filter(p=>state.following.has(p.person.name));if(state.view==="saved")list=list.filter(p=>state.saved.has(p.id));if(state.view==="trending")list.sort((a,b)=>b.likes-a.likes);if(state.world!=="All")list=list.filter(p=>p.person.world===state.world);if(q)list=list.filter(p=>(p.text+" "+p.person.name+" "+p.person.world+" "+p.person.place).toLowerCase().includes(q));if(state.sort==="oldest")list.reverse();const shown=list.slice(0,state.visible);
    $("#feed").innerHTML=shown.length?shown.map(p=>{const liked=state.liked.has(p.id),saved=state.saved.has(p.id);return `<article class="post" data-id="${p.id}"><div class="post-top"><div class="avatar" style="background:${p.person.color}22">${p.person.emoji}</div><div class="post-identity"><div class="post-name">${escapeHTML(p.person.name)} <span class="verified">✳</span></div><div class="post-meta">${escapeHTML(p.person.place)} · ${ago(p.minutes)}</div></div><span class="world-tag">${escapeHTML(p.person.world)}</span></div><p class="post-text">${escapeHTML(p.text)}</p><div class="post-actions"><button class="action ${liked?"liked":""}" data-action="like">♥ ${(p.likes+(liked?1:0)).toLocaleString()}</button><button class="action" data-action="comment">▢ ${p.comments} replies</button><button class="action ${saved?"saved":""}" data-action="save">${saved?"▣ Saved":"▱ Save"}</button><button class="action" data-action="follow">${state.following.has(p.person.name)?"Following":"＋ Follow"}</button><span class="post-origin">${p.origin}</span></div><div class="comment-box"><input maxlength="120" placeholder="Reply to this fictional disaster…"><button data-action="reply">Reply</button></div></article>`}).join(""):'<div class="empty">Nothing in this corner of the multiverse yet.<br>Generate some chaos or change your filters.</div>';
    $("#postCount").textContent=state.posts.length.toLocaleString();$("#followingCount").textContent=state.following.size;$("#loadMore").style.display=list.length>state.visible?"block":"none";$("#feedTitle").textContent=state.world!=="All"?state.world:({feed:"For You",following:"Following",trending:"Trending",saved:"Saved posts"}[state.view]||"For You");$("#feedSubtitle").textContent=state.view==="trending"?"The loudest nonsense across known realities.":state.view==="saved"?"Your carefully curated collection of fictional chaos.":"Unfiltered thoughts from across fictional reality.";
    $("#trendingTopics").innerHTML=["#ProphecyProblems","#VillainUnion","#DungeonRent","#MultiverseHR","#GooseIncident"].map((t,i)=>`<div class="topic" data-topic="${t.slice(1)}"><small>0${i+1} · MULTIVERSE</small><strong>${t}</strong><span>${(Math.floor(Math.random()*90)+12).toLocaleString()}k posts</span></div>`).join("");
    $("#onlineList").innerHTML=people.slice(0,5).map(p=>`<div class="online-person"><div class="online-avatar" style="background:${p.color}22">${p.emoji}</div><div><strong>${p.name}</strong><small>${p.world} · ONLINE</small></div></div>`).join("");
    $("#chaosLevel").textContent=state.generated>20?"CRITICAL":state.generated>8?"ELEVATED":"UNSTABLE";
  }
  let toastTimer;function toast(s){const t=$("#toast");t.textContent=s;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2100)}
  $("#feed").addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(!b)return;const card=b.closest(".post"),id=card.dataset.id,p=state.posts.find(x=>x.id===id);switch(b.dataset.action){case"like":state.liked.has(id)?state.liked.delete(id):state.liked.add(id);render();break;case"save":state.saved.has(id)?state.saved.delete(id):state.saved.add(id);localStorage.setItem("blinkSaved",JSON.stringify([...state.saved]));render();toast("Saved locally.");break;case"follow":state.following.has(p.person.name)?state.following.delete(p.person.name):state.following.add(p.person.name);localStorage.setItem("blinkFollowing",JSON.stringify([...state.following]));render();break;case"comment":card.querySelector(".comment-box").classList.toggle("open");break;case"reply":{const input=card.querySelector("input");if(input.value.trim()){p.comments++;input.value="";render();toast("Reply sent into the void.");}}}});
  $("#worldFilters").innerHTML='<button class="world-filter active" data-world="All"><i class="world-dot" style="background:#999"></i>All worlds</button>'+worlds.map(w=>`<button class="world-filter" data-world="${w.name}"><i class="world-dot" style="background:${w.color}"></i>${w.name}</button>`).join("");
  $("#worldFilters").addEventListener("click",e=>{const b=e.target.closest("[data-world]");if(!b)return;state.world=b.dataset.world;document.querySelectorAll(".world-filter").forEach(x=>x.classList.toggle("active",x===b));state.visible=14;render()});
  document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>{state.view=b.dataset.view;document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x===b));render()}));
  $("#generateBtn").addEventListener("click",generate);$("#shuffleBtn").addEventListener("click",()=>{state.posts.sort(()=>Math.random()-.5);state.sort="latest";render();toast("Timeline scrambled.")});
  $("#searchInput").addEventListener("input",()=>{state.visible=14;render()});$("#loadMore").addEventListener("click",()=>{state.visible+=12;render()});
  $("#sortBtn").addEventListener("click",()=>{state.sort=state.sort==="latest"?"oldest":"latest";$("#sortBtn").textContent=state.sort==="latest"?"Latest first ↓":"Oldest first ↑";render()});
  $("#postInput").addEventListener("input",e=>{$("#charCount").textContent=e.target.value.length+" / 280";$("#postBtn").disabled=!e.target.value.trim()});
  $("#postBtn").addEventListener("click",()=>{const text=$("#postInput").value.trim();if(!text)return;const person={name:"You (Observer)",emoji:"👁️",place:"Outside the simulation",world:"Observer",color:"#777"};state.posts.unshift(makePost(person,text));state.generated++;$("#postInput").value="";$("#charCount").textContent="0 / 280";$("#postBtn").disabled=true;state.view="feed";state.world="All";render();toast("Broadcast delivered to absolutely nobody.");});
  $("#trendingTopics").addEventListener("click",e=>{const t=e.target.closest("[data-topic]");if(t){$("#searchInput").value=t.dataset.topic.replace(/([A-Z])/g," $1");render()}});
  seed();render();
})();