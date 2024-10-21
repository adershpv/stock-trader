const express = require('express')
const router = express.Router()
const {
    getLoginUrl,
    generateSession,
    logout,
} = require('../services/kiteService')
const { saveAccessToken, getAccessToken } = require('../config/appConfig')

router.get('/', async (req, res) => {
    res.send('Hello World!')
})

// Route to initiate login
router.get('/login', (req, res) => {
    const loginUrl = getLoginUrl()
    res.redirect(loginUrl)
})

// Callback route for handling the OAuth response
router.get('/auth', async (req, res) => {
    const requestToken = req.query.request_token

    try {
        // Generate session and get access token
        const accessToken = await generateSession(requestToken)

        // Save the access token in Azure App Configuration
        await saveAccessToken(accessToken)

        res.send('Login successful!')
    } catch (err) {
        console.error('Error generating session: ', err)
        res.status(500).send('Error during login')
    }
})

// Route to log out from KiteConnect
router.get('/logout', async (req, res) => {
    try {
        // Retrieve the current access token from Azure App Configuration
        const accessToken = await getAccessToken()

        if (!accessToken) {
            return res.status(400).send('No active session to log out.')
        }

        // Call the logout function to invalidate the session
        await logout(accessToken)

        // Clear the access token from Azure App Configuration
        await saveAccessToken('') // Save an empty value to remove the token

        res.send('Successfully logged out from KiteConnect.')
    } catch (err) {
        console.error('Error during logout:', err)
        res.status(500).send('Error logging out from KiteConnect.')
    }
})

module.exports = router
