type HTTPMethods = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type RequestProps = {
    url: string;
    method?: HTTPMethods;
    body?: object;
    contentType?: string;
}

async function request<T>(
    { url, method = 'GET', body, contentType = 'application/json' }: RequestProps
): Promise<T> {
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': contentType
        },
        body: body && JSON.stringify(body),
    });

    const data: T = await response.json();

    return data;
}

type PostContent = {
    title: string;
    body: string;
}

type Post = PostContent & {
    id: number;
    userId: number;
};

function isCustomEvent(event: Event): event is CustomEvent {
    return 'detail' in event;
}

abstract class Widget {
    element: HTMLElement;

    constructor(element: string | HTMLElement) {
        if (typeof element === 'string') {
            const htmlElement = document.querySelector<HTMLElement>(element);

            if (!htmlElement) {
                throw Error(`selector ${element} not found`);
            }

            this.element = htmlElement;
        } else {
            this.element = element;
        }
    }
}

class Posts extends Widget {
    posts: Post[];
    form: PostForm;

    constructor(element: string | HTMLDivElement, form: PostForm) {
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

    async onClick(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (!target) {
            return;
        }

        if (!target.classList.contains('posts__delete')) {
            return;
        }

        const id = Number(target.dataset.id);

        await request({
            url: 'https://jsonplaceholder.typicode.com/posts/' + id,
            method: 'DELETE'
        });

        this.posts = this.posts.filter(post => post.id !== id);

        this.render();
    }

    async onAdd(event: Event) {
        if (!isCustomEvent(event)) {
            return;
        }

        console.log(event);

        const { title, body } = event.detail;

        const result = await request<Post>({
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
    }
}

class PostForm extends Widget {
    constructor(element: string | HTMLDivElement) {
        super(element);

        this.element.addEventListener('submit', this.onSubmit.bind(this));
    }

    onSubmit(event: SubmitEvent) {
        event.preventDefault();
        console.log('submit');

        const inputs = document.querySelectorAll<HTMLInputElement>('.post-form__field');

        const formData: { [key: string]: string } = {};

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

(async () => {
    const posts = await request<Post[]>({
        url: 'https://jsonplaceholder.typicode.com/posts'
    });

    postsWidget.posts = posts;
    postsWidget.render();
})();
