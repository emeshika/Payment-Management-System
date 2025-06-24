import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaymentPage from "./PaymentPage";
import InvoicePage from "./InvoicePage";
import PaymentRecordsPage from "./PaymentRecordsPage";
import PaymentRefundPage from "./PaymentRefundPage";
import PaymentSearchPage from "./PaymentSearchPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentPage />} />
        <Route path="/invoice" element={<InvoicePage />} />
        <Route path="/payment-records" element={<PaymentRecordsPage />} />
        <Route path="/refund/:invoiceNumber" element={<PaymentRefundPage />} />
        <Route path="/search-payments" element={<PaymentSearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;



