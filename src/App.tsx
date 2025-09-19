import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes/appRoute";
// import AppRoute from "@/routes/AppRoute";
// import { ThemeProvider } from "./context/ThemeProvider";
function App() {
  return (
    <div className="duration-200">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastStyle={{
          fontFamily: "inherit",
          fontSize: "14px",
        }}
      />

      <div>
        <p className="bg-red-900 text-3xl">Here we go</p>
      </div>
      {/* <ThemeProvider> */}
        <AppRoutes/>
      {/* </ThemeProvider> */}
    </div>
  );
}

export default App;
