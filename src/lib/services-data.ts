import elec from "@/assets/svc-electrical.jpg";
import plumb from "@/assets/svc-plumbing.jpg";
import ac from "@/assets/svc-ac.jpg";
import paint from "@/assets/svc-painting.jpg";
import carp from "@/assets/svc-carpenter.jpg";
import clean from "@/assets/svc-cleaning.jpg";
import tile from "@/assets/svc-tiling.jpg";
import ceiling from "@/assets/svc-ceiling.jpg";
import pest from "@/assets/svc-pest.jpg";
import shift from "@/assets/svc-shifting.jpg";

export type Service = { name: string; desc: string; price: string; img: string };
export type Category = { key: string; title: string; emoji: string; icon: string; tint: string; items: Service[] };

export const categories: Category[] = [
  {
    key: "repair", title: "Repair Work", emoji: "🔧", icon: elec, tint: "#FFF4ED",
    items: [
      { name: "Electrical Repair", desc: "Wiring, switches, fans, MCB, lights & all electrical fixes by licensed electricians.", price: "From ₹149", img: elec },
      { name: "Plumbing Repair", desc: "Leakage, pipe repair, tap & geyser installation, drainage unblocking.", price: "From ₹149", img: plumb },
      { name: "AC Repair & Servicing", desc: "AC installation, seasonal service, gas refilling, cooling issues fixed.", price: "From ₹299", img: ac },
      { name: "Appliance Repair", desc: "Fridge, washing machine, microwave & other home appliance repair.", price: "From ₹199", img: ac },
      { name: "Carpenter Repair", desc: "Furniture repair, door & window fixing, hinges, locks & woodwork.", price: "From ₹199", img: carp },
      { name: "Wall Crack Repair", desc: "Crack filling, wall plastering, seepage treatment & patch work.", price: "From ₹349", img: paint },
    ],
  },
  {
    key: "construction", title: "Construction & Renovation", emoji: "🏗️", icon: ceiling, tint: "#EFF6FF",
    items: [
      { name: "Interior Painting", desc: "Premium interior painting with brand paints — Asian, Berger, Dulux.", price: "From ₹12/sqft", img: paint },
      { name: "Tiling & Flooring", desc: "Bathroom, kitchen & full home tile work — vitrified, marble, granite.", price: "From ₹35/sqft", img: tile },
      { name: "False Ceiling", desc: "POP, gypsum & PVC false ceilings with cove lighting.", price: "From ₹85/sqft", img: ceiling },
      { name: "Carpentry Work", desc: "Modular kitchen, wardrobes, beds and full custom woodwork.", price: "Custom Quote", img: carp },
      { name: "Waterproofing", desc: "Roof, terrace & bathroom waterproofing — 5-year warranty.", price: "From ₹25/sqft", img: tile },
      { name: "Full Home Renovation", desc: "End-to-end project management — design to handover.", price: "Custom Quote", img: ceiling },
    ],
  },
  {
    key: "cleaning", title: "Cleaning Services", emoji: "🧹", icon: clean, tint: "#ECFDF5",
    items: [
      { name: "Deep Home Cleaning", desc: "Full home spotless — kitchen, bathroom, floors, fans, glass.", price: "From ₹1,499", img: clean },
      { name: "Sofa & Carpet Cleaning", desc: "Steam shampooing, stain removal, deodorizing.", price: "From ₹399/seat", img: clean },
      { name: "Bathroom Cleaning", desc: "Tile descaling, sanitization & shine restoration.", price: "From ₹399", img: clean },
      { name: "Kitchen Cleaning", desc: "Chimney, hob, cabinets degrease & deep clean.", price: "From ₹699", img: clean },
      { name: "Pest Control", desc: "Cockroach, termite, bed bug treatment with safe chemicals.", price: "From ₹999", img: pest },
    ],
  },
  {
    key: "labour", title: "Labour Work", emoji: "👷", icon: shift, tint: "#F5F3FF",
    items: [
      { name: "Loading & Shifting", desc: "House shifting, loading & unloading with packing materials.", price: "From ₹1,999", img: shift },
      { name: "Demolition Work", desc: "Wall, tile, ceiling demolition with debris removal.", price: "From ₹2,500", img: shift },
      { name: "Daily Mistry / Helper", desc: "Skilled mason / helper on per-day or hourly basis.", price: "From ₹699/day", img: shift },
      { name: "Material Lifting", desc: "Bricks, sand, cement & furniture lifting to upper floors.", price: "From ₹499", img: shift },
    ],
  },
];
