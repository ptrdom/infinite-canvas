import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { Group, Layer, Rect, Stage, Text } from "react-konva";
import Cookies from "universal-cookie";

const cookies = new Cookies();

class ControlMode {
  static Mouse = new ControlMode("mouse");
  static Trackpad = new ControlMode("trackpad");

  constructor(name) {
    this.name = name;
  }
}

class Shape {
  constructor(id, x, y, dragging) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.dragging = dragging;
  }
}

class KeyState {
  static Up = new KeyState("up");
  static Down = new KeyState("down");
  static Hold = new KeyState("hold");

  constructor(name) {
    this.name = name;
  }
}

class KeyStateHistory {
  static Initial = new KeyStateHistory(null, KeyState.Up);

  constructor(previous, current) {
    this.previous = previous;
    this.current = current;
  }

  enqueue(current) {
    return new KeyStateHistory(this.current, current);
  }
}

class Key {
  static MouseLeft = new Key("mousedown", "mouseup", 0);
  static MouseRight = new Key("mousedown", "mouseup", 2);

  constructor(downEventListenerType, upEventListenerType, buttonCode) {
    this.downEventListenerType = downEventListenerType;
    this.upEventListenerType = upEventListenerType;
    this.buttonCode = buttonCode;
  }
}

function keyState(key) {
  const [stateHistory, setStateHistory] = useState(KeyStateHistory.Initial);
  const holdIntervalRef = React.useRef(null);

  const startHoldIntervalCounter = () => {
    if (holdIntervalRef.current) return;
    holdIntervalRef.current = setInterval(() => {
      setStateHistory((state) => state.enqueue(KeyState.Hold));
    }, 100);
  };

  const stopHoldIntervalCounter = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const handler = (event) => {
      if (event.button === key.buttonCode) {
        setStateHistory((state) => state.enqueue(KeyState.Down));
        startHoldIntervalCounter();
      }
    };
    //TODO customize event listener target
    document.addEventListener(key.downEventListenerType, handler);
    return () =>
      document.removeEventListener(key.downEventListenerType, handler);
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (event.button === key.buttonCode) {
        stopHoldIntervalCounter();
        setStateHistory((state) => state.enqueue(KeyState.Up));
      }
    };
    //TODO customize event listener target
    document.addEventListener(key.upEventListenerType, handler);
    return () => document.removeEventListener(key.upEventListenerType, handler);
  }, []);

  return stateHistory;
}

const App = () => {
  const shapeEdgeLength = 100;

  const [shapeId, setShapeId] = useState(4);

  const [shapes, setShapes] = useState([
    new Shape(1, 312, 326, false),
    new Shape(2, 253, 123, false),
    new Shape(3, 121, 267, false)
  ]);

  const [viewportCoordinates, setViewportCoordinates] = useState({
    x: 0,
    y: 0
  });

  const mouseLeftStateHistory = keyState(Key.MouseLeft);
  const mouseRightStateHistory = keyState(Key.MouseRight);

  const [canvasPanEnabled, setCanvasPanEnabled] = useState(false);

  //TODO add automatic detection capability
  const [controlMode, setControlMode] = useState(() => {
    const controlModeCookieValue = cookies.get("controlMode");
    if (controlModeCookieValue) {
      const controlMode =
        ControlMode[
          Object.keys(ControlMode).find(
            (controlMode) =>
              controlMode.toLowerCase() === controlModeCookieValue
          )
        ];
      console.log(controlMode);
      return controlMode;
    } else {
      return ControlMode.Mouse;
    }
  });

  useEffect(() => {
    if (controlMode === ControlMode.Trackpad) {
      const handler = (event) => {
        setViewportCoordinates((state) => ({
          x: state.x + -event.deltaX,
          y: state.y + -event.deltaY
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
    setCanvasPanEnabled(mouseRightStateHistory.current === KeyState.Hold);
  }, [mouseRightStateHistory]);

  useEffect(() => {
    if (canvasPanEnabled) {
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

  const handleFocusShape = (event) => {
    const shape = shapes.find(
      (shape) => shape.id.toString() === event.target.value
    );
    if (!shape) {
      throw new Error("Failed to find shape by id.");
    } else {
      setViewportCoordinates({
        x: -shape.x - shapeEdgeLength / 2 + window.innerWidth / 2,
        y: -shape.y - shapeEdgeLength / 2 + window.innerHeight / 2
      });
    }
  };

  const handleControlModeChange = (controlMode) => {
    setControlMode(controlMode);
    cookies.set("controlMode", controlMode.name);
  };

  const handleAddRect = () => {
    const shape = new Shape(
      shapeId,
      -viewportCoordinates.x + window.innerWidth / 2,
      -viewportCoordinates.y + window.innerHeight / 2,
      false
    );
    setShapeId((state) => state + 1);
    setShapes((state) => [...state, shape]);
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          border: "1px solid black",
          padding: "10px",
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
            onChange={() => handleControlModeChange(ControlMode.Mouse)}
          />{" "}
          {ControlMode.Mouse.name}
          <input
            type="radio"
            value={ControlMode.Trackpad.name}
            name="control-mode"
            checked={controlMode === ControlMode.Trackpad}
            onChange={() => handleControlModeChange(ControlMode.Trackpad)}
          />{" "}
          {ControlMode.Trackpad.name}
        </div>
        Focus shape:
        <select value="" onChange={handleFocusShape}>
          <option value="" />
          {shapes.map((shape) => {
            return (
              <option key={shape.id} value={shape.id}>
                {shape.id}
              </option>
            );
          })}
        </select>
      </div>
      <div
        style={{
          position: "absolute",
          border: "1px solid black",
          padding: "10px",
          zIndex: 1,
          top: "200px",
          backgroundColor: "white"
        }}
      >
        <button onClick={() => handleAddRect()}>Add Rect</button>
      </div>
      <Stage width={window.innerWidth - 20} height={window.innerHeight - 20}>
        <Layer>
          {shapes.map((shape) => (
            <Group
              key={shape.id}
              x={shape.x + viewportCoordinates.x}
              y={shape.y + viewportCoordinates.y}
              draggable
              onDragStart={() => {
                setShapes((shapes) =>
                  shapes.map((el) =>
                    el.id === shape.id ? { ...el, dragging: true } : el
                  )
                );
              }}
              onDragEnd={(event) => {
                setShapes((shapes) =>
                  shapes.map((el) =>
                    el.id === shape.id
                      ? {
                          ...el,
                          dragging: false,
                          x: event.target.x() - viewportCoordinates.x,
                          y: event.target.y() - viewportCoordinates.y
                        }
                      : el
                  )
                );
              }}
            >
              <Rect
                width={shapeEdgeLength}
                height={shapeEdgeLength}
                fill={shape.dragging ? "black" : "green"}
              />
              <Text
                x={8}
                y={40}
                text={shape.id}
                fill={shape.dragging ? "green" : "black"}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </>
  );
};

render(<App />, document.getElementById("root"));
