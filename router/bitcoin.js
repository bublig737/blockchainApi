'use strict';
const btc = require('../api/bitcoin')
const { Router } = require('express')

const router = Router()

router.route('/create')
    .get(async (req, res, next) => {
        const account = await btc.genAddress()
        try {
            res.send(JSON.stringify(account))
        } catch (error) {
            res.send(error.toString());
        }
    });

router.route('/crane')
    .post(async (req, res, next) => {
        const {
            address,
            amount
        } = req.body;
        try {
            let answer = await btc.crane(address, amount)
            res.send(JSON.stringify(answer))
        } catch (error) {          
            res.send(error.toString());
        }
    });

router.route('/getBalance')
    .post(async (req, res, next) => {
        const {
            address
        } = req.body
        try {
            let answer = await btc.getBalance(address)
            res.send(JSON.stringify(answer))
        } catch (error) {
            res.send(error.toString());
        }
    });

router.route('/sendTransaction')
    .post(async (req, res, next) => {
        const {
            wifFrom,
            addressTo,
            amount
        } = req.body
        try {
            let answer = await btc.createSignSendTx(wifFrom, addressTo, amount)
            res.send(JSON.stringify(answer))
        } catch (error) {
            res.send(error.toString());
        }
    });

module.exports = router;