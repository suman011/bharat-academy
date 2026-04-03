import phoneCountries from "./phoneCountries.json";

/** @typedef {{ iso2: string; dial: string; name: string }} PhoneCountry */

/** All territories with a calling code (sorted by name). */
export const PHONE_COUNTRIES = phoneCountries;

/** @deprecated prefer PHONE_COUNTRIES */
export const COUNTRY_CALLING_CODES = PHONE_COUNTRIES;

export function toPhoneCountryKey(/** @type {PhoneCountry} */ c) {
  return `${c.iso2}|${c.dial}`;
}

export function parsePhoneCountryKey(key) {
  const s = String(key || "");
  const i = s.indexOf("|");
  if (i < 1) return { iso2: "IN", dial: "+91" };
  return { iso2: s.slice(0, i), dial: s.slice(i + 1) };
}

export function dialFromPhoneCountryKey(key) {
  return parsePhoneCountryKey(key).dial;
}

/** UI label: `IN +91 · India` */
export function formatPhoneCountryOption(/** @type {PhoneCountry} */ c) {
  return `${c.iso2} ${c.dial} · ${c.name}`;
}

const _india = PHONE_COUNTRIES.find((c) => c.iso2 === "IN" && c.dial === "+91");
export const DEFAULT_PHONE_COUNTRY_KEY = _india ? toPhoneCountryKey(_india) : toPhoneCountryKey(PHONE_COUNTRIES[0]);

/** @deprecated use DEFAULT_PHONE_COUNTRY_KEY + dialFromPhoneCountryKey */
export const DEFAULT_PHONE_COUNTRY_DIAL = "+91";
