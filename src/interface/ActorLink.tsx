import { HTMLAttributes, JSX, useMemo } from 'react';
import useTooltip from './useTooltip';
import { useReport } from './report/context/ReportContext';
import type Unit from 'parser/core/Unit';
import Icon from './Icon';

type ActorLinkProps = Omit<HTMLAttributes<HTMLAnchorElement>, 'id'> & {
  id: number;
};

export default function ActorLink({
  id,
  children,
  className,
  ...rest
}: ActorLinkProps): JSX.Element | null {
  const { npc: npcTooltip } = useTooltip();
  const { report } = useReport();

  const [actor, isPlayer] = useMemo(() => {
    const player = report.friendlies.find((actor) => actor.id === id);
    if (player) {
      return [player, true];
    }

    return [
      (report.enemies as Unit[])
        .concat(report.enemyPets as Unit[])
        .concat(report.friendlyPets as Unit[])
        .find((actor) => actor.id === id),
      false,
    ];
  }, [id, report]);

  if (!actor) {
    return <>Unknown</>;
  }

  if (isPlayer) {
    // we manually set up the icon because we need to use the `/specs/` folder
    return (
      <span className={actor.type} {...rest}>
        <img src={`/specs/${actor.icon}.jpg`} className={'game icon'} alt={actor.icon} />{' '}
        {children ?? actor.name}
      </span>
    );
  }

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={npcTooltip(actor.guid)}
      className={`${actor.subType} ${className ?? ''}`}
      {...rest}
    >
      <Icon icon={actor.icon} /> {children ?? actor.name}
    </a>
  );
}
