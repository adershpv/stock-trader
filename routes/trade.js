const express = require('express')
const router = express.Router()
const { placeTrade, setAccessToken } = require('../services/kiteService')
const { getAccessToken } = require('../config/appConfig')

// Define the expected passphrase for security
const EXPECTED_PASSPHRASE = process.env.WEBHOOK_PASSPHRASE

// Route to handle TradingView webhook POST request
router.post('/trade', async (req, res) => {
    try {
        // Retrieve access token from Azure App Configuration
        const accessToken = await getAccessToken()
        setAccessToken(accessToken)

        // Validate access token
        if (!accessToken) {
            return res
                .status(401)
                .send('No access token available. Please log in.')
        }

        console.log(req.body)

        // Parse the TradingView alert payload
        const { tradingsymbol, transaction_type, quantity, passphrase } =
            req.body

        // Security check: validate the passphrase
        if (passphrase !== EXPECTED_PASSPHRASE) {
            return res.status(403).send('Invalid passphrase.')
        }

        // Validate the payload
        if (!tradingsymbol || !transaction_type || !quantity) {
            return res
                .status(400)
                .send(
                    'Invalid payload: tradingsymbol, transaction_type, and quantity are required.'
                )
        }

        // Prepare order details for KiteConnect
        const orderDetails = {
            symbol: tradingsymbol,
            action: transaction_type.toUpperCase(), // "BUY" or "SELL"
            quantity: parseInt(quantity, 10),
        }

        // Place the trade using KiteConnect
        const orderResponse = await placeTrade(orderDetails)

        return res.json(orderResponse)
    } catch (err) {
        console.error('Error processing trade:', err)

        // Send back the error response from KiteConnect
        const status = err.status || 500
        const message = err.message || 'Failed to execute trade'
        const details = err.details || null

        return res.status(status).json({
            success: false,
            message,
            details,
        })
    }
})

module.exports = router
