export default function compareStringArray(arr1: string[], arr2: string[]) {
  let copy1 = [...arr1];
  let copy2 = [...arr2];
  copy1.sort();
  copy2.sort();

  return (
    copy1.length == copy2.length &&
    copy1.every(function (element, index) {
      return element === copy2[index];
    })
  );
}
