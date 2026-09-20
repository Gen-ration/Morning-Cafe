let cartItems = [];
let cartTotal = 0;

const USERS_KEY = 'morningCafeUsers';
const CURRENT_USER_KEY = 'morningCafeCurrentUser';
const REMEMBERED_USER_KEY = 'morningCafeRememberedUser';
const PAYMENT_HISTORY_KEY = 'morningCafePaymentHistory';

function getUsers() {
  try {
    const savedUsers = localStorage.getItem(USERS_KEY);
    return savedUsers ? JSON.parse(savedUsers) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error('Error loading current user:', error);
    return null;
  }
}

function saveSession(user, rememberMe) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

  if (rememberMe) {
    localStorage.setItem(REMEMBERED_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(REMEMBERED_USER_KEY);
  }
}

function restoreSession() {
  try {
    const rememberedUser = localStorage.getItem(REMEMBERED_USER_KEY);
    const activeUser = localStorage.getItem(CURRENT_USER_KEY);

    if (rememberedUser) {
      return JSON.parse(rememberedUser);
    }

    return activeUser ? JSON.parse(activeUser) : null;
  } catch (error) {
    console.error('Error restoring session:', error);
    return null;
  }
}

function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(REMEMBERED_USER_KEY);
  showAuthScreen();
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app-screen').classList.add('hidden');
}

function showAppScreen() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
}

function switchTab(tabName) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabs = document.querySelectorAll('.tab-btn');

  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  loginForm.classList.toggle('active', tabName === 'login');
  registerForm.classList.toggle('active', tabName === 'register');
}

function getPaymentHistory(email) {
  try {
    const stored = localStorage.getItem(PAYMENT_HISTORY_KEY);
    const allHistory = stored ? JSON.parse(stored) : {};
    return allHistory[email.toLowerCase()] || [];
  } catch (error) {
    console.error('Error loading payment history:', error);
    return [];
  }
}

function savePaymentEntry(user, items, total) {
  try {
    const stored = localStorage.getItem(PAYMENT_HISTORY_KEY);
    const allHistory = stored ? JSON.parse(stored) : {};
    const emailKey = user.email.toLowerCase();

    const entry = {
      date: new Date().toISOString(),
      total: Number(total.toFixed(2)),
      items: items.map((item) => ({
        name: item.name,
        price: Number(item.price),
      })),
    };

    const userHistory = allHistory[emailKey] || [];
    allHistory[emailKey] = [entry, ...userHistory].slice(0, 20);
    localStorage.setItem(PAYMENT_HISTORY_KEY, JSON.stringify(allHistory));
  } catch (error) {
    console.error('Error saving payment history:', error);
  }
}

function renderPaymentHistory(user) {
  const historyContent = document.getElementById('history-content');
  const history = getPaymentHistory(user.email);

  historyContent.innerHTML = history.length
    ? `
      ${history
        .map(
          (entry) => `
            <div class="history-item">
              <div class="history-header">
                <strong>${new Date(entry.date).toLocaleDateString()}</strong>
                <span>₱${Number(entry.total).toFixed(2)}</span>
              </div>
              <div class="history-items">
                ${entry.items
                  .map(
                    (item) =>
                      `<span>${item.name} · ₱${Number(item.price).toFixed(2)}</span>`,
                  )
                  .join('')}
              </div>
            </div>
          `,
        )
        .join('')}
    `
    : '<div class="empty-history">No payments yet.</div>';
}

function saveAccountDetails(user) {
  const accountDetails = document.getElementById('account-details');
  const accountSummary = document.getElementById('account-summary');
  const savedAccounts = document.getElementById('saved-accounts');

  accountDetails.innerHTML = `
    <div class="detail-box"><strong>Name:</strong> ${user.name}</div>
    <div class="detail-box"><strong>Email:</strong> ${user.email}</div>
    <div class="detail-box"><strong>Account Type:</strong> ${user.provider}</div>
  `;

  const users = getUsers();
  const totalUsers = users.length;
  accountSummary.innerHTML = `
    Welcome back, <strong>${user.name}</strong>! You have <strong>${totalUsers}</strong> saved account${totalUsers === 1 ? '' : 's'} in this browser.
  `;

  const accountList = users
    .map(
      (item) => `
        <li>
          <span>${item.name}</span>
          <span>${item.provider}</span>
        </li>
      `,
    )
    .join('');

  savedAccounts.innerHTML = `
    <h4>Saved Accounts</h4>
    <ul>${accountList || '<li>No accounts saved yet.</li>'}</ul>
  `;
}

function openAccountModal() {
  const user = getCurrentUser();
  if (!user) return;
  saveAccountDetails(user);
  document.getElementById('account-modal').classList.remove('hidden');
  document.getElementById('history-modal').classList.add('hidden');
}

function openHistoryModal() {
  const user = getCurrentUser();
  if (!user) return;
  renderPaymentHistory(user);
  document.getElementById('history-modal').classList.remove('hidden');
  document.getElementById('account-modal').classList.add('hidden');
}

function closeAccountModal() {
  document.getElementById('account-modal').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  document.getElementById('user-menu').classList.remove('hidden');
}

function closeHistoryModal() {
  document.getElementById('history-modal').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  document.getElementById('user-menu').classList.remove('hidden');
}

function closeAllModals() {
  closeAccountModal();
  closeHistoryModal();
}

function setSocialProvider(provider) {
  const loginEmail = document.getElementById('login-email');
  const registerProvider = document.getElementById('register-provider');

  if (loginEmail) {
    loginEmail.value =
      provider.toLowerCase() === 'gmail'
        ? 'user@gmail.com'
        : provider.toLowerCase() === 'facebook'
          ? 'user@facebook.com'
          : 'user@tiktok.com';
  }

  if (registerProvider) {
    registerProvider.value = provider;
  }
}

function togglePasswordVisibility(button) {
  const targetId = button.dataset.target;
  const input = document.getElementById(targetId);

  if (!input) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  button.textContent = isPassword ? 'Hide' : 'Show';
  button.setAttribute(
    'aria-label',
    isPassword ? 'Hide password' : 'Show password',
  );
}

function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm').value;
  const provider = document.getElementById('register-provider').value;

  if (!name || !email || !password || !confirmPassword) {
    alert('Please fill in all registration fields.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  const users = getUsers();
  const accountExists = users.some(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );

  if (accountExists) {
    alert('This email is already registered. Please log in instead.');
    switchTab('login');
    return;
  }

  const newUser = {
    name,
    email,
    password,
    provider,
  };

  users.push(newUser);
  saveUsers(users);

  alert('Registration successful! You can now log in.');
  switchTab('login');
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = '';
}

function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const rememberMe = document.getElementById('remember-me').checked;

  if (!email || !password) {
    alert('Enter your email and password to log in.');
    return;
  }

  const users = getUsers();
  const user = users.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() &&
      item.password === password,
  );

  if (!user) {
    alert('Invalid email or password.');
    return;
  }

  saveSession(user, rememberMe);
  showAppScreen();
  updateUserMenu();
}

function updateUserMenu() {
  const user = getCurrentUser();
  const userMenuButton = document.getElementById('user-menu-button');

  if (!user) {
    userMenuButton.textContent = 'Menu ▾';
    return;
  }

  userMenuButton.textContent = `${user.name} ▾`;
}

function addToCart(name, price) {
  cartItems.push({ name, price });
  cartTotal += price;
  updateCartUI();
}

function checkout() {
  if (cartItems.length === 0) {
    alert('🛒 Your cart is empty!');
    return;
  }

  const currentUser = getCurrentUser();
  if (currentUser) {
    savePaymentEntry(currentUser, cartItems, cartTotal);
  }

  showPaymentSuccess(cartTotal);
  clearCart();
}

function showPaymentSuccess(total) {
  const paymentSuccessModal = document.getElementById('payment-success-modal');
  const successTotal = document.getElementById('success-total');

  if (!paymentSuccessModal || !successTotal) return;

  successTotal.textContent = `₱${Number(total).toFixed(2)}`;
  paymentSuccessModal.classList.remove('hidden');
}

function hidePaymentSuccess() {
  const paymentSuccessModal = document.getElementById('payment-success-modal');
  if (!paymentSuccessModal) return;
  paymentSuccessModal.classList.add('hidden');
}

function clearCart() {
  cartItems = [];
  cartTotal = 0;
  updateCartUI();
}

function removeItem(index) {
  cartTotal -= cartItems[index].price;
  cartItems.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  const cartList = document.getElementById('cart-list');
  const totalSpan = document.getElementById('total');

  if (!cartList || !totalSpan) return;

  cartList.innerHTML = '';

  cartItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.name} - ₱${item.price.toFixed(2)}</span>
      <button type="button" onclick="removeItem(${index})">Remove</button>
    `;
    cartList.appendChild(li);
  });

  totalSpan.textContent = cartTotal.toFixed(2);
}

function setupCartDrag() {
  const cart = document.querySelector('.cart');
  if (!cart) return;

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let originLeft = 0;
  let originTop = 0;

  const startDrag = (event) => {
    const dragHandle = event.target.closest('.cart-handle');
    if (!dragHandle) return;

    const rect = cart.getBoundingClientRect();
    dragging = true;
    cart.classList.add('dragging');
    startX = event.clientX;
    startY = event.clientY;
    originLeft = rect.left;
    originTop = rect.top;
    cart.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!dragging) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const maxX = window.innerWidth - cart.offsetWidth - 30;
    const maxY = window.innerHeight - cart.offsetHeight - 30;

    const newLeft = Math.max(20, Math.min(originLeft + deltaX, maxX));
    const newTop = Math.max(20, Math.min(originTop + deltaY, maxY));

    cart.style.position = 'fixed';
    cart.style.left = `${newLeft}px`;
    cart.style.top = `${newTop}px`;
    cart.style.right = 'auto';
    cart.style.bottom = 'auto';
    cart.style.margin = '0';
  };

  const stopDrag = () => {
    if (!dragging) return;
    dragging = false;
    cart.classList.remove('dragging');
  };

  cart.addEventListener('pointerdown', startDrag);
  document.addEventListener('pointermove', moveDrag);
  document.addEventListener('pointerup', stopDrag);
  document.addEventListener('pointercancel', stopDrag);
}

document.addEventListener('DOMContentLoaded', () => {
  const user = restoreSession();

  if (user) {
    showAppScreen();
    updateUserMenu();
  } else {
    showAuthScreen();
  }

  setupCartDrag();

  document.querySelectorAll('.tab-btn').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  document.getElementById('login-form').addEventListener('submit', loginUser);
  document
    .getElementById('register-form')
    .addEventListener('submit', registerUser);

  document.querySelectorAll('.social-btn').forEach((button) => {
    button.addEventListener('click', () =>
      setSocialProvider(button.dataset.provider),
    );
  });

  document.querySelectorAll('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => togglePasswordVisibility(button));
  });

  document.getElementById('user-menu-button').addEventListener('click', () => {
    const menu = document.getElementById('user-menu');
    menu.classList.toggle('hidden');
    const expanded =
      document
        .getElementById('user-menu-button')
        .getAttribute('aria-expanded') === 'true';
    document
      .getElementById('user-menu-button')
      .setAttribute('aria-expanded', String(!expanded));
  });

  document.getElementById('check-account-btn').addEventListener('click', () => {
    openAccountModal();
    document.getElementById('user-menu').classList.add('hidden');
  });

  document.getElementById('history-btn').addEventListener('click', () => {
    openHistoryModal();
    document.getElementById('user-menu').classList.add('hidden');
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    logoutUser();
  });

  document
    .getElementById('close-account-modal')
    .addEventListener('click', closeAccountModal);

  document
    .getElementById('close-history-modal')
    .addEventListener('click', closeHistoryModal);

  document
    .getElementById('account-modal')
    .addEventListener('click', (event) => {
      if (event.target.id === 'account-modal') {
        closeAccountModal();
      }
    });

  document
    .getElementById('history-modal')
    .addEventListener('click', (event) => {
      if (event.target.id === 'history-modal') {
        closeHistoryModal();
      }
    });

  document.getElementById('success-done-btn').addEventListener('click', () => {
    hidePaymentSuccess();
  });

  document
    .getElementById('payment-success-modal')
    .addEventListener('click', (event) => {
      if (event.target.id === 'payment-success-modal') {
        hidePaymentSuccess();
      }
    });

  updateCartUI();
});
