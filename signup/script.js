class Page {
    constructor() {
        const token = localStorage.getItem('leverx_auth');
        if(token) {
            this.tokenInfo = this.parseJwt(token);
            this.getAuthUserInfo(this.tokenInfo._id);
        } else {
            this.createAuthForm();
        }
    }

    createUserCard(tokenInfo) {
        const cardTemp = document.getElementById('card-temp').content;

        const img = cardTemp.querySelector('.employer-card__image');
        img.src = tokenInfo.user_avatar;

        const name = cardTemp.querySelector('.employer-card__name');
        name.innerText = `${tokenInfo.first_name} ${tokenInfo.last_name}`;

        const logout = cardTemp.getElementById('logout');
        logout.addEventListener('click', (e) => {
            localStorage.removeItem('leverx_auth');
            document.location.reload();
        })

        document.body.append(cardTemp);
    }

    createAuthForm() {
        const formTemp = document.getElementById('form_temp').content;

        document.body.appendChild(formTemp);

        new Form();
    }

    getAuthUserInfo(id) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://leverx-be.herokuapp.com/employees/' + id);
        xhr.responseType = 'json';
        xhr.send();
        xhr.onload = () => {
            const res = xhr.response;
            this.tokenInfo = {
                ...this.tokenInfo,
                ...res,
            }
            this.createUserCard(this.tokenInfo);
        };
        xhr.onerror = (e) => {
            console.log(e);
        }
    }

    parseJwt(token) {
        try {
          return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
          return null;
        }
    };
}

class Form {
    constructor() {
        this.form = document.querySelector('.auth-form');

        this.viewBtn = document.getElementById('change-mode');
        this.submitBtn = document.getElementById('submit-btn');
        this.question = document.querySelector('.auth-form__user-with-acc-question');
        this.fName = document.getElementById('fname');
        this.lName = document.getElementById('lname');
        
        this.viewBtn.addEventListener('click', this.changeView.bind(this));
        this.form.addEventListener('submit', this.onSubmitForm);

        this.form.onformdata = (e) => this.checkFormInput(e);
    }

    changeView() {
        if (this.submitBtn.innerText === 'Create account') {
            this.submitBtn.innerText = 'Log in';
            this.viewBtn.innerText = 'Create one';
            this.question.innerText = 'No account?';

            this.fName.style.display = "none";
            this.lName.style.display = "none";
        } else if (this.submitBtn.innerText === 'Log in') {
            this.submitBtn.innerText = 'Create account';
            this.viewBtn.innerText = 'Log in';
            this.question.innerText = 'Already have an account?';

            this.fName.style.display = "block";
            this.lName.style.display = "block";
        }
    }

    onSubmitForm(e) {
        new FormData(e.target);
        e.preventDefault();
    }

    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    checkFormInput(e) {
        this.email = e.formData.get('email');
        this.pass = e.formData.get('pass');
        this.fname = e.formData.get('fname');
        this.lname = e.formData.get('lname');
    
        if(this.submitBtn.innerText === 'Create account') {
            if(this.fname === '' || this.lname === '') { 
                alert('Empty name field')
                return;
            }
        }
    
    
        if(this.pass.length <= 3) {
            alert('Password should be 4 or more than characters');
            return;
        } 
    
        if(!this.validateEmail(this.email)) {
            alert('Envalid email');
            return;
        }

        this.sendAuthData();
    }

    sendAuthData() {
        const xhr = new XMLHttpRequest();
        const serverUrl = `https://leverx-be.herokuapp.com/employees/${this.submitBtn.innerText === 'Create account' ? 'signup' : 'login'}`;
    
        xhr.open("POST", serverUrl, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
        xhr.onload = () => {
            const responceData = JSON.parse(xhr.response);
            console.log(responceData);
            if (responceData['message'] === 'Mail exists') {
                alert(responceData['message']);
            }
    
            if (responceData['message'] === 'Auth successful') {
                localStorage.setItem('leverx_auth', responceData.token);
                document.location.reload();
            }
    
            if (responceData['message'] === 'Employee created') {
                alert('Successfully registered! Now you can log in)'); 
            }

            if (responceData['message'] === 'Auth failed') {
                alert('Incorrect password or email(('); 
            }
        }
    
        xhr.send('data=' + JSON.stringify({
            'fname': this.fname,
            'lname': this.lname,
            'email': this.email,
            'password': this.pass,
        }));
    }
}

new Page();
