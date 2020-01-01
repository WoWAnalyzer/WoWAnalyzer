/**
 * Downloads a log for use in testing spec parsers. All the reportdata
 * necessary for loading and parsing is included in the output.
 *
 * This script should be run from the root of the repository.
 *
 * This script will only function of the log has been loaded recently by
 * the API, which can be accomplished by loading up the desired log in
 * the analyzer (either on localhost or on the main site).
 *
 * Note: the <filename> param should not include an extension or
 * directory
 *
 * Usage:
 *  node download-log.js <filename> <log-id> <fight-id> <player-id>
 *
 **/
const argv = require('process').argv;
const fs = require('fs');
const archiver = require('archiver');
const https = require('https');

function requestFight(reportCode, cb) {
  const url = `https://wowanalyzer.com/i/v1/report/fights/${reportCode}?translate=true`;
  console.info(`Requesting fights from: ${url}`);
  https
    .get(url, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk.toString();
      });
      res.on('end', () => cb(JSON.parse(data)));
    })
    .on('error', console.error);
}

function requestCombatants(reportCode, fightId, cb, report) {
  const fight = report.fights.find(({ id }) => id === Number(fightId));
  const url = `https://wowanalyzer.com/i/v1/report/events/${reportCode}?start=${fight.start_time}&end=${fight.end_time}&filter=type%3D%22combatantinfo%22&translate=true`;
  console.info(`Requesting events from: ${url}`);
  https
    .get(url, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk.toString();
      });
      res.on('end', () => cb(report, fight, JSON.parse(data)));
    })
    .on('error', console.error);
}

function requestEvents(reportCode, playerId, cb, report, fight, combatants) {
  const url = `https://wowanalyzer.com/i/v1/report/events/${reportCode}?start=${fight.start_time}&end=${fight.end_time}&actorid=${playerId}&translate=true`;
  https
    .get(url, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk.toString();
      });
      res.on('end', () => cb(report, combatants, JSON.parse(data)));
    })
    .on('error', console.error);
}

function writeLog(
  filename,
  reportCode,
  fightId,
  playerId,
  cb,
  report,
  combatants,
  events,
) {
  const fight = report.fights.find(({ id }) => id === Number(fightId));
  const combatant = combatants.events.find(
    ({ sourceID }) => sourceID === Number(playerId),
  );

  const path = `${filename}.zip`;
  const out = fs.createWriteStream(path);
  const compress = archiver('zip');
  compress.on('warning', err => console.warn(err));
  compress.pipe(out);

  compress.append(JSON.stringify(report), { name: 'report.json' });
  compress.append(JSON.stringify(combatants.events), {
    name: 'combatants.json',
  });
  compress.append(JSON.stringify(events.events), { name: 'events.json' });
  compress.append(
    JSON.stringify({
      reportCode,
      fight: {
        id: Number(fightId),
        name: fight.name,
      },
      player: {
        id: Number(playerId),
        name: combatant.name,
        specID: combatant.specID,
      },
    }),
    { name: 'meta.json' },
  );

  out.on('end', () => cb(path));
  compress.finalize();
}

const [filename, reportCode, fightId, playerId] = argv.slice(2, argv.length);

requestFight(
  reportCode,
  requestCombatants.bind(
    null,
    reportCode,
    fightId,
    requestEvents.bind(
      null,
      reportCode,
      playerId,
      writeLog.bind(null, filename, reportCode, fightId, playerId, path =>
        console.log(
          `Wrote ${path}. Please move it to your spec directory/integrationTests.`,
        ),
      ),
    ),
  ),
);
