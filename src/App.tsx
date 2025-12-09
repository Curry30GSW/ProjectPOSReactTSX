import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Clientes from "./pages/Dashboard/Clientes";
import Proveedor from "./pages/Dashboard/Proveedor";
import Articulo from "./pages/Dashboard/Articulos";
import Empleado from "./pages/Dashboard/Empleados";
import Caja from "./pages/Dashboard/Caja";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <Router>

        <ScrollToTop />
        <ToastContainer
          position="top-center"
          autoClose={1500}
          hideProgressBar={true}
          closeOnClick
          pauseOnHover
          draggable={false}

          theme="colored"

          toastStyle={{
            width: "650px",
            maxWidth: "90%",

            backgroundColor: "#333",
            color: "#fff",

            borderRadius: "16px",
            padding: "25px 30px",
            fontSize: "18px",

            textAlign: "center",
            boxShadow: "0px 10px 40px rgba(0,0,0,0.3)",
          }}



        />


        <Routes>

          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Clientes */}
            <Route path="/clientes" element={<Clientes />} />
            {/* Proveedor */}
            <Route path="/proveedores" element={<Proveedor />} />
            {/* Articulos */}
            <Route path="/articulos" element={<Articulo />} />
            {/*Empleados */}
            <Route path="/empleados" element={<Empleado />} />

            {/*Caja */}
            <Route path="/caja" element={<Caja />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />


        </Routes>
      </Router>
    </>
  );
}
