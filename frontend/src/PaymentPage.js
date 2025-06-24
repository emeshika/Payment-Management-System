import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom"; 
import "./PaymentPage.css";
import axios from "axios";  // Import Axios for HTTP requests

const PaymentPage = () => {
  const navigate = useNavigate(); // Initialize navigation

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    address: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  // To handle loading state
  const [loading, setLoading] = useState(false);  


  // Validate Name (Only letters and spaces)
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);

  // Validate Email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate Card Number (16 digits)
  const validateCardNumber = (cardNumber) => /^[0-9]{16}$/.test(cardNumber.replace(/\s+/g, ""));

  // Validate Expiry Date (MM/YY format & future date)
  const validateExpiryDate = (expiryDate) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) return false;

    const [month, year] = expiryDate.split("/").map(Number);
    const currentYear = new Date().getFullYear() % 100;       
    const currentMonth = new Date().getMonth() + 1;

    return year > currentYear || (year === currentYear && month >= currentMonth);
  };

  // Validate CVV (3-digit numeric)
  const validateCVV = (cvv) => /^[0-9]{3}$/.test(cvv);

  //form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      if (!/^[A-Za-z\s]*$/.test(value)) return;
      setFormData({ ...formData, [name]: value });

      setErrors({
        ...errors,
        name: validateName(value) ? "" : "Name can only contain letters and spaces.",
      });

    } else if (name === "email") {
      setFormData({ ...formData, [name]: value });
      setErrors({
        ...errors,
        email: validateEmail(value) ? "" : "Please enter a valid email address.",
      });

    } else if (name === "cardNumber") {
      let formattedValue = value.replace(/\D/g, "").slice(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})/g, "$1 ").trim();
      setFormData({ ...formData, [name]: formattedValue });

      setErrors({
        ...errors,
        cardNumber: validateCardNumber(formattedValue) ? "" : "Invalid Card Number",
      });

    } else if (name === "expiryDate") {
      let formattedValue = value.replace(/\D/g, "").slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
      }
      setFormData({ ...formData, [name]: formattedValue });

      setErrors({
        ...errors,
        expiryDate: validateExpiryDate(formattedValue) ? "" : "Invalid Expiry Date (MM/YY)",
      });

    } else if (name === "cvv") {
      let formattedValue = value.replace(/\D/g, "").slice(0, 3);
      setFormData({ ...formData, [name]: formattedValue });

      setErrors({
        ...errors,
        cvv: validateCVV(formattedValue) ? "" : "Invalid CVV (3 digits)",
      });

    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  //handling the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errors.name || errors.email || errors.cardNumber || errors.expiryDate || errors.cvv) {
      alert("Please fix the errors before submitting.");
      return;
    }

    // Start loading
    setLoading(true); 

    try {
      // Send data to the backend to process the payment
      const response = await axios.post("http://localhost:3000/api/payments/makePayment", formData);
      
      // Check if payment was successful and navigate to invoice page
      if (response.data.success) {
        // Get all previous payments for this email
        const paymentsResponse = await axios.get("http://localhost:3000/api/payments/getAllPayments");
        const userPayments = paymentsResponse.data.filter(payment => payment.email === formData.email);

        navigate("/invoice", { 
          state: { 
            formData,
            invoiceNumber: response.data.invoiceNumber,
            previousPayments: userPayments
          } 
        });
      } else {
        alert("Payment failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Payment Error: ", error);
      alert("There was an error processing your payment.");
    } finally {
      setLoading(false); // Stop loading.user knows the process has finished.
    }
  };

  return (
    <div className="payment-container">
      <h2>Enter Payment Details</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className="error">{errors.name}</p>} 
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number (XXXX XXXX XXXX XXXX)"
          value={formData.cardNumber}
          onChange={handleChange}
          maxLength="19"
          required
        />
        {errors.cardNumber && <p className="error">{errors.cardNumber}</p>}

        <input
          type="text"
          name="expiryDate"
          placeholder="Expiry Date (MM/YY)"
          value={formData.expiryDate}
          onChange={handleChange}
          maxLength="5"
          required
        />
        {errors.expiryDate && <p className="error">{errors.expiryDate}</p>}

        <input
          type="text"
          name="cvv"
          placeholder="CVV"
          value={formData.cvv}
          onChange={handleChange}
          maxLength="3"
          required
        />
        {errors.cvv && <p className="error">{errors.cvv}</p>}

        <input 
          type="text" 
          name="address" 
          placeholder="Address" 
          value={formData.address}
          onChange={handleChange} 
          required 
        />
        
        <button type="submit" disabled={loading}>{loading ? "Processing..." : "Pay Now"}</button>
      </form>
    </div>
  );
};

export default PaymentPage;
