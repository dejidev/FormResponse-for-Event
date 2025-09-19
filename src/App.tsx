import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes/appRoute";


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

        <AppRoutes/>
    </div>
  );
}

export default App;
