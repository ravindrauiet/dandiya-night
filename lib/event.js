// All event details in one place – edit here to change the website and emails.
export const EVENT = {
  name: "DANDIYA NIGHT 2026",
  tagline: "The Grandest Navratri Celebration in Ghaziabad",
  presenters: "APK Production & Rahul Dhaundiyal",
  date: "Saturday, 17 October 2026",
  time: "6:00 PM to 9:00 PM",
  targetDate: "2026-10-17T18:00:00+05:30",
  venue: "Opulent Mall, Ghaziabad",
  venueAddress: "Opulent Mall, GT Road, East Model Town, Ghaziabad, Uttar Pradesh 201001",
  landmark: "Near Ghaziabad Railway Station, GT Road",
  parking: "Spacious Multi-Level Mall Parking Available",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Opulent+Mall+Ghaziabad",
  upiId: "7303840482@axl",
  payee: "Rahul Dhaundiyal",
  phones: ["7303840482", "8800544164"],
  instagram: "rahul_dhaundiyal",
  whatsapp: "917303840482",
};

export const TICKETS = [
  {
    id: "individual",
    name: "Individual",
    price: 199,
    people: "1 person",
    badge: "Solo Dancer",
    perks: [
      "Full evening entry for 1 person",
      "Access to main Dandiya dance arena",
      "Eligible for contests & spot prizes",
      "Access to food and refreshment stalls",
    ],
  },
  {
    id: "couple",
    name: "Couple",
    price: 299,
    people: "2 people",
    badge: "Most Popular",
    isPopular: true,
    perks: [
      "Entry pass for 2 people",
      "Save ₹99 compared to individual passes",
      "Couple Garba circle participation",
      "Eligible for Best Dressed Couple prize",
    ],
  },
  {
    id: "group5",
    name: "Group of 5",
    price: 599,
    people: "5 people",
    badge: "Best Value",
    isBestValue: true,
    perks: [
      "Full entry pass for 5 friends / family",
      "Save ₹396 (just ₹120 per person!)",
      "Group garba coordination contest entry",
      "Priority check-in lane at the entrance",
    ],
  },
  {
    id: "children",
    name: "Children",
    price: 0,
    people: "Kids Entry",
    badge: "Free Pass",
    perks: [
      "Free festive entry for young children",
      "Kid-friendly festive environment",
      "Supervised family celebration",
      "Confirm age policy with organiser",
    ],
  },
];

export const HIGHLIGHTS = [
  {
    icon: "💃",
    title: "Dandiya & Garba Raas",
    text: "Experience the vibrant rhythm of traditional Garba and energetic Dandiya under glittering festive lights.",
    badge: "Traditional & Modern",
  },
  {
    icon: "🎧",
    title: "Live DJ & Dhol Artists",
    text: "Non-stop pulse-pounding Bollywood, Gujarati folk fusions, and live Punjabi Dhol mashups.",
    badge: "High Energy",
  },
  {
    icon: "🍴",
    title: "Delicious Food Stalls",
    text: "Mouth-watering street food, festive chaat, sweets, and refreshing drinks available inside the venue.",
    badge: "Food Court",
  },
  {
    icon: "🏆",
    title: "Contests & Titles",
    text: "Compete for Best Dancer, Best Traditional Attire, Best Couple, and Best Garba Group awards.",
    badge: "Prizes & Trophies",
  },
  {
    icon: "🎬",
    title: "Free Movie Tickets",
    text: "Exclusive complimentary movie tickets for lucky contest participants and winning dancers.",
    badge: "Exciting Gifts",
  },
  {
    icon: "🎁",
    title: "Hampers & Vouchers",
    text: "Exciting festive hampers, brand vouchers, and partner gift tokens given away all evening.",
    badge: "Giveaways",
  },
];

export const SCHEDULE = [
  {
    time: "06:00 PM",
    title: "Gates Open & Royal Welcome",
    desc: "Tikka welcome, check-in, dandiya collection, and festive photo booths open.",
    icon: "🪔",
  },
  {
    time: "06:30 PM",
    title: "Traditional Garba Circles",
    desc: "Opening prayer and traditional Gujarati circular Garba dance for all ages.",
    icon: "💃",
  },
  {
    time: "07:30 PM",
    title: "High-Octane DJ Dandiya Beats",
    desc: "Live DJ takes the stage with Bollywood dandiya chartbusters and live dhol rhythms.",
    icon: "🎧",
  },
  {
    time: "08:30 PM",
    title: "Prize Ceremony & Contest Winners",
    desc: "Best Dressed, Best Dancer awards, mega gift hampers and movie tickets giveaway.",
    icon: "🏆",
  },
  {
    time: "09:00 PM",
    title: "Grand Finale Dhol Celebration",
    desc: "Final mega dance celebration with high tempo festive beats and celebration sparklers.",
    icon: "🥁",
  },
];

export const FAQS = [
  {
    q: "Are Dandiya sticks available at the venue?",
    a: "Yes! High-quality wooden and decorative dandiya sticks will be available at the venue stalls for purchase or rental. You are also welcome to bring your own favorite pairs.",
  },
  {
    q: "Is there a dress code for Dandiya Night 2026?",
    a: "Traditional festive Indian attire (Chaniya Choli, Kurta-Pajama, Kedia, Sarees) is highly encouraged to soak in the festive Navratri vibe and qualify for the Best Dressed prizes!",
  },
  {
    q: "How will I receive my ticket and entry QR code?",
    a: "Instantly upon submitting your booking request, your official entry pass with a unique QR code is generated on screen and automatically sent to your provided email address. Show this digital QR code on your phone at the entry gate.",
  },
  {
    q: "Can I book passes for my friends or family?",
    a: "Absolutely! You can choose the Couple Pass (for 2) or Group Pass (for 5), or increase the pass quantity in the form to book for multiple attendees at once with one single payment.",
  },
  {
    q: "Is parking available at Opulent Mall?",
    a: "Yes, Opulent Mall features dedicated multi-level covered parking for both two-wheelers and four-wheelers with security management.",
  },
  {
    q: "Whom should I contact in case of queries?",
    a: "You can reach out directly to the organiser, Rahul Dhaundiyal, via WhatsApp or phone at +91 7303840482 or +91 8800544164.",
  },
];

export const formatPrice = (p) => (p === 0 ? "FREE" : `₹${p}`);
