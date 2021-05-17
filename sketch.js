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

function select_dragging(target) {
  let self = {
    state: "dragging",
    target: target,
    draw: (mouse) => {
      target.pos = mouse;
    },
    finish: (mouse) => {
      target.pos = mouse;
    },
  };
  return self;
}

function select_create_wire(input) {
  let self = {
    state: "creating_wire",
    wire: wire(input, null),

    finish: (mouse) => {
      for (var entity of entities) {
        if (!entity.connect_input) continue;
        if (entity.descendents().has(input.node)) continue;

        let available_output = entity.connect_input(mouse, self.wire);
        if (available_output) {
          self.wire.input.wires.push(self.wire);
          self.wire.output = available_output;
          entities.push(self.wire);
          return;
        }
      }
    },
  };
  self.draw = (mouse) => {
    stroke(0, 255, 0);
    let start = v_add(self.wire.input.node.pos, self.wire.input.offset);
    self.wire.output = { node: { pos: mouse }, offset: vec() };
    draw_wire(self.wire);
    self.wire.output = null;
  };
  return self;
}

function variable(name) {
  let self = {
    name: name,
    pos: rand_vec(),
  };
  self.output = connector(self, name, vec(0, 10));
  self.draw = () => draw_variable(self);
  self.select = (mouse) => {
    if (v_dist(mouse, v_add(self.pos, self.output.offset)) < 15) {
      return select_create_wire(self.output);
    } else if (v_dist(mouse, self.pos) < 15) {
      return select_dragging(self);
    }
  };
  return self;
}

function draw_variable(variable) {
  fill(255);
  noStroke();
  text(variable.name, variable.pos.x, variable.pos.y - 20);
  fill(50);
  rect(variable.pos.x, variable.pos.y, 20, 30);
}

function wire(input, output) {
  let self = {
    input: input,
    output: output,
  };
  self.descendents = () => {
    if (self.output) {
      console.log(self.output);
      return self.output.descendents();
    } else {
      return new Set();
    }
  };
  self.draw = () => draw_wire(self);
  self.select = () => {};

  if (input) {
    input.wires.push(self);
  }

  if (output) {
    output.wires.push(self);
  }

  return self;
}

function draw_wire(w) {
  let start = v_add(w.input.node.pos, w.input.offset);
  let end = v_add(w.output.node.pos, w.output.offset);
  let dist = v_dist(start, end) * 2.0;
  let start_extend = v_sub(
    w.input.node.pos,
    v_scale(v_norm(w.input.offset), dist)
  );
  let end_extend = v_sub(
    w.output.node.pos,
    v_scale(v_norm(w.output.offset), dist)
  );
  noFill();
  strokeWeight(5);
  stroke(150, 150, 150);
  curve(
    start_extend.x,
    start_extend.y,
    start.x,
    start.y,
    end.x,
    end.y,
    end_extend.x,
    end_extend.y
  );
}

function connector(node, input_name, offset) {
  let self = { node, input_name, offset, wires: [] };
  self.descendents = () => self.node.descendents();

  return self;
}

function gate(op, n_inputs) {
  let self = {
    op: op,
    pos: rand_vec(),
  };

  self.inputs = [...Array(n_inputs).keys()].map((i) =>
    connector(self, `In:${i}`, vec(20 * (i - (n_inputs - 1) / 2), -10), null)
  );
  self.output = connector(self, "Out", vec(0, 10), null);
  self.draw = () => draw_gate(self);

  self.select = (mouse) => {
    let output_pos = v_add(self.pos, self.output.offset);
    if (v_dist(mouse, output_pos) < 10) {
      return select_create_wire(self.output);
    } else if (v_dist(mouse, self.pos) < 30) {
      return select_dragging(self);
    }
  };

  self.descendents = () => {
    let descendents = new Set();
    descendents.add(self);
    self.output.wires.forEach((w) => {
      for (var d of w.descendents()) {
        descendents.add(d);
      }
    });
    return descendents;
  };

  self.connect_input = (mouse, wire) => {
    let available_connectors = self.inputs.filter((i) => i.wires.length == 0);
    let connectors_within_range = available_connectors.filter(
      (input) => 15 > v_dist(mouse, v_add(self.pos, input.offset))
    );
    connectors_within_range.sort((a, b) =>
      v_dist(
        mouse,
        -(v_add(self.pos, a.offset) - v_dist(mouse, v_add(self.pos, b.offset)))
      )
    );
    if (connectors_within_range.length > 0) {
      let connector = connectors_within_range[0];
      connector.wires.push(wire);
      return connector;
    }
  };
  return self;
}

function draw_gate(gate) {
  fill(255);
  noStroke();
  let gate_w = 20 * gate.inputs.length;
  let gate_h = 30;
  rect(gate.pos.x, gate.pos.y, gate_w, gate_h);
  fill(0);
  text(gate.op, gate.pos.x, gate.pos.y);
}

function or() {
  return gate("or", 2);
}

function and() {
  return gate("and", 2);
}

function not() {
  return gate("!", 1);
}

let entities = [];

function draw_entities() {
  entities.forEach((e) => e.draw());
}

let global_variables = {};

function mathNodeToGraph(node) {
  switch (node.type) {
    case "FunctionNode":
      console.log("fn", node);
      let left;
      let right;
      switch (node.fn.name) {
        case "or":
          console.log("or node");
          left = mathNodeToGraph(node.args[0]);
          right = mathNodeToGraph(node.args[1]);

          if (!left.output || !right.output) {
            throw "You done goofed";
          }

          let or_gate = or();
          entities.push(or_gate);
          entities.push(wire(left.output, or_gate.inputs[0]));
          entities.push(wire(right.output, or_gate.inputs[1]));
          return or_gate;
        case "and":
          console.log("and node");
          left = mathNodeToGraph(node.args[0]);
          right = mathNodeToGraph(node.args[1]);

          if (!left.output || !right.output) {
            throw "You done goofed";
          }

          let and_gate = and();
          entities.push(and_gate);
          entities.push(wire(left.output, and_gate.inputs[0]));
          entities.push(wire(right.output, and_gate.inputs[1]));
          return and_gate;

        default:
          console.error("unknown fn", node.fn, node);
      }
      break;
    case "OperatorNode":
      console.log("op", node);
      console.log("not node");
      let operand = mathNodeToGraph(node.args[0]);
      if (!operand.output) {
        throw "You done goofed";
      }

      let not_gate = not();
      entities.push(not_gate);
      entities.push(wire(operand.output, not_gate.inputs[0]));
      return not_gate;

      break;
    case "SymbolNode":
      console.log("sym", node.name);
      if (global_variables[node.name]) {
        return global_variables[node.name];
      } else {
        global_variables[node.name] = variable(node.name);

        entities.push(global_variables[node.name]);
        return global_variables[node.name];
      }

      break;
    default:
      console.error("unknown node", node.type, node);
  }
}

function buildGraph() {
  let expr = i12tEqJen(4);
  return mathNodeToGraph(expr);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  buildGraph();
}

let mouse = vec(0, 0);
function mousePressed() {
  select_state = null;
  if (entities.length > 0) {
    for (var entity of entities) {
      select_state = entity.select(mouse);
      if (select_state) {
        console.log("started drag state", select_state);
        return;
      }
    }
  }
}

function mouseReleased() {
  console.log("drag released", select_state);
  if (!select_state) return;
  select_state.finish(mouse);
  select_state = null;
}

function draw() {
  mouse = vec(mouseX, mouseY);
  background(50, 100, 150);
  draw_entities();
  if (select_state) {
    select_state.draw(mouse);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
