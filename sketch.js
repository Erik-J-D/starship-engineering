let select_state = null;

function vec(x, y) {
  return { x: x ? x : 0, y: y ? y : 0 };
}

function rand_vec() {
  return vec(random(width), random(height));
}

function v_dist(v1, v2) {
  return v_mag(v_sub(v2, v1));
}

function v_add(v1, v2) {
  return vec(v1.x + v2.x, v1.y + v2.y);
}

function v_sub(v1, v2) {
  return vec(v1.x - v2.x, v1.y - v2.y);
}

function v_scale(v, s) {
  return vec(v.x * s, v.y * s);
}

function v_mag(v) {
  return sqrt(v.x * v.x + v.y * v.y);
}

function v_norm(v) {
  let mag = v_mag(v);
  if (mag > 1e-3) {
    return v_scale(v, 1.0 / mag);
  } else {
    return vec();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log(gray(6));
}

function draw() {
  background(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
