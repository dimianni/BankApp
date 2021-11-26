'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


let currentAccount;

// Login
btnLogin.addEventListener("click", function (e) {
  // To prevent page reload
  e.preventDefault()

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)

  // Optional chaining: "currentAccount.pin" will be read only if "currentAccount" exists
  // NOTE: inputLoginPin.value is initially a string
  if (currentAccount?.pin === Number(inputLoginPin.value)) {

    // Display UI and message

    // Split whenever there is a " "
    labelWelcome.innerText = `Welcome back, ${currentAccount.owner.split(" ")[0]}!`
    containerApp.style.opacity = 100;

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";

    // Display movements
    displayMovements(currentAccount.movements)

    // Display balance
    accBalance(currentAccount.movements)

    // Display summary
    calcAccSummary(currentAccount)

  }

})


// Displaying movements
const displayMovements = (movements) => {

  movements.forEach((movement, i) => {

    const type = movement > 0 ? "deposit" : "withdrawal"

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1}. ${type}</div>
        <div class="movements__value">${movement}€</div>
      </div>
    `
    containerMovements.insertAdjacentHTML("afterbegin", html)

  })

}

// Calculating account balance
const accBalance = (movements) => {
  const sum = movements.reduce((a, b) => a + b, 0)
  labelBalance.innerText = `${sum}€`
}

// Displaying Account Summary
const calcAccSummary = (acc) => {

  const { movements, interestRate } = acc;

  const income = movements
    .filter(num => num > 0)
    .reduce((a, b) => a + b, 0)

  const outcome = movements
    .filter(num => num < 0)
    .reduce((a, b) => a + b, 0)

  labelSumIn.innerText = `${income}€`
  labelSumOut.innerText = `${outcome}€`

  // 1.2% interest is given to every deposit (as long as interest is >= to 1 euro) 
  const interest = movements
    .filter(num => num > 0)
    .map(num => num * interestRate / 100)
    .filter(num => num >= 1)
    .reduce((a, b) => a + b, 0)

  labelSumInterest.innerText = `${interest}€`

}

// Creating usernames
const createUsernames = (accs) => {

  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join("")
  })

}
createUsernames(accounts)

















/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
