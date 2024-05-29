import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

interface RawRunesReady {
  x: number; // timestamp
  y: number; // count
}

export default function RuneCooldownBar({
  timeline,
}: {
  timeline: RawRunesReady[];
}): JSX.Element | null {
  if (timeline.length <= 1) {
    return null;
  }
  const counts = {
    good: 0,
    bad: 0,
    ok: 0,
  };
  for (let i = 1; i < timeline.length; i += 1) {
    const { x: prevTime, y: count } = timeline[i - 1];
    const { x: nextTime } = timeline[i];
    if (nextTime === prevTime) {
      continue;
    }

    counts[key(count)] += nextTime - prevTime;
  }
  return (
    <GradiatedPerformanceBar
      good={{ count: Math.round(counts.good), label: 'Seconds with 3+ Runes Recharging' }}
      bad={{ count: Math.round(counts.bad), label: 'Seconds with 0 or 1 Runes Recharging' }}
      ok={{ count: Math.round(counts.ok), label: 'Seconds with 2 Runes Recharging' }}
    />
  );
}

function key(count: number) {
  if (count <= 3) {
    return 'good';
  } else if (count <= 4) {
    return 'ok';
  } else {
    return 'bad';
  }
}
