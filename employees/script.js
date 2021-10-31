class User {
    constructor() {
        this.setHeaderUser();

        this.logout = document.getElementById('logout');
        this.logout.addEventListener('click', this.logoutClick)
        
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

    warning() {
        const warningMsg = document.createElement('div');
        warningMsg.classList.add('warning');
        warningMsg.innerText = 'U cannot be here, this page only for editors and admins:(';

        document.body.appendChild(warningMsg);
    }

    logoutClick() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('leverx_auth')
            document.location.reload();
        }
    }
}


class Editor extends User {
    constructor() {
        super();
        this.getID();
    }

    getID() {
        const urlParams = new URLSearchParams(location.search);
        if(!urlParams.has('id')) return;
        this.id = urlParams.get('id');
    
        this.getUser(this.id);
    }

    getUser(id) {
        const xhr = new XMLHttpRequest();
    
        xhr.open('GET', 'https://leverx-be.herokuapp.com/employees/' + id);
        xhr.responseType = 'json';
        xhr.send();
        xhr.onload = () => {
            this.employee = xhr.response;
            this.renderEmployeePage(this.employee);
        };
        xhr.onerror = (e) => {
            console.log(e);
        }
    }

    renderEmployeePage(employee) {
        const employeeTemplate = document.getElementById('employee-page').content;

        console.log(employee);

        employeeTemplate.querySelector('.employee-section__avatar').src = employee.user_avatar;
        employeeTemplate.querySelector('.employee-section__name').innerText = `${employee.first_name} ${employee.last_name}`;
        employeeTemplate.querySelector('.employee-section__native-name').innerText = `${employee.first_native_name} ${employee.middle_native_name} ${employee.last_native_name}`;
        employeeTemplate.querySelector('.employee-section__sex').innerText = employee.gender ? 'Ms' : 'Mr';
        employeeTemplate.getElementById('department-icon').innerText = employee.departmentIcon;
        employeeTemplate.getElementById('department').innerText = employee.department;
        employeeTemplate.getElementById('room').innerText = employee.room;
        employeeTemplate.getElementById('skype').innerText = employee.skype;
        employeeTemplate.getElementById('email').innerText = employee.email;
        employeeTemplate.getElementById('cnumber').innerText = employee.cnumber;
        employeeTemplate.getElementById('phone').innerText = employee.phone;
        employeeTemplate.getElementById('date').innerText = new Date(employee.data_hired).toLocaleDateString("ru-RU");
    
        document.body.appendChild(employeeTemplate);

        document.querySelector('.employee-section__edit-buttons').addEventListener('click', this.handleEdit.bind(this));
    }

    handleEdit(e) {
        if(e.target.innerText === 'EDIT DETAILS') {
            document.querySelector('.employee-section__edit-buttons').removeEventListener('click', this.handleEdit.bind(this));
            document.querySelector('.employee-section').remove();

            this.renderEmployeeEditablePage(this.employee);
        }
    }

    renderEmployeeEditablePage(employee) {
        const employeeTemplate = document.getElementById('employee-editable-page').content;
        
        employeeTemplate.querySelector('.employee-section__avatar').src = employee.user_avatar;
        employeeTemplate.querySelector('.employee-section__name').innerText = `${employee.first_name} ${employee.last_name}`;
        employeeTemplate.querySelector('.employee-section__native-name').innerText = `${employee.first_native_name} ${employee.middle_native_name} ${employee.last_native_name}`;
        employeeTemplate.querySelector('.employee-section__sex').innerText = employee.gender ? 'Ms' : 'Mr';
        employeeTemplate.getElementById('department-icon').innerText = employee.departmentIcon;
        employeeTemplate.getElementById('department').value = employee.department;
        employeeTemplate.getElementById('image_url').value = employee.user_avatar;
        employeeTemplate.getElementById('room').value = employee.room;
        employeeTemplate.getElementById('skype').value = employee.skype;
        employeeTemplate.getElementById('email').value = employee.email;
        employeeTemplate.getElementById('first_name').value = employee.first_name;
        employeeTemplate.getElementById('last_name').value = employee.last_name;
        employeeTemplate.getElementById('cnumber').value = employee.cnumber;
        employeeTemplate.getElementById('phone').value = employee.phone;
        employeeTemplate.getElementById('date').value = new Date(employee.data_hired).toLocaleDateString("ru-RU");
    
        document.body.appendChild(employeeTemplate);

        const form = document.getElementById('form-data');
        form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleSubmit(e) {
        const formData = new FormData(e.target);
        const sendBody = {
            _id: this.id,
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            user_avatar: formData.get('user_avatar'),
            department: formData.get('department'),
            room: formData.get('room'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            skype: formData.get('skype'),
            cnumber: formData.get('cnumber'),
        };

        this.patchData(sendBody);

        e.preventDefault();
    }


    async patchData(data) {
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
            alert(`Account info changed!`)
        }  else {
            alert(`Error!`)
        }
        
        document.location.reload();
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
