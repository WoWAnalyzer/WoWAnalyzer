import { Resource } from 'game/RESOURCE_TYPES';

interface Props {
  amount: number;
  wasted?: number;
  approximate?: boolean;
  resourceType: Resource;
}

const ResourceGenerated = ({ amount, wasted, approximate, resourceType }: Props) => {
  return (
    <>
      {approximate && '≈'}
      {amount} {resourceType.name} generated{' '}
      <small>
        {wasted && wasted > 0 && (
          <>
            {approximate && '≈'}
            {wasted} wasted
          </>
        )}
      </small>
    </>
  );
};

export default ResourceGenerated;
