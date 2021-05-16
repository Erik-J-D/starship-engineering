const letters = "abcdefghijklmnopqrstuvwxyz";

function getVariableOptions(n) {
  l = letters.substring(0, n).split("");
  for (let i = 0; i < n; i++) {
    if (Math.random() > 0.5) {
      l[i] = `not(${l[i]})`;
    }
  }

  // shuffle
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }

  return l;
}

function i12tEqJen(numInputs) {
  allTerms = [];

  // Do simplifyable terms
  basicTerm = [];
  terms = getVariableOptions(numInputs);
  for (let i = 0; i < numInputs / 2; i++) {
    basicTerm.push(terms.pop());
  }
  allTerms.push(makeAnd(basicTerm));
  //make a term that is a subset of the above
  basicTerm.push(terms.pop());
  allTerms.push(makeAnd(basicTerm));

  // Do a random number of random terms
  numNewTerms = Math.floor(Math.random() * 5) + 2;
  for (let i = 0; i < numNewTerms; i++) {
    term = [];
    terms = getVariableOptions(numInputs);
    numVarsInTerm = Math.min(
      Math.floor(Math.random() * numInputs) + 2,
      numInputs
    );
    for (j = 0; j < numVarsInTerm; j++) {
      term.push(terms.pop());
    }
    allTerms.push(makeAnd(term));
  }

  exp = makeOr(allTerms);
  console.log(exp);
  return math.parse(exp);
}

function makeOr(terms) {
  if (terms.length === 2) {
    return `or(${terms[0]}, ${terms[1]})`;
  } else {
    return `or(${terms[0]}, ${makeOr(terms.slice(1))})`;
  }
}

function makeAnd(terms) {
  if (terms.length === 2) {
    return `and(${terms[0]}, ${terms[1]})`;
  } else {
    return `and(${terms[0]}, ${makeAnd(terms.slice(1))})`;
  }
}
