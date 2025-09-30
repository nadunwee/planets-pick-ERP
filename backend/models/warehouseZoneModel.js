const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const warehouseZoneSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    usedCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },
    temperature: {
      type: String,
      default: "Room Temperature",
    },
    humidity: {
      type: String,
      default: "50%",
    },
    status: {
      type: String,
      enum: ["active", "maintenance", "full", "inactive"],
      default: "active",
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    maxTemperature: {
      type: Number,
    },
    minTemperature: {
      type: Number,
    },
    maxHumidity: {
      type: Number,
    },
    minHumidity: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Virtual for utilization percentage
warehouseZoneSchema.virtual("utilizationPercentage").get(function () {
  return this.capacity > 0 ? (this.usedCapacity / this.capacity) * 100 : 0;
});

// Pre-save middleware to update status based on capacity
warehouseZoneSchema.pre("save", function (next) {
  if (this.usedCapacity >= this.capacity) {
    this.status = "full";
  } else if (this.status === "full" && this.usedCapacity < this.capacity) {
    this.status = "active";
  }
  next();
});

module.exports = mongoose.model("WarehouseZone", warehouseZoneSchema);