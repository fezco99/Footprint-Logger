//html elements
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("pass");
const usernameEl = document.getElementById("username");
const button = document.getElementById("signupBtn");
const errorTxt = document.querySelector(".error");

//signup button functionality
button.onclick = async () => {
  //get input values
  const email = emailEl.value;
  const password = passwordEl.value;
  const username = usernameEl.value;

  const emailRegex =
    /^(?:[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~]+)*)@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  //validate email and password
  if (!emailRegex.test(email)) {
    errorTxt.style.display = "inline";
    errorTxt.textContent = "email is invalid";
    return;
  }
  // if (!passwordRegex.test(password)) {
  //   errorTxt.style.display = "inline";
  //   errorTxt.innerHTML =
  //     "password is weak<br>at least 1 uppercase letter<br>at least 1 number<br>at least 1 special char<br>at least 8 chars";
  //   return;
  // }

  //make api request
  const res = await fetch("http://localhost:8080/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
      username: username,
    }),
  });

  if (res.status === 201) {
    window.location.href = "login.html";
  } else {
    const data = await res.json();
    console.log(res);
  }
};
