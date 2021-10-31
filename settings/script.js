class User {
    constructor() {
        this.setHeaderUser();

        this.logout = document.getElementById('logout');
        this.logout.addEventListener('click', this.logoutClick);

        if(tokenInfo.role === 'user') this.warning();
    }

    setHeaderUser() {
        const profile = document.getElementById('profile-temp').content;
        
        const img = profile.querySelector('.profile__img');
        img.src = tokenInfo.user_avatar;

        const name = profile.querySelector('.profile__name');
        name.innerText = `${tokenInfo.first_name} ${tokenInfo.last_name}`;

        document.querySelector('.header__content').appendChild(profile);
    }

    logoutClick() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('leverx_auth')
            document.location.reload();
        }
    }

    warning() {
        const warningMsg = document.createElement('div');
        warningMsg.classList.add('warning');
        warningMsg.innerText = 'U cannot be here, this page only for admins:(';

        document.body.appendChild(warningMsg);
    }
}


class Editor extends User {
    constructor() {
        super();
        if(tokenInfo.role === 'editor') this.warning();
    }
}


class Admin extends Editor {
    constructor() {
        super();

        this.addSettingsNav();
        this.addTemplate();

        this.mainRoles = document.querySelector('.roles__users');
        this.queryInput = document.querySelector('.roles__input');

        this.mainRoles.addEventListener('click', this.processClick.bind(this));
        this.queryInput.addEventListener('keyup', this.analyzeSearchForm.bind(this));

        this.getUsers();
    }

    addSettingsNav() {
        const settings = document.getElementById('settings');
        settings.style.display = 'block';
    }

    addTemplate() {
        const template = document.getElementById('role-temp').content;
        document.body.appendChild(template);
    }

    async analyzeSearchForm(e) {
        this.currentQuery = e.target.value.toLocaleLowerCase().trim();
        await this.getUsers(this.currentQuery);
    
        this.renderList(this.employees);    
    }

    processClick(e) {
        const clickedBtn = e.target.dataset.id;
        if(!clickedBtn) return;

        const idKey = e.target.closest('.roles__user').getAttribute('_id');

        let body = {
            _id: idKey,
        };

        switch(clickedBtn) {
            case 'adress-emp':
                body = {
                    ...body,
                    role: 'user',
                    addrRoles: {                   
                        'type': 'adressbook',
                        'name': e.target.classList.contains('roles__state-btn_active') ? '' : 'employee',
                    },
                };
                break;
            case 'adress-hr':
                body = {
                    ...body,
                    role: 'editor',
                    addrRoles: {
                        'type': 'adressbook',
                        'name': e.target.classList.contains('roles__state-btn_active') ? '' : 'hr',
                    },
                };
                break;


            case 'vacat-emp':
                body = {
                    ...body,
                    vacRoles: {
                        'type': 'vacation',
                        'name': e.target.classList.contains('roles__state-btn_active') ? '' : 'employee',
                    },
                };
                break;

            case 'vacat-po':
                body = {
                    ...body,
                    vacRoles: {
                        'type': 'vacation',
                        'name': e.target.classList.contains('roles__state-btn_active') ? '' : 'po',
                    },
                };
                break;

            case 'vacat-dd':
                body = {
                    ...body,
                    vacRoles: {
                        'type': 'vacation',
                        'name': e.target.classList.contains('roles__state-btn_active') ? '' : 'dd',
                    },
                };
                break;


            case 'admin': {
                if(e.target.classList.contains('roles__state-btn_active')) {
                    body = {
                        ...body,
                        role: 'user',
                        addrRoles: {                   
                            'type': 'adressbook',
                            'name': 'employee',
                        },
                    };
                } else {
                    body = {
                        ...body,
                        role: 'admin',
                    };
                }

                break;
            }

            default:
                break;
        }

        this.sendChanges(body);
    }

    async sendChanges(data) {
        const response = await fetch(`https://leverx-be.herokuapp.com/employees/${this.id}`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': ''
            },
            body: JSON.stringify(data),
          })
          .then(res => res)
          .then(res => {
              return res
          })
          .catch(err => console.error(err));

        console.log(response);
        if(response.status === 200) {
            confirm(`Account info changed!`)
        }  else {
            confirm(`Error!`)
        }
        
        document.location.reload();
    }

    async getUsers(query) {
        const xhr = new XMLHttpRequest();
        const querySearch = query ? `?query=${query}` : '';
    
        xhr.open('GET', 'https://leverx-be.herokuapp.com/employees/' + querySearch);
        xhr.responseType = 'json';
        xhr.send();
        xhr.onload = () => {
            this.employees = xhr.response;
            this.renderList(this.employees);
        };
        xhr.onerror = (e) => {
            console.log(e);
        }
    }

    renderList(employees) {
        const list = employees.reduce((list, employee) => {
            const name = `${employee.first_name} ${employee.last_name}`;
            const nativeName = `${employee.first_native_name} ${employee.last_native_name}`;

            console.log(employee.roles);
            
            return list + `<li _id=${employee._id} class="roles__user">
                                <a href='/employees/?id=${employee._id}' class="roles__input-column">
                                    <img class="roles__input-column-img" src="${employee.user_avatar}" alt="cat">
                                    <div class="roles__input-column-name">${name}/<br>${nativeName}</div>
                                </a>

                                <div class="roles__adress-column">
                                    <button data-id='adress-emp' class="roles__state-btn ${employee.addrRoles ? (employee.addrRoles['type'] === 'adressbook' && employee.addrRoles['name'] === 'employee' && employee.role === 'user' ? 'roles__state-btn_active' : '') : ''}">Employee</button>
                                    <button data-id='adress-hr' class="roles__state-btn ${employee.addrRoles ? (employee.addrRoles['type'] === 'adressbook' && employee.addrRoles['name'] === 'hr' && employee.role === 'editor' ? 'roles__state-btn_active' : '') : ''}">HR</button>
                                </div>
                                <div class="roles__vacation-column">
                                    <button data-id='vacat-emp' class="roles__state-btn ${employee.vacRoles ? (employee.vacRoles['type'] === 'vacation' && employee.vacRoles['name'] === 'employee' ? 'roles__state-btn_active' : '') : ''}">Employee</button>
                                    <button data-id='vacat-po' class="roles__state-btn ${employee.vacRoles ? (employee.vacRoles['type'] === 'vacation' && employee.vacRoles['name'] === 'po' ? 'roles__state-btn_active' : '') : ''}">PO</button>
                                    <button data-id='vacat-dd' class="roles__state-btn ${employee.vacRoles ? (employee.vacRoles['type'] === 'vacation' && employee.vacRoles['name'] === 'dd' ? 'roles__state-btn_active' : '') : ''}">DD</button>
                                </div>
                                <div class="roles__admin-column">
                                    <button data-id='admin' class="roles__state-btn ${employee.role === 'admin' ? 'roles__state-btn_active' : ''}">ADMIN</button>
                                </div>
                            </li>`
        }, '');

        this.mainRoles.innerHTML = list;

    }
}



function getAccessToken() {
    const token = localStorage.getItem('leverx_auth');
    if (!token) {
        window.location.replace("/signup")
    } else {
        return token;
    }
}

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function getAuthUserInfo(id) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://leverx-be.herokuapp.com/employees/' + id);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = () => {
        const res = xhr.response;
        tokenInfo = {
            ...tokenInfo,
            ...res,
        }
        buildPage();
    };
    xhr.onerror = (e) => {
        console.log(e);
    }
}

function buildPage() {
    // tokenInfo.role = 'admin';

    switch(tokenInfo.role) {
        case 'user':
            new User();
            break;
        case 'editor':
            new Editor();
            break;
        case 'admin':
            new Admin();
            break;
        default:
            break;
    }
}


const token = getAccessToken();
let tokenInfo = parseJwt(token);
getAuthUserInfo(tokenInfo._id);
