require('dotenv').config()
const express = require('express')
const KiteConnect = require('kiteconnect').KiteConnect

const api_key = process.env.API_KEY
const secret = process.env.API_SECRET

const options = {
    api_key: api_key,
    debug: false,
}

const kcSingleton = (() => {
    let kc

    function createInstance(request_token) {
        const instance = new KiteConnect(options)

        instance
            .generateSession(request_token, secret)
            .then(function (response) {
                console.log('Response', response)
                instance.setAccessToken(response.access_token)
            })
            .catch(function (err) {
                console.log(err)
            })

        return instance
    }

    function getInstance(data) {
        const { request_token, access_token } = data || {}
        if (request_token) {
            kc = createInstance(request_token)
        }
        if (access_token) {
            if (!kc) {
                kc = new KiteConnect(options)
            }
            kc.setAccessToken(access_token)
        }
        return kc
    }

    return { getInstance }
})()

const placeOrder = ({
    variety = 'regular',
    exchange = 'NFO',
    product = 'NRML',
    order_type = 'MARKET',
    tradingsymbol,
    transaction_type,
    quantity,
    price,
}) => {
    const order = {
        exchange, // "NFO", "NSE"
        tradingsymbol, // "BANKNIFTY24OCT52200CE", "NIFTY2350417600CE"
        transaction_type, // "BUY", "SELL"
        quantity, // 50, 100
        product, // "CNC", "MIS", "NRML"
        order_type, // "MARKET", "LIMIT"
    }
    if (price && order_type === 'LIMIT') {
        order.price = price
    }

    return kcSingleton.getInstance().placeOrder(
        variety, // regular, amo, co
        order
    )
}

const app = express()
app.use(express.json())
const port = process.env.PORT || 3000

app.get('/', async (req, res) => {
    res.send('Hello World!')
})

app.get('/login', async (req, res) => {
    res.redirect(
        `https://kite.zerodha.com/connect/login?v=3&api_key=${api_key}`
    )
})

app.get('/auth', async (req, res) => {
    const { request_token, access_token } = req.query || {}

    let response
    if (request_token) {
        response = await kcSingleton.getInstance({ request_token })
    } else if (access_token) {
        response = await kcSingleton.getInstance({ access_token })
    }

    res.send(response)
})

app.post('/trade', async (req, res) => {
    if (req.body.passphrase !== 'adr1681!') res.send('Invalid request')

    try {
        const response = await placeOrder(req.body)
        console.log(response)
        res.send(response)
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

app.get('/profile', async (req, res) => {
    try {
        const response = await kcSingleton.getInstance().getProfile()
        res.send(response)
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
