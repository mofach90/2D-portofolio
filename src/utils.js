export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("text-dialogue");
  const dialogue = document.getElementById("dialogue");

  dialogueUI.style.display = "block";
  const index = 0;
  const currentText = "";
  const intervalRef = setInterval(() => {
    if (index < text.lenght) {
      currentText += text[index];
      dialogue.innerHTML = currentText;
      index++;
      return;
    }
    clearInterval(intervalRef);
  }, 5);
  const closeButton = document.getElementById("close");
  function onCloseBtnClick() {
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInternal(intervalRef);
    closeButton.removeEventListener("click", onCloseBtnClick);
  }
  closeButton.addEventListener("click", onCloseBtnClick);
}

export function setCamScale(k) {
  const resizeCam = k.width() / k.height();
  if ( resizeCam < 1) {
    k.camScale(k.vec2(1));
    return;
  }
  k.camScale(k.vec2(1.5))
}
