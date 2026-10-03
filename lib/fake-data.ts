// Placeholder data. scripts/seed.ts copies it into the database (npm run db:seed),
// and the app reads it back through lib/db.ts. Edit here, then re-run the seed.
// isSample = true means the details still need to be verified or are made up.
// photo: put an image in public/images/ and set e.g. photo: "/images/p6.jpg".
//        null shows a category icon instead.

export type Place = {
  id: string;
  name: string;
  category: "Cafe" | "Restaurant" | "Bakery" | "Deli";
  neighborhood: string;
  address: string | null;
  lat: number | null; // null = no map pin until someone finds the location
  lng: number | null;
  hours: string;
  photo: string | null;
  isSample: boolean;
};

export type GroveEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  photo: string | null;
  isSample: boolean;
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
  isSample: boolean;
};

// Real Newark businesses. Addresses and coordinates come from Azure Maps search.
// Hours marked "TBD" still need checking.
export const places: Place[] = [
  { id: "p1", name: "Qaalii's Cafe", category: "Cafe", neighborhood: "Downtown", address: "41 Halsey St", lat: 40.74106, lng: -74.17129, hours: "Hours: TBD", photo: null, isSample: true },
  { id: "p2", name: "Cortaditos", category: "Cafe", neighborhood: "Downtown", address: "91 Halsey St", lat: 40.73951, lng: -74.17238, hours: "Hours: TBD", photo: null, isSample: true },
  { id: "p3", name: "Intrinsic Cafe", category: "Cafe", neighborhood: "University Heights", address: "5 Sussex Ave", lat: 40.74379, lng: -74.17603, hours: "Hours: TBD", photo: null, isSample: true },
  { id: "p4", name: "Mocha Town", category: "Cafe", neighborhood: "University Heights", address: "155 University Ave", lat: 40.74251, lng: -74.17375, hours: "Hours: TBD", photo: null, isSample: true },
  { id: "p5", name: "Hobby's Delicatessen", category: "Deli", neighborhood: "Downtown", address: "32 Branford Pl", lat: 40.73511, lng: -74.1744, hours: "Hours: TBD", photo: null, isSample: true },
  { id: "p6", name: "Teixeira's Bakery", category: "Bakery", neighborhood: "Ironbound", address: "186 Ferry St", lat: 40.72878, lng: -74.15673, hours: "Hours: TBD", photo: null, isSample: true },
  { id: "p7", name: "Calandra's Bakery", category: "Bakery", neighborhood: "North Ward", address: "204 1st Ave", lat: 40.76764, lng: -74.18175, hours: "Hours: TBD", photo: null, isSample: true },
  { id: "p8", name: "Seabra's Marisqueira", category: "Restaurant", neighborhood: "Ironbound", address: "87 Madison St", lat: 40.72992, lng: -74.16067, hours: "Hours: TBD", photo: null, isSample: true },
  { id: "p9", name: "Iberia Peninsula", category: "Restaurant", neighborhood: "Ironbound", address: null, lat: null, lng: null, hours: "Hours: TBD", photo: null, isSample: true },
];

export const events: GroveEvent[] = [
  { id: "e1", title: "Cherry Blossom Festival", date: "Sample date: April", location: "Branch Brook Park", category: "Outdoors", photo: null, isSample: true },
  { id: "e2", title: "Open Mic Night", date: "Fri, 7pm", location: "Downtown", category: "Music", photo: null, isSample: true },
  { id: "e3", title: "Ironbound Food Walk", date: "Sat, 12pm", location: "Ironbound", category: "Food", photo: null, isSample: true },
  { id: "e4", title: "Free Resume Workshop", date: "Tue, 5pm", location: "Central Ward", category: "Career", photo: null, isSample: true },
  { id: "e5", title: "Community Garden Day", date: "Sun, 10am", location: "North Ward", category: "Volunteer", photo: null, isSample: true },
  { id: "e6", title: "Local Artists Market", date: "Sat, 2pm", location: "Downtown", category: "Shopping", photo: null, isSample: true },
];

// Fictional employers so nobody thinks a real business is hiring.
export const jobs: Job[] = [
  { id: "j1", role: "Barista", business: "Sample Coffee Co.", pay: "$17/hr", shift: "Weekend mornings", isSample: true },
  { id: "j2", role: "Line Cook", business: "Sample Kitchen", pay: "$19/hr", shift: "Evenings", isSample: true },
  { id: "j3", role: "Cashier", business: "Sample Market", pay: "$16/hr", shift: "Part-time", isSample: true },
  { id: "j4", role: "Bakery Assistant", business: "Sample Bakery", pay: "$16/hr", shift: "Early mornings", isSample: true },
  { id: "j5", role: "Event Staff", business: "Sample Events", pay: "$18/hr", shift: "Weekends", isSample: true },
  { id: "j6", role: "Delivery Driver", business: "Sample Eats", pay: "$18/hr + tips", shift: "Flexible", isSample: true },
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
