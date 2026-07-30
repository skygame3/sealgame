import { describe, expect, it } from '@jest/globals';

import type { BoardDef } from '../types';

describe('test environment', () => {
  it('type-checks a minimal board definition', () => {
    const board: BoardDef = {
      id: 'test',
      name: 'Test board',
      version: 1,
      nodes: [],
      edges: [],
      lockedNodes: [],
      keyNodes: [],
    };

    expect(board.id).toBe('test');
  });
});
