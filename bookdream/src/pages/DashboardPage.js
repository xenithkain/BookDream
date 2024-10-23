import { UseUserSettings } from "../components/UserSettingsContext";
import { useEffect } from "react";


function DashboardPage({setShowNav}) {
  useEffect(() => {
    setShowNav(true);
    
  }) 
  const {userColors, changeColors} = UseUserSettings();
  return (
    <div className="dashboard_page_container">
      
    </div>
  );
}

export default DashboardPage;
