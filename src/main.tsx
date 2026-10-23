import { createRoot } from "react-dom/client";

import { stackRoomHistory } from "@/lib/roomRoutes";

import App from "./App.tsx";
import "./index.css";

stackRoomHistory();
createRoot(document.getElementById("root")).render(<App />);
