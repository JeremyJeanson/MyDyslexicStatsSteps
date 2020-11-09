import * as simpleSettings from "simple-fitbit-settings/common";
/**
 * Settings of the application
 */
export class Settings {
  clockFormat: simpleSettings.Selection = { selected: [0], values: [{ name: "user", value: "user" }] };
  showBatteryPourcentage = true;
  showBatteryBar = true;
  colorBackground = "black";
  colorForeground = "white";
}