/**
 * Proteção básica contra inspeção casual (F12 / botão direito).
 *
 * Importante: isso NÃO impede alguém determinado de ver o código do front
 * (todo site React envia JS ao navegador). O que realmente protege segredos
 * é manter chaves (Gemini, etc.) só no servidor (pasta api/), como já fazemos.
 *
 * Serve como barreira educativa / apresentação para a professora.
 */
export function enableDevtoolsGuard() {
  if (typeof window === "undefined") return;

  // Desativa menu de contexto (botão direito)
  const onContext = (e: MouseEvent) => {
    e.preventDefault();
  };
  document.addEventListener("contextmenu", onContext);

  // Bloqueia atalhos comuns de DevTools
  const onKey = (e: KeyboardEvent) => {
    const key = e.key?.toLowerCase?.() || "";
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    if (
      key === "f12" ||
      (ctrl && shift && (key === "i" || key === "j" || key === "c")) ||
      (ctrl && key === "u") // ver código-fonte
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  document.addEventListener("keydown", onKey, true);

  // Detecta abertura do DevTools por diferença de tamanho da janela (heurística)
  let warned = false;
  const check = () => {
    const threshold = 160;
    const open =
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold;
    if (open && !warned) {
      warned = true;
      console.clear();
      console.log(
        "%cPlantID",
        "color:#16a34a;font-size:18px;font-weight:bold;"
      );
      console.log(
        "Ferramentas de desenvolvedor detectadas. O código do app é protegido por direitos autorais do projeto TCC."
      );
    }
    if (!open) warned = false;
  };
  const interval = window.setInterval(check, 1200);

  return () => {
    document.removeEventListener("contextmenu", onContext);
    document.removeEventListener("keydown", onKey, true);
    window.clearInterval(interval);
  };
}
