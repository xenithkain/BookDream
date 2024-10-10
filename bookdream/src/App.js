import "./App.css";
import { Route, Routes } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import BookshelvesPage from "./pages/BookshelvesPage";
import TagsPage from "./pages/tagspage";
import ClassroomsPage from "./pages/Classroomspage";
import NavBar from "./components/NavBar";
import { useState } from "react";
import { ScanModalProvider } from "./components/ScanModalContext";
import { TagModalProvider } from "./components/TagModalContext";
import { AddClassroomModalProvider } from "./components/AddClassroomModalContext";

function App() {
  const [showNav, setShowNav] = useState(true);

  return (
    <>
      <AddClassroomModalProvider>
        <TagModalProvider>
          <ScanModalProvider>
            {showNav ? <NavBar /> : null}
            <Routes>
              <Route path="/" element={<LoginPage setShowNav={setShowNav} />} />
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
            </Routes>
          </ScanModalProvider>
        </TagModalProvider>
      </AddClassroomModalProvider>
    </>
  );
}

export default App;
