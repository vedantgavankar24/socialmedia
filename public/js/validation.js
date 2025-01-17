document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const resetForm = document.getElementById('passresetform');
    const errorMessage = document.getElementById('errorMessage');
  
    function validateForm(event, formType) {
      let username, email, password, confirmPassword;
  
      if (formType === 'register') {
        username = document.getElementById('username').value.trim();
        email = document.getElementById('email').value.trim();
        password = document.getElementById('password').value.trim();
        confirmPassword = document.getElementById('confirmPassword').value.trim();
  
        if (!username || !email || !password || !confirmPassword) {
          event.preventDefault(); // Prevent form submission
          errorMessage.textContent = "Please enter all fields";
          errorMessage.style.display = 'block';
          return;
        }
  
        if (username.length > 30) {
          event.preventDefault(); // Prevent form submission
          errorMessage.textContent = "Username cannot be more than 30 characters";
          errorMessage.style.display = 'block';
          return;
        }

        if (username.includes('@')) {
          event.preventDefault(); // Prevent form submission
          errorMessage.textContent = "Username cannot contain '@' symbol";
          errorMessage.style.display = 'block';
          return;
        }
      } else if (formType === 'reset') {
        password = document.getElementById('password').value.trim();
        confirmPassword = document.getElementById('confirmPassword').value.trim();
        
        if (!password || !confirmPassword) {
          event.preventDefault(); // Prevent form submission
          errorMessage.textContent = "Please enter all fields";
          errorMessage.style.display = 'block';
          return;
        }
      }
  
      if (password !== confirmPassword) {
        event.preventDefault(); // Prevent form submission
        errorMessage.textContent = "Passwords do not match";
        errorMessage.style.display = 'block';
        return;
      }
  
      if (password.length < 8) {
        event.preventDefault(); // Prevent form submission
        errorMessage.textContent = "Password must be at least 8 characters";
        errorMessage.style.display = 'block';
        return;
      }
  
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(password)) {
        event.preventDefault(); // Prevent form submission
        errorMessage.textContent = "Password must contain at least one uppercase letter, one lowercase letter, one special character, and one number";
        errorMessage.style.display = 'block';
        return;
      }
  
      errorMessage.style.display = 'none';
    }
  
    if (registerForm) {
      registerForm.addEventListener('submit', function (event) {
        validateForm(event, 'register');
      });
    }
  
    if (resetForm) {
      resetForm.addEventListener('submit', function (event) {
        validateForm(event, 'reset');
      });
    }
  });
  