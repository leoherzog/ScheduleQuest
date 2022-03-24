function doGet() {
  return HtmlService.createTemplateFromFile('index.html')
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0')
    .setTitle('Schedule a New Meeting')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getCalendar(id) {
  if (!id) throw 'No ID provided';
  return Calendar.Calendars.get(id);
}

function testScheduleEvent() {
  console.log(JSON.stringify(scheduleEvent('primary', 'name@example.com,blah@example.com', 'Test', 'The Moon', '', '2022-03-21', '16:00', '30', true, true, null)));
}

function scheduleEvent(myId, theirIds, title, location, description, date, time, length, virtual, sendEmailInvitation, webhookUrl) {
  
  eval(getLuxon_());

  let myTimezone = Calendar.Calendars.get(myId).timeZone;
  let start = luxon.DateTime.fromISO(date + 'T' + time + ':00.000').setZone(myTimezone);
  let end = start.plus({"minutes": length});

  console.log(JSON.stringify(Calendar.Calendars.get(myId)));

  let attendees = [];
  attendees.push({"email": Session.getActiveUser().getEmail()});
  attendees = attendees.concat(theirIds.split(',').map(e => ({"email": e})));
  
  let assembledDetails = {
    "summary": title,
    "location": location,
    "description": description,
    "start": {
      "dateTime": start.toISO(),
      "timeZone": myTimezone
    },
    "end": {
      "dateTime": end.toISO(),
      "timeZone": myTimezone
    },
    "attendees": attendees
  };

  if (virtual) {
    assembledDetails['conferenceData'] = {
      "createRequest": {
        "requestId": Math.random().toString(36),
        "conferenceSolutionKey": {
          "type": "hangoutsMeet"
        }
      }
    }
    assembledDetails['location'] = 'Google Meet';
  }

  console.log(JSON.stringify(assembledDetails));

  let event = Calendar.Events.insert(assembledDetails, myId, {"conferenceDataVersion": 1, "sendNotifications": sendEmailInvitation});
  
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'New ScheduleQuest Event', 'Name: ' + event.summary + '\n' + event.htmlLink);

  if (webhookUrl) {
    try {
      UrlFetchApp.fetch(webhookUrl, {
        "method": "post",
        "contentType" : "application/json",
        "payload": JSON.stringify(event)
      });
    }
    catch(e) {
      console.error(e.message);
    }
  }
  
  console.log(JSON.stringify(event));

  checkGithubReleaseVersion_();
  
  return event;
  
}

function testGetAvailability() {
  getAvailability(["primary", "example.com_saj4co1nm5kyh8qs440fssktx4@group.calendar.google.com"], 'name@example.com', '2022-03-21', '09:30', '30', '240', '60');
}

function getAvailability(myIds, theirId, date, time, length, minMinutesFromNow, maxDaysFromNow, daysToExclude) {

  if (!length) throw 'Length is not a valid number';
  if (typeof length !== 'number') {
    length = new Number(length);
    if (!length || Number.isNaN(length)) throw 'Length is not a valid number';
  }

  if (!minMinutesFromNow) throw 'minMinutesFromNow is not a valid number';
  if (typeof minMinutesFromNow !== "number") {
    minMinutesFromNow = new Number(minMinutesFromNow);
    if (!minMinutesFromNow || Number.isNaN(minMinutesFromNow)) throw 'minMinutesFromNow is not a valid number';
  }

  if (!maxDaysFromNow) throw 'maxDaysFromNow is not a valid number';
  if (typeof maxDaysFromNow !== "number") {
    maxDaysFromNow = new Number(maxDaysFromNow);
    if (!maxDaysFromNow || Number.isNaN(maxDaysFromNow)) throw 'maxDaysFromNow is not a valid number';
  }

  eval(getLuxon_());

  let myTimezone = Calendar.Calendars.get(myIds[0]).timeZone;

  let now = luxon.DateTime.now();
  let start = luxon.DateTime.fromISO(date + 'T' + time + ':00.000').setZone(myTimezone);
  let end = start.plus({"minutes": length});

  if (start < now) throw 'Please select a time that\'s in the future';
  if (start < now.plus({"minutes": minMinutesFromNow})) throw 'Please select a time that\'s a bit farther out'; // min minutes from now
  if (end > now.plus({"days": maxDaysFromNow})) throw 'Please select a time that\'s a bit sooner'; // max days from now
  if (daysToExclude.includes(start.weekday === 7 ? 0 : start.weekday)) throw 'Sorry, this calendar doesn\'t take meetings of this type on that day'

  let ids = myIds.map(x => ({"id": x}));
  ids.push({"id": theirId});

  let freeBusy = Calendar.Freebusy.query({
    "timeMin": start.toISO(),
    "timeMax": end.toISO(),
    "timeZone": myTimezone,
    "items": ids
  });

  let theirFreeBusy = freeBusy['calendars'][theirId];
  delete freeBusy['calendars'][theirId];

  console.log('Them: ' + JSON.stringify(theirFreeBusy));
  console.log('Me: ' + JSON.stringify(freeBusy));

  if (Object.keys(freeBusy['calendars']).some(id => freeBusy['calendars'][id]['errors'])) throw 'Error fetching one or more of your calendars'; // can't continue if ours are unfetchable

  let available = {"busy": Object.keys(freeBusy['calendars']).some(id => freeBusy['calendars'][id]['busy'].length)};

  if (theirFreeBusy['errors']) { // might not be able to fetch theirs, and that's okay
    available['guestBusy'] = theirFreeBusy['errors'][0]['reason'];
  } else {
    available['guestBusy'] = !!theirFreeBusy['busy'].length;
  }

  console.log(JSON.stringify(available));

  return available;

}

function testGetSuggestedTimes() {
  console.log(JSON.stringify(getSuggestedTimes('primary', 'name@example.com', '30', '900', '09:00', '17:00', [0, 6], '240', '60'), null, 2))
}

function getSuggestedTimes(myid, theirid, length, step, timeMin, timeMax, daysToExclude, minMinutesFromNow, maxDaysFromNow) {

  if (!theirid || !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(theirid)) throw 'Invalid email'; // emailregex.com

  if (!length) throw 'Length is not a valid number';
  if (typeof length !== "number") {
    length = new Number(length);
    if (!length || Number.isNaN(length)) throw 'Length is not a valid number';
  }

  if (!step) throw 'Step is not a valid number';
  if (typeof step !== "number") {
    step = new Number(step);
    if (!step || Number.isNaN(step)) throw 'Step is not a valid number';
  }

  if (!timeMin) throw 'Invalid timeMin';
  if (!timeMax) throw 'Invalid timeMax';
  if (!daysToExclude || !daysToExclude.length) throw 'Invalid daysToExclude';
  
  if (!minMinutesFromNow) throw 'minMinutesFromNow is not a valid number';
  if (typeof minMinutesFromNow !== "number") {
    minMinutesFromNow = new Number(minMinutesFromNow);
    if (!minMinutesFromNow || Number.isNaN(minMinutesFromNow)) throw 'minMinutesFromNow is not a valid number';
  }

  if (!maxDaysFromNow) throw 'maxDaysFromNow is not a valid number';
  if (typeof maxDaysFromNow !== "number") {
    maxDaysFromNow = new Number(maxDaysFromNow);
    if (!maxDaysFromNow || Number.isNaN(maxDaysFromNow)) throw 'maxDaysFromNow is not a valid number';
  }

  eval(getLuxon_());

  const myTimezone = Calendar.Calendars.get(myid).timeZone;

  let now = luxon.DateTime.now();
  let min = now.plus({"minutes": minMinutesFromNow});
  let max = now.plus({"days": maxDaysFromNow});

  let freeBusy = Calendar.Freebusy.query({
    "timeMin": now.toISO(),
    "timeMax": max.toISO(),
    "timeZone": myTimezone,
    "items": [
      {"id": myid},
      {"id": theirid}
    ]
  });

  if (!freeBusy['calendars'][theirid] || freeBusy['calendars'][theirid]['errors']) throw 'Problem fetching freebusy: ' + JSON.stringify(freeBusy['calendars'][theirid]['errors']);

  let suggestions = [];

  let nextStep = luxon.DateTime.fromSeconds(Math.floor(now.toSeconds() / step) * step); // most recent step

  while (suggestions.length !== 30 && nextStep.diff(max, 'days').toObject().days < 0) { // first 30 suggestions within max

    nextStep = nextStep.plus({"seconds": step});
    let end = nextStep.plus({"minutes": length});

    if (nextStep < min) continue; // min minutes from now
    if (nextStep > max) continue; // max days from now

    if (nextStep < nextStep.set({"hours": timeMin.split(':')[0], "minutes": timeMin.split(':')[1]})) continue; // starts before min time
    if (end > nextStep.set({"hours": timeMax.split(':')[0], "minutes": timeMax.split(':')[1]})) continue; // ends after max time
    if (daysToExclude.includes(nextStep.weekday === 7 ? 0 : nextStep.weekday)) continue; // occurs on day to exclude. luxon sunday is 7, not 0

    let timerange = luxon.Interval.fromDateTimes(nextStep, end);
    if (freeBusy['calendars'][myid]['busy'].some(busy => timerange.overlaps(luxon.Interval.fromISO(busy['start'] + '/' + busy['end'])))) continue; // busy on mine
    if (freeBusy['calendars'][theirid]['busy'].some(busy => timerange.overlaps(luxon.Interval.fromISO(busy['start'] + '/' + busy['end'])))) continue; // busy on theirs
    
    suggestions.push(nextStep);
    
  };

  suggestions = suggestions.map(time => ({
    "value": time.toFormat("yyyy-MM-dd'T'HH:mm"), // a bit unconventional; datetime in local timezone. since this'll only be used internally, it's probably fine.
    "display": time.toLocaleString(luxon.DateTime.DATETIME_SHORT)
  }));

  return suggestions;

}

function testGetRemoteWorkStatus() {
  console.log(getRemoteWorkStatus('primary', '2022-03-23', '09:30', '30'));
}

// unfortunate workaround until we get a google calendar "working locations" api
function getRemoteWorkStatus(id, date, time, length) {

  eval(getLuxon_());

  let myTimezone = Calendar.Calendars.get(id).timeZone;
  let start = luxon.DateTime.fromISO(date + 'T' + time + ':00.000').setZone(myTimezone);
  let end = start.plus({"minutes": length});
  let personalEvents = Calendar.Events.list(id, {
    "timeMin": start.toISO(),
    "timeMax": end.toISO(),
    "singleEvents": true,
    "orderBy": "startTime"
  });

  if (!personalEvents.items || !personalEvents.items.length) return false;

  return personalEvents.items.some(event =>
    event.transparency === 'transparent' && // free event
    (event.summary.toLowerCase().includes('remote') ||
    event.summary.toLowerCase().includes('wfh') ||
    event.summary.toLowerCase().includes('from home') ||
    event.summary.toLowerCase().includes('telecommut') ||
    event.summary.toLowerCase().includes('isolation') ||
    event.summary.toLowerCase().includes('quarantine'))
  );

}

function getLuxon_() {
  let cached = CacheService.getScriptCache().get('luxon');
  if (!cached) {
    console.log('Refreshing Luxon cache...');
    cached = UrlFetchApp.fetch('https://cdn.jsdelivr.net/npm/luxon@2/build/global/luxon.min.js').getContentText();
    CacheService.getScriptCache().put('luxon', cached, 21600);
  }
  return cached;
}

function checkGithubReleaseVersion_() {
  let currentVersion = 'v0.1.1';
  let latestRelease;
  try {
    latestRelease = JSON.parse(UrlFetchApp.fetch('https://api.github.com/repos/leoherzog/ScheduleQuest/releases/latest').getContentText());
  }
  catch(e) {
    console.warn('Problem attempting to check for newer Github version');
    return;
  }
  switch (compareSemver_(currentVersion, latestRelease.name)) {
    case 0:
      // console.info('ScheduleQuest is up-to-date');
      break;
    case -1:
      console.warn('New version of ScheduleQuest is available! Download at https://github.com/leoherzog/ScheduleQuest/releases');
      MailApp.sendEmail(Session.getActiveUser().getEmail(), 'Newer ScheduleQuest Available', 'You\'re using ScheduleQuest at https://script.google.com/home/projects/' + ScriptApp.getScriptId() + '/edit. That\'s awesome! Just wanted to let you know that version' + latestRelease.name + ' is now available, and you\'re currently using ' + currentVersion + '. Get the new version at https://github.com/leoherzog/ScheduleQuest/releases');
      break;
    case 1:
      console.error('Local ScheduleQuest version (' + currentVersion + ') is newer than current release on Github?');
      break;
  }
}

// https://github.com/substack/semver-compare
function compareSemver_(a, b) {
  var pa = a.split('.');
  var pb = b.split('.');
  for (var i = 0; i < 3; i++) {
    var na = Number(pa[i]);
    var nb = Number(pb[i]);
    if (na > nb) return 1;
    if (nb > na) return -1;
    if (!isNaN(na) && isNaN(nb)) return 1;
    if (isNaN(na) && !isNaN(nb)) return -1;
  }
  return 0;
};