require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

// Middleware to parse JSON bodies
app.use(express.json()) // This ensures that req.body contains the parsed JSON

// Import routes
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const tradeRoutes = require('./routes/trade')

// Use the routes
app.use(authRoutes)
app.use(profileRoutes)
app.use(tradeRoutes)

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
