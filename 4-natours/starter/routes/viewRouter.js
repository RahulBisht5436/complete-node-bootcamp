const express = require('express');
const viewRouter = express.Router();

viewRouter.route('/').get((req, res) => {
    res.render('base',
        {
            title: 'The Park Camper',
            tour: 'The Forest Hiker',
            user: 'Rahul'

        });
})


viewRouter.route('/overview').get((req, res) => {
    return res.status(200).render('overview', {
        title: "All Tours"
    })
})

viewRouter.route('/tour').get((req, res) => {
    return res.status(200).render('tour', {
        title: "Forest Hiker"
    })
})


module.exports = viewRouter