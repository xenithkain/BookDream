class Tag {
  // Private fields (start with #)
  #name;
  #shape;
  #color;
  #description;

  constructor(name = "", shape = "", color = "", description = "") {
    this.#name = name;
    this.#shape = shape;
    this.#color = color;
    this.#description = description;
  }

  get name() {
    return this.#name;
  }

  set name(newName) {
    this.#name = newName;
  }

  get shape() {
    return this.#shape;
  }

  set shape(newShape) {
    this.#shape = newShape;
  }

  get color() {
    return this.#color;
  }

  set color(newColor) {
    this.#color = newColor;
  }

  get description() {
    return this.#description;
  }

  set description(newDescription) {
    this.#description = newDescription;
  }
}
