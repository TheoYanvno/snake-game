import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ANIMALS, animalFor, nextPair, VERSES, superBook } from '../src/theme.js';

test('the line starts with doves, then cycles through the animals', () => {
  assert.equal(animalFor(1), '🕊️');
  assert.equal(animalFor(2), '🕊️');
  assert.equal(animalFor(3), ANIMALS[0]);
  assert.equal(animalFor(3 + ANIMALS.length), ANIMALS[0]);
  assert.equal(nextPair(3), animalFor(3));
});

test('every verse names its chapter and links to it in SuperBook', () => {
  for (const v of Object.values(VERSES)) {
    assert.match(v.ref, new RegExp(`^${v.book} ${v.chapter}:\\d+$`));
    assert.ok(v.text.length > 40);
  }
  assert.equal(superBook(VERSES.gathered), 'https://theoyanvno.github.io/SuperBook/?book=Genesis&chapter=7');
});
