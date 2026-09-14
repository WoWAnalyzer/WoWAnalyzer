import { SpellIcon } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import cssComponent from 'interface/utils/css-component';
import styles from './DisintegrateCastAnalysis.module.scss';
import { CancelIcon, CutoffIcon, LinkIcon } from 'interface/icons';
import { qualitativePerformanceToColor } from 'interface/guide';
import { CSSProperties, JSX } from 'react';

export enum ChainClipStatus {
  Chained,
  Clipped,
  Cancelled,
  Casted,
}

export interface DisintegrateCast {
  preceedingCast?: number;
  cast: number;
  followingCast?: number;
  dragonRageActive: boolean;
  chainClipStatus: ChainClipStatus;
  performance: QualitativePerformance;
}

interface DisintegrateCastProps {
  cast: DisintegrateCast;
}

function DragonrageSpell({
  dragonRageActive,
  children,
}: {
  dragonRageActive: boolean;
  children: JSX.Element;
}) {
  return dragonRageActive ? <DragonrageBorder>{children}</DragonrageBorder> : <>{children}</>;
}

export function DisintegrateCastAnalysis({ cast }: DisintegrateCastProps) {
  const spellCSS: CSSProperties = {
    height: '4em',
    width: '4em',
    marginTop: 0,
    borderRadius: '6px',
  };
  const basicIconCSS = {
    height: '3em',
    width: '3em',
    marginTop: 0,
  };
  const performanceIconCSS = {
    height: '3em',
    width: '3em',
    marginTop: 0,
    color: qualitativePerformanceToColor(cast.performance),
  };

  return (
    <AnalysisContainer>
      <SpellHeader>Preceeding Cast</SpellHeader>
      <SpellHeader></SpellHeader>
      <SpellHeader>Current Cast</SpellHeader>
      <SpellHeader></SpellHeader>
      <SpellHeader>Following Cast</SpellHeader>
      {cast.preceedingCast ? (
        <>
          <SpellIcon spell={cast.preceedingCast} style={spellCSS} />
          <LinkIcon style={basicIconCSS} />
        </>
      ) : (
        <>
          <EmptySpell />
          <div></div>
        </>
      )}
      <div>
        <DragonrageSpell dragonRageActive={cast.dragonRageActive}>
          <SpellIcon spell={cast.cast} style={spellCSS} />
        </DragonrageSpell>
      </div>
      {cast.followingCast ? (
        <>
          {cast.chainClipStatus === ChainClipStatus.Chained ? (
            <LinkIcon style={performanceIconCSS} />
          ) : cast.chainClipStatus === ChainClipStatus.Clipped ? (
            <CutoffIcon style={performanceIconCSS} />
          ) : (
            <div></div>
          )}
          <SpellIcon spell={cast.followingCast} style={spellCSS} />
        </>
      ) : (
        <>
          {cast.chainClipStatus === ChainClipStatus.Chained ? (
            <CancelIcon style={performanceIconCSS} />
          ) : (
            <div></div>
          )}
          <EmptySpell />
        </>
      )}
    </AnalysisContainer>
  );
}

const AnalysisContainer = cssComponent('div', styles.AnalysisContainer, [] as const);

const EmptySpell = cssComponent('div', styles.EmptySpell, [] as const);

const DragonrageBorder = cssComponent('div', styles.DragonrageBorder, [] as const);

const SpellHeader = cssComponent('span', styles.SpellHeader, [] as const);
