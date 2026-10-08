import Ebook from "../models/Ebook.js";
import Order from "../models/Order.js";
import User from "../models/user.js";
import Setting from "../models/setting.js";
import { generateOrderNumber } from "../utils/generateOrderNo.js";
import axios from 'axios';
import crypto from 'crypto';
import { getRazorpayKeys, verifyRazorpaySignature } from "../config/razorpay.js";

// GET /api/ebooks - Fetch all active ebooks
export const getEbooks = async (req, res) => {
  try {
    const ebooks = await Ebook.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, ebooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/ebooks/:id - Fetch single ebook
export const getEbookById = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) {
      return res.status(404).json({ success: false, message: 'Ebook not found' });
    }
    res.status(200).json({ success: true, ebook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ebooks - Create an ebook (Admin only)
export const createEbook = async (req, res) => {
  try {
    const ebookData = { ...req.body };
    if (ebookData.isActive !== undefined) {
      ebookData.isActive = ebookData.isActive === 'true' || ebookData.isActive === true;
    }
    if (req.file) {
      ebookData.coverImage = `/uploads/${req.file.filename}`;
    }
    const ebook = new Ebook(ebookData);
    await ebook.save();
    res.status(201).json({ success: true, ebook });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/ebooks/:id - Update an ebook (Admin only)
export const updateEbook = async (req, res) => {
  try {
    const ebookData = { ...req.body };
    if (ebookData.isActive !== undefined) {
      ebookData.isActive = ebookData.isActive === 'true' || ebookData.isActive === true;
    }
    if (req.file) {
      ebookData.coverImage = `/uploads/${req.file.filename}`;
    }
    const ebook = await Ebook.findByIdAndUpdate(req.params.id, ebookData, { new: true, runValidators: true });
    if (!ebook) {
      return res.status(404).json({ success: false, message: 'Ebook not found' });
    }
    res.status(200).json({ success: true, ebook });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/ebooks/:id - Delete an ebook (Admin only)
export const deleteEbook = async (req, res) => {
  try {
    const ebook = await Ebook.findByIdAndDelete(req.params.id);
    if (!ebook) {
      return res.status(404).json({ success: false, message: 'Ebook not found' });
    }
    res.status(200).json({ success: true, message: 'Ebook deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ebooks/checkout/init
export const ebookCheckoutInit = async (req, res) => {
  try {
    const { ebookId } = req.body;
    const userId = req.user._id;

    const ebook = await Ebook.findById(ebookId);
    if (!ebook || !ebook.isActive) {
      return res.status(404).json({ success: false, message: 'Ebook not found or inactive' });
    }

    const user = await User.findById(userId);
    if (user.purchasedEbooks && user.purchasedEbooks.includes(ebookId)) {
      return res.status(400).json({ success: false, message: 'You have already purchased this ebook.' });
    }

    // Fetch Razorpay credentials
    const { keyId: apiKey, keySecret: apiSecret } = await getRazorpayKeys();

    // GST logic (optional based on your standard flow, using 0% here for simplicity, can be updated)
    const GST_RATE = await Setting.getGstRate().catch(() => 0.18);
    const tax = parseFloat((ebook.price * GST_RATE).toFixed(2));
    const grandTotal = parseFloat((ebook.price + tax).toFixed(2));

    const amountPaise = Math.round(grandTotal * 100);

    // Create Razorpay order
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const rpResponse = await axios.post(
      "https://api.razorpay.com/v1/orders",
      { amount: amountPaise, currency: "INR" },
      { headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` } }
    );

    res.status(200).json({
      success: true,
      orderId: rpResponse.data.id,
      amount: amountPaise,
      currency: "INR",
      key: apiKey,
      tax,
      grandTotal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ebooks/checkout/verify
export const ebookCheckoutVerify = async (req, res) => {
  try {
    const { ebookId, razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress } = req.body;
    const userId = req.user._id;

    const ebook = await Ebook.findById(ebookId);
    if (!ebook) {
      return res.status(404).json({ success: false, message: 'Ebook not found' });
    }

    const isValidSignature = await verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Payment is valid, create local order
    const GST_RATE = await Setting.getGstRate().catch(() => 0.18);
    const tax = parseFloat((ebook.price * GST_RATE).toFixed(2));
    const grandTotal = parseFloat((ebook.price + tax).toFixed(2));
    const orderNo = await generateOrderNumber();

    const order = new Order({
      orderNo,
      userId,
      items: [{
        ebookId: ebook._id,
        type: 'ebook',
        pricePaid: ebook.price,
        currency: 'INR'
      }],
      subTotal: ebook.price,
      tax: tax,
      gstRate: GST_RATE,
      grandTotal: grandTotal,
      payment: {
        provider: 'razorpay',
        paymentIntent: razorpay_payment_id,
        status: 'paid'
      },
      shippingAddress: shippingAddress,
      deliveryStatus: 'pending'
    });
    await order.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { purchasedEbooks: ebook._id }
    });

    res.status(200).json({ success: true, message: "Payment verified successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/ebooks/orders/my-orders
export const getMyBookOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId, "items.type": "ebook" })
      .populate('items.ebookId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/ebooks/orders/all
export const getAllBookOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.type": "ebook" })
      .populate('userId', 'fullName email phone')
      .populate('items.ebookId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/ebooks/orders/:id/status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid delivery status" });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { deliveryStatus: status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Delivery status updated successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
