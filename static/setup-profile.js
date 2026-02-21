document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('setup-form');
  const avatarInput = document.getElementById('avatar');
  const avatarPreview = document.getElementById('avatarPreview');
  const usernameInput = document.getElementById('username');
  const submitBtn = document.getElementById('submitBtn');

  // Avatar preview
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Сохранение...';

    const formData = new FormData();
    formData.append('username', usernameInput.value.trim());

    if (avatarInput.files[0]) {
      formData.append('avatar', avatarInput.files[0]);
    }

    try {
      const res = await fetch('/auth/setup-profile', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to save profile');

      // Redirect to feed or home
      window.location.href = '/feed';

    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения профиля');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-icons-outlined">check_circle</span> Продолжить';
    }
  });
});

