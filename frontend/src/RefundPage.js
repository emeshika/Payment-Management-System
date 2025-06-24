import React from "react";
import { useParams } from "react-router-dom";

const RefundPage = () => {
  const { invoiceNumber } = useParams();

  return (
    <div className="refund-container">
      <h2>Request Refund</h2>
      <p>Refund request for Invoice Number: {invoiceNumber}</p>
      <button>Confirm Refund</button>
    </div>
  );
};

export default RefundPage;
