import { Tooltip } from 'interface/index';

/**
 * A slightly more complex form of the Checklist's success meters that allows for more than two outcomes.
 * Not all result types need be included, depending on the bar's context.
 *
 * # Props
 * - `perfect` - The number of flawless executions (or an object with the number plus a tooltip label)
 * - `good` - The number of acceptable executions (or an object with the number plus a tooltip label)
 * - `ok` - The number of suboptimal executions (or an object with the number plus a tooltip label)
 * - `bad` - The number of unacceptable executions (or an object with the number plus a tooltip label)
 */
export default function GradiatedPerformanceBar({
  perfect,
  good,
  ok,
  bad,
}: {
  perfect?: number | GradiatedPerformanceBarInfo;
  good?: number | GradiatedPerformanceBarInfo;
  ok?: number | GradiatedPerformanceBarInfo;
  bad?: number | GradiatedPerformanceBarInfo;
}) {
  const perfectObj = getDefaultInfo(perfect);
  const goodObj = getDefaultInfo(good);
  const okObj = getDefaultInfo(ok);
  const badObj = getDefaultInfo(bad);

  const total = perfectObj.count + goodObj.count + okObj.count + badObj.count;
  return (
    <div className="gradiated-bar-container">
      {perfectObj.count > 0 && (
        <Tooltip
          content={
            <>
              {perfectObj.label && <>{perfectObj.label} - </>}
              <strong>
                {perfectObj.count} / {total}
              </strong>
            </>
          }
        >
          <div
            className="perfect-bar"
            style={{ minWidth: `${(perfectObj.count / total) * 100}%` }}
          />
        </Tooltip>
      )}
      {goodObj.count > 0 && (
        <Tooltip
          content={
            <>
              {goodObj.label && <>{goodObj.label} - </>}
              <strong>
                {goodObj.count} / {total}
              </strong>
            </>
          }
        >
          <div className="good-bar" style={{ minWidth: `${(goodObj.count / total) * 100}%` }} />
        </Tooltip>
      )}
      {okObj.count > 0 && (
        <Tooltip
          content={
            <>
              {okObj.label && <>{okObj.label} - </>}
              <strong>
                {okObj.count} / {total}
              </strong>
            </>
          }
        >
          <div className="ok-bar" style={{ minWidth: `${(okObj.count / total) * 100}%` }} />
        </Tooltip>
      )}
      {badObj.count > 0 && (
        <Tooltip
          content={
            <>
              {badObj.label && <>{badObj.label} - </>}
              <strong>
                {badObj.count} / {total}
              </strong>
            </>
          }
        >
          <div className="bad-bar" style={{ minWidth: `${(badObj.count / total) * 100}%` }} />
        </Tooltip>
      )}
    </div>
  );
}

function getDefaultInfo(val?: number | GradiatedPerformanceBarInfo) {
  if (val === undefined) {
    return { count: 0, label: '' };
  } else if (typeof val === 'number') {
    return { count: val, label: '' };
  } else {
    return val;
  }
}

export type GradiatedPerformanceBarInfo = {
  count: number;
  label: React.ReactNode;
};
