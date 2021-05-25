import App from './App.svelte';

window.addEventListener('contextmenu', LockEvent);
window.addEventListener('selectstart', LockEvent);

function LockEvent(event) {
    event.preventDefault();
}

const app = new App({
    target: document.body,
    props: {}
});

export default app;
