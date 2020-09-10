import document from "document";
import * as util from "./simple/utils";

// import clock from "clock";
import * as simpleMinutes from "./simple/clock-strings";

// Device form screen detection
import { me as device } from "device";

// Elements for style
const container = document.getElementById("container") as GraphicsElement;
const _background = document.getElementById("background") as RectElement;
const batteryBackground = document.getElementById("battery-bar-background") as GradientArcElement;

// Date
const dates1Container = document.getElementById("date1-container") as GraphicsElement;
const dates1 = dates1Container.getElementsByTagName("image") as ImageElement[];
const dates2Container = document.getElementById("date2-container") as GraphicsElement;
const dates2 = dates2Container.getElementsByTagName("image") as ImageElement[];

// Hours
const cloks = document.getElementById("clock-container").getElementsByTagName("image") as ImageElement[];

// Battery
const _batteryBarContainer = document.getElementById("battery-bar-container") as GraphicsElement;
const _batteryBar = document.getElementById("battery-bar-value") as GradientRectElement;
const _batteriesContainer = document.getElementById("battery-container") as GraphicsElement;
const _batteries = _batteriesContainer.getElementsByTagName("image") as ImageElement[];

// Stats
const _statesContainer = document.getElementById("stats-container") as GraphicsElement;
const _stepsContainer = document.getElementById("steps-container") as GraphicsElement;
const _calsContainer = document.getElementById("cals-container") as GraphicsElement;
const _amContainer = document.getElementById("am-container") as GraphicsElement;
const _distContainer = document.getElementById("dist-container") as GraphicsElement;

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const imgHRM = document.getElementById("icon") as ImageElement;
const hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];

let lastBpm: number;

// Current settings
const _settings = new Settings();

// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every seconds
simpleMinutes.initialize("seconds", (clock) => {
  // hours="21";
  // mins="38";
  // date = "jan 17";
  // Hours
  if (clock.Hours !== undefined) {
    cloks[0].href = util.getImageFromLeft(clock.Hours, 0);
    cloks[1].href = util.getImageFromLeft(clock.Hours, 1);
  }

  // Minutes
  if (clock.Minutes !== undefined) {
    cloks[3].href = util.getImageFromLeft(clock.Minutes, 0);
    cloks[4].href = util.getImageFromLeft(clock.Minutes, 1);
  }

  // Date 1
  if (clock.Date1 !== undefined) {
    // Position
    dates1Container.x = (device.screen.width) - (clock.Date1.length * 20);
    // Values
    util.display(clock.Date1, dates1);
  }

  // Date 2
  if (clock.Date2 !== undefined) {
    // Position
    dates2Container.x = (device.screen.width) - (clock.Date2.length * 20);
    // Values
    util.display(clock.Date2, dates2);
  }

  // update od stats
  UpdateActivities();
});

// --------------------------------------------------------------------------------
// Power
// --------------------------------------------------------------------------------
import * as batterySimple from "./simple/power-battery";

// Method to update battery level informations
batterySimple.initialize((battery) => {
  let batteryString = battery.toString() + "%";
  // Battery bar
  _batteryBar.width = Math.floor(battery) * device.screen.width / 100;

  // Battery text
  let max = _batteries.length - 1;
  for (let i = 0; i < max; i++) {
    _batteries[i + 1].href = util.getImageFromLeft(batteryString, i);
  }
});

// --------------------------------------------------------------------------------
// Activity
// --------------------------------------------------------------------------------
import * as simpleActivities from "simple-fitbit-activities";

// initialize
simpleActivities.initialize(UpdateActivities);

// Update Activities informations
function UpdateActivities() {
  // Get activities
  const activities = simpleActivities.getNewValues();
  // Steps
  UpdateActivity(_stepsContainer, activities.steps);
  // Calories
  UpdateActivity(_calsContainer, activities.calories);
  // Active minutes
  UpdateActivity(_amContainer, activities.activeMinutes);
  // Disance
  UpdateActivity(_distContainer, activities.distance);
}

function UpdateActivity(container: GraphicsElement, activity: simpleActivities.Activity): void {
  // Check activity
  if (activity === undefined) return;
  const achievedString = activity.undefined() ? "?" : activity.actual.toString();
  const containers = container.getElementsByTagName("svg") as GraphicsElement[];

  // Arc
  updateActivityArc(containers[0], activity, _background.style.fill);

  // Text
  // container.x = device.screen.width / 2 + 20 - (achievedString.toString().length * 20);
  let texts = containers[1].getElementsByTagName("image") as ImageElement[];
  util.display(achievedString, texts);
}

// Render an activity to an arc control (with goal render and colors update)
function updateActivityArc(container: GraphicsElement, activity: simpleActivities.Activity, appBackgroundColor: string): void {
  if (container === undefined) return;
  const arc = container.getElementsByTagName("arc")[1] as ArcElement; // First Arc is used for background
  const circle = container.getElementsByTagName("circle")[0] as CircleElement;
  const image = container.getElementsByTagName("image")[0] as ImageElement;

  // Goals ok
  if (activity.goalReached()) {
    circle.style.display = "inline";
    arc.style.display = "none";
    image.style.fill = appBackgroundColor;
  }
  else {
    circle.style.display = "none";
    arc.style.display = "inline";
    arc.sweepAngle = activity.as360Arc(); // util.activityToAngle(activity.goal, activity.actual);
    if (container.style.fill)
      image.style.fill = container.style.fill;
  }
}
// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "./simple/hrm";

simpleHRM.initialize((newValue, bpm, zone, restingHeartRate) => {
  // Zones
  if (zone === "out-of-range") {
    imgHRM.href = "images/stat_hr_open_48px.png";
  } else {
    imgHRM.href = "images/stat_hr_solid_48px.png";
  }

  // Animation
  if (newValue) {
    iconHRM.animate("highlight");
  }

  // BPM value display
  if (bpm !== lastBpm) {
    if (bpm > 0) {
      _hrmContainer.style.display = "inline";
      let bpmString = bpm.toString();
      hrmTexts[0].href = util.getImageFromLeft(bpmString, 0);
      hrmTexts[1].href = util.getImageFromLeft(bpmString, 1);
      hrmTexts[2].href = util.getImageFromLeft(bpmString, 2);
    } else {
      _hrmContainer.style.display = "none";
    }
  }
});

// --------------------------------------------------------------------------------
// Allway On Display
// --------------------------------------------------------------------------------
import { me } from "appbit";
import { display } from "display";
import clock from "clock"

// does the device support AOD, and can I use it?
if (display.aodAvailable && me.permissions.granted("access_aod")) {
  // tell the system we support AOD
  display.aodAllowed = true;

  // respond to display change events
  display.addEventListener("change", () => {
    // Is AOD inactive and the display is on?
    if (!display.aodActive && display.on) {
      clock.granularity = "seconds";

      // Show elements & start sensors
      _background.style.display = "inline";
      if (_settings.showBatteryBar) {
        _batteryBarContainer.style.display = "inline";
      }
      if (_settings.showBatteryPourcentage) {
        _batteriesContainer.style.display = "inline";
      }
      _hrmContainer.style.display = "inline";
      _statesContainer.style.display = "inline";

      // Start sensors
      simpleHRM.start();
    } else {
      clock.granularity = "minutes";

      // Stop sensors
      simpleHRM.stop();

      // Hide elements
      _background.style.display = "none";
      _batteryBarContainer.style.display = "none";
      _batteriesContainer.style.display = "none";
      _hrmContainer.style.display = "none";
      _statesContainer.style.display = "none";
    }
  });
}

// --------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------
import * as appSettings from "simple-fitbit-settings/app";

import { Settings } from "../common/settings";

appSettings.initialize(
  // Default settings
  _settings,
  // callback when settings changed
  (newSettings: Settings) => {
    if (!newSettings) {
      return;
    }

    if (newSettings.showBatteryPourcentage !== undefined) {
      _batteriesContainer.style.display = newSettings.showBatteryPourcentage
        ? "inline"
        : "none";
    }

    if (newSettings.showBatteryBar !== undefined) {
      _batteryBarContainer.style.display = newSettings.showBatteryBar
        ? "inline"
        : "none";
    }

    if (newSettings.colorBackground !== undefined) {
      _background.style.fill = newSettings.colorBackground;
      batteryBackground.gradient.colors.c2 = newSettings.colorBackground;
      simpleActivities.reset();//to forceto get new values
      UpdateActivities(); // For achivement color
    }

    if (newSettings.colorForeground !== undefined) {
      container.style.fill = newSettings.colorForeground;
    }

    // Display based on 12H or 24H format
    if (newSettings.clockDisplay24 !== undefined) {
      simpleMinutes.updateClockDisplay24(newSettings.clockDisplay24);
    }
  });