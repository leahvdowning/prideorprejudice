/*
  The letter to TDs. Plain text. Edit the wording here.
  {constituency}, {place} and {name} are filled in from the form.
  The figures in "figure" come from data/facts.js (emergency.now). If you update
  one, update the other.
*/
window.POP_LETTER = {
  subject: "Please act on housing and public services",

  greetingOne: "Dear Deputy {td},",
  greetingMany: "Dear Deputies,",

  introWithPlace: "I live in {place} and I am one of your constituents in {constituency}.",
  introNoPlace: "I am one of your constituents in {constituency}.",

  figure: "In September 2026, 18,065 people were living in emergency accommodation in Ireland. 5,897 of them were children. A year earlier the total was 16,614. These are the Department of Housing's own figures.",

  why: "When homes, healthcare and local services are this stretched, people look for someone to blame. The blame often lands on migrants and minority communities, who did not cause the shortage. In hundreds of public comments about the phrase \"Ireland is full\", people on both sides of the argument kept coming back to housing and public services.",

  asksIntro: "I am asking you to:",

  asks: [
    { id: "capacity", label: "More homes and healthcare, with dates",
      text: "Add housing and healthcare capacity now, with dates and numbers people can check." },
    { id: "spaces", label: "Protect community and arts spaces",
      text: "Protect the community and arts spaces that give people somewhere to meet." },
    { id: "trust", label: "Report plainly on what is delivered",
      text: "Report plainly on what has been delivered, so that people can trust what they are told." },
    { id: "scapegoat", label: "Speak up against scapegoating",
      text: "Say clearly, and keep saying, that migrants are not the cause of these shortages." }
  ],

  close: "Please let me know what you have done on these in the past year.",
  signoff: "Yours sincerely,",
  namePlaceholder: "[Your name]",
  placePlaceholder: "[Your address or Eircode]"
};
