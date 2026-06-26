(function () {
  "use strict";

  const STORAGE_KEY = "typewell:content";
  const editor = document.getElementById("editor");
  const statusEl = document.getElementById("status");
  const countsEl = document.getElementById("counts");
  const exportBtn = document.getElementById("exportBtn");

  // --- 자동 저장 (localStorage) ---
  let saveTimer = null;
  let writingTimer = null;

  function loadContent() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) editor.value = saved;
    } catch (e) {
      // localStorage 비활성(시크릿 모드 등)이어도 에디터는 동작
    }
  }

  function saveContent() {
    try {
      localStorage.setItem(STORAGE_KEY, editor.value);
      setStatus("저장됨");
    } catch (e) {
      setStatus("저장 불가");
    }
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function updateCounts() {
    const text = editor.value;
    const chars = text.length;
    const words = (text.trim().match(/\S+/g) || []).length;
    countsEl.textContent = `${words.toLocaleString()} 단어 · ${chars.toLocaleString()} 글자`;
  }

  function onInput() {
    setStatus("작성 중…");
    updateCounts();

    // 입력 후 일정 시간 멈추면 저장
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveContent, 600);

    // 입력 중에는 툴바를 흐리게
    document.body.classList.add("writing");
    clearTimeout(writingTimer);
    writingTimer = setTimeout(function () {
      document.body.classList.remove("writing");
    }, 1500);
  }

  // --- 마크다운 내보내기 ---
  function buildFilename() {
    const text = editor.value.trim();
    // 첫 번째 비어 있지 않은 줄을 파일명 후보로 사용
    let title = "";
    const firstLine = (text.split("\n").find((l) => l.trim()) || "").trim();
    if (firstLine) {
      title = firstLine
        .replace(/^#+\s*/, "") // 마크다운 제목 기호 제거
        .replace(/[\\/:*?"<>|]/g, "") // 파일명에 못 쓰는 문자 제거
        .slice(0, 50)
        .trim();
    }
    if (!title) {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      title = `typewell-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
        d.getDate()
      )}-${pad(d.getHours())}${pad(d.getMinutes())}`;
    }
    return title + ".md";
  }

  function exportMarkdown() {
    const content = editor.value;
    if (!content.trim()) {
      setStatus("내보낼 내용이 없어요");
      setTimeout(() => saveContent(), 1200);
      return;
    }
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus("내보냄");
    setTimeout(() => setStatus("저장됨"), 1500);
  }

  // --- 단축키 ---
  function onKeydown(e) {
    const mod = e.ctrlKey || e.metaKey;

    // Ctrl/Cmd + S : 내보내기
    if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      exportMarkdown();
      return;
    }

    // Tab : 들여쓰기 (포커스 이동 대신 공백 삽입)
    if (e.key === "Tab") {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const indent = "  ";
      editor.value =
        editor.value.slice(0, start) + indent + editor.value.slice(end);
      editor.selectionStart = editor.selectionEnd = start + indent.length;
      onInput();
    }
  }

  // --- 초기화 ---
  loadContent();
  updateCounts();
  editor.addEventListener("input", onInput);
  editor.addEventListener("keydown", onKeydown);
  exportBtn.addEventListener("click", exportMarkdown);

  // 페이지를 떠나기 전 마지막 저장 보장
  window.addEventListener("beforeunload", saveContent);

  // 로드 후 바로 입력 가능하도록 포커스
  editor.focus();
})();
