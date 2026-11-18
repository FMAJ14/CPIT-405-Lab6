// ---------- Cookie helpers ----------
function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ---------- DOM references ----------
const likeBtn = document.getElementById("like-btn");
const dislikeBtn = document.getElementById("dislike-btn");
const likeCount = document.getElementById("like-count");
const dislikeCount = document.getElementById("dislike-count");
const voteMessage = document.getElementById("vote-message");
const commentForm = document.getElementById("comment-form");
const commentInput = document.getElementById("comment-input");
const submitBtn = document.getElementById("submit-btn");
const commentsList = document.getElementById("comments-list");
const resetBtn = document.getElementById("reset-btn");
const resetMessage = document.getElementById("reset-message");

// ---------- Step 2: initial state ----------
let likes = 0;
let dislikes = 0;
let comments = [];

// ---------- UI update ----------
function updateUI() {
    likeCount.textContent = likes;
    dislikeCount.textContent = dislikes;

    // disable voting once the user has voted
    const vote = getCookie("vote");
    likeBtn.disabled = vote !== null;
    dislikeBtn.disabled = vote !== null;

    // disable commenting once the user has commented
    const hasCommented = getCookie("comments") !== null;
    commentInput.disabled = hasCommented;
    submitBtn.disabled = hasCommented;

    // redraw the comments list
    commentsList.innerHTML = "";
    for (const text of comments) {
        const li = document.createElement("li");
        li.textContent = text; // textContent, so HTML in comments can't run
        commentsList.appendChild(li);
    }
}

// ---------- Step 2 & 6: load saved state from cookies ----------
function loadState() {
    const vote = getCookie("vote");
    if (vote === "like") likes = 1;
    if (vote === "dislike") dislikes = 1;

    const savedComments = getCookie("comments");
    if (savedComments) comments = JSON.parse(savedComments);

    updateUI();
}

// ---------- Step 3: like / dislike ----------
function handleVote(type) {
    if (getCookie("vote")) {
        voteMessage.textContent = "You have already voted.";
        return;
    }

    if (type === "like") likes++;
    else dislikes++;

    setCookie("vote", type); // remember the vote so the user can't vote again
    voteMessage.textContent = "";

    // optional: small pop animation
    const btn = type === "like" ? likeBtn : dislikeBtn;
    btn.classList.add("pop");
    setTimeout(() => btn.classList.remove("pop"), 400);

    updateUI();
}

likeBtn.addEventListener("click", () => handleVote("like"));
dislikeBtn.addEventListener("click", () => handleVote("dislike"));

// ---------- Step 4: comments ----------
commentForm.addEventListener("submit", event => {
    event.preventDefault(); // stop the form from reloading the page

    if (getCookie("comments")) {
        voteMessage.textContent = "You have already commented.";
        return;
    }

    const text = commentInput.value.trim();
    if (text === "") {
        voteMessage.textContent = "Please write a comment first.";
        return;
    }

    comments.push(text);
    setCookie("comments", JSON.stringify(comments)); // also blocks a 2nd comment
    commentInput.value = ""; // clear the input
    voteMessage.textContent = "";

    updateUI();
});

// ---------- Step 5: reset ----------
resetBtn.addEventListener("click", () => {
    deleteCookie("vote");
    deleteCookie("comments");

    likes = 0;
    dislikes = 0;
    comments = [];
    voteMessage.textContent = "";

    updateUI();

    // optional: confirmation message
    resetMessage.textContent = "Your vote and comments have been reset. You can vote again.";
    setTimeout(() => (resetMessage.textContent = ""), 3000);
});

// ---------- Start ----------
loadState();
