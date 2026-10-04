// Placeholder data. scripts/seed.ts copies it into the database (npm run db:seed),
// and the app reads it back through lib/db.ts. Edit here, then re-run the seed.
// isSample = true means the details still need to be verified or are made up.
// photo: put an image in public/images/ and set e.g. photo: "/images/p6.jpg".
//        null shows a category icon instead.

export type Place = {
  id: string;
  name: string;
  category: string; // see lib/categories.ts
  neighborhood: string;
  address: string | null;
  lat: number | null; // null = no map pin until someone finds the location
  lng: number | null;
  hours: string;
  photo: string | null;
  photoIsLogo: boolean; // logos are shown whole (not cropped) on a light background
  isSample: boolean;
  description?: string | null; // written by the owner (with Gemini's help); shown on the card
  isVerified?: boolean;         // has an owner the Grove team approved
};

export type GroveEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  photo: string | null;
  isSample: boolean;
  description?: string | null; // added when an owner posts the gathering
};

export type Resource = {
  id: string;
  name: string;
  kind: "Library" | "Food" | "Health" | "Campus" | "Career";
  location: string;
  detail: string;
  isSample: boolean;
};

export type Job = {
  id: string;
  role: string;
  business: string;
  pay: string;
  shift: string;
  photo: string | null;
  isSample: boolean;
  description?: string | null;
};

// Real Newark businesses. Addresses and coordinates come from Azure Maps search.
// Hours marked "TBD" still need checking.
export const places: Place[] = [
  { id: "p1", name: "Qaalii's Cafe", category: "Cafe", neighborhood: "Downtown", address: "41 Halsey St", lat: 40.74106, lng: -74.17129, hours: "Hours: TBD", photo: "/images/p1.jpg", photoIsLogo: false, description: "A Downtown café at 41 Halsey Street, easy to spot by the red flowers draped over its storefront. A good coffee stop while you explore Halsey Street's shops.", isSample: true },
  { id: "p2", name: "Cortaditos", category: "Cafe", neighborhood: "Downtown", address: "91 Halsey St", lat: 40.73951, lng: -74.17238, hours: "Hours: TBD", photo: "/images/p2.jpg", photoIsLogo: false, description: "A Halsey Street café named for the cortadito, the sweet Cuban-style espresso cut with steamed milk. Grab one to go or stay a while Downtown.", isSample: true },
  { id: "p3", name: "Intrinsic Cafe", category: "Cafe", neighborhood: "University Heights", address: "5 Sussex Ave", lat: 40.74379, lng: -74.17603, hours: "Hours: TBD", photo: "/images/p3.jpg", photoIsLogo: false, description: "A neighborhood café on Sussex Avenue serving coffee and bubble tea, with picnic tables out front. Steps from the NJIT and Rutgers-Newark campuses.", isSample: true },
  { id: "p4", name: "Mocha Town", category: "Cafe", neighborhood: "University Heights", address: "155 University Ave", lat: 40.74251, lng: -74.17375, hours: "Hours: TBD", photo: "/images/p4.jpg", photoIsLogo: false, description: "A yogurt and coffee café on University Avenue with a long menu: coffee, teas, smoothies, bubble tea, cold brew, pastries, salads and sandwiches.", isSample: true },
  { id: "p5", name: "Hobby's Delicatessen", category: "Deli", neighborhood: "Downtown", address: "32 Branford Pl", lat: 40.73511, lng: -74.1744, hours: "Hours: TBD", photo: "/images/p5.jpeg", photoIsLogo: false, description: "A classic Downtown Newark deli known for piled-high pastrami and corned beef sandwiches. A go-to lunch spot on Branford Place.", isSample: true },
  { id: "p6", name: "Teixeira's Bakery", category: "Bakery", neighborhood: "Ironbound", address: "186 Ferry St", lat: 40.72878, lng: -74.15673, hours: "Hours: TBD", photo: "/images/p6.jpg", photoIsLogo: true, description: "A Portuguese bakery on Ferry Street in the Ironbound, baking fresh breads, rolls and pastries. Pick up Portuguese rolls or a pastry with your coffee.", isSample: true },
  { id: "p7", name: "Calandra's Bakery", category: "Bakery", neighborhood: "North Ward", address: "204 1st Ave", lat: 40.76764, lng: -74.18175, hours: "Hours: TBD", photo: "/images/p7.jpg", photoIsLogo: false, description: "A North Ward bakery known for Italian and French bread, plus pastries and wedding cakes. Look for the big lit-up sign on First Avenue.", isSample: true },
  { id: "p8", name: "Seabra's Marisqueira", category: "Restaurant", neighborhood: "Ironbound", address: "87 Madison St", lat: 40.72992, lng: -74.16067, hours: "Hours: TBD", photo: "/images/p8.jpeg", photoIsLogo: true, description: "A Portuguese seafood restaurant in the Ironbound. Marisqueira means seafood house, and the menu is built around fish and shellfish.", isSample: true },
  { id: "p9", name: "Iberia Peninsula", category: "Restaurant", neighborhood: "Ironbound", address: null, lat: null, lng: null, hours: "Hours: TBD", photo: "/images/p9.jpg", photoIsLogo: false, description: "An Ironbound restaurant serving Portuguese and Spanish cooking, named for the Iberian Peninsula where both cuisines come from.", isSample: true },
];

export const events: GroveEvent[] = [
  { id: "e1", title: "Cherry Blossom Festival", date: "Sample date: April", location: "Branch Brook Park", category: "Outdoors", photo: "/images/p10.jpg", description: "Celebrate spring under Branch Brook Park's cherry trees, the largest collection of cherry blossoms in the United States. Bring a camera and take a walk under the blooms.", isSample: true },
  { id: "e2", title: "Open Mic Night", date: "Fri, 7pm", location: "Downtown", category: "Music", photo: "/images/p11.jpg", description: "Share music, poetry or comedy, or just come to listen. All levels welcome, and every performer gets a few minutes on the mic.", isSample: true },
  { id: "e3", title: "Ironbound Food Walk", date: "Sat, 12pm", location: "Ironbound", category: "Food", photo: "/images/p12.jpg", description: "A guided stroll through the Ironbound's Portuguese, Brazilian and Spanish spots, with tastings along the way. Wear comfortable shoes and come hungry.", isSample: true },
  { id: "e4", title: "Free Resume Workshop", date: "Tue, 5pm", location: "Central Ward", category: "Career", photo: "/images/p13.jpg", description: "Bring your resume or start one from scratch. Volunteers help with formatting, wording and interview tips, free of charge.", isSample: true },
  { id: "e5", title: "Community Garden Day", date: "Sun, 10am", location: "North Ward", category: "Volunteer", photo: "/images/p14.jpg", description: "Help plant, weed and water a neighborhood garden in the North Ward. No experience needed, just bring a pair of gloves.", isSample: true },
  { id: "e6", title: "Local Artists Market", date: "Sat, 2pm", location: "Downtown", category: "Shopping", photo: "/images/p15.jpg", description: "Browse prints, zines, jewelry and crafts made by Newark artists, and meet the makers behind them.", isSample: true },
];

// Fictional employers so nobody thinks a real business is hiring.
export const jobs: Job[] = [
  { id: "j1", role: "Barista", business: "Sample Coffee Co.", pay: "$17/hr", shift: "Weekend mornings", photo: "/images/p16.jpg", description: "Make espresso drinks, take orders and keep the counter moving on busy weekend mornings. Training provided.", isSample: true },
  { id: "j2", role: "Line Cook", business: "Sample Kitchen", pay: "$19/hr", shift: "Evenings", photo: "/images/p17.jpg", description: "Prep ingredients and cook on the line during dinner service. Some kitchen experience preferred.", isSample: true },
  { id: "j3", role: "Cashier", business: "Sample Market", pay: "$16/hr", shift: "Part-time", photo: "/images/p18.png", description: "Ring up customers, handle cash and cards, and help keep shelves stocked. Part-time hours that can fit around school.", isSample: true },
  { id: "j4", role: "Bakery Assistant", business: "Sample Bakery", pay: "$16/hr", shift: "Early mornings", photo: "/images/p19.jpg", description: "Help shape, bake and package bread and pastries before the morning rush. Great for early risers.", isSample: true },
  { id: "j5", role: "Event Staff", business: "Sample Events", pay: "$18/hr", shift: "Weekends", photo: "/images/p20.jpeg", description: "Set up, greet guests and help weekend events around Newark run on time.", isSample: true },
  { id: "j6", role: "Delivery Driver", business: "Sample Eats", pay: "$18/hr + tips", shift: "Flexible", photo: "/images/p21.jpg", description: "Deliver food orders around Newark on a flexible schedule. A valid driver's license is required; tips on top of hourly pay.", isSample: true },
];

// Lantern Board: free community resources. Sample entries are placeholders
// for the team to replace with real, verified programs.
export const resources: Resource[] = [
  { id: "r1", name: "Newark Public Library", kind: "Library", location: "5 Washington St", detail: "Free programs, computers & Wi-Fi", isSample: true },
  { id: "r2", name: "Community Food Pantry", kind: "Food", location: "Central Ward", detail: "Free groceries · Sample listing", isSample: true },
  { id: "r3", name: "Free Health Screening", kind: "Health", location: "South Ward", detail: "Walk-in, no insurance needed · Sample listing", isSample: true },
  { id: "r4", name: "NJIT Public Lecture", kind: "Campus", location: "University Heights", detail: "Open to the public · Sample listing", isSample: true },
  { id: "r5", name: "Rutgers-Newark Public Event", kind: "Campus", location: "University Heights", detail: "Open to the public · Sample listing", isSample: true },
  { id: "r6", name: "Job Readiness Workshop", kind: "Career", location: "Downtown", detail: "Resume help & interview practice · Sample listing", isSample: true },
];
