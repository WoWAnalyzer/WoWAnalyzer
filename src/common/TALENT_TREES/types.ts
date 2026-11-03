export type TalentTreeNodeType = 'single' | 'choice' | 'tiered';

export interface TalentTreeNode {
  id: number;
  type: TalentTreeNodeType;
  posX: number;
  posY: number;
  maxRanks: number;
  /** Ids of the nodes this node connects down to. */
  next: number[];
  /** Talent entry ids, resolved to talents through `getTalentFromEntry`. */
  entryIds: number[];
  /** Granted without spending a point. */
  freeNode?: boolean;
  /** Hero talent tree this node belongs to. */
  subTreeId?: number;
}

export interface HeroTalentTree {
  id: number;
  name: string;
}

export interface TalentTreeLayout {
  specId: number;
  classNodes: TalentTreeNode[];
  specNodes: TalentTreeNode[];
  heroNodes: TalentTreeNode[];
  heroTrees: HeroTalentTree[];
}
