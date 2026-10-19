'use strict';
const installButton = document.getElementById('install-app');
const installHelp = document.getElementById('install-help');
const offlineStatus = document.getElementById('offline-status');
let installPrompt = null;
function updateInstallHelp() {
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
    installHelp.hidden = true;
    installButton.hidden = true;
  }
}
updateInstallHelp();
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  const prompt = installPrompt;
  installPrompt = null;
  installButton.hidden = true;
  try {
    await prompt.prompt();
    await prompt.userChoice;
  } catch (error) {
    installHelp.textContent = '브라우저 메뉴의 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 이용해 주세요.';
  }
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installButton.hidden = true;
  installHelp.hidden = true;
});
if (location.protocol === 'file:' || !window.isSecureContext) {
  installHelp.textContent = '휴대폰에 설치하려면 HTTPS 주소로 접속해 주세요. 파일을 직접 연 상태에서는 설치할 수 없습니다.';
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').then(() => navigator.serviceWorker.ready).then(() => {
    offlineStatus.textContent = '오프라인 사용 준비 완료 · 인터넷 없이도 메모를 사용할 수 있습니다.';
  }).catch(() => {
    offlineStatus.textContent = '오프라인 준비에 실패했습니다. 인터넷 연결을 확인하고 다시 열어주세요.';
  });
} else {
  offlineStatus.textContent = '이 브라우저에서는 오프라인 실행을 지원하지 않습니다.';
}
