'use client';

// Scrolls back to the claim card and puts the cursor in the wallet box.
export default function ClaimJump({ children, className }) {
  return (
    <a
      href="#claim"
      className={className}
      onClick={(e) => {
        const card = document.getElementById('claim');
        const input = card?.querySelector('input');
        if (!card) return;
        e.preventDefault();
        card.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
        setTimeout(() => input?.focus({ preventScroll: true }), 500);
      }}
    >
      {children}
    </a>
  );
}
