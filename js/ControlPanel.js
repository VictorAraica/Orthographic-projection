class ControlPanel {
  constructor(controlsContainer, addButton, board) {
    this.controlsContainer = controlsContainer;
    this.addButton = addButton;
    // this.shapes = ["plane", "line", "segmentedLine", "point"];
    this.inputs = [];
    this.functions = ["intersection", "parallel", "perpendicular", "segment"];
    this.board = board;

    this.inputElement = document.createElement("input");
    this.inputElement.type = "text";
    this.inputElement.className = "w-full text-lg p-2 outline-none";

    this.inputContainer = document.createElement("div");
    this.inputContainer.className = "border-b border-gray-600";

    this.addButton.onclick = () => {
      this.createInput("");
    };

    let commands = [
      "p1 = (0, 0, 0)",
      "p2 = (8, 7, 0)",
      // "p3 = (10, 5, 8)",
      "line = (p1, p2)",
      // "canto = p1,p2,p3",
      // "paralela = parallel(line, p3)",
      // "1erBisector = (p1, p2, p3)",
      // "p4 = (3, 2, 8)",
      // "p5 = (6, 7, 0)",
      // "line2 = (p4, p5)",
      // "interseccion = intersection(line2, 1erBisector)",
    ];

    for (let command of commands) {
      this.createInput(command);
    }

    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].input.value = commands[i];
      this.updateInput(i);
    }
  }

  addDependencies(index, dependencies) {
    for (let i of dependencies) {
      if (!i.dependencies.includes(index)) {
        i.dependencies.push(index);
      }
    }
  }

  textToShape(data, index) {
    let shape;
    // if 3 numbers create point
    if (data.length === 3 && data.every((i) => !isNaN(i))) {
      shape = new Point(
        parseFloat(data[0]),
        parseFloat(data[1]),
        parseFloat(data[2])
      );
    } else if (data.length === 2) {
      const shape1 = this.inputs.find((element) => element.name === data[0]);
      const shape2 = this.inputs.find((element) => element.name === data[1]);

      if (!shape1 || !shape2) {
        return false;
      }

      // if two points create line
      if (shape1.shape.type === "point" && shape2.shape.type === "point") {
        shape = new Line(shape1.shape, shape2.shape);
      }
      // add dependencies to the points
      this.addDependencies(index, [shape1, shape2]);
    } else if (data.length === 3) {
      const shape1 = this.inputs.find((element) => element.name === data[0]);
      const shape2 = this.inputs.find((element) => element.name === data[1]);
      const shape3 = this.inputs.find((element) => element.name === data[2]);

      if (!shape1 || !shape2 || !shape3) {
        return false;
      }

      // if 3 points create plane
      if (
        shape1.shape.type === shape2.shape.type &&
        shape2.shape.type === shape3.shape.type &&
        shape1.shape.type === "point"
      ) {
        let line = new Line(shape1.shape, shape2.shape);
        if (line.pointInLine(shape3.shape)) {
          return false;
        }
        shape = new Plane(shape1.shape, shape2.shape, shape3.shape);

        this.addDependencies(index, [shape1, shape2, shape3]);
      }
    }
    if (!shape) return false;

    return shape;
  }

  intersection(index, input1, input2) {
    let shape;
    if (input1.shape.type === "line" && input2.shape.type === "line") {
      shape = input1.shape.lineIntersection(input2.shape);
    } else if (input1.shape.type === "line" && input2.shape.type === "plane") {
      shape = input1.shape.planeIntersection(input2.shape);
    } else if (input1.shape.type === "plane" && input2.shape.type === "line") {
      shape = input2.shape.planeIntersection(input1.shape);
    }
    if (shape) {
      this.addDependencies(index, [input1, input2]);
      return shape;
    }
    return false;
  }

  parallel(index, input1, input2) {
    let shape;
    if (input1.shape.type === "point" && input2.shape.type === "line") {
      shape = input2.shape.parallelLine(input1.shape);
    } else if (input1.shape.type === "line" && input2.shape.type === "point") {
      shape = input1.shape.parallelLine(input2.shape);
    }
    // TODO
    // else if (input1.shape.type === "plane" && input2.shape.type === "plane") {
    //   shape = input2.shape.planeIntersection(input1.shape);
    // }
    if (shape) {
      this.addDependencies(index, [input1, input2]);
      return shape;
    }
    return false;
  }

  perpendicular(index, input1, input2) {
    let shape;
    if (input1.shape.type === "point" && input2.shape.type === "line") {
      shape = input2.shape.perpendicularLine(input1.shape);
    } else if (input1.shape.type === "line" && input2.shape.type === "point") {
      shape = input1.shape.perpendicularLine(input2.shape);
    } else if (input1.shape.type === "point" && input2.shape.type === "plane") {
      shape = input2.shape.perpendicularLine(input1.shape);
    } else if (input1.shape.type === "plane" && input2.shape.type === "point") {
      shape = input1.shape.perpendicularLine(input2.shape);
    }
    if (shape) {
      this.addDependencies(index, [input1, input2]);
      return shape;
    }
    return false;
  }

  segmentedLine(index, input1, input2) {
    let shape;
    if (input1.shape.type === "point" && input2.shape.type === "point") {
      shape = new SegmentedLine(input1.shape, input2.shape);
    }
    if (shape) {
      this.addDependencies(index, [input1, input2]);
      return shape;
    }
    return false;
  }

  functionToShape(index, functionName, parameters) {
    if (!functionName in this.functions) {
      return false;
    }

    let shape;

    const input1 = this.inputs.find(
      (element) => element.name === parameters[0]
    );
    const input2 = this.inputs.find(
      (element) => element.name === parameters[1]
    );

    if (!input1 || !input2) {
      return false;
    }

    if (functionName === "intersection") {
      shape = this.intersection(index, input1, input2);
    } else if (functionName === "parallel") {
      shape = this.parallel(index, input1, input2);
    } else if (functionName === "perpendicular") {
      shape = this.perpendicular(index, input1, input2);
    } else if (functionName === "segment") {
      shape = this.segmentedLine(index, input1, input2);
    }

    if (shape) {
      return shape;
    }

    return false;
  }

  getNameAndData(value) {
    value = value.replace(/ /g, "");

    const splited = value.split("=");

    if (splited.length !== 2) {
      return [false, false];
    }

    return splited;
  }

  blurError(element, error) {
    this.board.shapes[element.input.index] = false;
    element.input.value = "";
    element.input.placeholder = error;
  }

  updateInput(index) {
    let element = this.inputs[index];
    let value = element.input.value;

    if (value === "") {
      element.shape = "";
      element.name = "";
      element.command = "";
      element.input.placeholder = "";
      this.board.shapes[index] = false;
      element.shape = false;
      if (element.dependencies) {
        for (let i of element.dependencies) {
          this.updateInput(i);
        }
      }
      element.dependencies = [];
    }

    // ---------------------------------------------

    // split on = and get name and data
    let [name, data] = this.getNameAndData(value);

    // if no data delete input value and return
    if (!data) {
      this.blurError(element, "");
      return false;
    }

    // ---------------------------------------------

    let sameNameElem = this.inputs.find((element) => element.name === name);

    if (sameNameElem) {
      if (sameNameElem.input.index !== index) {
        this.blurError(element, "name already used");
        return false;
      }
    }

    // ---------------------------------------------
    let shape = false;

    const functionRegex = /\w+\(\w+,\w+\)/;
    if (data.match(functionRegex)) {
      let [functionName, parameters] = data.replace(/\)/g, "").split("(");

      parameters = parameters.split(",");
      shape = this.functionToShape(index, functionName, parameters);

      if (!shape) {
        this.blurError(element, "error");
        return false;
      }

      element.command = `${name} = ${functionName}(${parameters.join(", ")})`;
    }
    // ---------------------------------------------

    if (!shape) {
      data = data.replace(/\(|\)/g, "").split(",");

      if (data.length > 3 && data.length < 2) {
        this.blurError(element, "expected 2 or 3 arguments");
        return false;
      }

      shape = this.textToShape(data, index);

      if (!shape) {
        this.blurError(element, "error");
        return false;
      }

      element.command = `${name} = (${data.join(", ")})`;
    }

    // ---------------------------------------------

    if (sameNameElem) {
      this.board.shapes.splice(sameNameElem.input.index, 1);
    }

    element.shape = shape;
    element.name = name;

    element.input.value = element.command;
    element.input.placeholder = "";
    this.board.addShape(shape, index);

    for (let i of element.dependencies) {
      this.updateInput(i);
    }

    return shape;
  }

  createInput(command) {
    let input = this.inputElement.cloneNode(true);
    let inputContainer = this.inputContainer.cloneNode(true);
    // input.addEventListener("focus", () => console.log("focus"));
    input.addEventListener("blur", (e) => this.updateInput(e.target.index));
    input.index = this.inputs.length;

    inputContainer.appendChild(input);

    this.controlsContainer.insertBefore(inputContainer, this.addButton);
    this.inputs.push({ input, dependencies: [], command: command });
    input.focus();

    return input;
  }
}
