// API 엔드포인트 (배포 후 실제 도메인으로 변경)
const API_BASE_URL = window.location.origin;

// DOM 요소
const signupForm = document.getElementById('signupForm');
const userIdInput = document.getElementById('userId');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const passwordStrength = document.getElementById('passwordStrength');
const submitBtn = document.getElementById('submitBtn');

// ===== 비밀번호 표시/숨김 =====
togglePasswordBtn?.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  togglePasswordBtn.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

toggleConfirmPasswordBtn?.addEventListener('click', () => {
  const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
  confirmPasswordInput.type = type;
  toggleConfirmPasswordBtn.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

// ===== 비밀번호 강도 체크 =====
passwordInput?.addEventListener('input', () => {
  const password = passwordInput.value;
  const strength = checkPasswordStrength(password);
  
  const fill = passwordStrength.querySelector('.strength-fill');
  const text = passwordStrength.querySelector('.strength-text');
  
  // 강도에 따라 스타일 변경
  passwordStrength.className = 'password-strength';
  if (strength.score === 0) {
    fill.style.width = '0%';
    text.textContent = '';
  } else if (strength.score === 1) {
    fill.style.width = '33%';
    text.textContent = '약함';
    passwordStrength.classList.add('weak');
  } else if (strength.score === 2) {
    fill.style.width = '66%';
    text.textContent = '보통';
    passwordStrength.classList.add('medium');
  } else {
    fill.style.width = '100%';
    text.textContent = '강함';
    passwordStrength.classList.add('strong');
  }
});

// 비밀번호 강도 체크 함수
function checkPasswordStrength(password) {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++; // 특수문자
  
  return { score: Math.min(score, 3) };
}

// ===== 회원가입 폼 제출 =====
signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userId = userIdInput.value.trim();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  
  // 유효성 검사
  if (password !== confirmPassword) {
    showNotification('비밀번호가 일치하지 않습니다.', 'error');
    return;
  }
  
  // 아이디 유효성 검사
  const userIdRegex = /^[a-z0-9_]{4,20}$/;
  if (!userIdRegex.test(userId)) {
    showNotification('아이디는 4-20자의 영문 소문자, 숫자, 언더스코어(_)만 사용 가능합니다.', 'error');
    return;
  }
  
  if (username.length < 2 || username.length > 20) {
    showNotification('사용자명은 2자 이상 20자 이하여야 합니다.', 'error');
    return;
  }
  
  const strength = checkPasswordStrength(password);
  if (strength.score < 2) {
    showNotification('더 강한 비밀번호를 사용해주세요.', 'error');
    return;
  }
  
  // 로딩 상태
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 가입 중...';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // 토큰 저장
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showNotification('회원가입이 완료되었습니다! 🎉', 'success');
      
      // 메인 페이지로 리다이렉트
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } else {
      showNotification(data.error || '회원가입에 실패했습니다.', 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showNotification('서버와의 연결에 실패했습니다.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> 회원가입';
  }
});

// ===== 소셜 로그인 (임시) =====
document.querySelectorAll('.btn-social').forEach(btn => {
  btn.addEventListener('click', () => {
    showNotification('소셜 로그인 기능은 준비 중입니다.', 'info');
  });
});

// ===== 알림 메시지 표시 =====
function showNotification(message, type = 'info') {
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#00b894' : type === 'error' ? '#d63031' : '#6c5ce7'};
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 15px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
  `;
  
  document.body.appendChild(notification);
  
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  `;
  
  closeBtn.addEventListener('click', () => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  });
  
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// 애니메이션 키프레임
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

console.log('🎓 회원가입 페이지가 로드되었습니다!');
