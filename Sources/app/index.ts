import document from "document";
import * as util from "./simple/utils";
import * as font from "./simple/font";
// Display & AOD
import * as simpleDisplay from "./simple/display";

// Simpl activities
import * as simpleActivities from "simple-fitbit-activities";

// import clock from "clock";
import * as simpleMinutes from "./simple/clock-strings";

// Device form screen detection
import { me as device } from "device";

// Elements for style
const _container = document.getElementById("container") as GraphicsElement;
const _background = document.getElementById("background") as RectElement;
const _batteryBackground = document.getElementById("battery-bar-background") as GradientArcElement;

// Date
const _dates1Container = document.getElementById("date1-container") as GraphicsElement;
const _dates1 = _dates1Container.getElementsByTagName("image") as ImageElement[];
const _dates2Container = document.getElementById("date2-container") as GraphicsElement;
const _dates2 = _dates2Container.getElementsByTagName("image") as ImageElement[];

// Hours
const _clocks = document.getElementById("clock-container").getElementsByTagName("image") as ImageElement[];
const _cloksHours = _clocks.slice(0, 2);
const _cloksMinutes = _clocks.slice(3, 5);

// Battery
const _batteryBarContainer = document.getElementById("battery-bar-container") as GraphicsElement;
const _batteryBar = document.getElementById("battery-bar-value") as GradientRectElement;
const _batteriesContainer = document.getElementById("battery-container") as GraphicsElement;
const _batteries = document.getElementById("battery-text").getElementsByTagName("image") as ImageElement[];

// Stats
const _statesContainer = document.getElementById("stats-container") as GraphicsElement;
const _stepsContainer = document.getElementById("steps-container") as GraphicsElement;
const _calsContainer = document.getElementById("cals-container") as GraphicsElement;
const _amContainer = document.getElementById("am-container") as GraphicsElement;
const _distContainer = document.getElementById("dist-container") as GraphicsElement;

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const _iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const _imgHRM = document.getElementById("icon") as ImageElement;
const _hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];

let _lastBpm: number;

// Current settings
const _settings = new Settings();

// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every seconds
simpleMinutes.initialize("seconds", (clock) => {
  const folder: font.folder = simpleDisplay.isInAodMode()
    ? "chars-aod"
    : "chars";

  // Hours
  if (clock.Hours !== undefined) {
    font.print(clock.Hours, _cloksHours, folder);
  }

  // Minutes
  if (clock.Minutes !== undefined) {
    font.print(clock.Minutes, _cloksMinutes, folder);
  }

  // Date 1
  if (clock.Date1 !== undefined) {
    // Position
    _dates1Container.x = (device.screen.width) - (clock.Date1.length * 20);
    // Values
    font.print(clock.Date1, _dates1);
  }

  // Date 2
  if (clock.Date2 !== undefined) {
    // Position
    _dates2Container.x = (device.screen.width) - (clock.Date2.length * 20);
    // Values
    font.print(clock.Date2, _dates2);
  }

  // update od stats
  UpdateActivities();
});

function setHoursMinutes(folder: font.folder) {
  // Hours
  font.print(simpleMinutes.last.Hours + ":" + simpleMinutes.last.Minutes, _clocks, folder);
}
// --------------------------------------------------------------------------------
// Power
// --------------------------------------------------------------------------------
import * as batterySimple from "./simple/battery";

// Method to update battery level informations
batterySimple.initialize((battery) => {
  let batteryString = battery.toString() + "%";
  // Battery text
  font.print(batteryString, _batteries);
  // Battery bar
  _batteryBar.width = Math.floor(battery) * device.screen.width / 100;
});

// --------------------------------------------------------------------------------
// Activity
// --------------------------------------------------------------------------------

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
  UpdateActivity(_amContainer, activities.activeZoneMinutes);
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
  font.print(achievedString, texts);
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
    _imgHRM.href = "images/stat_hr_open_48px.png";
  } else {
    _imgHRM.href = "images/stat_hr_solid_48px.png";
  }

  // Animation
  if (newValue) {
    _iconHRM.animate("highlight");
  }

  // BPM value display
  if (bpm !== _lastBpm) {
    if (bpm > 0) {
      _hrmContainer.style.display = "inline";
      font.print(bpm.toString(), _hrmTexts);
    } else {
      _hrmContainer.style.display = "none";
    }
  }
});

// --------------------------------------------------------------------------------
// Allway On Display
// --------------------------------------------------------------------------------
simpleDisplay.initialize(onEnteredAOD, onLeavedAOD, onDisplayGoOn);

function onEnteredAOD() {
  setHoursMinutes("chars-aod");
  // Stop sensors
  simpleHRM.stop();

  // Hide elements
  _background.style.display = "none";
  _batteryBarContainer.style.display = "none";
  _batteriesContainer.style.display = "none";
  _hrmContainer.style.display = "none";
  _statesContainer.style.display = "none";
}

function onLeavedAOD() {
  setHoursMinutes("chars");

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
}

function onDisplayGoOn() {
  if (batterySimple.isLow()) util.highlight(document.getElementById("battery-symbol") as GraphicsElement);
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
      util.setVisibility(_batteriesContainer,newSettings.showBatteryPourcentage);
    }

    if (newSettings.showBatteryBar !== undefined) {
      util.setVisibility(_batteryBarContainer, newSettings.showBatteryBar);
    }

    if (newSettings.colorBackground !== undefined) {
      util.fill(_background, newSettings.colorBackground);
      _batteryBackground.gradient.colors.c2 = newSettings.colorBackground;
      simpleActivities.reset();//to forceto get new values
      UpdateActivities(); // For achivement color
    }

    if (newSettings.colorForeground !== undefined) {
      util.fill( _container, newSettings.colorForeground);
    }

    // Display based on 12H or 24H format
    if (newSettings.clockDisplay24 !== undefined) {
      simpleMinutes.updateClockDisplay24(newSettings.clockDisplay24);
    }
  });