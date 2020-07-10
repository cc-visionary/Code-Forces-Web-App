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
  

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
    const id = req.params.problem_id;

    Problems.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                message: "Problem was updated successfully."
                });
            } else {
                res.send({
                message: `Cannot update Problem with id=${id}. Maybe Problem was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Tutorial with id=" + id
            });
        });
};