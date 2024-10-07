const shapeStyles = {
  Rect: { borderRadius: "0" },
  Oval: { borderRadius: "50%" },
  Flag: {
    borderRadius: "0",
    position: "relative",
    paddingRight: "10px",
  },
};

function Tag({
  name,
  shape,
  color,
  textcolor,
  description,
  handleMouseDown,
  handleMouseUp,
}) {
  const currentStyle = shapeStyles[shape] || {};
  return (
    <div
      className={`Tag${shape}`}
      style={{ backgroundColor: color, color: textcolor, ...currentStyle }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <p>{name}</p>
      {shape === "Flag" && (
        <div
          className="FlagTriangle"
          style={{
            position: "absolute",
            top: "50%",
            left: "100%",
            width: "0",
            height: "100%",
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderLeft: `10px solid ${color}`,
            transform: "translateY(-50%)",
          }}
        />
      )}
    </div>
  );
}

export default Tag;
