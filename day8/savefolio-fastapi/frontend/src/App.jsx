import { useState } from "react";
import TailwindPractice from "./components/TailwindPractice";

import Content from "./components/dashboard/Content";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

export default function App() {
  const [formOpen, setFormOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <Header
        onAdd={() => setFormOpen(true)}
        onMenu={() => setSidebarOpen(true)}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAdd={() => setFormOpen(true)}
      />

      <main>
        <Content
          formOpen={formOpen}
          onOpenForm={() => setFormOpen(true)}
          onCloseForm={() => setFormOpen(false)}
        />
      </main>
      <TailwindPractice />
      <Footer />
    </div>
  );
}