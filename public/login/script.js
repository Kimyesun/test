// API 엔드포인트 (배포 후 실제 도메인으로 변경)
const API_BASE_URL = window.location.origin;

// DOM 요소
const loginForm = document.getElementById('loginForm');
const userIdInput = document.getElementById('userId');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const rememberMeCheckbox = document.getElementById('rememberMe');
const submitBtn = document.getElementById('submitBtn');

// ===== 비밀번호 표시/숨김 =====
togglePasswordBtn?.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  togglePasswordBtn.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

// ===== 저장된 아이디 불러오기 =====
window.addEventListener('load', () => {
  const savedUserId = localStorage.getItem('rememberedUserId');
  if (savedUserId) {
    userIdInput.value = savedUserId;
    rememberMeCheckbox.checked = true;
  }
});

// ===== 로그인 폼 제출 =====
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userId = userIdInput.value.trim();
  const password = passwordInput.value;
  const rememberMe = rememberMeCheckbox.checked;
  
  // 유효성 검사
  if (!userId || !password) {
    showNotification('아이디와 비밀번호를 입력해주세요.', 'error');
    return;
  }
  
  // 로딩 상태
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 로그인 중...';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // 토큰 저장
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // 아이디 저장 (로그인 상태 유지)
      if (rememberMe) {
        localStorage.setItem('rememberedUserId', userId);
      } else {
        localStorage.removeItem('rememberedUserId');
      }
      
      showNotification('로그인 성공! 환영합니다. 🎉', 'success');
      
      // 메인 페이지로 리다이렉트
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } else {
      showNotification(data.error || '로그인에 실패했습니다.', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('서버와의 연결에 실패했습니다.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인';
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

console.log('🎓 로그인 페이지가 로드되었습니다!');
