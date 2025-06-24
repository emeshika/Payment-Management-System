import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./PaymentRecordsPage.css";

const PaymentRecordsPage = () => {
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    userInfo,
    currentPayment,
    showSingleRecord,
    showUserRecords,
    previousPayments,
  } = location.state || {};

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return "";
    const lastFour = cardNumber.slice(-4);
    const masked = "*".repeat(cardNumber.length - 4);
    return masked + lastFour;
  };

  useEffect(() => {
    const fetchPaymentRecords = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/payments/getAllPayments");
        let records = response.data;

        if ((showUserRecords || userInfo?.email) && userInfo?.email) {
          records = records.filter((payment) => payment.email === userInfo.email);

          if (currentPayment) {
            records = records.filter((payment) => payment.invoiceNumber !== currentPayment.invoiceNumber);
            records = [currentPayment, ...records];
          }
        }

        setPaymentRecords(records);
        setFilteredRecords(records);
      } catch (err) {
        setError("Error fetching payment records.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentRecords();
  }, [userInfo, currentPayment, showSingleRecord, showUserRecords, previousPayments]);

  const handleRefund = (invoiceNumber) => {
    navigate(`/refund/${invoiceNumber}`);
  };

  const handleDelete = async (invoiceNumber) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/payments/${invoiceNumber}`);
      alert(response.data.message);
      const updatedRecords = paymentRecords.filter(
        (payment) => payment.invoiceNumber !== invoiceNumber
      );
      setPaymentRecords(updatedRecords);
      setFilteredRecords(
        updatedRecords.filter((payment) =>
          payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.invoiceNumber.toLowerCase().includes(searchQuery) ||
          payment.cardNumber.slice(-4).includes(searchQuery) ||
          payment.email.toLowerCase().includes(searchQuery) ||
          payment.address.toLowerCase().includes(searchQuery)
        )
      );
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = paymentRecords.filter((payment) =>
      payment.name.toLowerCase().includes(query) ||
      payment.invoiceNumber.toLowerCase().includes(query)
    );
    setFilteredRecords(filtered);
  };

  if (loading) return <div className="loading">Loading payment records...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="payment-records-page">
      <h2>Payment Records</h2>

      <input
        type="text"
        placeholder="Search by name, invoice ..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-bar"
      />

      {filteredRecords.length === 0 ? (
        <p>No payment records found.</p>
      ) : (
        <table className="payment-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Name</th>
              <th>Email</th>
              <th>Card</th>
              {/*<th>Expiry</th>*/}
              <th>Address</th>
              <th>Refund</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((payment, index) => (
              <tr key={index}>
                <td>{payment.invoiceNumber}</td>
                <td>{payment.name}</td>
                <td>{payment.email}</td>
                <td>{maskCardNumber(payment.cardNumber)}</td>
                {/*<td>{payment.expiryDate}</td>*/}
                <td>{payment.address}</td>
                <td>
                  {!payment.refundStatus ? (
                    <button className="refund-btn" onClick={() => handleRefund(payment.invoiceNumber)}>
                      Refund
                    </button>
                  ) : (
                    <span className="refunded-label">Refunded</span>
                  )}
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(payment.invoiceNumber)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentRecordsPage;
