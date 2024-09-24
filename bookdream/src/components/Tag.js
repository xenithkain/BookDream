function Tag({
  name,
  shape,
  color,
  description,
  textcolor,
  handleMouseDown,
  handleMouseUp,
}) {
  return (
    <div className="TagContainer">
      {shape === "Rect" ? (
        <div
          className="TagRect"
          style={{ backgroundColor: color, color: textcolor }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseUp}
          onMouseUp={handleMouseUp}
        >
          <p>{name}</p>
        </div>
      ) : shape === "Oval" ? (
        <div
          className="TagOval"
          style={{
            backgroundColor: color,
            color: textcolor,
            borderRadius: "50%",
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseUp}
          onMouseUp={handleMouseUp}
        >
          <p>{name}</p>
        </div>
      ) : shape === "Flag" ? (
        <div
          className="TagFlag"
          style={{ backgroundColor: color, color: textcolor }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseUp}
          onMouseUp={handleMouseUp}
        >
          <p>{name}</p>
          <div
            className="FlagTriangle"
            style={{
              position: "absolute",
              top: "50%",
              left: "100%",
              width: "0",
              height: "100%",
              borderTop: "10px solid transparent", // Top transparent
              borderBottom: "10px solid transparent", // Bottom transparent
              borderLeft: `10px solid ${color}`, // Left border for the triangle
              transform: "translateY(-50%)", // Center vertically
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default Tag;
