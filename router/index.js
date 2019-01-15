const { Router } = require('express')

const router = Router()

const btc = require('./bitcoin')
const eth = require('./ethereum')

router.use('/btc', btc);
router.use('/eth', eth);

exports.router = router;
