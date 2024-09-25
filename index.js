const log = require('signale').scope('Core');
const Mail = require('./mail');
const http = require('http');
const assign = require('assign-deep');
const fs = require('fs');
const moment = require('moment');

const VERSION = require('./package.json').version;
const sessionFile = 'session.txt';

let config = {
  secretPath: 'b50ff165-effa-45d6-b24b-6ff06a03e846',
  username: '',
  password: '',
  localUser: true,
  mailDir: '',

  host: 'localhost',
  port: 993,
  tls: true,
  secure: false,
  keepalive: false,
  label: 'INBOX',

  markSeen: false,
  waitForId: 300,
  maxWaitForSession: 3,

  httpHost: 'localhost',
  httpPort: 8200,

  geocoderStreet: 'ul.',
};

log.info(`Starting garmin-livetrack-to-json v${VERSION}`);

try {
  assign(config, require('./config.js'));
} catch (e) {
  log.warn(
    'You should create an config.js file based on the config.template.js template to overwrite the default values'
  );
}

const fetchData = async (id, token, res) => {
  const url = `https://livetrack.garmin.com/services/session/${id}/trackpoints?requestTime=${Date.now()}`;
  log.info(`Fetching ${url}`);
  const response = await fetch(url);

  if (response.status !== 200) {
    log.warn(
      "Invalid response received - The previous link may have expired and the new one hasn't been delivered yet?"
    );
    dataText = await response.text();
    log.warn(`response: ${dataText}`);
    return;
  }

  log.info('Saving data to object');
  sessionData = await response.json();
  log.info('Got data, writing response');

  res.writeHead(200, { 'Content-Type': 'application/json' });
  finished = true;
  fetchedData =
    typeof sessionData !== 'undefined' &&
    typeof sessionData.trackPoints !== 'undefined' &&
    sessionData.trackPoints.length > 0 &&
    typeof sessionData.trackPoints[sessionData.trackPoints.length - 1]
      .fitnessPointData !== 'undefined';
  if (fetchedData) {
    log.info('Data is fetched. Activity status check');
    finished =
      sessionData.trackPoints[sessionData.trackPoints.length - 1]
        .fitnessPointData.eventTypes[1] === 'END';
    log.info(finished ? 'Activity is FINISHED' : 'Activity is ONGOING');
    log.info('Getting last position reverse geocode address');
    const lastPosition =
      sessionData.trackPoints[sessionData.trackPoints.length - 1].position;
    log.info(
      'Latitude: ' + lastPosition.lat + ' Longitude:' + lastPosition.lon
    );
    let city = '';
    let streetName = '';
    let streetNumber = '';
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lastPosition.lat}&lon=${lastPosition.lon}&format=json&addressdetails=1`
      );
      const reverse = await response.json();
      city = typeof reverse.address.village !== 'undefined'
        ? reverse.address.village
        : reverse.address.city;
      streetName = reverse.address.road;
      streetNumber = reverse.address.house_number;
      log.info(`Geocoder reverse data: ${city} ${streetName} ${streetNumber}`);
    } catch (e) {
      log.warn('There was problem with getting reverse geocoded address', e);
    }
    const sessionDataWithUrl = {
      ...{
        sessionUrl: `https://livetrack.garmin.com/session/${id}/token/${token}`,
        positionAddress: `${city ? `${city}` : ''}${
          streetName ? `, ${config.geocoderStreet} ${streetName}` : ''
        }${streetName && streetNumber ? ` ${streetNumber}` : ''}`,
      },
      ...sessionData,
    };
    log.info('Writing session data as response');
    res.write(JSON.stringify(sessionDataWithUrl));
  } else {
    log.info('Data is empty so empty response');
    log.info(sessionData);
    res.write('{}');
  }
  res.end();
  log.info('Waiting for next request...');
};

const mail = new Mail(config);
let finished = false;
let fetchedData = false;
let sessionData = undefined;

const requestListener = async (req, res) => {
  if (req.url === `/${config.secretPath}`) {
    log.info();
    if (!res) {
      log.error('Passed empty response to listener');
    }
    log.info(`New request from client to valid secret url path`);
    log.info(`Checking ${config.mailDir} modification date`);
    const mailDirModifTime = fs.statSync(config.mailDir).mtime;
    const diffMinutes = Math.round(
      moment.duration(moment().diff(mailDirModifTime)).asMinutes()
    );
    log.info(
      `Dir modified ${diffMinutes} min. ago: ${moment(mailDirModifTime).format(
        'YYYY-MM-DD HH:mm:ss'
      )}`
    );
    if (
      !config.localUser ||
      (config.localUser && diffMinutes < config.maxWaitForSession)
    ) {
      log.info('Checking email for new session');
      try {
        mail.connect();
      } catch (error) {
        log.error(`Connection error: ${error}`);
        mail._imap.end();
      }

      let waitCount = 0;
      const timer = setInterval(() => {
        if (!mail.sessionInfo.Id || !mail.sessionInfo.Token) {
          log.info('Waiting for session info...');
          waitCount++;
          if (waitCount >= config.maxWaitForSession) {
            log.info(`Session not found in ${waitCount} attemps`);
            waitCount = 0;
            clearInterval(timer);
            log.info('Waiting for next request...');
            res.write('{}');
            res.end();
            return;
          }
        } else {
          clearInterval(timer);
          log.info('Found Garmin session, saving to file');
          try {
            fs.writeFileSync(
              sessionFile,
              `${moment().format('L')}|${mail.sessionInfo.Id}|${
                mail.sessionInfo.Token
              }`
            );
          } catch (err) {
            log.error(err);
            return;
          }
          return;
        }
      }, config.waitForId);
    } else {
      log.info('Today there is no new mail so no need to connect');
    }
    if (fs.existsSync(sessionFile)) {
      log.info(`Getting session data from sessionFile ${sessionFile}`);
      try {
        const sessionSave = fs.readFileSync(sessionFile, {
          encoding: 'utf8',
          flag: 'r',
        });
        const sessionDate = sessionSave.split('|')[0];
        const sessionId = sessionSave.split('|')[1];
        const sessionToken = sessionSave.split('|')[2];
        if (sessionDate === moment().format('L')) {
          log.info('Fetching data cause today session exist');
          try {
            fetchData(sessionId, sessionToken, res);
          } catch (err) {
            log.error(err);
            return;
          }
        } else {
          log.info('Not fetching data cause there is no today session');
          res.write('{}');
          res.end();
        }
      } catch (err) {
        log.error(err);
        return;
      }
    } else {
      log.info(
        `SessionFile ${sessionFile} not exists, no session yet or create empty session file and restart`
      );
    }
  } else {
    res.end();
  }
};

const httpServer = http.createServer(requestListener);
httpServer.listen(config.httpPort, config.httpHost, () => {
  log.info(`Server is running on http://${config.httpHost}:${config.httpPort}`);
});
