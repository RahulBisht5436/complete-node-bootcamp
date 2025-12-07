import axios from 'axios'

// user is now available as a global variable from account.pug

const updateUserInfo = async function (type, infoObject) {
    try {
        let endPoint = ""
        if (type == "infoUpdate") {
            endPoint = "updateMe"
        } else if (type == "password") {
            endPoint = 'updatepassword'
        } else {
            return
        }

        console.log(infoObject,endPoint,"send data to server")

        const response = await axios({
            method: 'POST',
            url: `http://127.0.0.1:3000/api/v1/users/${endPoint}`,
            data: infoObject
        });

    } catch (error) {
        console.log(error.response.data.message);
    }
}

export { updateUserInfo }