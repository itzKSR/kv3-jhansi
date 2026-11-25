export const SCHOOL_NAME = "PM SHRI Kendriya Vidyalaya No. 3, Jhansi";
export const EVENT_TITLE = "Class XII Farewell Gala";

export const CLASS_SECTIONS = [
  "12-A",
  "12-B",
  "12-C",
  "12-D",
] as const;

export const STREAMS = [
  "Science (PCM)",
  "Science (PCB)",
  "Commerce",
  "Humanities",
] as const;

export const CROWN_CATEGORIES = [
  {
    id: "mr-farewell",
    label: "Mr. Farewell (Mr. KVS)",
    tagline: "The ultimate gentleman of the outgoing batch",
  },
  {
    id: "miss-farewell",
    label: "Miss Farewell (Miss KVS)",
    tagline: "The icon of grace and spirit in Class XII",
  },
  {
    id: "mr-popular",
    label: "Mr. Popular",
    tagline: "Known and loved across every stream and section",
  },
  {
    id: "miss-popular",
    label: "Miss Popular",
    tagline: "The heartbeat of every corridor and celebration",
  },
  {
    id: "star-performer",
    label: "Star Performer",
    tagline: "Unmatched stage presence, talent, and energy",
  },
] as const;

export type CrownCategoryId = (typeof CROWN_CATEGORIES)[number]["id"];
