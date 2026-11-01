// The double opt-in mail. Plain words, one link to confirm, one to leave.
export function confirmationMail(links: { confirm: string; unsubscribe: string }) {
  const subject = 'Confirm your Press Start beta sign-up';
  const text = [
    'You asked to join the Press Start beta.',
    '',
    `Confirm your address: ${links.confirm}`,
    '',
    'If this was not you, ignore this mail: nothing is sent until you confirm, and the address is',
    'deleted 30 days after version 1 ships if it is never confirmed.',
    '',
    `Leave the list and delete your address at any time: ${links.unsubscribe}`,
  ].join('\n');
  const html = `<!doctype html><html lang="en"><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#15171c">
<p>You asked to join the <strong>Press Start</strong> beta.</p>
<p><a href="${links.confirm}" style="display:inline-block;padding:12px 20px;background:#2f5bff;color:#fff;border-radius:999px;text-decoration:none">Confirm my address</a></p>
<p style="color:#5d6470;font-size:14px">If this was not you, ignore this mail: nothing is sent until you confirm, and the address is deleted 30 days after version 1 ships if it is never confirmed.</p>
<p style="color:#5d6470;font-size:14px"><a href="${links.unsubscribe}" style="color:#5d6470">Leave the list and delete my address</a></p>
</body></html>`;
  return { subject, text, html };
}
