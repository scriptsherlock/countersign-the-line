// The same ranks and milestones as Mission 01. Each shift is one milestone.
const RANKS = [['Recruit', 0], ['Cadet', 1], ['Agent', 3], ['Investigator', 5], ['Senior Investigator', 7], ['Inspector', 10]] as const;

export function rankFor(milestones: number): string {
  let rank: string = 'Recruit';
  for (const [name, at] of RANKS) if (milestones >= at) rank = name;
  return rank;
}

// Mission 01's final field code carries the player's five milestones across. The two games share nothing else.
export const MISSION_01_CODE = 'ZENITH-9X';
export const carriedFrom = (code: string) => (code.trim().toUpperCase() === MISSION_01_CODE ? 5 : 0);
