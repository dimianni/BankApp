'use strict';

/*--------------------------------------------------------------------------------------*/
/* UI Elements
----------------------------------------------------------------------------------------*/

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


const note = document.querySelector('.note');


/*--------------------------------------------------------------------------------------*/
/* Account
----------------------------------------------------------------------------------------*/

class Account {

  static accounts = [];

  constructor(owner, movements, interestRate, pin, movementsDates, currency, locale) {
    this.owner = owner
    this.movements = movements
    this.interestRate = interestRate
    this.pin = pin
    this.movementsDates = movementsDates
    this.currency = currency
    this.locale = locale
  }

  /*--------------------------------------------------------------------------------------*/
  /* Creating usernames
  ----------------------------------------------------------------------------------------*/

  static createUsernames(accs){
    console.log(accs);
    accs.forEach(acc => {
      acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(word => word[0])
        .join("")
    })

  }

  /*--------------------------------------------------------------------------------------*/
  /* Adding new account to the array
  ----------------------------------------------------------------------------------------*/

  static addAcc(acc){
    this.accounts.push(acc)
  }

}





/*--------------------------------------------------------------------------------------*/
/* Data
----------------------------------------------------------------------------------------*/

const account1 = new Account(
  'Jonas Schmedtmann',
  [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  1.2,
  1111,
  [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-11-23T17:01:17.194Z',
    '2021-11-25T23:36:17.929Z',
    '2021-11-26T10:51:36.790Z',
  ],
  'EUR',
  'pt-PT'
);
Account.addAcc(account1)

const account2 = new Account(
  'Jessica Davis',
  [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  1.5,
  2222,
  [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  'USD',
  'en-US'
);
Account.addAcc(account2)


Account.createUsernames(Account.accounts)




/*--------------------------------------------------------------------------------------*/
/* App
----------------------------------------------------------------------------------------*/

class App {

  currentAccount;
  sortStatus = false;
  timer;

  constructor() {

    btnLogin.addEventListener("click", this.login.bind(this))
    btnTransfer.addEventListener("click", this.transfer.bind(this))
    btnLoan.addEventListener("click", this.loan.bind(this))
    btnClose.addEventListener("click", this.accClose.bind(this))
    btnSort.addEventListener("click", this.sort.bind(this))

  }

  /*--------------------------------------------------------------------------------------*/
  /* Login
  ----------------------------------------------------------------------------------------*/

  login(e) {
    // To prevent page reload
    e.preventDefault()


    this.currentAccount = Account.accounts.find(acc => acc.username === inputLoginUsername.value)

    // Optional chaining: "currentAccount.pin" will be read only if "currentAccount" exists
    // NOTE: inputLoginPin.value is initially a string
    if (this.currentAccount?.pin === Number(inputLoginPin.value)) {

      // Split whenever there is a " "
      labelWelcome.innerText = `Welcome back, ${this.currentAccount.owner.split(" ")[0]}!`
      containerApp.style.opacity = 100;

      // Current date and time
      const now = new Date()

      const options = {
        hour: "numeric",
        minute: "numeric",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }

      labelDate.innerHTML = new Intl.DateTimeFormat(this.currentAccount.locale, options).format(now)

      //Clear input fields
      inputLoginUsername.value = inputLoginPin.value = "";


      if (this.timer) {
        clearInterval(this.timer)
      }

      this.timer = this.startLogoutTimer()

      note.style.display = 'none';
      this.updateUI(this.currentAccount)

    } else {
      console.log("There was an error");
    }

  }

  /*--------------------------------------------------------------------------------------*/
  /* Transfer
  ----------------------------------------------------------------------------------------*/

  transfer(e) {
    e.preventDefault()

    const recepient = Account.accounts.find(acc => acc.username === inputTransferTo.value);
    const amount = Number(inputTransferAmount.value);

    console.log(recepient, amount);

    // Checking if transaction is possible
    if (
      amount > 0 &&
      recepient &&
      amount <= this.currentAccount.balance &&
      recepient.username !== this.currentAccount.username
    ) {
      console.log("Approved");

      this.currentAccount.movements.push(-amount)
      recepient.movements.push(amount)

      this.currentAccount.movementsDates.push(new Date().toISOString())
      recepient.movementsDates.push(new Date().toISOString())

      this.updateUI(this.currentAccount)
    }

    inputTransferTo.value = inputTransferAmount.value = "";


    clearInterval(this.timer)
    this.timer = this.startLogoutTimer()

  }

  /*--------------------------------------------------------------------------------------*/
  /* Loan
  ----------------------------------------------------------------------------------------*/

  loan(e) {
    e.preventDefault()

    const requestedLoanValue = Number(inputLoanAmount.value)

    if (
      requestedLoanValue > 0 &&
      this.currentAccount.movements.some(mov => mov > requestedLoanValue * 0.1)
    ) {
      console.log("Hellyeah");

      this.currentAccount.movements.push(requestedLoanValue)
      this.currentAccount.movementsDates.push(new Date().toISOString())
      this.updateUI(this.currentAccount)


      inputLoanAmount.value = ""

      clearInterval(this.timer)
      this.timer = this.startLogoutTimer()
    }
  }

  /*--------------------------------------------------------------------------------------*/
  /* Account close
  ----------------------------------------------------------------------------------------*/

  accClose(e) {

    e.preventDefault()

    if (
      inputCloseUsername.value === this.currentAccount.username &&
      Number(inputClosePin.value) === this.currentAccount.pin
    ) {
      console.log("Delete");

      const accIdToDelete = Account.accounts.findIndex(acc => acc.username === inputCloseUsername.value)

      Account.accounts.splice(accIdToDelete, 1)

      // Hide UI
      containerApp.style.opacity = 0;

    }

  }

  /*--------------------------------------------------------------------------------------*/
  /* Sort
  ----------------------------------------------------------------------------------------*/

  sort() {

    displayMovements(this.currentAccount, !this.sortStatus)

    this.sortStatus = !this.sortStatus;

  }


  /*-----------------------------------------------------------------------------------------------------------------*/
  updateUI(acc) {

    // Display movements
    this.displayMovements(acc)

    // Display balance
    this.accBalance(acc)

    // Display summary
    this.calcAccSummary(acc)
  }
  /*-----------------------------------------------------------------------------------------------------------------*/


  /*--------------------------------------------------------------------------------------*/
  /* Displaying movements
  ----------------------------------------------------------------------------------------*/
  displayMovements(acc, sort = false) {

    // If sort is true - sort the array, if not - leave it
    // NOTE: slice is making a copy of the array
    const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements

    movs.forEach((movement, i) => {

      const type = movement > 0 ? "deposit" : "withdrawal"
      const transactionDate = new Date(acc.movementsDates[i]);

      const date = this.timePassedSinceTransaction(transactionDate, acc.locale)

      const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1}. ${type}</div>
        <div class="movements__date">${date}</div>
        <div class="movements__value">${movement.toFixed(2)}$</div>
      </div>
    `
      containerMovements.insertAdjacentHTML("afterbegin", html)

    })

  }

  /*--------------------------------------------------------------------------------------*/
  /* Calculating account balance
  ----------------------------------------------------------------------------------------*/
  accBalance(acc) {
    const sum = acc.movements.reduce((a, b) => a + b, 0)
    acc.balance = sum;
    labelBalance.innerText = `${sum.toFixed(2)}$`
  }

  /*--------------------------------------------------------------------------------------*/
  /* Displaying Account Summary
  ----------------------------------------------------------------------------------------*/
  calcAccSummary(acc) {

    const { movements, interestRate } = acc;

    const income = movements
      .filter(num => num > 0)
      .reduce((a, b) => a + b, 0)

    const outcome = movements
      .filter(num => num < 0)
      .reduce((a, b) => a + b, 0)

    labelSumIn.innerText = `${income.toFixed(2)}$`
    labelSumOut.innerText = `${outcome.toFixed(2)}$`

    // 1.2% interest is given to every deposit (as long as interest is >= to 1 euro) 
    const interest = movements
      .filter(num => num > 0)
      .map(num => num * interestRate / 100)
      .filter(num => num >= 1)
      .reduce((a, b) => a + b, 0)

    labelSumInterest.innerText = `${interest.toFixed(2)}$`

  }

  /*--------------------------------------------------------------------------------------*/
  /* Time past since transaction
  ----------------------------------------------------------------------------------------*/

  timePassedSinceTransaction(date, locale) {

    const calcDaysPassed = (date1, date2) => {
      return Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24))
    }

    const daysPassed = calcDaysPassed(new Date(), date)


    if (daysPassed === 0) {
      return "Today"
    } else if (daysPassed === 1) {
      return "Yesterday"
    } else if (daysPassed <= 7) {
      return `${daysPassed} days ago`
    } else {
      /*--------------------------------------------*/
      /* New Way
      ----------------------------------------------*/

      return new Intl.DateTimeFormat(locale).format(date)

      /*--------------------------------------------*/
      /* Old Way
      ----------------------------------------------*/
      // const day = date.getDate()
      // const month = date.getMonth()
      // const year = date.getFullYear()

      // return `${day}/${month}/${year}`
    }

  }


  /*--------------------------------------------------------------------------------------*/
  /* Timer
  ----------------------------------------------------------------------------------------*/

  startLogoutTimer() {
    let time = 300;

    const tick = () => {

      const min = String(Math.trunc(time / 60)).padStart(2, 0);
      const sec = String(time % 60).padStart(2, 0);

      labelTimer.innerHTML = `${min}:${sec}`;

      if (time === 0) {
        labelWelcome.innerText = `Log in to get started`
        containerApp.style.opacity = 0;

        clearInterval(this.timer)
      }

      time--;

    }
    tick()

    const timerFunc = setInterval(tick, 1000);

    return timerFunc
  }


}

const app = new App()











