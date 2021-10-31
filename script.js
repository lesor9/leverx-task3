class User {
    constructor() {
        this.setHeaderUser();

        this.employers = [];

        this.ACTIVE_VIEW_CLASS = 'employers-section__icon-view_active';
        this.GRID_VIEW = 'grid_view';
        this.TABLE_VIEW = 'table_rows';
        
        this.currentView = localStorage.getItem('task_view') || this.GRID_VIEW;
        this.currentQuery;
        
        this.searchForm = document.querySelector('.search-form__input');
        this.employerList = document.querySelector('.employers-section__list');
        this.employerCount = document.querySelector('.employers-section__employers-number');
        this.viewBtns = document.querySelector('.employers-section__employers-view');
        this.employeesCardsBtns = document.querySelector('.employers-section__list');
        this.logout = document.getElementById('logout');
        
        this.searchForm.addEventListener('keyup', this.analyzeSearchForm.bind(this))
        this.viewBtns.addEventListener('click', this.changeView.bind(this));
        this.employeesCardsBtns.addEventListener('click', this.employeesCardClick);
        this.logout.addEventListener('click', this.logoutClick);

        this.onload();
    }

    async onload() {
        await this.getUsers();
        this.setActiveViewOnload();
        this.renderList(this.employers);
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

    async getUsers(query) {
        const xhr = new XMLHttpRequest();
        const querySearch = query ? `?query=${query}` : '';
    
        xhr.open('GET', 'https://leverx-be.herokuapp.com/employees/' + querySearch);
        xhr.responseType = 'json';
        xhr.send();
        xhr.onload = () => {
            this.employers = xhr.response;
            this.renderList(this.employers);
        };
        xhr.onerror = (e) => {
            console.log(e);
        }
    }

    employeesCardClick(e) {
        const card = e.target.closest('.employers-section__list_table-row');
        if(!card) return;
    
        window.location.href = `employees/?id=${card.dataset.id}`;
    };
    
    setActiveViewOnload() {
        [...this.viewBtns.children].forEach((view) => {
            if (view.innerText === this.currentView) {
                view.classList.add(this.ACTIVE_VIEW_CLASS);
            };
        });
    }

    async analyzeSearchForm(e) {
        this.currentQuery = e.target.value.toLocaleLowerCase().trim();
        await this.getUsers(this.currentQuery);
    
        this.renderList(this.employers);    
    }

    renderList(employers) {
        switch (this.currentView) {
            case this.GRID_VIEW:
                this.employerList.innerHTML = this.renderGridList(this.employers);
                break;
            case this.TABLE_VIEW:
                this.employerList.innerHTML = this.renderTableList(this.employers);
                break;
            default:
                break;
        }
    }

    changeView(e) {
        const selectedView = e.target.innerText;
        let isViewChanged;

        [...this.viewBtns.children].forEach((view) => {
            if (view.innerText === selectedView && this.currentView !== selectedView) {
                view.classList.add(this.ACTIVE_VIEW_CLASS);
                this.currentView = selectedView;
                isViewChanged = true;
    
                localStorage.setItem('task_view', selectedView);
    
                if (this.currentQuery) this.getUsers(this.currentQuery);
                this.renderList(this.employers);
    
            } else if ([...view.classList].includes(this.ACTIVE_VIEW_CLASS) && ((this.currentView !== selectedView) || isViewChanged)) {
                view.classList.remove(this.ACTIVE_VIEW_CLASS);
            }
        });
    }

    updateEmployeesCounter({length}) {
        this.employerCount.innerText = `${length} employeers displayed`;
    }
    
    renderTableList(employers) {
        this.updateEmployeesCounter(employers);
    
        const tableHead = ` <thead class="employers-section__list_table-head">
                                <tr>
                                    <td class="employers-section__list_table-head-data">
                                        Avatar
                                    </td>
    
                                    <td class="employers-section__list_table-head-data">
                                        Name
                                    </td>
    
                                    <td class="employers-section__list_table-head-data">
                                        Native name
                                    </td>
    
                                    <td class="employers-section__list_table-head-data">
                                        Department
                                    </td>
       
                                    <td class="employers-section__list_table-head-data">
                                        Room
                                    </td>
                                </tr>
                            </thead>`;
    
        let tableBody = employers.map(employer => {
            return `
            <tr class="employers-section__list_table-row" data-id="${employer._id}">
                <td class="employers-section__list_table-data">
                    <img src='${employer.user_avatar}' class="employer-card__image" alt='img'>
                </td>
    
                <td class="employers-section__list_table-data">
                    ${employer.first_name} ${employer.last_name}
                </td>
            
                <td class="employers-section__list_table-data">
                    ${employer.first_native_name} ${employer.last_native_name}
                </td>
    
                <td class="employers-section__list_table-data">
                    <i class="material-icons employer-card__info-part-icon">${employer.departmentIcon}</i>
                    ${employer.department}
                </td>
    
                <td class="employers-section__list_table-data">
                    <i class="material-icons employer-card__info-part-icon">sensor_door</i>
                    ${employer.room}
                </td>
            </tr>
            `
        })
        tableBody = `<tbody class="employers-section__list_table-body">${tableBody.join('')}</tbody>`;
    
    
        return `<table class="employers-section__list_table-view"> ${tableHead} ${tableBody} </table>`;
    }

    renderGridList(employers) {
        this.updateEmployeesCounter(this.employers);
    
        const employersList = employers.map(employer => {
            return `
            <a href="employees/?id=${employer._id}" style="text-decoration: none; color: black">
                <li class="employer-card">
                    <div class="employer-card__content">
                        <div class="employer-card__main-part">
                            <img class="employer-card__image" src=${employer.user_avatar} alt='img'/>
                            <div class="employer-card__name">${employer.first_name} ${employer.last_name}</div>
                            <div class="employer-card__native-name">${employer.first_native_name} ${employer.last_native_name}</div>
                        </div>
    
                        <div class="employer-card__info">
                            <hr class="employer-card__line"></hr>
                            <div class="employer-card__detailed-info">
                                <div class="employer-card__info-part">
                                    <i class="material-icons employer-card__info-part-icon">${employer.departmentIcon}</i>
                                    <span>${employer.department}</span>
                                </div>
                                <div class="employer-card__info-part">
                                    <i class="material-icons employer-card__info-part-icon">sensor_door</i>
                                    <span>${employer.room}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            </a>
            `
        })
    
        return `<ul class='employers-section__list_grid-view'>${employersList.join('')}</ul>`;
    }
}


class Editor extends User {
    constructor() {
        super();
    }
}


class Admin extends Editor {
    constructor() {
        super();
        this.addSettingsNav();
    }

    addSettingsNav() {
        const settings = document.getElementById('settings');
        settings.style.display = 'block';
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
