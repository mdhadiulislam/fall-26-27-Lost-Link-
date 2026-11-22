
function showRoleFields() {
  let role = document.getElementById("role").value;

  document.getElementById("studentFields").style.display = role === "Student" ? "block" : "none";
  document.getElementById("staffFields").style.display = role === "University Staff" ? "block" : "none";
  document.getElementById("securityFields").style.display = role === "Security Officer" ? "block" : "none";

  document.getElementById("studentId").disabled = role !== "Student";
  document.getElementById("employeeId").disabled = role !== "University Staff";
  document.getElementById("securityId").disabled = role !== "Security Officer";
}

function validateRegister() {
  clearErrors();

  document.getElementById("registerMessage").textContent = "";

  let name = document.getElementById("fullName").value.trim();
  let email = document.getElementById("email").value.trim();
  let username = document.getElementById("newUsername").value.trim();
  let password = document.getElementById("newPassword").value;
  let valid = true;

  if (name.length < 2) {
    showError("fullName", "Enter your full name.");
    valid = false;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showError("email", "Enter a valid email address.");
    valid = false;
  }

  if (!/^[a-zA-Z0-9._-]{3,}$/.test(username)) {
    showError("newUsername", "Use at least 3 letters or numbers.");
    valid = false;
  }

  if (password.length < 6) {
    showError("newPassword", "Password must have at least 6 characters.");
    valid = false;
  }

  if (!valid) {
    return false;
  }

  document.getElementById("registerMessage").textContent =
    "Signup is disabled in this demo. Please use a demo account to log in.";

  return false;
}

showRoleFields();
