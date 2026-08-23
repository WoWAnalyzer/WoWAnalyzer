import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { useAnalysisDataSource } from 'report-data/AnalysisDataSourceContext';

type PlayerLinkKind = 'damageDone' | 'healingDone' | 'damageTaken' | 'deaths';

export default function SourceLink({
  children,
  fightId,
  kind,
  playerId,
  ...anchorProps
}: {
  children: ReactNode;
  fightId: number;
  kind: PlayerLinkKind;
  playerId: number;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const source = useAnalysisDataSource();
  const href = source.externalLinks?.[kind](fightId, playerId);
  return href ? (
    <a href={href} {...anchorProps}>
      {children}
    </a>
  ) : (
    children
  );
}
