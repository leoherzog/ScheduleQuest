# 📅 ScheduleQuest

![The ScheduleQuest landing page](https://github.com/leoherzog/ScheduleQuest/blob/main/img/landing.png?raw=true)

## What is this?

 ScheduleQuest is a free, open-source web app to distribute to your recipients for scheduling with your Google Calendar, built on Google Apps Script. The Calendlys/cal.coms/YouCanBook.Mes of the world charge for the features you need, and [Google Calendar's built-in Appointment Scheduling](https://www.wired.com/story/calendly-google-calendar-appointment-schedule/) is a bit limited in customizability.

[![Scheduling a meeting in ScheduleQuest](https://github.com/leoherzog/ScheduleQuest/blob/main/img/scheduling.png?raw=true)](https://script.google.com/macros/s/AKfycbzoPACJV5edaj4BF2hNRR_izwQ7uqsqkFHOX07qZ6XEdWY_SGIGCEk4JIqtFxdB2qvg/exec)

### Features

- 🌐 Create a unique link that others can use to book an appointment on your Google Calendar
- 📑 Offer mulitple types of meetings, each with their own configurable timeframe and event settings
- 📒 Place events on any calendar you have edit access to
- 📆 Confirm availability against multiple calendars
- 🤖 Intelligent suggestion of available free times on both your and (if accessible) the scheduling party's calendar
- 🔗 URL parameters to bring the user to a specific meeting type and prefill their email[<sup>1</sup>](#url-parameters)
- ⚡ Send a webhook push to integrate with [IFTTT](https://ifttt.com/maker_webhooks), [Zapier](https://zapier.com/page/webhooks/), and more when an event is scheduled
- 🌈 Configurable accent color
- 🌙 Automatic light and dark mode
- 💳 No premium tier. 100% free.

<small id="url-parameters">1. For example: `https://script.google.com/macros/s/{ID}/exec?type=sales&email=customer@example.com`</small>

## Setup

Making your own ScheduleQuest page is easy!

1. Create a new [Google Apps Script](https://script.google.com/) project as the user that you want to be invited to newly created events. Give this script a name in the top left (e.g. ScheduleQuest).
2. Click `Services ➕` in the left sidebar, scroll down to and select `Google Calendar API`, and click `Add`.
3. Copy and paste the three files from [the `src` folder](https://github.com/leoherzog/ScheduleQuest/blob/main/src/) in this repository into three files in your Apps Script project named `Code.gs`, `index.html`, `config.html`.
4. Customize the `config.html` file to contain the types of meetings you want to offer. Details are available in [the configuration section below](#configuration).
5. Click `Deploy ⏷` in the top right, then `New Deployment`. Change the `Who Has Access` dropdown to whomever you want to be able to access your scheduling page, then click `Deploy`.

Apps Script will then show you a deployment "Web App" URL that you can copy to the clipboard. This is the link to distribute to your recipients!

### Configuration

```html
<script>
  const meetingTypes = {

     "demo": { // a short unique id used internally for the type of meeting

      // what calendar to put the event on. "primary", or the id of a calendar you have edit access to.
      "scheduleOn": "primary",

      // array of calendar ids to check against for availability
      "busyAgainst": ["primary", "myotheraccount@gmail.com", "example.com_saj4co1nm5kyh8qs440fssktx4@group.calendar.google.com"],

      // the name of the type of meeting that the person will see
      "name": "Product Demo",

      // a font awesome icon for this meeting type
      "icon": "fa-solid fa-calendar-day",

      // array of possible meeting lengths in minutes
      "length": [60],

      // minimum number of minutes from now that the meeting can be scheduled
      "minMinutesFromNow": 240, 

      // maximum number of days from now that the meeting can be scheduled
      "maxDaysFromNow": 90,
      
      // minimum time each day that the meeting can be scheduled
      "timeMin": "09:00",

      // maximum time each day that the meeting can be scheduled
      "timeMax": "17:00",

      // number of seconds between each time option
      "timeStep": 1800,

      // array of days of the week to exclude from scheduling. 0 is Sunday, 6 is Saturday.
      "daysToExclude": [0, 6], 

      // label for the title field
      "titleLabel": "Your Name",

      // the title of the event, with {INPUT} replaced with what the user enters in the title field
      "title": "Sales Demo with {INPUT}",

      // whether the title field is editable
      "titleReadOnly": false,

      // label for the location field
      "locationLabel": "Location",

      // the location of the event, with {INPUT} replaced with what the user enters in the location field
      "location": "Google Meet",

      // whether the location field is editable
      "locationReadOnly": true,

      // whether Google Meet virtual meetings are enabled
      "allowVirtual": true,

      // whether Google Meet virtual meetings are initially enabled
      "preferVirtual": true,

      // label for the description field
      "descriptionLabel": "Description",

      // the description of the event
      "description": "Chatting with you to get to know your needs and to show you our product.", 

      // whether the description field is editable
      "descriptionReadOnly": false,

      // whether to show a field for additional attendees
      "otherguests": true,

      // whether to send an email invitation to the person scheduling the meeting
      "sendEmailInvitation": true,

      // optional webhook url to send a push notification when the meeting is scheduled
      "webhookUrl": null

    },
    ...
  }
</script>
```

#### Advanced

ScheduleQuest is built with the excellent [PicoCSS](https://picocss.org/) framework. It encourages simple and symantic HTML. If you'd like to customize the look and feel of your page, edit the `index.html` file in your Apps Script project with your own classes or style overrides.

Example:

```html
<style>
  :root[data-theme="light"], :root[data-theme="dark"] {
    --primary: #DB4437; /* google red */
    --primary-hover: #BD2E22; /* 10% darker */
    --primary-focus: #BD2E22; 
  }
</style>
```

## About Me

<a href="https://herzog.tech/" target="_blank">
  <img src="https://herzog.tech/signature/link.svg.png" width="32px" />
</a>
<a href="https://twitter.com/xd1936" target="_blank">
  <img src="https://herzog.tech/signature/twitter.svg.png" width="32px" />
</a>
<a href="https://github.com/leoherzog" target="_blank">
  <img src="https://herzog.tech/signature/github.svg.png" width="32px" />
</a>
<a href="https://keybase.io/leoherzog" target="_blank">
  <img src="https://herzog.tech/signature/keybase.svg.png" width="32px" />
</a>
<a href="https://linkedin.com/in/leoherzog" target="_blank">
  <img src="https://herzog.tech/signature/linkedin.svg.png" width="32px" />
</a>
<a href="https://hope.edu/directory/people/herzog-leo/" target="_blank">
  <img src="https://herzog.tech/signature/anchor.svg.png" width="32px" />
</a>
<br />
<a href="https://www.buymeacoffee.com/leoherzog" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/lato-black.png" alt="Buy Me A Coffee" width="217px" />
</a>