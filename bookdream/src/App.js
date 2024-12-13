import "./App.css";
import { Route, Routes } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import NavBar from "./components/NavBar";
import DashboardPage from "./pages/DashboardPage";
import { useState } from "react";
import { ScanModalProvider } from "./contexts/ScanModalContext";
import { AddClassroomModalProvider } from "./contexts/AddClassroomModalContext";
import { UserSettingsProvider } from "./contexts/UserSettingsContext.js";
import { TagModalProvider } from "./contexts/TagModalContext.js";
import { CreateCardsModalProvider } from "./contexts/CreateCardsModalContext.js";
import { CheckoutBooksModalProvider } from "./contexts/CheckoutBooksModalContext.js";

function App() {
  const [showNav, setShowNav] = useState(true);

  return (
    <>
      <UserSettingsProvider>
        <AddClassroomModalProvider>
          <ScanModalProvider>
            <TagModalProvider>
              <CreateCardsModalProvider>
                <CheckoutBooksModalProvider>
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
                        path="/dashboardpage"
                        element={<DashboardPage setShowNav={setShowNav} />}
                      />
                    </Routes>
                  </div>
                </CheckoutBooksModalProvider>
              </CreateCardsModalProvider>
            </TagModalProvider>
          </ScanModalProvider>
        </AddClassroomModalProvider>
      </UserSettingsProvider>
    </>
  );
}

export default App;
