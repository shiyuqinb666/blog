/* ============================================================
 * 站点逻辑：主题、数据渲染、图标链接、滚动动画
 * ============================================================ */
(function () {
  "use strict";

  const SITE = window.SITE || {};
  const P = window.PROJECT || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  /* ---------------- 主题 ---------------- */
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(saved || (prefersLight ? "light" : "dark"));

  function setTheme(t) {
    root.setAttribute("data-theme", t);
    const m = $('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "light" ? "#f7f8fb" : "#0b0d12");
    try { localStorage.setItem("theme", t); } catch (e) {}
  }
  $("#themeBtn").addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
  });

  /* ---------------- 站点信息 ---------------- */
  const ghUser = (SITE.github || "").trim();
  const repoBase = ghUser ? `https://github.com/${ghUser}${SITE.repo ? "/" + SITE.repo : ""}` : "";

  if (SITE.name) {
    $("#brandName").textContent = SITE.name;
    $("#footName").textContent = SITE.name;
    document.title = `${P.name || "作品集"} · ${SITE.name}`;
  }
  if (SITE.role) $("#heroRole").textContent = SITE.role;
  if (SITE.tagline) $("#heroTagline").textContent = SITE.tagline;

  // GitHub / 下载 / Issue / 邮件：有配置才显示，避免死链
  function wire(id, href, text) {
    const el = $("#" + id);
    if (!el) return;
    if (!href) { el.hidden = true; return; }
    el.href = href;
    if (text) el.textContent = text;
    el.hidden = false;
  }
  wire("ghBtn", repoBase);
  wire("ghBtn2", ghUser ? `https://github.com/${ghUser}` : "");
  wire("repoBtn", repoBase);
  wire("dlBtn", repoBase ? repoBase + "/releases" : "");
  wire("issueBtn", repoBase ? repoBase + "/issues" : "");
  wire("mailBtn", SITE.email ? "mailto:" + SITE.email : "");

  /* ---------------- Hero 统计 ---------------- */
  const stats = [
    [P.facts && P.facts[1] ? P.facts[1][1] : "200 KB", "安装包"],
    ["25", "内容分类"],
    ["0", "第三方依赖"],
    ["API 21+", "最低系统"]
  ];
  $("#heroStats").innerHTML = stats
    .map(([v, l]) => `<li><b>${esc(v)}</b><span>${esc(l)}</span></li>`).join("");

  /* ---------------- 项目主体 ---------------- */
  $("#pEmoji").textContent = P.emoji || "◆";
  $("#pName").textContent = P.name || "";
  $("#pEn").textContent = P.en || "";
  $("#pTagline").textContent = P.tagline || "";
  $("#pDesc").textContent = P.desc || "";

  $("#pFacts").innerHTML = (P.facts || [])
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");

  /* ---------------- 功能 ---------------- */
  $("#featGrid").innerHTML = (P.features || []).map((f) => `
    <section class="feat reveal">
      <h3><span class="feat-ico" aria-hidden="true">${esc(f.icon || "•")}</span>${esc(f.title)}</h3>
      <ul>${(f.items || []).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </section>`).join("");

  /* ---------------- 技术表 ---------------- */
  $("#techTable").innerHTML = (P.tech || [])
    .map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");

  /* ---------------- 自研组件 ---------------- */
  $("#modGrid").innerHTML = (P.modules || []).map((m) => `
    <article class="mod reveal">
      <h4>${esc(m.name)}</h4>
      <p class="mod-sub">${esc(m.sub || "")}</p>
      <ul>${(m.points || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
    </article>`).join("");

  /* ---------------- 版本存档 ---------------- */
  $("#buildList").innerHTML = (P.builds || []).map((b) => `
    <li${b.current ? ' class="now"' : ""}>
      <b>v${esc(b.v)}${b.current ? ' <span class="pill">当前</span>' : ""}</b>
      <span>${esc(b.note || "")}</span>
    </li>`).join("");

  /* ---------------- 关于 ---------------- */
  $("#bioBox").innerHTML = (SITE.bio || []).map((t) => `<p>${esc(t)}</p>`).join("");
  $("#focusBox").innerHTML = (SITE.focus || []).map((t) => `<li>${esc(t)}</li>`).join("");

  $("#year").textContent = new Date().getFullYear();

  /* ---------------- 滚动动画 ---------------- */
  let io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -60px 0px" });
  }
  const reveals = $$(".reveal");
  reveals.forEach((el, i) => {
    el.style.transitionDelay = Math.min(i * 45, 260) + "ms";
    if (io) io.observe(el); else el.classList.add("in");
  });

  /* ---------------- 导航吸顶 ---------------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
