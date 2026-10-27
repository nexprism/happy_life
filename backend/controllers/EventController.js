import EventService from '../service/EventService.js';
import getRazorpayInstance, { getRazorpayKeys } from '../config/razorpay.js';
import Setting from '../models/setting.js';
import User from '../models/user.js';
import Event from '../models/Event.js';
import crypto from 'crypto';

const eventService = new EventService();

export const createEvent = async (req, res) => {
  try {
    // Parse venue data if it's sent as a string
    let venueData = req.body.venue;
    let tags = req.body.tags;
    let price = req.body.price;

    // Handle price parsing
    try {
      price = typeof price === 'string' ? parseFloat(price) : price;
      if (isNaN(price)) price = 0;
    } catch (e) {
      console.error('Failed to parse price:', e);
      price = 0;
    }

    // Handle venue parsing
    try {
      venueData = typeof venueData === 'string' ? JSON.parse(venueData) : venueData;
    } catch (e) {
      console.error('Failed to parse venue data:', e);
      venueData = null;
    }

    // Handle tags parsing
    try {
      if (typeof tags === 'string') {
        // First try to parse the string
        tags = JSON.parse(tags);
        // If it's already an array in string form, parse it again
        if (typeof tags === 'string') {
          tags = JSON.parse(tags);
        }
        // Ensure it's a flat array
        tags = tags.flat().map(tag => tag.replace(/[\[\]"]/g, ''));
      }
    } catch (e) {
      console.error('Failed to parse tags:', e);
      tags = [];
    }

    const eventData = {
      ...req.body,
      organizer: req.user._id,
      venue: venueData,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      price: price
    };

    // Handle file uploads
    if (req.files?.thumbnail) {
      eventData.thumbnail = req.files.thumbnail[0].path.replace(/\\/g, '/');
    }
    if (req.files?.attachments) {
      eventData.attachments = req.files.attachments.map(file => ({
        name: file.originalname,
        url: file.path.replace(/\\/g, '/'),
        type: file.mimetype
      }));
    }

    const event = await eventService.create(eventData);
    //console.log('Created event:', event); // Add logging to verify data

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Event creation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error
    });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      type,
      category,
      status,
      startDate,
      endDate
    } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
      filter,
      search
    };

    const events = await eventService.getAll(options);
    return res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: events
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventService.getById(id);
    return res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: event
    });
  } catch (error) {
    return res.status(error.message === 'Event not found' ? 404 : 500).json({
      success: false,
      message: error.message,
      error: error
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle nested objects
    try {
      // Parse onlineLink
      if (updateData['onlineLink.url']) {
        updateData.onlineLink = {
          platform: updateData['onlineLink.platform'] || 'other',
          url: updateData['onlineLink.url'],
          meetingId: updateData['onlineLink.meetingId'] || '',
          password: updateData['onlineLink.password'] || ''
        };
        // Remove individual fields
        delete updateData['onlineLink.url'];
        delete updateData['onlineLink.platform'];
        delete updateData['onlineLink.meetingId'];
        delete updateData['onlineLink.password'];
      }

      // Parse venue
      if (typeof updateData.venue === 'string') {
        updateData.venue = JSON.parse(updateData.venue);
      }

      // Handle price
      if (updateData.price) {
        updateData.price = typeof updateData.price === 'string' ?
          parseFloat(updateData.price) : updateData.price;
      }
    } catch (e) {
      console.error('Failed to parse nested objects:', e);
    }

    // Handle file uploads
    if (req.files?.thumbnail) {
      updateData.thumbnail = req.files.thumbnail[0].path.replace(/\\/g, '/');
    }
    if (req.files?.attachments) {
      updateData.attachments = req.files.attachments.map(file => ({
        name: file.originalname,
        url: file.path.replace(/\\/g, '/'),
        type: file.mimetype
      }));
    }

    const event = await eventService.update(id, updateData);
    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    return res.status(error.message === 'Event not found' ? 404 : 500).json({
      success: false,
      message: error.message,
      error: error
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await eventService.delete(id);
    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    return res.status(error.message === 'Event not found' ? 404 : 500).json({
      success: false,
      message: error.message,
      error: error
    });
  }
};

//checkRegisterForEvent
export const checkRegisterForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { guestEmail, guestName, is_verify } = req.body; // Added is_verify to destructured request body

    if (!guestEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        is_valid: false
      });
    }

    if (!is_verify){
      return res.status(400).json({
        success: false,
        message: 'Email not verified',
        is_valid: false,
        err: { email: 'Please verify your email before proceeding' }
      });
    }

    const event = await Event.findOne({ _id: id, isDeleted: false });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        is_valid: false
      });
    }

    // Check if event has ended
    if (event.endDate && new Date(event.endDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event registration is closed because the event has ended',
        is_valid: false
      });
    }

    // Check registration status
    let guestUser = await User.findOne({ email: guestEmail });
    if (guestUser) {
      // Check if is_verify is explicitly true for existing users
      if (is_verify !== true) {
        return res.status(400).json({
          success: false,
          message: 'Email not verified',
          is_valid: false,
          err: { email: 'Please verify your email before proceeding' }
        });
      }

      const userId = guestUser._id;
      const isRegistered = event.registeredParticipants.some(
        p => p.userId.toString() === userId.toString()
      );
      if (isRegistered) {
        return res.status(200).json({
          success: true,
          message: 'User already registered for the event',
          is_valid: false
        });
      }
    }

    const razorpay = await getRazorpayInstance();
    let amount = 0;

    if (event.price && event.price > 0) {
      amount = parseFloat(event.price.toString());
    }

    const GST_RATE = await Setting.getGstRate();
    const subTotal = amount;
    const tax = parseFloat((subTotal * GST_RATE).toFixed(2));
    const total = parseFloat(subTotal) + parseFloat(tax);

    if (amount > 0) {
      const currency = "INR";
      const razorpayAmt = total * 100; // Convert to paise

      const orderOptions = {
        amount: Math.round(razorpayAmt),
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          description: `Registration for event: ${event.title}`,
          guestName: guestName || "Guest User",
          guestEmail: guestEmail,
        }
      };
      const order = await razorpay.orders.create(orderOptions);

      const { keyId: razorpayKey } = await getRazorpayKeys();

      return res.status(200).json({
        success: true,
        is_valid: true,
        razorpay: {
          key: razorpayKey,
          order: order,
          amount: total,
          currency: currency,
        },
        data: { message: 'User can register for the event' }
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'User can register for the event',
        is_valid: true
      });
    }
  } catch (error) {
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message,
      is_valid: false,
      error: error
    });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;

    //console.log("Request body for event registration:", req.body);




    // //console.log("Registering for event:", id, "with data:", data);
    const event = await eventService.registerParticipant(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      data: event
    });
  } catch (error) {
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message,
      error: error
    });
  }
};

export const updateParticipantStatus = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { status } = req.body;

    if (!['registered', 'attended', 'cancelled', 'waitlisted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const event = await eventService.updateParticipantStatus(id, userId, status);
    return res.status(200).json({
      success: true,
      message: 'Participant status updated successfully',
      data: event
    });
  } catch (error) {
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message,
      error: error
    });
  }
};

export const getMyRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({
      'registeredParticipants.userId': userId,
      isDeleted: false
    })
      .sort({ startDate: -1 })
      .select('title description type startDate endDate venue onlineLink price currency thumbnail status registeredParticipants landingPageUrl');

    const formatted = events.map((evt) => {
      const myTicket = evt.registeredParticipants?.find(
        (p) => p.userId && p.userId.toString() === userId.toString()
      );
      return {
        _id: evt._id,
        title: evt.title,
        description: evt.description,
        type: evt.type,
        startDate: evt.startDate,
        endDate: evt.endDate,
        venue: evt.venue,
        onlineLink: evt.onlineLink,
        price: evt.price,
        currency: evt.currency,
        thumbnail: evt.thumbnail,
        status: evt.status,
        landingPageUrl: evt.landingPageUrl,
        ticket: myTicket
          ? {
              ticketNo: myTicket.ticketNo,
              ticketPrice: myTicket.ticketPrice,
              invoice: myTicket.invoice,
              purchasedAt: myTicket.purchasedAt || myTicket.registeredAt,
              status: myTicket.status,
              paymentStatus: myTicket.paymentStatus,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching registered events:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyPublicRegistration = async (req, res) => {
  try {
    const { paymentId, email, name, phone, slug, eventId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required for registration',
      });
    }

    let targetEvent = null;
    if (eventId) {
      targetEvent = await Event.findOne({ _id: eventId, isDeleted: false });
    }
    if (!targetEvent && slug) {
      targetEvent = await Event.findOne({
        isDeleted: false,
        landingPageUrl: new RegExp(`^/?${slug}$`, 'i'),
      });
    }

    // If this builder page is NOT assigned to any event, do NOT grab an unrelated event
    if (!targetEvent) {
      return res.status(200).json({
        success: true,
        isEvent: false,
        message: 'Payment received. This landing page is not assigned to an event, so no event was registered.',
      });
    }

    // Register participant using eventService
    const result = await eventService.registerParticipant(targetEvent._id, {
      guestEmail: email.trim().toLowerCase(),
      guestName: name ? name.trim() : 'Student',
      guestPhone: phone,
      paymentId: paymentId || 'FREE_EVENT',
    });

    return res.status(200).json({
      success: true,
      message: 'Registration confirmed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error verifying public registration:', error);
    if (error.message && error.message.includes('already registered')) {
      return res.status(200).json({
        success: true,
        alreadyRegistered: true,
        message: 'You are already registered for this event. Your access details are in your email and dashboard.',
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const { keySecret } = await getRazorpayKeys();

    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('⚠️ Invalid Razorpay webhook signature');
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    }

    const eventType = req.body.event;
    console.log(`🔔 Received Razorpay webhook event: ${eventType}`);

    if (['payment.captured', 'payment_link.paid', 'order.paid'].includes(eventType)) {
      const payload = req.body.payload;
      const payment = payload?.payment?.entity || payload?.payment_link?.entity || {};
      const email = payment.email || payment.customer?.email;
      const contact = payment.contact || payment.customer?.contact;
      const notes = payment.notes || {};

      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        let targetEvent = null;

        if (notes.eventId) {
          targetEvent = await Event.findOne({ _id: notes.eventId, isDeleted: false });
        }
        if (!targetEvent && notes.slug) {
          targetEvent = await Event.findOne({
            isDeleted: false,
            landingPageUrl: new RegExp(`^/?${notes.slug}$`, 'i'),
          });
        }

        if (targetEvent) {
          try {
            await eventService.registerParticipant(targetEvent._id, {
              guestEmail: cleanEmail,
              guestName: notes.name || notes.guestName || payment.description || 'Student',
              guestPhone: contact,
              paymentId: payment.id || 'WEBHOOK_PAYMENT',
            });
            console.log(`✅ Participant ${cleanEmail} registered for ${targetEvent.title} via Razorpay webhook`);
          } catch (regErr) {
            console.warn(`Webhook participant registration note: ${regErr.message}`);
          }
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Razorpay webhook:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};