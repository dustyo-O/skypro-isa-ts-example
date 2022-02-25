"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function request({ url, method = 'GET', body, contentType = 'application/json' }) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url, {
            method,
            headers: {
                'Content-Type': contentType
            },
            body: body && JSON.stringify(body),
        });
        const data = yield response.json();
        return data;
    });
}
function isCustomEvent(event) {
    return 'detail' in event;
}
class Widget {
    constructor(element) {
        if (typeof element === 'string') {
            const htmlElement = document.querySelector(element);
            if (!htmlElement) {
                throw Error(`selector ${element} not found`);
            }
            this.element = htmlElement;
        }
        else {
            this.element = element;
        }
    }
}
class Posts extends Widget {
    constructor(element, form) {
        super(element);
        this.posts = [];
        this.form = form;
        this.onClick = this.onClick.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.element.addEventListener('click', this.onClick);
        this.form.element.addEventListener('form:submit', this.onAdd);
    }
    render() {
        this.element.innerHTML = '';
        this.posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.textContent = post.title;
            postElement.classList.add('posts__post');
            const deleteButton = document.createElement('span');
            deleteButton.innerText = '❌';
            deleteButton.classList.add('posts__delete');
            deleteButton.dataset.id = String(post.id);
            postElement.appendChild(deleteButton);
            this.element.appendChild(postElement);
        });
    }
    onClick(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const target = event.target;
            if (!target) {
                return;
            }
            if (!target.classList.contains('posts__delete')) {
                return;
            }
            const id = Number(target.dataset.id);
            yield request({
                url: 'https://jsonplaceholder.typicode.com/posts/' + id,
                method: 'DELETE'
            });
            this.posts = this.posts.filter(post => post.id !== id);
            this.render();
        });
    }
    onAdd(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!isCustomEvent(event)) {
                return;
            }
            console.log(event);
            const { title, body } = event.detail;
            const result = yield request({
                url: 'https://jsonplaceholder.typicode.com/posts/',
                method: 'POST',
                body: {
                    userId: 1,
                    title,
                    body,
                }
            });
            this.posts.push(result);
            this.render();
        });
    }
}
class PostForm extends Widget {
    constructor(element) {
        super(element);
        this.element.addEventListener('submit', this.onSubmit.bind(this));
    }
    onSubmit(event) {
        event.preventDefault();
        console.log('submit');
        const inputs = document.querySelectorAll('.post-form__field');
        const formData = {};
        inputs.forEach(input => {
            formData[input.name] = input.value;
        });
        this.element.dispatchEvent(new CustomEvent('form:submit', {
            detail: formData
        }));
    }
}
const form = new PostForm('.post-form');
const postsWidget = new Posts('.posts', form);
(() => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield request({
        url: 'https://jsonplaceholder.typicode.com/posts'
    });
    postsWidget.posts = posts;
    postsWidget.render();
}))();
