import { Excalidraw, type ExcalidrawImperativeAPI } from "@oviceinc/excalidraw";
import "@oviceinc/excalidraw/index.css";
import "./App.css";
import { ExcalidrawBinding } from "@oviceinc/y-excalidraw";

import * as awarenessProtocol from "y-protocols/awareness";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { useEffect, useState } from "react";

const ydoc = new Y.Doc();

const awareness = new awarenessProtocol.Awareness(ydoc);

new IndexeddbPersistence("excalidraw", ydoc);

function App() {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    if (!api) {
      return;
    }

    const binding = new ExcalidrawBinding(
      ydoc.getArray("elements"),
      ydoc.getArray("assets"),
      api,
      awareness,
    );
    return () => {
      binding.destroy();
    };
  }, [api]);

  return (
    <div style={{ height: "800px", width: "600px" }}>
      <Excalidraw excalidrawAPI={setApi} />
    </div>
  );
}

export default App;
