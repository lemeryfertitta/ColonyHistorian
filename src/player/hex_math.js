/**
 * All math is based on a pointy-top hexagon grid described at https://www.redblobgames.com/grids/hexagons/
 * Colonist.io provides the following types of coordinates:
 *
 * ## Face coordinates
 * The face coordinates are a system with x and y coordinates that describe the relative position of the hexagons.
 * The center hex is (0, 0).
 * The x axis increases to the right and the y axis increases down.
 *
 * ## Corner coordinates
 *
 * The corner coordinates are a system with x, y, and z coordinates that describe the relative position of the corners of the hexagons.
 * The x, y coordinates indicate the face of the hexagon as described above.
 * The z coordinate is either 0 or 1, indicating the top or bottom corner, respectively.
 *
 * ## Edge coordinates
 * The edge coordinates are a system with x, y, and z coordinates that describe the relative position of the edges of the hexagons.
 * The x, y coordinates indicate the face of the hexagon as described above.
 * The z coordinate is from 0 to 2, indicating the left edges from top to bottom, respectively.
 */

const HEX_SIZE = 50;

/**
 * @param {*} hexFace the grid coordinates of the hexagon face
 * @returns the pixel coordinates of the center of the hexagon face
 */
function hexFaceGridToPixel(hexFace) {
  return {
    x: hexFace.x * getHexWidth() + (getHexWidth() / 2) * hexFace.y,
    y: hexFace.y * getHexHeight() * (3 / 4),
  };
}

/**
 * @param {*} hexCorner the grid coordinates of the hexagon corner.
 *  The corner is described by z of 0 or 1 which indicates top or bottom corner, respectively.
 * @retruns the pixel coordinates of the hexagon corner
 */
function hexCornerGridToPixel(hexCorner) {
  const cornerIndex = 5 - 3 * hexCorner.z;
  return hexCornerToCoords(hexFaceGridToPixel(hexCorner), cornerIndex);
}

/**
 * @param {*} hexEdge the grid coordinates of the hexagon edge.
 *  The edge is described by z from 0 to 2 which indicate the left edges from top to bottom, respectively.
 * @returns the pixel coordinates of the two corners of the hexagon edge
 */
function hexEdgeGridToPixels(hexEdge) {
  const cornerIndex = 5 - hexEdge.z;
  return {
    p1: hexCornerToCoords(hexFaceGridToPixel(hexEdge), cornerIndex),
    p2: hexCornerToCoords(hexFaceGridToPixel(hexEdge), cornerIndex - 1),
  };
}

/**
 * @param {*} hexCoords x and y coordinates of the center of the hexagon
 * @param {*} cornerIndex the corner of the hexagon to get the coordinates of. The corners are numbered 0-5, starting from the top right corner and going clockwise.
 * @returns the pixel coordinates of the specified corner of the hexagon
 */
function hexCornerToCoords(hexCoords, cornerIndex) {
  const angleDegrees = 60 * cornerIndex - 30;
  const angleRadians = (Math.PI / 180) * angleDegrees;
  return {
    x: hexCoords.x + HEX_SIZE * Math.cos(angleRadians),
    y: hexCoords.y + HEX_SIZE * Math.sin(angleRadians),
  };
}

/**
 * @returns the pixel height of the hexagon.
 */
function getHexHeight() {
  return 2 * HEX_SIZE;
}

/**
 * @returns the pixel width of the hexagon.
 */
function getHexWidth() {
  return Math.sqrt(3) * HEX_SIZE;
}
