import type { ActionManager } from "../actions/manager";
import type {
  ExcalidrawElement,
  ExcalidrawElementType,
  NonDeletedElementsMap,
  NonDeletedSceneElementsMap,
} from "../element/types";
import { t } from "../i18n";
import { useDevice } from "./App";
import {
  canChangeRoundness,
  canHaveArrowheads,
  getTargetElements,
  hasBackground,
  hasStrokeStyle,
  hasStrokeWidth,
} from "../scene";
import { SHAPES } from "../shapes";
import type { AppClassProperties, AppProps, UIAppState, Zoom } from "../types";
import { capitalizeString, isTransparent } from "../utils";
import Stack from "./Stack";
import { ToolButton } from "./ToolButton";
import { hasStrokeColor, toolIsArrow } from "../scene/comparisons";
import { trackEvent } from "../analytics";
import {
  isElbowArrow,
  isImageElement,
  isLinearElement,
  isTextElement,
} from "../element/typeChecks";
import clsx from "clsx";
import { actionToggleZenMode } from "../actions";
import { Tooltip } from "./Tooltip";
import {
  shouldAllowVerticalAlign,
  suppportsHorizontalAlign,
} from "../element/textElement";

import "./Actions.scss";
import { CLASSES } from "../constants";
import { laserPointerToolIcon } from "./icons";

export const canChangeStrokeColor = (
  appState: UIAppState,
  targetElements: ExcalidrawElement[],
) => {
  let commonSelectedType: ExcalidrawElementType | null =
    targetElements[0]?.type || null;

  for (const element of targetElements) {
    if (element.type !== commonSelectedType) {
      commonSelectedType = null;
      break;
    }
  }

  return (
    (hasStrokeColor(appState.activeTool.type) &&
      commonSelectedType !== "image" &&
      commonSelectedType !== "frame" &&
      commonSelectedType !== "magicframe") ||
    targetElements.some((element) => hasStrokeColor(element.type))
  );
};

export const canChangeBackgroundColor = (
  appState: UIAppState,
  targetElements: ExcalidrawElement[],
) => {
  return (
    hasBackground(appState.activeTool.type) ||
    targetElements.some((element) => hasBackground(element.type))
  );
};

export const SelectedShapeActions = ({
  appState,
  elementsMap,
  renderAction,
  app,
}: {
  appState: UIAppState;
  elementsMap: NonDeletedElementsMap | NonDeletedSceneElementsMap;
  renderAction: ActionManager["renderAction"];
  app: AppClassProperties;
}) => {
  const targetElements = getTargetElements(elementsMap, appState);

  const isEditingTextOrNewElement = Boolean(
    appState.editingTextElement || appState.newElement,
  );
  const device = useDevice();

  const showFillIcons =
    (hasBackground(appState.activeTool.type) &&
      !isTransparent(appState.currentItemBackgroundColor)) ||
    targetElements.some(
      (element) =>
        hasBackground(element.type) && !isTransparent(element.backgroundColor),
    );

  const showLineEditorAction =
    !appState.editingLinearElement &&
    targetElements.length === 1 &&
    isLinearElement(targetElements[0]) &&
    !isElbowArrow(targetElements[0]);

  const showCropEditorAction =
    !appState.croppingElementId &&
    targetElements.length === 1 &&
    isImageElement(targetElements[0]);

  return (
    <div className="panelColumn">
      <div>
        {canChangeStrokeColor(appState, targetElements) &&
          renderAction("changeStrokeColor")}
      </div>
      {canChangeBackgroundColor(appState, targetElements) && (
        <div>{renderAction("changeBackgroundColor")}</div>
      )}
      {showFillIcons && renderAction("changeFillStyle")}

      {(hasStrokeWidth(appState.activeTool.type) ||
        targetElements.some((element) => hasStrokeWidth(element.type))) &&
        renderAction("changeStrokeWidth")}

      {(appState.activeTool.type === "freedraw" ||
        targetElements.some((element) => element.type === "freedraw")) &&
        renderAction("changeStrokeShape")}

      {(hasStrokeStyle(appState.activeTool.type) ||
        targetElements.some((element) => hasStrokeStyle(element.type))) && (
        <>
          {renderAction("changeStrokeStyle")}
          {renderAction("changeSloppiness")}
        </>
      )}

      {(canChangeRoundness(appState.activeTool.type) ||
        targetElements.some((element) => canChangeRoundness(element.type))) && (
        <>{renderAction("changeRoundness")}</>
      )}

      {(toolIsArrow(appState.activeTool.type) ||
        targetElements.some((element) => toolIsArrow(element.type))) && (
        <>{renderAction("changeArrowType")}</>
      )}

      {(appState.activeTool.type === "text" ||
        targetElements.some(isTextElement)) && (
        <>
          {renderAction("changeFontFamily")}
          {renderAction("changeFontSize")}
          {(appState.activeTool.type === "text" ||
            suppportsHorizontalAlign(targetElements, elementsMap)) &&
            renderAction("changeTextAlign")}
        </>
      )}

      {shouldAllowVerticalAlign(targetElements, elementsMap) &&
        renderAction("changeVerticalAlign")}
      {(canHaveArrowheads(appState.activeTool.type) ||
        targetElements.some((element) => canHaveArrowheads(element.type))) && (
        <>{renderAction("changeArrowhead")}</>
      )}

      {renderAction("changeOpacity")}

      {!isEditingTextOrNewElement && targetElements.length > 0 && (
        <fieldset>
          <legend>{t("labels.actions")}</legend>
          <div className="buttonList">
            {!device.editor.isMobile && renderAction("duplicateSelection")}
            {!device.editor.isMobile && renderAction("deleteSelectedElements")}
            {renderAction("group")}
            {renderAction("ungroup")}
            {showCropEditorAction && renderAction("cropEditor")}
            {showLineEditorAction && renderAction("toggleLinearEditor")}
          </div>
        </fieldset>
      )}
    </div>
  );
};

export const ShapesSwitcher = ({
  activeTool,
  appState,
  app,
  UIOptions,
}: {
  activeTool: UIAppState["activeTool"];
  appState: UIAppState;
  app: AppClassProperties;
  UIOptions: AppProps["UIOptions"];
}) => {
  const renderLserToolButton = () => {
    const fillable = false;
    const icon = laserPointerToolIcon;
    const value = "laser";
    const key = "k";
    const numericKey = undefined;

    const label = t(`toolBar.${value}`);
    const letter =
      key && capitalizeString(typeof key === "string" ? key : key[0]);
    const shortcut = letter
      ? `${letter} ${t("helpDialog.or")} ${numericKey}`
      : `${numericKey}`;
    return (
      <ToolButton
        className={clsx("Shape", { fillable })}
        key={value}
        type="radio"
        icon={icon}
        checked={activeTool.type === value}
        name="editor-current-shape"
        title={`${capitalizeString(label)} — ${shortcut}`}
        keyBindingLabel={numericKey || letter}
        aria-label={capitalizeString(label)}
        aria-keyshortcuts={shortcut}
        data-testid={`toolbar-${value}`}
        onPointerDown={({ pointerType }) => {
          if (!appState.penDetected && pointerType === "pen") {
            app.togglePenMode(true);
          }
        }}
        onChange={({ pointerType }) => {
          if (appState.activeTool.type !== value) {
            trackEvent("toolbar", value, "ui");
          }
          app.setActiveTool({ type: value });
        }}
      />
    );
  };
  return (
    <>
      {SHAPES.map(({ value, icon, key, numericKey, fillable }, index) => {
        if (
          UIOptions.tools?.[
            value as Extract<typeof value, keyof AppProps["UIOptions"]["tools"]>
          ] === false
        ) {
          return null;
        }

        const label = t(`toolBar.${value}`);
        const letter =
          key && capitalizeString(typeof key === "string" ? key : key[0]);
        const shortcut = letter
          ? `${letter} ${t("helpDialog.or")} ${numericKey}`
          : `${numericKey}`;
        return (
          <ToolButton
            className={clsx("Shape", { fillable })}
            key={value}
            type="radio"
            icon={icon}
            checked={activeTool.type === value}
            name="editor-current-shape"
            title={`${capitalizeString(label)} — ${shortcut}`}
            keyBindingLabel={numericKey || letter}
            aria-label={capitalizeString(label)}
            aria-keyshortcuts={shortcut}
            data-testid={`toolbar-${value}`}
            onPointerDown={({ pointerType }) => {
              if (!appState.penDetected && pointerType === "pen") {
                app.togglePenMode(true);
              }
            }}
            onChange={({ pointerType }) => {
              if (appState.activeTool.type !== value) {
                trackEvent("toolbar", value, "ui");
              }
              if (value === "image") {
                app.setActiveTool({
                  type: value,
                  insertOnCanvasDirectly: pointerType !== "mouse",
                });
              } else {
                app.setActiveTool({ type: value });
              }
            }}
          />
        );
      })}
      {renderLserToolButton()}
    </>
  );
};

export const ZoomActions = ({
  renderAction,
  zoom,
}: {
  renderAction: ActionManager["renderAction"];
  zoom: Zoom;
}) => (
  <Stack.Col gap={1} className={CLASSES.ZOOM_ACTIONS}>
    <Stack.Row align="center">
      {renderAction("zoomOut")}
      {renderAction("resetZoom")}
      {renderAction("zoomIn")}
    </Stack.Row>
  </Stack.Col>
);

export const UndoRedoActions = ({
  renderAction,
  className,
}: {
  renderAction: ActionManager["renderAction"];
  className?: string;
}) => (
  <div className={`undo-redo-buttons ${className}`}>
    <div className="undo-button-container">
      <Tooltip label={t("buttons.undo")}>{renderAction("undo")}</Tooltip>
    </div>
    <div className="redo-button-container">
      <Tooltip label={t("buttons.redo")}> {renderAction("redo")}</Tooltip>
    </div>
  </div>
);

export const ExitZenModeAction = ({
  actionManager,
  showExitZenModeBtn,
}: {
  actionManager: ActionManager;
  showExitZenModeBtn: boolean;
}) => (
  <button
    type="button"
    className={clsx("disable-zen-mode", {
      "disable-zen-mode--visible": showExitZenModeBtn,
    })}
    onClick={() => actionManager.executeAction(actionToggleZenMode)}
  >
    {t("buttons.exitZenMode")}
  </button>
);

export const FinalizeAction = ({
  renderAction,
  className,
}: {
  renderAction: ActionManager["renderAction"];
  className?: string;
}) => (
  <div className={`finalize-button ${className}`}>
    {renderAction("finalize", { size: "small" })}
  </div>
);
