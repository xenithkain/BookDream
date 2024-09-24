import "./App.css";
import { Route, Routes } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
// import ProfilePage from './pages/ProfilePage'
import BookshelvesPage from "./pages/BookshelvesPage";
import ClassroomsPage from "./pages/classroomspage";
import TagsPage from "./pages/tagspage";
import NavBar from "./components/NavBar";
import { useState } from "react";
import { ScanModalProvider } from "./components/ScanModalContext";
import { TagModalProvider } from "./components/TagModalContext";

function App() {
  const [showNav, setShowNav] = useState(true);
  return (
    <>
      <TagModalProvider>
        <ScanModalProvider>
          {showNav ? <NavBar /> : <></>}
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
    </>
  );
}

export default App;
