"""Writes episodes/egypt/script.json (machine) and script.md (production script) from one source."""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
VOICES = {
  "NARRATOR":   {"voice": "am_michael", "speed": 1.08, "lang": "a", "desc": "Sarcastic, witty, conversational, slightly dramatic; telling a ridiculous true story to a friend"},
  "VIZIER":     {"voice": "am_eric",    "speed": 1.15, "lang": "a", "desc": "Royal Advisor: permanently stressed, fast, clipped, trying to keep the kingdom running"},
  "SOLDIER":    {"voice": "am_adam",    "speed": 1.05, "lang": "a", "desc": "Brave, loud, earnest and slightly clueless"},
  "WORKER":     {"voice": "bm_daniel",  "speed": 0.98, "lang": "b", "desc": "Exhausted, dry, sarcastic, unimpressed by royal decisions"},
  "NARMER":     {"voice": "bm_lewis",   "speed": 0.98, "lang": "b", "desc": "Pharaoh: booming, overconfident, a little ridiculous"},
  "KHUFU":      {"voice": "bm_george",  "speed": 0.96, "lang": "b", "desc": "Pharaoh: grand, pompous, thinks big about everything"},
  "HATSHEPSUT": {"voice": "bf_emma",    "speed": 1.0,  "lang": "b", "desc": "Cool, composed, quietly lethal confidence"},
  "AKHENATEN":  {"voice": "am_puck",    "speed": 1.05, "lang": "a", "desc": "Dreamy evangelist, excited about the sun to a worrying degree"},
  "TUT":        {"voice": "am_echo",    "speed": 1.12, "lang": "a", "desc": "Young, hopeful, slightly confused boy-king"},
  "RAMESSES":   {"voice": "am_onyx",    "speed": 0.95, "lang": "a", "desc": "Pharaoh: huge ego, deep, deadpan, never doubts himself"},
  "CLEOPATRA":  {"voice": "bf_isabella","speed": 1.02, "lang": "b", "desc": "Intelligent, confident, politically sharp, amused"},
  "CAESAR":     {"voice": "bm_fable",   "speed": 1.0,  "lang": "b", "desc": "Smooth, calculating Roman"},
  "ANTONY":     {"voice": "am_liam",    "speed": 1.06, "lang": "a", "desc": "Big, cheerful, reckless optimism"},
  "OCTAVIAN":   {"voice": "bm_lewis",   "speed": 0.92, "lang": "b", "desc": "Cold, quiet, final"},
}
# Each scene: id, title, set list (visual), voice direction, music, then lines.
# Line syntax: (speaker, text, opts) ; opts: gap (pause before, s), sfx [(word, name)], red/gold highlight words
S = []
def scene(sid, title, sets, direction, music): S.append({"id": sid, "title": title, "sets": sets, "direction": direction, "music": music, "lines": []})
def L(spk, text, gap=0.12, sfx=None, red=None, gold=None, note=None): S[-1]["lines"].append({"speaker": spk, "text": text, "gap_before": gap, "sfx": sfx or [], "red": red or [], "gold": gold or [], "note": note})

scene("S01", "Cold open", ["giza"], "Narrator starts fast and confident, like opening a story at a party; land each comparison with a tiny beat. Advisor's interruption is panicked.", "Bright plucky oud-and-pizzicato motif, light percussion; stops dead on the Advisor's line, restarts with the title sting.")
L("NARRATOR", "Ancient Egypt lasted for about three thousand years.", 0.4, red=["three", "thousand"])
L("NARRATOR", "The Romans are ancient history to us. Ancient Egypt was ancient history to the Romans.", 0.3, note="Pause 0.4 s before the second sentence.")
L("NARRATOR", "Cleopatra, the last pharaoh, lived closer in time to the Moon landing than to the building of the Great Pyramid.", 0.45, sfx=[("Moon", "whoosh")], gold=["Moon"])
L("NARRATOR", "So today we're covering all of it. Three thousand years, in fifteen minutes. What could possibly go wrong?", 0.4)
L("VIZIER", "Everything. Everything could go wrong.", 0.5, sfx=[("Everything.", "recordscratch")])
L("NARRATOR", "Thank you, royal advisor. Let's begin.", 0.5, sfx=[("begin.", "sting")])

scene("S02", "The Nile: a country shaped like a hallway", ["nile", "map"], "Relaxed, conspiratorial; 'very interested in killing you' delivered deadpan. Slight smugness on the map joke.", "Warm flowing strings and harp over a slow frame drum; a little 'water' arpeggio during the flood.")
L("NARRATOR", "First, the setting. Egypt is mostly desert. Very hot, very dry, and very interested in killing you.", 0.6, note="Beat before 'and very interested'.")
L("NARRATOR", "But running straight through it is the Nile, one of the longest rivers on Earth, and basically Egypt's life-support machine.", 0.3, gold=["Nile,"])
L("NARRATOR", "Every summer the Nile flooded and left behind thick, black, fertile mud. Crops grew in it like the soil had something to prove.", 0.3, sfx=[("flooded,", "water")])
L("NARRATOR", "Egyptians even named their country Kemet, the Black Land, after that mud. The desert was Deshret, the Red Land.", 0.3, red=["Red"], gold=["Kemet,"])
L("WORKER", "So we live on a thin green strip of mud, surrounded by an ocean of sand. Great. We live in a hallway.", 0.35)
L("NARRATOR", "Exactly. A very long hallway. With crocodiles.", 0.25, sfx=[("crocodiles.", "chomp")])
L("NARRATOR", "And for a long time, that hallway was split into two kingdoms: Upper Egypt in the south, and Lower Egypt in the north.", 0.45)
L("SOLDIER", "Wait. Upper Egypt is at the bottom?", 0.35, sfx=[("bottom?", "boing")])
L("NARRATOR", "The Nile flows north, so up means upstream. Please don't write in.", 0.3)

scene("S03", "Narmer unites the Two Lands", ["map", "throne"], "Narrator gets epic for one sentence then undercuts it. Narmer booms; Soldier is sincere and slow.", "Big taiko hit and brass swell for 'united'; settles into a regal processional loop.")
L("NARRATOR", "Then, around 3100 BC, a king from the south called Narmer decided that two kingdoms was one kingdom too many.", 0.6, red=["3100"], gold=["Narmer"])
L("NARRATOR", "He conquered the north and united Upper and Lower Egypt into a single country.", 0.2, sfx=[("united", "drumhit")])
L("NARMER", "From now on, there is one Egypt. And it has one king. Guess who.", 0.35)
L("SOLDIER", "Is it... you, sir?", 0.4)
L("NARMER", "It is me.", 0.4)
L("SOLDIER", "Long live... you, sir!", 0.35)
L("NARRATOR", "Historians still argue about exactly how it happened, because that's what historians do for fun.", 0.45)
L("NARRATOR", "Later kings wore a double crown: the red crown of the north wrapped around the white crown of the south. Basically, a royal ice-cream cone.", 0.3, sfx=[("ice-cream", "pop")])
L("NARRATOR", "These rulers would eventually be called pharaohs: the link between people and the gods, responsible for keeping the whole universe in order.", 0.3, gold=["pharaohs,"])
L("VIZIER", "No pressure.", 0.3)
L("NARRATOR", "That order was called Ma'at: balance, justice, harmony. Keeping it was the pharaoh's job. If things went badly, that was very much his problem.", 0.35, gold=["Ma'at:"])
L("NARMER", "Things will not go badly. I am excellent at universe.", 0.35)

scene("S04", "The Old Kingdom: the age of pyramids", ["giza", "construction"], "Narrator builds wonder then punctures it; Khufu grand and slow; Worker flat and tired. Pause before 'Four thousand years.'", "Grand but bouncy brass-and-percussion 'construction' groove; a choir 'aah' on the Great Pyramid reveal.")
L("NARRATOR", "With Egypt united, things got ambitious. This is the Old Kingdom, the Age of the Pyramids.", 0.7)
L("NARRATOR", "Around 2650 BC, the pharaoh Djoser and his architect Imhotep built a step pyramid at Saqqara, stacked like a wedding cake for the afterlife.", 0.3, red=["2650"])
L("NARRATOR", "Then came Khufu, a man who apparently looked at the desert and thought: what this place really needs is the biggest building in the world.", 0.45, gold=["Khufu,"])
L("KHUFU", "I want it tall. I want it pointy. I want people talking about it for thousands of years.", 0.35)
L("VIZIER", "Your Majesty, that is a lot of rock.", 0.3)
L("KHUFU", "Then get a lot of people.", 0.3)
L("NARRATOR", "The result was the Great Pyramid of Giza, finished around 2560 BC: about a hundred and forty-six metres tall, roughly two point three million stone blocks, and the tallest human-made structure on Earth for nearly four thousand years.", 0.5, sfx=[("Great", "choir")], red=["2560"])
L("NARRATOR", "Four thousand years. Most modern buildings struggle to survive a slightly damp winter.", 0.6)
L("NARRATOR", "And no, it wasn't built by aliens. It probably wasn't built by slaves either.", 0.4, sfx=[("aliens.", "ufo")])
L("NARRATOR", "Archaeologists found the workers' town nearby, with bakeries, breweries, and workers' tombs right beside the pyramids. The builders were skilled crews, often paid in bread and beer.", 0.3)
L("WORKER", "Bread and beer. Two point three million blocks. And they call it a tomb. I'm the one who's dying here.", 0.4, sfx=[("dying", "thud")])
L("VIZIER", "Think of the view.", 0.3)
L("WORKER", "I'm under the view.", 0.3)
L("NARRATOR", "Khufu's son Khafre built the second pyramid, and probably the Great Sphinx, carved straight out of the bedrock. Most experts think the face is Khafre's. The Sphinx, wisely, isn't saying.", 0.45)

scene("S05", "Collapse, chaos and the Middle Kingdom", ["village", "throne"], "Narrator darker and drier for the famine, then lighter for the comeback ('finally getting its life together').", "Music drops to a sparse low drone and dry wind for the famine; a hopeful lute theme returns with the Middle Kingdom.")
L("NARRATOR", "But building mountains is expensive. Royal power weakened, local governors got stronger, and around 2200 BC the Nile floods started to fail.", 0.7, red=["2200"])
L("NARRATOR", "No floods meant no crops, and no crops meant people suddenly had a lot of questions about how divine the pharaoh really was.", 0.3)
L("WORKER", "Remember when we had food? Good times.", 0.4, sfx=[("food?", "stomach")])
L("SOLDIER", "Who's in charge now?", 0.3)
L("VIZIER", "Several people. Which means nobody.", 0.3)
L("NARRATOR", "Historians call this the First Intermediate Period. Eventually, around 2050 BC, a family from Thebes put Egypt back together: the Middle Kingdom.", 0.35, red=["2050"], gold=["Middle", "Kingdom."])
L("NARRATOR", "Its kings spent less on giant tombs and more on irrigation, trade, fortresses and literature. Egypt, finally getting its life together. And it worked. For a while.", 0.3, sfx=[("while.", "uhoh")])

scene("S06", "The Hyksos and the chariot", ["kadesh"], "Brisk and military; Soldier amazed; Advisor greedy-practical.", "Galloping hand drums and low horns; tension builds into the New Kingdom fanfare.")
L("NARRATOR", "Around 1650 BC, outsiders known as the Hyksos took control of northern Egypt, bringing military technology Egypt hadn't really used before: horse-drawn war chariots and powerful composite bows.", 0.6, red=["1650"], gold=["Hyksos"], sfx=[("chariots", "horses")])
L("SOLDIER", "Sir, they have horses. And wheels. On the same thing!", 0.35)
L("VIZIER", "Write that down. We want those.", 0.3)
L("NARRATOR", "The Egyptians learned fast. Rulers from Thebes adopted the chariot, fought back, and around 1550 BC a king called Ahmose drove the Hyksos out.", 0.4, red=["1550"])
L("NARRATOR", "That kicked off the New Kingdom: Egypt's imperial age. Bigger armies, bigger temples, and much, much bigger egos.", 0.3, sfx=[("New", "fanfare")])

scene("S07", "Hatshepsut, the woman who was king", ["deirelbahari", "throne"], "Narrator admiring with a wink; Hatshepsut calm, crisp, unbothered; Worker gets out-witted.", "Elegant harp and ney flute, a confident walking bass; a brief sad cello for the erasure.")
L("NARRATOR", "Starting with Hatshepsut. When her husband, Thutmose the Second, died around 1479 BC, the heir was her stepson, Thutmose the Third. A small child.", 0.7, red=["1479"], gold=["Hatshepsut."])
L("NARRATOR", "So Hatshepsut ruled for him, as regent. Then, a few years later, she just... became pharaoh herself.", 0.3, sfx=[("pharaoh", "sting")], note="Long pause after 'just'.")
L("HATSHEPSUT", "I've been running the country anyway. I'm simply updating the paperwork.", 0.4)
L("VIZIER", "But Your Majesty, a woman ruling as full pharaoh is extremely unusual.", 0.3)
L("HATSHEPSUT", "Then I suppose it's less unusual now. Fetch my beard.", 0.35)
L("VIZIER", "Your... beard.", 0.35)
L("NARRATOR", "Her statues often showed her with a king's ceremonial false beard. Which sounds strange, until you learn the male pharaohs' beards were fake too.", 0.35)
L("NARRATOR", "And she was good at it: about twenty years of peace and prosperity, a famous trading expedition to the land of Punt, and a stunning temple at Deir el-Bahari.", 0.35)
L("SOLDIER", "The ships are back from Punt! Gold, ivory, incense trees, and, um, monkeys.", 0.35, sfx=[("monkeys.", "monkey")])
L("HATSHEPSUT", "Put the trees in the temple. Put the monkeys anywhere but my throne.", 0.3)
L("NARRATOR", "Years after her death, Thutmose the Third, who became a brilliant warrior king, had many of her images and names chiselled off the monuments. Historians still debate why.", 0.45, sfx=[("chiselled", "chisel")])
L("WORKER", "Imagine doing all that work and getting deleted from history.", 0.4)
L("NARRATOR", "Says the man whose name nobody wrote down.", 0.3)
L("WORKER", "Fair.", 0.5)

scene("S08", "Akhenaten installs a religious update", ["amarna"], "Narrator amused tech-support tone; Akhenaten blissed-out; Soldier deadpan heat-stroke delivery.", "Shimmering synth-like drone with sistrum rattles and a sunny melody; glitchy 'undo' rewind effect at the end.")
L("NARRATOR", "About a century later, Egypt got its strangest pharaoh: Amenhotep the Fourth.", 0.7)
L("NARRATOR", "Egypt had hundreds of gods, including a hippo goddess who protected childbirth. Then this pharaoh decided the whole religious system needed a software update.", 0.3, sfx=[("update.", "chime")])
L("AKHENATEN", "Big announcement. We're focusing on one god now. The Aten. The sun disc.", 0.35)
L("VIZIER", "Just... the sun?", 0.35)
L("AKHENATEN", "The sun. Have you seen it? It's incredible.", 0.3)
L("NARRATOR", "He renamed himself Akhenaten, cut support for the powerful temples of Amun, and built a brand-new capital in the middle of nowhere, a place we now call Amarna.", 0.4, gold=["Akhenaten,"])
L("NARRATOR", "Its temples were open to the sky so the sun could shine straight in. Very spiritual. Also very, very hot.", 0.3)
L("SOLDIER", "Sir, the priests of Amun are angry.", 0.35)
L("AKHENATEN", "Have they tried standing in the sunlight?", 0.3)
L("SOLDIER", "Sir, it's forty-five degrees. That's why they're angry.", 0.35)
L("NARRATOR", "Art changed too: the royal family appeared in a strange new relaxed style, with long faces, the king playing with his children.", 0.4)
L("NARRATOR", "Unfortunately, not everyone agreed to install the update. And after Akhenaten died, around 1336 BC, Egypt quietly pressed undo.", 0.3, sfx=[("undo.", "rewind")], red=["1336"])

scene("S09", "Tutankhamun: famous for being forgotten", ["throne", "tomb"], "Narrator gentle then building to the 1922 reveal; Tut innocent; Worker cynical. Big pause before 'Which is to say: nothing.'", "Soft music box theme for the boy king; mysterious low strings and a single bell for the forgotten tomb; triumphant swell at 1922.")
L("NARRATOR", "The undo button was a nine-year-old boy called Tutankhaten, probably Akhenaten's son. Early in his reign he became Tutankhamun, bringing back the old god Amun. A rebrand, but for an entire religion.", 0.7, gold=["Tutankhamun,"])
L("TUT", "So I just change one word, and everyone's happy again?", 0.35)
L("VIZIER", "Everyone except the sun, Your Majesty.", 0.3)
L("NARRATOR", "The court left Amarna, the old temples reopened, and then Tutankhamun died at about nineteen, around 1323 BC. Nobody's sure how: illness, an infected broken leg, maybe a chariot accident.", 0.35, red=["1323"])
L("NARRATOR", "So why is he the most famous pharaoh of all? Because of what happened next. Which is to say: nothing. For three thousand years.", 0.4, note="Pause 0.6 s before 'Which is to say'.")
L("NARRATOR", "Almost every royal tomb in the Valley of the Kings was robbed in ancient times. But Tutankhamun's small tomb got buried under rubble and forgotten.", 0.35)
L("NARRATOR", "Until 1922, when the archaeologist Howard Carter found it nearly intact, with more than five thousand objects inside: golden shrines, chariots, jewellery, and the famous golden mask.", 0.45, sfx=[("1922,", "reveal")], red=["1922,"], gold=["golden"])
L("WORKER", "So the secret to fame is: die young, and get lost for three thousand years.", 0.4)
L("NARRATOR", "Yes. Please do not try this at home.", 0.3)

scene("S10", "How to become a mummy (warning: gross)", ["tomb"], "Narrator mock-solemn 'nature documentary' delivery, enjoying the gross bits; pause before 'So be nice.'", "Creepy-cute low bassoon and pizzicato; wet squelch sound effects; a gong on the weighing of the heart.")
L("NARRATOR", "Speaking of dying: how did Egyptians get ready for the afterlife? Warning, this part is gross.", 0.7)
L("NARRATOR", "You needed your body in the afterlife, so embalmers made a mummy, in a process that could take about seventy days.", 0.3, red=["seventy"])
L("NARRATOR", "First, they pulled the brain out through the nose with a long hook, and threw it away. Then most organs came out through a cut in the side, into special jars.", 0.3, sfx=[("hook,", "squelch")])
L("WORKER", "They threw away the brain?", 0.35)
L("VIZIER", "They kept the heart. They believed you think with your heart.", 0.3)
L("WORKER", "That explains a lot of pharaohs.", 0.35)
L("NARRATOR", "The body was dried with a natural salt called natron, then wrapped in layer after layer of linen, with protective amulets tucked between.", 0.4)
L("NARRATOR", "In the afterlife, your heart was weighed against the feather of Ma'at. A heart heavy with wrongdoing was eaten by a monster that was part crocodile, part lion, and part hippo.", 0.35, sfx=[("feather", "gong"), ("eaten", "chomp")])
L("NARRATOR", "So be nice. Apparently, it's checked.", 0.6)

scene("S11", "Ramesses the Great (and very sure of it)", ["luxor", "kadesh", "abusimbel"], "Narrator mock-epic war-movie voice for Kadesh, then deadpan for propaganda; Ramesses deep and absolutely unbothered; Soldier panicking.", "Heavy war drums and brass for Kadesh; triumphant bombastic march for Abu Simbel; drops to a bassoon for 'home decoration'.")
L("NARRATOR", "A few decades later came the pharaoh who became the very definition of a pharaoh: Ramesses the Second, Ramesses the Great. Mostly because he told everyone he was great. On every wall available.", 0.7, gold=["Great."])
L("RAMESSES", "Put my name on that temple.", 0.35)
L("VIZIER", "Your Majesty, that temple was built by a different king.", 0.3)
L("RAMESSES", "Then put my name on it bigger.", 0.3, sfx=[("bigger.", "chisel")])
L("NARRATOR", "Ramesses became king around 1279 BC. Five years later he marched north to fight the Hittite Empire at the city of Kadesh, in what is now Syria, in one of the biggest chariot battles ever fought.", 0.45, red=["1279"], gold=["Kadesh,"], sfx=[("chariot", "horses")])
L("NARRATOR", "And he walked straight into a Hittite ambush. His army was strung out, one division was smashed, and for a moment it looked like a disaster.", 0.3, sfx=[("ambush.", "clash")])
L("SOLDIER", "Sir! The Hittites are behind us! And in front of us! And kind of everywhere!", 0.3)
L("RAMESSES", "Excellent. Then we can attack in any direction.", 0.35)
L("NARRATOR", "Ramesses fought his way out, reinforcements arrived just in time, and in the end neither side really won. Kadesh stayed Hittite.", 0.4)
L("NARRATOR", "So naturally, Ramesses went home and covered temple walls with the story of how he had personally won the whole battle.", 0.35)
L("SOLDIER", "Sir, didn't we sort of... not win?", 0.35)
L("RAMESSES", "Carve faster.", 0.3, sfx=[("faster.", "chisel")])
L("NARRATOR", "Historians call this propaganda. Ramesses called it home decoration.", 0.5, sfx=[("decoration.", "ding")])
L("NARRATOR", "About sixteen years later, Egypt and the Hittites signed one of the earliest peace treaties that still survives. A replica hangs at the United Nations.", 0.4)
L("NARRATOR", "And Ramesses kept going: sixty-six years on the throne, more than a hundred children, and Abu Simbel, with four twenty-metre statues of himself carved out of a mountain.", 0.35, red=["sixty-six"], gold=["hundred"], sfx=[("Abu", "choir")])
L("WORKER", "A hundred children. Who's carving all those birthday cards?", 0.4)
L("RAMESSES", "Name them all after me. It saves time.", 0.35)
L("NARRATOR", "Most Egyptians had never known another pharaoh. Ramesses wasn't just the king. He was the weather.", 0.35)

scene("S12", "Collapse, sea raiders and the first strike", ["sea", "village"], "Narrator serious for the collapse, then delighted by the strike. The workers' recorded words 'We are hungry' read plainly, quoted from the papyrus. Advisor begging.", "Ominous low brass and storm-wind for the Sea Peoples; a jaunty 'protest' clapping rhythm for the strike; a slow fading theme for centuries of new rulers.")
L("NARRATOR", "But after Ramesses, the good times started running out. Around 1200 BC the whole eastern Mediterranean slid into the Late Bronze Age Collapse. Empires fell, cities burned, trade fell apart.", 0.7, red=["1200"])
L("NARRATOR", "Egypt was attacked by mysterious raiders known as the Sea Peoples. Ramesses the Third defeated them, but the victory was expensive.", 0.3, sfx=[("Sea", "waves")])
L("SOLDIER", "We won!", 0.3)
L("VIZIER", "We also spent everything.", 0.3)
L("NARRATOR", "So expensive that around 1157 BC, the government failed to deliver food rations to the royal tomb builders of Deir el-Medina. So the workers put down their tools, walked off the job, and sat down behind a temple.", 0.35, red=["1157"], sfx=[("tools,", "clatter")])
L("NARRATOR", "It's the earliest recorded strike in history. A scribe wrote it all down on papyrus, including the workers' words to the officials: We are hungry.", 0.35, gold=["strike"], note="Read 'We are hungry' plainly; it is the recorded line.")
L("WORKER", "Finally! Someone wrote down my feelings!", 0.4)
L("VIZIER", "Pay them. Pay them now. Please.", 0.3)
L("NARRATOR", "They got their grain eventually. But over the next centuries Egypt was ruled by Libyans, Nubians, Assyrian invaders, and then Persians. It just kept getting new management.", 0.4)

scene("S13", "Alexander, the Ptolemies and a very big lighthouse", ["alexandria", "map"], "Narrator breezy travel-show tone; dry on 'very modestly'; gossip tone for the Ptolemy family.", "Bright Greek-flavoured lyre and frame drum; a sly clarinet for the sibling-marriage line.")
L("NARRATOR", "In 332 BC, Alexander the Great showed up. Egyptians were tired of Persian rule, so they more or less welcomed him. He was declared pharaoh, founded a city on the coast and, very modestly, named it Alexandria.", 0.7, red=["332"], gold=["Alexander"])
L("NARRATOR", "When he died young, his generals split his empire. One of them, Ptolemy, took Egypt and started a Greek royal family that ruled for nearly three hundred years.", 0.35)
L("NARRATOR", "Alexandria became one of the greatest cities in the world, with a gigantic lighthouse called the Pharos and a famous library stuffed with scrolls.", 0.3, sfx=[("Pharos", "choir")])
L("SOLDIER", "So the pharaohs are Greek now?", 0.35)
L("VIZIER", "Greek pharaohs, Egyptian crowns, Greek paperwork. Keep up.", 0.3)
L("NARRATOR", "It's also the era of the Rosetta Stone: a decree from 196 BC carved in hieroglyphs, in a later Egyptian script called Demotic, and in Greek. Two thousand years later, it helped scholars finally crack hieroglyphs.", 0.35, red=["196"])
L("NARRATOR", "Meanwhile, the Ptolemies had a family tradition of marrying their siblings, murdering their siblings, and occasionally both.", 0.4, sfx=[("both.", "uhoh")])

scene("S14", "Cleopatra and the end of the pharaohs", ["throne", "alexandria", "sea"], "Narrator sharp and fast-paced like a political thriller; Cleopatra cool and razor-witty; Caesar smooth; Antony overconfident; Octavian icy. Drop all jokes and slow down for the deaths.", "Sultry strings and ney for Cleopatra; war drums for Actium; then a single sustained low note under the ending, resolving softly.")
L("NARRATOR", "Which brings us to the last active ruler of ancient Egypt: Cleopatra the Seventh.", 0.7, gold=["Cleopatra"])
L("NARRATOR", "Cleopatra had a problem. Rome was getting stronger, Egypt was getting weaker, and her political situation was about as stable as a chair with three legs.", 0.35)
L("NARRATOR", "Luckily, she was brilliant. She spoke many languages, and was reportedly the first Ptolemy to learn Egyptian.", 0.35)
L("CLEOPATRA", "Three centuries in Egypt, and my family never learned the language. Like tourists who refuse to learn the word for thank you.", 0.4)
L("CLEOPATRA", "Rome wants our grain, our gold, and our obedience. They can have one. Possibly.", 0.4)
L("NARRATOR", "In 48 BC, Julius Caesar arrived in Alexandria, in the middle of Cleopatra's power struggle with her own brother. She allied with Caesar, won back her throne, and they had a son, Caesarion.", 0.4, red=["48"], gold=["Caesar"])
L("CAESAR", "So, I help you, and Rome gains a very rich friend.", 0.35)
L("CLEOPATRA", "And Egypt gains a very large army. Everybody wins. Mostly me.", 0.3)
L("NARRATOR", "Then, in 44 BC, Caesar was assassinated in Rome, and Cleopatra needed a new Roman partner: Mark Antony, one of Rome's most powerful generals. They became allies, then partners, and had three children.", 0.4, sfx=[("assassinated", "stab")], red=["44"])
L("ANTONY", "You, me, and the whole eastern half of the Roman world. What could go wrong?", 0.35)
L("VIZIER", "He said it. He actually said it.", 0.4, sfx=[("said", "recordscratch")])
L("NARRATOR", "What went wrong was Octavian, Caesar's adopted heir, who wanted Rome for himself and convinced the Romans that Antony had gone completely Egyptian.", 0.35)
L("NARRATOR", "In 31 BC they met in a huge naval battle at Actium, off the coast of Greece. Octavian's fleet won. Antony and Cleopatra fell back to Alexandria, and a year later Octavian's army arrived.", 0.4, red=["31"], sfx=[("Actium,", "clash")])
L("OCTAVIAN", "Egypt now belongs to Rome.", 0.5)
L("NARRATOR", "Antony took his own life. Soon after, rather than be paraded through Rome as a prisoner, Cleopatra did the same. Ancient writers said it was the bite of a cobra, though historians still aren't sure.", 0.6, note="Slow, no jokes.")
L("NARRATOR", "In 30 BC, Egypt became a province of Rome. After three thousand years, the age of the pharaohs was over.", 0.5, red=["30"], sfx=[("over.", "bell")])

scene("S15", "Outro", ["giza"], "Warm, a little proud, fast recap rhythm; Khufu smug; Advisor finally relaxed.", "Main theme returns full, upbeat; ends on the opening oud motif and a final drum hit.")
L("NARRATOR", "So, the recap. The Egyptians united a kingdom, built mountains by hand, staged the first recorded strike, signed one of the earliest surviving peace treaties, and kept one civilisation going for three thousand years.", 0.9)
L("NARRATOR", "The pharaohs are long gone. But the pyramids are still standing, the Sphinx is still staring, and we're still talking about them. Exactly like Khufu wanted.", 0.35)
L("KHUFU", "Told you.", 0.4)
L("VIZIER", "Yes, Your Majesty. You were right.", 0.3)
L("KHUFU", "Write that down. On a pyramid.", 0.3, sfx=[("pyramid.", "sting")])
L("NARRATOR", "And that's the entire history of ancient Egypt. Thanks for watching.", 0.6)

# ---- emit
lines, n = [], 0
for sc in S:
    for l in sc["lines"]:
        n += 1; l["id"] = f"L{n:03d}"; l["scene"] = sc["id"]; lines.append(l)
script = {"title": "The Entire History of Ancient Egypt", "format": "landscape-16x9", "fps": 30, "size": [1920, 1080], "voices": VOICES,
          "scenes": [{k: v for k, v in sc.items() if k != "lines"} | {"line_ids": [l["id"] for l in sc["lines"]]} for sc in S],
          "lines": [{k: l[k] for k in ("id", "scene", "speaker", "text", "gap_before", "sfx", "red", "gold")} for l in lines]}
json.dump(script, open(os.path.join(HERE, "script.json"), "w"), indent=1, ensure_ascii=False)
words = lambda t: len(re.findall(r"[A-Za-z0-9'\-]+", t))
nw = sum(words(l["text"]) for l in lines); nd = sum(words(l["text"]) for l in lines if l["speaker"] != "NARRATOR")
print(f"lines {len(lines)}  words {nw}  dialogue {nd} ({100*nd/nw:.0f}%)  est {nw/158:.1f} min")
# ---- production script (markdown)
md = [f"# {script['title']}", "", "Fully narrated 16:9 animated comedy documentary, about 15 minutes. One narrator throughout; character voices are listed below. All dialogue is comedic dramatisation, not historical quotation. The only real historical words quoted are the Deir el-Medina workers' complaint, 'We are hungry', from the Turin Strike Papyrus.", "", "## Voices (Kokoro-82M, free open-weight TTS)", ""]
for k, v in VOICES.items(): md.append(f"- **{k}**: `{v['voice']}` at speed {v['speed']}. {v['desc']}.")
for sc in S:
    md += ["", f"## {sc['id']}: {sc['title']}", "", f"**Visuals / sets:** {', '.join(sc['sets'])}", "", f"**Voice direction:** {sc['direction']}", "", f"**Background music:** {sc['music']}", ""]
    md.append("**Narrator voiceover and character dialogue (in order):**"); md.append("")
    for l in sc["lines"]:
        pause = f" *(pause {l['gap_before']:.1f}s before)*" if l["gap_before"] >= .45 else ""
        fx = "".join(f" `[SFX {nm} on \"{w}\"]`" for w, nm in l["sfx"])
        note = f" *({l['note']})*" if l.get("note") else ""
        who = "NARRATOR" if l["speaker"] == "NARRATOR" else l["speaker"]
        md.append(f"- **{who}:** {l['text']}{pause}{fx}{note}")
open(os.path.join(HERE, "script.md"), "w").write("\n".join(md) + "\n")
