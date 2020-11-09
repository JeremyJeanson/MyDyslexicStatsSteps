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
const _clocks = (document.getElementById("clock-container") as GraphicsElement).getElementsByTagName("image") as ImageElement[];
const _cloksHours = _clocks.slice(0, 2);
const _cloksMinutes = _clocks.slice(3, 5);

// Battery
const _batteryBarContainer = document.getElementById("battery-bar-container") as GraphicsElement;
const _batteryBar = document.getElementById("battery-bar-value") as GradientRectElement;
const _batteriesContainer = document.getElementById("battery-container") as GraphicsElement;
const _batteries = (document.getElementById("battery-text") as GraphicsElement).getElementsByTagName("image") as ImageElement[];

// Stats
const _statesContainer = document.getElementById("stats-container") as GraphicsElement;
const _steps = new ActivitySymbol(document.getElementById("steps") as GraphicsElement, _background);
const _calories = new ActivitySymbol(document.getElementById("calories") as GraphicsElement, _background);
const _activesminutes = new ActivitySymbol(document.getElementById("activesminutes") as GraphicsElement, _background);
const _distance = new ActivitySymbol(document.getElementById("distance") as GraphicsElement, _background);
const _stepsTexts = (document.getElementById("steps-text") as GraphicsElement).getElementsByTagName("image");
const _caloriesTexts = (document.getElementById("calories-text") as GraphicsElement).getElementsByTagName("image");
const _activesminutesTexts = (document.getElementById("activesminutes-text") as GraphicsElement).getElementsByTagName("image");
const _distanceTexts = (document.getElementById("distance-text") as GraphicsElement).getElementsByTagName("image");

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const _iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const _imgHRM = _iconHRM.getElementById("icon") as ImageElement;
const _hrmTexts = (document.getElementById("hrm-text-container") as GraphicsElement).getElementsByTagName("image") as ImageElement[];

let _lastBpm: number;

// Current settings
const _settings = new Settings();

// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every seconds
simpleMinutes.initialize("user", (clock) => {
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
  const batteryString = battery.toString() + "%";
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
  UpdateActivity(activities.steps, _steps, _stepsTexts);
  // Calories
  UpdateActivity(activities.calories, _calories, _caloriesTexts);
  // Active minutes
  UpdateActivity(activities.activeZoneMinutes, _activesminutes, _activesminutesTexts);
  // Disance
  UpdateActivity(activities.distance, _distance, _distanceTexts);
}

function UpdateActivity(activity: simpleActivities.Activity | undefined, symbol: ActivitySymbol, texts: ImageElement[]): void {
  // Check activity
  if (activity === undefined) return;
  // symbol
  symbol.set(activity);

  // Text
  font.print(activity.actual.toString(), texts);
}
// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "simple-fitbit-heartrate";

simpleHRM.initialize((value) => {
  if (value === undefined) return;
  // Zones
  _imgHRM.href = value.zone === "out-of-range"
    ? "images/stat_hr_open_48px.png"
    : "images/stat_hr_solid_48px.png";

  // Animation
  _iconHRM.animate("highlight");

  // BPM value display
  if (value.heartRate !== _lastBpm) {
    font.print(value.heartRate.toString(), _hrmTexts);
    _lastBpm = value.heartRate;
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
import { ActivitySymbol } from './simple/activity-symbol';

appSettings.initialize(
  // Default settings
  _settings,
  // callback when settings changed
  (newSettings: Settings) => {
    if (!newSettings) {
      return;
    }

    if (newSettings.showBatteryPourcentage !== undefined) {
      util.setVisibility(_batteriesContainer, newSettings.showBatteryPourcentage);
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
      util.fill(_container, newSettings.colorForeground);
    }

    // Display based on 12H or 24H format
    if (newSettings.clockFormat !== undefined) {
      simpleMinutes.updateHoursFormat(newSettings.clockFormat.values[0].value as simpleMinutes.HoursFormat);
    }
  });