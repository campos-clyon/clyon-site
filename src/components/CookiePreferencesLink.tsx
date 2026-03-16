"use client";

export default function CookiePreferencesLink() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("clyon-open-cookie-preferences"));
      }}
      className="text-sm text-cyan-50/68 transition-colors hover:text-white"
    >
      Gerir cookies
    </button>
  );
}
