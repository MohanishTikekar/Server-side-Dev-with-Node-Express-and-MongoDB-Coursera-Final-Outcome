const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
var authenticate = require('../authenticate');
const cors = require('./cors');



favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favorites.find({})
            .populate("favs")
            .populate("owner")

            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ owner: req.user._id })
            .then((user_doc) => {
                if (user_doc == null) {
                    Favorites.create({ "owner": req.user._id, 'favs': req.body })
                        .then((favorite) => {
                            Favorites.findOne({ owner: req.user._id })
                                .populate("favs")
                                .populate("owner")

                                .then((favorites) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorites);
                                }, (err) => next(err))
                        }, (err) => next(err))

                }
                else {
                    for (index = 0; index < req.body.length; index++) {
                        if (!JSON.stringify(user_doc.favs).includes(JSON.stringify(req.body[index]._id))) {
                            user_doc.favs.push(req.body[index]);
                        }
                    }
                    user_doc.save()
                        .then((user_doc) => {
                            Favorites.findById(user_doc._id)
                                .populate("favs")
                                .populate("owner")
                                .then((user_doc) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(user_doc);
                                })
                        }, (err) => next(err));
                }
            }, (err) => next(err)).catch((err) => next(err));


    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ owner: req.user._id })
            .then((user_doc) => { user_doc.remove({}) })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ owner: req.user._id })
            .then((user_doc) => {
                if (user_doc == null) {
                    Favorites.create({ "owner": req.user._id, 'favs': req.params.dishId })
                        .then((favorite) => {
                            Favorites.findOne({ owner: req.user._id })
                                .populate("favs")
                                .populate("owner")
                                .then((favorites) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorites);
                                }, (err) => next(err))
                        }, (err) => next(err))

                }
                else {

                    if (!JSON.stringify(user_doc.favs).includes(JSON.stringify(req.params.dishId))) {
                        user_doc.favs.push(req.params.dishId);
                    }
                    user_doc.save()
                        .then((user_doc) => {
                            Favorites.findById(user_doc._id)
                                .populate("favs")
                                .populate("owner")
                                .then((user_doc) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(user_doc);
                                })
                        }, (err) => next(err));
                }
            }, (err) => next(err)).catch((err) => next(err));

    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ owner: req.user._id })
            .then((user_doc) => {
                if (user_doc == null) {
                    err = new Error("comment not found");
                    err.status = 404;
                    return next(err);
                }

                else {
                    if (!JSON.stringify(user_doc.favs).includes(JSON.stringify(req.params.dishId))) {
                        err = new Error("comment not found");
                        err.status = 404;
                        return next(err);
                    }
                    else {

                        const index = user_doc.favs.indexOf(req.params.dishId);
                        if (index > -1) {
                            user_doc.favs.splice(index, 1);
                        }
                        user_doc.save()
                            .then((user_doc) => {
                                Favorites.findById(user_doc._id)
                                    .populate("favs")
                                    .populate("owner")
                                    .then((user_doc) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(user_doc);
                                    })
                            }, (err) => next(err));
                    }

                }
            }, (err) => next(err)).catch((err) => next(err));
    });
module.exports = favoriteRouter;