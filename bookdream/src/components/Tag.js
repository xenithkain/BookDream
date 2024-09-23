class Tag {
  // Private fields (start with #)
  #name
  #shape
  #color
  #description
  #handleMouseDown
  #handleMouseUp

  constructor (
    name = '',
    shape = '',
    color = '',
    description = '',
    handleMouseDown = () => {},
    handleMouseUp = () => {}
  ) {
    this.#name = name
    this.#shape = shape
    this.#color = color
    this.#description = description
    this.#handleMouseDown = handleMouseDown
    this.#handleMouseUp = handleMouseUp
  }

  get name () {
    return this.#name
  }

  set name (newName) {
    this.#name = newName
  }

  get shape () {
    return this.#shape
  }

  set shape (newShape) {
    this.#shape = newShape
  }

  get color () {
    return this.#color
  }

  set color (newColor) {
    this.#color = newColor
  }

  get description () {
    return this.#description
  }

  set description (newDescription) {
    this.#description = newDescription
  }

  returnJSON () {
    return {
      [this.#name]: {
        shape: this.#shape,
        color: this.#color,
        description: this.#description
      }
    }
  }

  returnHTML () {
    return (
      <>
        <div className='TagContainer'>
          {this.#shape === 'Rect' ? (
            <>
              <div
                className='TagRect'
                style={{ backgroundColor: this.#color }}
                onMouseDown={this.#handleMouseDown}
                onMouseLeave={this.#handleMouseUp}
                onMouseUp={this.#handleMouseUp}
              >
                <p>{this.#name}</p>
              </div>
            </>
          ) : this.#shape === 'Oval' ? (
            <></>
          ) : this.#shape === 'Flag' ? (
            <></>
          ) : (
            <></>
          )}
        </div>
      </>
    )
  }
}

export default Tag
