document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.getElementById('specialButton');
  
    specialButton.addEventListener('mouseover', function () {
      const height = specialButton.offsetHeight;
      specialButton.style.borderRadius = `${height / 2}px`;
    });
  
    specialButton.addEventListener('mouseout', function () {
      specialButton.style.borderRadius = '4px'; // Reset to default radius
    });
  });
  