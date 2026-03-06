import { useEffect, useRef } from "react";

function HiddenContent({ text }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.font = "20px Arial";

    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = parseInt(context.font, 10);

    canvas.width = textWidth + 25;
    canvas.height = textHeight + 20;
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#000000";
    context.font = "20px Arial";
    context.fillText(text, 10, 27);
  }, [text]);

  return <canvas ref={canvasRef} />;
}

export default HiddenContent;
