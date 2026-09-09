import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createTranslator, createFormatters, readPreferences, russian } from './i18n.ts';
import { presets } from './simulator.ts';

test('Russian catalog retains all dynamic values and translates the scenarios', () => {
  for (const [english, russianText] of Object.entries(russian)) {
    assert.ok(russianText.length > 0);
    assert.deepEqual(english.match(/\{\w+\}/g), russianText.match(/\{\w+\}/g), english);
  }
  for (const preset of Object.values(presets)) {
    assert.ok(russian[preset.label]);
    assert.ok(russian[preset.note]);
  }
  assert.equal(createTranslator('ru')('{amount} STANDARD accrued per surviving branch.', { amount: '12 тыс.' }), 'На каждое оставшееся отделение начислено 12 тыс. STANDARD.');
  assert.equal(createTranslator('en')('Day'), 'Day');
});

test('every literal translation call has a Russian entry; visible text has no untranslated sentences', () => {
  const source = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  const component = readFileSync(new URL('../components/position-explorer.tsx', import.meta.url), 'utf8');
  const ast = ts.createSourceFile('page.tsx', source+'\n'+component, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const allowed = new Set(['STANDARD RESERVE', 'STANDARD', '1 STANDARD =', 'STD', 'EN', 'RU', 'by @intelpocik']);
  let calls = 0;
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 't' && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
      const key = node.arguments[0].text;
      assert.ok(Object.hasOwn(russian, key), `Missing translation: ${key}`);
      calls++;
    }
    if (ts.isJsxText(node) && /[a-z]/i.test(node.text)) assert.ok(allowed.has(node.text.trim()), `Untranslated JSX text: ${node.text}`);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(calls > 100);
  assert.ok(source.includes("required:['scenario','day']"), 'Machine schema must not be translated');
});

test('numbers adapt to the selected language', () => {
  assert.equal(createFormatters('ru').decimal(1.25), '1,25');
  assert.equal(createFormatters('en').decimal(1.25), '1.25');
  assert.match(createFormatters('ru').compact(1000000), /млн/);
  assert.match(createFormatters('ru').pct(.125), /12,5/);
});

test('valid device preferences survive loading; unknown or blocked values are safe', () => {
  const valid = { getItem: (key: string) => key === 'sr-language' ? 'ru' : 'dark' };
  assert.deepEqual(readPreferences(valid), { language: 'ru', theme: 'dark' });
  assert.deepEqual(readPreferences({ getItem: () => 'invalid' }), { language: 'en', theme: 'light' });
  assert.deepEqual(readPreferences({ getItem: () => null }, true), { language: 'en', theme: 'dark' });
  assert.deepEqual(readPreferences({ getItem: () => { throw new Error('blocked'); } }), { language: 'en', theme: 'light' });
});
