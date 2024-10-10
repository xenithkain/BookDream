import { useState } from "react";

function BookSearchPage() {
  const [searchText, setSearchText] = useState("");
  return (
    <>
      <div className="FormGroup">
        <label htmlFor="Search">Search</label>
        <input
          type="text"
          id="tag-search"
          value={searchText}
          style={{ border: "1px solid black", color: "black" }}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
        <button className="InputButton">Enter</button>
      </div>
    </>
  );
}

export default BookSearchPage;
