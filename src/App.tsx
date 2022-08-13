import React from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import WalletProvider from "./context/Provider";
//getProvider();

function App() {
  return (
    <div className="App">
      <WalletProvider>
        <Dashboard />
      </WalletProvider>
    </div>
  );
}

export default App;
