import { isDarwin } from "../constants";
import { t } from "../i18n";
import type { SubtypeOf } from "../utility-types";
import { getShortcutKey } from "../utils";
import type { ActionName } from "./types";

export type ShortcutName =
  | SubtypeOf<
      ActionName,
      | "toggleTheme"
      | "loadScene"
      | "clearCanvas"
      | "cut"
      | "copy"
      | "paste"
      | "copyStyles"
      | "pasteStyles"
      | "selectAll"
      | "deleteSelectedElements"
      | "duplicateSelection"
      | "sendBackward"
      | "bringForward"
      | "sendToBack"
      | "bringToFront"
      | "group"
      | "ungroup"
      | "gridMode"
      | "zenMode"
      | "stats"
      | "addToLibrary"
      | "viewMode"
      | "flipHorizontal"
      | "flipVertical"
      | "toggleElementLock"
      | "resetZoom"
      | "zoomOut"
      | "zoomIn"
      | "zoomToFit"
      | "zoomToFitSelectionInViewport"
      | "zoomToFitSelection"
      | "toggleEraserTool"
      | "toggleHandTool"
      | "setFrameAsActiveTool"
      | "saveFileToDisk"
      | "saveToActiveFile"
      | "toggleShortcuts"
      | "wrapSelectionInFrame"
    >
  | "saveScene"
  | "imageExport"
  | "searchMenu";

const shortcutMap: Record<ShortcutName, string[]> = {
  toggleTheme: [getShortcutKey("Shift+Alt+D")],
  saveScene: [getShortcutKey("CtrlOrCmd+S")],
  loadScene: [getShortcutKey("CtrlOrCmd+O")],
  clearCanvas: [getShortcutKey("CtrlOrCmd+Delete")],
  imageExport: [getShortcutKey("CtrlOrCmd+Shift+E")],
  cut: [getShortcutKey("CtrlOrCmd+X")],
  copy: [getShortcutKey("CtrlOrCmd+C")],
  paste: [getShortcutKey("CtrlOrCmd+V")],
  copyStyles: [getShortcutKey("CtrlOrCmd+Alt+C")],
  pasteStyles: [getShortcutKey("CtrlOrCmd+Alt+V")],
  selectAll: [getShortcutKey("CtrlOrCmd+A")],
  deleteSelectedElements: [getShortcutKey("Delete")],
  duplicateSelection: [
    getShortcutKey("CtrlOrCmd+D"),
    getShortcutKey(`Alt+${t("helpDialog.drag")}`),
  ],
  sendBackward: [getShortcutKey("CtrlOrCmd+[")],
  bringForward: [getShortcutKey("CtrlOrCmd+]")],
  sendToBack: [
    isDarwin
      ? getShortcutKey("CtrlOrCmd+Alt+[")
      : getShortcutKey("CtrlOrCmd+Shift+["),
  ],
  bringToFront: [
    isDarwin
      ? getShortcutKey("CtrlOrCmd+Alt+]")
      : getShortcutKey("CtrlOrCmd+Shift+]"),
  ],
  group: [getShortcutKey("CtrlOrCmd+G")],
  ungroup: [getShortcutKey("CtrlOrCmd+Shift+G")],
  gridMode: [getShortcutKey("CtrlOrCmd+'")],
  zenMode: [getShortcutKey("Alt+Z")],
  stats: [getShortcutKey("Alt+/")],
  addToLibrary: [],
  flipHorizontal: [getShortcutKey("Shift+H")],
  flipVertical: [getShortcutKey("Shift+V")],
  viewMode: [getShortcutKey("Alt+R")],
  toggleElementLock: [getShortcutKey("CtrlOrCmd+Shift+L")],
  resetZoom: [getShortcutKey("CtrlOrCmd+0")],
  zoomOut: [getShortcutKey("CtrlOrCmd+-")],
  zoomIn: [getShortcutKey("CtrlOrCmd++")],
  zoomToFitSelection: [getShortcutKey("Shift+3")],
  zoomToFit: [getShortcutKey("Shift+1")],
  zoomToFitSelectionInViewport: [getShortcutKey("Shift+2")],
  toggleEraserTool: [getShortcutKey("E")],
  toggleHandTool: [getShortcutKey("H")],
  setFrameAsActiveTool: [getShortcutKey("F")],
  saveFileToDisk: [getShortcutKey("CtrlOrCmd+S")],
  saveToActiveFile: [getShortcutKey("CtrlOrCmd+S")],
  toggleShortcuts: [getShortcutKey("?")],
  searchMenu: [getShortcutKey("CtrlOrCmd+F")],
  wrapSelectionInFrame: [],
};

export const getShortcutFromShortcutName = (name: ShortcutName, idx = 0) => {
  const shortcuts = shortcutMap[name];
  // if multiple shortcuts available, take the first one
  return shortcuts && shortcuts.length > 0
    ? shortcuts[idx] || shortcuts[0]
    : "";
};
