// Felix Silva
// INF651 Final Project

// 1. createElemWithText
function createElemWithText(elemType = "p", text = "", className) {
  const elem = document.createElement(elemType);
  elem.textContent = text;
  if (className) elem.className = className;
  return elem;
}

// 2. createSelectOptions
function createSelectOptions(users) {
  if (!users) return undefined;
  const options = [];
  for (const user of users) {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.name;
    options.push(option);
  }
  return options;
}

// 3. toggleCommentSection
function toggleCommentSection(postId) {
  if (!postId) return;
  const section = document.querySelector(`section[data-post-id="${postId}"]`);
  if (!section) return null;
  section.classList.toggle("hide");
  return section;
}

// 4. toggleCommentButton
function toggleCommentButton(postId) {
  if (!postId) return;
  const button = document.querySelector(`button[data-post-id="${postId}"]`);
  if (!button) return null;

  button.textContent =
    button.textContent === "Show Comments"
      ? "Hide Comments"
      : "Show Comments";

  return button;
}

// 5. deleteChildElements
function deleteChildElements(parentElement) {
  if (!parentElement || !(parentElement instanceof HTMLElement)) return;

  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
  return parentElement;
}

// 6. addButtonListeners
function addButtonListeners() {
  const buttons = document.querySelectorAll("main button");
  if (!buttons.length) return buttons;

  buttons.forEach((button) => {
    const postId = button.dataset.postId;

    if (!postId) {
      const cleanButton = button.cloneNode(true);
      button.replaceWith(cleanButton);
      return;
    }

    const handler = (event) => toggleComments(event, postId);
    button.addEventListener("click", handler);
  });

  return buttons;
}

// 7. removeButtonListeners
function removeButtonListeners() {
  const buttons = document.querySelectorAll("main button");

  buttons.forEach((button) => {
    const postId = button.dataset.postId;
    if (postId) {
      button.removeEventListener("click", (event) =>
        toggleComments(event, postId)
      );
    }
  });

  return buttons;
}

// 8. createComments
function createComments(comments) {
  if (!comments) return;

  const fragment = document.createDocumentFragment();

  comments.forEach((comment) => {
    const article = document.createElement("article");
    const h3 = createElemWithText("h3", comment.name);
    const bodyP = createElemWithText("p", comment.body);
    const emailP = createElemWithText("p", `From: ${comment.email}`);

    article.append(h3, bodyP, emailP);
    fragment.append(article);
  });

  return fragment;
}

// 9. populateSelectMenu
function populateSelectMenu(users) {
  if (!users) return undefined;

  const selectMenu = document.querySelector("#selectMenu");
  const options = createSelectOptions(users);

  options.forEach((option) => selectMenu.append(option));

  return selectMenu;
}


// 10. getUsers
async function getUsers() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    return await response.json();
  } catch (err) {
    console.error(err);
  }
}

// 11. getUserPosts
async function getUserPosts(userId) {
  if (userId === undefined || userId === null) return undefined;

  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${userId}`
    );
    return await response.json();
  } catch (err) {
    console.error(err);
  }
}

// 12. getUser
async function getUser(userId) {
	if (!userId) return undefined;

  try {

    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}`
    );
    return await response.json();
  } catch (err) {
    console.error(err);
  }
}

// 13. getPostComments
async function getPostComments(postId) {
	if (!postId) return undefined;

	try {
  	const response = await fetch(
      `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
    );
    return await response.json();
  } catch (err) {
    console.error(err);
  }
}

// 14. displayComments
async function displayComments(postId) {
	if (!postId) return undefined;

  const section = document.createElement("section");
  section.dataset.postId = postId;
  section.classList.add("comments", "hide");

  const comments = await getPostComments(postId);
  const fragment = createComments(comments);

  section.append(fragment);
  return section;
}

// 15. createPosts
async function createPosts(posts) {
	if(!posts) return undefined;

  const fragment = document.createDocumentFragment();

  for (const post of posts) {
    const article = document.createElement("article");

    const h2 = createElemWithText("h2", post.title);
    const bodyP = createElemWithText("p", post.body);
    const idP = createElemWithText("p", `Post ID: ${post.id}`);

    const author = await getUser(post.userId);
    const authorP = createElemWithText(
      "p",
      `Author: ${author.name} with ${author.company.name}`
    );
    const catchP = createElemWithText("p", author.company.catchPhrase);

    const button = createElemWithText("button", "Show Comments");
    button.dataset.postId = post.id;

    const section = await displayComments(post.id);

    article.append(h2, bodyP, idP, authorP, catchP, button, section);
    fragment.append(article);
  }

  return fragment;
}

// 16. displayPosts
async function displayPosts(posts) {
  const main = document.querySelector("main");

  // if no posts, return default paragraph
  if (!posts) {
    const p = createElemWithText("p", "Select an Employee to display their posts.", "default-text");
    main.append(p);
    return p;
  }

  const element = await createPosts(posts);
  main.append(element);
  return element;
}


// 17. toggleComments
function toggleComments(event, postId) {
  if (!event || !postId) return;

  event.target.listener = true; // required for test

  const section = toggleCommentSection(postId);
  const button = toggleCommentButton(postId);

  return [section, button];
}

// 18. refreshPosts
async function refreshPosts(posts) {
	if (!posts) return undefined;

  const removeButtons = removeButtonListeners();
  const main = deleteChildElements(document.querySelector("main"));
  const fragment = await displayPosts(posts);
  const addButtons = addButtonListeners();

  return [removeButtons, main, fragment, addButtons];
}

// 19. selectMenuChangeEventHandler
async function selectMenuChangeEventHandler(event) {
  const target = event?.target || event;
  if (!target) return undefined;

  target.disabled = true;

  const rawValue = target.value;
  const userId =
    rawValue === undefined || rawValue === null || rawValue === ""
      ? 1
      : Number(rawValue);

  const posts = await getUserPosts(userId);
  const refreshPostsArray = await refreshPosts(posts);

  target.disabled = false;

  return [userId, posts, refreshPostsArray];
}

// 20. initPage
async function initPage() {
  const users = await getUsers();
  const select = populateSelectMenu(users);
  return [users, select];
}

// 21. initApp
function initApp() {
  initPage();
  const selectMenu = document.querySelector("#selectMenu");
  selectMenu.addEventListener("change", selectMenuChangeEventHandler);
}

document.addEventListener("DOMContentLoaded", initApp);