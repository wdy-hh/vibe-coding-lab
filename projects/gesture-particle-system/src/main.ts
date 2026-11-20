import './styles/main.css';
import { App } from './app/App.ts';

try {
  const app = new App(document.querySelector<HTMLDivElement>('#app')!);
  import.meta.hot?.dispose(() => app.dispose());
} catch (error) {
  console.error('Application initialization failed:', error);
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = error instanceof Error ? error.message : '应用初始化失败，请使用新版 Chrome 或 Edge。';
  document.querySelector('#app')?.replaceChildren(message);
}
