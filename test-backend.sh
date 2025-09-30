#!/bin/bash

echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
echo "Waiting for backend to start..."
sleep 10

echo "Testing warehouse endpoints..."

# Test creating a zone
echo "Testing zone creation..."
curl -X POST http://localhost:4000/api/warehouse/zones \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Zone",
    "code": "TZ-001", 
    "capacity": 1000,
    "temperature": "20°C",
    "humidity": "60%",
    "description": "Test zone for warehouse functionality"
  }'

echo -e "\n\nTesting zone retrieval..."
curl http://localhost:4000/api/warehouse/zones

echo -e "\n\nTesting inventory creation..."
curl -X POST http://localhost:4000/api/inventory/add_inventory \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "sku": "TEST-001",
    "type": "Test Type",
    "category": "Vegetables",
    "currentStock": 100,
    "minStock": 10,
    "maxStock": 500,
    "unitPrice": 50,
    "unit": "kg"
  }'

echo -e "\n\nTesting analytics..."
curl http://localhost:4000/api/warehouse/analytics

echo -e "\n\nTesting low stock..."
curl http://localhost:4000/api/warehouse/low-stock

echo -e "\n\nTests completed. Stopping backend server..."
kill $BACKEND_PID