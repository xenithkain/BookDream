import Tag from "./Tag";

const TagsList = ({ tags, setUserTags, handleClick }) => {
  return (
    <>
      <div className="tags_list_container">
        {tags.map((tag, index) => {
          return (
            <Tag
              tag={tag}
              setUserTags={setUserTags}
              handleClick={handleClick}
              key={index}
            />
          );
        })}
      </div>
    </>
  );
};

export default TagsList;
