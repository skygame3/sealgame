import type { BoardDef, NodeId } from '../engine/types';

export type BoardValidationCode =
  | 'missing-id'
  | 'missing-name'
  | 'invalid-version'
  | 'duplicate-node-id'
  | 'invalid-node-coordinate'
  | 'missing-edge-node'
  | 'self-edge'
  | 'unnormalized-edge'
  | 'duplicate-edge'
  | 'disconnected-graph'
  | 'missing-locked-node'
  | 'duplicate-locked-node'
  | 'missing-key-node'
  | 'duplicate-key-node'
  | 'no-capture-path';

export interface BoardValidationIssue {
  code: BoardValidationCode;
  message: string;
}

export interface BoardValidationResult {
  isValid: boolean;
  issues: readonly BoardValidationIssue[];
}

/**
 * Validates the static graph data that defines a board.
 *
 * This function intentionally checks board-content invariants only. It does not apply any
 * game rules or mutate the supplied definition, so board authors can use it in tooling and CI.
 */
export function validateBoard(board: BoardDef): BoardValidationResult {
  const issues: BoardValidationIssue[] = [];
  const addIssue = (code: BoardValidationCode, message: string) => {
    issues.push({ code, message });
  };

  if (board.id.trim().length === 0) {
    addIssue('missing-id', 'Board id must not be empty.');
  }
  if (board.name.trim().length === 0) {
    addIssue('missing-name', 'Board name must not be empty.');
  }
  if (!Number.isInteger(board.version) || board.version < 1) {
    addIssue('invalid-version', 'Board version must be a positive integer.');
  }

  const nodeIds = new Set<NodeId>();
  for (const node of board.nodes) {
    if (nodeIds.has(node.id)) {
      addIssue('duplicate-node-id', `Node id "${node.id}" is duplicated.`);
    }
    nodeIds.add(node.id);

    if (!isNormalizedCoordinate(node.x) || !isNormalizedCoordinate(node.y)) {
      addIssue(
        'invalid-node-coordinate',
        `Node "${node.id}" coordinates must be finite numbers from 0 to 1.`,
      );
    }
  }

  const adjacency = new Map<NodeId, Set<NodeId>>(
    [...nodeIds].map((nodeId) => [nodeId, new Set<NodeId>()]),
  );
  const edgeKeys = new Set<string>();

  for (const [from, to] of board.edges) {
    const hasFrom = nodeIds.has(from);
    const hasTo = nodeIds.has(to);
    if (!hasFrom || !hasTo) {
      addIssue('missing-edge-node', `Edge "${from}"–"${to}" references a missing node.`);
      continue;
    }
    if (from === to) {
      addIssue('self-edge', `Edge "${from}"–"${to}" cannot connect a node to itself.`);
      continue;
    }
    if (from > to) {
      addIssue(
        'unnormalized-edge',
        `Edge "${from}"–"${to}" must be ordered from smaller to larger id.`,
      );
    }

    const edgeKey = from < to ? `${from}\u0000${to}` : `${to}\u0000${from}`;
    if (edgeKeys.has(edgeKey)) {
      addIssue('duplicate-edge', `Edge "${from}"–"${to}" is duplicated.`);
      continue;
    }
    edgeKeys.add(edgeKey);
    adjacency.get(from)?.add(to);
    adjacency.get(to)?.add(from);
  }

  if (!isConnected(nodeIds, adjacency)) {
    addIssue('disconnected-graph', 'All board nodes must form one connected graph.');
  }
  if (![...adjacency.values()].some((neighbors) => neighbors.size >= 2)) {
    addIssue('no-capture-path', 'Board needs at least one three-node path for captures.');
  }

  validateNodeReferences(board.lockedNodes, 'locked', nodeIds, addIssue);
  validateNodeReferences(board.keyNodes, 'key', nodeIds, addIssue);

  return { isValid: issues.length === 0, issues };
}

function isNormalizedCoordinate(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function isConnected(
  nodeIds: ReadonlySet<NodeId>,
  adjacency: ReadonlyMap<NodeId, ReadonlySet<NodeId>>,
): boolean {
  const firstNode = nodeIds.values().next().value as NodeId | undefined;
  if (firstNode === undefined) {
    return false;
  }

  const visited = new Set<NodeId>([firstNode]);
  const pending = [firstNode];
  while (pending.length > 0) {
    const nodeId = pending.pop() as NodeId;
    for (const neighbor of adjacency.get(nodeId) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        pending.push(neighbor);
      }
    }
  }

  return visited.size === nodeIds.size;
}

function validateNodeReferences(
  references: readonly NodeId[],
  referenceType: 'locked' | 'key',
  nodeIds: ReadonlySet<NodeId>,
  addIssue: (code: BoardValidationCode, message: string) => void,
): void {
  const seen = new Set<NodeId>();
  for (const nodeId of references) {
    if (!nodeIds.has(nodeId)) {
      addIssue(
        `missing-${referenceType}-node`,
        `${referenceType} node "${nodeId}" does not exist.`,
      );
    }
    if (seen.has(nodeId)) {
      addIssue(
        `duplicate-${referenceType}-node`,
        `${referenceType} node "${nodeId}" is duplicated.`,
      );
    }
    seen.add(nodeId);
  }
}
