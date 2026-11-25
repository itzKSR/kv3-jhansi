export const SCHOOL_NAME = "PM SHRI Kendriya Vidyalaya No. 3, Jhansi";
export const EVENT_TITLE = "Class XII Farewell Gala";

export const STREAMS = [
  "Science (PCM)",
  "Science (PCB)",
  "Commerce",
  "Humanities",
] as const;

export const CROWN_CATEGORIES = [
  {
    id: "mr-farewell",
    label: "Mr. Farewell",
    tagline: "The standout gentleman of Class XII",
  },
  {
    id: "miss-farewell",
    label: "Miss Farewell",
    tagline: "The icon of grace and spirit in Class XII",
  },
] as const;

export type CrownCategoryId = (typeof CROWN_CATEGORIES)[number]["id"];

/**
 * Replace these placeholder names with your final shortlisted candidates
 * before deploying. Adding them here updates the voting dropdown automatically.
 */
export const CANDIDATES_BY_CROWN: Record<CrownCategoryId, readonly string[]> = {
  "mr-farewell": [
    "Aarav Sharma",
    "Rohan Verma",
    "Kabir Singh",
    "Vivaan Patel",
  ],
  "miss-farewell": [
    "Ananya Mishra",
    "Diya Tiwari",
    "Ishita Gupta",
    "Meera Chauhan",
  ],
};
