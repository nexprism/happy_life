import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  _id: { type: String },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
export default mongoose.models.RevokedAccessToken || mongoose.model('RevokedAccessToken', schema);
