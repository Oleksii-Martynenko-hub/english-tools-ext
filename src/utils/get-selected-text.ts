export function getSelectedText() {
  if (window.getSelection) {
    // all browsers, except IE before version 9
    var range = window.getSelection();
    return range?.toString() || "";
  }
  return "";
}
