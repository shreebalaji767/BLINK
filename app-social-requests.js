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
  const rumorTemplates = [
    p => "HEARD AT "+p.place.toUpperCase()+": apparently "+pick(["the night shift has a second key nobody has logged","someone has been quietly replacing the town notices with older versions","the new caretaker is related to a very inconvenient person","the supply room is being used for meetings after closing","a regular customer knows the exact time the lights go out","the official map leaves out one door on purpose","the same anonymous person keeps paying other people's overdue fees","the manager has been seen practising an apology in an empty corridor"])+". Source: "+pick(["a cousin who works two floors up","someone who heard it from the delivery driver","a note left under the tea tin","a person who insists they are not involved"])+". "+pick(["Could be nonsense. It has been repeated four times already.","Nobody can confirm it, but the spare keys have gone missing.","Please do not confront anyone. Especially not the pigeon.","The story changes slightly every time it reaches the front desk."]),
    p => "UNCONFIRMED — "+p.name+" says people at "+p.place+" are whispering that "+pick(["the next inspection is actually a surprise party for the building","two departments have been swapping shifts without telling the rota clerk","the missing parcel was delivered, just to the wrong version of the address","someone is keeping a private list of who takes the good biscuits","the old noticeboard has been receiving anonymous compliments","a senior official has been using a fake name to join the queue"])+". "+pick(["No evidence yet, only three identical stories and one very nervous witness.","The person named in the rumour has declined to comment and asked for a pen.","It might be true. The details are suspiciously specific."]),
    p => "A whisper going around "+p.place+": "+pick(["the landlord is planning to rename the building after a minor inconvenience","the staff meeting was moved because the meeting room is allegedly haunted by a former treasurer","someone has been leaving apology gifts before complaints are even filed","the new rule was introduced after one very specific incident involving soup","a familiar face has been visiting after hours with a suspiciously official clipboard"])+". "+p.name+" heard it from "+pick(["the person who waters the plants","a courier who refuses to give their name","the queue at the tea counter","someone's aunt's neighbour"])+". Take it with a grain of salt."
  ];
  const gossipTemplates = [
    p => { const others=people.filter(x=>x.world===p.world&&x.name!==p.name); const a=pick(others),b=pick(others.filter(x=>x.name!==a.name)); return "OVERHEARD AT "+p.place+": "+a.name+" apparently told "+b.name+" that "+pick(["they are only covering the shift until the paperwork catches up","the new uniform makes everyone look like a substitute teacher","they know who keeps taking lunch from the shared fridge","the manager's 'quick chat' lasted longer than the actual workday","they are thinking of transferring, but only if the rumour is true","the mysterious late delivery is definitely not their responsibility"])+". "+p.name+" says the conversation got quiet when the kettle clicked off."; },
    p => { const others=people.filter(x=>x.world===p.world&&x.name!==p.name); const a=pick(others); return "LOCAL GOSSIP (UNVERIFIED): "+a.name+" was seen leaving "+p.place+" with "+pick(["two takeaway bags and no explanation","the spare key ring","a stack of forms marked CONFIDENTIAL","the office plant that everyone thought was dead","someone else's umbrella and a very rehearsed smile"])+". "+p.name+" says it is probably innocent. Nobody believes that is the whole story."; },
    p => { const others=people.filter(x=>x.world===p.world&&x.name!==p.name); const a=pick(others); return "Apparently "+a.name+" has been "+pick(["bringing their own mug to meetings so nobody can read the slogan","taking the long route to avoid one particular corridor","asking unusually detailed questions about the staff rota","calling the new supervisor by a nickname nobody else knows","claiming not to like gossip while knowing everyone's business"])+". "+p.name+" would like it noted that this is an observation, not gossip. It is absolutely gossip."; }
  ];
  const generatePostText = person => {
    const roll=Math.random();
    if(roll<0.23)return pick(rumorTemplates)(person);
    if(roll<0.46)return pick(gossipTemplates)(person);
    return pick(templates)(person)+(Math.random()>.45?" "+pick(endings):"");
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
  const replyStyles = [
    (c,a,x) => pick(["Wait, where was this? I passed through "+a.place+" earlier and it looked normal.","I work nearby. This is the first I'm hearing of it, which is somehow worse.","Was this before or after the notice went up? Nobody in our shift can agree.","I saw the aftermath, not the actual thing. The cleanup crew looked exhausted."]),
    (c,a,x) => pick(["That explains the "+x+". I thought I was the only one who noticed.","The "+x+" part is getting left out whenever people retell this.","My colleague told me a completely different version of the "+x+".","Can we get one clear timeline for the "+x+" situation?"]),
    (c,a,x) => pick(["I am begging people to stop making this a normal Tuesday.","Not saying I told you so, but I did ask about this last week.","This is why we have a sign. This is also why nobody reads the sign.","I leave for ONE shift and apparently the whole place develops lore."]),
    (c,a,x) => pick(["Genuine question: who is actually responsible for sorting this out?","Did anyone file a report, or is the group chat the official record now?","Is the service back to normal or should we avoid that entrance?","Please tell me somebody took a photo before it was moved."]),
    (c,a,x) => pick(["I was there. The post is mostly accurate, but the timing is off by about ten minutes.","Small correction: it happened near "+a.place+", not inside the building.","I heard the same thing from the other shift. Their version has an additional witness.","Can confirm the first half. I left before it became everybody's problem."]),
    (c,a,x) => pick(["My only contribution is that the queue was already like this when I arrived.","I have no useful information, just the receipt that proves I was unfortunately present.","I was trying to eat lunch when this came up. Lunch is now cold.","The person who knows the answer is reading this and pretending not to."]),
    (c,a,x) => pick(["This is going to be in the handover notes for the next six months.","Please keep updates in this thread. The rumours in the corridor are getting creative.","I have forwarded this to the relevant desk. They asked me not to forward it again.","Someone is going to have to explain this at the morning briefing."]),
    (c,a,x) => pick(["Not to defend anyone, but there is definitely a missing part of this story.","I heard an apology was issued. Was it the real apology or the laminated one?","The official explanation leaves out the bit everybody is asking about.","I would wait for confirmation before blaming the night shift. Again."]),
    (c,a,x) => pick(["I know this is serious, but the mental image is taking me out.","Why did I read this while drinking tea. I nearly inhaled the cup.","I laughed and then remembered I have to go there tomorrow.","This is objectively a mess. Unfortunately it is also the funniest thing I've read today."]),
    (c,a,x) => pick(["Respectfully, whoever handled that has excellent commitment to the bit.","I support the situation's right to be strange, from a safe distance.","I need the confidence of whoever thought that was going to work.","The audacity is impressive. The planning, less so."]),
    (c,a,x) => pick(["Okay but who is the person in the background of this entire story? Asking for no particular reason.","I came for the update and stayed because the person involved sounds unfairly charming.","This is not the time to flirt with the person responsible. I am choosing growth.","I would volunteer to help, but I suspect I would make the situation worse."]),
    (c,a,x) => pick(["Have you tried "+pick(["writing it on a form","asking the supervisor","turning it off and on again","putting a little fence around it"] )+"? This advice is free and worth exactly that.","Tired of "+x+"? Try our new premium service: one clipboard and a legally distinct shrug.","Sponsored by "+pick(["Definitely Not The Management","Three Goblins In A Coat","The Department Of Unasked Questions"])+": we cannot fix this, but we can sell you a commemorative mug."]),
    (c,a,x) => pick(["I was told not to comment on this. Anyway, "+x+" is still happening.","Deleting my earlier message because apparently this has become evidence.","The group chat has been locked. The family group chat has not.","I have muted this thread and yet somehow I am still here."])
  ];
  const extractReplyAnchor = postText => {
    const clean = String(postText || "this situation").replace(/\\s+/g," ").trim();
    const quoted = clean.match(/[“"]([^”"]{4,70})[”"]/);
    if (quoted) return quoted[1].trim();
    const chunks = clean.split(/[.!?;]+/).map(s=>s.trim()).filter(s=>s.length>12);
    const useful = chunks.find(s=>! /^(HEARD AT|UNCONFIRMED|LOCAL GOSSIP|OVERHEARD AT|BREAKING|SHIFT REPORT|PUBLIC NOTICE|CUSTOMER SERVICE LOG)/i.test(s));
    const anchor = (useful || chunks[0] || clean).replace(/^(apparently|someone says|the rumour is|a whisper going around)\\s+/i,"");
    return anchor.slice(0,72).replace(/[,:—-]+$/,"").trim() || "this situation";
  };
  const makeReplies = (person, postText) => {
    const locals = people.filter(p => p.world === person.world && p.name !== person.name);
    const pool = (locals.length ? locals : people).slice().sort(() => Math.random() - 0.5);
    const count = 3 + Math.floor(Math.random() * 10);
    const anchor = extractReplyAnchor(postText);
    const shortAnchor = anchor.length > 58 ? anchor.slice(0,55).trimEnd()+"…" : anchor;
    const usedStyles = replyStyles.slice().sort(() => Math.random() - 0.5);
    const replies = [];
    for (let i=0; i<Math.min(count,pool.length); i++) {
      const commenter = pool[i];
      const style = usedStyles[i % usedStyles.length];
      let reply = style(commenter,person,shortAnchor);
      if (i===0 && Math.random()<0.45) reply = pick(["Hold on, ","Wait, ","Sorry, ","No because "])+reply;
      if (i>0 && Math.random()<0.24) reply = pick(["Replying to the above: ","Adding to this: ","Also, "])+reply;
      replies.push({person:commenter,text:reply,minutes:Math.floor(Math.random()*180)});
    }
    // Occasional clearly unserious thirst/ad parody, not a mandatory feature of every thread.
    if (replies.length>4 && Math.random()<0.22) {
      const insertAt = 1+Math.floor(Math.random()*(replies.length-1));
      const commenter = pool[Math.min(pool.length-1,replies.length)];
      replies.splice(insertAt,0,{person:commenter,text:pick([
        "Respectfully, I am trying to follow the incident report but the person telling it has main-character cheekbones. Focus is difficult.",
        "Is there a sign-up sheet for helping with this or am I just here because the witness is pretty?",
        "ADVERTISEMENT: Are you also emotionally unprepared for "+shortAnchor+"? Buy our emergency snack box. No refunds, no questions."
      ]),minutes:Math.floor(Math.random()*180)});
    }
    return replies;
  };
  const reactionOptions = [{emoji:"👍",name:"Like"},{emoji:"❤️",name:"Love"},{emoji:"😂",name:"Funny"},{emoji:"😮",name:"Wow"},{emoji:"😢",name:"Sad"},{emoji:"😡",name:"Angry"},{emoji:"🤯",name:"Mind blown"}];
  // Shape each post's reaction mix around what was said and who is saying it.
  const buildReactionCounts = (person, postText) => {
    const text = (String(postText || "") + " " + [person.name,person.place,person.world].join(" ")).toLowerCase();
    const signals = [
      ["😂",/absurd|ridiculous|goose|duck|pigeon|kettle|chair|hat|biscuits|spoon|misunderstand|nobody|not again|complaint|wrong form|spreadsheet|committee|unofficial|lonely|briskly|funny|joke|embarrass|awkward|chaos|rumou?r|gossip|drama/g],
      ["❤️",/help|thank|kind|care|friend|together|saved|rescue|gift|home|family|love|proud|apolog|support|welcome|reunion|sweet|beautiful|hope/g],
      ["😢",/lost|missing|injur|hurt|death|dead|goodbye|farewell|lonely|sorry|regret|cry|grief|broken|evict|fired|failed|disaster|tragedy|abandon|ruin|sick/g],
      ["😡",/banned|stolen|cheat|fraud|scam|unfair|angry|threat|blame|accus|illegal|corrupt|tax|fine|invoice|rule|policy|refus|complaint|demand|sabotage|betray/g],
      ["😮",/breaking|secret|suddenly|unexpected|revealed|found|disappear|appeared|mystery|witness|evidence|portal|strange|unexplained|allegedly|apparently|actually|never|first time|emergency/g],
      ["🤯",/magic|spell|prophecy|dragon|demon|alien|multiverse|time.?loop|dimension|quantum|impossible|timeline|immortal|cursed|enchant|reincarn|reality|system|glitch|ancient|cosmic|universe/g]
    ];
    const weights = Object.fromEntries(reactionOptions.map(r=>[r.emoji,1]));
    signals.forEach(([emoji,re])=>{const matches=text.match(re);if(matches)weights[emoji]+=Math.min(matches.length,5)*1.35;});
    if(/cook|baker|food|noodle|stew|tea|café|cafe|pastry|seller|vendor/.test(text))weights["❤️"]+=1.1;
    if(/guard|inspector|clerk|official|supervisor|manager|security|administrator|tax collector/.test(text))weights["😡"]+=0.8;
    if(/wizard|mage|cultivat|sorcer|demon|dragon|alien|android|robot|cosmic|time.?loop/.test(text))weights["🤯"]+=1.3;
    if(/stablehand|caretaker|cleaner|assistant|trainee|intern|apprentice|courier|worker/.test(text))weights["👍"]+=0.8;
    const peak=Math.max(...Object.values(weights));
    return Object.fromEntries(reactionOptions.map(r=>{
      const relative=weights[r.emoji]/peak;
      const count=Math.round((2+Math.random()*13)*relative + Math.random()*4);
      return [r.emoji,count];
    }));
  };
  // Only real NPC directory entries may exist in friend/request lists. Clean stale or corrupted local data on load.
  const validSocialNames=new Set(people.map(p=>p.name));
  const readLocalArray=key=>{try{const raw=localStorage.getItem(key);const value=raw?JSON.parse(raw):[];return Array.isArray(value)?value:[];}catch(error){console.warn("BLINK could not read local data:",key,error);return [];}};
  const writeLocalArray=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(error){console.warn("BLINK could not save local data:",key,error);return false;}};
  const loadSocialSet=key=>new Set(readLocalArray(key).filter(name=>typeof name==="string"&&validSocialNames.has(name)));
  const readLocalValue=key=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}catch(error){console.warn("BLINK could not read local data:",key,error);return null;}};
  const writeLocalValue=(key,value)=>{try{const serialized=JSON.stringify(value);localStorage.setItem(key,serialized);if(localStorage.getItem(key)!==serialized)throw new Error("Local storage read-back verification failed");return true;}catch(error){console.warn("BLINK could not save local data:",key,error);return false;}};
  const readDurableValue=(key,valid)=>{const primary=readLocalValue(key);if(valid(primary))return primary;const backup=readLocalValue(key+"Backup");if(valid(backup)){console.warn("BLINK restored "+key+" from its local backup.");return backup;}return null;};
  const writeDurableValue=(key,value)=>{const backupOk=writeLocalValue(key+"Backup",value);const primaryOk=writeLocalValue(key,value);if(!primaryOk&&!backupOk)toast("Browser storage could not save this change. Check site storage permissions or available space.");return primaryOk||backupOk;};
  const savedRelationships=readLocalValue("blinkRelationships");
  const state = {posts:[],view:"feed",profile:null,world:"All",sort:"latest",visible:14,following:new Set(readLocalArray("blinkFollowing").filter(name=>typeof name==="string")),saved:new Set(readLocalArray("blinkSaved").filter(name=>typeof name==="string")),liked:new Set(),reactions:{},generated:0,openComments:new Set(),seenNPCs:new Set(readLocalArray("blinkSeenNPCs").filter(name=>typeof name==="string")),postSignatures:new Set(readLocalArray("blinkPostSignatures").filter(value=>typeof value==="string")),relationships:savedRelationships&&typeof savedRelationships==="object"&&!Array.isArray(savedRelationships)?savedRelationships:{},worldNews:[]};
  const FEED_STORAGE_KEY="blinkFeedV2";
  const FEED_STORAGE_LIMIT=180;
  const POST_SIGNATURE_LIMIT=500;
  const postFingerprint=value=>String(value||"").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().slice(0,500);
  function saveFeed(){
    const posts=state.posts.slice(0,FEED_STORAGE_LIMIT).map(post=>({id:post.id,person:post.person.name,text:post.text,minutes:post.minutes,likes:post.likes,reactions:post.reactions||{},comments:post.comments,origin:post.origin,context:post.context||null,replies:(post.replies||[]).slice(0,16).map(reply=>({person:reply.person.name,text:reply.text,minutes:reply.minutes||0}))}));
    const signatures=[...state.postSignatures].slice(-POST_SIGNATURE_LIMIT);
    writeLocalArray("blinkPostSignatures",signatures);
    const snapshot={version:1,generated:state.generated,posts,liked:[...state.liked],reactions:state.reactions,signatures,relationships:state.relationships,savedAt:Date.now()};
    writeDurableValue(FEED_STORAGE_KEY,snapshot);
    writeLocalValue("blinkRelationships",state.relationships);
  }
  const ago = n => n<1?"just now":n+"m ago";
  function uniquePostText(person,candidate){
    let text=String(candidate||generatePostText(person));
    let fingerprint=postFingerprint(text);
    if(fingerprint&&state.postSignatures.has(fingerprint)){
      for(let attempt=0;attempt<12;attempt++){
        const alternate=generatePostText(person),alternateFingerprint=postFingerprint(alternate);
        if(alternateFingerprint&&!state.postSignatures.has(alternateFingerprint)){text=alternate;fingerprint=alternateFingerprint;break;}
      }
      if(fingerprint&&state.postSignatures.has(fingerprint)){
        const sequence=state.postSignatures.size+1;
        text=person.name+" — "+pick(openers)+" "+pick(endings)+" (follow-up note "+sequence+")";
        fingerprint=postFingerprint(text);
      }
    }
    if(fingerprint){state.postSignatures.add(fingerprint);if(state.postSignatures.size>POST_SIGNATURE_LIMIT)state.postSignatures=new Set([...state.postSignatures].slice(-POST_SIGNATURE_LIMIT));}
    return text;
  }
  const makePost = (person, customText, context=null) => {
    const text=uniquePostText(person,customText||generatePostText(person));
    const replies=makeReplies(person,text);
    const reactions=buildReactionCounts(person,text);
    return {id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),person,text,minutes:Math.floor(Math.random()*180),likes:Math.floor(Math.random()*4200),reactions,replies,comments:replies.length,context,origin:pick(["💬 group chat","📎 local noticeboard","🧾 eyewitness account","📡 direct transmission","🗂️ meeting minutes","🛸 public broadcast","🤫 overheard conversation","🕵️ unverified rumour"])};
  };
  // NPC names are the stable identity across reloads. World/place can change
  // when directory data is expanded, so they must not be part of the history key.
  const npcKey=p=>p.name;
  // Migrate both legacy name-only entries and the previous world|place|name format.
  function migrateSeenNPCHistory(){
    const saved=readLocalArray("blinkSeenNPCs").filter(value=>typeof value==="string");
    const migrated=new Set();
    for(const value of saved){
      const person=people.find(candidate=>candidate.name===value||value.endsWith("|"+candidate.name));
      if(person)migrated.add(person.name);
    }
    state.seenNPCs=migrated;
    writeLocalArray("blinkSeenNPCs",[...migrated]);
  }
  migrateSeenNPCHistory();
  function saveSeenNPCs(){writeLocalArray("blinkSeenNPCs",[...state.seenNPCs]);}
  function unseenNPCs(){return people.filter(p=>!state.seenNPCs.has(npcKey(p)));}
  function chooseUnseenNPC(){let pool=unseenNPCs();if(!pool.length){state.seenNPCs.clear();saveSeenNPCs();pool=[...people];toast("You've met the whole current roster. Starting a fresh cycle.");}const person=pick(pool);state.seenNPCs.add(npcKey(person));saveSeenNPCs();return person;}
  function seed(){const pool=unseenNPCs().sort(()=>Math.random()-.5);const batch=pool.slice(0,34);batch.forEach((p,i)=>{state.seenNPCs.add(npcKey(p));const previous=state.posts.length&&Math.random()<.22?pick(state.posts.filter(x=>x.person.name!==p.name)):null;const connected=previous?buildConnectedUpdate(p,previous):null;const post=makePost(p,connected?.text||(Math.random()<.24?pick(openers)+" "+pick(endings):null),connected?.context||null);post.minutes=i*3+Math.floor(Math.random()*3);state.posts.push(post);});saveSeenNPCs();}
  function generate(){
    const p=chooseUnseenNPC();
    const candidates=state.posts.filter(post=>post.person.name!==p.name&&(post.person.world===p.world||post.person.place===p.place||state.relationships[relationshipKey(p.name,post.person.name)])).slice(0,24);
    const previous=candidates.length&&Math.random()<.68?pick(candidates):null;
    const connected=previous?buildConnectedUpdate(p,previous):null;
    const text=connected?.text||(Math.random()<.58?pick(templates)(p)+" "+pick(endings):pick(openers)+" "+pick(endings));
    state.posts.unshift(makePost(p,text,connected?.context||null));state.generated++;
    saveFeed();
    render();
    toast(p.name+" has entered the chat.");
  }
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  const observer={name:"You (Observer)",emoji:"👁️",place:"Outside the simulation",world:"Observer",color:"#5c9b91",kind:"The person watching the multiverse."};
  const personByName=name=>people.find(p=>p.name===name)||null;
  function restoreFeed(){
    const saved=readDurableValue(FEED_STORAGE_KEY,value=>Boolean(value&&value.version===1&&Array.isArray(value.posts)));
    if(!saved||saved.version!==1||!Array.isArray(saved.posts))return false;
    if(saved.relationships&&typeof saved.relationships==="object"&&!Array.isArray(saved.relationships)){state.relationships=saved.relationships;writeLocalValue("blinkRelationships",state.relationships);}
    const observerPerson={name:"You (Observer)",emoji:"👁️",place:"Outside the simulation",world:"Observer",color:"#5c9b91",kind:"The person watching the multiverse."};
    const resolvePerson=name=>name===observerPerson.name?observerPerson:personByName(name);
    const restored=saved.posts.slice(0,FEED_STORAGE_LIMIT).map(post=>{
      if(!post||typeof post.id!=="string"||typeof post.text!=="string")return null;
      const person=resolvePerson(post.person);if(!person)return null;
      const replies=(Array.isArray(post.replies)?post.replies:[]).slice(0,16).filter(reply=>reply&&typeof reply.text==="string").map(reply=>({person:resolvePerson(reply.person)||observerPerson,text:reply.text,minutes:Number.isFinite(reply.minutes)?reply.minutes:0}));
      return {id:post.id,person,text:post.text,minutes:Number.isFinite(post.minutes)?post.minutes:0,likes:Number.isFinite(post.likes)?post.likes:0,reactions:post.reactions&&typeof post.reactions==="object"?post.reactions:{},comments:replies.length,replies,context:post.context&&typeof post.context==="object"?post.context:null,origin:typeof post.origin==="string"?post.origin:"💬 local broadcast"};
    }).filter(Boolean);
    if(!restored.length)return false;
    state.posts=restored;state.generated=Number.isFinite(saved.generated)?saved.generated:0;
    (Array.isArray(saved.signatures)?saved.signatures:[]).filter(value=>typeof value==="string").slice(-POST_SIGNATURE_LIMIT).forEach(value=>state.postSignatures.add(value));
    restored.forEach(post=>state.postSignatures.add(postFingerprint(post.text)));
    state.postSignatures=new Set([...state.postSignatures].slice(-POST_SIGNATURE_LIMIT));
    state.liked=new Set(Array.isArray(saved.liked)?saved.liked.filter(id=>typeof id==="string"):[]);
    state.reactions=saved.reactions&&typeof saved.reactions==="object"?saved.reactions:{};
    return true;
  }
  const relationshipKey=(a,b)=>JSON.stringify([a,b].sort());
  function relationshipStatus(score){return score>=3?"ALLY":score<=-3?"RIVAL":"ACQUAINTANCE";}
  function recordRelationship(a,b,relation){
    const key=relationshipKey(a,b),entry=state.relationships[key]||{people:[a,b].sort(),score:0,interactions:0,lastRelation:""};
    const change=relation==="disputing"?-2:relation==="backing up"?2:1;
    entry.score=Math.max(-12,Math.min(12,entry.score+change));entry.interactions++;entry.lastRelation=relation;state.relationships[key]=entry;
    return relationshipStatus(entry.score);
  }
  const NEWS_STORAGE_KEY="blinkWorldNewsV1";
  const newsBriefs=[
    {category:"CROSS-WORLD INCIDENT",headline:"A portal queue has appeared in a place with no portals",summary:"Residents in three unrelated settings report the same queue ticket number. Nobody agrees who opened the counter."},
    {category:"PUBLIC SAFETY",headline:"Mysterious fog delays every scheduled villain monologue",summary:"The fog appears only when someone says “you haven't seen the last of me”. Local authorities advise against dramatic speeches outdoors."},
    {category:"CULTURE",headline:"A background extra has accidentally become the official witness",summary:"A routine continuity complaint has turned into a multiverse-wide testimony thread. The original incident remains unclear."},
    {category:"ECONOMY",headline:"Interdimensional currency exchange briefly accepts soup",summary:"Several markets posted conflicting rates before the kiosk returned to accepting coins, tokens and one suspicious coupon."},
    {category:"INVESTIGATION",headline:"Three unrelated noticeboards display the same handwritten warning",summary:"The message has been photographed in different worlds. Investigators are checking whether the handwriting belongs to a very bored clerk."},
    {category:"TRANSPORT",headline:"Commuters report a train that stops at deleted locations",summary:"Passengers say the conductor insists every stop is on the timetable. Transit offices deny owning the timetable."}
  ];
  const newsStages=[
    {status:"UNCONFIRMED",label:"Unconfirmed report",text:"More residents are comparing timestamps. No authority has accepted responsibility."},
    {status:"INVESTIGATING",label:"Investigation opened",text:"Local witnesses have been contacted and the first contradictory accounts are being reviewed."},
    {status:"CONFIRMED",label:"Incident confirmed",text:"Independent reports now match on the central detail, although the explanation remains disputed."},
    {status:"AFTERMATH",label:"Aftermath",text:"The immediate disruption has eased. Residents are still arguing about who should file the paperwork."}
  ];
  function saveWorldNews(){writeDurableValue(NEWS_STORAGE_KEY,state.worldNews.slice(0,30));}
  function publishNewsPost(event,sourceName,text,status){
    const person=personByName(sourceName);if(!person)return null;
    const post=makePost(person,text,{relation:"reporting on",person:"World News Desk",relationship:"NEWS · "+status,newsEventId:event.id});
    post.minutes=0;state.posts.unshift(post);state.posts=state.posts.slice(0,FEED_STORAGE_LIMIT);
    state.generated++;event.postIds=Array.isArray(event.postIds)?event.postIds:[];
    event.postIds.unshift(post.id);event.postIds=event.postIds.slice(0,20);
    saveFeed();return post;
  }
  function publishNewsDiscussion(event,person,status){
    if(!person)return null;
    const angles=[
      "I have questions about the official explanation, especially the part nobody has explained.",
      "People in my district are already sharing three versions of this story. Only one includes a timestamp.",
      "I am not an expert, but I did attend the meeting where the warning sign was spelled incorrectly.",
      "Can confirm the disruption reached our world. The local committee has responded by forming another committee.",
      "This sounds familiar. We had a nearly identical incident, except ours involved a very upset delivery pigeon.",
      "Please remember the residents doing the actual cleanup while everyone else argues over the headline."
    ];
    const post=makePost(person,person.name+" weighs in on “"+event.headline+"”: "+pick(angles),{relation:"reacting to",person:"World News Desk",relationship:"NEWS · DISCUSSION",newsEventId:event.id});
    post.minutes=0;state.posts.unshift(post);state.posts=state.posts.slice(0,FEED_STORAGE_LIMIT);
    state.generated++;event.postIds=Array.isArray(event.postIds)?event.postIds:[];
    event.postIds.unshift(post.id);event.postIds=event.postIds.slice(0,20);
    event.discussants=Array.isArray(event.discussants)?event.discussants:[];
    if(!event.discussants.includes(person.name))event.discussants.push(person.name);
    saveFeed();return post;
  }
  function createWorldNews(){
    const brief=pick(newsBriefs),pool=[...people].sort(()=>Math.random()-.5),sources=[];
    for(const person of pool){if(!sources.some(source=>source.world===person.world))sources.push(person);if(sources.length===3)break;}
    const event={id:"news-"+Date.now().toString(36)+Math.random().toString(36).slice(2,7),category:brief.category,headline:brief.headline,summary:brief.summary,worlds:sources.map(person=>person.world),sources:sources.map(person=>person.name),stage:0,updates:[{source:sources[0].name,text:"Initial report filed from "+sources[0].place+". "+brief.summary,minutes:0}],postIds:[],discussants:[]};
    state.worldNews.unshift(event);state.worldNews=state.worldNews.slice(0,30);
    sources.slice(0,2).forEach((person,index)=>publishNewsPost(event,person.name,index===0?"First report: "+event.headline+". "+event.summary:"A second witness in "+person.place+" has independently posted about "+event.headline.toLowerCase()+". The details are not lining up neatly.",newsStages[0].status));
    publishNewsDiscussion(event,sources[2],newsStages[0].status);
    saveWorldNews();return event;
  }
  function advanceWorldNews(id){
    const event=state.worldNews.find(item=>item.id===id);if(!event)return;
    if(event.stage>=newsStages.length-1){toast("This story has reached its aftermath.");return;}
    event.stage++;
    const sourceName=event.sources[event.stage%event.sources.length],stage=newsStages[event.stage];
    const variations=["Witnesses have supplied a second account, but it conflicts with the first report.","A cross-world review has found matching details in an entirely different setting.","Residents are now demanding a public explanation and a properly labelled form."];
    const updateText=stage.text+" "+pick(variations);
    event.updates.unshift({source:sourceName,text:updateText,minutes:0});
    publishNewsPost(event,sourceName,stage.label+": "+event.headline+". "+updateText,stage.status);
    const discussionPool=people.filter(person=>!event.sources.includes(person.name)&&!event.discussants.includes(person.name));
    const outsideWorld=discussionPool.filter(person=>!event.worlds.includes(person.world));
    publishNewsDiscussion(event,pick(outsideWorld.length?outsideWorld:discussionPool),stage.status);
    saveWorldNews();render();toast("Story updated: "+stage.label+". NPC reports and reactions reached the feed.");
  }
  function worldNewsMarkup(){
    const q=$("#searchInput").value.trim().toLowerCase();
    const items=state.worldNews.filter(item=>!q||(item.headline+" "+item.summary+" "+item.worlds.join(" ")+" "+item.sources.join(" ")+" "+(item.note||"")+" "+(newsStages[item.stage]?.status||"")).toLowerCase().includes(q));
    return '<section class="news-intro"><div><span class="eyebrow">MULTIVERSE DESK · LOCAL SIMULATION</span><h2>Stories crossing worlds</h2><p>Rumours, investigations and consequences evolve as NPCs file new reports. Bookmark important cases and keep private notes in this browser.</p></div><button class="generate-button" data-news-action="new">＋ Break a story</button></section>'+ (items.length?items.map(item=>{const stage=newsStages[item.stage]||newsStages[0];return '<article class="news-card" data-news-card="'+escapeHTML(item.id)+'"><div class="news-card-top"><span class="news-category">'+escapeHTML(item.category)+'</span><span class="news-status status-'+stage.status.toLowerCase()+'">'+stage.status+'</span></div><h2>'+escapeHTML(item.headline)+'</h2><p>'+escapeHTML(item.summary)+'</p><div class="news-worlds">'+item.worlds.map(world=>'<span>'+escapeHTML(world)+'</span>').join('')+'</div><div class="news-sources"><strong>REPORTING NPCs</strong>'+item.sources.map(name=>'<button data-social="profile" data-person="'+escapeHTML(name)+'">'+escapeHTML(name)+'</button>').join('')+'</div><div class="news-updates">'+item.updates.map(update=>'<div class="news-update"><b>'+escapeHTML(update.source)+'</b><span>'+escapeHTML(update.text)+'</span></div>').join('')+'</div><div class="news-card-foot"><span>'+stage.label+' · '+item.updates.length+' report'+(item.updates.length===1?'':'s')+'</span><div class="news-card-controls"><button class="social-button subtle" data-news-action="bookmark" data-news-id="'+escapeHTML(item.id)+'">'+(item.bookmarked?'★ Bookmarked':'☆ Bookmark dossier')+'</button><button class="social-button subtle" data-news-action="advance" data-news-id="'+escapeHTML(item.id)+'" '+(item.stage>=newsStages.length-1?'disabled':'')+'>'+(item.stage>=newsStages.length-1?'Story concluded':'Advance coverage →')+'</button></div></div><div class="news-notes"><label for="news-note-'+escapeHTML(item.id)+'">PRIVATE CASE NOTES</label><textarea id="news-note-'+escapeHTML(item.id)+'" maxlength="1200" rows="2" placeholder="Keep your own clues, theories or reminders…">'+escapeHTML(item.note||'')+'</textarea><button class="social-button subtle" data-news-action="note-save" data-news-id="'+escapeHTML(item.id)+'">Save note</button></div></article>';}).join(''):'<div class="empty">No matching reports. Clear search or break a new story.</div>');
  }
  function relationshipSummary(person){
    return Object.values(state.relationships).filter(entry=>Array.isArray(entry.people)&&entry.people.includes(person.name)).sort((a,b)=>b.interactions-a.interactions).slice(0,5).map(entry=>({name:entry.people.find(name=>name!==person.name),status:relationshipStatus(entry.score),interactions:entry.interactions}));
  }
  function buildConnectedUpdate(person,previous){
    const excerpt=previous.text.replace(/\s+/g," ").slice(0,104);
    const relation=pick(["backing up","disputing","adding context to","following up on","apologising for","asking about"]);
    const status=recordRelationship(person.name,previous.person.name,relation);
    const opener=relation==="disputing"?"I was there, and that is not quite how it happened.":relation==="apologising for"?"I owe everyone a clarification about this.":"I did not expect to be pulled into this, but here we are.";
    return {text:opener+" "+person.name+" is "+relation+" "+previous.person.name+"’s post: “"+excerpt+(previous.text.length>104?"…":"")+"” "+pick(["The missing detail is that nobody checked the second notice.","We have now had three separate meetings about the same five minutes.","Please stop forwarding the screenshot without the timestamp.","I am only adding this because the group chat has become a witness statement."]),context:{postId:previous.id,person:previous.person.name,relation,excerpt,relationship:status}};
  }
  function profileMarkup(person){
    const own=person.name===observer.name;
    if(!own){
      const existing=state.posts.filter(p=>p.person.name===person.name);
      const target=Math.random()<0.75?5+Math.floor(Math.random()*5):10+Math.floor(Math.random()*6);
      for(let i=existing.length;i<target;i++){
        const post=makePost(person,generatePostText(person));
        post.minutes=Math.floor(Math.random()*1440);
        state.posts.push(post);
      }
    }
    const posts=state.posts.filter(p=>p.person.name===person.name).sort(()=>Math.random()-.5);
    const relationships=relationshipSummary(person);
    saveFeed();
    return `<section class="profile-panel"><div class="profile-cover"></div><div class="profile-main"><div class="profile-avatar" style="background:${person.color}22">${person.emoji}</div><div class="profile-heading"><div><h2>${escapeHTML(person.name)}</h2><p>${escapeHTML(person.world)} · ${escapeHTML(person.place)}</p><small>${escapeHTML(person.kind||"A resident of the multiverse")}</small></div></div><div class="profile-stats"><span><b>${posts.length}</b> posts in this session</span><span><b>${relationships.length}</b> known connections</span></div>${relationships.length?`<div class="relationship-list"><strong>KNOWN CONNECTIONS</strong>${relationships.map(link=>`<span><b>${escapeHTML(link.status)}</b> · ${escapeHTML(link.name)} <small>${link.interactions} interactions</small></span>`).join("")}</div>`:""}</div></section><div class="profile-post-heading">POSTS BY ${own?"YOU":escapeHTML(person.name.toUpperCase())}</div>${posts.length?posts.map(p=>`<article class="post" data-id="${p.id}"><div class="post-top"><div class="avatar" style="background:${person.color}22">${person.emoji}</div><div class="post-identity"><button type="button" class="post-name profile-link" data-social="profile" data-person="${escapeHTML(person.name)}" aria-label="View ${escapeHTML(person.name)} profile">${escapeHTML(person.name)}</button><div class="post-meta">${escapeHTML(person.place)} · ${ago(p.minutes)}</div></div></div><p class="post-text">${escapeHTML(p.text)}</p>${p.context?`<div class="post-context">↳ ${escapeHTML(p.context.relation||"following up on")} <strong>${escapeHTML(p.context.person||"another resident")}</strong>’s earlier post${p.context.relationship?` · <b class="relationship-tag">${escapeHTML(p.context.relationship)}</b>`:""}</div>`:""}<div class="post-actions"><button class="action" data-action="comment">▢ View comments (${p.replies.length})</button><span class="post-origin">${p.origin}</span></div><div class="comments-panel ${state.openComments.has(p.id)?"open":""}"><div class="reply-list">${p.replies.map(r=>`<div class="reply-item"><div class="reply-avatar">${r.person.emoji}</div><div class="reply-content"><strong>${escapeHTML(r.person.name)}</strong><p>${escapeHTML(r.text)}</p></div></div>`).join("")}</div></div></article>`).join(""):'<div class="empty">No posts from this profile in the current session yet.</div>'}`;
  }
  function render(){const q=$("#searchInput").value.trim().toLowerCase();
    if(state.view==="news"){$("#feed").innerHTML=worldNewsMarkup();$("#loadMore").style.display="none";$("#feedTitle").textContent="World News";$("#feedSubtitle").textContent="A rolling cross-world news desk, powered by NPC reports.";$(" #postCount".trim()).textContent=state.worldNews.length.toLocaleString();$("#followingCount").textContent=state.following.size;return;}
    if(state.view==="profile"){let person=state.profile==="self"?observer:personByName(state.profile);if(!person){person=observer;state.profile="self";}$("#feed").innerHTML=profileMarkup(person);$("#loadMore").style.display="none";$("#feedTitle").textContent=person.name==="You (Observer)"?"My Profile":"NPC Profile";$("#feedSubtitle").textContent="Profile and posts from this corner of the multiverse.";$("#postCount").textContent=state.posts.length.toLocaleString();$("#followingCount").textContent=state.following.size;return;}
    if(state.view==="directory"){let directory=people.filter(p=>(state.world==="All"||p.world===state.world)&&(!q||(p.name+" "+p.world+" "+p.place+" "+(p.kind||"Named background NPC")).toLowerCase().includes(q)));const shownPeople=directory.slice(0,state.visible);$("#feed").innerHTML=shownPeople.length?shownPeople.map(p=>`<article class="npc-card"><div class="avatar" style="background:${p.color}22">${p.emoji}</div><div class="npc-card-main"><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.world)} · ${escapeHTML(p.place)}</small><span>${escapeHTML(p.kind||"Named background NPC")}</span></div><div class="npc-card-actions"><button class="social-button subtle" data-social="profile" data-person="${escapeHTML(p.name)}">View profile</button></div></article>`).join(""):'<div class="empty">No NPCs match this search. Try another name, setting or world.</div>';$("#loadMore").style.display=directory.length>state.visible?"block":"none";$("#postCount").textContent=state.posts.length.toLocaleString();$("#followingCount").textContent=state.following.size;$("#feedTitle").textContent="NPC Directory";$("#feedSubtitle").textContent=people.length.toLocaleString()+" background residents across "+worlds.length+" fiction categories. Search by name, role, world or location.";$("#trendingTopics").innerHTML=["#NPCShiftProblems","#BackgroundCharacterEnergy","#MultiversePaperwork","#SideQuestUnion","#PortalCommute"].map((t,i)=>`<div class="topic"><small>0${i+1} · DIRECTORY</small><strong>${t}</strong><span>Resident chatter</span></div>`).join("");$("#onlineList").innerHTML=people.slice(0,5).map(p=>`<div class="online-person"><div class="online-avatar" style="background:${p.color}22">${p.emoji}</div><div><strong>${escapeHTML(p.name)}</strong><small>${p.world} · ONLINE</small></div></div>`).join("");$("#chaosLevel").textContent=state.generated>20?"CRITICAL":state.generated>8?"ELEVATED":"UNSTABLE";return;}
    let list=[...state.posts];if(state.view==="following")list=list.filter(p=>state.following.has(p.person.name));if(state.view==="saved")list=list.filter(p=>state.saved.has(p.id));if(state.view==="trending")list.sort((a,b)=>b.likes-a.likes);if(state.world!=="All")list=list.filter(p=>p.person.world===state.world);if(q)list=list.filter(p=>(p.text+" "+p.person.name+" "+p.person.world+" "+p.person.place).toLowerCase().includes(q));if(state.sort==="oldest")list.reverse();const shown=list.slice(0,state.visible);
    $("#feed").innerHTML=shown.length?shown.map(p=>{const liked=state.liked.has(p.id),saved=state.saved.has(p.id);return `<article class="post" data-id="${p.id}"><div class="post-top"><div class="avatar" style="background:${p.person.color}22">${p.person.emoji}</div><div class="post-identity"><button type="button" class="post-name profile-link" data-social="profile" data-person="${escapeHTML(p.person.name)}" aria-label="View ${escapeHTML(p.person.name)} profile">${escapeHTML(p.person.name)} <span class="verified">✳</span></button><div class="post-meta">${escapeHTML(p.person.place)} · ${ago(p.minutes)}</div></div><span class="world-tag">${escapeHTML(p.person.world)}</span></div><p class="post-text">${escapeHTML(p.text)}</p>${p.context?`<div class="post-context">↳ ${escapeHTML(p.context.relation||"following up on")} <strong>${escapeHTML(p.context.person||"another resident")}</strong>’s earlier post${p.context.relationship?` · <b class="relationship-tag">${escapeHTML(p.context.relationship)}</b>`:""}</div>`:""}<div class="post-actions"><button class="action ${liked?"liked":""}" data-action="like">♥ ${(p.likes+(liked?1:0)).toLocaleString()}</button><button class="action" data-action="comment">▢ View comments (${p.replies.length})</button><button class="action ${saved?"saved":""}" data-action="save">${saved?"▣ Saved":"▱ Save"}</button><button class="action" data-action="follow">${state.following.has(p.person.name)?"Following":"＋ Follow"}</button><span class="post-origin">${p.origin}</span></div><div class="reaction-bar" aria-label="Post reactions">${reactionOptions.map(r=>{const selected=state.reactions[p.id]===r.emoji;return `<button class="reaction-button ${selected?"selected":""}" data-action="react" data-reaction="${r.emoji}" aria-label="${r.name}" title="${r.name}">${r.emoji}<span>${((p.reactions&&p.reactions[r.emoji])||0)+(selected?1:0)}</span></button>`}).join("")}</div><div class="comments-panel ${state.openComments.has(p.id)?"open":""}"><div class="reply-list">${p.replies.map(r=>`<div class="reply-item"><div class="reply-avatar" style="background:${r.person.color}22">${r.person.emoji}</div><div class="reply-content"><strong>${escapeHTML(r.person.name)}</strong><small>${escapeHTML(r.person.place)} · ${ago(r.minutes)}</small><p>${escapeHTML(r.text)}</p></div></div>`).join("")}</div><div class="comment-box"><input maxlength="180" placeholder="Add a reply to this fictional disaster…"><button data-action="reply">Reply</button></div></div></article>`}).join(""):'<div class="empty">Nothing in this corner of the multiverse yet.<br>Generate some chaos or change your filters.</div>';
    $("#postCount").textContent=state.posts.length.toLocaleString();$("#followingCount").textContent=state.following.size;$("#loadMore").style.display=list.length>state.visible?"block":"none";$("#feedTitle").textContent=state.world!=="All"?state.world:({feed:"For You",following:"Following",trending:"Trending",saved:"Saved posts",directory:"NPC Directory"}[state.view]||"For You");$("#feedSubtitle").textContent=state.view==="trending"?"The loudest nonsense across known realities.":state.view==="saved"?"Your carefully curated collection of fictional chaos.":"Unfiltered thoughts from across fictional reality.";
    $("#trendingTopics").innerHTML=["#ProphecyProblems","#VillainUnion","#DungeonRent","#MultiverseHR","#GooseIncident"].map((t,i)=>`<div class="topic" data-topic="${t.slice(1)}"><small>0${i+1} · MULTIVERSE</small><strong>${t}</strong><span>${(Math.floor(Math.random()*90)+12).toLocaleString()}k posts</span></div>`).join("");
    $("#onlineList").innerHTML=people.slice(0,5).map(p=>`<div class="online-person"><div class="online-avatar" style="background:${p.color}22">${p.emoji}</div><div><strong>${p.name}</strong><small>${p.world} · ONLINE</small></div></div>`).join("");
    $("#chaosLevel").textContent=state.generated>20?"CRITICAL":state.generated>8?"ELEVATED":"UNSTABLE";
  }
  let toastTimer;function toast(s){const t=$("#toast");t.textContent=s;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2100)}
  // One document-level delegate keeps social actions working after every feed re-render.
  // Capture phase ensures social buttons work even if another handler stops bubbling.
  document.addEventListener("click",e=>{
    // Resolve the actionable element from the complete click path. This also
    // handles taps on nested spans/icons and browsers that report a text node.
    const path=typeof e.composedPath==="function"?e.composedPath():[];
    const target=e.target?.nodeType===1?e.target:e.target?.parentElement;
    // Prefer the clicked element's ancestor chain for mouse, touch and nested text targets.
    const social=target?.closest?.("[data-social]")||path.find(node=>node?.nodeType===1&&node.matches?.("[data-social]"));
    if(social){
      e.preventDefault();
      e.stopPropagation();
      const rawName=social.dataset?.person||social.getAttribute?.("data-person");
      const action=social.dataset?.social||social.getAttribute?.("data-social");
      if(action==="profile"&&rawName){
        const normalizeNPCName=value=>String(value??"").normalize("NFKC").trim().replace(/\\s+/g," ").toLocaleLowerCase();
        const person=personByName(rawName)||people.find(candidate=>normalizeNPCName(candidate.name)===normalizeNPCName(rawName));
        if(person){state.profile=person.name;state.view="profile";state.world="All";render();}
      }
      return;
    }
    if(!target)return;
    const newsAction=target.closest("[data-news-action]");
    if(newsAction){const action=newsAction.dataset.newsAction,id=newsAction.dataset.newsId,event=state.worldNews.find(item=>item.id===id);if(action==="new"){createWorldNews();render();toast("A new multiverse story has broken.");}else if(action==="advance")advanceWorldNews(id);else if(action==="bookmark"&&event){event.bookmarked=!event.bookmarked;saveWorldNews();render();toast(event.bookmarked?"Dossier bookmarked.":"Dossier bookmark removed.");}else if(action==="note-save"&&event){const field=$("#news-note-"+id);event.note=String(field?.value||"").slice(0,1200);saveWorldNews();render();toast("Private case note saved on this device.");}return;}
    const profile=target.closest("[data-open-profile]");
    if(profile){
      state.profile=profile.dataset.openProfile;state.view="profile";render();return;
    }
    const profileName=target.closest(".post-name");
    if(profileName&&profileName.closest(".post")){
      const card=profileName.closest(".post"),post=state.posts.find(x=>x.id===card.dataset.id);
      if(post){state.profile=post.person.name;state.view="profile";render();return;}
    }
    const b=target.closest("[data-action]");
    if(!b)return;
    const card=b.closest(".post"),id=card?.dataset.id,p=state.posts.find(x=>x.id===id);
    if(!p)return;
    switch(b.dataset.action){
      case"like":state.liked.has(id)?state.liked.delete(id):state.liked.add(id);saveFeed();render();break;
      case"react":{const emoji=b.dataset.reaction;if(state.reactions[id]===emoji)delete state.reactions[id];else state.reactions[id]=emoji;saveFeed();render();break;}
      case"save":state.saved.has(id)?state.saved.delete(id):state.saved.add(id);writeLocalArray("blinkSaved",[...state.saved]);render();toast("Saved locally.");break;
      case"follow":state.following.has(p.person.name)?state.following.delete(p.person.name):state.following.add(p.person.name);writeLocalArray("blinkFollowing",[...state.following]);render();break;
      case"comment":state.openComments.has(id)?state.openComments.delete(id):state.openComments.add(id);render();break;
      case"reply":{const input=card.querySelector(".comment-box input");if(input?.value.trim()){p.replies.push({person:{name:"You (Observer)",emoji:"👁️",place:"Outside the simulation",color:"#777"},text:input.value.trim(),minutes:0});p.comments=p.replies.length;state.openComments.add(id);saveFeed();render();toast("Reply added locally.");}}
    }
  },true);
  $("#worldFilters").innerHTML='<button class="world-filter active" data-world="All"><i class="world-dot" style="background:#999"></i>All worlds</button>'+worlds.map(w=>`<button class="world-filter" data-world="${w.name}"><i class="world-dot" style="background:${w.color}"></i>${w.name}</button>`).join("");
  $("#worldFilters").addEventListener("click",e=>{const b=e.target.closest("[data-world]");if(!b)return;state.world=b.dataset.world;document.querySelectorAll(".world-filter").forEach(x=>x.classList.toggle("active",x===b));state.visible=14;render()});
  document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>{state.view=b.dataset.view;if(state.view==="profile")state.profile="self";document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x===b));render()}));
  $("#generateBtn").addEventListener("click",generate);$("#shuffleBtn").addEventListener("click",()=>{state.posts.sort(()=>Math.random()-.5);state.sort="latest";render();toast("Timeline scrambled.")});
  $("#searchInput").addEventListener("input",()=>{state.visible=14;render()});$("#loadMore").addEventListener("click",()=>{state.visible+=12;render()});
  $("#sortBtn").addEventListener("click",()=>{state.sort=state.sort==="latest"?"oldest":"latest";$("#sortBtn").textContent=state.sort==="latest"?"Latest first ↓":"Oldest first ↑";render()});
  $("#postInput").addEventListener("input",e=>{$("#charCount").textContent=e.target.value.length+" / 280";$("#postBtn").disabled=!e.target.value.trim()});
  $("#postBtn").addEventListener("click",()=>{const text=$("#postInput").value.trim();if(!text)return;const person=observer;state.posts.unshift(makePost(person,text));state.generated++;saveFeed();$("#postInput").value="";$("#charCount").textContent="0 / 280";$("#postBtn").disabled=true;state.view="feed";state.profile=null;state.world="All";render();toast("Broadcast delivered to absolutely nobody.");});
  $("#trendingTopics").addEventListener("click",e=>{const t=e.target.closest("[data-topic]");if(t){$("#searchInput").value=t.dataset.topic.replace(/([A-Z])/g," $1");render()}});
  const storedNews=readDurableValue(NEWS_STORAGE_KEY,value=>Array.isArray(value));
  if(Array.isArray(storedNews)){state.worldNews=storedNews.filter(item=>item&&typeof item.id==="string"&&typeof item.headline==="string"&&Array.isArray(item.sources)&&Array.isArray(item.worlds)&&Array.isArray(item.updates)).slice(0,30);}
  if(!restoreFeed())seed();
  if(!state.worldNews.length){for(let i=0;i<4;i++)createWorldNews();}
  saveFeed();
  render();
  // Flush a verified snapshot when the page is backgrounded or closed.
  const flushLocalState=()=>{saveFeed();saveWorldNews();saveSeenNPCs();writeLocalArray("blinkFollowing",[...state.following]);writeLocalArray("blinkSaved",[...state.saved]);};
  if(typeof window!=="undefined")window.addEventListener("pagehide",flushLocalState);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flushLocalState();});
})();