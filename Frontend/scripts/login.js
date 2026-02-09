//html elements
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("pass");
const button = document.getElementById("logBtn");
const errorTxt = document.querySelector(".error");

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (token) {
    window.location.href = "index.html";
  }
});

//login button click functionality
button.onclick = async () => {
  //get email and password values
  const email = emailEl.value;
  const password = passwordEl.value;

  const res = await fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  if (email === "" || password === "") {
    errorTxt.style.display = "inline";
    errorTxt.textContent = "please fill in all details";
  } else if (res.status === 400) {
    errorTxt.style.display = "inline";
    errorTxt.textContent = "incorrect details";
  } else if (res.status === 200) {
    data = await res.json();
    localStorage.setItem("token", data.token);
    errorTxt.style.display = "none";
    window.location.href = "index.html";
  }
};
