import { RouterProvider } from "react-router-dom";
import "./App.css";
import router from "./router";
import { useEffect } from "react";
import axios from "axios";

function App() {
  const controller = new AbortController();
  useEffect(() => {
    axios
      .get("users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        baseURL: import.meta.env.VITE_API_URL,
        signal: controller.signal,
      })
      .then((res) => {
        localStorage.setItem('profile', JSON.stringify(res.data.result))
      });
    return () => {
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <RouterProvider router={router} />;
}

export default App;
