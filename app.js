(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const worlds = [
    {name:"Fantasy",color:"#8c79b7",emoji:"🧙",people:[
      ["Mara the Stablehand","🐴","Middle-earth"],["Pip the Ferry Keeper","🚣","Middle-earth"],["Bram the Blacksmith","🔨","Berk"],["Nella the Market Baker","🥖","Arendelle"],["Tovin the Tavern Cook","🍲","The Continent"],["Hettie the Greenhouse Assistant","🌱","Wizarding World"],["Orin the Archive Clerk","📚","Rivendell"],["Della the Bridge Tollkeeper","🪙","Far Far Away"]
    ]},
    {name:"Sci-Fi",color:"#65a6b7",emoji:"🛸",people:[
      ["Jex the Dockside Parts Dealer","🔧","Galactic Empire"],["Mira the Night-Shift Dispatcher","📟","Star Trek"],["UNIT Records Intern","🗃️","Time and Space"],["K-4 Transit Mechanic","🤖","Cybertron"],["Cargo Bay Technician","🧰","USCSS Nostromo"],["Rebel Supply Quartermaster","📦","Rebel Alliance"],["Outer-Rim Moisture Farmer","🌵","Jedi Order"],["Orbital Salvage Sorter","🛰️","Earth"]
    ]},
    {name:"Anime",color:"#d98b9d",emoji:"🍥",people:[
      ["Riku the Ramen Stall Assistant","🍜","Hidden Leaf"],["Pavo the Harbor Dockworker","⚓","Grand Line"],["Emi the Last-Train Conductor","🚉","Tokyo"],["Capsule Delivery Rider","🛵","Earth"],["Jin the School Gate Monitor","📋","Jujutsu High"],["Kanto Poké Mart Cashier","🧃","Kanto"],["Olek the Apartment Caretaker","🧹","Ostania"],["Mori the Forest Path Guide","🍃","Forest"]
    ]},
    {name:"Comics",color:"#d59b52",emoji:"💥",people:[
      ["Gotham Night-Bus Driver","🚌","Gotham"],["Queens Bodega Cashier","🥤","New York"],["Themysciran Archive Keeper","📜","Themyscira"],["Earth-616 Parking Inspector","🅿️","Earth-616"],["Gotham Evidence Room Clerk","🗂️","Gotham"],["Metropolis Elevator Technician","🛗","Metropolis"],["Harbor District Flower Seller","💐","Gotham"],["Asgardian Banquet Dishwasher","🍽️","Asgard"]
    ]},
    {name:"Games",color:"#75a47b",emoji:"🎮",people:[
      ["Mushroom Kingdom Toadstool Vendor","🍄","Mushroom Kingdom"],["Hyrule Stablehand","🐎","Hyrule"],["Dream Land Pastry Seller","🥐","Dream Land"],["Museum Night Guard","🔦","Tomb Raider"],["Green Hill Checkpoint Attendant","🚩","Green Hill"],["Kamurocho Karaoke Receptionist","🎤","Kamurocho"],["Aperture Maintenance Technician","🧯","Aperture"],["Underground Noticeboard Keeper","💀","Underground"]
    ]},
    {name:"Cartoons",color:"#d4a4d0",emoji:"📺",people:[
      ["Bikini Bottom Fry-Cook Trainee","🍟","Bikini Bottom"],["Mystery Motel Receptionist","🛎️","Mystery Inc."],["Acme Prop Warehouse Clerk","📦","Looney Tunes"],["Interdimensional Customs Officer","🛂","Dimension C-137"],["Candy Kingdom Parcel Courier","📮","Land of Ooo"],["Lawndale School Hall Monitor","📋","Lawndale"],["Springfield Night-Shift Cashier","🥤","Springfield"],["Mystery Inc. Van Mechanic","🔩","Mystery Inc."]
    ]},
    {name:"C-Drama",color:"#bd8c65",emoji:"🏮",people:[
      ["Jade Pavilion Tea Server","🫖","Immortal Cultivation Realm"],["Imperial Archive Copyist","📜","Ancient Capital"],["River Lantern Boatman","🏮","Jianghu"],["Royal Kitchen Apprentice","🥟","Imperial Palace"],["Herbal Shop Assistant","🌿","Wuxia Market"],["Palace Laundry Supervisor","🧺","Inner Court"],["Mountain Sect Gatekeeper","⛰️","Cultivation Sect"],["Caravan Ledger Keeper","🧾","Silk Road Fantasy"]
    ]},
    {name:"K-Drama",color:"#c58d9b",emoji:"🎬",people:[
      ["Han River Convenience Clerk","🥤","Seoul"],["Rooftop Garden Caretaker","🪴","Seoul Rooftops"],["Hospital Night Receptionist","🏥","University Hospital"],["Agency Coffee Runner","☕","Entertainment District"],["Building Security Guard","🔑","Luxury Apartment Tower"],["Wedding Hall Coordinator","💐","Gangnam"],["Subway Lost-and-Found Worker","🚇","Seoul Metro"],["Market Side-Dish Seller","🥬","Traditional Market"]
    ]},
    {name:"J-Drama",color:"#8e9dba",emoji:"🎏",people:[
      ["Kissaten Closing Barista","☕","Tokyo"],["Ryokan Front Desk Clerk","🛎️","Hakone"],["Shōtengai Bicycle Repairer","🚲","Local Shopping Street"],["School Broadcast Club Assistant","🎙️","Tokyo High School"],["Late-Night Bento Seller","🍱","Osaka"],["Train Platform Attendant","🚉","Yamanote Line"],["Small Town Post Office Clerk","📮","Rural Japan"],["Film Set Props Assistant","🎞️","Tokyo Studio"]
    ]},
    {name:"Light Novels",color:"#9a8bc1",emoji:"📖",people:[
      ["Adventurers' Guild Receptionist","📋","Starter Town"],["Dungeon Drop Appraiser","💎","Labyrinth City"],["Magic Academy Dorm Warden","🗝️","Royal Academy"],["Beastfolk Innkeeper","🍵","Frontier Village"],["Summoned-Item Shopkeeper","🧰","Otherworld Market"],["Royal Correspondence Clerk","✉️","Capital"],["Airship Ticket Inspector","🎫","Sky Archipelago"],["Demon Realm Tax Collector","🧮","Demon Kingdom"]
    ]},
    {name:"Manhwa",color:"#7fa69b",emoji:"📱",people:[
      ["Hunter Association Rank Clerk","🪪","Awakening Bureau"],["Dungeon Gate Cleanup Worker","🧹","Modern Seoul"],["Tower Floor Snack Vendor","🍙","The Tower"],["Murim Inn Stable Worker","🐎","Murim District"],["Regression Support Desk Agent","📞","Second-Chance Timeline"],["Guild Equipment Repairer","🔧","Hunter City"],["Academy Uniform Tailor","🧵","Noble Academy"],["Constellation Message Moderator","💬","Star Stream"]
    ]},
    {name:"Manhua",color:"#c18c74",emoji:"🐉",people:[
      ["Spirit Stone Weighing Clerk","⚖️","Cultivation City"],["Flying Sword Courier","🗡️","Eastern Immortal Realm"],["Pill Furnace Assistant","⚗️","Alchemy Pavilion"],["Sect Library Night Keeper","📚","Cloud Mountain Sect"],["Jade Market Stallholder","🪷","Celestial Bazaar"],["Tribulation Weather Announcer","⛈️","Upper Realm"],["Formation Repair Apprentice","🧿","Outer Sect"],["Beast Stable Feeder","🐲","Spirit Beast Valley"]
    ]},
    {name:"Donghua",color:"#6d9eaa",emoji:"🎐",people:[
      ["Heavenly Bureau Stamp Clerk","🔖","Celestial Court"],["Spirit Beast Clinic Assistant","🐾","Immortal City"],["Sword Pavilion Tea Maker","🍵","Cultivation Mountain"],["Underwater Palace Messenger","🐚","Dragon Palace"],["Artifact Auction Catalogue Writer","📑","Nine Realms"],["Flying Boat Dock Marshal","⛵","Sky Harbor"],["Demon Market Noodle Vendor","🍜","Demon City"],["Reincarnation Registry Assistant","🗃️","Netherworld Office"]
    ]},
    {name:"Marvel",color:"#bd6c62",emoji:"🦸",people:[
      ["Damage Control Claims Adjuster","📋","New York"],["Xavier School Cafeteria Worker","🥪","Westchester"],["Wakandan Transit Engineer","🚄","Wakanda"],["Stark Tower Night Cleaner","🧽","Manhattan"],["Sanctum Mailroom Assistant","📬","Greenwich Village"],["Daily Bugle Photo Desk Intern","📷","New York"],["Knowhere Dock Scheduler","🛸","Knowhere"],["Asgardian Embassy Translator","🗣️","New Asgard"]
    ]},
    {name:"DC",color:"#6f8fb8",emoji:"🦇",people:[
      ["Wayne Tower Elevator Operator","🛗","Gotham"],["Daily Planet Copy Editor","📰","Metropolis"],["Central City Evidence Technician","🧪","Central City"],["Themyscira Stable Groom","🐎","Themyscira"],["Hall of Justice Receptionist","🛎️","Washington D.C."],["Atlantis Aquarium Keeper","🐠","Atlantis"],["Gotham Bridge Maintenance Worker","🌉","Gotham"],["Smallville Farm Supply Clerk","🌽","Smallville"]
    ]},
    {name:"Image Comics",color:"#9b8b75",emoji:"🗯️",people:[
      ["Invincible Universe Parcel Sorter","📦","Earth"],["Hellspawn Cemetery Groundskeeper","🪦","New York"],["Energon Depot Shift Worker","🔋","Cybertronian Outpost"],["Walking Dead Safe-Zone Water Clerk","🚰","Alexandria"],["Witchblade Evidence Archivist","🗂️","New York"],["Spawn's Alleyway Newspaper Seller","🗞️","Rat City"],["Saga Port Customs Officer","🛂","Landfall Border"],["Radiant Black Rooftop Repairer","🧰","Chicago"]
    ]},
    {name:"Web Novels",color:"#8b9c78",emoji:"🖋️",people:[
      ["System Notification QA Tester","🧑‍💻","Infinite Tutorial"],["Apocalypse Shelter Quartermaster","🥫","Last Safe Zone"],["Time-Loop Café Owner","☕","Repeating Tuesday"],["Interworld Train Conductor","🚂","Worldline Station"],["Dungeon Stream Chat Moderator","🎧","Live Raid District"],["Cultivation Forum Moderator","🧑‍⚖️","DaoNet"],["Portal Immigration Officer","🛂","Crossworld Gate"],["Magic Item Warranty Agent","🧾","Adventurer Internet"]
    ]}
  ];
  const openers = [
    "I need everyone to understand that this started as a routine maintenance request.",
    "The notice said this would take five minutes. It has now acquired a witness list.",
    "I was trying to be helpful. There is apparently a form for that, and I used the wrong one.",
    "The queue was moving normally until somebody asked whether the person at the front was supposed to be there.",
    "A small correction to the story going around: nobody was chased. We all walked briskly in the same direction.",
    "I have been asked to explain why the break-room kettle is now part of an ongoing investigation.",
    "The new rule is understandable in theory and impossible to follow in the building we actually have.",
    "I thought the strange noise was coming from the pipes. The pipes have submitted a statement denying this.",
    "Today's shift began with a missing key, a duplicated delivery, and a very confident pigeon.",
    "I would like to report an administrative error without becoming the administrative error.",
    "Someone has labelled the communal leftovers. The label is longer than the ingredients list.",
    "There was a completely normal announcement over the loudspeaker, followed by someone whispering 'not again'.",
    "I have just learned that the emergency contact number belongs to the person causing the emergency.",
    "The meeting could have been an email. The email could have been a warning. The warning has now been forwarded to me.",
    "I am not qualified to settle this dispute, but apparently I am the only one who read the sign.",
    "The replacement part arrived on time. Unfortunately, it appears to be the original part wearing a different label.",
    "A customer asked for the manager, then apologised to the manager, then asked me to hide the manager.",
    "We have reached the stage of the problem where people are bringing snacks to watch."
  ];
  const endings = [
    "Nobody was injured, but three people have changed their lunch route.",
    "The official version is shorter and leaves out the part that matters.",
    "I have written it all down. The paper is now missing.",
    "For now, the sign has been turned around and everyone is pretending that counts as a solution.",
    "The supervisor said we should keep this informal. There are already 19 pages.",
    "I am not naming names because the person involved is reading this over my shoulder.",
    "The repair is temporary, the apology is permanent, and the invoice is somehow addressed to me.",
    "We agreed to discuss it tomorrow, which is how it became tomorrow's problem.",
    "I would post the picture, but the picture has become evidence.",
    "The kettle is fine. The committee formed around it is not.",
    "Please use the side entrance until somebody explains what the front entrance is doing.",
    "I have clocked out. Whatever happens next is between the building and its landlord.",
    "No one has admitted anything, but somebody brought the exact replacement screws.",
    "This is now a policy question, which means it will take six weeks and a ceremonial stamp.",
    "I am choosing to believe this is the last update. It probably isn't."
  ];
  const details = [
    "the receipt has a second page listing a witness",
    "the time on the form is correct, but the date belongs to next week",
    "two people independently described the same hat and neither person owns a hat",
    "the person who complained is now helping with the investigation",
    "the replacement key opens the cupboard, the stairwell, and one very private diary",
    "the apology was sincere, although it was addressed to the wrong department",
    "the camera footage ends exactly when everyone looks directly at the camera",
    "the delivery was signed for by someone who was still waiting outside",
    "the official explanation uses the phrase 'routine atmospheric irregularity'",
    "someone has highlighted the relevant paragraph in a colour that does not exist here",
    "the only available evidence is a damp napkin and a surprisingly detailed sketch",
    "the person in charge keeps saying this is not their first incident, which is not reassuring"
  ];
  const templates = [
    p => p.name+": "+pick(characterNotes[p.name]||["I was covering the desk for ten minutes and came back to a new procedure nobody can explain","the shift log has three entries in my handwriting that I do not remember writing"])+". "+pick(details)+". "+pick(endings),
    p => "SHIFT REPORT — "+p.place+". "+p.name+" recorded "+pick(["a delivery addressed to the room that was demolished last month","a customer dispute over an item nobody remembers putting on sale","an unexplained queue forming outside a locked cupboard","a maintenance request submitted by the maintenance equipment itself"])+". Status: "+pick(["technically resolved","awaiting a signature","passed to the next shift","being described as a misunderstanding"])+".",
    p => "Neighbourhood update: "+p.name+" at "+p.place+" has asked people to stop "+pick(["leaving labelled jars on the windowsill","borrowing the same ladder and returning a different ladder","moving the public bench six inches every night","using the noticeboard to settle personal arguments"])+". The request is reasonable. The responses are not.",
    p => "I was behind "+p.name+" at "+p.place+" when they said, ' "+pick(["That is not the form for a missing staircase.","I can explain the receipt, but not the horse.","We agreed the bell was only for actual emergencies.","Please stop putting unofficial names on the delivery crates.","Nobody is allowed to feed the lift anymore."])+ "'. The clerk nodded like this was a recurring issue.",
    p => "PUBLIC NOTICE from "+p.place+": "+pick(["Please do not leave unattended parcels that are ticking, purring, or asking for directions.","The lost-property desk cannot accept claims for borrowed time.","Staff are reminded that 'because it looked lonely' is not an approved reason for adopting equipment.","The west corridor is open again. Please ignore the additional west corridor."])+ " — posted by "+p.name+". Someone has already written 'make me' underneath.",
    p => p.name+" has started a spreadsheet after "+pick(["the communal mug went missing for the fourth time","three departments ordered the same replacement door","the night shift and day shift reported different numbers of stairs","the supply cupboard began returning items with feedback"])+". It has columns for date, witnesses, estimated cost, and 'who keeps doing this'.",
    p => "A small scene from "+p.place+": "+p.name+" "+pick(["held the door open for a delivery trolley that was not moving","waited patiently while two officials argued over whose stamp was more official","put a traffic cone around a puddle and then had to direct traffic around it","tried to return a borrowed umbrella to the person who was currently using it"])+". Nobody raised their voice. That somehow made it worse.",
    p => "CUSTOMER SERVICE LOG: "+p.name+" at "+p.place+". Complaint: "+pick(["the timetable is accurate but the journey is not","the soup was delivered with a receipt from a different century","the lift arrived before the button was pressed","the parcel contained exactly what was ordered, just not by this customer"])+". Resolution offered: "+pick(["a refund","a written apology","a replacement with no guarantees","a meeting that nobody requested"])+".",
    p => "The rumour about "+p.place+" is almost correct. "+p.name+" confirms that "+pick(["the night guard did hear singing from the storage room","the missing crate was found behind the same crate","the new rule was written by someone who does not work here","the official map has been quietly corrected twice"])+". The part people keep leaving out is "+pick(details)+".",
    p => "BREAKING, according to the very unreliable noticeboard: "+p.name+" has allegedly "+pick(["been promoted to temporary keeper of the spare keys","banned one specific chair from the premises","declared the staff biscuits a protected resource","challenged the timetable to provide a written explanation"])+". The noticeboard refuses to identify its sources."
  ];
    const characterNotes = {
    "Mara the Stablehand":["the stable's complaint box contains one carrot and a very detailed threat","someone keeps booking the same horse under increasingly fake names"],
    "Pip the Ferry Keeper":["the river has started returning lost property from people who are still alive","a passenger paid in buttons and somehow I owe him change"],
    "Bram the Blacksmith":["the village keeps bringing me cursed spoons instead of actual swords","the new anvil rings whenever someone lies near it"],
    "Nella the Market Baker":["the palace requested a cake shaped like a tax audit","someone keeps leaving enchanted flour outside the back door"],
    "Tovin the Tavern Cook":["the stew has been reviewed by a wizard and a very disappointed duck","the kitchen inventory lists one ghost under 'dry goods'"],
    "Hettie the Greenhouse Assistant":["a mandrake has learned to whistle the staff rota","the greenhouse door is locked from the inside and nobody is in there"],
    "Orin the Archive Clerk":["three books have checked themselves out and left no forwarding address","the index now has a category called 'things that remember being books'"],
    "Della the Bridge Tollkeeper":["a troll tried to pay with an invoice for future tolls","the bridge is technically a boat today and nobody told accounting"],
    "Jex the Dockside Parts Dealer":["a customer returned a hyperdrive because it made a noise 'like an ex'","the spare-parts shelf is humming in a language I do not speak"],
    "Mira the Night-Shift Dispatcher":["the station's automated announcements keep adding passive-aggressive comments","a shuttle filed a noise complaint against its own engine"],
    "UNIT Records Intern":["the archive has a folder labelled 'probably not aliens' and it is the largest folder","my supervisor said to stop logging unexplained blue lights as 'office lighting'"],
    "K-4 Transit Mechanic":["the moving walkway has applied for a transfer","someone keeps installing cupholders on machinery that has no cups"],
    "Cargo Bay Technician":["the cargo manifest says 'miscellaneous eggs' and I am not opening that crate","the motion detector keeps reporting one extra person, always behind me"],
    "Rebel Supply Quartermaster":["we are short 400 ration packs and somehow overstocked on ceremonial capes","someone requisitioned a tiny screwdriver as a strategic asset"],
    "Outer-Rim Moisture Farmer":["the vaporator is making a sound like it wants to negotiate","a Jawa returned a part I have never owned"],
    "Orbital Salvage Sorter":["the sorting belt keeps sending the same boot back around","I labelled a mystery object 'probably a chair' and it started unfolding"],
    "Riku the Ramen Stall Assistant":["a customer asked for extra spice and then challenged the soup to a duel","the broth timer has been counting down from a number with seven digits"],
    "Pavo the Harbor Dockworker":["a crate marked 'definitely not treasure' is making coin noises","the gulls have learned the shift whistle and now they clock out before us"],
    "Emi the Last-Train Conductor":["the same passenger gets on at the last stop and asks if this is the first stop","someone left a perfectly dry umbrella on a train during a typhoon"],
    "Capsule Delivery Rider":["the delivery app says the address is 'two minutes in the future'","a customer rated me one star because the package arrived before they ordered it"],
    "Jin the School Gate Monitor":["the school gate scanner keeps recognising people who have not arrived yet","someone left a cursed umbrella in lost property and it is raining indoors"],
    "Kanto Poké Mart Cashier":["a customer tried to return a sandwich because it evolved","the self-checkout keeps asking whether I want to register as a trainer"],
    "Olek the Apartment Caretaker":["the lift refuses to stop at floor four unless someone says please","a tenant reported a suspicious noise coming from inside the building directory"],
    "Mori the Forest Path Guide":["the trail markers have been rearranged into what looks like a complaint","a tree has been leaving acorns on my desk in alphabetical order"],
    "Gotham Night-Bus Driver":["the passenger who boards at 2:13 never appears on the CCTV","someone paid the fare with a very convincing apology note"],
    "Queens Bodega Cashier":["the fridge is making web-shaped ice and I have decided not to ask","a superhero left exact change and a six-page incident report"],
    "Themysciran Archive Keeper":["the scroll return slot has rejected a prophecy for being overdue","someone keeps borrowing books about diplomatic etiquette and returning them wet"],
    "Earth-616 Parking Inspector":["a portal opened in a loading zone and still had an expired meter","I issued a ticket to a parked bicycle and it appealed"],
    "Gotham Evidence Room Clerk":["the evidence labels keep changing to 'not this one, the other one'","someone returned a crowbar with a thank-you card"],
    "Metropolis Elevator Technician":["the express lift keeps stopping to let in pigeons","a button labelled 'roof' now takes people to the basement"],
    "Harbor District Flower Seller":["a customer ordered twelve roses and asked me to make them look less suspicious","the tulips have been leaning away from the courthouse"],
    "Asgardian Banquet Dishwasher":["one goblet keeps returning clean before I wash it","the feast hall has a new rule about not putting enchanted cutlery in the sink"],
    "Mushroom Kingdom Toadstool Vendor":["customers keep asking whether the mushrooms are for eating or jumping","the shop's loyalty card has somehow become a royal document"],
    "Hyrule Stablehand":["a horse has learned to untie the other horses and is charging them for freedom","the stable ledger has a hoofprint signature in the manager column"],
    "Dream Land Pastry Seller":["the puff pastries keep floating toward the ceiling in formation","someone ordered a cake that is mostly frosting and one tiny sword"],
    "Museum Night Guard":["the security camera shows me entering rooms before I walk into them","the statue is facing the wall again; nobody will admit moving it"],
    "Green Hill Checkpoint Attendant":["the speed sensor clocked a hedgehog-shaped blur going backwards","someone keeps moving the finish line three metres to the left"],
    "Kamurocho Karaoke Receptionist":["room 6 has been booked under the name 'Definitely Not The Boss'","the microphone is picking up a second voice that only sings the chorus"],
    "Aperture Maintenance Technician":["the test chamber requested a window and then filed a safety complaint about sunlight","the maintenance ladder is now listed as experimental equipment"],
    "Underground Noticeboard Keeper":["the lost-and-found has a human-sized hole with a note saying 'found'","someone pinned a warning to the board and then stole the board"],
    "Bikini Bottom Fry-Cook Trainee":["the fryer has started beeping in Morse code for more oil","a customer asked whether the secret formula is gluten-free"],
    "Mystery Motel Receptionist":["guests keep checking in under the name 'not the monster'","room 12 has been vacant for years but someone keeps ordering towels"],
    "Acme Prop Warehouse Clerk":["the anvils are stored alphabetically and still keep falling on the wrong shelf","inventory says we have 800 fake doors and not one real exit"],
    "Interdimensional Customs Officer":["a traveller declared three memories and one suspiciously warm timeline","the scanner flagged a suitcase for containing a smaller scanner"],
    "Candy Kingdom Parcel Courier":["the delivery address is written as 'third gumdrop after the singing bush'","one parcel keeps arriving before I leave the depot"],
    "Lawndale School Hall Monitor":["the lost-property bin contains a complete desk and nobody has claimed it","someone keeps replacing the fire-drill map with a seating chart"],
    "Springfield Night-Shift Cashier":["the self-checkout has started asking customers how their marriage is","a man tried to pay for milk with arcade tokens and a weather forecast"],
    "Mystery Inc. Van Mechanic":["the van has one extra seat whenever it rains","I found a sandwich in the engine compartment and it was still warm"]
  };
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const people = worlds.flatMap(w => w.people.map(([name,emoji,place])=>({name,emoji,place,world:w.name,color:w.color})));
  // Expand each existing setting into original supporting residents, generated locally.
  const npcFirst=["Ari","Mina","Jun","Tao","Lina","Ravi","Sora","Niko","Mei","Dara","Kiran","Yuna","Ren","Anya","Kai","Priya","Hana","Ivo","Zhen","Milo","Suki","Noah","Leela","Jin","Eli","Amara","Bo","Nari","Theo","Aya","Samir","Mika"];
  const npcLast=["Vale","Park","Sen","Ito","Lin","Das","Reed","Kim","Shah","Watanabe","Chen","Roy","Kato","Morgan","Khan","Cho","Patel","Tanaka","Wu","Bose","Stone","Sato","Gupta","Bell","Zhou","Iyer","Fox","Nakamura","Singh","Moon","Hart","Dutta"];
  const npcJobs=[["🧹","cleaner"],["📦","warehouse sorter"],["🧾","records clerk"],["🍜","food-stall worker"],["🔧","repair technician"],["🛎️","receptionist"],["🚚","courier"],["🧪","lab assistant"],["📚","library aide"],["🚌","transit worker"],["🌱","groundskeeper"],["🛡️","night guard"],["🧵","tailor"],["🩺","clinic assistant"],["🎟️","ticket inspector"],["📯","message runner"]];
  const generatedNPCs=[];
  worlds.forEach((w,wi)=>{const places=[...new Set(w.people.map(person=>person[2]))];places.forEach((place,pi)=>npcJobs.forEach(([emoji,job],ri)=>{const first=npcFirst[(wi*7+pi*3+ri*5)%npcFirst.length];const last=npcLast[(wi*11+pi*5+ri*3)%npcLast.length];generatedNPCs.push({name:first+" "+last+" · "+job,emoji,place,world:w.name,color:w.color,kind:"Original background NPC"});}));});
  people.push(...generatedNPCs);
  const replyLines = [
    "I was on the previous shift. The version in the log is missing a very important sandwich.",
    "That is not what happened, but it is close enough that I am worried.",
    "Can we please not make this an official procedure.",
    "I have the receipt. I also have no idea why I kept the receipt.",
    "The same thing happened here, except ours had a clipboard.",
    "I can confirm the queue was there before the announcement.",
    "Please tell me someone has checked whether the door is still a door.",
    "I told the supervisor this would happen. I have the message timestamp.",
    "As the person who cleaned it up: absolutely do not touch it.",
    "I am not involved. I am replying only to correct the spelling of my name.",
    "This is why we have a sign. This is also why the sign is now missing.",
    "I can lend you a ladder, but I need it back as a ladder.",
    "The official explanation is technically true and emotionally dishonest.",
    "I saw the whole thing and still cannot explain the middle part.",
    "Whoever has my lunch container, please return the lid separately.",
    "I have forwarded this to the group chat. They are arguing about the hat again."
  ];
    const makeReplies = person => {
    const locals = people.filter(p => p.world === person.world && p.name !== person.name);
    const count = 1 + Math.floor(Math.random()*3);
    return Array.from({length:count},() => ({person:pick(locals.length?locals:people),text:pick(replyLines),minutes:Math.floor(Math.random()*90)}));
  };
  const state = {posts:[],view:"feed",world:"All",sort:"latest",visible:14,following:new Set(JSON.parse(localStorage.getItem("blinkFollowing")||"[]")),saved:new Set(JSON.parse(localStorage.getItem("blinkSaved")||"[]")),liked:new Set(),generated:0,openComments:new Set(),seenNPCs:new Set(JSON.parse(localStorage.getItem("blinkSeenNPCs")||"[]"))};
  const ago = n => n<1?"just now":n+"m ago";
  const makePost = (person, customText) => {
    const replies=makeReplies(person);
    return {id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),person,text:customText||pick(templates)(person)+" "+(Math.random()>.45?pick(endings):""),minutes:Math.floor(Math.random()*180),likes:Math.floor(Math.random()*4200),replies,comments:replies.length,origin:pick(["💬 group chat","📎 local noticeboard","🧾 eyewitness account","📡 direct transmission","🗂️ meeting minutes","🛸 public broadcast"])};
  };
  const npcKey=p=>p.world+"|"+p.place+"|"+p.name;
  function saveSeenNPCs(){localStorage.setItem("blinkSeenNPCs",JSON.stringify([...state.seenNPCs]));}
  function unseenNPCs(){return people.filter(p=>!state.seenNPCs.has(npcKey(p)));}
  function chooseUnseenNPC(){let pool=unseenNPCs();if(!pool.length){state.seenNPCs.clear();saveSeenNPCs();pool=[...people];toast("You've met the whole current roster. Starting a fresh cycle.");}const person=pick(pool);state.seenNPCs.add(npcKey(person));saveSeenNPCs();return person;}
  function seed(){const pool=unseenNPCs().sort(()=>Math.random()-.5);const batch=pool.slice(0,34);batch.forEach((p,i)=>{state.seenNPCs.add(npcKey(p));const post=makePost(p,Math.random()<.24?pick(openers)+" "+pick(endings):null);post.minutes=i*3+Math.floor(Math.random()*3);state.posts.push(post);});saveSeenNPCs();}
  function generate(){const p=chooseUnseenNPC();const text=Math.random()<.58?pick(templates)(p)+" "+pick(endings):pick(openers)+" "+pick(endings);state.posts.unshift(makePost(p,text));state.generated++;render();toast(p.name+" has entered the chat.");}
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function render(){const q=$("#searchInput").value.trim().toLowerCase();
    if(state.view==="directory"){let directory=people.filter(p=>(state.world==="All"||p.world===state.world)&&(!q||(p.name+" "+p.world+" "+p.place+" "+(p.kind||"Named background NPC")).toLowerCase().includes(q)));const shownPeople=directory.slice(0,state.visible);$("#feed").innerHTML=shownPeople.length?shownPeople.map(p=>`<article class="npc-card"><div class="avatar" style="background:${p.color}22">${p.emoji}</div><div class="npc-card-main"><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.world)} · ${escapeHTML(p.place)}</small><span>${escapeHTML(p.kind||"Named background NPC")}</span></div></article>`).join(""):'<div class="empty">No NPCs match this search. Try another name, setting or world.</div>';$("#loadMore").style.display=directory.length>state.visible?"block":"none";$("#postCount").textContent=state.posts.length.toLocaleString();$("#followingCount").textContent=state.following.size;$("#feedTitle").textContent="NPC Directory";$("#feedSubtitle").textContent=people.length.toLocaleString()+" background residents across "+worlds.length+" fiction categories. Search by name, role, world or location.";$("#trendingTopics").innerHTML=["#NPCShiftProblems","#BackgroundCharacterEnergy","#MultiversePaperwork","#SideQuestUnion","#PortalCommute"].map((t,i)=>`<div class="topic"><small>0${i+1} · DIRECTORY</small><strong>${t}</strong><span>Resident chatter</span></div>`).join("");$("#onlineList").innerHTML=people.slice(0,5).map(p=>`<div class="online-person"><div class="online-avatar" style="background:${p.color}22">${p.emoji}</div><div><strong>${escapeHTML(p.name)}</strong><small>${p.world} · ONLINE</small></div></div>`).join("");$("#chaosLevel").textContent=state.generated>20?"CRITICAL":state.generated>8?"ELEVATED":"UNSTABLE";return;}
    let list=[...state.posts];if(state.view==="following")list=list.filter(p=>state.following.has(p.person.name));if(state.view==="saved")list=list.filter(p=>state.saved.has(p.id));if(state.view==="trending")list.sort((a,b)=>b.likes-a.likes);if(state.world!=="All")list=list.filter(p=>p.person.world===state.world);if(q)list=list.filter(p=>(p.text+" "+p.person.name+" "+p.person.world+" "+p.person.place).toLowerCase().includes(q));if(state.sort==="oldest")list.reverse();const shown=list.slice(0,state.visible);
    $("#feed").innerHTML=shown.length?shown.map(p=>{const liked=state.liked.has(p.id),saved=state.saved.has(p.id);return `<article class="post" data-id="${p.id}"><div class="post-top"><div class="avatar" style="background:${p.person.color}22">${p.person.emoji}</div><div class="post-identity"><div class="post-name">${escapeHTML(p.person.name)} <span class="verified">✳</span></div><div class="post-meta">${escapeHTML(p.person.place)} · ${ago(p.minutes)}</div></div><span class="world-tag">${escapeHTML(p.person.world)}</span></div><p class="post-text">${escapeHTML(p.text)}</p><div class="post-actions"><button class="action ${liked?"liked":""}" data-action="like">♥ ${(p.likes+(liked?1:0)).toLocaleString()}</button><button class="action" data-action="comment">▢ View comments (${p.replies.length})</button><button class="action ${saved?"saved":""}" data-action="save">${saved?"▣ Saved":"▱ Save"}</button><button class="action" data-action="follow">${state.following.has(p.person.name)?"Following":"＋ Follow"}</button><span class="post-origin">${p.origin}</span></div><div class="comments-panel ${state.openComments.has(p.id)?"open":""}"><div class="reply-list">${p.replies.map(r=>`<div class="reply-item"><div class="reply-avatar" style="background:${r.person.color}22">${r.person.emoji}</div><div class="reply-content"><strong>${escapeHTML(r.person.name)}</strong><small>${escapeHTML(r.person.place)} · ${ago(r.minutes)}</small><p>${escapeHTML(r.text)}</p></div></div>`).join("")}</div><div class="comment-box"><input maxlength="180" placeholder="Add a reply to this fictional disaster…"><button data-action="reply">Reply</button></div></div></article>`}).join(""):'<div class="empty">Nothing in this corner of the multiverse yet.<br>Generate some chaos or change your filters.</div>';
    $("#postCount").textContent=state.posts.length.toLocaleString();$("#followingCount").textContent=state.following.size;$("#loadMore").style.display=list.length>state.visible?"block":"none";$("#feedTitle").textContent=state.world!=="All"?state.world:({feed:"For You",following:"Following",trending:"Trending",saved:"Saved posts",directory:"NPC Directory"}[state.view]||"For You");$("#feedSubtitle").textContent=state.view==="trending"?"The loudest nonsense across known realities.":state.view==="saved"?"Your carefully curated collection of fictional chaos.":"Unfiltered thoughts from across fictional reality.";
    $("#trendingTopics").innerHTML=["#ProphecyProblems","#VillainUnion","#DungeonRent","#MultiverseHR","#GooseIncident"].map((t,i)=>`<div class="topic" data-topic="${t.slice(1)}"><small>0${i+1} · MULTIVERSE</small><strong>${t}</strong><span>${(Math.floor(Math.random()*90)+12).toLocaleString()}k posts</span></div>`).join("");
    $("#onlineList").innerHTML=people.slice(0,5).map(p=>`<div class="online-person"><div class="online-avatar" style="background:${p.color}22">${p.emoji}</div><div><strong>${p.name}</strong><small>${p.world} · ONLINE</small></div></div>`).join("");
    $("#chaosLevel").textContent=state.generated>20?"CRITICAL":state.generated>8?"ELEVATED":"UNSTABLE";
  }
  let toastTimer;function toast(s){const t=$("#toast");t.textContent=s;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2100)}
  $("#feed").addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(!b)return;const card=b.closest(".post"),id=card.dataset.id,p=state.posts.find(x=>x.id===id);switch(b.dataset.action){case"like":state.liked.has(id)?state.liked.delete(id):state.liked.add(id);render();break;case"save":state.saved.has(id)?state.saved.delete(id):state.saved.add(id);localStorage.setItem("blinkSaved",JSON.stringify([...state.saved]));render();toast("Saved locally.");break;case"follow":state.following.has(p.person.name)?state.following.delete(p.person.name):state.following.add(p.person.name);localStorage.setItem("blinkFollowing",JSON.stringify([...state.following]));render();break;case"comment":state.openComments.has(id)?state.openComments.delete(id):state.openComments.add(id);render();break;case"reply":{const input=card.querySelector(".comment-box input");if(input.value.trim()){p.replies.push({person:{name:"You (Observer)",emoji:"👁️",place:"Outside the simulation",color:"#777"},text:input.value.trim(),minutes:0});p.comments=p.replies.length;state.openComments.add(id);render();toast("Reply added locally.");}}}});
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