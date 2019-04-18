import document from "document";
import * as util from "./simple/utils";

// import clock from "clock";
import * as simpleMinutes from "./simple/clock-strings";

// Device form screen detection
import { me as device } from "device";

// Elements for style
const container = document.getElementById("container") as GraphicsElement;
const background = document.getElementById("background") as RectElement;
const batteryBackground = document.getElementById("battery-bar-background") as GradientArcElement;

// Date
const dateContainer = document.getElementById("date-container") as GraphicsElement;
const dates = dateContainer.getElementsByTagName("image") as ImageElement[];

// Hours
const cloks = document.getElementById("clock-container").getElementsByTagName("image") as ImageElement[];

// Battery
const _batteryBarContainer = document.getElementById("battery-bar-container") as GraphicsElement;
const _batteryBar = document.getElementById("battery-bar-value") as GradientRectElement;
const _batteriesContainer = document.getElementById("battery-container") as GraphicsElement;
const _batteries = _batteriesContainer.getElementsByTagName("image") as ImageElement[];

// Stats
// const arcSteps = document.getElementById("arc-steps") as ArcElement;
// const stepsAchivement = document.getElementById("steps-achivement-container") as GraphicsElement;
const stepsContainer = document.getElementById("steps-container") as GraphicsElement;

// Heart rate management
const hrmContainer = document.getElementById("hrm-container") as GroupElement;
const iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const imgHRM = document.getElementById("icon") as ImageElement;
const hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];

// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every seconds
simpleMinutes.initialize("seconds", (hours, mins, date) => {
  // hours="21";
  // mins="38";
  // date = "jan 17";
  // Hours
  if (hours) {
    cloks[0].href = util.getImageFromLeft(hours, 0);
    cloks[1].href = util.getImageFromLeft(hours, 1);
  }

  // Minutes
  if (mins) {
    cloks[3].href = util.getImageFromLeft(mins, 0);
    cloks[4].href = util.getImageFromLeft(mins, 1);
  }

  // Date
  if (date) {
    // Position
    dateContainer.x = (device.screen.width) - (date.length * 20);
    // Values
    for (let i = 0; i < dates.length; i++) {
      dates[i].href = util.getImageFromLeft(date, i);
    }
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
// Settings
// --------------------------------------------------------------------------------
import * as simpleSettings from "./simple/device-settings";

simpleSettings.initialize((settings: any) => {
  if (!settings) {
    return;
  }

  if (settings.showBatteryPourcentage !== undefined) {
    _batteriesContainer.style.display = settings.showBatteryPourcentage === true
      ? "inline"
      : "none";
  }

  if (settings.showBatteryBar !== undefined) {
    _batteryBarContainer.style.display = settings.showBatteryBar === true
      ? "inline"
      : "none";
  }

  if (settings.colorBackground) {
    background.style.fill = settings.colorBackground;
    batteryBackground.gradient.colors.c2 = settings.colorBackground;
    UpdateActivities(); // For achivement color
  }

  if (settings.colorForeground) {
    container.style.fill = settings.colorForeground;
  }
});
// --------------------------------------------------------------------------------
// Activity
// --------------------------------------------------------------------------------
import { goals, today } from "user-activity";
let lastStepsGoals = -1;
let lastSteps = -1;

goals.onreachgoal = (evt) => {
  UpdateActivities();
};

// Update Activities informations
function UpdateActivities() {
  let actualStepsGoals = goals.steps || 0;
  let actualSteps = today.local.steps || 0;
  if (actualSteps != lastSteps
    || actualStepsGoals != lastStepsGoals) {
    UpdateActivity(stepsContainer, actualStepsGoals, actualSteps);
    lastSteps = actualSteps;
    lastStepsGoals = actualStepsGoals;
  }
}

function UpdateActivity(container: GraphicsElement, goal: number, achieved: number): void {
  let achievedString = achieved.toString();
  let containers = container.getElementsByTagName("svg") as GraphicsElement[];

  // Arc
  RenderActivity(containers[0], goal, achieved);

  // Text
  // container.x = device.screen.width / 2 + 20 - (achievedString.toString().length * 20);
  let texts = containers[1].getElementsByTagName("image") as ImageElement[];
  for (let i = 0; i < texts.length; i++) {
    texts[i].href = util.getImageFromLeft(achievedString, i);
  }
}

// Render an activity
function RenderActivity(container: GraphicsElement, goal: number, achieved: number): void {
  let arc = container.getElementsByTagName("arc")[1] as ArcElement; // First Arc is used for background
  let circle = container.getElementsByTagName("circle")[0] as CircleElement;
  let image = container.getElementsByTagName("image")[0] as ImageElement;

  // Goals ok
  if (achieved >= goal) {
    circle.style.display = "inline";
    arc.style.display = "none";
    image.style.fill = background.style.fill;
  }
  else {
    circle.style.display = "none";
    arc.style.display = "inline";
    arc.sweepAngle = util.activityToAngle(goal, achieved);
    if (container.style.fill)
      image.style.fill = container.style.fill;
  }
}
// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "./simple/hrm";
let lastBpm: number;

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
      hrmContainer.style.display = "inline";
      let bpmString = bpm.toString();
      hrmTexts[0].href = util.getImageFromLeft(bpmString, 0);
      hrmTexts[1].href = util.getImageFromLeft(bpmString, 1);
      hrmTexts[2].href = util.getImageFromLeft(bpmString, 2);
    } else {
      hrmContainer.style.display = "none";
    }
  }
});