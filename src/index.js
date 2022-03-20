import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { Group, Layer, Rect, Stage, Text } from "react-konva";
import { v4 as uuidv4 } from "uuid";

class ControlMode {
  static Mouse = new ControlMode("mouse");
  static Trackpad = new ControlMode("trackpad");

  constructor(name) {
    this.name = name;
  }
}

class Shape {
  constructor(id, x, y, text, dragging) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.text = text;
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

  const [shapes, setShapes] = useState(() => {
    try {
      const shapesJSON = localStorage.getItem("shapes");
      if (shapesJSON) {
        const shapes = JSON.parse(shapesJSON);
        return shapes.map((shape) => Object.assign(new Shape(), shape));
      } else {
        return [];
      }
    } catch (e) {
      console.warn(
        "Failed to get shapes from localStorage, falling back to default",
        e
      );
      return [];
    }
  });

  const [selectedShape, setSelectedShape] = useState(null);

  const [viewportCoordinates, setViewportCoordinates] = useState(() => {
    try {
      const viewportCoordinatesJSON = localStorage.getItem(
        "viewportCoordinates"
      );
      if (viewportCoordinatesJSON) {
        return JSON.parse(viewportCoordinatesJSON);
      } else {
        return {
          x: 0,
          y: 0
        };
      }
    } catch (e) {
      console.warn(
        "Failed to get viewportCoordinates from localStorage, falling back to default",
        e
      );
      return {
        x: 0,
        y: 0
      };
    }
  });

  const mouseRightStateHistory = keyState(Key.MouseRight);

  const [canvasPanEnabled, setCanvasPanEnabled] = useState(false);

  //TODO add automatic detection capability
  const [controlMode, setControlMode] = useState(() => {
    try {
      const controlModeCookieValue = localStorage.getItem("controlMode");
      if (controlModeCookieValue) {
        return ControlMode[
          Object.keys(ControlMode).find(
            (controlMode) =>
              controlMode.toLowerCase() === controlModeCookieValue
          )
        ];
      } else {
        return ControlMode.Mouse;
      }
    } catch (e) {
      console.warn(
        "Failed to get controlMode from localStorage, falling back to default",
        e
      );
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

  //TODO debounce
  useEffect(() => {
    localStorage.setItem(
      "viewportCoordinates",
      JSON.stringify(viewportCoordinates)
    );
  }, [viewportCoordinates]);

  useEffect(() => {
    localStorage.setItem("controlMode", controlMode.name);
  }, [controlMode]);

  const handleAddRect = () => {
    const shape = new Shape(
      uuidv4(),
      -viewportCoordinates.x + window.innerWidth / 2,
      -viewportCoordinates.y + window.innerHeight / 2,
      "",
      false
    );
    setShapes((state) => [...state, shape]);
  };

  useEffect(() => {
    localStorage.setItem("shapes", JSON.stringify(shapes));
  }, [shapes]);

  const onSelectedShapeTextChange = (event) => {
    const value = event.target.value;
    setSelectedShape((state) => ({ ...state, text: value }));
    setShapes((shapes) =>
      shapes.map((el) =>
        el.id === selectedShape.id
          ? {
              ...el,
              text: value
            }
          : el
      )
    );
  };

  const onSelectedShapeXChange = (event) => {
    let value;
    if (isNaN(event.target.valueAsNumber)) {
      value = 0;
    } else {
      value = event.target.valueAsNumber;
    }
    setSelectedShape((state) => ({ ...state, x: value }));
    setShapes((shapes) =>
      shapes.map((el) =>
        el.id === selectedShape.id
          ? {
              ...el,
              x: value
            }
          : el
      )
    );
  };

  const onSelectedShapeYChange = (event) => {
    let value;
    if (isNaN(event.target.valueAsNumber)) {
      value = 0;
    } else {
      value = event.target.valueAsNumber;
    }
    setSelectedShape((state) => ({ ...state, y: value }));
    setShapes((shapes) =>
      shapes.map((el) =>
        el.id === selectedShape.id
          ? {
              ...el,
              y: value
            }
          : el
      )
    );
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
        DEBUG
        <br />
        Viewport x:{viewportCoordinates.x} y:{viewportCoordinates.y}
        <br />
        Mouse right:{mouseRightStateHistory.current.name}
        <br />
        Canvas pan enabled:{canvasPanEnabled ? "true" : "false"}
        <br />
        Selected shape: {selectedShape ? selectedShape.id : "null"}
      </div>
      <div
        style={{
          position: "absolute",
          border: "1px solid black",
          padding: "10px",
          zIndex: 1,
          right: "5px",
          backgroundColor: "white"
        }}
      >
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
          top: "50%",
          backgroundColor: "white"
        }}
      >
        <button onClick={() => handleAddRect()}>Add Rect</button>
      </div>
      {selectedShape ? (
        <>
          <div
            style={{
              position: "absolute",
              border: "1px solid black",
              padding: "10px",
              zIndex: 1,
              top: "50%",
              right: "5px",
              backgroundColor: "white"
            }}
          >
            Shape
            <br />
            ID: {selectedShape.id}
            <br />
            Text:
            <input
              type="text"
              onChange={onSelectedShapeTextChange}
              value={selectedShape.text || ""}
            />
            X:
            <input
              type="number"
              onChange={onSelectedShapeXChange}
              value={selectedShape.x}
            />
            Y:
            <input
              type="number"
              onChange={onSelectedShapeYChange}
              value={selectedShape.y}
            />
          </div>
        </>
      ) : null}
      <Stage
        width={window.innerWidth - 20}
        height={window.innerHeight - 20}
        onClick={(event) => {
          if (event.target === event.target.getStage()) {
            setSelectedShape(null);
          }
        }}
      >
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
              onClick={() => {
                setSelectedShape(shape);
              }}
            >
              <Rect
                width={shapeEdgeLength}
                height={shapeEdgeLength}
                fill={shape.dragging ? "black" : "green"}
              />
              <Text
                x={shapeEdgeLength / 4}
                y={shapeEdgeLength / 6}
                text={shape.text}
                fill={shape.dragging ? "green" : "black"}
                wrap="char"
                width={shapeEdgeLength / 2}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </>
  );
};

render(<App />, document.getElementById("root"));
