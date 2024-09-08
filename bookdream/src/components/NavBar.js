import {
  account,
  databases,
  usersCollection,
  databaseKey,
} from "../appwrite/appwriteConfig";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function NavBar() {
  const [userDetails, setUserDetails] = useState();
  const navigate = useNavigate();
  const location = useLocation(); // Get the current path

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const getActiveStyle = (path) => {
    return location.pathname === path ? { backgroundColor: "#c2c2c2" } : {};
  };

  useEffect(() => {
    const getData = account.get();
    getData.then(
      (response) => {
        setUserDetails(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  return (
    <>
      {userDetails ? (
        <div className="NavBar">
          <h5 className="BoldText">Welcome to Book Dream {userDetails.name}</h5>
          <button className="Logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <></>
      )}
      <div className="NavBarPageButtonsContainer">
        <button
          className="NavBarPageButton"
          style={getActiveStyle("/bookshelvespage")}
          onClick={() => {
            navigate("/bookshelvespage");
          }}
        >
          Bookshelves
        </button>
        <button
          className="NavBarPageButton"
          style={getActiveStyle("/classroomspage")}
          onClick={() => {
            navigate("/classroomspage");
          }}
        >
          Classrooms
        </button>
        <button
          className="NavBarPageButton"
          style={getActiveStyle("/bookbagpage")}
          onClick={() => {
            navigate("/bookbagpage");
          }}
        >
          Bookbag
        </button>
        <button
          className="NavBarPageButton"
          style={getActiveStyle("/tagspage")}
          onClick={() => {
            navigate("/tagspage");
          }}
        >
          Tags
        </button>
      </div>
    </>
  );
}

export default NavBar;
