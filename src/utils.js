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
    
  }
}
