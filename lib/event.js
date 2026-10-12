// All event details in one place – edit here to change the website and emails.
export const EVENT = {
  name: "DANDIYA NIGHT 2026",
  presenters: "APK Production & Rahul Dhaundiyal",
  date: "Saturday, 17 October",
  time: "6:00 PM to 9:00 PM",
  venue: "Opulent Mall, Ghaziabad",
  upiId: "7303840482@axl",
  payee: "Rahul Dhaundiyal",
  phones: ["7303840482", "8800544164"],
  instagram: "rahul_dhaundiyal",
  whatsapp: "917303840482",
};

export const TICKETS = [
  { id: "individual", name: "Individual", price: 199, people: "1 person" },
  { id: "couple", name: "Couple", price: 299, people: "2 people" },
  { id: "group5", name: "Group of 5", price: 599, people: "5 people" },
  { id: "children", name: "Children", price: 0, people: "Confirm age policy with organiser" },
];

export const HIGHLIGHTS = [
  { icon: "💃", title: "Dandiya & Garba", text: "Bring your best festive moves." },
  { icon: "🎧", title: "DJ Night", text: "Music and dance through the evening." },
  { icon: "🍴", title: "Food Stalls", text: "Food options at the venue." },
  { icon: "🏆", title: "Competitions", text: "Join in and show your skills." },
  { icon: "🎬", title: "Movie Tickets", text: "Movie tickets among planned prizes." },
  { icon: "🎁", title: "Hampers & Vouchers", text: "Gift hampers and vouchers to win." },
];

export const formatPrice = (p) => (p === 0 ? "FREE" : `₹${p}`);
