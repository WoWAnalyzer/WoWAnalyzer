/**
 * Downloads a log for use in testing spec parsers. All the metadata
 * necessary for loading and parsing is included in the output.
 *
 * This script should be run from the root of the repository.
 *
 * This script will only function of the log has been loaded recently by
 * the API, which can be accomplished by loading up the desired log in
 * the analyzer (either on localhost or on the main site).
 *
 * Usage:
 *  node download-log.js <key> <log-id> <fight-id> <player-id>
 *
 **/
const argv = require('process').argv;
const fs = require('fs');
const archiver = require('archiver');
const https = require('https');

function request_fight(log_id, cb) {
  const fight_url = `https://wowanalyzer.com/api/v1/report/fights/${log_id}?translate=true`;
  https.get(fight_url, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk.toString(); });
    res.on('end', () => cb(JSON.parse(data)));
  }).on('error', console.error);
}

function request_combatants(log_id, fight_id, cb, meta) {
  const fight = meta.fights.find(({id}) => id === Number(fight_id));
  const combatant_info_url = `https://wowanalyzer.com/api/v1/report/events/${log_id}?start=${fight.start_time}&end=${fight.end_time}&filter=type%3D%22combatantinfo%22&translate=true`;
  https.get(combatant_info_url, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk.toString(); });
    res.on('end', () => cb(meta, fight, JSON.parse(data)));
  }).on('error', console.error);
}

function request_events(log_id, player_id, cb, meta, fight, combatants) {
  const log_url = `https://wowanalyzer.com/api/v1/report/events/${log_id}?start=${fight.start_time}&end=${fight.end_time}&actorid=${player_id}&translate=true`;
  https.get(log_url, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk.toString(); });
    res.on('end', () => cb(meta, combatants, JSON.parse(data)));
  }).on('error', console.error);
}

function write_log(key, fight_id, player_id, cb, meta, combatants, events) {
  const path = `test-logs/${key}.zip`;
  const out = fs.createWriteStream(path);
  const compress = archiver('zip');
  compress.on('warning', err => console.warn(err));
  compress.pipe(out);

  compress.append(JSON.stringify(meta), { name: 'meta.json' });
  compress.append(JSON.stringify(combatants.events), { name: 'combatants.json' });
  compress.append(JSON.stringify(events.events), { name: 'events.json' });
  compress.append(JSON.stringify({
    fight_id: Number(fight_id),
    player_id: Number(player_id),
  }), { name: 'content_ids.json' });

  out.on('end', () => cb(path));
  compress.finalize();
}

const [key, log_id, fight_id, player_id]= argv.slice(2, argv.length);

request_fight(log_id, 
  request_combatants.bind(null, log_id, fight_id, 
    request_events.bind(null, log_id, player_id,
      write_log.bind(null, key, fight_id, player_id, (path) => console.log(`wrote ${path}`)))));
