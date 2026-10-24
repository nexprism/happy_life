import mongoose, { Schema } from "mongoose";

const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

// Create a default GST rate setting if it doesn't exist
settingSchema.statics.getGstRate = async function () {
  let setting = await this.findOne({ key: "gstRate" });
  if (!setting) {
    setting = await this.create({
      key: "gstRate",
      value: 0.18, // Default GST rate of 18%
      description: "Default GST rate for order calculations",
    });
  }
  return parseFloat(setting.value);
};

// CHANGE: Added method to get default enrolledStudentsCount
settingSchema.statics.getDefaultEnrolledStudentsCount = async function () {
  let setting = await this.findOne({ key: "defaultEnrolledStudentsCount" });
  if (!setting) {
    setting = await this.create({
      key: "defaultEnrolledStudentsCount",
      value: 10, // Default enrolled students count
      description: "Default enrolled students count for courses",
    });
  }
  return parseInt(setting.value);
};

// Method to get or initialize showLandingRegisterButton setting
settingSchema.statics.getShowLandingRegisterButton = async function () {
  let setting = await this.findOne({ key: "showLandingRegisterButton" });
  if (!setting) {
    setting = await this.create({
      key: "showLandingRegisterButton",
      value: true,
      description: "Controls visibility of the floating circular register button on builder-created landing pages",
    });
  }
  return Boolean(setting.value);
};

// Method to get or initialize whatsappCommunityLink setting
settingSchema.statics.getWhatsappCommunityLink = async function () {
  let setting = await this.findOne({ key: "whatsappCommunityLink" });
  if (!setting) {
    setting = await this.create({
      key: "whatsappCommunityLink",
      value: "https://chat.whatsapp.com/invite",
      description: "Official WhatsApp Community link for enrolled students",
    });
  }
  return setting.value;
};

// Add singleton pattern to prevent model recompilation
const Setting =
  mongoose.model.Setting || mongoose.model("Setting", settingSchema);

export default Setting;