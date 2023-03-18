async function drawArc(on, percent) {
  const canvSize = 200;
  const canvas = new DrawContext();
  canvas.opaque = false;
  const canvWidth = 18; // circle thickness
  const canvRadius = 80; // circle radius
  canvas.size = new Size(canvSize, canvSize);
  canvas.respectScreenScale = true;

  const deg = Math.floor(percent * 3.6);

  let ctr = new Point(canvSize / 2, canvSize / 2);
  bgx = ctr.x - canvRadius;
  bgy = ctr.y - canvRadius;
  bgd = 2 * canvRadius;
  bgr = new Rect(bgx, bgy, bgd, bgd);

  canvas.opaque = false;

  canvas.setFillColor(Color.white());
  canvas.setStrokeColor(new Color("#333333"));
  canvas.setLineWidth(canvWidth);
  canvas.strokeEllipse(bgr);

  for (t = 0; t < deg; t++) {
    rect_x = ctr.x + canvRadius * sinDeg(t) - canvWidth / 2;
    rect_y = ctr.y - canvRadius * cosDeg(t) - canvWidth / 2;
    rect_r = new Rect(rect_x, rect_y, canvWidth, canvWidth);
    canvas.fillEllipse(rect_r);
  }

  let stack = on.addStack();
  stack.size = new Size(65, 65);
  stack.backgroundImage = canvas.getImage();
  let padding = 0;
  stack.setPadding(padding, padding, padding, padding);
  stack.centerAlignContent();

  return stack;
}

function sinDeg(deg) {
  return Math.sin((deg * Math.PI) / 180);
}

function cosDeg(deg) {
  return Math.cos((deg * Math.PI) / 180);
}

module.exports = {
  drawArc,
};
