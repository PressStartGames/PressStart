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

// Sent when an ALREADY-CONFIRMED address signs up again. The web response is the same
// as a new sign-up (so it can never reveal whether an address is on the list — no
// enumeration); only the inbox owner learns they are already subscribed.
export function alreadySubscribedMail(links: { unsubscribe: string }) {
  const subject = "You're already on the Press Start beta list";
  const text = [
    'Good news — your address is already confirmed for the Press Start beta, so there is',
    "nothing more to do. We'll be in touch when it's ready.",
    '',
    `Leave the list and delete your address at any time: ${links.unsubscribe}`,
  ].join('\n');
  const html = `<!doctype html><html lang="en"><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#15171c">
<p>Good news — your address is already confirmed for the <strong>Press Start</strong> beta, so there is nothing more to do. We'll be in touch when it's ready.</p>
<p style="color:#5d6470;font-size:14px"><a href="${links.unsubscribe}" style="color:#5d6470">Leave the list and delete my address</a></p>
</body></html>`;
  return { subject, text, html };
}
