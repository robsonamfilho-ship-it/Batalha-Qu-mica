
export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  valence: string; // Highest energy subshell (e.g., "2p2")
  row: number;
  col: number;
  category: string;
}

export type PlayerId = 'p1' | 'p2';

export type GameStatus = 
  | 'names'        // Input names
  | 'setup'        // Generation
  | 'p1_reveal'    // Initial reveal P1
  | 'p2_reveal'    // Initial reveal P2
  | 'turn_start'   // "Pass device"
  | 'playing'      // Active turn
  | 'feedback'     // Hit/Miss result screen before passing
  | 'game_over';   // Victory

export interface HiddenTarget {
  id: string;
  element: ElementData;
  isFound: boolean;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  targets: HiddenTarget[]; // The 3 hidden elements
  shots: number[]; // Atomic numbers shot at
  hits: number[]; // Atomic numbers that hit a target
  misses: number[]; // Atomic numbers that missed
  consecutiveMisses: number; // Track errors for hints
  turnCount: number; // Track number of rounds played
  activeHint: string | null; // Persisted hint for this player
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'hit' | 'miss' | 'hint' | 'error';
  player: PlayerId;
}

export interface TurnResult {
  type: 'hit' | 'miss' | 'lost_turn';
  element?: ElementData;
  message: string;
}

export enum ElementCategory {
  Nonmetal = "Nonmetal",
  NobleGas = "Noble Gas",
  AlkaliMetal = "Alkali Metal",
  AlkalineEarthMetal = "Alkaline Earth Metal",
  Metalloid = "Metalloid",
  Halogen = "Halogen",
  PostTransitionMetal = "Post-Transition Metal",
  TransitionMetal = "Transition Metal",
  Lanthanide = "Lanthanide",
  Actinide = "Actinide",
  Unknown = "Unknown"
}
