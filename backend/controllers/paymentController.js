const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');

exports.processPayment = async (req, res) => {
    const { amount, currency, userId, plan } = req.body;

    try {
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,  // Convert to cents
            currency: currency || 'usd',
            metadata: { userId, plan },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,  // Send this to the frontend
        });
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ success: false, message: 'Payment failed' });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { userId, plan } = paymentIntent.metadata;

        // Set subscription expiry in user account
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan === '7-days' ? 7 : 15));

        await User.findByIdAndUpdate(userId, {
            subscriptionPlan: plan,
            subscriptionExpiry: expiryDate,
        });

        console.log(`Payment for ${userId} completed successfully`);
    }

    res.status(200).send('Event received');
};
