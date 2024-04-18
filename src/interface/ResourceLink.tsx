import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import * as React from 'react';

import ResourceIcon from './ResourceIcon';
import useTooltip from 'interface/useTooltip';

interface Props {
  id: number;
  children?: React.ReactNode;
  category?: string;
  icon?: boolean;
}

const ResourceLink = ({ icon = true, ...props }: Props) => {
  const { id, children, category = undefined, ...other } = props;
  const { resource: resourceTooltip } = useTooltip();

  if (import.meta.env.DEV && !children && !RESOURCE_TYPES[id]) {
    throw new Error(`Unknown spell: ${id}`);
  }

  return (
    <a
      href={resourceTooltip(id)}
      target="_blank"
      rel="noopener noreferrer"
      className={category}
      {...other}
    >
      {icon && <ResourceIcon id={id} noLink />} {children || RESOURCE_TYPES[id].name}
    </a>
  );
};

export default ResourceLink;
