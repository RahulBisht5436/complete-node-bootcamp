import axios from 'axios'

// user is now available as a global variable from account.pug

const updateUserInfo = async function (email, name) {
    try {
        const response = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
            data: {
                email,
                name
            }
        });

    } catch (error) {
        console.log(error.response.data.message);
    }
}

export { updateUserInfo }