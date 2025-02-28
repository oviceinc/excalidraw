import { Excalidraw, type ExcalidrawImperativeAPI } from "@oviceinc/excalidraw";
import "@oviceinc/excalidraw/index.css";
import "./App.css";
import { ExcalidrawBinding } from "@oviceinc/y-excalidraw";

import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { useEffect, useState } from "react";
import { WebsocketProvider } from "y-websocket";

const ydoc = new Y.Doc();

const provicer = new WebsocketProvider(
  "ws://localhost:1234",
  "my-roomname",
  ydoc,
);
const awareness = provicer.awareness;
new IndexeddbPersistence("excalidraw", ydoc);

awareness.setLocalStateField("user", {
  name: `user${Math.random().toString(36).substr(2, 5)}`,
});

function App() {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [binding, setBinding] = useState<ExcalidrawBinding | null>(null);

  useEffect(() => {
    if (!api) {
      return;
    }

    const binding = new ExcalidrawBinding(
      ydoc.getArray("elements"),
      ydoc.getArray("assets"),
      api,
      awareness,
      {
        cursorDisplayTimeout: 2000,
      },
    );
    setBinding(binding);
    return () => {
      binding.destroy();
    };
  }, [api]);

  return (
    <div
      style={{ height: "100vh", width: "100vw", backgroundColor: "#f4f4f4" }}
    >
      <Excalidraw
        excalidrawAPI={setApi}
        isCollaborating
        onPointerUpdate={binding?.onPointerUpdate}
      />
    </div>
  );
}

export default App;
