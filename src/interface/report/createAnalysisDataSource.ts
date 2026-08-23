import { LocalCombatLogDataSource } from 'local/LocalCombatLogDataSource';
import type { AnalysisDataSource } from 'report-data/AnalysisDataSource';
import { WarcraftLogsDataSource } from 'report-data/wcl/WarcraftLogsDataSource';

export function createAnalysisDataSource({
  localReportId,
  reportCode,
}: {
  localReportId?: string;
  reportCode?: string;
}): AnalysisDataSource | null {
  if (localReportId) {
    return new LocalCombatLogDataSource({ kind: 'local', id: localReportId });
  }
  if (reportCode) {
    return new WarcraftLogsDataSource({
      kind: 'warcraft-logs',
      code: reportCode,
      isAnonymous: reportCode.startsWith('a:'),
    });
  }
  return null;
}
