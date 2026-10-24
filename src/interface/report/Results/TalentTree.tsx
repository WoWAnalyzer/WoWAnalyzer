import { i18n } from '@lingui/core';
import getTalentFromEntry from 'common/TALENTS/getTalentFromEntry';
import { TalentTreeLayout, TalentTreeNode } from 'common/TALENT_TREES/types';
import SPECS from 'game/SPECS';
import Icon from 'interface/Icon';
import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';
import { TalentEntry } from 'parser/core/Events';

import styles from './TalentTree.module.scss';

/** Distance between adjacent node centers in the layout coordinates. */
const NODE_SPACING = 600;
const NODE_SIZE = 420;
/** Icon size in em, matching the most used trinkets list. */
const NODE_SIZE_EM = 2;
const PADDING = NODE_SPACING / 2;
const FALLBACK_ICON = 'inv_misc_questionmark';

interface Props {
  layout: TalentTreeLayout;
  talents: TalentEntry[];
}

interface NodeSelection {
  rank: number;
  entryId?: number;
}

const nodeSelection = (
  node: TalentTreeNode,
  talentsByNode: Map<number, TalentEntry[]>,
): NodeSelection => {
  const talents = talentsByNode.get(node.id);
  if (talents) {
    // apex nodes have one entry per tier; the last chosen tier draws the node
    const entryId = node.entryIds.findLast((id) => talents.some((talent) => talent.id === id));
    return { rank: talents.reduce((sum, talent) => sum + talent.rank, 0), entryId };
  }
  return { rank: node.freeNode ? node.maxRanks : 0 };
};

const TalentEntryIcon = ({ entryId, rank }: { entryId: number; rank?: number }) => {
  const talent = getTalentFromEntry({ id: entryId });
  if (!talent) {
    return <Icon icon={FALLBACK_ICON} className={styles.Icon} />;
  }
  return (
    <SpellLink spell={talent} rank={rank} icon={false}>
      <SpellIcon spell={talent} noLink className={styles.Icon} />
    </SpellLink>
  );
};

const TalentNodeIcon = ({
  node,
  selection,
}: {
  node: TalentTreeNode;
  selection: NodeSelection;
}) => {
  const chosenEntryId =
    selection.entryId !== undefined && node.entryIds.includes(selection.entryId)
      ? selection.entryId
      : undefined;

  if (node.type === 'choice' && chosenEntryId === undefined) {
    return (
      <>
        {node.entryIds.map((entryId) => (
          <div key={entryId} className={styles.ChoiceHalf}>
            <TalentEntryIcon entryId={entryId} />
          </div>
        ))}
      </>
    );
  }

  return (
    <TalentEntryIcon
      entryId={chosenEntryId ?? node.entryIds[0]}
      rank={selection.rank > 0 ? selection.rank : undefined}
    />
  );
};

const TalentTreeSection = ({
  label,
  nodes,
  talentsByNode,
}: {
  label: string;
  nodes: TalentTreeNode[];
  talentsByNode: Map<number, TalentEntry[]>;
}) => {
  const minX = Math.min(...nodes.map((node) => node.posX));
  const minY = Math.min(...nodes.map((node) => node.posY));
  const width = Math.max(...nodes.map((node) => node.posX)) - minX + 2 * PADDING;
  const height = Math.max(...nodes.map((node) => node.posY)) - minY + 2 * PADDING;
  const x = (node: TalentTreeNode) => node.posX - minX + PADDING;
  const y = (node: TalentTreeNode) => node.posY - minY + PADDING;

  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const selections = new Map(nodes.map((node) => [node.id, nodeSelection(node, talentsByNode)]));

  return (
    <div className={styles.Section}>
      <div className={styles.SectionLabel}>{label}</div>
      <div
        className={styles.Tree}
        style={{
          width: `${(width / NODE_SIZE) * NODE_SIZE_EM}em`,
          aspectRatio: `${width} / ${height}`,
        }}
      >
        <svg className={styles.Edges} viewBox={`0 0 ${width} ${height}`}>
          {nodes.flatMap((node) =>
            node.next.map((nextId) => {
              const next = nodesById.get(nextId)!;
              const selected =
                selections.get(node.id)!.rank > 0 && selections.get(nextId)!.rank > 0;
              return (
                <line
                  key={`${node.id}-${nextId}`}
                  x1={x(node)}
                  y1={y(node)}
                  x2={x(next)}
                  y2={y(next)}
                  className={selected ? styles.EdgeSelected : styles.Edge}
                />
              );
            }),
          )}
        </svg>
        {nodes.map((node) => {
          const selection = selections.get(node.id)!;
          const state =
            selection.rank === 0
              ? styles.Unselected
              : selection.rank < node.maxRanks
                ? styles.Partial
                : styles.Selected;
          return (
            <div
              key={node.id}
              className={`${styles.Node} ${styles[node.type]} ${state}`}
              style={{
                left: `${(x(node) / width) * 100}%`,
                top: `${(y(node) / height) * 100}%`,
                width: `${(NODE_SIZE / width) * 100}%`,
              }}
            >
              <div className={styles.Frame}>
                <div className={styles.Face}>
                  <TalentNodeIcon node={node} selection={selection} />
                </div>
              </div>
              {node.maxRanks > 1 && (
                <span className={styles.Rank}>
                  {selection.rank}/{node.maxRanks}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TalentTree = ({ layout, talents }: Props) => {
  const spec = SPECS[layout.specId];
  const talentsByNode = Map.groupBy(talents, (talent) => talent.nodeID);
  const heroTree = layout.heroTrees.find((tree) =>
    layout.heroNodes.some((node) => node.subTreeId === tree.id && talentsByNode.has(node.id)),
  );
  const heroNodes = heroTree
    ? layout.heroNodes.filter((node) => node.subTreeId === heroTree.id)
    : [];

  const sections = [
    { label: i18n._(spec.className), nodes: layout.classNodes },
    ...(heroTree ? [{ label: heroTree.name, nodes: heroNodes }] : []),
    { label: spec.specName ? i18n._(spec.specName) : '', nodes: layout.specNodes },
  ];

  return (
    <div className={styles.TalentTree}>
      {sections.map(({ label, nodes }) => (
        <TalentTreeSection key={label} label={label} nodes={nodes} talentsByNode={talentsByNode} />
      ))}
    </div>
  );
};

export default TalentTree;
