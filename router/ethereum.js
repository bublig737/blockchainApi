'use strict';
const eth = require('../api/ethereum')
const { Router } = require('express')

const router = Router()

router.route('/create')
    .get((req, res, next) => {
        const account = eth.createAccount()
        try {
            res.send(JSON.stringify(account))
        } catch (error) {
            res.send(error);
        }
    });

router.route('/sendTransaction')
    .post(async (req, res, next) => {
        const {
            addressesFrom, privateFrom, addressTo, value
        } = req.body;
        try {
            let answer = await eth.sendTransaction(addressesFrom, privateFrom, addressTo, value)
            res.send(JSON.stringify(answer))
        } catch (error) {
            res.send(error);
        }
    });

router.route('/getBalance')
    .post(async (req, res, next) => {
        const {
            address
        } = req.body        
        try {
            let answer = await eth.getBalance(address)
            res.send(JSON.stringify(answer))
        } catch (error) {
            res.send(error);
        }
    });

module.exports = router;