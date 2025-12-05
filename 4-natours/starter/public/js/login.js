const formElement = document.querySelector(".form")

if (formElement) {
    formElement.addEventListener("submit", function (e) {
        e.preventDefault();
        const emailData = document.getElementById('email').value
        const passwordData = document.getElementById('password').value
        if (emailData && passwordData) {
            Login(emailData, passwordData)
        }
    });
}


async function Login(email, password) {
    try {
        const response = await axios({
            method: 'POST',
            url: "http://127.0.0.1:3000/api/v1/users/login",
            data: {
                email,
                password
            }
        })
        if (response.data.status == "success") {
            window.location.href = "/"
        }
        console.log(response)
    } catch (error) {
        console.log(error)
    }

}

// FUNCTION WRITTEN BY ME BEFORE THE AXIOS
// async function Login(email, password) {
//     const raw = {
//         "email": email,
//         "password": password
//     };
//     const requestOptions = {
//         method: "POST",
//         body: JSON.stringify(raw),
//         redirect: "follow",
//         headers:{
//              "Content-Type": "application/json"
//         }
//     };

//     await fetch("/api/v1/users/login", requestOptions)
//         .then((response) => response.json())
//         .then((result) => {
//             if (result.status == "success") successfulLogin()
//         })
//         .catch((error) => console.error(error));
// }

// function successfulLogin(){
//     window.location.href="/"
// }