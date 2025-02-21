import type * as awarenessProtocol from "y-protocols/awareness";
import type * as Y from "yjs";

import { YKeyValue } from "y-utility/y-keyvalue";

import {
  hashElementsVersion,
  reconcileElements,
  type Excalidraw
} from "@oviceinc/excalidraw";

type ExcalidrawProps = Parameters<typeof Excalidraw>[0];
type ExcalidrawImperativeAPI = Parameters<
  NonNullable<ExcalidrawProps["excalidrawAPI"]>
>[0];
type UpdateSceneParam = Parameters<ExcalidrawImperativeAPI["updateScene"]>[0];
type ExcalidrawElement = NonNullable<UpdateSceneParam["elements"]>[0];
type Collaborators = NonNullable<UpdateSceneParam["collaborators"]>;
type SocketId = Collaborators extends Map<infer K, infer V> ? K : never;
type BinaryFileData = Parameters<ExcalidrawImperativeAPI["addFiles"]>[0][0];

export type ExcalidrawBindingElementsStore = Y.Array<{ key: string; val: ExcalidrawElement }>
export type ExcalidrawBindingAssetsStore =Y.Array<{ key: string; val: BinaryFileData }>

/**
 * Manages the binding between Excalidraw and Y.js for collaborative drawing
 * Handles synchronization of elements, assets, and user awareness
 */
export class ExcalidrawBinding {
  #yElements: YKeyValue<ExcalidrawElement>;
  #yAssets: YKeyValue<BinaryFileData>;
  #api: ExcalidrawImperativeAPI;
  awareness?: awarenessProtocol.Awareness;

  subscriptions: (() => void)[] = [];
  collaborators: Collaborators = new Map();
  lastVersion = 0;
  addedFileIds: Set<string> = new Set();

  /**
   * Initializes the binding between Excalidraw and Y.js
   * @param yElements - Y.js array for storing drawing elements 
   * @param yAssets - Y.js array for storing binary assets
   * @param api - Excalidraw imperative API instance
   * @param awareness - Optional Y.js awareness instance for user presence
   */
  constructor(
    yElements: Y.Array<{ key: string; val: ExcalidrawElement }>,
    yAssets: Y.Array<{ key: string; val: BinaryFileData }>,
    api: ExcalidrawImperativeAPI,
    awareness?: awarenessProtocol.Awareness
  ) {
    this.#yElements = new YKeyValue(yElements);
    this.#yAssets = new YKeyValue(yAssets);
    this.#api = api;
    this.awareness = awareness;

    // Listen for local changes in Excalidraw and sync to Y.js
    this.subscriptions.push(
      this.#api.onChange((elements, state, files) => {
        const version = hashElementsVersion(elements);
        if (version !== this.lastVersion) {
          this.#yElements.doc?.transact(() => {
            // check deletion
            for (const yElem of this.#yElements.yarray) {
              const deleted =
              elements.find((element) => element.id === yElem.key)
                  ?.isDeleted ?? true;
              if (deleted) {
                this.#yElements.delete(yElem.key);
              }
            }
            for (const element of elements) {
              const remoteElements = this.#yElements.get(element.id);
              if (remoteElements?.versionNonce !== element.versionNonce || remoteElements?.version !== element.version) {
                this.#yElements.set(element.id, { ...element });
              }
            }
          }, this);
          this.lastVersion = version;
        }
        if (files) {
          
          const newFiles = Object.entries(files).filter(([id, file]) => {

            return this.#yAssets.get(id) == null;

          });

          this.#yAssets.doc?.transact(() => {
              for (const [id, file] of newFiles) {
                this.#yAssets.set(file.id, { ...file });
              }
          }, this);
        }

        if (this.awareness) {
          // update selected awareness
          this.awareness.setLocalStateField(
            "selectedElementIds",
            state.selectedElementIds
          );
        }
      })
    );

    // Listen for remote changes in Y.js elements and sync to Excalidraw
    const _remoteElementsChangeHandler = (
      event: Array<Y.YEvent<any>>,
      txn: Y.Transaction
    ) => {
      if (txn.origin === this) {
        return;
      }

      const remoteElements = this.#yElements.yarray.map(({ val }) => ({...val}));
      const elements = reconcileElements(
        this.#api.getSceneElements(),
        // @ts-expect-error TODO: 
        remoteElements,
        this.#api.getAppState()
      );

      this.#api.updateScene({ elements, storeAction: "update" });
    };
    this.#yElements.yarray.observeDeep(_remoteElementsChangeHandler);
    this.subscriptions.push(() =>
      this.#yElements.yarray.unobserveDeep(_remoteElementsChangeHandler)
    );

    // Listen for remote changes in Y.js assets and sync to Excalidraw
    const _remoteFilesChangeHandler = (
      changes: Map<string, { action: 'delete', oldValue: BinaryFileData } | { action: 'update', oldValue: BinaryFileData, newValue: BinaryFileData } | { action: 'add', newValue: BinaryFileData }>,
      txn: Y.Transaction
    ) => {
      if (txn.origin === this) {
        return;
      }


      const addedFiles = [...changes.entries()].flatMap(([key, change]) => {
        if (change.action === 'add') {
          return [change.newValue];
        }
        return []

      })
      for (const assets of addedFiles) {
        this.addedFileIds.add(assets.id);
      }
      this.#api.addFiles(addedFiles);
    };
    this.#yAssets.on("change",_remoteFilesChangeHandler); // only observe and not observe deep as assets are only added/deleted not updated
    this.subscriptions.push(() => {
      this.#yAssets.off("change",_remoteFilesChangeHandler);
    });

    if (awareness) {
      // Handle remote user presence updates
      const _remoteAwarenessChangeHandler = ({
        added,
        updated,
        removed,
      }: {
        added: number[];
        updated: number[];
        removed: number[];
      }) => {
        const states = awareness.getStates();

        const collaborators = new Map(this.collaborators);
        const update = [...added, ...updated];
        for (const id of update) {
          const state = states.get(id);
          if (!state) {
            continue;
          }

          collaborators.set(id.toString() as SocketId, {
            pointer: state.pointer,
            button: state.button,
            selectedElementIds: state.selectedElementIds,
            username: state.user?.name,
            color: state.user?.color,
            avatarUrl: state.user?.avatarUrl,
            userState: state.user?.state,
          });
        }
        for (const id of removed) {
          collaborators.delete(id.toString() as SocketId);
        }
        collaborators.delete(awareness.clientID.toString() as SocketId);
        this.#api.updateScene({ collaborators });
        this.collaborators = collaborators;
      };
      awareness.on("change", _remoteAwarenessChangeHandler);
      this.subscriptions.push(() => {
        this.awareness?.off("change", _remoteAwarenessChangeHandler);
      });

      // Initialize collaborator state
      const collaborators = new Map();
      for (const id of awareness.getStates().keys()) {
        const state = awareness.getStates().get(id);
        if (state) {
          collaborators.set(id.toString(), {
            pointer: state.pointer,
            button: state.button,
            selectedElementIds: state.selectedElementIds,
            username: state.user?.name,
            color: state.user?.color,
            avatarUrl: state.user?.avatarUrl,
            userState: state.user?.state,
          });
        }
      }
      this.#api.updateScene({ collaborators });
      this.collaborators = collaborators;
    }

    // Initialize elements and assets from Y.js state
    const initialValue = 
      this.#yElements.yarray.map(({ val }) => ({...val}))
    
    this.lastVersion = hashElementsVersion(initialValue);
    this.#api.updateScene({ elements: initialValue, storeAction: "update" });

    // init assets
    const initialAssets =this.#yAssets.yarray.map(({ val }) => val);

    for (const assets of initialAssets) {
      this.addedFileIds.add(assets.id);
    }
    this.#api.addFiles(initialAssets);
  }

  /**
   * Updates pointer position and button state for collaboration
   * @param payload - Contains pointer coordinates and button state
   */
  public onPointerUpdate = (payload: {
    pointer: {
      x: number;
      y: number;
      tool: "pointer" | "laser";
    };
    button: "down" | "up";
  }) => {
    if (this.awareness) {
      this.awareness.setLocalStateField("pointer", payload.pointer);
      this.awareness.setLocalStateField("button", payload.button);
    }
  };

  /**
   * Cleanup method to remove all event listeners
   */
  destroy() {
    for (const s of this.subscriptions) {
      s();
    }
  }
}
