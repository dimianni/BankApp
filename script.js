'use strict';

/*--------------------------------------------------------------------------------------*/
/* Data
----------------------------------------------------------------------------------------*/

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-11-23T17:01:17.194Z',
    '2021-11-25T23:36:17.929Z',
    '2021-11-26T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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


/*--------------------------------------------------------------------------------------*/
/* Displaying movements
----------------------------------------------------------------------------------------*/

const timePassedSinceTransaction = (date, locale) => {

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

const displayMovements = (acc, sort = false) => {

  // If sort is true - sort the array, if not - leave it
  // NOTE: slice is making a copy of the array
  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements

  movs.forEach((movement, i) => {

    const type = movement > 0 ? "deposit" : "withdrawal"
    const transactionDate = new Date(acc.movementsDates[i]);

    const date = timePassedSinceTransaction(transactionDate, acc.locale)

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

const accBalance = (acc) => {
  const sum = acc.movements.reduce((a, b) => a + b, 0)
  acc.balance = sum;
  labelBalance.innerText = `${sum.toFixed(2)}$`
}

/*--------------------------------------------------------------------------------------*/
/* Displaying Account Summary
----------------------------------------------------------------------------------------*/

const calcAccSummary = (acc) => {

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
/* Login
----------------------------------------------------------------------------------------*/

let currentAccount, timer;


const updateUI = (acc) => {

  // Display movements
  displayMovements(acc)

  // Display balance
  accBalance(acc)

  // Display summary
  calcAccSummary(acc)
}

const startLogoutTimer = () => {
  let time = 300;

  const tick = () => {

    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.innerHTML = `${min}:${sec}`;

    if (time === 0) {
      labelWelcome.innerText = `Log in to get started`
      containerApp.style.opacity = 0;

      clearInterval(timer)
    }

    time--;

  }
  tick()

  const timerFunc = setInterval(tick, 1000);

  return timerFunc
}




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


    // Current date and time
    const now = new Date()


    /*--------------------------------------------*/
    /* New Way (with internationalization and Intl API)
    ----------------------------------------------*/
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }

    // Get user's browser locale
    // const locale = navigator.language

    labelDate.innerHTML = new Intl.DateTimeFormat(currentAccount.locale, options).format(now)

    /*--------------------------------------------*/
    /* Old Way
    ----------------------------------------------*/
    // const year = now.getFullYear()
    // const month = `${now.getMonth() + 1}`.padStart(2, 0)
    // const day = `${now.getDate()}`.padStart(2, 0)
    // const hour = `${now.getHours()}`.padStart(2, 0)
    // const minute = `${now.getMinutes()}`.padStart(2, 0)

    // labelDate.innerHTML = `${day}/${month}/${year}, ${hour}:${minute}`


    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";


    if (timer) {
      clearInterval(timer)
    }

    timer = startLogoutTimer()


    updateUI(currentAccount)

  }

})


/*--------------------------------------------------------------------------------------*/
/* Creating usernames
----------------------------------------------------------------------------------------*/

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


/*--------------------------------------------------------------------------------------*/
/* Transfer
----------------------------------------------------------------------------------------*/

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault()

  const recepient = accounts.find(acc => acc.username === inputTransferTo.value);
  const amount = Number(inputTransferAmount.value);

  console.log(recepient, amount);

  // Checking if transaction is possible
  if (
    amount > 0 &&
    recepient &&
    amount <= currentAccount.balance &&
    recepient.username !== currentAccount.username
  ) {
    console.log("Approved");

    currentAccount.movements.push(-amount)
    recepient.movements.push(amount)

    currentAccount.movementsDates.push(new Date().toISOString())
    recepient.movementsDates.push(new Date().toISOString())

    updateUI(currentAccount)
  }

  inputTransferTo.value = inputTransferAmount.value = "";


  clearInterval(timer)
  timer = startLogoutTimer()

})

/*--------------------------------------------------------------------------------------*/
/* Account close
----------------------------------------------------------------------------------------*/

btnClose.addEventListener("click", function (e) {

  e.preventDefault()

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    console.log("Delete");

    const accIdToDelete = accounts.findIndex(acc => acc.username === inputCloseUsername.value)

    accounts.splice(accIdToDelete, 1)

    // Delete account
    console.log(accounts);

    // Hide UI
    containerApp.style.opacity = 0;

  }

})


/*--------------------------------------------------------------------------------------*/
/* Loan
----------------------------------------------------------------------------------------*/

btnLoan.addEventListener("click", function (e) {
  e.preventDefault()

  const requestedLoanValue = Number(inputLoanAmount.value)

  if (
    requestedLoanValue > 0 &&
    currentAccount.movements.some(mov => mov > requestedLoanValue * 0.1)
  ) {
    console.log("Hellyeah");

    currentAccount.movements.push(requestedLoanValue)
    currentAccount.movementsDates.push(new Date().toISOString())
    updateUI(currentAccount)



    inputLoanAmount.value = ""

    clearInterval(timer)
    timer = startLogoutTimer()
  }
})


/*--------------------------------------------------------------------------------------*/
/* Sort
----------------------------------------------------------------------------------------*/

let sortStatus = false;
btnSort.addEventListener("click", function () {

  displayMovements(currentAccount, !sortStatus)

  sortStatus = !sortStatus;

})

