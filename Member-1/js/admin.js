/* LostLink Admin Dashboard JavaScript
   Uses the shared data arrays and helper functions from shared/js/data.js and common.js.
*/

function getValue(id) {
    let element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function setText(id, value) {
    let element = document.getElementById(id);
    if (element) element.textContent = value;
}

function renderUsers() {
    let search = getValue("userSearch");
    let table = "";

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let userText = (user.name || "") + " " + (user.username || "") + " " + (user.role || "") + " " + (user.status || "");

        if (searchMatch(userText, search)) {
            table += "<tr>" +
                "<td>" + escapeText(user.name || "") + "</td>" +
                "<td>" + escapeText(user.username || "") + "</td>" +
                "<td>" + escapeText(user.role || "") + "</td>" +
                "<td>" + escapeText(user.status || "") + "</td>" +
                "<td><button class='btn btn-small' onclick='editUser(" + i + ")'>Edit</button> " +
                "<button class='btn btn-small btn-danger' onclick='deleteUser(" + i + ")'>Delete</button></td>" +
                "</tr>";
        }
    }

    let target = document.getElementById("usersTable");
    if (target) target.innerHTML = table || "<tr><td colspan='5'>No users found.</td></tr>";
}

function saveUser() {
    let name = getValue("userName");
    let username = getValue("userUsername");
    let role = getValue("userRole");
    let status = getValue("userStatus");
    let index = Number(document.getElementById("userIndex").value);

    if (!name || !username) {
        setText("userMessage", "Please enter name and username.");
        return false;
    }

    for (let i = 0; i < users.length; i++) {
        if (users[i].username.toLowerCase() === username.toLowerCase() && i !== index) {
            setText("userMessage", "This username already exists.");
            return false;
        }
    }

    if (index === -1) {
        users.push({
            name: name,
            username: username,
            password: "demo123",
            role: role,
            status: status
        });
        setText("userMessage", "User added. Default password: demo123");
    } else if (users[index]) {
        users[index].name = name;
        users[index].username = username;
        users[index].role = role;
        users[index].status = status;
        setText("userMessage", "User updated successfully.");
    }

    persistData();
    document.getElementById("userIndex").value = -1;
    document.querySelector("#usersSection form").reset();
    renderUsers();
    updateReport();
    return false;
}

function editUser(index) {
    let user = users[index];
    if (!user) return;

    document.getElementById("userIndex").value = index;
    document.getElementById("userName").value = user.name || "";
    document.getElementById("userUsername").value = user.username || "";
    document.getElementById("userRole").value = user.role || "Student";
    document.getElementById("userStatus").value = user.status || "Active";
    setText("userMessage", "Editing user: " + (user.name || ""));
    document.getElementById("userName").focus();
}

function deleteUser(index) {
    if (!users[index]) return;
    if (users[index].role === "Admin") {
        setText("userMessage", "The Admin account cannot be deleted here.");
        return;
    }

    if (confirm("Are you sure you want to delete this user?")) {
        users = removeRecord(users, index);
        persistData();
        renderUsers();
        updateReport();
        setText("userMessage", "User deleted successfully.");
    }
}

/* System Report: totals are calculated from the shared project data. */
function updateReport() {
    let returned = 0;

    for (let i = 0; i < foundItems.length; i++) {
        if (foundItems[i].status === "Returned") returned++;
    }

    setText("totalUsers", users.length);
    setText("totalLost", lostReports.length);
    setText("totalFound", foundItems.length);
    setText("totalReturned", returned);
}

/* Account Approvals */
function renderApprovals() {
    let table = "";

    for (let i = 0; i < accountRequests.length; i++) {
        let request = accountRequests[i];
        table += "<tr>" +
            "<td>" + escapeText(request.name || "") + "</td>" +
            "<td>" + escapeText(request.username || "") + "</td>" +
            "<td>" + escapeText(request.role || "") + "</td>" +
            "<td><span class='badge pending-badge'>" + escapeText(request.status || "Pending") + "</span></td>" +
            "<td><button class='btn btn-small' onclick='approveAccount(" + i + ")'>Approve</button> " +
            "<button class='btn btn-small btn-danger' onclick='rejectAccount(" + i + ")'>Reject</button></td>" +
            "</tr>";
    }

    let target = document.getElementById("approvalTable");
    if (target) target.innerHTML = table || "<tr><td colspan='5'>No account requests.</td></tr>";
    setText("pendingAccountCount", accountRequests.length + " Pending");
}

function approveAccount(index) {
    let request = accountRequests[index];
    if (!request) return;

    let alreadyExists = users.some(function(user) {
        return user.username.toLowerCase() === String(request.username || "").toLowerCase();
    });

    if (alreadyExists) {
        alert("This username already exists. The request was not approved.");
        return;
    }

    users.push({
        name: request.name || "",
        username: request.username || "",
        email: request.email || "",
        password: request.password || "demo123",
        role: request.role || "Student",
        status: "Active"
    });

    accountRequests = removeRecord(accountRequests, index);
    persistData();
    renderApprovals();
    renderUsers();
    updateReport();
}

function rejectAccount(index) {
    if (!accountRequests[index]) return;

    if (confirm("Are you sure you want to reject this account request?")) {
        accountRequests = removeRecord(accountRequests, index);
        persistData();
        renderApprovals();
    }
}

/* Item Moderation
   Shows the moderation queue plus actual lost and found records from shared data.
   Removing a lost/found record here removes it from the corresponding member dashboard too.
*/
function renderModeration() {
    let search = getValue("moderationSearch").toLowerCase();
    let table = "";

    for (let i = 0; i < moderationItems.length; i++) {
        let item = moderationItems[i];
        let text = [item.name, item.reporter, item.category, item.reason].join(" ").toLowerCase();

        if (text.indexOf(search) !== -1) {
            table += "<tr><td>" + escapeText(item.name || "") + "</td>" +
                "<td>" + escapeText(item.category || "") + "</td>" +
                "<td>" + escapeText(item.reporter || "") + "</td>" +
                "<td>" + escapeText(item.reason || "") + "</td>" +
                "<td><button class='btn btn-small btn-danger' onclick='removeModerationItem(\"queue\", " + i + ")'>Remove</button></td></tr>";
        }
    }

    for (let i = 0; i < lostReports.length; i++) {
        let item = lostReports[i];
        let text = [item.name, item.category, item.location, item.owner, item.description].join(" ").toLowerCase();

        if (text.indexOf(search) !== -1) {
            table += "<tr><td>" + escapeText(item.name || "") + "</td>" +
                "<td>" + escapeText(item.category || "") + "</td>" +
                "<td>" + escapeText(item.owner || "Student") + "</td>" +
                "<td>" + escapeText(item.description || item.location || "Lost item report") + "</td>" +
                "<td><button class='btn btn-small btn-danger' onclick='removeModerationItem(\"lost\", " + i + ")'>Remove</button></td></tr>";
        }
    }

    for (let i = 0; i < foundItems.length; i++) {
        let item = foundItems[i];
        let text = [item.name, item.category, item.location, item.status].join(" ").toLowerCase();

        if (text.indexOf(search) !== -1) {
            table += "<tr><td>" + escapeText(item.name || "") + "</td>" +
                "<td>" + escapeText(item.category || "") + "</td>" +
                "<td>University Staff</td>" +
                "<td>" + escapeText(item.location || item.status || "Found item report") + "</td>" +
                "<td><button class='btn btn-small btn-danger' onclick='removeModerationItem(\"found\", " + i + ")'>Remove</button></td></tr>";
        }
    }

    let target = document.getElementById("moderationTable");
    if (target) target.innerHTML = table || "<tr><td colspan='5'>No reports found.</td></tr>";
}

function removeModerationItem(source, index) {
    if (!confirm("Remove this item/report? This change will also appear on the related dashboard.")) return;

    if (source === "queue" && moderationItems[index]) {
        moderationItems = removeRecord(moderationItems, index);
    } else if (source === "lost" && lostReports[index]) {
        lostReports = removeRecord(lostReports, index);
    } else if (source === "found" && foundItems[index]) {
        foundItems = removeRecord(foundItems, index);
    } else {
        return;
    }

    persistData();
    renderModeration();
    updateReport();
}

/* Initialize all Admin dashboard sections. */
renderUsers();
updateReport();
renderApprovals();
renderModeration();
