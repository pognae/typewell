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
    centerCaret();

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

  // --- 타자기 모드: 현재 입력 줄을 화면 세로 중앙에 고정 ---
  let caretMirror = null;

  function getCaretTop() {
    if (!caretMirror) {
      caretMirror = document.createElement("div");
      caretMirror.setAttribute("aria-hidden", "true");
      document.body.appendChild(caretMirror);
    }
    const style = getComputedStyle(editor);
    const mirror = caretMirror;
    mirror.style.position = "absolute";
    mirror.style.top = "0";
    mirror.style.left = "-9999px";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.overflowWrap = "break-word";
    mirror.style.boxSizing = "border-box";
    mirror.style.width = editor.clientWidth + "px";
    const copy = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "lineHeight",
      "letterSpacing",
      "wordSpacing",
      "textTransform",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
    ];
    copy.forEach(function (p) {
      mirror.style[p] = style[p];
    });

    const pos = editor.selectionStart;
    mirror.textContent = editor.value.slice(0, pos);
    const marker = document.createElement("span");
    marker.textContent = "\u200b";
    mirror.appendChild(marker);
    return marker.offsetTop;
  }

  function centerCaret() {
    const caretTop = getCaretTop();
    const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 0;
    editor.scrollTop = caretTop - editor.clientHeight / 2 + lineHeight / 2;
  }

  // --- 시작 시 전체 화면 (브라우저 정책상 첫 상호작용에서 진입) ---
  let fullscreenTried = false;
  function enterFullscreen() {
    if (fullscreenTried) return;
    fullscreenTried = true;
    const el = document.documentElement;
    const req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.msRequestFullscreen;
    if (req) {
      try {
        const r = req.call(el);
        if (r && typeof r.catch === "function") r.catch(function () {});
      } catch (e) {
        // 사용자가 거부했거나 미지원이어도 에디터는 정상 동작
      }
    }
    window.removeEventListener("pointerdown", enterFullscreen);
    window.removeEventListener("keydown", enterFullscreen);
  }

  // --- 마우스를 움직이면 상단 메뉴 표시 ---
  let mouseTimer = null;
  function onMouseMove() {
    document.body.classList.add("mouse-active");
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(function () {
      document.body.classList.remove("mouse-active");
    }, 2000);
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
  editor.addEventListener("keyup", centerCaret);
  editor.addEventListener("click", centerCaret);
  exportBtn.addEventListener("click", exportMarkdown);

  // 마우스 움직이면 상단 메뉴 표시
  window.addEventListener("mousemove", onMouseMove);

  // 첫 상호작용 때 전체 화면으로 진입
  window.addEventListener("pointerdown", enterFullscreen);
  window.addEventListener("keydown", enterFullscreen);

  // 창 크기가 바뀌어도 현재 줄을 중앙에 유지
  window.addEventListener("resize", centerCaret);

  // 페이지를 떠나기 전 마지막 저장 보장
  window.addEventListener("beforeunload", saveContent);

  // 로드 후 바로 입력 가능하도록 포커스 + 현재 줄 중앙 정렬
  editor.focus();
  centerCaret();
})();
