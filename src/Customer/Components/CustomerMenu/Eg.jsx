import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Card } from "react-bootstrap"; // Assuming you're using React-Bootstrap

const ComboComponent = () => {
  // State to store combo data and loading state
  const [combos, setCombos] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState({});
  const [tablesWithOrders, setTablesWithOrders] = useState(new Set());
  const [load, setLoad] = useState(true);

  // Fetch combo data from API on component mount
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await axios.get(
          "https://qr-backend-application.onrender.com/combos/combo"
        );
        setCombos(response.data);
      } catch (error) {
        console.error("Error fetching combos:", error);
      } finally {
        setLoad(false);
      }
    };

    fetchCombos();
  }, []);

  const handleAddCombo = (combo) => {
    setSelectedCombos((prevCombos) => {
      const newCombos = { ...prevCombos };
      if (newCombos[combo._id]) {
        newCombos[combo._id] = {
          ...newCombos[combo._id],
          count: newCombos[combo._id].count + 1,
        };
      } else {
        newCombos[combo._id] = {
          ...combo,
          count: 1,
          status: "Not Served",
        };
      }
      setTablesWithOrders((prev) => new Set([...prev, combo.tableNumber]));
      return newCombos;
    });
  };

  const handleRemoveCombo = (id) => {
    setSelectedCombos((prevCombos) => {
      const newCombos = { ...prevCombos };
      if (newCombos[id]) {
        if (newCombos[id].count > 1) {
          newCombos[id] = {
            ...newCombos[id],
            count: newCombos[id].count - 1,
          };
        } else {
          delete newCombos[id];
        }
      }
      return newCombos;
    });
  };

  // Show loading state if data is being fetched
  if (load) {
    return <div>Loading...</div>;
  }

  return (
    <div className="combo-container">
      <h2>Combo</h2>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {combos.map((combo, index) => {
          const isComboAdded = selectedCombos[combo._id];
          const comboCount = isComboAdded ? selectedCombos[combo._id].count : 0;

          return (
            <Col key={index} className="d-flex align-items-stretch">
              <Card className="combo-item-card">
                <div className="card-content">
                  <div className="content-left">
                    <div className="combo-details">
                      <h3>{combo.comboName}</h3>
                      <h4>Price: {combo.comboPrice}</h4>
                      <h3>
                        {combo.comboType === "Veg" ? (
                          <>🟢 Veg</>
                        ) : (
                          <>🔴 Non Veg</>
                        )}
                      </h3>
                      <div className="additional-content"></div>
                    </div>

                    {/* Add/Remove Buttons */}
                    {combo.availability === "available" ? (
                      comboCount > 0 ? (
                        <div className="counter">
                          <button
                            className="button"
                            onClick={() => handleRemoveCombo(combo._id)}
                          >
                            -
                          </button>
                          <span className="count">{comboCount}</span>
                          <button
                            className="button"
                            onClick={() => handleAddCombo(combo)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="add-button"
                          onClick={() => handleAddCombo(combo)}
                        >
                          Add
                        </button>
                      )
                    ) : (
                      <button className="add-button" disabled>
                        Unavailable
                      </button>
                    )}
                  </div>

                  <div className="content-right">
                    {/* Display combo image */}
                    <img
                      src={`https://qr-backend-application.onrender.com/combos/image/${combo.comboImage}`}
                      alt={combo.comboName}
                      className="right-image"
                    />
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default ComboComponent;
