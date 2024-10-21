const express = require('express')
const router = express.Router()
const { setAccessToken, getUserProfile } = require('../services/kiteService')
const { getAccessToken } = require('../config/appConfig')

// Route to get user profile using the stored access token
router.get('/profile', async (req, res) => {
    try {
        // Retrieve the access token from Azure App Configuration
        const accessToken = await getAccessToken()

        console.log({ accessToken })

        // Set the access token to the KiteConnect instance
        setAccessToken(accessToken)

        // Fetch user profile
        const profile = await getUserProfile()
        res.json(profile)
    } catch (err) {
        console.error('Error fetching profile: ', err)
        res.status(500).send('Error fetching profile')
    }
})

module.exports = router
