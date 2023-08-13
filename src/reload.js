// @ts-ignore
if (!window.IS_PRODUCTION) {
    const src = new EventSource('/esbuild');
    src.addEventListener('change', () => location.reload());
}
