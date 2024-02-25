import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./components/Home";
import ElectricityUsage from "./components/ElectricityUsage"
import LoadShedding from "./components/LoadShedding";

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/electricity-usage">Electricity Usage</Link>
          </li>
          <li>
            <Link to="/loadshedding">Loadshedding</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/electricity-usage" element={<ElectricityUsage />} />
        <Route path="/loadshedding" element={<LoadShedding />} />
      </Routes>
    </Router>
  );
}

export default App;