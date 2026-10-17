(() => {
  const form = document.getElementById('trip-inquiry-form');
  const button = document.getElementById('inquiry-submit');
  const status = document.getElementById('inquiry-status');
  let sending = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    if (location.protocol === 'file:') {
      status.textContent = 'This local preview cannot send inquiries. Please test the form on the published website.';
      status.focus();
      return;
    }
    sending = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    status.textContent = 'Sending your inquiry…';
    form.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) {
        throw new Error('Submission not confirmed');
      }
      form.reset();
      status.textContent = "Thanks for reaching out! Your inquiry was submitted. I'll personally reply within one business day. — Ryan, Land & See Travel";
    } catch (error) {
      status.textContent = error.name === 'AbortError'
        ? 'The request timed out, so we could not confirm receipt. Please email ryan@landseetravel.com if you do not hear back.'
        : 'We could not confirm that your inquiry was sent. Your entries are still here. Please try again or email ryan@landseetravel.com.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.textContent = 'Send My Trip Inquiry';
      form.removeAttribute('aria-busy');
      status.focus();
    }
  });
})();
