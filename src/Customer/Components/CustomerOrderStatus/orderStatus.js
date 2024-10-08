import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './orderStatus.css'; // Ensure this file includes the necessary CSS
import MenuNavbar from '../CustomerPageNavbar/navBar';
import Footer from '../CustomerPageFooter/footer'; // Use the correct path to your Footer component

const OrderStatus = () => {
  const [currentTableOrders, setCurrentTableOrders] = useState([]);
  const [allItemsFromFiltered, setAllItemsFromFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentTableNumber = localStorage.getItem('currentTableNumber');

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://qr-backend-application.onrender.com/cart/items');
        const cartItems = response.data;

       

        if (cartItems.length > 0 && currentTableNumber) {
          // Filter cart items by the current table number
          const filteredItems = cartItems.filter(item => item.tableNumber === parseInt(currentTableNumber));
          
          // Combine both items and combos
          const itemsFromFiltered = filteredItems.flatMap(item => [...item.items, ...item.combos]);

          // Set orders and items
          if (filteredItems.length > 0) {
            setCurrentTableOrders(filteredItems[0].items);
          } else {
            setCurrentTableOrders([]);
          }

          setAllItemsFromFiltered(itemsFromFiltered);
        } else {
          setCurrentTableOrders([]);
          setAllItemsFromFiltered([]);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [currentTableNumber]);

  if (loading) {
    return <div className="text-center my-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center my-4 text-danger">Error: {error}</div>;
  }

  return (
    <>
      <MenuNavbar />
      <h1>Order Status</h1>
      <div className="container">
        {currentTableOrders.length > 0 ? (
          <div className="row">
            {allItemsFromFiltered.length > 0 ? (
              allItemsFromFiltered.map((foodItem, index) => (
                <div key={index} className="col-md-4 mb-4">
                  <div 
                    className={`card ${foodItem.status === 'served' ? 'bg-success text-light' : 'bg-danger text-light'}`}
                  >
                    <div className="card-body">
                      <h5 className="card-title">{foodItem.name}</h5>
                      <p className="card-text"><strong>Count:</strong> {foodItem.count}</p>
                      <p className="card-text"><strong>Status:</strong> {foodItem.status}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No updated food items available</p>
            )}
          </div>
        ) : (
          <p>No orders for the current table</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrderStatus;
