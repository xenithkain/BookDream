import {
  account,
  databases,
  usersCollection,
  databaseKey,
} from "../appwrite/appwriteConfig";
import BookAdditionsModal from "./BookAdditionsModal";
import { useEffect, useState } from "react";
import { FaHouse } from "react-icons/fa6";
import { FaBook } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";

function NavBar() {
  const [userDetails, setUserDetails] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const location = useLocation(); // Get the current path

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const getActiveStyle = (path) => {
    return location.pathname === path ? { backgroundColor: "#c2c2c2" } : {};
  };

  const handleClick = (event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setModalPos({
      x: buttonRect.left + window.scrollX,
      y: buttonRect.bottom + window.scrollY, // Adjust as needed
    });
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const getData = account.get();
    getData.then(
      (response) => {
        setUserDetails(response);
      },
      (error) => {
        console.error(error);
      }
    );
  }, []);

  return (
    <>
      <div className="navbar_container">
          <button
            className="navbar_button"
            style={getActiveStyle("/bookshelvespage")}
            onClick={() => {
              navigate("/bookshelvespage");
            }}
          >
            <FaHouse />
          </button>
          <button
            className="navbar_button"
            style={getActiveStyle("/classroomspage")}
            onClick={() => {
              navigate("/classroomspage");
            }}
          >
            <FaBook />
          </button>
          <button
            className="navbar_button"
            style={getActiveStyle("/tagspage")}
            onClick={() => {
              navigate("/tagspage");
            }}
          >
            <IoMdSettings />
          </button>
          <button
            className="navbar_button"
            style={getActiveStyle("/tagspage")}
            onClick={() => {
              navigate("/tagspage");
            }}
          >
            <IoIosLogOut />
          </button>
        </div>
    </>
  );
}

export default NavBar;
