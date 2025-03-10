// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   imageUrls: [],
//   categoryImages: [],
//   foodItemImages: [],
//   updatedItems: [], // Items with counts and prices
//   orderedFood: [], // Ordered food items (food items and combos combined)
//   loading: true,
//   showBottomNavbar: false,
//   selectedTable: null,
//   additionalItems: [], // If you are using additional items for combos or extras
//   selectedCombos: {}, // New state to manage combo orders
// };

// const menuSlice = createSlice({
//   name: "menu",
//   initialState,
//   reducers: {
//     setImageUrls(state, action) {
//       state.imageUrls = action.payload;
//     },
//     setSelectedTable(state, action) {
//       state.selectedTable = action.payload;
//     },
//     setCategoryImages(state, action) {
//       state.categoryImages = action.payload;
//     },
//     setFoodItemImages(state, action) {
//       state.foodItemImages = action.payload;
//     },
//     setUpdatedItems(state, action) {
//       state.updatedItems = action.payload;
//       const orderedItems = action.payload.filter((item) => item.count > 0);
//       state.orderedFood = orderedItems;
//       state.showBottomNavbar = orderedItems.length > 0;
//     },
//     setLoading(state, action) {
//       state.loading = action.payload;
//     },
//     setOrderedFood(state, action) {
//       state.orderedFood = action.payload;
//     },
//     updateCartItemCount(state, action) {
//       const { name, delta } = action.payload;
//       state.updatedItems = state.updatedItems.map((item) =>
//         item.name === name
//           ? { ...item, count: Math.max(0, item.count + delta) }
//           : item
//       );
//       const orderedItems = state.updatedItems.filter((item) => item.count > 0);
//       state.orderedFood = orderedItems;
//       state.showBottomNavbar = orderedItems.length > 0;
//     },
//     setAdditionalItems: (state, action) => {
//       state.additionalItems = action.payload;
//     },

//     // New reducer for combo handling
//     addComboToOrder(state, action) {
//       const combo = action.payload;

//       // If the combo is already in the order, increase the count
//       if (state.selectedCombos[combo._id]) {
//         state.selectedCombos[combo._id].count += 1;
//       } else {
//         state.selectedCombos[combo._id] = { ...combo, count: 1 };
//       }

//       // Add or update in ordered food list
//       const existingCombo = state.orderedFood.find(item => item._id === combo._id);
//       if (existingCombo) {
//         existingCombo.count += 1;
//       } else {
//         state.orderedFood.push({
//           _id: combo._id,
//           name: combo.comboName,
//           count: 1,
//           price: combo.comboPrice,
//           tableNumber: state.selectedTable || null,
//           type: combo.comboType,
//           categoryName: combo.comboCategoryName,
//         });
//       }

//       state.showBottomNavbar = state.orderedFood.length > 0;
//     },

//     removeComboFromOrder(state, action) {
//       const comboId = action.payload;

//       // Remove combo from selectedCombos
//       if (state.selectedCombos[comboId]) {
//         delete state.selectedCombos[comboId];
//       }

//       // Remove combo from ordered food list
//       state.orderedFood = state.orderedFood.filter(item => item._id !== comboId);

//       state.showBottomNavbar = state.orderedFood.length > 0;
//     },

//     // Optional: To reset combo state
//     resetCombos(state) {
//       state.selectedCombos = {};
//     },
//   },
// });

// export const {
//   setImageUrls,
//   setSelectedTable,
//   setCategoryImages,
//   setFoodItemImages,
//   setUpdatedItems,
//   setLoading,
//   updateCartItemCount,
//   setAdditionalItems,
//   setOrderedFood,
//   addComboToOrder,
//   removeComboFromOrder,
//   resetCombos,
// } = menuSlice.actions;

// export default menuSlice.reducer;
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, Col, Row } from "react-bootstrap";
import axios from "axios";
import {
  setImageUrls,
  setCategoryImages,
  setFoodItemImages,
  setUpdatedItems,
  setOrderedFood,
  addComboToOrder,
  removeComboFromOrder,
  updateCartItemCount,
} from "./menuSlice"; // Redux actions

const MenuPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    imageUrls,
    selectedTable,
    categoryImages,
    foodItemImages,
    updatedItems,
    orderedFood,
    loading,
  } = useSelector((state) => state.menu);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFoodItems, setFilteredFoodItems] = useState(foodItemImages);
  const [combos, setCombos] = useState([]);
  const [isTableSelected, setIsTableSelected] = useState(!!selectedTable);

  useEffect(() => {
    const fetchBannerImages = async () => {
      try {
        const response = await axios.get(
          "https://qr-backend-application.onrender.com/banner/banners"
        );
        const urls = response.data.map(
          (file) =>
            `https://qr-backend-application.onrender.com/banner/image/${file.fileId}`
        );
        dispatch(setImageUrls(urls));
      } catch (error) {
        console.error("Error fetching banner images:", error);
      }
    };

    const fetchCategoryImages = async () => {
      try {
        const response = await axios.get(
          "https://qr-backend-application.onrender.com/categories/category"
        );
        const categoryData = response.data.map((item) => ({
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          categoryUrl: `https://qr-backend-application.onrender.com/categories/image/${item.fileId}`,
        }));
        dispatch(setCategoryImages(categoryData));
      } catch (error) {
        console.error("Error fetching category images:", error);
      }
    };

    const fetchFoodItemsImages = async () => {
      try {
        const response = await axios.get(
          "https://qr-backend-application.onrender.com/menu/stocks"
        );
        const foodItemsData = response.data;
        const urls = foodItemsData.map((item) => ({
          typeName: item.name,
          typeImageUrl: `https://qr-backend-application.onrender.com/files/image/${item.imageId}`,
          typePrice: item.price,
          categoryName: item.categoryName,
          typeId: item._id,
          type: item.type,
          availability: item.availability,
        }));
        dispatch(setFoodItemImages(urls));
        dispatch(setUpdatedItems(urls));
      } catch (error) {
        console.error("Error fetching food item images:", error);
      }
    };

    const fetchCombos = async () => {
      try {
        const response = await axios.get(
          "https://qr-backend-application.onrender.com/combos/combo"
        );
        setCombos(response.data);
      } catch (error) {
        console.error("Error fetching combos:", error);
      }
    };

    fetchBannerImages();
    fetchCategoryImages();
    fetchFoodItemsImages();
    fetchCombos();
  }, [dispatch]);

  useEffect(() => {
    const filtered = foodItemImages.filter((item) =>
      item.typeName.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
    setFilteredFoodItems(filtered);
  }, [searchTerm, foodItemImages]);

  const handleAddToCart = () => {
    if (orderedFood.length > 0) {
      navigate("/addToCart");
    }
  };

  const handleCountChange = (itemName, delta) => {
    const updatedItemsList = updatedItems.map((item) =>
      item.typeName === itemName
        ? { ...item, count: Math.max(0, item.count + delta) }
        : item
    );
    dispatch(setUpdatedItems(updatedItemsList));
  };

  const handleAddCombo = (combo) => {
    dispatch(addComboToOrder(combo));
  };

  const handleRemoveCombo = (comboId) => {
    dispatch(removeComboFromOrder(comboId));
  };

  const handleTableSelect = (tableNumber) => {
    dispatch(setSelectedTable(tableNumber));
    setIsTableSelected(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Food Items Section */}
      <div className="food-items-container">
        <h2>Menu</h2>
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {filteredFoodItems.map((item) => (
            <Col key={item.typeId} className="d-flex align-items-stretch">
              <Card className={`food-item-card ${item.availability !== "available" ? "blur" : ""}`}>
                <div className="card-content">
                  <div className="content-left">
                    <h3>{item.typeName}</h3>
                    <h4>Price: {item.typePrice}</h4>
                    <h3>{item.type === "Veg" ? <>🟢 Veg</> : <>🔴 Non Veg</>}</h3>
                    <div className="counter">
                      {item.availability === "available" && (
                        <>
                          <button onClick={() => handleCountChange(item.typeName, -1)}>-</button>
                          <span>{updatedItems.find((i) => i.typeName === item.typeName)?.count}</span>
                          <button onClick={() => handleCountChange(item.typeName, 1)}>+</button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="content-right">
                    <img src={item.typeImageUrl} alt={item.typeName} />
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Combos Section */}
      <div className="combo-container">
        <h2>Combo</h2>
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {combos.map((combo) => (
            <Col key={combo._id} className="d-flex align-items-stretch">
              <Card className={`combo-item-card ${combo.availability !== "available" ? "blur" : ""}`}>
                <div className="card-content">
                  <div className="content-left">
                    <h3>{combo.comboName}</h3>
                    <h4>Price: {combo.comboPrice}</h4>
                    <h3>{combo.comboType === "Veg" ? <>🟢 Veg</> : <>🔴 Non Veg</>}</h3>
                    <div className="counter">
                      {combo.availability === "available" ? (
                        <>
                          <button onClick={() => handleRemoveCombo(combo._id)}>-</button>
                          <span>{orderedFood.filter((item) => item._id === combo._id).length}</span>
                          <button onClick={() => handleAddCombo(combo)}>+</button>
                        </>
                      ) : (
                        <button disabled>Unavailable</button>
                      )}
                    </div>
                  </div>
                  <div className="content-right">
                    <img src={`https://qr-backend-application.onrender.com/combos/image/${combo.comboImage}`} alt={combo.comboName} />
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Bottom Navbar for Cart */}
      {orderedFood.length > 0 && (
        <div className="bottom-navbar">
          <button onClick={handleAddToCart}>Proceed to Cart</button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
