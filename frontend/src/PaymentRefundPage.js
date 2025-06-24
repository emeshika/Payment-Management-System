import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PaymentRefundPage.css"; 

const PaymentRefund = () => {
  const { invoiceNumber } = useParams(); // Get invoice number from URL
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundReason, setRefundReason] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPolicy, setAgreedPolicy] = useState(false);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/payments/refund/${invoiceNumber}`);
        console.log("Payment Details:", response.data); // Debugging log
        if (response.data) {
          setPaymentDetails(response.data);
        } else {
          alert("No payment details found for this invoice.");
        }
      } catch (err) {
        console.error("Error fetching payment details:", err);
        alert("Failed to fetch payment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [invoiceNumber]);

  const handleConfirmRefund = async () => {
    if (!refundReason.trim()) {
      alert("Please provide a reason for the refund.");
      return;
    }
    if (!agreedTerms || !agreedPolicy) {
      alert("You must agree to the terms and policy before proceeding.");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/api/payments/refund/${invoiceNumber}`, {
        refundReason, // Send refund reason to the backend
      });
      alert("Payment successfully refunded!");
      
      // Navigate back to payment records with only the refunded payment info
      navigate("/payment-records", { 
        state: { 
          currentPayment: {
            ...paymentDetails,
            refundStatus: true
          },
          showSingleRecord: true, // Add this flag to show only this record
          userInfo: {
            email: paymentDetails.email
          }
        } 
      });
    } catch (err) {
      alert("Refund failed: " + err.message);
    }
  };

  if (loading) return <div>Loading payment details...</div>;

  return (
    <div className="refund-container">
      <h2>Refund Payment</h2>
      {paymentDetails ? (
        <div className="refund-form">
          <p><strong>Invoice Number:</strong> {paymentDetails.invoiceNumber}</p>
          <p><strong>Name:</strong> {paymentDetails.name}</p>

          <label>Reason for Refund:</label>
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Enter your reason..."
            required
          />

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={() => setAgreedTerms(!agreedTerms)}
              />
              I agree to the Terms and Conditions
            </label>
            <label>
              <input
                type="checkbox"
                checked={agreedPolicy}
                onChange={() => setAgreedPolicy(!agreedPolicy)}
              />
              I agree with the Refund Policy
            </label>
          </div>

          <button
            onClick={handleConfirmRefund}
            className="refund-btn"
            disabled={!agreedTerms || !agreedPolicy}
          >
            Confirm Refund
          </button>
          <button onClick={() => navigate("/payment-records")} className="cancel-btn">
            Cancel
          </button>
        </div>
      ) : (
        <p>Payment details not found.</p>
      )}
    </div>
  );
};

export default PaymentRefund;
