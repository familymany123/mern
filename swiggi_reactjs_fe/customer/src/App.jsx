import { RouterProvider } from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext";
import router from "./router";
import AIChatBox from "./components/AIChatBox";


function App() {
  return (
    <>
      <SidebarProvider>
        <RouterProvider router={router} />
        <AIChatBox />
      </SidebarProvider>
    </>
  );
}

export default App;
