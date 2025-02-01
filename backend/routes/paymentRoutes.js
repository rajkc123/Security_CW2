const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');

// Middleware to parse Stripe's raw body for webhooks
router.post(
    '/webhook',
    bodyParser.raw({ type: 'application/json' }),
    (req, res) => {
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

        // Handle the event types
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log(`Payment successful for session: ${session.id}`);
                // TODO: Update subscription in the database
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    }
);

// Create Stripe payment session
router.post('/create-payment-intent', async (req, res) => {
    const { amount, plan } = req.body;

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
        });

        res.json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ success: false, message: 'Unable to process payment' });
    }
});

module.exports = router;
