const root = document.createElement("english-tools-content-script-root");
document.body.appendChild(root);

const form = document.createElement("form");
form.id = "english-tools-form-add-card";
root.appendChild(form);

const formTitle = document.createElement("h3");
formTitle.id = "form-title";
formTitle.innerHTML = "Add new card";
form.appendChild(formTitle);

const inputWord = document.createElement("input");
inputWord.id = "input-word";
form.appendChild(inputWord);

const inputTranslate = document.createElement("input");
inputTranslate.id = "input-translate";
form.appendChild(inputTranslate);

const formBtn = document.createElement("button");
formBtn.id = "btn-submit";
formBtn.innerText = "Submit";
form.appendChild(formBtn);

const formCloseBtn = document.createElement("button");
formCloseBtn.id = "btn-close";
form.appendChild(formCloseBtn);

const formLoader = document.createElement("div");
formLoader.id = "form-loader";
form.appendChild(formLoader);

const btn = document.createElement("div");
btn.id = "english-tools-btn-add-open-form";
btn.innerText = "ET";
root.appendChild(btn);

export default {
  root,
  btn,
  form,
  inputWord,
  inputTranslate,
  formBtn,
  formCloseBtn,
  formTitle,
};
