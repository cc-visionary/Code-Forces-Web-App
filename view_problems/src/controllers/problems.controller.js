const db = require("../models");
const Problems = db.problems;
const Op = db.Sequelize.Op;

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
    Problems.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving problems."
            });
        });
};

// Find a single problem with an problem_id
exports.findOne = (req, res) => {
    const id = req.params.problem_id;
    Problems.findOne({ where: {problem_id: id }})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
            message: "Error retrieving Problem with problem_id=" + id
            });
        });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
    const id = req.params.problem_id;

    Problems.update(req.body, { where: { problem_id: id }})
        .then(data => {
            res.send(req.body);
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving tutorials."
            });
        })
};