'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

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
    '2022-05-16T10:51:36.790Z',
    '2022-05-19T10:51:36.790Z',
    '2022-05-20T10:51:36.790Z',
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

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const labelMovDate = document.querySelector(`.movement__date`);

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

/////////////////////////////////////////////////
// Functions
const formatMovDates = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (24 * 1000 * 3600)));
  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);
  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: `currency`,
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);

    const displayDate = formatMovDates(date, acc.locale);
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formattedBal = formatCur(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = formattedBal;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// movementsDate(account1);
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  };
  let time = 120;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    const now = new Date();
    const options = {
      hour: `numeric`,
      minute: `numeric`,
      // second: `numeric`,
      day: `numeric`,
      month: `numeric`,
      year: `numeric`,
      // weekday: `long`,
    };
    // const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const now = new Date();
    // const date = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hours = `${now.getHours()}`.padStart(2, 0);
    // const minutes = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${date}/${month}/${year}, ${hours}:${minutes}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 3000);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
  labelWelcome.textContent = `Log in to get started`;
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

// calcDaysPassed(new Date(1970, 0, 1), new Date(1970, 0, 2));

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
// conversion
console.log(+`21`);
// parsing
console.log(parseInt(`21`, 10));
console.log(parseInt(`2.1`, 10));
console.log(parseInt(`e2.1`, 10));
console.log(parseFloat(`2.1`));
console.log(parseFloat(`21rem`));
console.log(parseFloat(`e2.1`));
console.log(parseFloat(`    2.1    `));
console.log(isNaN(21));
console.log(isNaN(`21`));
console.log(typeof `21`);
console.log(Number.isFinite(`21`));
console.log(Number.isFinite(21));
console.log(Number(`21`));
console.log(Number.isInteger(21));
console.log(Number.isInteger(21.0));
console.log(Number.isInteger(`21.0`));
console.log(Number.isInteger(21.45));
console.log(Math.sqrt(36));
console.log(Math.sqrt(32));
console.log(Math.max(12, 32, 3, 21, 32, 11));
console.log(Math.max(12, 32, 3, 21, `32`, 11));
console.log(Math.max(12, `32`, 3, 21, 11));
console.log(Math.max(12, `32e`, 3, 21, 11));
console.log(Math.max(12, parseInt(`32e`, 10), 3, 21, 11));
const randGen = (min, max) => Math.floor(Math.random() * (max - min)) + 1 + min;
console.log(randGen(1, 3));
console.log(Math.floor(23.9));
console.log(Math.floor(23.3));
console.log(Math.floor(-23.3));
console.log(Math.floor(-23.3));
console.log(Math.trunc(23.3));
console.log(Math.trunc(23.9));
console.log(Math.trunc(-23.3));
console.log(Math.trunc(-23.9));
console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));
console.log(Math.ceil(-23.3));
console.log(Math.ceil(-23.9));
console.log(Math.round(23.3));
console.log(Math.round(23.9));
console.log(Math.round(-23.3));
console.log(Math.round(-23.9));
console.log(typeof 32n);
console.log(32n === BigInt(32));
console.log(Math.sqrt(Number(16n)));
console.log(Number(16n) ** (1 / 2));
console.log(11n / 3n);
console.log(12n % 3n);
const now = new Date();
console.log(now);
console.log(new Date(`May 19 2022 17:27:44`));
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2031, 12, 12, 12, 12, 12));
console.log(new Date(1930, 12, 12, 12, 12, 12));
console.log(new Date(0));
console.log(new Date(5 * 24 * 60 * 60 * 1000));
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());
console.log(new Date(2141905512000));
console.log(new Date());
console.log(new Date(1652976824452));
console.log(new Date(0));
console.log(new Date(1970, 0, 2, 5, 30).getTime());
console.log(new Date().getTime());
console.log(Date.now());
const future = new Date(2037, 10, 15, 19, 15, 12);
future.setFullYear(2040);
future.setMonth(2);
future.setDate(13);
future.setHours(20);
future.setMinutes(12);
future.setSeconds(2);
console.log(future);
const num = 213121111.31;
const options = {
  style: `currency`,
  unit: `celsius`,
  currency: `INR`,
  useGrouping: true,
};
console.log(`US: `, new Intl.NumberFormat(`en-US`, options).format(num));
console.log(`GB: `, new Intl.NumberFormat(`en-GB`, options).format(num));
console.log(`IN: `, new Intl.NumberFormat(`te`, options).format(num));
console.log(
  `${navigator.language}: `,
  new Intl.NumberFormat(navigator.language, options).format(num)
);
const ings = [`olives`, `spinach`];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`here is your pizza 🍕 with ${ing1} and ${ing2}`),
  5000,
  ...ings
);
console.log(`waiting...`);
if (ings.includes(`onion`)) clearTimeout(pizzaTimer);
setInterval(function () {
  console.log(new Date());
}, 3000);
*/
