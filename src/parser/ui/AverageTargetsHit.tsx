interface Props {
  casts: number;
  hits: number;
  unique?: boolean;
  approximate?: boolean;
}

const AverageTargetsHit = ({ casts, hits, unique, approximate }: Props) => {
  const averageHits = hits / casts || 0;
  return (
    <>
      {approximate && '≈'}
      {averageHits.toFixed(1)}{' '}
      <small>
        {' '}
        {unique ? 'unique targets hit' : 'average'}{' '}
        {unique ? '' : averageHits === 1 ? 'hit' : 'hits'} per cast
      </small>
    </>
  );
};

export default AverageTargetsHit;
