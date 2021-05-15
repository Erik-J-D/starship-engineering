function gray(n) {
  if (n === 1) {
    return ["0", "1"];
  } else {
    var code = gray(n - 1);
    var rev = [...code].reverse();
    var old0 = code.map((x) => "0" + x);
    var new1 = rev.map((x) => "1" + x);
    return old0.concat(new1);
  }
}
