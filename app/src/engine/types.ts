// GameState, Move, and related data model types.
// Source of truth: docs/design-spec.md §2. Changing a shape here means updating
// that doc (and, if the change affects game rules, an ADR in memory/decisions.md).
//
// Engine layer: no React, Firebase, or platform API imports allowed here (ADR-004).

export type NodeId = string;
export type PlayerIdx = 0 | 1;

// ============ Board (static data) ============

export interface BoardNode {
  id: NodeId;
  x: number; // 0~1 normalized coordinate (resolution independent)
  y: number;
}

export interface BoardDef {
  id: string; // "h", "star", "hex", "cross"
  name: string;
  version: number; // board definition schema version
  nodes: BoardNode[];
  edges: [NodeId, NodeId][]; // undirected. normalized: a < b
  lockedNodes: NodeId[]; // locked at start, crystal-unlock candidates (RQ-004)
  keyNodes: NodeId[]; // tiebreak nodes
}

// ============ Rule config (balance parameters) ============

export interface RuleConfig {
  stonesPerPlayer: number; // default 5
  crystalPlaceMode: 'place-from-hand' | 'recover-and-place'; // ADR-009
  crystalCost: { place: number; restore: number; unlock: number }; // default 1/2/3
}

// ============ Game state (immutable) ============

export interface GameState {
  board: BoardDef;
  rules: RuleConfig;
  occupancy: Readonly<Record<NodeId, PlayerIdx | null>>;
  sealed: ReadonlySet<NodeId>;
  locked: ReadonlySet<NodeId>; // lockedNodes not yet unlocked
  stonesInHand: readonly [number, number];
  stonesLost: readonly [number, number]; // permanently removed count (recover mode)
  crystals: readonly [number, number];
  turn: PlayerIdx;
  consecutivePasses: number; // 2 -> game ends (RQ-003)
  moveHistory: readonly Move[];
  status: 'playing' | 'ended';
  winner: PlayerIdx | 'draw' | null;
}

// ============ Move ============

export type Move =
  | { kind: 'place'; node: NodeId }
  | { kind: 'crystal-place'; node: NodeId }
  | { kind: 'crystal-restore'; node: NodeId }
  | { kind: 'crystal-unlock'; node: NodeId }
  | { kind: 'pass' };

// ============ Move result ============

export interface MoveResult {
  state: GameState; // new state (immutable)
  captured: NodeId[]; // nodes captured by this move
  crystalsGained: number;
  error?: MoveError; // set only when the move was illegal
}

export type MoveError =
  | 'not-your-turn'
  | 'illegal-node'
  | 'node-not-empty'
  | 'no-stones-in-hand'
  | 'insufficient-crystals'
  | 'node-not-sealed'
  | 'node-not-locked'
  | 'game-ended';
