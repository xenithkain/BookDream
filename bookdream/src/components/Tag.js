import { removeTag } from "../appwrite/appwriteConfig";

const Tag = ({ tag, setUserTags, handleClick }) => {
  return (
    <>
      <div
        className="tag_container"
        style={{
          backgroundColor: `${tag.background_color}`,
          color: `${tag.text_color}`,
        }}
        onClick={() => handleClick(tag)}
      >
        <p className="tag_name">{tag.name}</p>
      </div>
    </>
  );
};

export default Tag;
