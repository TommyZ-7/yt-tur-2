function formatNumberWithSlashes(input: number | string): string {
  const str = String(input).padStart(8, "0"); // 文字列に変換し、8桁未満の場合は先頭を0で埋める

  // 入力が8桁の数字であることを確認
  if (!/^\d{8}$/.test(str)) {
    // 8桁でない場合は、エラーを投げるか、元の文字列をそのまま返すなどの処理
    throw new Error("入力は8桁の数字である必要があります。");
    // または return String(input);
  }

  const year = str.slice(0, 4); // 最初の4文字 (0番目から4文字目まで)
  const month = str.slice(4, 6); // 次の2文字 (4番目から6文字目まで)
  const day = str.slice(6, 8); // 最後の2文字 (6番目から8文字目まで)

  return `${year}/${month}/${day}`;
}

export { formatNumberWithSlashes };
