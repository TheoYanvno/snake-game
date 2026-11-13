// The Noah's ark theme: the ark leads a line of animals, and each pair you gather joins it. The story is
// Genesis 6 to 9; verses are from the World English Bible (public domain), as SuperBook shows them.
// This file has no browser code, so the tests can check it.

export const ANIMALS = ['🐑', '🐄', '🐘', '🦁', '🐪', '🦒', '🐎', '🐖', '🐓', '🐇', '🦓', '🐐', '🦘', '🐿️', '🐢', '🦌'];

/** The animal for the nth body segment (the start of the line is a pair of doves). */
export function animalFor(index) {
  return index <= 2 ? '🕊️' : ANIMALS[(index - 3) % ANIMALS.length];
}

/** The pair waiting to be gathered: the next animal to join the line. */
export const nextPair = (length) => animalFor(length);

export const VERSES = {
  start: { ref: 'Genesis 6:19', book: 'Genesis', chapter: 6,
    text: 'Of every living thing of all flesh, you shall bring two of every sort into the ship, to keep them alive with you. They shall be male and female.' },
  gathered: { ref: 'Genesis 7:9', book: 'Genesis', chapter: 7,
    text: 'went by pairs to Noah into the ship, male and female, as God commanded Noah.' },
  over: { ref: 'Genesis 8:1', book: 'Genesis', chapter: 8,
    text: 'God remembered Noah, all the animals, and all the livestock that were with him in the ship; and God made a wind to pass over the earth. The waters subsided.' },
  win: { ref: 'Genesis 9:13', book: 'Genesis', chapter: 9,
    text: 'I set my rainbow in the cloud, and it will be a sign of a covenant between me and the earth.' },
};

/** SuperBook's reader at that chapter (SuperBook is the reference for every Bible project here). */
export const superBook = ({ book, chapter }) =>
  `https://theoyanvno.github.io/SuperBook/?book=${encodeURIComponent(book)}&chapter=${chapter}`;
