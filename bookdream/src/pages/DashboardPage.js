import { UseUserSettings } from "../components/UserSettingsContext";
import { useEffect } from "react";
import { LuBookPlus } from "react-icons/lu";
import { MdOutlineDoorFront } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";

function DashboardPage({ setShowNav }) {
  useEffect(() => {
    setShowNav(true);
  });
  const { userColors, changeColors } = UseUserSettings();
  return (
    <div className="dashboard_page_container">
      <div className="large_title dashboard_title">Book Dream</div>
      <div className="recent_books_container">
        <div className="medium_title">Recent Books</div>
      </div>
      <div className="classrooms_stats_container">
        <div className="medium_title">Classrooms</div>
      </div>
      <div className="actions_container">
        <div className="action_scan_book action">
          <LuBookPlus className="center_icon" />
        </div>
        <div className="action_add_classroom action">
          <MdOutlineDoorFront className="center_icon" />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
