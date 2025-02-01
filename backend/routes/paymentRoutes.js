const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const rateLimit = require('express-rate-limit');
const User = require('../models/userModel');

// Apply rate limiter only on webhooks
const webhookLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

// Middleware to parse raw body for webhook signature verification
router.post(
    '/webhook', webhookLimiter,
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log('Webhook event received:', event.type);

        if (event.type === 'checkout.session.completed') {
            try {
                await handleSessionCompleted(event);
                res.status(200).send('Subscription updated.');
            } catch (err) {
                console.error('Error handling checkout session:', err);
                res.status(500).send('Internal Server Error');
            }
        } else {
            console.log(`Unhandled event type: ${event.type}`);
            res.status(400).send('Event not handled');
        }
    }
);

// Extracted function to handle successful payment session completion
async function handleSessionCompleted(event) {
    const session = event.data.object;
    const { userId, plan } = session.metadata;

    console.log(`Handling session for userId: ${userId}, plan: ${plan}`);

    if (!userId || !plan) {
        throw new Error('User ID or plan is missing in session metadata.');
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User not found with ID: ${userId}`);
        }

        console.log('User found in database:', userId);

        let newExpiryDate = new Date();
        const duration = plan === '7-days' ? 7 : 15;

        // Extend subscription if already active
        if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()) {
            console.log('User already has an active subscription. Extending expiry date.');
            newExpiryDate = new Date(user.subscriptionExpiry);
        }
        newExpiryDate.setDate(newExpiryDate.getDate() + duration);

        console.log('New subscription expiry date:', newExpiryDate);

        // Update in MongoDB
        await User.findByIdAndUpdate(userId, {
            subscriptionPlan: plan,
            subscriptionExpiry: newExpiryDate,
        });

        // Update user subscription in MongoDB
        user.subscriptionPlan = plan;
        user.subscriptionExpiry = newExpiryDate;
        await user.save();

        console.log(`Subscription successfully updated for user ${userId} with plan ${plan}`);
    } catch (err) {
        console.error('Error updating subscription in MongoDB:', err);
        throw err;  // Rethrow error for proper handling in the webhook route
    }
}

// Create Stripe payment session
router.post('/create-payment-intent', async (req, res) => {
    const { amount, plan, userId } = req.body;

    console.log('Payment session initiation:', { userId, plan, amount });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'npr',
                        product_data: { name: `Uplingoo ${plan} Access` },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/pricing?paymentSuccess=true',
            cancel_url: 'http://localhost:3000/pricing?paymentSuccess=false',
            metadata: { userId, plan },  // Ensure metadata is properly set
        });

        console.log('Payment session created successfully:', session.id);

        res.json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error('Error creating payment session:', error);
        res.status(500).json({ success: false, message: 'Unable to process payment' });
    }
});

module.exports = router;
