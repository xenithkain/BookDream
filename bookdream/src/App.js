import "./App.css";
import { Route, Routes } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import BookshelvesPage from "./pages/BookshelvesPage";
import TagsPage from "./pages/tagspage";
import ClassroomsPage from "./pages/classroomspage.js";
import NavBar from "./components/NavBar";
import DashboardPage from "./pages/DashboardPage";
import { useState } from "react";
import { ScanModalProvider } from "./components/ScanModalContext";
import { TagModalProvider } from "./components/TagModalContext";
import { AddClassroomModalProvider } from "./components/AddClassroomModalContext";
import { UserSettingsProvider } from "./components/UserSettingsContext.js";

function App() {
  const [showNav, setShowNav] = useState(true);

  return (
    <>
      <UserSettingsProvider>
        <AddClassroomModalProvider>
          <TagModalProvider>
            <ScanModalProvider>
              <div className="app">
                {showNav ? <NavBar /> : null}
                <Routes>
                  <Route
                    path="/"
                    element={<LoginPage setShowNav={setShowNav} />}
                  />
                  <Route
                    path="/signuppage"
                    element={<SignupPage setShowNav={setShowNav} />}
                  />
                  <Route
                    path="/loginpage"
                    element={<LoginPage setShowNav={setShowNav} />}
                  />
                  <Route
                    path="/bookshelvespage"
                    element={<BookshelvesPage setShowNav={setShowNav} />}
                  />
                  <Route
                    path="/classroomspage"
                    element={<ClassroomsPage setShowNav={setShowNav} />}
                  />
                  <Route
                    path="/tagspage"
                    element={<TagsPage setShowNav={setShowNav} />}
                  />
                  <Route
                    path="/dashboardpage"
                    element={<DashboardPage setShowNav={setShowNav} />}
                  />
                </Routes>
              </div>
            </ScanModalProvider>
          </TagModalProvider>
        </AddClassroomModalProvider>
      </UserSettingsProvider>
    </>
  );
}

export default App;
