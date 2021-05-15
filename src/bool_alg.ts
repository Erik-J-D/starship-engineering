export function gray(n: number): Array<string> {
  if (n === 1) {
    return ["0", "1"];
  } else {
    var code = gray(n - 1);
    var rev = [...code].reverse();
    var old0 = code.map((x: string) => "0" + x);
    var new1 = rev.map((x: string) => "1" + x);
    return old0.concat(new1);
  }
}
