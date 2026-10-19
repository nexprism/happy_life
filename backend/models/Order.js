import mongoose, { Schema } from 'mongoose';

const orderSchema = new Schema({
    orderNo: { type: String, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
        courseBundleId: { type: Schema.Types.ObjectId, ref: 'CourseBundle' },
        coursePlanId: { type: Schema.Types.ObjectId, ref: 'CoursePlan' }, // <-- add plan support
        ebookId: { type: Schema.Types.ObjectId, ref: 'Ebook' },
        testSeriesId: { type: Schema.Types.ObjectId, ref: 'TestSeries' },
        type: { type: String, enum: ['course', 'courseBundle', 'coursePlan', 'ebook', 'testSeries'], required: true },
        pricePaid: { type: mongoose.Types.Decimal128, required: true },
        currency: { type: String, required: true }
    }],
    subTotal: { type: mongoose.Types.Decimal128, required: true },
    discount: { type: mongoose.Types.Decimal128, default: 0 },
    tax: { type: mongoose.Types.Decimal128, default: 0 },
    gstRate: { type: mongoose.Types.Decimal128, default: 0 },
    grandTotal: { type: mongoose.Types.Decimal128, required: true },
    // ✅ GST/company info for order
    company: {
        name: { type: String, trim: true },
        gstNumber: { type: String, default: null }
    },
    // ✅ Physical Delivery Info
    shippingAddress: {
        lat: { type: Number },
        lng: { type: Number },
        flatNo: { type: String },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        phone: { type: String }
    },
    deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    payment: {
        provider: { type: String, enum: ['stripe', 'razorpay', 'paypal', 'free', 'apple_iap', 'google_play'], required: true },
        paymentIntent: { type: String, default: null, index: true, sparse: true }, // Store payment intent or transaction ID
        consumptionKey: { type: String },
        status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' }
    },
    meta: { type: Schema.Types.Mixed },
    isRefunded: { type: Boolean, default: false },
    invoice_url: { type: String } // PDF invoice file name only
}, { timestamps: true });

orderSchema.index({ 'payment.consumptionKey': 1 }, { unique: true, partialFilterExpression: { 'payment.consumptionKey': { $type: 'string' } }, name: 'unique_payment_consumption' });
export default mongoose.model('Order', orderSchema);
