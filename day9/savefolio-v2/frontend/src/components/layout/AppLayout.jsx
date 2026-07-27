import { useState } from "react";
import { Outlet } from "react-router-dom";

import Toast from "../common/Toast";
import TransactionModal from "../transactions/TransactionModal";
import Content from "./Content";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-72">
        <Header
          onMenu={() => setSidebarOpen(true)}
        />

        <Content>
          <Outlet />
        </Content>

        <Footer />
      </div>

      <TransactionModal />
      <Toast />
    </div>
  );
}