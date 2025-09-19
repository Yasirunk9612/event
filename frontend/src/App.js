import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EventList from "./pages/EventList";
import AdminDashboard from "./pages/AdminDashboard";
import EventDetail from "./pages/EventDetail.js";
import Booking from "./pages/Booking";
import "./App.css";


function App() {
return (
<Router>
<Routes>
<Route path="/" element={<EventList />} />
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/events/:id" element={<EventDetail />} />
 <Route path="/booking" element={<Booking />} />
</Routes>
</Router>
);
}


export default App;