import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  HStack,
  Heading,
  Image,
  Input,
  VStack,
} from "@chakra-ui/react";
import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas>();
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [history, setHistory] = useState<string[]>([]);
  const [historyDepth, setHistoryDepth] = useState(0);

  function saveState() {
    if (!canvas) {
      return;
    }

    setHistoryDepth(historyDepth + 1);
    if (historyDepth < history.length) {
      history.length = historyDepth; // 過去の状態を削除
    }
    setHistory([...history, JSON.stringify(canvas.toDatalessJSON())]);
  }

  function undo() {
    if (!canvas) {
      return;
    }

    if (historyDepth > 0) {
      setHistoryDepth(historyDepth - 1);
      canvas.loadFromJSON(history[historyDepth], () => {});
    }
  }

  function redo() {
    if (!canvas) {
      return;
    }

    if (historyDepth < history.length - 1) {
      setHistoryDepth(historyDepth + 1);
      canvas.loadFromJSON(history[historyDepth], () => {});
    }
  }

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const initialCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 800,
    });
    setCanvas(initialCanvas);

    initialCanvas.on("object:modified", (e) => {
      console.log("object:modified", e);
      saveState();
    });

    initialCanvas.on("object:added", (e) => {
      console.log("object:added", e);
      saveState();
    });
    initialCanvas.on("object:removed", (e) => {
      console.log("object:removed", e);
      saveState();
    });

    if (canvas) {
      canvas.freeDrawingBrush.width = 3;
      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.strokeLineCap = "round";
    }

    initialCanvas.add(
      new fabric.Textbox("Hello World", {
        editingBorderColor: "blue",
        textBackgroundColor: "gold",
        fontSize: 60,
        fontFamily: "Suns Serif",
      })
    );

    initialCanvas.add(
      new fabric.Line([50, 100, 200, 100], {
        stroke: "red",
        strokeWidth: 2,
        lockSkewingX: true,
        lockSkewingY: true,
        lockScalingY: true,
        lockScalingX: true,
      })
    );

    new fabric.PencilBrush(initialCanvas);

    return () => {
      initialCanvas.dispose();
    };
  }, []);
  return (
    <Container maxWidth="100vh">
      <Heading>FabricJS Test</Heading>
      <Box width="100%">
        <Center>
          <VStack>
            <HStack>
              <ButtonGroup isAttached>
                <Button
                  isActive={isDrawing}
                  onClick={() => {
                    const nextDrawing = !isDrawing;
                    setIsDrawing(nextDrawing);
                    if (canvas) {
                      canvas.isDrawingMode = nextDrawing;
                    }
                  }}
                >
                  Toggle Drawing
                </Button>
                <Button onClick={() => canvas?.clear()}>Clear</Button>
                <Button
                  onClick={() => {
                    const targetObject = canvas?.getActiveObject();
                    if (canvas && targetObject) {
                      canvas.remove(targetObject);
                    }
                  }}
                >
                  Remove
                </Button>
              </ButtonGroup>
              <Input
                width={20}
                type="color"
                value={strokeColor}
                onChange={(event) => {
                  setStrokeColor(event.target.value);
                  if (canvas) {
                    canvas.freeDrawingBrush.color = event.target.value;
                  }
                }}
              />
              {/* UNDO REDO Button */}
              <ButtonGroup>
                <Button
                  onClick={() => {
                    undo();
                  }}
                >
                  Undo
                </Button>
                <Button
                  onClick={() => {
                    redo();
                  }}
                >
                  Redo
                </Button>
              </ButtonGroup>
            </HStack>
            <Heading size={"lg"}>Canvas</Heading>
            <Box border="4px solid" borderColor={"gray.200"}>
              <TransformWrapper
                panning={{ disabled: true }}
                initialScale={1}
                maxScale={4}
                doubleClick={{ disabled: true }}
              >
                <TransformComponent>
                  <Box position="relative">
                    <Image
                      src="https://picsum.photos/800/800"
                      position="absolute"
                      width={800}
                      height={800}
                      userSelect="none"
                    />
                    <canvas
                      ref={canvasRef}
                      style={{ width: 800, height: 800, position: "absolute" }}
                    />
                  </Box>
                </TransformComponent>
              </TransformWrapper>
            </Box>
          </VStack>
        </Center>
      </Box>
    </Container>
  );
}

export default App;
