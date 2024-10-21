const KiteConnect = require('kiteconnect').KiteConnect

// Replace these with your KiteConnect API credentials
const apiKey = process.env.KITE_API_KEY
const apiSecret = process.env.KITE_API_SECRET

// Initialize KiteConnect with the API key
const kc = new KiteConnect({ api_key: apiKey })

// Get login URL
function getLoginUrl() {
    return kc.getLoginURL()
}

// Generate session and return the access token
async function generateSession(requestToken) {
    const session = await kc.generateSession(requestToken, apiSecret)
    return session.access_token
}

// Set access token for subsequent requests
function setAccessToken(accessToken) {
    kc.setAccessToken(accessToken)
}

// Fetch user profile
async function getUserProfile() {
    return await kc.getProfile()
}

// Function to invalidate the session (logout)
async function logout(accessToken) {
    try {
        // Set the access token for the KiteConnect instance
        kc.setAccessToken(accessToken)
        return await kc.invalidateAccessToken(accessToken)
    } catch (err) {
        console.error('Error logging out:', err)
        throw {
            status: 500,
            message: err.message, // Return the error message from Kite
            details: err.response ? err.response : null, // Include additional details if available
        }
    }
}

// Function to place a trade order based on webhook data
async function placeTrade(orderDetails) {
    try {
        const orderParams = {
            exchange: orderDetails.exchange || 'NFO', // Default exchange (customize as needed)
            product: orderDetails.product || 'NRML', // Customizable: CNC, MIS, etc.
            order_type: orderDetails.order_type || 'MARKET', // Market order by default

            tradingsymbol: orderDetails.symbol, // Stock or asset symbol
            transaction_type: orderDetails.action, // "BUY" or "SELL"
            quantity: orderDetails.quantity, // Quantity of the stock
        }

        if (orderDetails.price && order_type === 'LIMIT') {
            orderParams.price = orderDetails.price
        }

        // Place the order through KiteConnect API
        return await kc.placeOrder('regular', orderParams)
    } catch (err) {
        console.error('Error placing order:', err)
        throw {
            status: 500,
            message: err.message, // Return the error message from Kite
            details: err.response ? err.response : null, // Include additional details if available
        }
    }
}

module.exports = {
    getLoginUrl,
    generateSession,
    setAccessToken,
    getUserProfile,
    logout,
    placeTrade,
}
