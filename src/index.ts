import * as p5 from "p5";
import {gray} from "./bool_alg";

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

