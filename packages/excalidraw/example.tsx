import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Excalidraw } from "./index";

function App() {
  return (
    <>
      {" "}
      <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
      <div style={{ height: "300px" }}>
        <Excalidraw
          isCollaborating
          keepPositionWhenResetCanvas
          handleGestureGlobally={false}
          handleKeyboardGlobally={false}
        />
      </div>
      <div style={{ height: "300px" }}>
        <Excalidraw
          isCollaborating
          keepPositionWhenResetCanvas
          handleGestureGlobally={false}
          handleKeyboardGlobally={false}
        />
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
