"use strict";

(() => {
  const local = {
    ua: {
      formError: "formSelector повинен бути дійсним селектором DOM EL!",
      containerError: "containerSelector повинен бути дійсним селектором DOM EL!",
      dataKeyError: "Ви повинні визначити ключ даних для спочатку",
      langError: "Ви повинні визначити поточну мову",
    },
    en: {
      formError: "formSelector should be a valid dom el selector!",
      containerError: "containerSelector should be a valid dom el selector!",
      dataKeyError: "You should define data key for first",
      langError: "You should define current lang",
    },
  };

  const model = {
    DATA_KEY: null,
    id: 0,

    getTodos() {
      return JSON.parse(localStorage.getItem(this.DATA_KEY)) || [];
    },

    saveTodo(data) {
      const savedData = this.getTodos();
      const localData = structuredClone(data);
      localData.id = ++this.id;

      savedData.push(localData);
      localStorage.setItem(this.DATA_KEY, JSON.stringify(savedData));
      return localData;
    },

    bulkSaveTodos(data) {
      localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
    },

    deleteTodoItem(id) {
      console.log(id);
      try {
        const data = this.getTodos();
        const itemIndexToRemove = data.findIndex((item) => +item.id === +id);
        data.splice(itemIndexToRemove, 1);
        this.bulkSaveTodos(data);
        return true;
      } catch (e) {
        return false;
      }
    },

    init(key) {
      if (typeof key !== "string" || !key.length) throw new Error("You should define data key for first");
      this.DATA_KEY = key;

      const data = this.getTodos();
      data.length ? (this.id = data.at(-1).id) : null;
    },
  };

  const toDoList = {
    currentLang: null,
    formSelector: null,
    containerSelector: null,
    formElement: null,
    containerElement: null,
    deleteBtnId: "delete-btn",

    renderItem(data) {
      const template = this.createTemplate(data);
      this.containerElement.prepend(template);
    },

    formHandler(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      const data = Array.from(this.formElement.querySelectorAll("input, textarea")).reduce((acc, input) => {
        acc[input.name] = input.value;
        return acc;
      }, {});

      const savedData = model.saveTodo(data);
      this.renderItem(savedData);
    },

    onLoadHandler() {
      const data = model.getTodos();

      if (!data.length) return;

      data.forEach((item) => this.renderItem(item));
    },

    deleteHandler({ target }) {
      if (!target.hasAttribute("data-" + this.deleteBtnId)) return;
      const item = target.closest("[data-id]");

      const isDeleteOnDataBase = model.deleteTodoItem(item.getAttribute("data-id"));
      isDeleteOnDataBase && item.remove();
    },

    setEvents() {
      this.formElement.addEventListener("submit", this.formHandler.bind(this));
      this.containerElement.addEventListener("click", this.deleteHandler.bind(this));
      window.addEventListener("DOMContentLoaded", this.onLoadHandler.bind(this));
    },

    init(formSelector, containerSelector, { dataKey, lang }) {
      this.currentLang = this.isValidString(lang, local[lang].langError);

      const DATA_KEY = this.isValidString(dataKey, local[this.currentLang].dataKeyError);
      model.init(DATA_KEY);

      this.formSelector = this.isValidString(formSelector, local[this.currentLang].formError);
      this.formElement = this.isValidDOMElement(formSelector, local[this.currentLang].formError);

      this.containerSelector = this.isValidString(containerSelector, local[this.currentLang].containerError);
      this.containerElement = this.isValidDOMElement(containerSelector, local[this.currentLang].containerError);

      this.setEvents();
    },

    isValidDOMElement(selector, errorMsg) {
      const el = document.querySelector(selector);
      if (!el) throw new Error(errorMsg);
      return el;
    },
    isValidString(string, errorMsg) {
      if (typeof string !== "string" || !string.length) throw new Error(errorMsg);
      return string;
    },
    createTemplate({ title, description, id }) {
      const template = `<div class="taskWrapper">
                            <div class="taskHeading">${title}</div>
                            <div class="taskDescription">${description}</div>
                            <button data-${this.deleteBtnId} class="btn btn-danger mt-2">Delete</button>
                        </div>`;

      const wrapper = document.createElement("div");
      wrapper.className = "col-4";
      wrapper.setAttribute("data-id", id);
      wrapper.innerHTML = template;

      return wrapper;
    },
  };

  toDoList.init("#todoForm", "#todoItems", {
    dataKey: "todo_data",
    lang: "en",
  });
})();
