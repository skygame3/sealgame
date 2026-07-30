import { describe, expect, it } from '@jest/globals';

import type { BoardDef } from '../../engine/types';
import { validateBoard } from '../index';

const validBoard = (): BoardDef => ({
  id: 'test',
  name: 'Test board',
  version: 1,
  nodes: [
    { id: 'a', x: 0, y: 0 },
    { id: 'b', x: 0.5, y: 0.5 },
    { id: 'c', x: 1, y: 1 },
  ],
  edges: [
    ['a', 'b'],
    ['b', 'c'],
  ],
  lockedNodes: [],
  keyNodes: ['b'],
});

describe('validateBoard', () => {
  it('accepts a connected board with a capture path', () => {
    expect(validateBoard(validBoard())).toEqual({ isValid: true, issues: [] });
  });

  it('reports invalid metadata and node definitions', () => {
    const board = validBoard();
    board.id = ' ';
    board.name = '';
    board.version = 0;
    board.nodes = [
      { id: 'a', x: 0, y: 0 },
      { id: 'a', x: Number.NaN, y: 2 },
      { id: 'c', x: 1, y: 1 },
    ];

    expect(validateBoard(board).issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'missing-id',
        'missing-name',
        'invalid-version',
        'duplicate-node-id',
        'invalid-node-coordinate',
      ]),
    );
  });

  it('reports invalid edge references and forms', () => {
    const board = validBoard();
    board.edges = [
      ['a', 'b'],
      ['b', 'c'],
      ['a', 'missing'],
      ['a', 'a'],
      ['c', 'b'],
      ['a', 'b'],
    ];

    expect(validateBoard(board).issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'missing-edge-node',
        'self-edge',
        'unnormalized-edge',
        'duplicate-edge',
      ]),
    );
  });

  it('reports disconnected boards and missing capture paths', () => {
    const board = validBoard();
    board.nodes = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 0.33, y: 0 },
      { id: 'c', x: 0.66, y: 0 },
      { id: 'd', x: 1, y: 0 },
    ];
    board.edges = [
      ['a', 'b'],
      ['c', 'd'],
    ];

    expect(validateBoard(board).issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['disconnected-graph', 'no-capture-path']),
    );
  });

  it('rejects a board without nodes', () => {
    const board = validBoard();
    board.nodes = [];
    board.edges = [];

    expect(validateBoard(board).issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['disconnected-graph', 'no-capture-path']),
    );
  });

  it('reports invalid locked and key node references', () => {
    const board = validBoard();
    board.lockedNodes = ['a', 'a', 'missing'];
    board.keyNodes = ['b', 'b', 'missing'];

    expect(validateBoard(board).issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'duplicate-locked-node',
        'missing-locked-node',
        'duplicate-key-node',
        'missing-key-node',
      ]),
    );
  });
});
