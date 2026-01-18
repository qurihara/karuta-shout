const fs = require('fs');

const INPUT_CSV = '小倉百人一首.csv';
const OUTPUT_CSV = '小倉百人一首v4.csv';

console.log(`'${INPUT_CSV}' を読み込んでいます...`);
const text = fs.readFileSync(INPUT_CSV, 'utf8');
const lines = text.split(/\r?\n/);

// ヘッダーとデータ行を分離
const header = lines[0];
const dataLines = lines.slice(1).filter(line => line); // 空行を除外

// 全ての下の句（よみがな）を抽出 (9列目)
const shimoYomiList = dataLines.map(line => {
  const values = line.split(',');
  return values[8] || '';
});

console.log('下の句の決まり字を計算しています...');
const shimoKimarijiList = [];

for (let i = 0; i < shimoYomiList.length; i++) {
  const currentYomi = shimoYomiList[i];
  if (!currentYomi) {
    shimoKimarijiList[i] = '';
    continue;
  }

  for (let len = 1; len <= currentYomi.length; len++) {
    const prefix = currentYomi.substring(0, len);
    
    const hasConflict = shimoYomiList.some((otherYomi, otherIndex) => {
      if (i === otherIndex) return false;
      return otherYomi.startsWith(prefix);
    });

    if (!hasConflict) {
      shimoKimarijiList[i] = prefix;
      break;
    }
  }
}
console.log('計算が完了しました。');

// 新しいCSVを生成
const outputLines = [];
const headerParts = header.split(',');
const newHeader = [headerParts[0], headerParts[1], '下の句の決まり字', ...headerParts.slice(2)].join(',');
outputLines.push(newHeader);

dataLines.forEach((line, index) => {
  const values = line.split(',');
  const shimoKimariji = shimoKimarijiList[index] || '';
  
  const newLine = [
    values[0],
    values[1],
    shimoKimariji,
    ...values.slice(2)
  ].join(',');
  outputLines.push(newLine);
});

console.log(`'${OUTPUT_CSV}' に書き込んでいます...`);
fs.writeFileSync(OUTPUT_CSV, outputLines.join('\n'), 'utf8');

console.log('新しいCSVファイルの生成が完了しました。');