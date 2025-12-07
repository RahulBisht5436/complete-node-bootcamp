import axios from 'axios'
import { showAlerts } from './utilities/alert'
// user is now available as a global variable from account.pug

const updateUserInfo = async function (type, infoObject) {
    try {
        let endPoint = ""
        let method = 'POST'
        if (type == "infoUpdate") {
            endPoint = "updateMe"
            method = 'POST'
        } else if (type == "password") {
            endPoint = 'updatepassword'
            method = 'PATCH'
        } else {
            return
        }

        console.log(infoObject,endPoint,"send data to server")

        const response = await axios({
            method,
            url: `http://127.0.0.1:3000/api/v1/users/${endPoint}`,
            data: infoObject
        });
        showAlerts('success', 'Updated successfully!')

    } catch (error) {
        showAlerts('error', error.response.data.message)
        console.log(error.response.data.message);
    }
}

export { updateUserInfo }