import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PaymentSearchPage.css";

const PaymentSearchPage = () => {
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to mask card number
  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    const lastFour = cardNumber.slice(-4);
    const masked = '*'.repeat(cardNumber.length - 4);
    return masked + lastFour;
  };

  useEffect(() => {
    const fetchPaymentRecords = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/payments/getAllPayments");
        setPaymentRecords(response.data);
        setFilteredRecords(response.data);
      } catch (err) {
        setError("Error fetching payment records");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentRecords();
  }, []);

  // Handle search input change
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    
    const filtered = paymentRecords.filter(payment => 
      payment.name.toLowerCase().includes(query) ||
      payment.invoiceNumber.toLowerCase().includes(query) ||
      payment.cardNumber.slice(-4).includes(query) ||
      payment.address.toLowerCase().includes(query)
    );
    
    setFilteredRecords(filtered);
  };

  // Handle view details button click
  const handleViewDetails = (payment) => {
    navigate("/payment-records", { 
      state: { 
        userInfo: {
          name: payment.name,
          cardNumber: payment.cardNumber
        },
        currentPayment: payment
      } 
    });
  };

  if (loading) {
    return <div className="loading">Loading payment records...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="payment-search-container">
      <h2>Search Payment Records</h2>
      
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search by name, invoice number, last 4 digits of card, or address..." 
          value={searchQuery} 
          onChange={handleSearch} 
          className="search-bar"
        />
      </div>

      <div className="results-container">
        {filteredRecords.length === 0 ? (
          <p className="no-results">No payment records found</p>
        ) : (
          <table className="payment-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Name</th>
                <th>Card Number</th>
                <th>Expiry Date</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((payment, index) => (
                <tr key={index}>
                  <td>{payment.invoiceNumber}</td>
                  <td>{payment.name}</td>
                  <td>{maskCardNumber(payment.cardNumber)}</td>
                  <td>{payment.expiryDate}</td>
                  <td>{payment.address}</td>
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(payment)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentSearchPage; 