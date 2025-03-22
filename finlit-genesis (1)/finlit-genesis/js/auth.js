// Initialize FirebaseUI Auth
const ui = new firebaseui.auth.AuthUI(firebase.auth());

ui.start('#firebaseui-auth-container', {
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      window.location.href = "dashboard.html";
      return false;
    }
  }
});
function switchTab(tab) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');

  // Update form visibility
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.remove('active');
  });
  document.getElementById(`${tab}-form`).classList.add('active');
}

function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'dashboard.html';
    })
    .catch(error => {
      alert(error.message);
    });
}

function signup() {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (password !== confirm) {
    alert("Passwords don't match!");
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((result) => {
      return result.user.updateProfile({
        displayName: name
      });
    })
    .then(() => {
      window.location.href = 'dashboard.html';
    })
    .catch(error => {
      alert(error.message);
    });
}

function socialLogin(provider) {
  let authProvider;
  switch(provider) {
    case 'google':
      authProvider = new firebase.auth.GoogleAuthProvider();
      break;
    case 'facebook':
      authProvider = new firebase.auth.FacebookAuthProvider();
      break;
  
  }

  firebase.auth().signInWithPopup(authProvider)
    .then(() => {
      window.location.href = 'dashboard.html';
    })
    .catch(error => {
      alert(error.message);
    });
}

function forgotPassword() {
  const email = document.getElementById('login-email').value;
  if (!email) {
    alert('Please enter your email first');
    return;
  }

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert('Password reset email sent! Check your inbox.');
    })
    .catch(error => {
      alert(error.message);
    });
}