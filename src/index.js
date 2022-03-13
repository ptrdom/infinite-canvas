import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import { Stage, Layer, Text, Group, Rect } from "react-konva";

class MouseState {
  static Up = new MouseState("up");
  static Down = new MouseState("down");
  static Hold = new MouseState("hold");

  constructor(name) {
    this.name = name;
  }
}

class MouseStateHistory {
  static Initial = new MouseStateHistory(null, MouseState.Up);

  constructor(previous, current) {
    this.previous = previous;
    this.current = current;
  }

  enqueue(current) {
    return new MouseStateHistory(this.current, current);
  }
}

class ControlMode {
  static Mouse = new ControlMode("mouse");
  static Trackpad = new ControlMode("trackpad");

  constructor(name) {
    this.name = name;
  }
}

const App = () => {
  const [boxCoordinates, setBoxCoordinates] = useState({
    x: 50,
    y: 50
  });
  const [boxDragging, setBoxDragging] = useState(false);
  const [viewportCoordinates, setViewportCoordinates] = useState({
    x: 0,
    y: 0
  });
  const [mouseLeftStateHistory, setMouseLeftStateHistory] = useState(
    MouseStateHistory.Initial
  );
  const mouseLeftHoldIntervalRef = React.useRef(null);
  const [mouseRightStateHistory, setMouseRightStateHistory] = useState(
    MouseStateHistory.Initial
  );
  const mouseRightHoldIntervalRef = React.useRef(null);

  const [canvasPanEnabled, setCanvasPanEnabled] = useState(false);

  const [controlMode, setControlMode] = useState(ControlMode.Mouse);

  const startMouseLeftHoldIntervalCounter = () => {
    if (mouseLeftHoldIntervalRef.current) return;
    mouseLeftHoldIntervalRef.current = setInterval(() => {
      setMouseLeftStateHistory((state) => state.enqueue(MouseState.Hold));
    }, 100);
  };

  const stopMouseLeftHoldIntervalCounter = () => {
    if (mouseLeftHoldIntervalRef.current) {
      clearInterval(mouseLeftHoldIntervalRef.current);
      mouseLeftHoldIntervalRef.current = null;
    }
  };

  const startMouseRightHoldIntervalCounter = () => {
    if (mouseRightHoldIntervalRef.current) return;
    mouseRightHoldIntervalRef.current = setInterval(() => {
      setMouseRightStateHistory((state) => state.enqueue(MouseState.Hold));
    }, 100);
  };

  const stopMouseRightHoldIntervalCounter = () => {
    if (mouseRightHoldIntervalRef.current) {
      clearInterval(mouseRightHoldIntervalRef.current);
      mouseRightHoldIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (controlMode === ControlMode.Trackpad) {
      const handler = (event) => {
        setViewportCoordinates((state) => ({
          x: state.x + event.deltaX,
          y: state.y + event.deltaY
        }));
      };
      document.addEventListener("wheel", handler);
      return () => document.removeEventListener("wheel", handler);
    }
  }, [controlMode]);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
    };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (event.button === 0) {
        setMouseLeftStateHistory((state) => state.enqueue(MouseState.Down));
        startMouseLeftHoldIntervalCounter();
      } else if (event.button === 2) {
        setMouseRightStateHistory((state) => state.enqueue(MouseState.Down));
        startMouseRightHoldIntervalCounter();
      } else {
        console.warn(`unhandled mouse down ${event.button}`);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (event.button === 0) {
        stopMouseLeftHoldIntervalCounter();
        setMouseLeftStateHistory((state) => state.enqueue(MouseState.Up));
      } else if (event.button === 2) {
        stopMouseRightHoldIntervalCounter();
        setMouseRightStateHistory((state) => state.enqueue(MouseState.Up));
      } else {
        console.warn(`unhandled mouse up ${event.button}`);
      }
    };
    document.addEventListener("mouseup", handler);
    return () => document.removeEventListener("mouseup", handler);
  }, []);

  useEffect(() => {
    setCanvasPanEnabled(mouseRightStateHistory.current === MouseState.Hold);
  }, [mouseRightStateHistory]);

  useEffect(() => {
    if (canvasPanEnabled) {
      console.log("register pan");
      const handler = (event) => {
        setViewportCoordinates((state) => ({
          x: state.x + event.movementX,
          y: state.y + event.movementY
        }));
      };
      document.addEventListener("mousemove", handler);
      return () => document.removeEventListener("mousemove", handler);
    }
  }, [canvasPanEnabled]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          border: "1px solid black",
          zIndex: 1,
          backgroundColor: "white"
        }}
      >
        Viewport x:{viewportCoordinates.x} y:{viewportCoordinates.y}
        <br />
        Mouse left:{mouseLeftStateHistory.current.name} right:
        {mouseRightStateHistory.current.name}
        <br />
        Canvas pan enabled:{canvasPanEnabled ? "true" : "false"}
        <br />
        Control mode:
        <div>
          <input
            type="radio"
            value={ControlMode.Mouse.name}
            name="control-mode"
            checked={controlMode === ControlMode.Mouse}
            onChange={() => setControlMode(ControlMode.Mouse)}
          />{" "}
          {ControlMode.Mouse.name}
          <input
            type="radio"
            value={ControlMode.Trackpad.name}
            name="control-mode"
            checked={controlMode === ControlMode.Trackpad}
            onChange={() => setControlMode(ControlMode.Trackpad)}
          />{" "}
          {ControlMode.Trackpad.name}
        </div>
      </div>
      <Stage width={window.innerWidth - 10} height={window.innerHeight - 10}>
        <Layer>
          <Group
            x={boxCoordinates.x + viewportCoordinates.x}
            y={boxCoordinates.y + viewportCoordinates.y}
            draggable
            onDragStart={() => {
              setBoxDragging(true);
            }}
            onDragEnd={(event) => {
              setBoxDragging(false);
              setBoxCoordinates({
                x: event.target.x() - viewportCoordinates.x,
                y: event.target.y() - viewportCoordinates.y
              });
            }}
          >
            <Rect width={100} height={100} fill="green" />
            <Text
              x={8}
              y={40}
              text="Draggable Text"
              fill={boxDragging ? "green" : "black"}
            />
          </Group>
        </Layer>
      </Stage>
    </>
  );
};

render(<App />, document.getElementById("root"));
