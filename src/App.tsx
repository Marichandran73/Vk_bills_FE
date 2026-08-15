// import { useState } from 'react'

import "./App.css";
import Login from "./component/Login.tsx";
import DashboardMain from "./component/DashboardMain.tsx";
import { CompanyProvider } from "./context/CompanyContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BillTable from "./component/BillTable.tsx";
import PrivateRoute from "./component/PrivateRoute.tsx";

function App() {
  return (
    <>
      <Router>
        <CompanyProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/DashboardMain" element={<DashboardMain />} />
              <Route path="/PreviewTable" element={<BillTable />} />
            </Route>
          </Routes>
        </CompanyProvider>
      </Router>
    </>
  );
}

export default App;
